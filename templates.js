// Szablony branżowe (Vorlagen). Ceny to przykładowe ceny netto – użytkownik je zmienia.
// type: "arbeit" (robocizna – liczy się do §35a EStG), "material", "sonstiges"
// Żeby dodać nową branżę, dopisz kolejny obiekt do tej listy.
window.VORLAGEN = [
  {
    id: "maler", pl: "Malarz", de: "Maler & Lackierer", items: [
      { name: "Abdecken und Abkleben von Böden, Fenstern und Türen", unit: "pauschal", price: 90, type: "arbeit" },
      { name: "Wandanstrich Dispersion weiß, 2-fach", unit: "m²", price: 8.5, type: "arbeit" },
      { name: "Deckenanstrich Dispersion weiß, 2-fach", unit: "m²", price: 9.5, type: "arbeit" },
      { name: "Tapezieren mit Raufaser inkl. Kleister", unit: "m²", price: 12, type: "arbeit" },
      { name: "Alte Tapeten entfernen", unit: "m²", price: 6, type: "arbeit" },
      { name: "Spachtelarbeiten Qualitätsstufe Q3", unit: "m²", price: 14, type: "arbeit" },
      { name: "Innentür lackieren inkl. Zarge", unit: "Stk", price: 95, type: "arbeit" },
      { name: "Heizkörper lackieren", unit: "Stk", price: 65, type: "arbeit" },
      { name: "Fassadenanstrich Silikonharzfarbe", unit: "m²", price: 22, type: "arbeit" },
      { name: "Arbeitsstunde Maler", unit: "Std", price: 48, type: "arbeit" },
      { name: "Farbe und Verbrauchsmaterial", unit: "pauschal", price: 120, type: "material" },
      { name: "Anfahrt", unit: "pauschal", price: 35, type: "sonstiges" }
    ]
  },
  {
    id: "elektriker", pl: "Elektryk", de: "Elektriker", items: [
      { name: "Steckdose setzen inkl. Unterputzdose", unit: "Stk", price: 45, type: "arbeit" },
      { name: "Lichtschalter setzen", unit: "Stk", price: 40, type: "arbeit" },
      { name: "Leuchte montieren und anschließen", unit: "Stk", price: 55, type: "arbeit" },
      { name: "Leitung NYM-J 3x1,5 verlegen", unit: "m", price: 9, type: "arbeit" },
      { name: "Schlitze stemmen und verputzen", unit: "m", price: 18, type: "arbeit" },
      { name: "Unterverteilung erneuern", unit: "pauschal", price: 950, type: "arbeit" },
      { name: "FI-Schutzschalter einbauen", unit: "Stk", price: 120, type: "arbeit" },
      { name: "E-Check / Prüfung nach DGUV V3", unit: "pauschal", price: 180, type: "arbeit" },
      { name: "Arbeitsstunde Elektriker", unit: "Std", price: 58, type: "arbeit" },
      { name: "Installationsmaterial", unit: "pauschal", price: 80, type: "material" },
      { name: "Anfahrt", unit: "pauschal", price: 35, type: "sonstiges" }
    ]
  },
  {
    id: "sanitaer", pl: "Hydraulik / ogrzewanie", de: "Sanitär & Heizung", items: [
      { name: "WC demontieren und entsorgen", unit: "Stk", price: 80, type: "arbeit" },
      { name: "Wand-WC montieren inkl. Vorwandelement", unit: "Stk", price: 420, type: "arbeit" },
      { name: "Waschtisch montieren inkl. Armatur", unit: "Stk", price: 220, type: "arbeit" },
      { name: "Duschtasse / Duschrinne einbauen", unit: "Stk", price: 390, type: "arbeit" },
      { name: "Armatur austauschen", unit: "Stk", price: 85, type: "arbeit" },
      { name: "Heizkörper tauschen", unit: "Stk", price: 260, type: "arbeit" },
      { name: "Heizungswartung", unit: "pauschal", price: 160, type: "arbeit" },
      { name: "Rohrleitung verlegen", unit: "m", price: 35, type: "arbeit" },
      { name: "Arbeitsstunde Installateur", unit: "Std", price: 60, type: "arbeit" },
      { name: "Material Sanitär", unit: "pauschal", price: 150, type: "material" },
      { name: "Anfahrt", unit: "pauschal", price: 40, type: "sonstiges" }
    ]
  },
  {
    id: "fliesen", pl: "Glazurnik", de: "Fliesenleger", items: [
      { name: "Alte Fliesen abschlagen und entsorgen", unit: "m²", price: 22, type: "arbeit" },
      { name: "Untergrund grundieren", unit: "m²", price: 4, type: "arbeit" },
      { name: "Abdichtung Nassbereich", unit: "m²", price: 28, type: "arbeit" },
      { name: "Wandfliesen verlegen bis 30x60", unit: "m²", price: 55, type: "arbeit" },
      { name: "Bodenfliesen verlegen bis 60x60", unit: "m²", price: 58, type: "arbeit" },
      { name: "Großformat verlegen ab 60x120", unit: "m²", price: 85, type: "arbeit" },
      { name: "Sockelleiste aus Fliesen", unit: "m", price: 14, type: "arbeit" },
      { name: "Silikonfugen erneuern", unit: "m", price: 9, type: "arbeit" },
      { name: "Arbeitsstunde Fliesenleger", unit: "Std", price: 50, type: "arbeit" },
      { name: "Fliesenkleber und Fugenmaterial", unit: "pauschal", price: 140, type: "material" }
    ]
  },
  {
    id: "trockenbau", pl: "Suche zabudowy (G-K)", de: "Trockenbau", items: [
      { name: "Ständerwand GK einfach beplankt, gedämmt", unit: "m²", price: 55, type: "arbeit" },
      { name: "Ständerwand GK doppelt beplankt", unit: "m²", price: 68, type: "arbeit" },
      { name: "Abgehängte Decke GK", unit: "m²", price: 52, type: "arbeit" },
      { name: "Dachschräge dämmen und verkleiden", unit: "m²", price: 65, type: "arbeit" },
      { name: "Türöffnung mit UA-Profil", unit: "Stk", price: 120, type: "arbeit" },
      { name: "Verspachteln Q2", unit: "m²", price: 9, type: "arbeit" },
      { name: "Arbeitsstunde Trockenbauer", unit: "Std", price: 48, type: "arbeit" },
      { name: "Profile, Platten und Dämmung", unit: "pauschal", price: 300, type: "material" }
    ]
  },
  {
    id: "boden", pl: "Podłogi", de: "Bodenleger", items: [
      { name: "Alten Bodenbelag entfernen und entsorgen", unit: "m²", price: 9, type: "arbeit" },
      { name: "Boden ausgleichen / spachteln", unit: "m²", price: 15, type: "arbeit" },
      { name: "Trittschalldämmung verlegen", unit: "m²", price: 4, type: "arbeit" },
      { name: "Laminat verlegen", unit: "m²", price: 18, type: "arbeit" },
      { name: "Vinyl / Designboden verlegen", unit: "m²", price: 22, type: "arbeit" },
      { name: "Parkett verlegen", unit: "m²", price: 32, type: "arbeit" },
      { name: "Sockelleisten montieren", unit: "m", price: 8, type: "arbeit" },
      { name: "Übergangsprofil montieren", unit: "Stk", price: 25, type: "arbeit" },
      { name: "Arbeitsstunde Bodenleger", unit: "Std", price: 46, type: "arbeit" },
      { name: "Kleinmaterial", unit: "pauschal", price: 60, type: "material" }
    ]
  },
  {
    id: "dach", pl: "Dekarz", de: "Dachdecker", items: [
      { name: "Gerüst stellen und abbauen", unit: "m²", price: 12, type: "sonstiges" },
      { name: "Alte Eindeckung abnehmen und entsorgen", unit: "m²", price: 18, type: "arbeit" },
      { name: "Dachlattung erneuern", unit: "m²", price: 16, type: "arbeit" },
      { name: "Unterspannbahn verlegen", unit: "m²", price: 9, type: "arbeit" },
      { name: "Dachziegel eindecken", unit: "m²", price: 45, type: "arbeit" },
      { name: "Dachrinne erneuern", unit: "m", price: 48, type: "arbeit" },
      { name: "Dachreparatur / Ziegel tauschen", unit: "Std", price: 55, type: "arbeit" },
      { name: "Dachfenster einbauen", unit: "Stk", price: 650, type: "arbeit" },
      { name: "Material Dach", unit: "pauschal", price: 400, type: "material" }
    ]
  },
  {
    id: "tischler", pl: "Stolarz", de: "Tischler / Schreiner", items: [
      { name: "Innentür montieren inkl. Zarge", unit: "Stk", price: 180, type: "arbeit" },
      { name: "Einbauschrank nach Maß", unit: "pauschal", price: 1800, type: "arbeit" },
      { name: "Küchenmontage", unit: "lfm", price: 120, type: "arbeit" },
      { name: "Arbeitsplatte zuschneiden und montieren", unit: "Stk", price: 160, type: "arbeit" },
      { name: "Treppe abschleifen und versiegeln", unit: "Stk", price: 45, type: "arbeit" },
      { name: "Möbel montieren", unit: "Std", price: 45, type: "arbeit" },
      { name: "Arbeitsstunde Tischler", unit: "Std", price: 52, type: "arbeit" },
      { name: "Holz und Beschläge", unit: "pauschal", price: 200, type: "material" }
    ]
  },
  {
    id: "maurer", pl: "Murarz / budowlanka", de: "Maurer & Bau", items: [
      { name: "Mauerwerk erstellen", unit: "m²", price: 75, type: "arbeit" },
      { name: "Wand abbrechen und entsorgen", unit: "m²", price: 55, type: "arbeit" },
      { name: "Innenputz Kalkzement", unit: "m²", price: 28, type: "arbeit" },
      { name: "Estrich verlegen", unit: "m²", price: 32, type: "arbeit" },
      { name: "Betonarbeiten", unit: "m³", price: 260, type: "arbeit" },
      { name: "Durchbruch herstellen inkl. Sturz", unit: "Stk", price: 650, type: "arbeit" },
      { name: "Arbeitsstunde Maurer", unit: "Std", price: 50, type: "arbeit" },
      { name: "Baumaterial", unit: "pauschal", price: 300, type: "material" },
      { name: "Container / Entsorgung", unit: "pauschal", price: 450, type: "sonstiges" }
    ]
  },
  {
    id: "garten", pl: "Ogrodnik", de: "Garten- & Landschaftsbau", items: [
      { name: "Rasen mähen inkl. Entsorgung Schnittgut", unit: "m²", price: 0.4, type: "arbeit" },
      { name: "Hecke schneiden", unit: "m", price: 6, type: "arbeit" },
      { name: "Baum fällen", unit: "Stk", price: 350, type: "arbeit" },
      { name: "Pflasterarbeiten inkl. Unterbau", unit: "m²", price: 65, type: "arbeit" },
      { name: "Rollrasen verlegen", unit: "m²", price: 12, type: "arbeit" },
      { name: "Zaun setzen", unit: "m", price: 55, type: "arbeit" },
      { name: "Gartenpflege allgemein", unit: "Std", price: 42, type: "arbeit" },
      { name: "Grünschnitt entsorgen", unit: "m³", price: 45, type: "sonstiges" },
      { name: "Pflanzen und Material", unit: "pauschal", price: 150, type: "material" }
    ]
  },
  {
    id: "reinigung", pl: "Sprzątanie", de: "Gebäudereinigung", items: [
      { name: "Unterhaltsreinigung Büro", unit: "m²", price: 1.8, type: "arbeit" },
      { name: "Treppenhausreinigung", unit: "pauschal", price: 60, type: "arbeit" },
      { name: "Fensterreinigung inkl. Rahmen", unit: "m²", price: 3.5, type: "arbeit" },
      { name: "Bauendreinigung", unit: "m²", price: 4, type: "arbeit" },
      { name: "Grundreinigung Wohnung", unit: "m²", price: 3.5, type: "arbeit" },
      { name: "Teppichreinigung", unit: "m²", price: 5, type: "arbeit" },
      { name: "Arbeitsstunde Reinigung", unit: "Std", price: 32, type: "arbeit" },
      { name: "Reinigungsmittel", unit: "pauschal", price: 25, type: "material" }
    ]
  },
  {
    id: "hausmeister", pl: "Dozorca / Hausmeister", de: "Hausmeisterservice", items: [
      { name: "Hausmeisterservice monatlich", unit: "pauschal", price: 250, type: "arbeit" },
      { name: "Winterdienst pro Einsatz", unit: "pauschal", price: 45, type: "arbeit" },
      { name: "Kleinreparaturen", unit: "Std", price: 40, type: "arbeit" },
      { name: "Mülltonnendienst monatlich", unit: "pauschal", price: 40, type: "arbeit" },
      { name: "Außenanlagenpflege", unit: "Std", price: 38, type: "arbeit" },
      { name: "Material", unit: "pauschal", price: 30, type: "material" }
    ]
  },
  {
    id: "umzug", pl: "Przeprowadzki / transport", de: "Umzug & Transport", items: [
      { name: "Umzugshelfer", unit: "Std", price: 35, type: "arbeit" },
      { name: "Transporter 3,5 t inkl. Fahrer", unit: "Std", price: 65, type: "sonstiges" },
      { name: "Möbel demontieren und montieren", unit: "Std", price: 42, type: "arbeit" },
      { name: "Küche ab- und aufbauen", unit: "pauschal", price: 450, type: "arbeit" },
      { name: "Halteverbotszone einrichten", unit: "pauschal", price: 120, type: "sonstiges" },
      { name: "Fahrtkosten", unit: "km", price: 1.2, type: "sonstiges" },
      { name: "Umzugskartons", unit: "Stk", price: 2.5, type: "material" }
    ]
  },
  {
    id: "entruempelung", pl: "Opróżnianie mieszkań", de: "Entrümpelung & Abriss", items: [
      { name: "Entrümpelung Wohnung", unit: "m³", price: 55, type: "arbeit" },
      { name: "Kellerräumung", unit: "pauschal", price: 350, type: "arbeit" },
      { name: "Demontage Einbauküche", unit: "pauschal", price: 250, type: "arbeit" },
      { name: "Abrissarbeiten innen", unit: "Std", price: 45, type: "arbeit" },
      { name: "Entsorgungskosten Sperrmüll", unit: "m³", price: 40, type: "sonstiges" },
      { name: "Besenreine Übergabe", unit: "pauschal", price: 120, type: "arbeit" }
    ]
  },
  {
    id: "fenster", pl: "Okna i drzwi", de: "Fenster- & Türmontage", items: [
      { name: "Altes Fenster ausbauen und entsorgen", unit: "Stk", price: 60, type: "arbeit" },
      { name: "Fenster einbauen inkl. Abdichtung (RAL)", unit: "Stk", price: 220, type: "arbeit" },
      { name: "Haustür einbauen", unit: "Stk", price: 450, type: "arbeit" },
      { name: "Fensterbank innen montieren", unit: "Stk", price: 45, type: "arbeit" },
      { name: "Rollladen montieren", unit: "Stk", price: 120, type: "arbeit" },
      { name: "Fenster einstellen / warten", unit: "Stk", price: 25, type: "arbeit" },
      { name: "Montagematerial", unit: "pauschal", price: 80, type: "material" }
    ]
  },
  {
    id: "kfz", pl: "Mechanik samochodowy", de: "Kfz-Werkstatt", items: [
      { name: "Inspektion", unit: "pauschal", price: 180, type: "arbeit" },
      { name: "Ölwechsel inkl. Filter", unit: "pauschal", price: 95, type: "arbeit" },
      { name: "Bremsbeläge vorne wechseln", unit: "pauschal", price: 140, type: "arbeit" },
      { name: "Reifenwechsel", unit: "pauschal", price: 40, type: "arbeit" },
      { name: "Fehlerspeicher auslesen", unit: "pauschal", price: 35, type: "arbeit" },
      { name: "Arbeitsstunde Mechaniker", unit: "Std", price: 75, type: "arbeit" },
      { name: "Ersatzteile", unit: "pauschal", price: 100, type: "material" }
    ]
  },
  {
    id: "dienstleistung", pl: "Usługi / freelancer", de: "Dienstleistung allgemein", items: [
      { name: "Beratung", unit: "Std", price: 70, type: "sonstiges" },
      { name: "Projektpauschale", unit: "pauschal", price: 500, type: "sonstiges" },
      { name: "Tagessatz", unit: "Tag", price: 480, type: "sonstiges" },
      { name: "Fahrtkosten", unit: "km", price: 0.3, type: "sonstiges" },
      { name: "Material / Auslagen", unit: "pauschal", price: 50, type: "material" }
    ]
  }
];
