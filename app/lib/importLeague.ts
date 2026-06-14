"use client";

import { batchWrite, saveDoc } from "./firestore";

type RawLeagueData = {
  teams?: any[];
  players?: any[];
  games?: any[];
  schedule?: any[];
  awards?: any[];
  draftPicks?: any[];
  playoffSeries?: any[];
  freeAgents?: any[];
  hallOfFame?: any[];
  history?: any[];
  gameAttributes?: any[];
  events?: any[];
  leagueName?: string;
  salaryCap?: number;
  luxuryTax?: number;
  seasonLength?: number;
  playoffTeams?: number;
  draftRounds?: number;
  tradeDeadline?: string;
};

function parseLeague(raw: RawLeagueData) {
  return {
    teams: raw.teams || [],
    players: raw.players || [],
    games: raw.games || [],
    schedule: raw.schedule || [],
    awards: raw.awards || [],
    draftPicks: raw.draftPicks || [],
    playoffs: raw.playoffSeries || [],
    freeAgents: raw.freeAgents || [],
    hallOfFame: raw.hallOfFame || [],
    history: raw.history || [],
    gameAttributes: raw.gameAttributes || [],
    events: raw.events || []
  };
}

type TeamRecord = Record<string, any>;

type PlayerRecord = Record<string, any>;

function buildTeamRecord(team: TeamRecord) {
  return {
    ...team,
    updatedAt: new Date().toISOString()
  };
}

function buildPlayerRecord(player: PlayerRecord) {
  const record: Record<string, any> = {
    pid: player.pid,
    firstName: player.firstName,
    lastName: player.lastName,
    age: player.age ?? null,
    position: player.pos,
    // Normalize height to [feet, inches]. Support strings like "6-8", numbers (inches), or arrays.
    height: (() => {
      const h = player.hgt;
      if (h == null) return [0, 0];
      if (Array.isArray(h)) return h.map((v) => Number(v) || 0);
      if (typeof h === "number") {
        const feet = Math.floor(h / 12);
        const inches = h % 12;
        return [feet, inches];
      }
      const s = String(h);
      if (s.includes("-")) {
        const parts = s.split("-").map((p) => Number(p) || 0);
        if (parts.length === 2) return parts;
      }
      const asNum = Number(s);
      if (!Number.isNaN(asNum)) return [Math.floor(asNum / 12), asNum % 12];
      return [0, 0];
    })(),
    weight: player.weight ?? null,
    bornYear: player.born?.year ?? null,
    ovr: player.ratings?.ovr ?? 0,
    pot: player.ratings?.pot ?? 0,
    ratings: player.ratings || {},
    stats: player.stats || [],
    awards: player.awards || [],
    contract: player.contract || {},
    injury: player.injury ?? null,
    teamId: player.tid ?? null,
    updatedAt: new Date().toISOString()
  };

  // Remove undefined values (Firestore rejects undefined fields)
  Object.keys(record).forEach((k) => {
    if (record[k] === undefined) delete record[k];
  });

  return record;
}

function buildGameRecord(game: Record<string, any>) {
  return {
    gid: game.gid,
    season: game.season,
    date: game.date,
    homeTid: game.homeTid,
    awayTid: game.awayTid,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    completed: game.completed || false,
    updatedAt: new Date().toISOString()
  };
}

function buildScheduleRecord(entry: Record<string, any>) {
  return {
    season: entry.season,
    gid: entry.gid,
    date: entry.date,
    homeTid: entry.homeTid,
    awayTid: entry.awayTid,
    status: entry.status || "scheduled",
    updatedAt: new Date().toISOString()
  };
}

function buildAwardRecord(award: Record<string, any>) {
  return { ...award, updatedAt: new Date().toISOString() };
}

function buildDraftPickRecord(pick: Record<string, any>) {
  return { ...pick, updatedAt: new Date().toISOString() };
}

function buildFreeAgentRecord(agent: Record<string, any>) {
  return { ...agent, updatedAt: new Date().toISOString() };
}

function buildHallOfFameRecord(entry: Record<string, any>) {
  return { ...entry, updatedAt: new Date().toISOString() };
}

function buildEventRecord(event: Record<string, any>, index: number) {
  return {
    id: `${event.type || event.name}-${event.season || "unknown"}-${index}`,
    type: event.type || event.name || "event",
    season: event.season || null,
    date: event.date || null,
    description: event.text || event.description || "",
    category: event.category || "Game",
    updatedAt: new Date().toISOString()
  };
}

function buildHistoryRecord(entry: Record<string, any>, index: number) {
  return {
    id: `${entry.season || "history"}-${index}`,
    season: entry.season || null,
    summary: entry.description || JSON.stringify(entry),
    updatedAt: new Date().toISOString()
  };
}

function buildPlayoffSeriesRecord(series: Record<string, any>, index: number) {
  return {
    ...series,
    updatedAt: new Date().toISOString()
  };
}

function buildGameAttributeRecord(attribute: Record<string, any>, index: number) {
  return {
    ...attribute,
    updatedAt: new Date().toISOString()
  };
}

