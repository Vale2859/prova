// Mappa reparti → elenco procedure (statiche per la demo)
const PROCEDURE_DATA = {
  cassa: {
    title: "Cassa",
    subtitle: "Scontrini, resi, anticipi, errori di battitura.",
    items: [
      {
        name: "Doppio scontrino",
        tag: "Operativo",
        desc: "Cosa fare se è stato emesso uno scontrino doppio al cliente.",
        extra: "Tempo lettura: ~30 secondi"
      },
      {
        name: "Reso con scontrino",
        tag: "Operativo",
        desc: "Passaggi per effettuare un reso con scontrino fiscale presente.",
        extra: "Solo titolare o referente autorizzato."
      },
      {
        name: "Reso senza scontrino",
        tag: "Eccezione",
        desc: "Come gestire la richiesta di reso in assenza di scontrino.",
        extra: "Verifica sempre con titolare."
      },
      {
        name: "Anticipo ricetta",
        tag: "Anticipi",
        desc: "Procedura quando il cliente paga subito e porta la ricetta in un secondo momento.",
        extra: "Registra sempre il nome del medico."
      },
      {
        name: "Errore pagamento POS",
        tag: "POS",
        desc: "Cosa fare se è stato selezionato contanti ma il cliente ha pagato con POS.",
        extra: "Annotare su registro interni."
      },
      {
        name: "Chiusura cassa serale",
        tag: "Routine",
        desc: "Check-list veloce di fine giornata: controlli base sulla cassa.",
        extra: "Tempo lettura: ~1 minuto"
      }
    ]
  },

  banco: {
    title: "Banco",
    subtitle: "Procedure rapide per il lavoro al banco.",
    items: [
      {
        name: "Raccolta dati ricetta dematerializzata",
        tag: "Ricette",
        desc: "Quali dati controllare sempre prima di erogare il farmaco.",
        extra: "Verifica codice fiscale e NRE."
      },
      {
        name: "Consiglio OTC febbre",
        tag: "Consiglio",
        desc: "Schema rapido di domande da fare prima del consiglio.",
        extra: "Richiama sempre il farmacista se dubbio."
      },
      {
        name: "Prodotto non presente a scaffale",
        tag: "Gestione",
        desc: "Come verificare disponibilità e proporre alternativa.",
        extra: "Indica sempre tempi di arrivo."
      }
    ]
  },

  magazzino: {
    title: "Magazzino",
    subtitle: "Movimenti interni, scorte e controlli di base.",
    items: [
      {
        name: "Controllo scadenze mensile",
        tag: "Scadenze",
        desc: "Giro di controllo da fare mensilmente sugli scaffali interni.",
        extra: "Segna i prodotti critici su registro."
      },
      {
        name: "Prodotto mancante a scaffale",
        tag: "Rifornimento",
        desc: "Cosa fare quando un prodotto è terminato in esposizione.",
        extra: "Regola: mai scaffale vuoto."
      },
      {
        name: "Gestione merce rotta",
        tag: "Eccezioni",
        desc: "Come gestire i prodotti arrivati danneggiati.",
        extra: "Foto + nota per titolare."
      }
    ]
  },

  servizi: {
    title: "Servizi",
    subtitle: "ECG, holter, CUP e servizi di telemedicina.",
    items: [
      {
        name: "Prenotazione ECG",
        tag: "Servizio",
        desc: "Come registrare una prenotazione ECG con dati minimi del paziente.",
        extra: "Conferma sempre telefono di contatto."
      },
      {
        name: "Consegna referto",
        tag: "Referti",
        desc: "Modalità di consegna referto al cliente e archiviazione copia.",
        extra: "Valutare anche invio digitale sicuro."
      },
      {
        name: "Disdetta appuntamento",
        tag: "Agenda",
        desc: "Come segnare una disdetta per liberare lo slot.",
        extra: "Se possibile, avvisa via telefono."
      }
    ]
  },

  sicurezza: {
    title: "Sicurezza",
    subtitle: "Procedure obbligatorie e di tutela.",
    items: [
      {
        name: "Infortunio in farmacia",
        tag: "Emergenza",
        desc: "Primi passi da seguire in caso di infortunio di cliente o dipendente.",
        extra: "Avvisa sempre titolare."
      },
      {
        name: "Gestione furto sospetto",
        tag: "Protocollo",
        desc: "Cosa fare in caso di sospetto furto senza mettersi in pericolo.",
        extra: "Niente azioni personali rischiose."
      }
    ]
  },

  altro: {
    title: "Altro",
    subtitle: "Procedure varie di utilizzo interno.",
    items: [
      {
        name: "Uso portale interno",
        tag: "Portale",
        desc: "Linee guida per utilizzare correttamente il portale farmacia.",
        extra: "Ogni accesso viene registrato."
      },
      {
        name: "Comunicazioni al titolare",
        tag: "Interno",
        desc: "Come inviare comunicazioni ordinate al titolare.",
        extra: "Evita WhatsApp sparsi."
      }
    ]
  }
};

// ELEMENTI BASE
const viewReparti = document.getElementById("viewReparti");
const viewProcedure = document.getElementById("viewProcedure");
const btnBackReparti = document.getElementById("btnBackReparti");
const proceduresTitle = document.getElementById("proceduresTitle");
const proceduresSubtitle = document.getElementById("proceduresSubtitle");
const procedureList = document.getElementById("procedureList");

// Gestione click sui reparti
document.querySelectorAll(".reparto-card").forEach(card => {
  card.addEventListener("click", () => {
    const repartoKey = card.dataset.reparto;
    openReparto(repartoKey);
  });
});

// Torna ai reparti principali
btnBackReparti.addEventListener("click", () => {
  viewProcedure.classList.remove("active");
  viewReparti.classList.add("active");
  procedureList.innerHTML = "";
});

// Funzione per "aprire" un reparto
function openReparto(key) {
  const data = PROCEDURE_DATA[key];
  if (!data) return;

  // Aggiorna titoli
  proceduresTitle.textContent = data.title;
  proceduresSubtitle.textContent = data.subtitle || "Procedura reparto selezionato.";

  // Pulisce lista
  procedureList.innerHTML = "";

  // Crea card procedure
  data.items.forEach(item => {
    const card = document.createElement("article");
    card.className = "procedure-card";

    card.innerHTML = `
      <div class="procedure-card-header">
        <div class="procedure-name">${item.name}</div>
        <div class="procedure-tag">${item.tag}</div>
      </div>
      <p class="procedure-desc">${item.desc}</p>
      <p class="procedure-chip">${item.extra || ""}</p>
    `;

    procedureList.appendChild(card);
  });

  // Mostra vista procedure
  viewReparti.classList.remove("active");
  viewProcedure.classList.add("active");
}
