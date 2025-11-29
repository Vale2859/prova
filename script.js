/* ===== MENU MOBILE ===== */
function toggleMenu() {
  document.getElementById("sideMenu").classList.toggle("hidden");
}

/* ===== PAGINE (placeholders) ===== */
function showSection(page) {
  alert("Apertura sezione: " + page);
}

const assenzePage = "Assenze";
const turniPage = "Farmacia di turno";
const comunicazioniPage = "Comunicazioni";
const procedurePage = "Procedure";
const logisticaPage = "Logistica";
const magazzinoPage = "Magazziniera";
const archivioPage = "Archivio file";

/* ===== FAB (Floating Action Button) ===== */
const fabMain = document.getElementById("fabMain");
const fabMenu = document.getElementById("fabMenu");

fabMain.addEventListener("click", () => {
  fabMenu.classList.toggle("hidden");
});

document.querySelectorAll(".fab-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;

    if (action === "assenza") showSection(assenzePage);
    if (action === "comunicazione") showSection(comunicazioniPage);
    if (action === "procedura") showSection(procedurePage);
    if (action === "file") showSection(archivioPage);
    if (action === "segnalazione") alert("Segnalazione (demo)");

    fabMenu.classList.add("hidden");
  });
});
