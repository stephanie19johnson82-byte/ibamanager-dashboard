const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch;

const EMULATOR_BASE = 'http://127.0.0.1:8080/v1/projects/demo-no-project/databases/(default)/documents';

function toField(value) {
  if (value == null) return { nullValue: null };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(v => toField(v)) } };
  }
  if (typeof value === 'number' && Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === 'number') return { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k,v])=>[k,toField(v)])) } };
  return { stringValue: String(value) };
}

async function writeDoc(collection, id, fields) {
  const url = `${EMULATOR_BASE}/${collection}/${encodeURIComponent(String(id))}`;
  const body = { fields };
  const res = await fetch(url, { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to write ${collection}/${id}: ${res.status} ${txt}`);
  }
  return res.json();
}

async function deleteCollection(collection) {
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
      console.error('Delete error', e.message || e);
    }
  }
}

async function main() {
  const filePath = process.argv[2] || path.join(__dirname, '..', 'BBGM_IBA_2067_preseason.json');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const teams = raw.teams || [];
  const players = raw.players || [];
  const clean = process.argv.includes('--clean');

  if (clean) {
    console.log('Cleaning target collections before import...');
    const cols = ['teams','players','games','schedule','awards','draftPicks','freeAgents','hallOfFame','history','events','settings'];
    for (const c of cols) {
      try { await deleteCollection(c); } catch (e) { console.error('Clean failed for', c, e.message || e); }
    }
  }

  console.log(`Importing ${teams.length} teams and ${players.length} players...`);

  for (const team of teams) {
    const fields = {};
    // Common team fields
    ['tid','abbrev','region','name','wins','losses','value','owner'].forEach(k => {
      if (team[k] !== undefined && team[k] !== null) fields[k] = toField(team[k]);
    });
    try {
      await writeDoc('teams', team.tid ?? team.id ?? `${Math.random().toString(36).slice(2,8)}`, fields);
      console.log('Wrote team', team.tid);
    } catch (e) {
      console.error('Team write error', e.message);
    }
  }
  for (const p of players) {
    const id = p.pid ?? p.id ?? `${Math.random().toString(36).slice(2,8)}`;
    const latestRating = Array.isArray(p.ratings) && p.ratings.length ? p.ratings[p.ratings.length - 1] : null;
    const h = (function normalizeHeight(hg){
      if (hg == null) return null;
      if (Array.isArray(hg)) return { feet: Number(hg[0])||0, inches: Number(hg[1])||0 };
      if (typeof hg === 'number') return { feet: Math.floor(hg/12), inches: hg%12 };
      const s = String(hg);
      if (s.includes('-')) { const [f,i]=s.split('-').map(p=>Number(p)||0); return { feet:f, inches:i }; }
      const n = Number(s); if (!Number.isNaN(n)) return { feet: Math.floor(n/12), inches: n%12 }; return null;
    })(p.hgt);

    const fields = {
      pid: toField(id),
      firstName: toField(p.firstName || p.first || ''),
      lastName: toField(p.lastName || p.last || ''),
      age: toField(p.age ?? null),
      pos: toField(p.pos || p.position || ''),
      tid: toField(p.tid ?? null),
      height: h ? toField(h) : undefined,
      weight: p.weight !== undefined ? toField(p.weight) : undefined,
      ratings: latestRating ? toField(latestRating) : undefined
    };
    // remove undefined
    Object.keys(fields).forEach(k => { if (fields[k] === undefined) delete fields[k]; });
    try {
      await writeDoc('players', id, fields);
      console.log('Wrote player', id);
    } catch (e) {
      console.error('Player write error', e.message);
    }
  }

  // Games
  const games = raw.games || [];
  for (const g of games) {
    const id = `${g.season ?? 's'}-${g.gid ?? Math.random().toString(36).slice(2,6)}`;
    const fields = {};
    ['gid','season','date','homeTid','awayTid','homeScore','awayScore','completed'].forEach(k=>{ if (g[k] !== undefined && g[k] !== null) fields[k]=toField(g[k]); });
    try { await writeDoc('games', id, fields); } catch(e){ console.error('Game write error', e.message); }
  }

  // Schedule
  const schedule = raw.schedule || [];
  for (const s of schedule) {
    const id = `${s.season ?? 's'}-${s.gid ?? Math.random().toString(36).slice(2,6)}`;
    const fields = {};
    ['season','gid','date','homeTid','awayTid','status'].forEach(k=>{ if (s[k]!==undefined && s[k]!==null) fields[k]=toField(s[k]); });
    try { await writeDoc('schedule', id, fields); } catch(e){ console.error('Schedule write error', e.message); }
  }

  // Awards
  const awards = raw.awards || [];
  for (const a of awards) {
    const id = `${a.season ?? 's'}-${a.type ?? a.name ?? Math.random().toString(36).slice(2,6)}`;
    try { await writeDoc('awards', id, Object.fromEntries(Object.keys(a).map(k=>[k,toField(a[k])] ))); } catch(e){ console.error('Award write error', e.message); }
  }

  // Draft picks
  const draftPicks = raw.draftPicks || [];
  for (const d of draftPicks) {
    const id = `${d.season ?? 's'}-${d.round ?? 0}-${d.pick ?? Math.random().toString(36).slice(2,4)}`;
    try { await writeDoc('draftPicks', id, Object.fromEntries(Object.keys(d).map(k=>[k,toField(d[k])] ))); } catch(e){ console.error('Draft write error', e.message); }
  }

  // Free agents
  const freeAgents = raw.freeAgents || [];
  for (const f of freeAgents) {
    const id = f.pid ?? Math.random().toString(36).slice(2,6);
    try { await writeDoc('freeAgents', id, Object.fromEntries(Object.keys(f).map(k=>[k,toField(f[k])] ))); } catch(e){ console.error('FreeAgent write error', e.message); }
  }

  // Hall of Fame
  const hallOfFame = raw.hallOfFame || [];
  for (const h of hallOfFame) {
    const id = h.pid ?? Math.random().toString(36).slice(2,6);
    try { await writeDoc('hallOfFame', id, Object.fromEntries(Object.keys(h).map(k=>[k,toField(h[k])] ))); } catch(e){ console.error('HOF write error', e.message); }
  }

  // History
  const history = raw.history || [];
  for (let i=0;i<history.length;i++) {
    const entry = history[i];
    const id = `${entry.season ?? 'history'}-${i}`;
    try { await writeDoc('history', id, Object.fromEntries(Object.keys(entry).map(k=>[k,toField(entry[k])] ))); } catch(e){ console.error('History write error', e.message); }
  }

  // Events
  const events = raw.events || [];
  for (let i=0;i<events.length;i++) {
    const ev = events[i];
    const id = ev.id ?? `${ev.type||ev.name||'event'}-${ev.season||'s'}-${i}`;
    try { await writeDoc('events', id, Object.fromEntries(Object.keys(ev).map(k=>[k,toField(ev[k])] ))); } catch(e){ console.error('Event write error', e.message); }
  }

  // Settings
  const settings = {
    leagueName: raw.leagueName || raw.league?.name || 'Basketball Managers League',
    salaryCap: raw.salaryCap ?? null,
    luxuryTax: raw.luxuryTax ?? null,
    seasonLength: raw.seasonLength ?? null,
    playoffTeams: raw.playoffTeams ?? null,
    draftRounds: raw.draftRounds ?? null,
    tradeDeadline: raw.tradeDeadline ?? null,
    gameAttributes: raw.gameAttributes || []
  };
  try { await writeDoc('settings', 'leagueSettings', Object.fromEntries(Object.keys(settings).map(k=>[k,toField(settings[k])] ))); } catch(e){ console.error('Settings write error', e.message); }

  console.log('Import finished');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
