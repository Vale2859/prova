// script.js – utility leggere per la dashboard

// Evidenzia il giorno corrente nel mini calendario
(function highlightToday() {
  const today = new Date();
  const day = today.getDate();
  const monthLabel = document.getElementById("calendar-month");
  if (monthLabel) {
    const formatter = new Intl.DateTimeFormat("it-IT", {
      month: "long",
      year: "numeric",
    });
    monthLabel.textContent =
      formatter.format(today).charAt(0).toUpperCase() +
      formatter.format(today).slice(1);
  }

  const grid = document.querySelectorAll(".calendar-grid span");
  grid.forEach((cell) => {
    if (cell.textContent === String(day)) {
      cell.classList.add("today");
    }
  });
})();

// Esempio: cliccando sulle card-link mostri un alert (puoi sostituire con navigation reale)
document.querySelectorAll(".btn-link").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Qui collegherai questa card al modulo o pagina corrispondente.");
  });
});