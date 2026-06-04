const loginForm = document.getElementById('login-form');
const dashboardPanel = document.getElementById('dashboard-panel');
const loginPanel = document.getElementById('login-panel');
const logoutButton = document.getElementById('logout-button');
const teamCount = document.getElementById('team-count');
const teamsBody = document.getElementById('teams-body');
const searchInput = document.getElementById('search-input');
const teamDetail = document.getElementById('team-detail');
const detailContent = document.getElementById('detail-content');

let authToken = localStorage.getItem('eventAdminToken');

function showDashboard() {
  loginPanel.classList.add('hidden');
  dashboardPanel.classList.remove('hidden');
  fetchTeams();
}

function hideDashboard() {
  loginPanel.classList.remove('hidden');
  dashboardPanel.classList.add('hidden');
  teamDetail.classList.add('hidden');
}

async function fetchTeams(query = '') {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  const response = await fetch(`/api/teams${params}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      alert('Sesión expirada. Inicia sesión nuevamente.');
      logout();
      return;
    }
    alert(data.message || 'No se pudieron obtener los equipos.');
    return;
  }

  teamCount.textContent = data.total;
  teamsBody.innerHTML = data.teams.map(team => `
    <tr>
      <td>${team.teamName}</td>
      <td>${team.delegateName}</td>
      <td>${team.contactNumber}</td>
      <td>
        <button class="button button-secondary" data-id="${team.id}" data-action="view">Ver</button>
        <a class="button button-primary" href="/api/report/${team.id}" target="_blank">PDF</a>
      </td>
    </tr>
  `).join('');
}

async function showTeamDetail(teamId) {
  const response = await fetch(`/api/teams/${teamId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const data = await response.json();
  if (!response.ok) {
    alert(data.message || 'Error al obtener el detalle del equipo.');
    return;
  }

  const { team } = data;
  detailContent.innerHTML = `
    <div class="detail-list">
      <div><strong>Equipo:</strong> ${team.teamName}</div>
      <div><strong>Delegado:</strong> ${team.delegateName}</div>
      <div><strong>Contacto:</strong> ${team.contactNumber}</div>
      <div><strong>Registrado:</strong> ${new Date(team.createdAt).toLocaleString()}</div>
      <div><strong>Jugadores titulares:</strong><br>${team.players.map((player, i) => `${i + 1}. ${player}`).join('<br>')}</div>
      <div><strong>Jugadores suplentes:</strong><br>${team.substitutes.map((player, i) => `${i + 1}. ${player}`).join('<br>')}</div>
    </div>
  `;
  teamDetail.classList.remove('hidden');
}

function logout() {
  authToken = null;
  localStorage.removeItem('eventAdminToken');
  hideDashboard();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = {
    username: formData.get('username').trim(),
    password: formData.get('password').trim()
  };

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok) {
    alert(result.message || 'Credenciales inválidas.');
    return;
  }

  authToken = result.token;
  localStorage.setItem('eventAdminToken', authToken);
  showDashboard();
});

logoutButton.addEventListener('click', () => logout());
searchInput.addEventListener('input', () => fetchTeams(searchInput.value.trim()));

teamsBody.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const teamId = button.dataset.id;
  if (button.dataset.action === 'view') {
    showTeamDetail(teamId);
  }
});

if (authToken) {
  showDashboard();
}
