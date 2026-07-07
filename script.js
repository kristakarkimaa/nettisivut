/**
 * Merkitystä työhön – etusivun JavaScript
 * Hoitaa mobiilivalikon, scroll-efektit ja lomakkeen tarkistuksen.
 */

// --- MOBIILIVALIKKO ---

const valikkoNappi = document.getElementById("valikkoNappi");
const navigaatio = document.getElementById("navigaatio");
const navLinkit = navigaatio.querySelectorAll("a");

// Avaa tai sulje valikko nappia painamalla
valikkoNappi.addEventListener("click", () => {
  const onAuki = navigaatio.classList.toggle("navigaatio--auki");
  valikkoNappi.classList.toggle("valikko-nappi--auki", onAuki);
  valikkoNappi.setAttribute("aria-expanded", onAuki);
});

// Sulje valikko kun käyttäjä klikkaa linkkiä
navLinkit.forEach((linkki) => {
  linkki.addEventListener("click", () => {
    navigaatio.classList.remove("navigaatio--auki");
    valikkoNappi.classList.remove("valikko-nappi--auki");
    valikkoNappi.setAttribute("aria-expanded", "false");
  });
});

// --- YLÄVALIKON VARJO SCROLLATessa ---

const ylavalikko = document.getElementById("ylavalikko");

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    ylavalikko.classList.add("ylavalikko--varjostettu");
  } else {
    ylavalikko.classList.remove("ylavalikko--varjostettu");
  }
});

// --- Hyotykorttien kaanto  ---

document.querySelectorAll(".hyoty-kortti").forEach((kortti) => {

  kortti.tabIndex = 0;

  kortti.addEventListener("click", () => {
      kortti.classList.toggle("hyoty-kortti--auki");
  });

  kortti.addEventListener("keydown", (e) => {

      if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          kortti.classList.toggle("hyoty-kortti--auki");
      }

  });

});

// --- AKTIIVINEN VALIKKOLINKKI ---

const osiot = document.querySelectorAll("section[id]");

function paivitaAktiivinenLinkki() {
  const scrollKohta = window.scrollY + 120;

  let aktiivinenId = "etusivu";

  osiot.forEach((osio) => {
    if (osio.offsetTop <= scrollKohta) {
      aktiivinenId = osio.id;
    }
  });

  navLinkit.forEach((linkki) => {
    const kohde = linkki.getAttribute("href").replace("#", "");
    linkki.classList.toggle("nav-linkki--aktiivinen", kohde === aktiivinenId);
  });
}

window.addEventListener("scroll", paivitaAktiivinenLinkki);
paivitaAktiivinenLinkki();

// --- YHTEYDENOTTOLOMAKE (Formspree) ---

const FORMSPREE_URL = "https://formspree.io/f/mgoblldb";

const lomake = document.getElementById("yhteysLomake");
const lomakeViesti = document.getElementById("lomakeViesti");

const kentat = {
  nimi: {
    elementti: document.getElementById("nimi"),
    virhe: document.getElementById("nimiVirhe"),
    tarkista: (arvo) => arvo.trim().length >= 2,
    virheTeksti: "Kirjoita nimesi (vähintään 2 merkkiä).",
  },
  sahkoposti: {
    elementti: document.getElementById("sahkoposti"),
    virhe: document.getElementById("sahkopostiVirhe"),
    tarkista: (arvo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(arvo),
    virheTeksti: "Anna kelvollinen sähköpostiosoite.",
  },
  viesti: {
    elementti: document.getElementById("viesti"),
    virhe: document.getElementById("viestiVirhe"),
    tarkista: (arvo) => arvo.trim().length >= 10,
    virheTeksti: "Kirjoita viesti (vähintään 10 merkkiä).",
  },
};

function tarkistaKentta(avain) {
  const kentta = kentat[avain];
  const arvo = kentta.elementti.value;
  const onOk = kentta.tarkista(arvo);

  kentta.elementti.classList.toggle("virhe", !onOk);
  kentta.virhe.textContent = onOk ? "" : kentta.virheTeksti;

  return onOk;
}

// Tarkista kenttä heti kun käyttäjä poistuu siitä
Object.keys(kentat).forEach((avain) => {
  kentat[avain].elementti.addEventListener("blur", () => tarkistaKentta(avain));
});

const lahetaNappi = document.getElementById("lahetaNappi");

lomake.addEventListener("submit", async (tapahtuma) => {
  tapahtuma.preventDefault();

  const kaikkiOk = Object.keys(kentat).every((avain) => tarkistaKentta(avain));

  if (!kaikkiOk) {
    lomakeViesti.textContent = "Tarkista lomakkeen kentät.";
    lomakeViesti.className = "lomake-viesti lomake-viesti--virhe";
    return;
  }

  lahetaNappi.disabled = true;
  lahetaNappi.textContent = "Lähetetään...";
  lomakeViesti.textContent = "";

  const endpoint = lomake.getAttribute("action") || FORMSPREE_URL;

  try {
    const vastaus = await fetch(endpoint, {
      method: "POST",
      body: new FormData(lomake),
      headers: { Accept: "application/json" },
    });

    const data = await vastaus.json();

    if (!vastaus.ok) {
      const formspreeVirhe = data.errors
        ?.map((e) => e.message)
        .join(" ");
      throw new Error(formspreeVirhe || "Lähetys epäonnistui");
    }

    lomakeViesti.textContent = "Kiitos viestistäsi! Otan sinuun yhteyttä pian.";
    lomakeViesti.className = "lomake-viesti lomake-viesti--onnistui";
    lomake.reset();

    Object.values(kentat).forEach((kentta) => {
      kentta.elementti.classList.remove("virhe");
      kentta.virhe.textContent = "";
    });
  } catch (virhe) {
    const viesti = virhe instanceof Error && virhe.message !== "Failed to fetch"
      ? virhe.message
      : "Lähetys epäonnistui. Yritä uudelleen tai lähetä sähköpostia osoitteeseen krista.karkimaa@gmail.com.";
    lomakeViesti.textContent = viesti;
    lomakeViesti.className = "lomake-viesti lomake-viesti--virhe";
  } finally {
    lahetaNappi.disabled = false;
    lahetaNappi.textContent = "Lähetä viesti";
  }
});