function buildSettings(records: RawLeagueData) {
  return {
    leagueName: records.leagueName || "Basketball Managers League",
    salaryCap: records.salaryCap || null,
    luxuryTax: records.luxuryTax || null,
    seasonLength: records.seasonLength || null,
    playoffTeams: records.playoffTeams || null,
    draftRounds: records.draftRounds || null,
    tradeDeadline: records.tradeDeadline || null,
    gameAttributes: records.gameAttributes || [],
    updatedAt: new Date().toISOString()
  };
}

function buildBatchRecords(
  collectionName: string,
  items: any[],
  builder: (item: any, index: number) => any,
  keyFn?: (item: any, index: number) => string
) {
  return items.map((item, index) => ({
    collectionName,
    id: keyFn ? keyFn(item, index) : String(item.id ?? item.pid ?? index),
    data: builder(item, index)
  }));
}

async function importCollectionRecords(
  collectionName: string,
  items: any[],
  builder: (item: any, index: number) => any,
  keyFn?: (item: any, index: number) => string
) {
  if (!items || !items.length) return;
  const records = buildBatchRecords(collectionName, items, builder, keyFn);
  await batchWrite(records);
}

async function importLeagueData(rawData: RawLeagueData, mode: "full" | "update" = "full") {
  const parsed = parseLeague(rawData);

  if (mode === "full") {
    await Promise.all([
      importCollectionRecords("teams", parsed.teams, buildTeamRecord, (team) => String(team.tid)),
      importCollectionRecords("players", parsed.players, buildPlayerRecord, (player) => String(player.pid)),
      importCollectionRecords("games", parsed.games, buildGameRecord, (game) => `${game.season}-${game.gid}`),
      importCollectionRecords("schedule", parsed.schedule, buildScheduleRecord, (entry) => `${entry.season}-${entry.gid}`),
      importCollectionRecords("awards", parsed.awards, buildAwardRecord, (award) => `${award.season}-${award.type || award.name}`),
      importCollectionRecords("draftPicks", parsed.draftPicks, buildDraftPickRecord, (pick) => `${pick.season}-${pick.round}-${pick.pick}`),
      importCollectionRecords("freeAgents", parsed.freeAgents, buildFreeAgentRecord, (agent) => String(agent.pid)),
      importCollectionRecords("hallOfFame", parsed.hallOfFame, buildHallOfFameRecord, (entry) => String(entry.pid)),
      importCollectionRecords("events", parsed.events, buildEventRecord, (event, index) => `${event.type || event.category || event.name}-${event.season || "unknown"}-${index}`),
      importCollectionRecords("history", parsed.history, buildHistoryRecord, (entry, index) => `${entry.season || "history"}-${index}`),
      importCollectionRecords("playoffSeries", parsed.playoffs, buildPlayoffSeriesRecord, (entry, index) => String(entry.id ?? `${entry.season || "p"}-${entry.round ?? index}-${index}`)),
      importCollectionRecords("gameAttributes", parsed.gameAttributes, buildGameAttributeRecord, (entry, index) => String(entry.id ?? entry.name ?? index))
    ]);

    await saveDoc("settings", "leagueSettings", buildSettings(rawData));
  } else {
    await Promise.all([
      importCollectionRecords("teams", parsed.teams, buildTeamRecord, (team) => String(team.tid)),
      importCollectionRecords("players", parsed.players, buildPlayerRecord, (player) => String(player.pid)),
      importCollectionRecords("games", parsed.games, buildGameRecord, (game) => `${game.season}-${game.gid}`),
      importCollectionRecords("schedule", parsed.schedule, buildScheduleRecord, (entry) => `${entry.season}-${entry.gid}`),
      importCollectionRecords("awards", parsed.awards, buildAwardRecord, (award) => `${award.season}-${award.type || award.name}`),
      importCollectionRecords("draftPicks", parsed.draftPicks, buildDraftPickRecord, (pick) => `${pick.season}-${pick.round}-${pick.pick}`),
      importCollectionRecords("freeAgents", parsed.freeAgents, buildFreeAgentRecord, (agent) => String(agent.pid)),
      importCollectionRecords("hallOfFame", parsed.hallOfFame, buildHallOfFameRecord, (entry) => String(entry.pid)),
      importCollectionRecords("events", parsed.events, buildEventRecord, (event, index) => `${event.type || event.category || event.name}-${event.season || "unknown"}-${index}`),
      importCollectionRecords("history", parsed.history, buildHistoryRecord, (entry, index) => `${entry.season || "history"}-${index}`),
      importCollectionRecords("playoffSeries", parsed.playoffs, buildPlayoffSeriesRecord, (entry, index) => String(entry.id ?? `${entry.season || "p"}-${entry.round ?? index}-${index}`)),
      importCollectionRecords("gameAttributes", parsed.gameAttributes, buildGameAttributeRecord, (entry, index) => String(entry.id ?? entry.name ?? index))
    ]);
    await saveDoc("settings", "leagueSettings", buildSettings(rawData));
  }
}

export { importLeagueData };
