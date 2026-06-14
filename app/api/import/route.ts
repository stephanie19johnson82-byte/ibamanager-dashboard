import { NextResponse } from 'next/server';

const EMULATOR_BASE = 'http://127.0.0.1:8080/v1/projects/demo-no-project/databases/(default)/documents';

console.log('api/import route loaded');

type FirestoreField =
  | { nullValue: null }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { stringValue: string }
  | { arrayValue: { values: FirestoreField[] } }
  | { mapValue: { fields: Record<string, FirestoreField> } };

function toField(value: any): FirestoreField {
  if (value == null) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map((v) => toField(v)) } };
  if (typeof value === 'number' && Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === 'number') return { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toField(v)])) } };
  return { stringValue: String(value) };
}

function normalizeHeight(h: any) {
  if (h == null) return null;
  if (Array.isArray(h)) return { feet: Number(h[0]) || 0, inches: Number(h[1]) || 0 };
  if (typeof h === 'number') return { feet: Math.floor(h / 12), inches: h % 12 };
  const s = String(h);
  if (s.includes('-')) {
    const [f, i] = s.split('-').map((p) => Number(p) || 0);
    return { feet: f, inches: i };
  }
  const n = Number(s);
  if (!Number.isNaN(n)) return { feet: Math.floor(n / 12), inches: n % 12 };
  return null;
}

function buildTeamFields(team: any) {
  return buildGenericFields(team);
}

function buildPlayerFields(p: any) {
  const fields: Record<string, any> = buildGenericFields(p);
  const h = normalizeHeight(p.hgt ?? p.height);
  if (h) fields.height = toField(h);
  if (!fields.pid) {
    fields.pid = toField(p.pid ?? String(p.id ?? Math.random().toString(36).slice(2,8)));
  }
  if (!fields.firstName) {
    fields.firstName = toField(p.firstName || p.first || '');
  }
  if (!fields.lastName) {
    fields.lastName = toField(p.lastName || p.last || '');
  }
  if (!fields.pos) {
    fields.pos = toField(p.pos || p.position || '');
  }
  if (!fields.tid) {
    fields.tid = toField(p.tid ?? p.teamId ?? p.team ?? null);
  }
  fields.updatedAt = toField(new Date().toISOString());
  return fields;
}

function buildGameFields(g: any) {
  const f: Record<string, any> = {};
  ['gid','season','date','homeTid','awayTid','homeScore','awayScore','completed'].forEach(k=>{ if (g[k] !== undefined && g[k] !== null) f[k]=toField(g[k]); });
  f.updatedAt = toField(new Date().toISOString());
  return f;
}

function buildScheduleFields(s: any) {
  const f: Record<string, any> = {};
  ['season','gid','date','homeTid','awayTid','status'].forEach(k=>{ if (s[k] !== undefined && s[k] !== null) f[k]=toField(s[k]); });
  f.updatedAt = toField(new Date().toISOString());
  return f;
}

function buildGenericFields(obj: any) {
  const f: Record<string, any> = {};
  Object.keys(obj || {}).forEach(k => { if (obj[k] !== undefined) f[k] = toField(obj[k]); });
  f.updatedAt = toField(new Date().toISOString());
  return f;
}

