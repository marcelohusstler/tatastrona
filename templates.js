// Szablony branżowe (Vorlagen) w 3 językach. Ceny to PRZYKŁADOWE ceny netto – użytkownik ustawia własne.
// Format pozycji: [niemiecki, polski, angielski, jednostka, cena netto, rodzaj]
// rodzaj: "arbeit" (robocizna – §35a EStG), "material", "sonstiges"
// Żeby dodać nową branżę, dopisz kolejny obiekt do listy.
window.VORLAGEN = [
  { id: 'maler', name: { pl: 'Malarz', de: 'Maler & Lackierer', en: 'Painter & decorator' }, icon: '🎨', items: [
    ['Abdecken und Abkleben von Böden, Fenstern und Türen', 'Zabezpieczenie i oklejenie podłóg, okien i drzwi', 'Covering and masking floors, windows and doors', 'pauschal', 90, 'arbeit'],
    ['Wandanstrich Dispersion weiß, 2-fach', 'Malowanie ścian farbą dyspersyjną białą, 2 warstwy', 'Wall painting, white emulsion, 2 coats', 'm²', 8.5, 'arbeit'],
    ['Deckenanstrich Dispersion weiß, 2-fach', 'Malowanie sufitu farbą dyspersyjną białą, 2 warstwy', 'Ceiling painting, white emulsion, 2 coats', 'm²', 9.5, 'arbeit'],
    ['Tapezieren mit Raufaser inkl. Kleister', 'Tapetowanie tapetą Raufaser z klejem', 'Wallpapering with woodchip paper incl. paste', 'm²', 12, 'arbeit'],
    ['Alte Tapeten entfernen', 'Usunięcie starych tapet', 'Removing old wallpaper', 'm²', 6, 'arbeit'],
    ['Spachtelarbeiten Qualitätsstufe Q3', 'Szpachlowanie, standard Q3', 'Filling and skimming, quality level Q3', 'm²', 14, 'arbeit'],
    ['Innentür lackieren inkl. Zarge', 'Lakierowanie drzwi wewnętrznych z ościeżnicą', 'Painting interior door incl. frame', 'Stk', 95, 'arbeit'],
    ['Heizkörper lackieren', 'Lakierowanie grzejnika', 'Painting radiator', 'Stk', 65, 'arbeit'],
    ['Fassadenanstrich Silikonharzfarbe', 'Malowanie elewacji farbą silikonową', 'Facade painting, silicone resin paint', 'm²', 22, 'arbeit'],
    ['Arbeitsstunde Maler', 'Roboczogodzina malarza', 'Painter labour hour', 'Std', 48, 'arbeit'],
    ['Farbe und Verbrauchsmaterial', 'Farba i materiały eksploatacyjne', 'Paint and consumables', 'pauschal', 120, 'material'],
    ['Anfahrt', 'Dojazd', 'Travel costs', 'pauschal', 35, 'sonstiges']
  ] },
  { id: 'elektriker', name: { pl: 'Elektryk', de: 'Elektriker', en: 'Electrician' }, icon: '⚡', items: [
    ['Steckdose setzen inkl. Unterputzdose', 'Montaż gniazdka z puszką podtynkową', 'Installing socket incl. flush box', 'Stk', 45, 'arbeit'],
    ['Lichtschalter setzen', 'Montaż włącznika światła', 'Installing light switch', 'Stk', 40, 'arbeit'],
    ['Leuchte montieren und anschließen', 'Montaż i podłączenie lampy', 'Mounting and connecting light fitting', 'Stk', 55, 'arbeit'],
    ['Leitung NYM-J 3x1,5 verlegen', 'Ułożenie przewodu NYM-J 3x1,5', 'Laying cable NYM-J 3x1.5', 'm', 9, 'arbeit'],
    ['Schlitze stemmen und verputzen', 'Wykucie i zatynkowanie bruzd', 'Cutting and plastering wall chases', 'm', 18, 'arbeit'],
    ['Unterverteilung erneuern', 'Wymiana rozdzielnicy', 'Replacing distribution board', 'pauschal', 950, 'arbeit'],
    ['FI-Schutzschalter einbauen', 'Montaż wyłącznika różnicowoprądowego', 'Installing RCD', 'Stk', 120, 'arbeit'],
    ['E-Check / Prüfung nach DGUV V3', 'Przegląd instalacji (DGUV V3)', 'Electrical inspection (DGUV V3)', 'pauschal', 180, 'arbeit'],
    ['Arbeitsstunde Elektriker', 'Roboczogodzina elektryka', 'Electrician labour hour', 'Std', 58, 'arbeit'],
    ['Installationsmaterial', 'Materiał instalacyjny', 'Installation material', 'pauschal', 80, 'material'],
    ['Anfahrt', 'Dojazd', 'Travel costs', 'pauschal', 35, 'sonstiges']
  ] },
  { id: 'sanitaer', name: { pl: 'Hydraulik / ogrzewanie', de: 'Sanitär & Heizung', en: 'Plumbing & heating' }, icon: '🚿', items: [
    ['WC demontieren und entsorgen', 'Demontaż i utylizacja WC', 'Removing and disposing of toilet', 'Stk', 80, 'arbeit'],
    ['Wand-WC montieren inkl. Vorwandelement', 'Montaż WC podwieszanego ze stelażem', 'Installing wall-hung toilet incl. frame', 'Stk', 420, 'arbeit'],
    ['Waschtisch montieren inkl. Armatur', 'Montaż umywalki z baterią', 'Installing washbasin incl. tap', 'Stk', 220, 'arbeit'],
    ['Duschtasse / Duschrinne einbauen', 'Montaż brodzika / odpływu liniowego', 'Installing shower tray / drain', 'Stk', 390, 'arbeit'],
    ['Armatur austauschen', 'Wymiana baterii', 'Replacing tap', 'Stk', 85, 'arbeit'],
    ['Heizkörper tauschen', 'Wymiana grzejnika', 'Replacing radiator', 'Stk', 260, 'arbeit'],
    ['Heizungswartung', 'Serwis ogrzewania', 'Heating maintenance', 'pauschal', 160, 'arbeit'],
    ['Rohrleitung verlegen', 'Ułożenie rur', 'Laying pipework', 'm', 35, 'arbeit'],
    ['Arbeitsstunde Installateur', 'Roboczogodzina hydraulika', 'Plumber labour hour', 'Std', 60, 'arbeit'],
    ['Material Sanitär', 'Materiał hydrauliczny', 'Plumbing material', 'pauschal', 150, 'material'],
    ['Anfahrt', 'Dojazd', 'Travel costs', 'pauschal', 40, 'sonstiges']
  ] },
  { id: 'fliesen', name: { pl: 'Glazurnik', de: 'Fliesenleger', en: 'Tiler' }, icon: '🧱', items: [
    ['Alte Fliesen abschlagen und entsorgen', 'Skucie i utylizacja starych płytek', 'Removing and disposing of old tiles', 'm²', 22, 'arbeit'],
    ['Untergrund grundieren', 'Gruntowanie podłoża', 'Priming substrate', 'm²', 4, 'arbeit'],
    ['Abdichtung Nassbereich', 'Hydroizolacja strefy mokrej', 'Waterproofing wet area', 'm²', 28, 'arbeit'],
    ['Wandfliesen verlegen bis 30x60', 'Układanie płytek ściennych do 30x60', 'Laying wall tiles up to 30x60', 'm²', 55, 'arbeit'],
    ['Bodenfliesen verlegen bis 60x60', 'Układanie płytek podłogowych do 60x60', 'Laying floor tiles up to 60x60', 'm²', 58, 'arbeit'],
    ['Großformat verlegen ab 60x120', 'Układanie wielkiego formatu od 60x120', 'Laying large-format tiles from 60x120', 'm²', 85, 'arbeit'],
    ['Sockelleiste aus Fliesen', 'Cokół z płytek', 'Tile skirting', 'm', 14, 'arbeit'],
    ['Silikonfugen erneuern', 'Wymiana fug silikonowych', 'Renewing silicone joints', 'm', 9, 'arbeit'],
    ['Arbeitsstunde Fliesenleger', 'Roboczogodzina glazurnika', 'Tiler labour hour', 'Std', 50, 'arbeit'],
    ['Fliesenkleber und Fugenmaterial', 'Klej do płytek i fuga', 'Tile adhesive and grout', 'pauschal', 140, 'material']
  ] },
  { id: 'trockenbau', name: { pl: 'Suche zabudowy (G-K)', de: 'Trockenbau', en: 'Drywall' }, icon: '📐', items: [
    ['Ständerwand GK einfach beplankt, gedämmt', 'Ścianka G-K pojedynczo opłytowana, z izolacją', 'Stud wall, single plasterboard, insulated', 'm²', 55, 'arbeit'],
    ['Ständerwand GK doppelt beplankt', 'Ścianka G-K podwójnie opłytowana', 'Stud wall, double plasterboard', 'm²', 68, 'arbeit'],
    ['Abgehängte Decke GK', 'Sufit podwieszany G-K', 'Suspended plasterboard ceiling', 'm²', 52, 'arbeit'],
    ['Dachschräge dämmen und verkleiden', 'Ocieplenie i zabudowa skosów', 'Insulating and lining sloped ceiling', 'm²', 65, 'arbeit'],
    ['Türöffnung mit UA-Profil', 'Otwór drzwiowy z profilem UA', 'Door opening with UA profile', 'Stk', 120, 'arbeit'],
    ['Verspachteln Q2', 'Szpachlowanie Q2', 'Jointing and filling Q2', 'm²', 9, 'arbeit'],
    ['Arbeitsstunde Trockenbauer', 'Roboczogodzina (suche zabudowy)', 'Drywall labour hour', 'Std', 48, 'arbeit'],
    ['Profile, Platten und Dämmung', 'Profile, płyty i izolacja', 'Profiles, boards and insulation', 'pauschal', 300, 'material']
  ] },
  { id: 'boden', name: { pl: 'Podłogi', de: 'Bodenleger', en: 'Flooring' }, icon: '🪵', items: [
    ['Alten Bodenbelag entfernen und entsorgen', 'Usunięcie i utylizacja starej podłogi', 'Removing and disposing of old flooring', 'm²', 9, 'arbeit'],
    ['Boden ausgleichen / spachteln', 'Wyrównanie / szpachlowanie podłoża', 'Levelling floor', 'm²', 15, 'arbeit'],
    ['Trittschalldämmung verlegen', 'Ułożenie podkładu wyciszającego', 'Laying impact sound insulation', 'm²', 4, 'arbeit'],
    ['Laminat verlegen', 'Układanie paneli laminowanych', 'Laying laminate', 'm²', 18, 'arbeit'],
    ['Vinyl / Designboden verlegen', 'Układanie paneli winylowych', 'Laying vinyl flooring', 'm²', 22, 'arbeit'],
    ['Parkett verlegen', 'Układanie parkietu', 'Laying parquet', 'm²', 32, 'arbeit'],
    ['Sockelleisten montieren', 'Montaż listew przypodłogowych', 'Fitting skirting boards', 'm', 8, 'arbeit'],
    ['Übergangsprofil montieren', 'Montaż listwy progowej', 'Fitting transition strip', 'Stk', 25, 'arbeit'],
    ['Arbeitsstunde Bodenleger', 'Roboczogodzina (podłogi)', 'Floor fitter labour hour', 'Std', 46, 'arbeit'],
    ['Kleinmaterial', 'Drobne materiały', 'Small materials', 'pauschal', 60, 'material']
  ] },
  { id: 'dach', name: { pl: 'Dekarz', de: 'Dachdecker', en: 'Roofer' }, icon: '🏠', items: [
    ['Gerüst stellen und abbauen', 'Postawienie i demontaż rusztowania', 'Erecting and dismantling scaffolding', 'm²', 12, 'sonstiges'],
    ['Alte Eindeckung abnehmen und entsorgen', 'Zdjęcie i utylizacja starego pokrycia', 'Removing and disposing of old roofing', 'm²', 18, 'arbeit'],
    ['Dachlattung erneuern', 'Wymiana łat dachowych', 'Renewing roof battens', 'm²', 16, 'arbeit'],
    ['Unterspannbahn verlegen', 'Ułożenie membrany dachowej', 'Laying roofing membrane', 'm²', 9, 'arbeit'],
    ['Dachziegel eindecken', 'Krycie dachówką', 'Laying roof tiles', 'm²', 45, 'arbeit'],
    ['Dachrinne erneuern', 'Wymiana rynny', 'Replacing gutter', 'm', 48, 'arbeit'],
    ['Dachreparatur / Ziegel tauschen', 'Naprawa dachu / wymiana dachówek', 'Roof repair / replacing tiles', 'Std', 55, 'arbeit'],
    ['Dachfenster einbauen', 'Montaż okna dachowego', 'Installing roof window', 'Stk', 650, 'arbeit'],
    ['Material Dach', 'Materiał dachowy', 'Roofing material', 'pauschal', 400, 'material']
  ] },
  { id: 'tischler', name: { pl: 'Stolarz', de: 'Tischler / Schreiner', en: 'Carpenter / joiner' }, icon: '🪚', items: [
    ['Innentür montieren inkl. Zarge', 'Montaż drzwi wewnętrznych z ościeżnicą', 'Fitting interior door incl. frame', 'Stk', 180, 'arbeit'],
    ['Einbauschrank nach Maß', 'Szafa wnękowa na wymiar', 'Built-in wardrobe made to measure', 'pauschal', 1800, 'arbeit'],
    ['Küchenmontage', 'Montaż kuchni', 'Kitchen installation', 'lfm', 120, 'arbeit'],
    ['Arbeitsplatte zuschneiden und montieren', 'Docięcie i montaż blatu', 'Cutting and fitting worktop', 'Stk', 160, 'arbeit'],
    ['Treppe abschleifen und versiegeln', 'Cyklinowanie i lakierowanie schodów', 'Sanding and sealing stairs', 'Stk', 45, 'arbeit'],
    ['Möbel montieren', 'Montaż mebli', 'Furniture assembly', 'Std', 45, 'arbeit'],
    ['Arbeitsstunde Tischler', 'Roboczogodzina stolarza', 'Carpenter labour hour', 'Std', 52, 'arbeit'],
    ['Holz und Beschläge', 'Drewno i okucia', 'Wood and fittings', 'pauschal', 200, 'material']
  ] },
  { id: 'maurer', name: { pl: 'Murarz / budowlanka', de: 'Maurer & Bau', en: 'Bricklayer & construction' }, icon: '🏗️', items: [
    ['Mauerwerk erstellen', 'Murowanie ścian', 'Bricklaying', 'm²', 75, 'arbeit'],
    ['Wand abbrechen und entsorgen', 'Wyburzenie ściany z utylizacją', 'Demolishing wall incl. disposal', 'm²', 55, 'arbeit'],
    ['Innenputz Kalkzement', 'Tynk wewnętrzny cementowo-wapienny', 'Interior lime-cement plaster', 'm²', 28, 'arbeit'],
    ['Estrich verlegen', 'Wylewka jastrychu', 'Laying screed', 'm²', 32, 'arbeit'],
    ['Betonarbeiten', 'Prace betonowe', 'Concrete work', 'm³', 260, 'arbeit'],
    ['Durchbruch herstellen inkl. Sturz', 'Wykucie otworu z nadprożem', 'Making opening incl. lintel', 'Stk', 650, 'arbeit'],
    ['Arbeitsstunde Maurer', 'Roboczogodzina murarza', 'Bricklayer labour hour', 'Std', 50, 'arbeit'],
    ['Baumaterial', 'Materiał budowlany', 'Building material', 'pauschal', 300, 'material'],
    ['Container / Entsorgung', 'Kontener / utylizacja', 'Skip / disposal', 'pauschal', 450, 'sonstiges']
  ] },
  { id: 'garten', name: { pl: 'Ogrodnik', de: 'Garten- & Landschaftsbau', en: 'Gardening & landscaping' }, icon: '🌳', items: [
    ['Rasen mähen inkl. Entsorgung Schnittgut', 'Koszenie trawnika z wywozem trawy', 'Lawn mowing incl. disposal of clippings', 'm²', 0.4, 'arbeit'],
    ['Hecke schneiden', 'Przycinanie żywopłotu', 'Hedge trimming', 'm', 6, 'arbeit'],
    ['Baum fällen', 'Wycinka drzewa', 'Tree felling', 'Stk', 350, 'arbeit'],
    ['Pflasterarbeiten inkl. Unterbau', 'Układanie kostki z podbudową', 'Paving incl. sub-base', 'm²', 65, 'arbeit'],
    ['Rollrasen verlegen', 'Układanie trawy z rolki', 'Laying turf', 'm²', 12, 'arbeit'],
    ['Zaun setzen', 'Stawianie ogrodzenia', 'Fence installation', 'm', 55, 'arbeit'],
    ['Gartenpflege allgemein', 'Pielęgnacja ogrodu', 'General garden maintenance', 'Std', 42, 'arbeit'],
    ['Grünschnitt entsorgen', 'Wywóz odpadów zielonych', 'Green waste disposal', 'm³', 45, 'sonstiges'],
    ['Pflanzen und Material', 'Rośliny i materiał', 'Plants and material', 'pauschal', 150, 'material']
  ] },
  { id: 'reinigung', name: { pl: 'Sprzątanie', de: 'Gebäudereinigung', en: 'Cleaning' }, icon: '🧽', items: [
    ['Unterhaltsreinigung Büro', 'Sprzątanie biura (regularne)', 'Regular office cleaning', 'm²', 1.8, 'arbeit'],
    ['Treppenhausreinigung', 'Sprzątanie klatki schodowej', 'Stairwell cleaning', 'pauschal', 60, 'arbeit'],
    ['Fensterreinigung inkl. Rahmen', 'Mycie okien z ramami', 'Window cleaning incl. frames', 'm²', 3.5, 'arbeit'],
    ['Bauendreinigung', 'Sprzątanie po remoncie', 'Post-construction cleaning', 'm²', 4, 'arbeit'],
    ['Grundreinigung Wohnung', 'Gruntowne sprzątanie mieszkania', 'Deep cleaning of apartment', 'm²', 3.5, 'arbeit'],
    ['Teppichreinigung', 'Czyszczenie wykładzin', 'Carpet cleaning', 'm²', 5, 'arbeit'],
    ['Arbeitsstunde Reinigung', 'Roboczogodzina sprzątania', 'Cleaning labour hour', 'Std', 32, 'arbeit'],
    ['Reinigungsmittel', 'Środki czystości', 'Cleaning agents', 'pauschal', 25, 'material']
  ] },
  { id: 'hausmeister', name: { pl: 'Dozorca / Hausmeister', de: 'Hausmeisterservice', en: 'Caretaker service' }, icon: '🔧', items: [
    ['Hausmeisterservice monatlich', 'Obsługa dozorcy – miesięcznie', 'Caretaker service, monthly', 'pauschal', 250, 'arbeit'],
    ['Winterdienst pro Einsatz', 'Odśnieżanie – za wyjazd', 'Winter service per call-out', 'pauschal', 45, 'arbeit'],
    ['Kleinreparaturen', 'Drobne naprawy', 'Minor repairs', 'Std', 40, 'arbeit'],
    ['Mülltonnendienst monatlich', 'Obsługa kubłów na śmieci – miesięcznie', 'Bin service, monthly', 'pauschal', 40, 'arbeit'],
    ['Außenanlagenpflege', 'Pielęgnacja terenu zewnętrznego', 'Outdoor area maintenance', 'Std', 38, 'arbeit'],
    ['Material', 'Materiał', 'Material', 'pauschal', 30, 'material']
  ] },
  { id: 'umzug', name: { pl: 'Przeprowadzki / transport', de: 'Umzug & Transport', en: 'Removals & transport' }, icon: '🚚', items: [
    ['Umzugshelfer', 'Pomocnik przy przeprowadzce', 'Removal helper', 'Std', 35, 'arbeit'],
    ['Transporter 3,5 t inkl. Fahrer', 'Bus 3,5 t z kierowcą', 'Van 3.5 t incl. driver', 'Std', 65, 'sonstiges'],
    ['Möbel demontieren und montieren', 'Demontaż i montaż mebli', 'Furniture dismantling and assembly', 'Std', 42, 'arbeit'],
    ['Küche ab- und aufbauen', 'Demontaż i montaż kuchni', 'Kitchen removal and reinstallation', 'pauschal', 450, 'arbeit'],
    ['Halteverbotszone einrichten', 'Strefa zakazu parkowania', 'Temporary no-parking zone', 'pauschal', 120, 'sonstiges'],
    ['Fahrtkosten', 'Koszty przejazdu', 'Mileage', 'km', 1.2, 'sonstiges'],
    ['Umzugskartons', 'Kartony do przeprowadzki', 'Moving boxes', 'Stk', 2.5, 'material']
  ] },
  { id: 'entruempelung', name: { pl: 'Opróżnianie mieszkań', de: 'Entrümpelung & Abriss', en: 'House clearance & demolition' }, icon: '🗑️', items: [
    ['Entrümpelung Wohnung', 'Opróżnienie mieszkania', 'Apartment clearance', 'm³', 55, 'arbeit'],
    ['Kellerräumung', 'Opróżnienie piwnicy', 'Basement clearance', 'pauschal', 350, 'arbeit'],
    ['Demontage Einbauküche', 'Demontaż zabudowy kuchennej', 'Removing fitted kitchen', 'pauschal', 250, 'arbeit'],
    ['Abrissarbeiten innen', 'Prace rozbiórkowe wewnątrz', 'Interior demolition', 'Std', 45, 'arbeit'],
    ['Entsorgungskosten Sperrmüll', 'Koszty utylizacji gabarytów', 'Bulky waste disposal costs', 'm³', 40, 'sonstiges'],
    ['Besenreine Übergabe', 'Przekazanie w stanie wysprzątanym', 'Broom-clean handover', 'pauschal', 120, 'arbeit']
  ] },
  { id: 'fenster', name: { pl: 'Okna i drzwi', de: 'Fenster- & Türmontage', en: 'Windows & doors' }, icon: '🪟', items: [
    ['Altes Fenster ausbauen und entsorgen', 'Demontaż i utylizacja starego okna', 'Removing and disposing of old window', 'Stk', 60, 'arbeit'],
    ['Fenster einbauen inkl. Abdichtung (RAL)', 'Montaż okna z uszczelnieniem (RAL)', 'Installing window incl. sealing (RAL)', 'Stk', 220, 'arbeit'],
    ['Haustür einbauen', 'Montaż drzwi wejściowych', 'Installing front door', 'Stk', 450, 'arbeit'],
    ['Fensterbank innen montieren', 'Montaż parapetu wewnętrznego', 'Fitting interior window sill', 'Stk', 45, 'arbeit'],
    ['Rollladen montieren', 'Montaż rolety', 'Installing roller shutter', 'Stk', 120, 'arbeit'],
    ['Fenster einstellen / warten', 'Regulacja / serwis okna', 'Adjusting / servicing window', 'Stk', 25, 'arbeit'],
    ['Montagematerial', 'Materiał montażowy', 'Fitting material', 'pauschal', 80, 'material']
  ] },
  { id: 'kfz', name: { pl: 'Mechanik samochodowy', de: 'Kfz-Werkstatt', en: 'Car workshop' }, icon: '🚗', items: [
    ['Inspektion', 'Przegląd', 'Service inspection', 'pauschal', 180, 'arbeit'],
    ['Ölwechsel inkl. Filter', 'Wymiana oleju z filtrem', 'Oil change incl. filter', 'pauschal', 95, 'arbeit'],
    ['Bremsbeläge vorne wechseln', 'Wymiana przednich klocków hamulcowych', 'Replacing front brake pads', 'pauschal', 140, 'arbeit'],
    ['Reifenwechsel', 'Wymiana opon', 'Tyre change', 'pauschal', 40, 'arbeit'],
    ['Fehlerspeicher auslesen', 'Odczyt błędów', 'Reading fault memory', 'pauschal', 35, 'arbeit'],
    ['Arbeitsstunde Mechaniker', 'Roboczogodzina mechanika', 'Mechanic labour hour', 'Std', 75, 'arbeit'],
    ['Ersatzteile', 'Części zamienne', 'Spare parts', 'pauschal', 100, 'material']
  ] },
  { id: 'dienstleistung', name: { pl: 'Usługi / freelancer', de: 'Dienstleistung allgemein', en: 'General services' }, icon: '💼', items: [
    ['Beratung', 'Doradztwo', 'Consulting', 'Std', 70, 'sonstiges'],
    ['Projektpauschale', 'Ryczałt za projekt', 'Project flat fee', 'pauschal', 500, 'sonstiges'],
    ['Tagessatz', 'Stawka dzienna', 'Day rate', 'Tag', 480, 'sonstiges'],
    ['Fahrtkosten', 'Koszty przejazdu', 'Mileage', 'km', 0.3, 'sonstiges'],
    ['Material / Auslagen', 'Materiał / wydatki', 'Materials / expenses', 'pauschal', 50, 'material']
  ] }
];
