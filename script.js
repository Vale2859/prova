// script.js

document.addEventListener("DOMContentLoaded", () => {
  evidenziaOggiCalendario();
  popolaDatiDashboard();
});

/* Evidenzia il giorno di oggi nel mini calendario */
function evidenziaOggiCalendario() {
  const oggi = new Date();
  const giorno = oggi.getDate().toString();

  const celle = document.querySelectorAll(".calendar-grid span");
  celle.forEach((cell) => {
    if (cell.textContent.trim() === giorno) {
      cell.classList.add("today");
    }
  });
}

/* Dati demo super sintetici – solo per farti “sentire” come sarà */
function popolaDatiDashboard() {
  // TURNO / APPOGGIO
  const turnoMain = document.getElementById("turno-main");
  const turnoAppoggio = document.getElementById("turno-appoggio");

  if (turnoMain) {
    turnoMain.innerHTML =
      "Farmacia Montesano di turno oggi – in servizio fino alle <strong>08:00</strong> di domani.";
  }
  if (turnoAppoggio) {
    turnoAppoggio.innerHTML =
      "Farmacia Centrale in appoggio – fasce attive <strong>08:30 – 20:30</strong>.";
  }

  // ASSENTI OGGI
  const assentiList = document.getElementById("assenti-list");
  if (assentiList) {
    const assentiOggi = [
      { nome: "Fazzino", tipo: "Ferie", dal: "28/11", al: "30/11" },
      { nome: "Daniela", tipo: "Permesso", dal: "28/11", al: "28/11" }
    ];

    if (assentiOggi.length === 0) {
      assentiList.innerHTML = "<li>Nessun assente registrato oggi.</li>";
    } else {
      assentiList.innerHTML = "";
      assentiOggi.forEach((a) => {
        const li = document.createElement("li");
        li.textContent = `${a.nome} – ${a.tipo} (${a.dal} → ${a.al})`;
        assentiList.appendChild(li);
      });
    }
  }

  // CONSEGNE / RITIRI
  const consegneInfo = document.getElementById("consegne-info");
  if (consegneInfo) {
    consegneInfo.innerHTML =
      "<strong>2</strong> consegne e <strong>1</strong> ritiro programmati oggi.";
  }

  // SCADENZE
  const scadenzeInfo = document.getElementById("scadenze-info");
  if (scadenzeInfo) {
    scadenzeInfo.innerHTML =
      "<strong>6</strong> articoli in scadenza entro <strong>7 giorni</strong>.";
  }

  // CONSUMABILI
  const consumabiliInfo = document.getElementById("consumabili-info");
  if (consumabiliInfo) {
    consumabiliInfo.innerHTML =
      "Disponibilità sufficiente per le prossime <strong>2 settimane</strong>.";
  }

  // APPUNTAMENTI CLIENTI DI OGGI
  const clientiList = document.getElementById("clienti-list");
  if (clientiList) {
    const appuntamenti = [
      { ora: "09:30", nome: "Rossi Mario", tipo: "ECG" },
      { ora: "10:15", nome: "Bianchi Anna", tipo: "Autoanalisi" },
      { ora: "11:45", nome: "Verdi Luca", tipo: "Holter pressorio" }
    ];

    clientiList.innerHTML = "";
    appuntamenti.forEach((a) => {
      const li = document.createElement("li");
      li.textContent = `${a.ora} – ${a.nome} (${a.tipo})`;
      clientiList.appendChild(li);
    });
  }

  // COMUNICAZIONI
  const comunicazioniInfo = document.getElementById("comunicazioni-info");
  const badgeCom = document.getElementById("badge-comunicazioni");
  if (comunicazioniInfo) {
    comunicazioniInfo.textContent =
      "1 comunicazione interna non letta (aggiornamento gestione turni notturni).";
  }
  if (badgeCom) {
    badgeCom.textContent = "1 NUOVO";
  }

  // CAMBIO CASSA
  const cassaInfo = document.getElementById("cassa-info");
  if (cassaInfo) {
    cassaInfo.innerHTML =
      "Ultimo cambio cassa registrato alle <strong>14:22</strong>.";
  }

  // LOGISTICA
  const logisticaInfo = document.getElementById("logistica-info");
  if (logisticaInfo) {
    logisticaInfo.innerHTML =
      "Oggi previsti <strong>BRT 11:00</strong> e <strong>GLS 15:00</strong>.";
  }
}
