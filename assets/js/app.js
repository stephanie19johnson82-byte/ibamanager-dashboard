import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { loginUser, registerUser, logoutUser, fetchCurrentUser } from "./auth.js";
import { fetchCollection, fetchDoc, saveDoc, updateDocFields } from "./database.js";
import { orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { importLeagueData } from "./importLeague.js";

const navTemplate = `
<nav class="navbar navbar-expand-lg navbar-dark py-3 nav-frosted">
  <div class="container-fluid">
    <a class="navbar-brand d-flex align-items-center gap-2" href="/index.html">
      <span class="brand-icon rounded-pill px-3 py-2">BML</span>
      <div>
        <span class="d-block">Basketball Managers League</span>
        <small class="text-secondary">League management, trades, ownership, and dynasty value</small>
      </div>
    </a>
    <button class="navbar-toggler border border-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto align-items-lg-center">
        <li class="nav-item"><a class="nav-link" href="/dashboard/index.html">Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" href="/teams/index.html">Teams</a></li>
        <li class="nav-item"><a class="nav-link" href="/players/index.html">Players</a></li>
        <li class="nav-item"><a class="nav-link" href="/standings/index.html">Standings</a></li>
        <li class="nav-item"><a class="nav-link" href="/schedule/index.html">Schedule</a></li>
        <li class="nav-item"><a class="nav-link" href="/news/index.html">News</a></li>
        <li class="nav-item"><a class="nav-link" href="/franchise-market/index.html">Market</a></li>
        <li class="nav-item"><a class="nav-link" href="/admin/index.html">Admin</a></li>
      </ul>
      <div class="d-flex align-items-center gap-2 ms-lg-3">
        <button id="logout-btn" class="btn btn-sm btn-outline-light">Logout</button>
      </div>
    </div>
  </div>
</nav>
`;

const footerTemplate = `
<footer class="main-footer text-center text-secondary py-5">
  <div class="container">
    <div class="row gy-3">
      <div class="col-md-6 text-start text-md-start">
        <h5 class="text-white mb-2">Basketball Managers League</h5>
        <p class="small text-white-50 mb-0">Built for dynamic BBGM export leagues, owner dashboards, roster management, and a modern management experience.</p>
      </div>
      <div class="col-md-6 d-flex justify-content-center justify-content-md-end align-items-center gap-3">
        <a href="/dashboard/index.html" class="text-decoration-none text-secondary">Dashboard</a>
        <a href="/news/index.html" class="text-decoration-none text-secondary">News</a>
        <a href="/admin/index.html" class="text-decoration-none text-secondary">Admin</a>
      </div>
    </div>
    <div class="mt-4 small text-white-50">&copy; ${new Date().getFullYear()} BML. All rights reserved.</div>
  </div>
</footer>
`;

function insertLayout() {
  const nav = document.getElementById("main-nav");
  const footer = document.getElementById("main-footer");
  if (nav) nav.innerHTML = navTemplate;
  if (footer) footer.innerHTML = footerTemplate;
  highlightCurrentNav();
  const logoutButton = document.getElementById("logout-btn");
  logoutButton?.addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "/login.html";
  });
}

function highlightCurrentNav() {
  const page = getCurrentPage();
  document.querySelectorAll("#navbarNav .nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href")?.includes(page));
  });
}

function getCurrentPage() {
  return document.body.dataset.page;
}

async function initializePage() {
  insertLayout();
  const page = getCurrentPage();
  if (page === "login") return setupLogin();
  if (page === "register") return setupRegister();
  if (page === "dashboard") return renderDashboard();
  if (page === "teams") return renderTeams();
  if (page === "team") return renderTeam();
  if (page === "players") return renderPlayers();
  if (page === "player") return renderPlayer();
  if (page === "standings") return renderStandings();
  if (page === "schedule") return renderSchedule();
  if (page === "playoffs") return renderPlayoffs();
  if (page === "trade-center") return renderTradeCenter();
  if (page === "free-agency") return renderFreeAgency();
  if (page === "draft") return renderDraft();
  if (page === "league-office") return renderLeagueOffice();
  if (page === "franchise-market") return renderFranchiseMarket();
  if (page === "admin") return renderAdmin();
  if (page === "hall-of-fame") return renderHallOfFame();
  if (page === "records") return renderRecords();
  if (page === "news") return renderNews();
}

async function ensureAuth(required = true) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user && required) {
        window.location.href = "/login.html";
      } else {
        if (user) {
          window.currentUser = await fetchCurrentUser(user.uid);
        }
        resolve(user);
      }
    });
  });
}

