import { batchWrite, fetchDoc, saveDoc } from "./database.js";

function parseLeague(raw) {
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

function buildPlayerRecord(player) {
  return {
    pid: player.pid,
    firstName: player.firstName,
    lastName: player.lastName,
    age: player.age,
    position: player.pos,
    height: player.hgt ? player.hgt.split("-") : [0, 0],
    weight: player.weight,
    bornYear: player.born?.year || null,
    ovr: player.ratings?.ovr || 0,
    pot: player.ratings?.pot || 0,
    ratings: player.ratings || {},
    stats: player.stats || [],
    awards: player.awards || [],
    contract: player.contract || {},
    injury: player.injury || null,
    teamId: player.tid,
    updatedAt: new Date().toISOString()
  };
}

function buildTeamRecord(team) {
  return {
    tid: team.tid,
    region: team.region,
    name: team.name,
    abbrev: team.abbrev,
    colors: team.colors || [],
    imgURL: team.imgURL || null,
    wins: team.seasonAttrs?.wins ?? team.won ?? 0,
    losses: team.seasonAttrs?.losses ?? team.lost ?? 0,
    conference: team.conference || null,
    division: team.division || null,
    arenaCapacity: team.arenaCapacity || null,
    ownerUid: team.ownerUid || null,
    value: calculateTeamValue(team),
    updatedAt: new Date().toISOString()
  };
}

function buildGameRecord(game) {
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

function buildScheduleRecord(entry) {
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

function buildAwardRecord(award) {
  return { ...award, updatedAt: new Date().toISOString() };
}

function buildDraftPickRecord(pick) {
  return { ...pick, updatedAt: new Date().toISOString() };
}

function buildFreeAgentRecord(agent) {
  return { ...agent, updatedAt: new Date().toISOString() };
}

function buildHallOfFameRecord(entry) {
  return { ...entry, updatedAt: new Date().toISOString() };
}

function buildEventRecord(event, index) {
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

function buildHistoryRecord(entry, index) {
  return {
    id: `${entry.season || "history"}-${index}`,
    season: entry.season || null,
    summary: entry.description || JSON.stringify(entry),
    updatedAt: new Date().toISOString()
  };
}

function buildSettings(records) {
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

function buildNewsFromAward(award) {
  return {
    id: `${award.season}-award-${award.type || award.name}`,
    category: "Award",
    headline: `${award.name || award.type} announced for ${award.season}`,
    summary: award.text || award.description || `${award.name || award.type} for ${award.season}.`,
    publishedAt: new Date().toISOString()
  };
}

function buildNewsFromChampionship(team) {
  return {
    id: `${team.season || "championship"}-${team.tid}`,
    category: "Championship",
    headline: `${team.region} ${team.name} wins the championship!`,
    summary: `The ${team.region} ${team.name} captured the title in ${team.season}.`,
    publishedAt: new Date().toISOString()
  };
}

function buildNewsFromEvent(event, index) {
  return {
    id: `${event.type || event.category || "event"}-${event.season || "unknown"}-${index}`,
    category: event.category || "Event",
    headline: event.title || event.type || event.name || `League event for ${event.season}`,
    summary: event.text || event.description || "League update available.",
    publishedAt: new Date().toISOString()
  };
}

async function importCollectionRecords(collectionName, items, builder, keyFn) {
  const records = items.map((item, index) => ({
    collectionName,
    id: keyFn ? keyFn(item, index) : String(item.id ?? item.pid ?? index),
    data: builder(item, index)
  }));
  await batchWrite(records);
}

async function importPlayers(players) {
  await importCollectionRecords("players", players, buildPlayerRecord, (player) => String(player.pid));
}

async function importTeams(teams) {
  await importCollectionRecords("teams", teams, buildTeamRecord, (team) => String(team.tid));
}

async function importGames(games) {
  await importCollectionRecords("games", games, buildGameRecord, (game) => `${game.season}-${game.gid}`);
}

async function importSchedule(schedule) {
  await importCollectionRecords("schedule", schedule, buildScheduleRecord, (entry) => `${entry.season}-${entry.gid}`);
}

async function importAwards(awards) {
  await importCollectionRecords("awards", awards, buildAwardRecord, (award) => `${award.season}-${award.type || award.name}`);
}

async function importDraftPicks(draftPicks) {
  await importCollectionRecords("draftPicks", draftPicks, buildDraftPickRecord, (pick) => `${pick.season}-${pick.round}-${pick.pick}`);
}

async function importFreeAgents(freeAgents) {
  await importCollectionRecords("freeAgents", freeAgents, buildFreeAgentRecord, (agent) => String(agent.pid));
}

async function importHallOfFame(hallOfFame) {
  await importCollectionRecords("hallOfFame", hallOfFame, buildHallOfFameRecord, (entry) => String(entry.pid));
}

async function importEvents(events) {
  const news = events.map((event, index) => ({
    collectionName: "news",
    id: `${event.type || event.category || event.name}-${event.season || "unknown"}-${index}`,
    data: buildNewsFromEvent(event, index)
  }));
  await batchWrite(news);
}

async function importHistory(history) {
  const records = history.map((entry, index) => ({
    collectionName: "history",
    id: `${entry.season || "history"}-${index}`,
    data: buildHistoryRecord(entry, index)
  }));
  await batchWrite(records);
}

async function importGameAttributes(gameAttributes) {
  await saveDoc("settings", "leagueSettings", buildSettings({ gameAttributes }));
}

async function generateNews(parsed) {
  const newsItems = [];
  if (parsed.awards?.length) {
    parsed.awards.forEach((award) => newsItems.push({
      collectionName: "news",
      id: `${award.season}-award-${award.type || award.name}`,
      data: buildNewsFromAward(award)
    }));
  }
  if (parsed.playoffs?.length) {
    parsed.playoffs.forEach((series, index) => {
      const title = `${series.homeTid || "Home"} vs ${series.awayTid || "Away"}`;
      newsItems.push({
        collectionName: "news",
        id: `${series.season || "playoff"}-${index}`,
        data: {
          id: `${series.season || "playoff"}-${index}`,
          category: "Playoffs",
          headline: `${title} in ${series.season || "Playoffs"}`,
          summary: series.status ? `Series status: ${series.status}` : `Playoff series update for ${title}`,
          publishedAt: new Date().toISOString()
        }
      });
    });
  }
  if (parsed.events?.length) {
    parsed.events.forEach((event, index) => newsItems.push({
      collectionName: "news",
      id: `${event.type || event.category || index}-${event.season || "unknown"}`,
      data: buildNewsFromEvent(event, index)
    }));
  }
  if (newsItems.length) await batchWrite(newsItems);
}

async function importLeagueData(rawData) {
  const parsed = parseLeague(rawData);
  await importTeams(parsed.teams);
  await importPlayers(parsed.players);
  await importGames(parsed.games);
  await importSchedule(parsed.schedule);
  await importAwards(parsed.awards);
  await importDraftPicks(parsed.draftPicks);
  await importFreeAgents(parsed.freeAgents);
  await importHallOfFame(parsed.hallOfFame);
  await importEvents(parsed.events);
  await importHistory(parsed.history);
  await importGameAttributes(parsed.gameAttributes);
  await generateNews(parsed);
}

function calculateTeamValue(team) {
  const wins = team.seasonAttrs?.wins || team.won || 0;
  const championships = team.seasonAttrs?.championships || 0;
  const marketSize = team.marketSize || 50;
  const prestige = team.prestige || 1;
  return Math.round(1000000 + wins * 12000 + championships * 250000 + marketSize * 10000 + prestige * 50000);
}

export { parseLeague, importLeagueData, importPlayers, importTeams, importGames, importSchedule, importAwards, importDraftPicks, importFreeAgents, importHallOfFame, calculateTeamValue };