async function writeDoc(collection: string, id: string, fields: Record<string, any>) {
  const url = `${EMULATOR_BASE}/${collection}/${encodeURIComponent(String(id))}`;
  const res = await fetch(url, { method: 'PATCH', body: JSON.stringify({ fields }), headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to write ${collection}/${id}: ${res.status} ${txt}`);
  }
  return res.json();
}

async function deleteCollection(collection: string) {
  const url = `${EMULATOR_BASE}/${collection}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) return;
  const json = await res.json();
  if (!json.documents) return;
  for (const doc of json.documents) {
    try {
      const parts = doc.name.split('/');
      const id = parts[parts.length - 1];
      const delUrl = `${EMULATOR_BASE}/${collection}/${encodeURIComponent(id)}`;
      await fetch(delUrl, { method: 'DELETE' });
      console.log(`Deleted ${collection}/${id}`);
    } catch (e) {
      console.error('Delete error', e);
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const teams = body.teams || [];
    const players = body.players || [];
    const games = body.games || [];
    const schedule = body.schedule || [];
    const awards = body.awards || [];
    const draftPicks = body.draftPicks || [];
    const freeAgents = body.freeAgents || [];
    const hallOfFame = body.hallOfFame || [];
    const history = body.history || [];
    const events = body.events || [];
    const playoffSeries = body.playoffSeries || [];
    const gameAttributes = body.gameAttributes || [];

    // Optional clean
    if (body.clean) {
      const colsToClean = ['teams','players','games','schedule','awards','draftPicks','freeAgents','hallOfFame','history','events','playoffSeries','gameAttributes','settings'];
      for (const c of colsToClean) {
        try { await deleteCollection(c); } catch (e) { console.error('Clean failed for', c, e); }
      }
    }

    // Teams
    for (const team of teams) {
      const id = String(team.tid ?? team.id ?? Math.random().toString(36).slice(2,8));
      const fields = buildTeamFields(team);
      await writeDoc('teams', id, fields);
    }

    // Players
    for (const p of players) {
      const id = String(p.pid ?? p.id ?? Math.random().toString(36).slice(2,8));
      const fields = buildPlayerFields(p);
      await writeDoc('players', id, fields);
    }

    // Games
    for (const g of games) {
      const id = `${g.season ?? 's'}-${g.gid ?? Math.random().toString(36).slice(2,6)}`;
      const fields = buildGameFields(g);
      await writeDoc('games', id, fields);
    }

    // Schedule
    for (const s of schedule) {
      const id = `${s.season ?? 's'}-${s.gid ?? Math.random().toString(36).slice(2,6)}`;
      const fields = buildScheduleFields(s);
      await writeDoc('schedule', id, fields);
    }

    // Awards
    for (const a of awards) {
      const id = `${a.season ?? 's'}-${a.type ?? a.name ?? Math.random().toString(36).slice(2,6)}`;
      const fields = buildGenericFields(a);
      await writeDoc('awards', id, fields);
    }

    // Draft picks
    for (const d of draftPicks) {
      const id = `${d.season ?? 's'}-${d.round ?? 0}-${d.pick ?? Math.random().toString(36).slice(2,4)}`;
      const fields = buildGenericFields(d);
      await writeDoc('draftPicks', id, fields);
    }

    // Free agents
    for (const f of freeAgents) {
      const id = String(f.pid ?? Math.random().toString(36).slice(2,6));
      const fields = buildGenericFields(f);
      await writeDoc('freeAgents', id, fields);
    }

    // Hall of Fame
    for (const h of hallOfFame) {
      const id = String(h.pid ?? Math.random().toString(36).slice(2,6));
      const fields = buildGenericFields(h);
      await writeDoc('hallOfFame', id, fields);
    }

    // History
    for (let i=0;i<history.length;i++) {
      const entry = history[i];
      const id = `${entry.season ?? 'history'}-${i}`;
      const fields = buildGenericFields(entry);
      await writeDoc('history', id, fields);
    }

    // Events
    for (let i=0;i<events.length;i++) {
      const ev = events[i];
      const id = ev.id ?? `${ev.type||ev.name||'event'}-${ev.season||'s'}-${i}`;
      const fields = buildGenericFields(ev);
      await writeDoc('events', id, fields);
    }

    // Playoff series
    for (let i=0;i<playoffSeries.length;i++) {
      const series = playoffSeries[i];
      const id = series.id ?? `${series.season||'s'}-${series.round||i}-${i}`;
      const fields = buildGenericFields(series);
      await writeDoc('playoffSeries', id, fields);
    }

    // Game attributes
    for (let i=0;i<gameAttributes.length;i++) {
      const attr = gameAttributes[i];
      const id = attr.id ?? attr.name ?? `${i}`;
      const fields = buildGenericFields(attr);
      await writeDoc('gameAttributes', id, fields);
    }

    // Settings
    const settings = {
      leagueName: body.leagueName || body.league?.name || 'Basketball Managers League',
      salaryCap: body.salaryCap ?? null,
      luxuryTax: body.luxuryTax ?? null,
      seasonLength: body.seasonLength ?? null,
      playoffTeams: body.playoffTeams ?? null,
      draftRounds: body.draftRounds ?? null,
      tradeDeadline: body.tradeDeadline ?? null,
      gameAttributes: body.gameAttributes || []
    };
    await writeDoc('settings', 'leagueSettings', buildGenericFields(settings));

    return NextResponse.json({ ok: true, teams: teams.length, players: players.length });
  } catch (err: any) {
    console.error('api/import error', err);
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
