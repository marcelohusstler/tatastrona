# Fakturka – Rechnungen & Angebote

Strona (angielska, główna): `index.html`, `guide.html`. Polska wersja: `pl/index.html`, `pl/poradnik.html`. Wspólne: `impressum.html`, `datenschutz.html`, `site.css`. Aplikacja: folder `app/` – startuje po angielsku, a link `app/index.html?lang=pl` otwiera ją po polsku.

Aplikacja do wystawiania faktur (Rechnungen) i ofert (Angebote) dla małych firm w Niemczech.
Interfejs jest po polsku, a dokumenty powstają po niemiecku. Działa w przeglądarce na telefonie i komputerze i można ją dodać do ekranu głównego (PWA).

## Co potrafi
- Przewodnik przy pierwszym uruchomieniu: język aplikacji, język dokumentów, branża, dane firmy, podatki, konto bankowe, logo z instrukcją.
- Interfejs w 7 językach: PL, DE, EN (`i18n.js`) oraz TR, RU, IT, FR (`i18n-more.js`). Język dokumentu wybierany osobno dla każdej faktury i oferty.
- Logo jest automatycznie przycinane z białych marginesów.
- Profil firmy z logo, numerem podatkowym i kontem bankowym.
- Lista klientów, z podziałem na osoby prywatne i firmy.
- Oferty i faktury z automatyczną numeracją (`RE-2026-001`, `AN-2026-001`).
- Zamiana oferty na fakturę jednym kliknięciem.
- Szablony branżowe (Vorlagen) dla 18 branż: malarz, elektryk, hydraulik, glazurnik, suche zabudowy, podłogi, dekarz, stolarz, murarz, ogrodnik, sprzątanie, Hausmeister, przeprowadzki, opróżnianie mieszkań, okna, mechanik, gospodarstwo rolne i usługi ogólne.
- Własny katalog pozycji z własnymi cenami.
- VAT 19% / 7%, Reverse Charge §13b i Kleinunternehmer §19.
- Osobno wykazane koszty robocizny (§35a EStG) oraz informacja o obowiązku przechowywania faktury (§14 UStG).
- Sprawdzanie brakujących danych przed wysłaniem dokumentu.
- Druk i zapis do PDF w formacie A4.
- Kopia zapasowa: eksport i import pliku JSON.

## Pliki
| Plik | Co zawiera |
|---|---|
| `app/index.html` | szkielet aplikacji (pliki aplikacji leżą w `app/`) |
| `app.js` | cała logika aplikacji |
| `styles.css` | wygląd aplikacji i wydruku A4 |
| `templates.js` | szablony branżowe w 3 językach – tu dopisujesz nowe branże |
| `i18n.js`, `i18n-more.js` | tłumaczenia aplikacji i dokumentów |
| `templates-i18n.js` | szablony branżowe po turecku, rosyjsku, włosku i francusku |
| `sw.js` | tryb offline (przy zmianach podbij `VERSION`) |

Aplikacja nie wymaga budowania ani instalacji: zwykłe pliki HTML, CSS i JS.

## Uruchomienie lokalne
```
python3 -m http.server 8000
```
Potem otwórz http://localhost:8000 (strona) albo http://localhost:8000/app/ (aplikacja).

## Przed publicznym startem
Uzupełnij żółte pola w `impressum.html` i `datenschutz.html` (imię, adres, e-mail, telefon).

## Ograniczenia (do zrobienia)
- Dane są zapisywane tylko na urządzeniu (localStorage) i nie synchronizują się między urządzeniami. Potrzebne będzie konto i chmura.
- Brak e-faktury w formacie XRechnung/ZUGFeRD. To obowiązek B2B od 2027/2028, więc to następny duży krok.
- Szablony mają przykładowe ceny netto. Nie są to ceny rynkowe.
