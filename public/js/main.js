const STORAGE_KEY = "futbolTeams";
const ADMIN_USER = "admin";
const ADMIN_PASS = "Futbol2026";
let currentTeam = null;

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "register") {
    initRegisterPage();
  }
  if (page === "admin") {
    initAdminPage();
  }
});

function getTeams() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveTeams(teams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

function initRegisterPage() {
  const registerForm = document.getElementById("registerForm");
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const team = {
      id: Date.now().toString(),
      teamName: formData.get("teamName").trim(),
      delegateName: formData.get("delegateName").trim(),
      contactNumber: formData.get("contactNumber").trim(),
      category: formData.get("category"),
      players: [
        formData.get("player1").trim(),
        formData.get("player2").trim(),
        formData.get("player3").trim(),
        formData.get("player4").trim(),
        formData.get("player5").trim(),
        formData.get("player6").trim()
      ],
      substitutes: [
        formData.get("substitute1").trim(),
        formData.get("substitute2").trim()
      ],
      date: new Date().toISOString()
    };

    if (!team.teamName || !team.delegateName || !team.contactNumber || team.players.some((p) => !p) || team.substitutes.some((p) => !p)) {
      showMessage("Por favor completa todos los campos antes de enviar la inscripción.", "error", "registerMessage");
      return;
    }

    const teams = getTeams();
    teams.push(team);
    saveTeams(teams);
    registerForm.reset();
    showMessage("¡Inscripción recibida con éxito! El equipo ha sido registrado.", "success", "registerMessage");
  });
}

function initAdminPage() {
  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminLogoutButton = document.getElementById("adminLogoutButton");
  const searchTeam = document.getElementById("searchTeam");
  const resetSearchButton = document.getElementById("resetSearchButton");
  const closeDetailsButton = document.getElementById("closeDetailsButton");
  const printPdfButton = document.getElementById("printPdfButton");

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem("adminLogged", "true");
        renderAdminDashboard();
        showAdminDashboard();
      } else {
        showMessage("Usuario o contraseña incorrectos.", "error", "adminLoginMessage");
      }
    });
  }

  if (adminLogoutButton) {
    adminLogoutButton.addEventListener("click", () => {
      sessionStorage.removeItem("adminLogged");
      currentTeam = null;
      showAdminLogin();
    });
  }

  if (searchTeam) {
    searchTeam.addEventListener("input", () => {
      renderAdminDashboard();
    });
  }

  if (resetSearchButton) {
    resetSearchButton.addEventListener("click", () => {
      const searchTeamInput = document.getElementById("searchTeam");
      if (searchTeamInput) {
        searchTeamInput.value = "";
        renderAdminDashboard();
      }
    });
  }

  if (closeDetailsButton) {
    closeDetailsButton.addEventListener("click", closeTeamDetails);
  }

  if (printPdfButton) {
    printPdfButton.addEventListener("click", () => {
      if (currentTeam) {
        generatePDF(currentTeam);
      }
    });
  }

  if (sessionStorage.getItem("adminLogged") === "true") {
    renderAdminDashboard();
    showAdminDashboard();
  } else {
    showAdminLogin();
  }
}

function showMessage(message, type = "success", targetId = "registerMessage") {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.textContent = message;
  target.classList.remove("hidden");
  target.style.borderColor = type === "error" ? "rgba(255, 60, 60, 0.35)" : "rgba(247, 179, 43, 0.26)";
  target.style.background = type === "error" ? "rgba(255, 60, 60, 0.12)" : "rgba(247, 179, 43, 0.16)";
  target.style.color = type === "error" ? "#ffdede" : "#f9f0d7";
  setTimeout(() => {
    target.classList.add("hidden");
  }, 5000);
}

function showAdminLogin() {
  const loginCard = document.getElementById("adminLoginCard");
  const dashboardCard = document.getElementById("adminDashboardCard");
  const tableCard = document.getElementById("teamTableCard");
  const detailsCard = document.getElementById("teamDetailsCard");
  if (loginCard) loginCard.classList.remove("hidden");
  if (dashboardCard) dashboardCard.classList.add("hidden");
  if (tableCard) tableCard.classList.add("hidden");
  if (detailsCard) detailsCard.classList.add("hidden");
}

function showAdminDashboard() {
  const loginCard = document.getElementById("adminLoginCard");
  const dashboardCard = document.getElementById("adminDashboardCard");
  const tableCard = document.getElementById("teamTableCard");
  if (loginCard) loginCard.classList.add("hidden");
  if (dashboardCard) dashboardCard.classList.remove("hidden");
  if (tableCard) tableCard.classList.remove("hidden");
}