async function ensureRole(requiredRoles = []) {
  await ensureAuth();
  if (!requiredRoles.length) return true;
  const role = window.currentUser?.role || "viewer";
  return requiredRoles.includes(role);
}

async function setupLogin() {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      await loginUser({ email, password });
      window.location.href = "/dashboard/index.html";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

async function setupRegister() {
  const form = document.getElementById("register-form");
  const message = document.getElementById("register-message");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      await registerUser({ username, email, password });
      window.location.href = "/dashboard/index.html";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

async function renderTeams() {
  await ensureAuth();
  const teams = await fetchCollection("teams", [orderBy("wins", "desc")]);
  const container = document.getElementById("team-list");
  if (!container) return;
  container.innerHTML = teams.map((team) => `
    <div class="col-md-6 col-xl-4">
      <div class="card border-secondary h-100">
        <div class="card-body">
          <h3 class="h5 text-white mb-2">${team.region} ${team.name}</h3>
          <p class="text-secondary mb-2">${team.conference || "Conference"} • ${team.division || "Division"}</p>
          <p class="text-secondary mb-3">Record: ${team.wins || 0}-${team.losses || 0}</p>
          <a class="btn btn-sm btn-primary" href="/teams/team.html?tid=${team.tid}">View Team</a>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderPlayers() {
  await ensureAuth();
  const players = await fetchCollection("players", [orderBy("ovr", "desc")]);
  const container = document.getElementById("player-list");
  if (!container) return;
  container.innerHTML = players.map((player) => `
    <div class="col-md-6 col-xl-4">
      <div class="card border-secondary h-100">
        <div class="card-body">
          <h3 class="h5 text-white mb-2">${player.firstName} ${player.lastName}</h3>
          <p class="text-secondary mb-1">${player.position} • OVR ${player.ovr} • POT ${player.pot}</p>
          <p class="text-secondary mb-3">Team ID: ${player.teamId}</p>
          <a class="btn btn-sm btn-primary" href="/players/player.html?pid=${player.pid}">View Player</a>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderPlayer() {
  await ensureAuth();
  const params = new URLSearchParams(window.location.search);
  const pid = params.get("pid");
  if (!pid) return;
  const player = await fetchDoc("players", pid);
  if (!player) return;
  document.getElementById("player-name").textContent = `${player.firstName} ${player.lastName}`;
  const teamRef = player.teamId || player.tid || player.team || "N/A";
  document.getElementById("player-meta").textContent = `${player.position} • Age ${player.age} • Team ${teamRef}`;
  document.getElementById("player-contract").innerHTML = `<strong>Contract:</strong> ${player.contract?.amount || "N/A"} for ${player.contract?.years || 0} years`;
  document.getElementById("player-awards").innerHTML = `<strong>Awards:</strong> ${player.awards?.length || 0}`;
  document.getElementById("player-attributes").innerHTML = `
    <div class="col-sm-6 text-secondary">Height: ${Array.isArray(player.height) ? player.height.join("-") : (player.height && (player.height.feet !== undefined || player.height.inches !== undefined) ? `${player.height.feet || 0}-${player.height.inches || 0}` : "N/A")}</div>
    <div class="col-sm-6 text-secondary">Weight: ${player.weight || "N/A"}</div>
    <div class="col-sm-6 text-secondary">OVR: ${player.ovr}</div>
    <div class="col-sm-6 text-secondary">POT: ${player.pot}</div>
  `;
  document.getElementById("player-ratings").innerHTML = Object.entries(player.ratings || {}).map(([key, value]) => `
    <div class="col-sm-6 text-secondary">${key.toUpperCase()}: ${value}</div>
  `).join("");
  document.getElementById("player-stats").innerHTML = `<pre class="text-white-50 small">${JSON.stringify(player.stats || [], null, 2)}</pre>`;
}

async function renderStandings() {
  await ensureAuth();
  const teams = await fetchCollection("teams", [orderBy("wins", "desc")]);
  const container = document.getElementById("standings-grid");
  if (!container) return;
  container.innerHTML = teams.map((team) => `
    <div class="col-12">
      <div class="card border-secondary">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h3 class="h5 text-white mb-1">${team.region} ${team.name}</h3>
            <p class="text-secondary mb-0">${team.conference || "Conference"} • ${team.division || "Division"}</p>
          </div>
          <div class="text-end text-white">
            <div>W ${team.wins} - L ${team.losses}</div>
            <div class="text-secondary">Value ${team.value || 0}</div>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderSchedule() {
  await ensureAuth();
  const schedule = await fetchCollection("schedule", [orderBy("date", "asc")]);
  const container = document.getElementById("schedule-list");
  if (!container) return;
  container.innerHTML = schedule.map((game) => `
    <div class="col-12">
      <div class="card border-secondary">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <div class="text-white">${game.date}</div>
            <div class="text-secondary">${game.awayTid} @ ${game.homeTid}</div>
          </div>
          <div class="text-end text-white">${game.status}</div>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderPlayoffs() {
  await ensureAuth();
  const series = await fetchCollection("playoffSeries", [orderBy("season", "desc")]);
  const container = document.getElementById("playoff-bracket");
  if (!container) return;
  container.innerHTML = series.map((round) => `
    <div class="col-md-6">
      <div class="card border-secondary">
        <div class="card-body">
          <h3 class="h6 text-white mb-2">${round.round}</h3>
          <p class="text-secondary mb-0">${round.awayTid} vs ${round.homeTid}</p>
          <p class="text-white mt-2">Status: ${round.status || "Unknown"}</p>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderTradeCenter() {
  await ensureAuth();
  const trades = await fetchCollection("tradeCenter", [orderBy("createdAt", "desc")]);
  const container = document.getElementById("trade-list");
  if (!container) return;
  container.innerHTML = trades.map((trade) => `
    <div class="col-md-6">
      <div class="card border-secondary">
        <div class="card-body">
          <h3 class="h5 text-white mb-2">Trade ${trade.tradeId || trade.id}</h3>
          <p class="text-secondary mb-2">${trade.proposingTeam} → ${trade.receivingTeam}</p>
          <p class="text-white mb-1">Status: ${trade.status}</p>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderFranchiseMarket() {
  await ensureAuth();
  const teams = await fetchCollection("teams", [orderBy("value", "desc")]);
  const container = document.getElementById("franchise-market-list");
  if (!container) return;
  container.innerHTML = teams.map((team) => `
    <div class="col-md-6 col-xl-4">
      <div class="card border-secondary h-100">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 class="h5 text-white mb-1">${team.region} ${team.name}</h3>
              <p class="text-secondary mb-0">${team.abbrev}</p>
            </div>
            <span class="badge bg-primary">${team.ownerUid ? "Owned" : "Available"}</span>
          </div>
          <p class="text-secondary mb-2">Price: ${team.value || 0}</p>
          <p class="text-secondary mb-3">Current owner: ${team.ownerUid || "Unowned"}</p>
          <button class="btn btn-sm btn-primary" type="button">Request Purchase</button>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderFreeAgency() {
  await ensureAuth();
  const agents = await fetchCollection("freeAgents", [orderBy("ovr", "desc")]);
  const container = document.getElementById("free-agent-list");
  if (!container) return;
  container.innerHTML = agents.map((player) => `
    <div class="col-md-6 col-xl-4">
      <div class="card border-secondary h-100">
        <div class="card-body">
          <h3 class="h5 text-white mb-2">${player.firstName} ${player.lastName}</h3>
          <p class="text-secondary mb-2">OVR ${player.ovr} • POT ${player.pot}</p>
          <a class="btn btn-sm btn-primary" href="/players/player.html?pid=${player.pid}">View</a>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderDraft() {
  await ensureAuth();
  const picks = await fetchCollection("draftPicks", [orderBy("season", "desc")]);
  const container = document.getElementById("draft-board");
  if (!container) return;
  container.innerHTML = picks.map((pick) => `
    <div class="col-md-6">
      <div class="card border-secondary">
        <div class="card-body">
          <h3 class="h5 text-white mb-2">Season ${pick.season} • Round ${pick.round}</h3>
          <p class="text-secondary mb-0">Pick ${pick.pick} • Team ${pick.tid}</p>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderLeagueOffice() {
  await ensureAuth();
  const [settings, economy, features, teams, users] = await Promise.all([
    fetchDoc("settings", "leagueSettings"),
    fetchDoc("economy", "economyConfig"),
    fetchDoc("features", "featuresConfig"),
    fetchCollection("teams", [orderBy("value", "desc")]),
    fetchCollection("users", [orderBy("username", "asc")])
  ]);
  const container = document.getElementById("league-office-panel");
  if (!container) return;
  container.innerHTML = `
    <div class="col-lg-6">
      <div class="card border-secondary p-4 mb-4">
        <h3 class="h5 text-white mb-3">League Settings</h3>
        <pre class="text-white-50 small">${JSON.stringify(settings || {}, null, 2)}</pre>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card border-secondary p-4 mb-4">
        <h3 class="h5 text-white mb-3">Economy</h3>
        <pre class="text-white-50 small">${JSON.stringify(economy || {}, null, 2)}</pre>
      </div>
      <div class="card border-secondary p-4">
        <h3 class="h5 text-white mb-3">Active Features</h3>
        <pre class="text-white-50 small">${JSON.stringify(features || {}, null, 2)}</pre>
      </div>
    </div>
    <div class="col-12">
      <div class="card border-secondary p-4">
        <h3 class="h5 text-white mb-3">Team Performance</h3>
        ${teams.slice(0, 6).map((team) => `<p class="text-secondary mb-2"><strong class="text-white">${team.region} ${team.name}</strong> — ${team.wins || 0}-${team.losses || 0}, Value ${team.value || 0}</p>`).join("")}
      </div>
    </div>
    <div class="col-12">
      <div class="card border-secondary p-4">
        <h3 class="h5 text-white mb-3">Active Users</h3>
        ${users.slice(0, 8).map((user) => `<p class="text-secondary mb-2"><strong class="text-white">${user.username}</strong> — ${user.role} • B-Coins ${user.balance || 0}</p>`).join("")}
      </div>
    </div>
  `;
}

async function renderDashboard() {
  await ensureAuth();
  const teams = await fetchCollection("teams", [orderBy("wins", "desc")]);
  const news = await fetchCollection("news", [orderBy("publishedAt", "desc")]);
  const trades = await fetchCollection("tradeCenter", [orderBy("createdAt", "desc")]);
  const richest = teams.sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 4);
  const container = document.getElementById("dashboard-grid");
  if (!container) return;
  container.innerHTML = `
    <div class="col-lg-6">
      <div class="card border-secondary p-4 h-100">
        <h3 class="h5 text-white mb-3">Latest News</h3>
        ${news.slice(0, 4).map((item) => `<p class="text-secondary mb-2"><strong class="text-white">${item.headline}</strong><br />${item.summary || item.description || "No summary"}</p>`).join("")}
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card border-secondary p-4 h-100">
        <h3 class="h5 text-white mb-3">Top Teams by Value</h3>
        ${richest.map((team) => `<p class="text-secondary mb-2"><strong class="text-white">${team.region} ${team.name}</strong><br />Value ${team.value || 0}</p>`).join("")}
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card border-secondary p-4 h-100">
        <h3 class="h5 text-white mb-3">Recent Trade Activity</h3>
        ${trades.slice(0, 4).map((trade) => `<p class="text-secondary mb-2"><strong class="text-white">${trade.proposingTeam} → ${trade.receivingTeam}</strong><br />Status: ${trade.status}</p>`).join("")}
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card border-secondary p-4 h-100">
        <h3 class="h5 text-white mb-3">Current Season</h3>
        <p class="text-secondary">Welcome, ${window.currentUser?.username || "Manager"}. Use the sidebar to access teams, players, standings, and league control.</p>
      </div>
    </div>
  `;
}

async function renderTeam() {
  await ensureAuth();
  const params = new URLSearchParams(window.location.search);
  const tid = params.get("tid");
  if (!tid) return;
  const team = await fetchDoc("teams", tid);
  const players = await fetchCollection("players", [orderBy("ovr", "desc")]);
  const roster = players.filter((player) => String(player.teamId || player.tid || player.team) === String(tid));
  if (!team) return;
  document.getElementById("team-header").innerHTML = `
    <div class="card border-secondary p-4 mb-4">
      <h1 class="h4 text-white mb-2">${team.region} ${team.name}</h1>
      <p class="text-secondary mb-1">${team.conference || "Conference"} • ${team.division || "Division"}</p>
      <p class="text-white mb-1">Record: ${team.wins || 0}-${team.losses || 0}</p>
      <p class="text-secondary mb-0">Team Value: ${team.value || 0}</p>
    </div>
  `;
  document.getElementById("team-roster").innerHTML = roster.map((player) => `
    <div class="card bg-dark border-secondary mb-3 p-3">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h3 class="h6 text-white mb-1">${player.firstName} ${player.lastName}</h3>
          <p class="text-secondary mb-0">${player.position} • OVR ${player.ovr}</p>
        </div>
        <a class="btn btn-sm btn-primary" href="/players/player.html?pid=${player.pid}">View</a>
      </div>
    </div>
  `).join("");
  document.getElementById("team-financials").innerHTML = `
    <p class="text-secondary mb-2">Arena Capacity: ${team.arenaCapacity || "N/A"}</p>
    <p class="text-secondary mb-2">Current Value: ${team.value || 0}</p>
    <p class="text-secondary mb-0">Owner balance and value are managed through ownership records.</p>
  `;
  document.getElementById("team-history").innerHTML = `<pre class="text-white-50 small">${JSON.stringify(team.history || [], null, 2)}</pre>`;
}

async function renderAdmin() {
  await ensureAuth();
  const adminViews = {
    "league-settings": `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">League Settings</h3><div id="admin-league-settings"></div></div>`,
    economy: `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Economy</h3><div id="admin-economy"></div></div>`,
    features: `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Feature Toggles</h3><div id="admin-features"></div></div>`,
    users: `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Users</h3><div id="admin-users"></div></div>`,
    teams: `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Teams</h3><div id="admin-teams"></div></div>`,
    awards: `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Awards</h3><div id="admin-awards"></div></div>`,
    "trade-rules": `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Trade Rules</h3><div id="admin-trade-rules"></div></div>`,
    facilities: `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Facilities</h3><div id="admin-facilities"></div></div>`,
    sponsors: `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Sponsors</h3><div id="admin-sponsors"></div></div>`,
    "franchise-prices": `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Franchise Prices</h3><div id="admin-franchise-prices"></div></div>`,
    news: `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">News</h3><div id="admin-news"></div></div>`,
    "import-center": `<div class="card border-secondary p-4"><h3 class="h5 text-white mb-3">Import Center</h3><input id="import-file" type="file" accept="application/json" class="form-control bg-transparent text-white border-secondary mb-3" /><div class="mb-3"><label class="form-label text-white">Import Mode</label><select id="import-mode" class="form-select bg-transparent text-white border-secondary"><option value="full">Full Import</option><option value="update">Update Import</option></select></div><button id="import-btn" class="btn btn-primary">Import League JSON</button><div id="import-status" class="mt-3 text-secondary"></div></div>`
  };
  Object.entries(adminViews).forEach(([id, html]) => {
    const panel = document.getElementById(id);
    if (panel) panel.innerHTML = html;
  });
  await Promise.all([
    loadAdminLeagueSettings(),
    loadAdminEconomy(),
    loadAdminFeatures(),
    loadAdminUsers(),
    loadAdminTeams()
  ]);
  const importBtn = document.getElementById("import-btn");
  importBtn?.addEventListener("click", async () => {
    const status = document.getElementById("import-status");
    const fileInput = document.getElementById("import-file");
    const modeSelect = document.getElementById("import-mode");
    const file = fileInput?.files?.[0];
    const mode = modeSelect?.value || "full";
    if (!file) {
      status.textContent = "Select a JSON file first.";
      return;
    }
    try {
      const json = await file.text();
      const data = JSON.parse(json);
      await importLeagueData(data, mode);
      status.textContent = `League ${mode} import completed successfully.`;
      await Promise.all([
        loadAdminLeagueSettings(),
        loadAdminEconomy(),
        loadAdminFeatures(),
        loadAdminUsers(),
        loadAdminTeams()
      ]);
    } catch (error) {
      status.textContent = `Import error: ${error.message}`;
    }
  });
}

async function loadAdminLeagueSettings() {
  const settings = await fetchDoc("settings", "leagueSettings") || {};
  const container = document.getElementById("admin-league-settings");
  if (!container) return;
  container.innerHTML = `
    <form id="league-settings-form">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label text-white">League Name</label><input class="form-control bg-transparent text-white border-secondary" id="leagueName" value="${settings.leagueName || "Basketball Managers League"}" /></div>
        <div class="col-md-6"><label class="form-label text-white">Salary Cap</label><input class="form-control bg-transparent text-white border-secondary" id="salaryCap" value="${settings.salaryCap || ""}" /></div>
        <div class="col-md-6"><label class="form-label text-white">Luxury Tax</label><input class="form-control bg-transparent text-white border-secondary" id="luxuryTax" value="${settings.luxuryTax || ""}" /></div>
        <div class="col-md-6"><label class="form-label text-white">Season Length</label><input class="form-control bg-transparent text-white border-secondary" id="seasonLength" value="${settings.seasonLength || "82"}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Playoff Teams</label><input class="form-control bg-transparent text-white border-secondary" id="playoffTeams" value="${settings.playoffTeams || "16"}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Draft Rounds</label><input class="form-control bg-transparent text-white border-secondary" id="draftRounds" value="${settings.draftRounds || "2"}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Trade Deadline</label><input class="form-control bg-transparent text-white border-secondary" id="tradeDeadline" value="${settings.tradeDeadline || "Day 100"}" /></div>
      </div>
      <button class="btn btn-primary mt-4" type="submit">Save Settings</button>
    </form>
  `;
  document.getElementById("league-settings-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const updated = {
      leagueName: document.getElementById("leagueName").value,
      salaryCap: Number(document.getElementById("salaryCap").value) || null,
      luxuryTax: Number(document.getElementById("luxuryTax").value) || null,
      seasonLength: Number(document.getElementById("seasonLength").value) || null,
      playoffTeams: Number(document.getElementById("playoffTeams").value) || null,
      draftRounds: Number(document.getElementById("draftRounds").value) || null,
      tradeDeadline: document.getElementById("tradeDeadline").value,
      updatedAt: new Date().toISOString()
    };
    await saveDoc("settings", "leagueSettings", updated);
    alert("League settings saved.");
  });
}

async function loadAdminEconomy() {
  const economy = await fetchDoc("economy", "economyConfig") || {};
  const container = document.getElementById("admin-economy");
  if (!container) return;
  container.innerHTML = `
    <form id="economy-form">
      <div class="row g-3">
        <div class="col-md-4"><label class="form-label text-white">Starting Money</label><input class="form-control bg-transparent text-white border-secondary" id="startingMoney" value="${economy.startingMoney || 1000}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Win Reward</label><input class="form-control bg-transparent text-white border-secondary" id="winReward" value="${economy.winReward || 100}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Playoff Reward</label><input class="form-control bg-transparent text-white border-secondary" id="playoffReward" value="${economy.playoffReward || 500}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Champion Reward</label><input class="form-control bg-transparent text-white border-secondary" id="championReward" value="${economy.championReward || 2000}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Runner-Up Reward</label><input class="form-control bg-transparent text-white border-secondary" id="runnerUpReward" value="${economy.runnerUpReward || 1000}" /></div>
      </div>
      <button class="btn btn-primary mt-4" type="submit">Save Economy</button>
    </form>
  `;
  document.getElementById("economy-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const updated = {
      startingMoney: Number(document.getElementById("startingMoney").value) || 0,
      winReward: Number(document.getElementById("winReward").value) || 0,
      playoffReward: Number(document.getElementById("playoffReward").value) || 0,
      championReward: Number(document.getElementById("championReward").value) || 0,
      runnerUpReward: Number(document.getElementById("runnerUpReward").value) || 0,
      updatedAt: new Date().toISOString()
    };
    await saveDoc("economy", "economyConfig", updated);
    alert("Economy settings saved.");
  });
}

async function loadAdminFeatures() {
  const features = await fetchDoc("features", "featuresConfig") || {};
  const container = document.getElementById("admin-features");
  if (!container) return;
  const featureKeys = ["freeAgency", "draft", "injuries", "morale", "chemistry", "hallOfFame", "facilities", "sponsors"];
  container.innerHTML = `
    <form id="features-form">
      <div class="row g-3">${featureKeys.map((key) => `
        <div class="col-md-6">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="feature-${key}" ${features[key] ? "checked" : ""}>
            <label class="form-check-label text-white" for="feature-${key}">${key.replace(/([A-Z])/g, " $1")}</label>
          </div>
        </div>
      `).join("")}</div>
      <button class="btn btn-primary mt-4" type="submit">Save Feature Toggles</button>
    </form>
  `;
  document.getElementById("features-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const updated = { updatedAt: new Date().toISOString() };
    featureKeys.forEach((key) => {
      updated[key] = document.getElementById(`feature-${key}`).checked;
    });
    await saveDoc("features", "featuresConfig", updated);
    alert("Feature toggles saved.");
  });
}

async function loadAdminUsers() {
  const users = await fetchCollection("users", [orderBy("username", "asc")]);
  const container = document.getElementById("admin-users");
  if (!container) return;
  container.innerHTML = users.map((user) => `
    <div class="card bg-dark border-secondary mb-3 p-3">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h3 class="h6 text-white mb-1">${user.username}</h3>
          <p class="text-secondary mb-1">${user.email} • ${user.role}</p>
          <p class="text-secondary mb-0">Balance: ${user.balance || 0} B-Coins</p>
        </div>
        <div class="text-end">
          <select class="form-select form-select-sm mb-2 user-role-select" data-user-id="${user.uid}">
            ${["commissioner", "owner", "gm", "agm", "viewer"].map((role) => `<option value="${role}" ${user.role === role ? "selected" : ""}>${role}</option>`).join("")}
          </select>
          <button class="btn btn-sm btn-outline-light save-user-role" data-user-id="${user.uid}">Save Role</button>
        </div>
      </div>
    </div>
  `).join("");
  container.querySelectorAll(".save-user-role").forEach((button) => {
    button.addEventListener("click", async () => {
      const uid = button.dataset.userId;
      const roleSelect = container.querySelector(`.user-role-select[data-user-id="${uid}"]`);
      await updateDocFields("users", uid, { role: roleSelect.value });
      alert("User role updated.");
    });
  });
}

async function loadAdminTeams() {
  const teams = await fetchCollection("teams", [orderBy("value", "desc")]);
  const container = document.getElementById("admin-teams");
  if (!container) return;
  container.innerHTML = teams.map((team) => `
    <div class="card bg-dark border-secondary mb-3 p-3">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h3 class="h6 text-white mb-1">${team.region} ${team.name}</h3>
          <p class="text-secondary mb-1">Value: ${team.value || 0} • Record: ${team.wins || 0}-${team.losses || 0}</p>
          <p class="text-secondary mb-0">Owner: ${team.ownerUid || "Unowned"}</p>
        </div>
        <button class="btn btn-sm btn-outline-light set-team-owner" data-team-id="${team.tid}">Set Owner</button>
      </div>
    </div>
  `).join("");
  container.querySelectorAll(".set-team-owner").forEach((button) => {
    button.addEventListener("click", async () => {
      const tid = button.dataset.teamId;
      const newOwner = prompt("Enter owner UID or leave blank to unassign:");
      await updateDocFields("teams", tid, { ownerUid: newOwner || null });
      alert("Team ownership updated.");
      await loadAdminTeams();
    });
  });
}

async function loadAdminAwards() {
  const awards = await fetchCollection("awards", [orderBy("season", "desc")]);
  const container = document.getElementById("admin-awards");
  if (!container) return;
  container.innerHTML = awards.map((award) => `
    <div class="card bg-dark border-secondary mb-3 p-3">
      <h3 class="h6 text-white mb-1">${award.name || award.type}</h3>
      <p class="text-secondary mb-1">Season: ${award.season}</p>
      <p class="text-secondary mb-0">${award.text || award.description || "No details."}</p>
    </div>
  `).join("");
}

async function loadAdminTradeRules() {
  const tradeRules = await fetchDoc("settings", "tradeRules") || {};
  const container = document.getElementById("admin-trade-rules");
  if (!container) return;
  container.innerHTML = `
    <form id="trade-rules-form">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label text-white">Max Trade Assets</label><input class="form-control bg-transparent text-white border-secondary" id="maxTradeAssets" value="${tradeRules.maxTradeAssets || 6}" /></div>
        <div class="col-md-6"><label class="form-label text-white">Salary Difference Limit</label><input class="form-control bg-transparent text-white border-secondary" id="salaryDiffLimit" value="${tradeRules.salaryDiffLimit || 10}" /></div>
      </div>
      <button class="btn btn-primary mt-4" type="submit">Save Trade Rules</button>
    </form>
  `;
  document.getElementById("trade-rules-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveDoc("settings", "tradeRules", {
      maxTradeAssets: Number(document.getElementById("maxTradeAssets").value) || 0,
      salaryDiffLimit: Number(document.getElementById("salaryDiffLimit").value) || 0,
      updatedAt: new Date().toISOString()
    });
    alert("Trade rules saved.");
  });
}

async function loadAdminFacilities() {
  const facilities = await fetchDoc("facilities", "facilitiesConfig") || {};
  const container = document.getElementById("admin-facilities");
  if (!container) return;
  container.innerHTML = `
    <form id="facilities-form">
      <div class="row g-3">
        <div class="col-md-4"><label class="form-label text-white">Practice Center Level</label><input class="form-control bg-transparent text-white border-secondary" id="practiceCenter" value="${facilities.practiceCenter || 1}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Medical Center Level</label><input class="form-control bg-transparent text-white border-secondary" id="medicalCenter" value="${facilities.medicalCenter || 1}" /></div>
        <div class="col-md-4"><label class="form-label text-white">Analytics Department</label><input class="form-control bg-transparent text-white border-secondary" id="analyticsDepartment" value="${facilities.analyticsDepartment || 1}" /></div>
      </div>
      <button class="btn btn-primary mt-4" type="submit">Save Facilities</button>
    </form>
  `;
  document.getElementById("facilities-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveDoc("facilities", "facilitiesConfig", {
      practiceCenter: Number(document.getElementById("practiceCenter").value) || 1,
      medicalCenter: Number(document.getElementById("medicalCenter").value) || 1,
      analyticsDepartment: Number(document.getElementById("analyticsDepartment").value) || 1,
      updatedAt: new Date().toISOString()
    });
    alert("Facilities settings saved.");
  });
}

