/* Fakturka – faktury i oferty dla firm w Niemczech.
 * Interfejs po polsku, dokumenty po niemiecku.
 * Dane zapisują się lokalnie w przeglądarce (localStorage).
 */
(function () {
  'use strict';

  // ---------- Pomocnicze ----------
  var KEY = 'fakturka.v1';
  var view = document.getElementById('view');
  var eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  var num = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 });

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function parseNum(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    var s = String(v || '').replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }
  function fmtIn(n) { return (n === '' || n == null) ? '' : String(n).replace('.', ','); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(iso, n) {
    if (!iso) return '';
    var p = iso.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() + (parseInt(n, 10) || 0));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function fmtDate(iso) { if (!iso) return ''; var p = iso.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }

  // ---------- Dane ----------
  function defaults() {
    return {
      company: {
        name: '', owner: '', street: '', zip: '', city: '', phone: '', email: '', web: '',
        taxNo: '', vatId: '', bank: '', iban: '', bic: '',
        kleinunternehmer: false, paymentDays: 14, offerDays: 30, branche: 'maler', logo: ''
      },
      customers: [], items: [], docs: []
    };
  }
  var S = (function load() {
    var d = defaults();
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw) {
        d.company = Object.assign(d.company, raw.company || {});
        d.customers = raw.customers || []; d.items = raw.items || []; d.docs = raw.docs || [];
      }
    } catch (e) { /* brak dostępu do pamięci – działamy w pamięci RAM */ }
    return d;
  })();

  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(S));
        var el = document.getElementById('saved');
        el.classList.add('show'); setTimeout(function () { el.classList.remove('show'); }, 900);
      } catch (e) {
        toast('Nie udało się zapisać danych (pamięć pełna?). Zrób kopię zapasową.');
      }
    }, 250);
  }

  // ---------- Logika dokumentów ----------
  var VAT = {
    '19': { rate: 19, label: '19% MwSt' },
    '7': { rate: 7, label: '7% MwSt' },
    '13b': { rate: 0, label: '0% – Reverse Charge §13b (dla firm budowlanych)' },
    'klein': { rate: 0, label: 'Bez VAT (Kleinunternehmer §19)' }
  };
  var TYPES = { arbeit: 'Robocizna', material: 'Materiał', sonstiges: 'Inne' };
  var STATUS = {
    rechnung: { entwurf: 'Szkic', offen: 'Wysłana – nieopłacona', bezahlt: 'Zapłacona' },
    angebot: { entwurf: 'Szkic', gesendet: 'Wysłana', angenommen: 'Zaakceptowana', abgelehnt: 'Odrzucona' }
  };

  function vatMode(doc) { return S.company.kleinunternehmer ? 'klein' : (doc.vat || '19'); }
  function calc(doc) {
    var mode = vatMode(doc), rate = VAT[mode].rate, net = 0, labor = 0;
    var lines = doc.positions.map(function (p) {
      var t = r2(parseNum(p.qty) * parseNum(p.price));
      net += t; if (p.type === 'arbeit') labor += t;
      return t;
    });
    net = r2(net);
    var vat = r2(net * rate / 100);
    return { lines: lines, net: net, vat: vat, gross: r2(net + vat), rate: rate, mode: mode, labor: r2(labor), laborGross: r2(labor * (1 + rate / 100)) };
  }
  function dueDate(doc) { return addDays(doc.date, doc.paymentDays); }
  function isOverdue(doc) { return doc.type === 'rechnung' && doc.status === 'offen' && dueDate(doc) < today(); }

  function nextNumber(type, year) {
    var prefix = type === 'rechnung' ? 'RE' : 'AN';
    var re = new RegExp('^' + prefix + '-' + year + '-(\\d+)$'), max = 0;
    S.docs.forEach(function (d) {
      if (d.type !== type) return;
      var m = re.exec(d.number || ''); if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return prefix + '-' + year + '-' + String(max + 1).padStart(3, '0');
  }
  function defaultIntro(type) {
    return type === 'rechnung'
      ? 'Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihren Auftrag. Für die ausgeführten Leistungen berechnen wir Ihnen:'
      : 'Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:';
  }
  function defaultOutro(type) {
    return type === 'rechnung'
      ? 'Vielen Dank für Ihr Vertrauen.\n\nMit freundlichen Grüßen'
      : 'Wir freuen uns auf Ihren Auftrag.\n\nMit freundlichen Grüßen';
  }
  function newDoc(type, from) {
    var c = S.company, date = today();
    var d = {
      id: uid(), type: type, number: nextNumber(type, date.slice(0, 4)), date: date,
      serviceDate: date, serviceTo: '', validUntil: addDays(date, c.offerDays || 30),
      paymentDays: c.paymentDays == null ? 14 : c.paymentDays,
      customerId: '', customer: null, positions: [], vat: '19',
      intro: defaultIntro(type), outro: defaultOutro(type),
      status: 'entwurf', privateHint: false, show35a: true, created: Date.now()
    };
    if (from) {
      d.customerId = from.customerId; d.customer = from.customer ? Object.assign({}, from.customer) : null;
      d.positions = from.positions.map(function (p) { return Object.assign({}, p); });
      d.vat = from.vat; d.show35a = from.show35a; d.privateHint = from.privateHint;
      if (from.type === type) { d.intro = from.intro; d.outro = from.outro; }
      if (type === 'rechnung' && from.type === 'angebot') d.offerRef = from.number;
    }
    S.docs.unshift(d); save();
    return d;
  }
  function findDoc(id) { return S.docs.filter(function (d) { return d.id === id; })[0]; }
  function findCustomer(id) { return S.customers.filter(function (c) { return c.id === id; })[0]; }

  // ---------- UI pomocnicze ----------
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function field(label, html, hint) {
    return '<label class="field"><span>' + label + '</span>' + html + (hint ? '<small>' + hint + '</small>' : '') + '</label>';
  }
  function input(attr, value, extra) {
    return '<input ' + attr + ' value="' + esc(value) + '" ' + (extra || '') + '>';
  }

  // ---------- Router ----------
  function route() {
    var h = location.hash.replace(/^#\/?/, '') || 'docs';
    var q = {}; var qi = h.indexOf('?');
    if (qi > -1) { h.slice(qi + 1).split('&').forEach(function (kv) { var p = kv.split('='); q[p[0]] = decodeURIComponent(p[1] || ''); }); h = h.slice(0, qi); }
    var parts = h.split('/');
    var section = parts[0], id = parts[1];
    closeModal();
    document.body.classList.toggle('is-preview', section === 'preview');
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      var map = { doc: 'docs', preview: 'docs', customer: 'customers', item: 'items' };
      a.classList.toggle('active', a.getAttribute('data-nav') === (map[section] || section));
    });
    var r = {
      docs: renderDocs, doc: renderDoc, preview: renderPreview, customers: renderCustomers,
      customer: renderCustomer, items: renderItems, item: renderItem, company: renderCompany
    }[section] || renderDocs;
    r(id, q);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  // ---------- Lista dokumentów ----------
  var docFilter = 'all';
  function renderDocs() {
    var year = today().slice(0, 4), open = 0, paid = 0, overdue = 0;
    S.docs.forEach(function (d) {
      if (d.type !== 'rechnung') return;
      var g = calc(d).gross;
      if (d.status === 'offen') { open += g; if (isOverdue(d)) overdue++; }
      if (d.status === 'bezahlt' && (d.date || '').indexOf(year) === 0) paid += g;
    });
    var list = S.docs.filter(function (d) { return docFilter === 'all' || d.type === docFilter; });
    var h = '';
    if (!S.company.name) {
      h += '<a class="banner" href="#/company"><strong>Zacznij tutaj:</strong> uzupełnij dane swojej firmy. Bez nich faktura nie jest ważna. →</a>';
    }
    h += '<div class="stats"><div><small>Do zapłaty</small><strong>' + eur.format(open) + '</strong>' +
      (overdue ? '<em class="warn">' + overdue + ' po terminie</em>' : '') + '</div>' +
      '<div><small>Zapłacone ' + year + '</small><strong>' + eur.format(paid) + '</strong></div></div>';
    h += '<div class="row2"><button class="btn primary" data-act="new-rechnung">+ Nowa faktura</button>' +
      '<button class="btn" data-act="new-angebot">+ Nowa oferta</button></div>';
    h += '<div class="chips">' + [['all', 'Wszystkie'], ['rechnung', 'Faktury'], ['angebot', 'Oferty']].map(function (f) {
      return '<button class="chip' + (docFilter === f[0] ? ' on' : '') + '" data-act="filter" data-v="' + f[0] + '">' + f[1] + '</button>';
    }).join('') + '</div>';
    if (!list.length) {
      h += '<div class="empty">Nie masz jeszcze żadnych dokumentów.<br>Kliknij <b>+ Nowa faktura</b> albo <b>+ Nowa oferta</b>.</div>';
    } else {
      h += list.map(function (d) {
        var c = calc(d), st = isOverdue(d) ? '<span class="badge red">Po terminie</span>'
          : '<span class="badge s-' + d.status + '">' + esc(STATUS[d.type][d.status] || d.status) + '</span>';
        return '<a class="card doc" href="#/doc/' + d.id + '">' +
          '<div class="doc-l"><span class="tag ' + d.type + '">' + (d.type === 'rechnung' ? 'Faktura' : 'Oferta') + '</span> <b>' + esc(d.number) + '</b>' +
          '<div class="muted">' + esc(d.customer ? d.customer.name : '— bez klienta —') + ' · ' + fmtDate(d.date) + '</div></div>' +
          '<div class="doc-r"><b>' + eur.format(c.gross) + '</b>' + st + '</div></a>';
      }).join('');
    }
    view.innerHTML = h;
  }

  // ---------- Edytor dokumentu ----------
  function renderDoc(id) {
    var d = findDoc(id);
    if (!d) return go('#/docs');
    var isR = d.type === 'rechnung', c = calc(d);
    var custOpts = '<option value="">— wybierz klienta —</option>' + S.customers.map(function (cu) {
      return '<option value="' + cu.id + '"' + (cu.id === d.customerId ? ' selected' : '') + '>' + esc(cu.name) + '</option>';
    }).join('') + '<option value="__new">+ Nowy klient…</option>';
    var statusOpts = Object.keys(STATUS[d.type]).map(function (k) {
      return '<option value="' + k + '"' + (d.status === k ? ' selected' : '') + '>' + STATUS[d.type][k] + '</option>';
    }).join('');

    var h = '<div class="head"><a href="#/docs" class="back">← Dokumenty</a><h1>' + (isR ? 'Faktura' : 'Oferta') + '</h1></div>';
    h += '<section class="box"><div class="grid2">' +
      field(isR ? 'Numer faktury' : 'Numer oferty', input('data-f="number"', d.number)) +
      field('Status', '<select data-f="status">' + statusOpts + '</select>') +
      field('Data wystawienia', input('type="date" data-f="date"', d.date)) +
      (isR
        ? field('Termin płatności (dni)', input('type="number" min="0" data-f="paymentDays" inputmode="numeric"', d.paymentDays), 'Zapłata do: <span id="due">' + fmtDate(dueDate(d)) + '</span>')
        : field('Oferta ważna do', input('type="date" data-f="validUntil"', d.validUntil))) +
      (isR ? field('Data wykonania usługi', input('type="date" data-f="serviceDate"', d.serviceDate), 'Leistungsdatum – obowiązkowe') +
        field('…do (jeśli okres)', input('type="date" data-f="serviceTo"', d.serviceTo), 'Opcjonalnie') : '') +
      '</div></section>';

    h += '<section class="box"><h2>Klient</h2>' + field('Klient', '<select data-f="customerId">' + custOpts + '</select>');
    if (d.customer) {
      h += '<div class="muted small">' + nl2br([d.customer.street, (d.customer.zip + ' ' + d.customer.city).trim()].filter(Boolean).join('\n')) +
        (d.customer.type === 'firma' ? ' · firma' : ' · osoba prywatna') + '</div>';
    }
    h += '</section>';

    h += '<section class="box"><h2>Pozycje</h2><div id="positions">';
    h += d.positions.map(function (p, i) {
      var typeOpts = Object.keys(TYPES).map(function (k) { return '<option value="' + k + '"' + (p.type === k ? ' selected' : '') + '>' + TYPES[k] + '</option>'; }).join('');
      return '<div class="pos">' +
        '<div class="pos-head"><span class="pos-nr">' + (i + 1) + '</span><select data-p="' + i + '" data-k="type">' + typeOpts + '</select>' +
        '<span class="sp"></span><button class="icon" data-act="up" data-i="' + i + '" title="W górę">↑</button>' +
        '<button class="icon" data-act="down" data-i="' + i + '" title="W dół">↓</button>' +
        '<button class="icon danger" data-act="delpos" data-i="' + i + '" title="Usuń">✕</button></div>' +
        '<textarea rows="2" data-p="' + i + '" data-k="name" placeholder="Opis po niemiecku, np. Wandanstrich weiß">' + esc(p.name) + '</textarea>' +
        '<div class="pos-row">' +
        field('Ilość', input('data-p="' + i + '" data-k="qty" inputmode="decimal"', fmtIn(p.qty))) +
        field('Jedn.', input('data-p="' + i + '" data-k="unit" list="units"', p.unit)) +
        field('Cena netto €', input('data-p="' + i + '" data-k="price" inputmode="decimal"', fmtIn(p.price))) +
        '<div class="pos-total" id="lt-' + i + '">' + eur.format(c.lines[i]) + '</div></div>' +
        '<button class="link" data-act="saveitem" data-i="' + i + '">☆ Zapisz w moich pozycjach</button></div>';
    }).join('');
    if (!d.positions.length) h += '<div class="empty small">Dodaj pierwszą pozycję – z szablonu branżowego albo własną.</div>';
    h += '</div><div class="row2"><button class="btn primary" data-act="picker">+ Z szablonu / katalogu</button>' +
      '<button class="btn" data-act="addpos">+ Własna pozycja</button></div></section>';

    h += '<section class="box"><h2>Podatek i suma</h2>';
    if (S.company.kleinunternehmer) {
      h += '<p class="muted small">Masz włączone „Kleinunternehmer” – dokument bez VAT z adnotacją §19 UStG. Zmienisz to w zakładce Firma.</p>';
    } else {
      h += field('Stawka VAT', '<select data-f="vat">' + ['19', '7', '13b'].map(function (k) {
        return '<option value="' + k + '"' + (d.vat === k ? ' selected' : '') + '>' + VAT[k].label + '</option>';
      }).join('') + '</select>', d.vat === '13b' ? 'Tylko gdy klient to firma budowlana w Niemczech. Na fakturze pojawi się adnotacja §13b UStG.' : '');
    }
    h += '<div id="totals">' + totalsHTML(c) + '</div>';
    h += '<label class="check"><input type="checkbox" data-f="show35a"' + (d.show35a ? ' checked' : '') + '> Pokaż koszty robocizny (§35a EStG) – klient prywatny odliczy je od podatku</label>';
    if (isR) h += '<label class="check"><input type="checkbox" data-f="privateHint"' + (d.privateHint ? ' checked' : '') + '> Klient prywatny + prace przy nieruchomości: dodaj obowiązkową informację o przechowywaniu faktury 2 lata</label>';
    h += '</section>';

    h += '<section class="box"><h2>Teksty na dokumencie</h2>' +
      field('Wstęp', '<textarea rows="4" data-f="intro">' + esc(d.intro) + '</textarea>') +
      field('Zakończenie', '<textarea rows="3" data-f="outro">' + esc(d.outro) + '</textarea>') + '</section>';

    h += '<div class="actions">' +
      '<a class="btn primary big" href="#/preview/' + d.id + '">Podgląd / PDF</a>' +
      (isR ? '' : '<button class="btn" data-act="toinvoice">Zamień na fakturę</button>') +
      '<button class="btn" data-act="duplicate">Duplikuj</button>' +
      '<button class="btn danger" data-act="deldoc">Usuń</button></div>';
    h += '<p class="muted small center">Zmiany zapisują się automatycznie.</p>';
    view.innerHTML = h;
    view.dataset.doc = d.id;
  }
  function totalsHTML(c) {
    var h = '<table class="totals"><tr><td>Netto</td><td>' + eur.format(c.net) + '</td></tr>';
    if (c.mode === '19' || c.mode === '7') h += '<tr><td>VAT ' + c.rate + '%</td><td>' + eur.format(c.vat) + '</td></tr>';
    h += '<tr class="sum"><td>Razem</td><td>' + eur.format(c.gross) + '</td></tr>';
    if (c.labor) h += '<tr class="muted"><td>w tym robocizna (brutto)</td><td>' + eur.format(c.laborGross) + '</td></tr>';
    return h + '</table>';
  }
  function refreshTotals(d) {
    var c = calc(d);
    c.lines.forEach(function (t, i) { var el = document.getElementById('lt-' + i); if (el) el.textContent = eur.format(t); });
    var tt = document.getElementById('totals'); if (tt) tt.innerHTML = totalsHTML(c);
    var due = document.getElementById('due'); if (due) due.textContent = fmtDate(dueDate(d));
  }

  // ---------- Okno wyboru pozycji ----------
  var pickerSrc = null;
  function openPicker(d) {
    if (!pickerSrc) pickerSrc = S.items.length ? 'mine' : (S.company.branche || 'maler');
    var m = document.getElementById('modal');
    var opts = '<option value="mine"' + (pickerSrc === 'mine' ? ' selected' : '') + '>⭐ Moje pozycje (' + S.items.length + ')</option>' +
      window.VORLAGEN.map(function (v) { return '<option value="' + v.id + '"' + (pickerSrc === v.id ? ' selected' : '') + '>' + esc(v.pl) + ' – ' + esc(v.de) + '</option>'; }).join('');
    m.innerHTML = '<div class="sheet"><div class="sheet-head"><h2>Dodaj pozycje</h2><button class="icon" data-act="closemodal">✕</button></div>' +
      '<select id="pk-src">' + opts + '</select><input id="pk-q" placeholder="Szukaj…" autocomplete="off">' +
      '<div id="pk-list" class="pk-list"></div><button class="btn primary big" data-act="closemodal">Gotowe</button></div>';
    m.hidden = false; m.dataset.doc = d.id;
    fillPicker();
  }
  function pickerItems() {
    if (pickerSrc === 'mine') return S.items;
    var v = window.VORLAGEN.filter(function (x) { return x.id === pickerSrc; })[0];
    return v ? v.items : [];
  }
  function fillPicker() {
    var q = (document.getElementById('pk-q').value || '').toLowerCase();
    var items = pickerItems().map(function (it, i) { return { it: it, i: i }; })
      .filter(function (o) { return !q || o.it.name.toLowerCase().indexOf(q) > -1; });
    var el = document.getElementById('pk-list');
    if (!items.length) {
      el.innerHTML = '<div class="empty small">' + (pickerSrc === 'mine' ? 'Nie masz jeszcze własnych pozycji. Wybierz branżę z listy powyżej.' : 'Brak wyników.') + '</div>';
      return;
    }
    el.innerHTML = items.map(function (o) {
      return '<button class="pk-item" data-act="pick" data-i="' + o.i + '"><span>' + esc(o.it.name) +
        '<small>' + TYPES[o.it.type || 'sonstiges'] + '</small></span><b>' + eur.format(o.it.price) + '/' + esc(o.it.unit) + '</b></button>';
    }).join('');
  }
  function closeModal() { var m = document.getElementById('modal'); m.hidden = true; m.innerHTML = ''; }

  // ---------- Podgląd i wydruk ----------
  function renderPreview(id) {
    var d = findDoc(id);
    if (!d) return go('#/docs');
    var warns = checkDoc(d);
    view.innerHTML = '<div class="toolbar"><a href="#/doc/' + d.id + '" class="btn">← Edytuj</a>' +
      '<button class="btn primary" data-act="print">🖨 Drukuj / Zapisz PDF</button></div>' +
      (warns.length ? '<div class="warnbox"><b>Sprawdź przed wysłaniem:</b><ul>' + warns.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul></div>' : '') +
      '<p class="muted small center noprint">Na telefonie: Drukuj → w podglądzie wydruku wybierz „Zapisz jako PDF” albo „Udostępnij”.</p>' +
      '<div class="paper-wrap" id="pw"><div class="paper" id="paper">' + docHTML(d) + '</div></div>';
    view.dataset.doc = d.id;
    fitPaper();
  }
  function fitPaper() {
    var wrap = document.getElementById('pw'), paper = document.getElementById('paper');
    if (!wrap || !paper) return;
    paper.style.transform = ''; wrap.style.height = '';
    var s = Math.min(1, wrap.clientWidth / paper.offsetWidth);
    if (s < 1) { paper.style.transform = 'scale(' + s + ')'; wrap.style.height = (paper.offsetHeight * s) + 'px'; }
  }
  window.addEventListener('resize', fitPaper);

  function checkDoc(d) {
    var c = S.company, w = [];
    if (!c.name || !c.street || !c.zip || !c.city) w.push('Brakuje pełnej nazwy i adresu Twojej firmy (zakładka Firma).');
    if (d.type === 'rechnung' && !c.taxNo && !c.vatId) w.push('Brakuje numeru podatkowego (Steuernummer albo USt-IdNr.) – na fakturze jest obowiązkowy.');
    if (d.type === 'rechnung' && !c.iban) w.push('Brakuje IBAN – klient nie będzie wiedział, gdzie zapłacić.');
    if (!d.customer) w.push('Nie wybrano klienta.');
    if (!d.positions.length) w.push('Dokument nie ma żadnych pozycji.');
    if (d.positions.some(function (p) { return !String(p.name || '').trim(); })) w.push('Jedna z pozycji nie ma opisu.');
    if (vatMode(d) === '13b' && d.customer && (d.customer.type !== 'firma' || !d.customer.vatId))
      w.push('Reverse Charge (§13b) tylko dla firm – podaj USt-IdNr. klienta albo zmień stawkę VAT.');
    return w;
  }

  function docHTML(d) {
    var c = S.company, cu = d.customer || {}, k = calc(d), isR = d.type === 'rechnung';
    var title = isR ? 'Rechnung' : 'Angebot';
    var senderLine = [c.name, c.street, (c.zip + ' ' + c.city).trim()].filter(Boolean).join(' · ');
    var h = '<div class="dp">';
    h += '<div class="dp-top"><div class="dp-logo">' + (c.logo ? '<img src="' + c.logo + '" alt="">' : '<div class="dp-name">' + esc(c.name) + '</div>') + '</div>' +
      '<div class="dp-company"><b>' + esc(c.name) + '</b>' + (c.owner && c.owner !== c.name ? '<br>' + esc(c.owner) : '') +
      '<br>' + esc(c.street) + '<br>' + esc((c.zip + ' ' + c.city).trim()) +
      (c.phone ? '<br>Tel. ' + esc(c.phone) : '') + (c.email ? '<br>' + esc(c.email) : '') + (c.web ? '<br>' + esc(c.web) : '') + '</div></div>';
    h += '<div class="dp-mid"><div class="dp-addr"><div class="dp-sender">' + esc(senderLine) + '</div>' +
      '<div>' + esc(cu.name) + (cu.contact ? '<br>' + esc(cu.contact) : '') + '<br>' + esc(cu.street) + '<br>' + esc(((cu.zip || '') + ' ' + (cu.city || '')).trim()) +
      (cu.country && cu.country !== 'Deutschland' ? '<br>' + esc(cu.country) : '') + '</div></div>' +
      '<table class="dp-meta">' +
      '<tr><td>' + title + 'snummer</td><td>' + esc(d.number) + '</td></tr>' +
      '<tr><td>Datum</td><td>' + fmtDate(d.date) + '</td></tr>' +
      (isR ? (d.serviceTo
        ? '<tr><td>Leistungszeitraum</td><td>' + fmtDate(d.serviceDate) + ' – ' + fmtDate(d.serviceTo) + '</td></tr>'
        : '<tr><td>Leistungsdatum</td><td>' + (d.serviceDate ? fmtDate(d.serviceDate) : fmtDate(d.date)) + '</td></tr>')
        : '<tr><td>Gültig bis</td><td>' + fmtDate(d.validUntil) + '</td></tr>') +
      (d.offerRef ? '<tr><td>Zu Angebot</td><td>' + esc(d.offerRef) + '</td></tr>' : '') +
      (cu.vatId ? '<tr><td>USt-IdNr. Kunde</td><td>' + esc(cu.vatId) + '</td></tr>' : '') +
      '</table></div>';
    h += '<h1 class="dp-title">' + title + ' ' + esc(d.number) + '</h1>';
    if (d.intro) h += '<p class="dp-text">' + nl2br(d.intro) + '</p>';
    h += '<table class="dp-items"><thead><tr><th>Pos.</th><th>Beschreibung</th><th class="r">Menge</th><th>Einheit</th><th class="r">Einzelpreis</th><th class="r">Gesamt</th></tr></thead><tbody>';
    h += d.positions.map(function (p, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + nl2br(p.name) + '</td><td class="r">' + num.format(parseNum(p.qty)) + '</td><td>' + esc(p.unit) +
        '</td><td class="r">' + eur.format(parseNum(p.price)) + '</td><td class="r">' + eur.format(k.lines[i]) + '</td></tr>';
    }).join('');
    h += '</tbody></table>';
    h += '<table class="dp-sum"><tr><td>Nettobetrag</td><td>' + eur.format(k.net) + '</td></tr>';
    if (k.mode === '19' || k.mode === '7') h += '<tr><td>zzgl. ' + k.rate + ' % USt.</td><td>' + eur.format(k.vat) + '</td></tr>';
    if (k.mode === '13b') h += '<tr><td>USt. 0 %</td><td>' + eur.format(0) + '</td></tr>';
    h += '<tr class="sum"><td>' + (isR ? 'Rechnungsbetrag' : 'Angebotssumme') + '</td><td>' + eur.format(k.gross) + '</td></tr></table>';

    var notes = [];
    if (k.mode === 'klein') notes.push('Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.');
    if (k.mode === '13b') notes.push('Steuerschuldnerschaft des Leistungsempfängers gemäß § 13b UStG.');
    if (d.show35a && k.labor > 0) notes.push('Im Betrag enthaltene Arbeitskosten (§ 35a EStG): ' + eur.format(k.laborGross) + (k.rate ? ' inkl. USt.' : '.'));
    if (isR) {
      notes.push('Bitte überweisen Sie den Betrag von ' + eur.format(k.gross) + ' bis zum ' + fmtDate(dueDate(d)) +
        ' ohne Abzug' + (c.iban ? ' auf das unten angegebene Konto' : '') + '. Verwendungszweck: ' + esc(d.number) + '.');
      if (d.privateHint) notes.push('Sie sind gesetzlich verpflichtet, diese Rechnung zwei Jahre lang aufzubewahren (§ 14b Abs. 1 Satz 5 UStG).');
    } else {
      notes.push('Dieses Angebot ist gültig bis zum ' + fmtDate(d.validUntil) + '.');
    }
    h += '<div class="dp-notes">' + notes.map(function (n) { return '<p>' + n + '</p>'; }).join('') + '</div>';
    if (d.outro) h += '<p class="dp-text">' + nl2br(d.outro) + '<br><br>' + esc(c.owner || c.name) + '</p>';
    h += '<div class="dp-foot"><div><b>' + esc(c.name) + '</b><br>' + esc(c.street) + '<br>' + esc((c.zip + ' ' + c.city).trim()) + '</div>' +
      '<div>' + (c.taxNo ? 'Steuernummer: ' + esc(c.taxNo) + '<br>' : '') + (c.vatId ? 'USt-IdNr.: ' + esc(c.vatId) + '<br>' : '') +
      (c.phone ? 'Tel. ' + esc(c.phone) + '<br>' : '') + (c.email ? esc(c.email) : '') + '</div>' +
      '<div>' + (c.bank ? esc(c.bank) + '<br>' : '') + (c.iban ? 'IBAN: ' + esc(c.iban) + '<br>' : '') + (c.bic ? 'BIC: ' + esc(c.bic) : '') + '</div></div>';
    return h + '</div>';
  }

  // ---------- Klienci ----------
  function renderCustomers() {
    var h = '<div class="head"><h1>Klienci</h1><a class="btn primary" href="#/customer/new">+ Nowy</a></div>';
    if (!S.customers.length) h += '<div class="empty">Brak klientów. Dodaj pierwszego.</div>';
    h += S.customers.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (c) {
      var n = S.docs.filter(function (d) { return d.customerId === c.id; }).length;
      return '<a class="card" href="#/customer/' + c.id + '"><b>' + esc(c.name) + '</b><div class="muted">' +
        esc([c.city, c.type === 'firma' ? 'firma' : 'prywatny', n + ' dok.'].filter(Boolean).join(' · ')) + '</div></a>';
    }).join('');
    view.innerHTML = h;
  }
  function renderCustomer(id, q) {
    var c = id === 'new' ? { id: '', type: 'privat', country: 'Deutschland' } : findCustomer(id);
    if (!c) return go('#/customers');
    var f = function (k, label, extra) { return field(label, input('name="' + k + '"' + (extra || ''), c[k] || '')); };
    view.innerHTML = '<div class="head"><a class="back" href="' + (q.ret ? '#/doc/' + esc(q.ret) : '#/customers') + '">← Wróć</a><h1>' + (id === 'new' ? 'Nowy klient' : 'Klient') + '</h1></div>' +
      '<form id="custform" class="box" data-id="' + esc(c.id) + '" data-ret="' + esc(q.ret || '') + '">' +
      '<div class="seg"><label><input type="radio" name="type" value="privat"' + (c.type !== 'firma' ? ' checked' : '') + '> Osoba prywatna</label>' +
      '<label><input type="radio" name="type" value="firma"' + (c.type === 'firma' ? ' checked' : '') + '> Firma</label></div>' +
      f('name', 'Nazwa / imię i nazwisko *', ' required') + f('contact', 'Osoba kontaktowa (opcjonalnie)') +
      f('street', 'Ulica i numer') + '<div class="grid2">' + f('zip', 'Kod pocztowy', ' inputmode="numeric"') + f('city', 'Miasto') + '</div>' +
      f('country', 'Kraj') + '<div class="grid2">' + f('email', 'E-mail', ' type="email"') + f('phone', 'Telefon', ' type="tel"') + '</div>' +
      f('vatId', 'USt-IdNr. (tylko firmy)') +
      '<div class="actions"><button class="btn primary big" type="submit">Zapisz</button>' +
      (c.id ? '<button class="btn danger" type="button" data-act="delcust">Usuń</button>' : '') + '</div></form>';
  }

  // ---------- Pozycje i szablony ----------
  var tplSel = null;
  function renderItems() {
    if (!tplSel) tplSel = S.company.branche || 'maler';
    var v = window.VORLAGEN.filter(function (x) { return x.id === tplSel; })[0] || window.VORLAGEN[0];
    var h = '<div class="head"><h1>Moje pozycje</h1><a class="btn primary" href="#/item/new">+ Nowa</a></div>';
    h += '<p class="muted small">Twój katalog usług i materiałów z Twoimi cenami. Dodajesz je jednym kliknięciem do oferty i faktury.</p>';
    if (!S.items.length) h += '<div class="empty small">Pusto. Dodaj własną pozycję albo skopiuj z szablonu poniżej.</div>';
    h += S.items.map(function (it) {
      return '<a class="card row" href="#/item/' + it.id + '"><span>' + esc(it.name) + '<small class="muted"> · ' + TYPES[it.type || 'sonstiges'] + '</small></span><b>' + eur.format(it.price) + '/' + esc(it.unit) + '</b></a>';
    }).join('');
    h += '<h2 class="sec">Szablony branżowe (Vorlagen)</h2><select data-act="tplsel">' + window.VORLAGEN.map(function (x) {
      return '<option value="' + x.id + '"' + (x.id === v.id ? ' selected' : '') + '>' + esc(x.pl) + ' – ' + esc(x.de) + '</option>';
    }).join('') + '</select>';
    h += '<p class="muted small">Ceny są przykładowe – po skopiowaniu ustaw własne.</p>';
    h += '<button class="btn" data-act="tplall">Skopiuj całą branżę do moich pozycji</button>';
    h += v.items.map(function (it, i) {
      return '<div class="card row"><span>' + esc(it.name) + '<small class="muted"> · ' + eur.format(it.price) + '/' + esc(it.unit) + '</small></span>' +
        '<button class="icon" data-act="tplone" data-i="' + i + '" title="Dodaj do moich">＋</button></div>';
    }).join('');
    view.innerHTML = h;
  }
  function renderItem(id) {
    var it = id === 'new' ? { id: '', name: '', unit: 'Std', price: '', type: 'arbeit' } : S.items.filter(function (x) { return x.id === id; })[0];
    if (!it) return go('#/items');
    view.innerHTML = '<div class="head"><a class="back" href="#/items">← Pozycje</a><h1>' + (it.id ? 'Edytuj pozycję' : 'Nowa pozycja') + '</h1></div>' +
      '<form id="itemform" class="box" data-id="' + esc(it.id) + '">' +
      field('Opis (po niemiecku, tak jak na fakturze) *', '<textarea name="name" rows="2" required>' + esc(it.name) + '</textarea>') +
      '<div class="grid2">' + field('Jednostka', input('name="unit" list="units"', it.unit)) +
      field('Cena netto €', input('name="price" inputmode="decimal" required', fmtIn(it.price))) + '</div>' +
      field('Rodzaj', '<select name="type">' + Object.keys(TYPES).map(function (k) { return '<option value="' + k + '"' + (it.type === k ? ' selected' : '') + '>' + TYPES[k] + '</option>'; }).join('') + '</select>') +
      '<div class="actions"><button class="btn primary big" type="submit">Zapisz</button>' +
      (it.id ? '<button class="btn danger" type="button" data-act="delitem">Usuń</button>' : '') + '</div></form>';
  }

  // ---------- Firma ----------
  function renderCompany() {
    var c = S.company;
    var f = function (k, label, extra, hint) { return field(label, input('data-c="' + k + '"' + (extra || ''), c[k]), hint); };
    view.innerHTML = '<div class="head"><h1>Twoja firma</h1></div>' +
      '<section class="box"><h2>Dane na dokumentach</h2>' +
      f('name', 'Nazwa firmy *') + f('owner', 'Właściciel (imię i nazwisko)') + f('street', 'Ulica i numer *') +
      '<div class="grid2">' + f('zip', 'Kod pocztowy *', ' inputmode="numeric"') + f('city', 'Miasto *') + '</div>' +
      '<div class="grid2">' + f('phone', 'Telefon', ' type="tel"') + f('email', 'E-mail', ' type="email"') + '</div>' + f('web', 'Strona www') +
      '<div class="grid2">' + f('taxNo', 'Steuernummer', '', 'Z urzędu skarbowego') + f('vatId', 'USt-IdNr.', '', 'Jeśli masz') + '</div>' +
      '<label class="check"><input type="checkbox" data-c="kleinunternehmer"' + (c.kleinunternehmer ? ' checked' : '') + '> Jestem Kleinunternehmer (§19 UStG) – wystawiam bez VAT</label>' +
      '</section>' +
      '<section class="box"><h2>Konto bankowe</h2>' + f('bank', 'Nazwa banku') + f('iban', 'IBAN') + f('bic', 'BIC') + '</section>' +
      '<section class="box"><h2>Logo</h2>' + (c.logo ? '<img class="logo-prev" src="' + c.logo + '" alt=""><button class="btn" data-act="dellogo">Usuń logo</button>' : '') +
      '<label class="btn file">Wybierz zdjęcie logo<input type="file" accept="image/*" id="logo" hidden></label></section>' +
      '<section class="box"><h2>Ustawienia</h2><div class="grid2">' +
      f('paymentDays', 'Termin płatności (dni)', ' type="number" min="0" inputmode="numeric"') +
      f('offerDays', 'Ważność oferty (dni)', ' type="number" min="0" inputmode="numeric"') + '</div>' +
      field('Moja branża', '<select data-c="branche">' + window.VORLAGEN.map(function (v) {
        return '<option value="' + v.id + '"' + (c.branche === v.id ? ' selected' : '') + '>' + esc(v.pl) + '</option>';
      }).join('') + '</select>', 'Ten szablon pokaże się jako pierwszy') + '</section>' +
      '<section class="box"><h2>Kopia zapasowa</h2><p class="muted small">Dane są zapisane tylko na tym urządzeniu. Rób kopię regularnie – szczególnie przed zmianą telefonu.</p>' +
      '<div class="row2"><button class="btn" data-act="export">⬇ Pobierz kopię</button><label class="btn file">⬆ Wczytaj kopię<input type="file" accept="application/json,.json" id="import" hidden></label></div>' +
      '<button class="btn danger" data-act="wipe">Usuń wszystkie dane</button></section>';
  }

  // ---------- Zdarzenia ----------
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.tagName === 'SELECT') return;
    var act = b.getAttribute('data-act'), d = findDoc(view.dataset.doc), i = parseInt(b.getAttribute('data-i'), 10);
    switch (act) {
      case 'new-rechnung': case 'new-angebot': go('#/doc/' + newDoc(act.slice(4)).id); break;
      case 'filter': docFilter = b.getAttribute('data-v'); renderDocs(); break;
      case 'addpos': d.positions.push({ name: '', qty: 1, unit: 'Std', price: 0, type: 'arbeit' }); save(); keepScroll(function () { renderDoc(d.id); }); focusLast(); break;
      case 'delpos': d.positions.splice(i, 1); save(); keepScroll(function () { renderDoc(d.id); }); break;
      case 'up': if (i > 0) { d.positions.splice(i - 1, 0, d.positions.splice(i, 1)[0]); save(); keepScroll(function () { renderDoc(d.id); }); } break;
      case 'down': if (i < d.positions.length - 1) { d.positions.splice(i + 1, 0, d.positions.splice(i, 1)[0]); save(); keepScroll(function () { renderDoc(d.id); }); } break;
      case 'saveitem':
        var p = d.positions[i];
        if (!String(p.name || '').trim()) { toast('Najpierw wpisz opis pozycji'); break; }
        S.items.push({ id: uid(), name: p.name, unit: p.unit, price: parseNum(p.price), type: p.type }); save(); toast('Zapisano w moich pozycjach'); break;
      case 'picker': openPicker(d); break;
      case 'pick':
        var md = findDoc(document.getElementById('modal').dataset.doc), it = pickerItems()[i];
        md.positions.push({ name: it.name, qty: 1, unit: it.unit, price: it.price, type: it.type || 'sonstiges' }); save();
        b.classList.add('added'); toast('Dodano: ' + it.name.slice(0, 40)); break;
      case 'closemodal': closeModal(); if (d) keepScroll(function () { renderDoc(d.id); }); break;
      case 'toinvoice': d.status = 'angenommen'; go('#/doc/' + newDoc('rechnung', d).id); toast('Utworzono fakturę z oferty'); break;
      case 'duplicate': go('#/doc/' + newDoc(d.type, d).id); toast('Utworzono kopię'); break;
      case 'deldoc':
        if (confirm('Usunąć ' + d.number + '? Tego nie da się cofnąć.')) { S.docs = S.docs.filter(function (x) { return x.id !== d.id; }); save(); go('#/docs'); }
        break;
      case 'print':
        var old = document.title;
        document.title = d.number + (d.customer ? ' ' + d.customer.name : '');
        window.print(); setTimeout(function () { document.title = old; }, 1000);
        break;
      case 'delcust':
        var cid = document.getElementById('custform').dataset.id;
        if (confirm('Usunąć klienta? Wystawione dokumenty zostaną.')) { S.customers = S.customers.filter(function (x) { return x.id !== cid; }); save(); go('#/customers'); }
        break;
      case 'delitem':
        var iid = document.getElementById('itemform').dataset.id;
        S.items = S.items.filter(function (x) { return x.id !== iid; }); save(); go('#/items'); break;
      case 'tplone':
        var tv = window.VORLAGEN.filter(function (x) { return x.id === tplSel; })[0], t = tv.items[i];
        S.items.push(Object.assign({ id: uid() }, t)); save(); toast('Dodano do moich pozycji'); keepScroll(renderItems); break;
      case 'tplall':
        var tv2 = window.VORLAGEN.filter(function (x) { return x.id === tplSel; })[0];
        tv2.items.forEach(function (t2) { S.items.push(Object.assign({ id: uid() }, t2)); });
        save(); toast('Skopiowano ' + tv2.items.length + ' pozycji'); renderItems(); break;
      case 'dellogo': S.company.logo = ''; save(); renderCompany(); break;
      case 'export': exportData(); break;
      case 'wipe':
        if (confirm('Na pewno usunąć WSZYSTKIE dane? Najpierw pobierz kopię zapasową.') && confirm('Ostatnie potwierdzenie – usuwam wszystko.')) {
          S.company = defaults().company; S.customers = []; S.items = []; S.docs = []; save(); go('#/docs');
        }
        break;
    }
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'pk-q') return fillPicker();
    var d = findDoc(view.dataset.doc);
    if (t.hasAttribute('data-p') && d) {
      var p = d.positions[+t.getAttribute('data-p')], k = t.getAttribute('data-k');
      p[k] = (k === 'qty' || k === 'price') ? parseNum(t.value) : t.value;
      save(); refreshTotals(d); return;
    }
    if (t.hasAttribute('data-f') && d && t.type !== 'checkbox' && t.tagName !== 'SELECT') {
      var f = t.getAttribute('data-f');
      d[f] = f === 'paymentDays' ? (parseInt(t.value, 10) || 0) : t.value;
      save(); refreshTotals(d); return;
    }
    if (t.hasAttribute('data-c') && t.type !== 'checkbox' && t.tagName !== 'SELECT') {
      var ck = t.getAttribute('data-c');
      S.company[ck] = (ck === 'paymentDays' || ck === 'offerDays') ? (parseInt(t.value, 10) || 0) : t.value;
      save();
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target, d = findDoc(view.dataset.doc);
    if (t.id === 'pk-src') { pickerSrc = t.value; return fillPicker(); }
    if (t.getAttribute('data-act') === 'tplsel') { tplSel = t.value; return renderItems(); }
    if (t.id === 'logo' && t.files[0]) return loadLogo(t.files[0]);
    if (t.id === 'import' && t.files[0]) return importData(t.files[0]);
    if (t.hasAttribute('data-c') && (t.type === 'checkbox' || t.tagName === 'SELECT')) {
      S.company[t.getAttribute('data-c')] = t.type === 'checkbox' ? t.checked : t.value; save(); return;
    }
    if (t.hasAttribute('data-p') && t.tagName === 'SELECT' && d) {
      d.positions[+t.getAttribute('data-p')][t.getAttribute('data-k')] = t.value; save(); refreshTotals(d); return;
    }
    if (t.hasAttribute('data-f') && d && (t.type === 'checkbox' || t.tagName === 'SELECT')) {
      var f = t.getAttribute('data-f');
      if (t.type === 'checkbox') { d[f] = t.checked; save(); return; }
      if (f === 'customerId') {
        if (t.value === '__new') return go('#/customer/new?ret=' + d.id);
        var cu = findCustomer(t.value);
        d.customerId = t.value; d.customer = cu ? Object.assign({}, cu) : null;
        if (cu && d.type === 'rechnung') d.privateHint = cu.type !== 'firma';
      } else d[f] = t.value;
      save(); keepScroll(function () { renderDoc(d.id); });
    }
  });

  document.addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target, fd = new FormData(form), o = {};
    fd.forEach(function (v, k) { o[k] = String(v).trim(); });
    if (form.id === 'custform') {
      var id = form.dataset.id, ret = form.dataset.ret, c;
      if (id) { c = findCustomer(id); Object.assign(c, o); }
      else { c = Object.assign({ id: uid() }, o); S.customers.push(c); }
      if (ret) { var d = findDoc(ret); if (d) { d.customerId = c.id; d.customer = Object.assign({}, c); if (d.type === 'rechnung') d.privateHint = c.type !== 'firma'; } }
      save(); toast('Zapisano klienta'); go(ret ? '#/doc/' + ret : '#/customers');
    }
    if (form.id === 'itemform') {
      var iid = form.dataset.id, data = { name: o.name, unit: o.unit, price: parseNum(o.price), type: o.type };
      if (iid) Object.assign(S.items.filter(function (x) { return x.id === iid; })[0], data);
      else S.items.push(Object.assign({ id: uid() }, data));
      save(); toast('Zapisano pozycję'); go('#/items');
    }
  });

  function keepScroll(fn) { var y = window.scrollY; fn(); window.scrollTo(0, y); }
  function focusLast() {
    var ts = document.querySelectorAll('#positions textarea');
    if (ts.length) { ts[ts.length - 1].focus(); ts[ts.length - 1].scrollIntoView({ block: 'center' }); }
  }

  function loadLogo(file) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 500, s = Math.min(1, max / Math.max(img.width, img.height));
        var cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        S.company.logo = cv.toDataURL('image/png'); save(); renderCompany(); toast('Dodano logo');
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function exportData() {
    var blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'fakturka-kopia-' + today() + '.json'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function importData(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.docs)) throw new Error('format');
        if (!confirm('Wczytać kopię? Obecne dane zostaną zastąpione.')) return;
        S.company = Object.assign(defaults().company, data.company || {});
        S.customers = data.customers || []; S.items = data.items || []; S.docs = data.docs || [];
        save(); toast('Wczytano kopię'); go('#/docs');
      } catch (e) { toast('To nie jest poprawny plik kopii.'); }
    };
    r.readAsText(file);
  }

  route();
})();