function renderAdminDashboard() {
  const teams = getTeams();
  const searchValue = document.getElementById("searchTeam")?.value.trim().toLowerCase() || "";
  const filtered = searchValue
    ? teams.filter((team) => team.teamName.toLowerCase().includes(searchValue))
    : teams;
  const teamTotal = document.getElementById("teamTotal");
  const teamTableBody = document.getElementById("teamTableBody");

  if (teamTotal) {
    teamTotal.textContent = teams.length.toString();
  }

  if (!teamTableBody) return;
  if (filtered.length === 0) {
    teamTableBody.innerHTML = `<tr><td colspan="5">No se encontraron equipos.</td></tr>`;
    return;
  }

  teamTableBody.innerHTML = filtered
    .map((team) => {
      return `
        <tr>
          <td>${team.teamName}</td>
          <td>${team.category}</td>
          <td>${team.delegateName}</td>
          <td>${team.contactNumber}</td>
          <td class="actions-cell">
            <button class="link-button" type="button" onclick="viewTeam('${team.id}')">Ver ficha</button>
            <button class="link-button" type="button" onclick="generatePDFById('${team.id}')">PDF</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function viewTeam(id) {
  const teams = getTeams();
  const team = teams.find((item) => item.id === id);
  if (!team) return;
  currentTeam = team;
  document.getElementById("detailTeamName").textContent = `Ficha de equipo: ${team.teamName}`;
  document.getElementById("detailCategory").textContent = team.category;
  document.getElementById("detailDelegate").textContent = team.delegateName;
  document.getElementById("detailContact").textContent = team.contactNumber;
  document.getElementById("detailDate").textContent = formatDate(team.date);

  const playersList = document.getElementById("detailPlayers");
  const substitutesList = document.getElementById("detailSubstitutes");
  playersList.innerHTML = team.players.map((player, index) => `<li><span>${index + 1}.</span>${player}</li>`).join("");
  substitutesList.innerHTML = team.substitutes.map((player, index) => `<li><span>${index + 1}.</span>${player}</li>`).join("");

  document.getElementById("teamDetailsCard").classList.remove("hidden");
}

function generatePDFById(id) {
  const teams = getTeams();
  const team = teams.find((item) => item.id === id);
  if (!team) return;
  generatePDF(team);
}

function closeTeamDetails() {
  const detailsCard = document.getElementById("teamDetailsCard");
  if (detailsCard) detailsCard.classList.add("hidden");
  currentTeam = null;
}

function generatePDF(team) {
  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(22);
    doc.text("Ficha de Inscripción", 40, 60);
    doc.setFontSize(12);
    doc.text(`Equipo: ${team.teamName}`, 40, 110);
    doc.text(`Categoría: ${team.category}`, 40, 130);
    doc.text(`Delegado: ${team.delegateName}`, 40, 150);
    doc.text(`Contacto: ${team.contactNumber}`, 40, 170);
    doc.text(`Registrado: ${formatDate(team.date)}`, 40, 190);
    doc.setFontSize(16);
    doc.text("Jugadores titulares", 40, 230);
    doc.setFontSize(12);
    team.players.forEach((player, index) => {
      doc.text(`${index + 1}. ${player}`, 40, 250 + index * 18);
    });
    const baseY = 250 + team.players.length * 18 + 20;
    doc.setFontSize(16);
    doc.text("Jugadores suplentes", 40, baseY);
    doc.setFontSize(12);
    team.substitutes.forEach((player, index) => {
      doc.text(`${index + 1}. ${player}`, 40, baseY + 22 + index * 18);
    });
    const filename = `${team.teamName.replace(/\s+/g, "_")}_inscripcion.pdf`;
    doc.save(filename);
  } else {
    openPrintWindow(team);
  }
}

function openPrintWindow(team) {
  const html = `<!DOCTYPE html><html><head><title>Ficha de Inscripción</title><style>body{font-family:sans-serif;padding:40px;color:#111;}h1{margin-bottom:20px;}p{margin:6px 0;}ul{padding-left:18px;}li{margin:4px 0;}</style></head><body><h1>Ficha de Inscripción</h1><p><strong>Equipo:</strong> ${team.teamName}</p><p><strong>Categoría:</strong> ${team.category}</p><p><strong>Delegado:</strong> ${team.delegateName}</p><p><strong>Contacto:</strong> ${team.contactNumber}</p><p><strong>Registrado:</strong> ${formatDate(team.date)}</p><h2>Jugadores titulares</h2><ul>${team.players.map((player, index) => `<li>${index + 1}. ${player}</li>`).join("")}</ul><h2>Jugadores suplentes</h2><ul>${team.substitutes.map((player, index) => `<li>${index + 1}. ${player}</li>`).join("")}</ul></body></html>`;
  const newWindow = window.open("", "_blank");
  if (!newWindow) return;
  newWindow.document.write(html);
  newWindow.document.close();
  newWindow.focus();
  setTimeout(() => {
    newWindow.print();
  }, 500);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }
  return date.toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