async function loadAdminSponsors() {
  const sponsors = await fetchCollection("sponsors", [orderBy("name", "asc")]);
  const container = document.getElementById("admin-sponsors");
  if (!container) return;
  container.innerHTML = sponsors.map((sponsor) => `
    <div class="card bg-dark border-secondary mb-3 p-3">
      <h3 class="h6 text-white mb-1">${sponsor.name}</h3>
      <p class="text-secondary mb-1">Industry: ${sponsor.industry || "N/A"}</p>
      <p class="text-secondary mb-0">Value: ${sponsor.value || "N/A"}</p>
    </div>
  `).join("");
}

async function loadAdminFranchisePrices() {
  const prices = await fetchCollection("teams", [orderBy("value", "desc")]);
  const container = document.getElementById("admin-franchise-prices");
  if (!container) return;
  container.innerHTML = prices.map((team) => `
    <div class="card bg-dark border-secondary mb-3 p-3">
      <h3 class="h6 text-white mb-1">${team.region} ${team.name}</h3>
      <p class="text-secondary mb-0">Current franchise price: ${team.value || 0}</p>
    </div>
  `).join("");
}

async function loadAdminNews() {
  const news = await fetchCollection("news", [orderBy("publishedAt", "desc")]);
  const container = document.getElementById("admin-news");
  if (!container) return;
  container.innerHTML = news.map((item) => `
    <div class="card bg-dark border-secondary mb-3 p-3">
      <h3 class="h6 text-white mb-1">${item.headline}</h3>
      <p class="text-secondary mb-1">Category: ${item.category || "News"}</p>
      <p class="text-secondary mb-0">${item.summary || item.description || "No summary."}</p>
    </div>
  `).join("");
}

async function renderHallOfFame() {
  await ensureAuth();
  const players = await fetchCollection("hallOfFame", [orderBy("yearsActive", "desc")]);
  const container = document.getElementById("hof-list");
  if (!container) return;
  container.innerHTML = players.map((entry) => `
    <div class="col-md-6 col-xl-4">
      <div class="card border-secondary">
        <div class="card-body">
          <h3 class="h5 text-white mb-2">${entry.name || entry.pid}</h3>
          <p class="text-secondary mb-1">Championships: ${entry.championships || 0}</p>
          <p class="text-secondary mb-1">MVPs: ${entry.mvps || 0}</p>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderRecords() {
  await ensureAuth();
  const records = await fetchCollection("records", [orderBy("season", "desc")]);
  const container = document.getElementById("records-list");
  if (!container) return;
  container.innerHTML = records.map((record) => `
    <div class="col-md-6">
      <div class="card border-secondary">
        <div class="card-body">
          <h3 class="h5 text-white mb-2">${record.recordName}</h3>
          <p class="text-secondary mb-1">${record.description || "No description"}</p>
          <p class="text-white mb-0">${record.value || "N/A"}</p>
        </div>
      </div>
    </div>
  `).join("");
}

async function renderNews() {
  await ensureAuth();
  const news = await fetchCollection("news", [orderBy("publishedAt", "desc")]);
  const container = document.getElementById("news-list");
  if (!container) return;
  container.innerHTML = news.map((item) => `
    <div class="col-md-6 col-xl-4">
      <div class="card border-secondary">
        <div class="card-body">
          <span class="badge bg-primary mb-2">${item.category || "News"}</span>
          <h3 class="h5 text-white mb-2">${item.headline}</h3>
          <p class="text-secondary mb-0">${item.summary || item.description || "No summary available."}</p>
        </div>
      </div>
    </div>
  `).join("");
}

initializePage().catch((error) => console.error(error));
