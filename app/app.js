/* Fakturka – faktury i oferty dla firm w Niemczech.
 * Interfejs: PL / DE / EN (i18n.js). Dokumenty: DE / EN / PL – wybierane per dokument.
 * Dane zapisują się lokalnie w przeglądarce (localStorage).
 */
(function () {
  'use strict';

  // ---------- Pomocnicze ----------
  var KEY = 'fakturka.v1';
  var view = document.getElementById('view');

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
  function fmtDate(iso, lang) {
    if (!iso) return '';
    var p = iso.split('-');
    return ['en', 'fr', 'it'].indexOf(lang) > -1 ? p[2] + '/' + p[1] + '/' + p[0] : p[2] + '.' + p[1] + '.' + p[0];
  }
  var moneyF = {}, numF = {};
  function money(n, lang) {
    lang = lang || uiLang();
    if (!moneyF[lang]) moneyF[lang] = new Intl.NumberFormat(window.LANGS[lang].locale, { style: 'currency', currency: 'EUR' });
    return moneyF[lang].format(n);
  }
  function numFmt(n, lang) {
    if (!numF[lang]) numF[lang] = new Intl.NumberFormat(window.LANGS[lang].locale, { maximumFractionDigits: 3 });
    return numF[lang].format(n);
  }
  function fill(s, vars) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; }); }

  // ---------- Dane ----------
  function defaults() {
    return {
      settings: { uiLang: guessLang(), docLang: 'de', onboarded: false, copied: [] },
      company: {
        name: '', owner: '', street: '', zip: '', city: '', phone: '', email: '', web: '',
        taxNo: '', vatId: '', bank: '', iban: '', bic: '',
        kleinunternehmer: false, paymentDays: 14, offerDays: 30, branche: 'maler', logo: ''
      },
      customers: [], items: [], docs: []
    };
  }
  function guessLang() {
    var l = (navigator.language || 'pl').slice(0, 2).toLowerCase();
    return window.LANGS[l] ? l : 'pl';
  }
  var S = (function load() {
    var d = defaults();
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw) {
        d.settings = Object.assign(d.settings, raw.settings || {});
        d.company = Object.assign(d.company, raw.company || {});
        d.customers = raw.customers || []; d.items = raw.items || []; d.docs = raw.docs || [];
      }
    } catch (e) { /* brak dostępu do pamięci – działamy w pamięci RAM */ }
    d.docs.forEach(function (x) { if (!x.lang) x.lang = 'de'; });
    return d;
  })();

  function uiLang() { return window.UI[S.settings.uiLang] ? S.settings.uiLang : 'pl'; }
  function t(key, vars) {
    var s = window.UI[uiLang()][key];
    if (s == null) s = window.UI.pl[key];
    return s == null ? key : fill(s, vars);
  }
  function dt(lang, key, vars) { var s = (window.DOC[lang] || window.DOC.de)[key]; return fill(s, vars); }
  function unitLabel(u, lang) { var m = window.UNITS[u]; return (m && m[lang]) || u; }
  function tplItems(v, lang) {
    var col = { de: 0, pl: 1, en: 2 }[lang], extra = (window.TPL_LANG_COL || {})[lang];
    return v.items.map(function (r) {
      var name = col != null ? r[col] : (extra != null && window.TPL_I18N[r[0]] ? window.TPL_I18N[r[0]][extra] : '');
      return { name: name || r[0], unit: r[3], price: r[4], type: r[5] };
    });
  }
  function branchName(v) {
    var l = uiLang();
    return v.name[l] || ((window.VORLAGEN_NAMES || {})[v.id] || {})[l] || v.name.en;
  }
  function tplById(id) { return window.VORLAGEN.filter(function (x) { return x.id === id; })[0]; }

  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(S));
        var el = document.getElementById('saved');
        el.classList.add('show'); setTimeout(function () { el.classList.remove('show'); }, 900);
      } catch (e) { toast(t('save_fail')); }
    }, 250);
  }

  // ---------- Logika dokumentów ----------
  var VAT_RATE = { '19': 19, '7': 7, '13b': 0, klein: 0 };
  var TYPES = ['arbeit', 'material', 'sonstiges'];
  var STATUS = { rechnung: ['entwurf', 'offen', 'bezahlt'], angebot: ['entwurf', 'gesendet', 'angenommen', 'abgelehnt'] };

  function vatMode(doc) { return S.company.kleinunternehmer ? 'klein' : (doc.vat || '19'); }
  function calc(doc) {
    var mode = vatMode(doc), rate = VAT_RATE[mode], net = 0, labor = 0;
    var lines = doc.positions.map(function (p) {
      var x = r2(parseNum(p.qty) * parseNum(p.price));
      net += x; if (p.type === 'arbeit') labor += x;
      return x;
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
  function defIntro(type, lang) { return dt(lang, type === 'rechnung' ? 'intro_inv' : 'intro_off'); }
  function defOutro(type, lang) { return dt(lang, type === 'rechnung' ? 'outro_inv' : 'outro_off'); }
  function newDoc(type, from) {
    var c = S.company, date = today(), lang = from ? from.lang : (S.settings.docLang || 'de');
    var d = {
      id: uid(), type: type, lang: lang, number: nextNumber(type, date.slice(0, 4)), date: date,
      serviceDate: date, serviceTo: '', validUntil: addDays(date, c.offerDays || 30),
      paymentDays: c.paymentDays == null ? 14 : c.paymentDays,
      customerId: '', customer: null, positions: [], vat: '19',
      intro: defIntro(type, lang), outro: defOutro(type, lang),
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
    var el = document.getElementById('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 2200);
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function field(label, html, hint) {
    return '<label class="field"><span>' + label + '</span>' + html + (hint ? '<small>' + hint + '</small>' : '') + '</label>';
  }
  function input(attr, value) { return '<input ' + attr + ' value="' + esc(value) + '">'; }
  function langOptions(sel) {
    return LANG_ORDER.map(function (k) {
      var L = window.LANGS[k];
      return '<option value="' + k + '"' + (sel === k ? ' selected' : '') + '>' + L.flag + ' ' + L.name + '</option>';
    }).join('');
  }
  function renderChrome() {
    document.documentElement.lang = uiLang();
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      a.querySelector('.lbl').textContent = t('nav_' + a.getAttribute('data-nav'));
    });
    document.getElementById('saved').textContent = t('saved');
  }

  // ---------- Router ----------
  function route() {
    var h = location.hash.replace(/^#\/?/, '') || 'docs';
    var q = {}; var qi = h.indexOf('?');
    if (qi > -1) { h.slice(qi + 1).split('&').forEach(function (kv) { var p = kv.split('='); q[p[0]] = decodeURIComponent(p[1] || ''); }); h = h.slice(0, qi); }
    var parts = h.split('/'), section = parts[0], id = parts[1];
    if (!S.settings.onboarded && section !== 'welcome') return go('#/welcome');
    closeModal(); renderChrome();
    document.body.classList.toggle('is-preview', section === 'preview');
    document.body.classList.toggle('is-wizard', section === 'welcome');
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      var map = { doc: 'docs', preview: 'docs', customer: 'customers', item: 'items' };
      a.classList.toggle('active', a.getAttribute('data-nav') === (map[section] || section));
    });
    var r = {
      welcome: renderWizard, docs: renderDocs, doc: renderDoc, preview: renderPreview, customers: renderCustomers,
      customer: renderCustomer, items: renderItems, item: renderItem, company: renderCompany
    }[section] || renderDocs;
    view.dataset.doc = '';
    r(id, q);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  // ---------- Przewodnik (pierwsze uruchomienie) ----------
  var LANG_ORDER = ['pl', 'de', 'en', 'tr', 'ru', 'it', 'fr'].filter(function (k) { return window.LANGS[k]; });
  var DOC_ORDER = ['de', 'en', 'pl', 'tr', 'ru', 'it', 'fr'].filter(function (k) { return window.LANGS[k] && window.DOC[k]; });
  var WZ_STEPS = ['lang', 'doclang', 'branch', 'company', 'tax', 'bank', 'logo', 'done'];
  var wz = { step: 0, copy: true };
  function renderWizard() {
    var c = S.company, s = WZ_STEPS[wz.step], n = WZ_STEPS.length;
    var f = function (k, label, extra) { return field(label, input('data-c="' + k + '"' + (extra || ''), c[k])); };
    var h = '<div class="wz"><div class="wz-top"><div class="wz-bar"><i style="width:' + Math.round((wz.step + 1) / n * 100) + '%"></i></div>' +
      '<small class="muted">' + t('wz_step', { a: wz.step + 1, b: n }) + '</small></div>';
    if (s === 'lang') {
      h += '<h1>' + t('wz_lang_t') + '</h1><p>' + t('wz_lang_p') + '</p><div class="wz-choices two">' +
        LANG_ORDER.map(function (k) {
          var L = window.LANGS[k];
          return '<button class="wz-choice' + (uiLang() === k ? ' on' : '') + '" data-act="wz-lang" data-v="' + k + '"><span class="big">' + L.flag + '</span>' + L.name + '</button>';
        }).join('') + '</div>';
    } else if (s === 'doclang') {
      h += '<h1>' + t('wz_doc_t') + '</h1><p>' + t('wz_doc_p') + '</p><div class="wz-choices two">' +
        DOC_ORDER.map(function (k) {
          var L = window.LANGS[k];
          return '<button class="wz-choice' + (S.settings.docLang === k ? ' on' : '') + '" data-act="wz-doclang" data-v="' + k + '"><span class="big">' + L.flag + '</span>' + L.name +
            '<small>' + esc(dt(k, 'invoice')) + ' · ' + esc(dt(k, 'offer')) + '</small></button>';
        }).join('') + '</div><div class="tip">' + t('wz_doc_tip') + '</div>';
    } else if (s === 'branch') {
      h += '<h1>' + t('wz_branch_t') + '</h1><p>' + t('wz_branch_p') + '</p><div class="wz-grid">' +
        window.VORLAGEN.map(function (v) {
          return '<button class="wz-choice small' + (c.branche === v.id ? ' on' : '') + '" data-act="wz-branch" data-v="' + v.id + '"><span class="big">' + v.icon + '</span>' + esc(branchName(v)) + '</button>';
        }).join('') + '</div>' +
        '<label class="check"><input type="checkbox" id="wz-copy"' + (wz.copy ? ' checked' : '') + '> ' + t('wz_branch_copy') + '</label>';
    } else if (s === 'company') {
      h += '<h1>' + t('wz_company_t') + '</h1><p>' + t('wz_company_p') + '</p>' +
        f('name', t('company_name')) + f('owner', t('owner')) + f('street', t('street_req')) +
        '<div class="grid2">' + f('zip', t('zip_req'), ' inputmode="numeric"') + f('city', t('city_req')) + '</div>' +
        '<div class="grid2">' + f('phone', t('phone'), ' type="tel"') + f('email', t('email'), ' type="email"') + '</div>';
    } else if (s === 'tax') {
      h += '<h1>' + t('wz_tax_t') + '</h1><p>' + t('wz_tax_p') + '</p>' +
        '<h2>' + t('wz_klein_q') + '</h2><div class="wz-choices two">' +
        '<button class="wz-choice small' + (!c.kleinunternehmer ? ' on' : '') + '" data-act="wz-klein" data-v="0">' + t('wz_klein_no') + '</button>' +
        '<button class="wz-choice small' + (c.kleinunternehmer ? ' on' : '') + '" data-act="wz-klein" data-v="1">' + t('wz_klein_yes') + '</button></div>' +
        '<div class="tip">' + t('wz_klein_help') + '</div>' +
        f('taxNo', t('tax_no')) + f('vatId', t('vat_id')) + '<div class="tip">' + t('wz_taxno_help') + '</div>';
    } else if (s === 'bank') {
      h += '<h1>' + t('wz_bank_t') + '</h1><p>' + t('wz_bank_p') + '</p>' +
        f('iban', t('iban'), ' autocapitalize="characters"') + f('bank', t('bank_name')) + f('bic', t('bic'), ' autocapitalize="characters"');
    } else if (s === 'logo') {
      h += '<h1>' + t('wz_logo_t') + '</h1><p>' + t('wz_logo_p') + '</p>';
      if (c.logo) h += '<p>' + t('wz_logo_ok') + '</p><div class="logo-demo"><img src="' + c.logo + '" alt=""><div class="muted small">' + esc(c.name) + '<br>' + esc(c.street) + '</div></div>';
      h += '<div class="tip">' + t('wz_logo_how') + '</div>' +
        '<label class="btn ' + (c.logo ? '' : 'primary ') + 'big file">' + (c.logo ? t('wz_logo_change') : t('wz_logo_btn')) + '<input type="file" accept="image/*" id="logo" hidden></label>';
    } else {
      h += '<h1>' + t('wz_done_t') + '</h1><p>' + t('wz_done_p') + '</p><ul class="wz-tips">' +
        [1, 2, 3, 4].map(function (i) { return '<li>' + t('wz_done_' + i) + '</li>'; }).join('') + '</ul>' +
        '<div class="actions"><button class="btn primary big" data-act="wz-finish" data-v="offer">' + t('wz_first_offer') + '</button>' +
        '<button class="btn big" data-act="wz-finish" data-v="app">' + t('wz_go_app') + '</button></div>';
    }
    if (s !== 'done') {
      h += '<div class="wz-nav">' + (wz.step > 0 ? '<button class="btn" data-act="wz-prev">' + t('wz_back') + '</button>' : '<span></span>') +
        '<button class="btn primary" data-act="wz-next">' + t('wz_next') + '</button></div>';
      if (wz.step > 0) h += '<button class="link center-block" data-act="wz-finish" data-v="app">' + t('wz_skip') + '</button>';
    }
    view.innerHTML = h + '</div>';
  }
  function wizardLeaveStep() {
    if (WZ_STEPS[wz.step] === 'branch' && wz.copy) {
      var id = S.company.branche;
      if (S.settings.copied.indexOf(id) === -1) {
        tplItems(tplById(id), S.settings.docLang).forEach(function (it) { S.items.push(Object.assign({ id: uid() }, it)); });
        S.settings.copied.push(id);
      }
    }
    save();
  }

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
    if (!S.company.name) h += '<a class="banner" href="#/company">' + t('banner_setup') + '</a>';
    h += '<div class="stats"><div><small>' + t('to_pay') + '</small><strong>' + money(open) + '</strong>' +
      (overdue ? '<em class="warn">' + t('n_overdue', { n: overdue }) + '</em>' : '') + '</div>' +
      '<div><small>' + t('paid_year', { y: year }) + '</small><strong>' + money(paid) + '</strong></div></div>';
    h += '<div class="row2"><button class="btn primary" data-act="new-rechnung">' + t('new_invoice') + '</button>' +
      '<button class="btn" data-act="new-angebot">' + t('new_offer') + '</button></div>';
    h += '<div class="chips">' + [['all', 'f_all'], ['rechnung', 'f_inv'], ['angebot', 'f_off']].map(function (f) {
      return '<button class="chip' + (docFilter === f[0] ? ' on' : '') + '" data-act="filter" data-v="' + f[0] + '">' + t(f[1]) + '</button>';
    }).join('') + '</div>';
    if (!list.length) {
      h += '<div class="empty">' + t('empty_docs') + '</div>';
    } else {
      h += list.map(function (d) {
        var c = calc(d), st = isOverdue(d) ? '<span class="badge red">' + t('overdue') + '</span>'
          : '<span class="badge s-' + d.status + '">' + t('st_' + d.status) + '</span>';
        return '<a class="card doc" href="#/doc/' + d.id + '">' +
          '<div class="doc-l"><span class="tag ' + d.type + '">' + t(d.type === 'rechnung' ? 'invoice' : 'offer') + '</span> <b>' + esc(d.number) + '</b>' +
          (d.lang !== 'de' ? ' <span class="muted small">' + window.LANGS[d.lang].flag + '</span>' : '') +
          '<div class="muted">' + esc(d.customer ? d.customer.name : t('no_customer')) + ' · ' + fmtDate(d.date, uiLang()) + '</div></div>' +
          '<div class="doc-r"><b>' + money(c.gross) + '</b>' + st + '</div></a>';
      }).join('');
    }
    view.innerHTML = h;
  }

  // ---------- Edytor dokumentu ----------
  function renderDoc(id) {
    var d = findDoc(id);
    if (!d) return go('#/docs');
    var isR = d.type === 'rechnung', c = calc(d);
    var custOpts = '<option value="">' + t('choose_customer') + '</option>' + S.customers.map(function (cu) {
      return '<option value="' + cu.id + '"' + (cu.id === d.customerId ? ' selected' : '') + '>' + esc(cu.name) + '</option>';
    }).join('') + '<option value="__new">' + t('new_customer_opt') + '</option>';
    var statusOpts = STATUS[d.type].map(function (k) {
      return '<option value="' + k + '"' + (d.status === k ? ' selected' : '') + '>' + t('st_' + k) + '</option>';
    }).join('');

    var h = '<div class="head"><a href="#/docs" class="back">' + t('back_docs') + '</a><h1>' + t(isR ? 'invoice' : 'offer') + '</h1></div>';
    h += '<section class="box"><div class="grid2">' +
      field(t(isR ? 'inv_no' : 'off_no'), input('data-f="number"', d.number)) +
      field(t('status'), '<select data-f="status">' + statusOpts + '</select>') +
      field(t('issue_date'), input('type="date" data-f="date"', d.date)) +
      (isR
        ? field(t('pay_days'), input('type="number" min="0" data-f="paymentDays" inputmode="numeric"', d.paymentDays), t('pay_until') + ' <span id="due">' + fmtDate(dueDate(d), uiLang()) + '</span>')
        : field(t('valid_until'), input('type="date" data-f="validUntil"', d.validUntil))) +
      (isR ? field(t('service_date'), input('type="date" data-f="serviceDate"', d.serviceDate), t('service_hint')) +
        field(t('service_to'), input('type="date" data-f="serviceTo"', d.serviceTo), t('optional')) : '') +
      '</div>' + field(t('doc_lang'), '<select data-f="lang">' + langOptions(d.lang) + '</select>') + '</section>';

    h += '<section class="box"><h2>' + t('customer') + '</h2>' + field(t('customer'), '<select data-f="customerId">' + custOpts + '</select>');
    if (d.customer) {
      h += '<div class="muted small">' + nl2br([d.customer.street, ((d.customer.zip || '') + ' ' + (d.customer.city || '')).trim()].filter(Boolean).join('\n')) +
        ' · ' + t(d.customer.type === 'firma' ? 'business' : 'private') + '</div>';
    }
    h += '</section>';

    h += '<section class="box"><h2>' + t('positions') + '</h2><div id="positions">';
    h += d.positions.map(function (p, i) {
      var typeOpts = TYPES.map(function (k) { return '<option value="' + k + '"' + (p.type === k ? ' selected' : '') + '>' + t('t_' + k) + '</option>'; }).join('');
      return '<div class="pos">' +
        '<div class="pos-head"><span class="pos-nr">' + (i + 1) + '</span><select data-p="' + i + '" data-k="type">' + typeOpts + '</select>' +
        '<span class="sp"></span><button class="icon" data-act="up" data-i="' + i + '" title="' + t('up') + '">↑</button>' +
        '<button class="icon" data-act="down" data-i="' + i + '" title="' + t('down') + '">↓</button>' +
        '<button class="icon danger" data-act="delpos" data-i="' + i + '" title="' + t('del') + '">✕</button></div>' +
        '<textarea rows="2" data-p="' + i + '" data-k="name" placeholder="' + t('desc_ph') + '">' + esc(p.name) + '</textarea>' +
        '<div class="pos-row">' +
        field(t('qty'), input('data-p="' + i + '" data-k="qty" inputmode="decimal"', fmtIn(p.qty))) +
        field(t('unit'), input('data-p="' + i + '" data-k="unit" list="units"', p.unit)) +
        field(t('price_net'), input('data-p="' + i + '" data-k="price" inputmode="decimal"', fmtIn(p.price))) +
        '<div class="pos-total" id="lt-' + i + '">' + money(c.lines[i]) + '</div></div>' +
        '<button class="link" data-act="saveitem" data-i="' + i + '">' + t('save_to_mine') + '</button></div>';
    }).join('');
    if (!d.positions.length) h += '<div class="empty small">' + t('first_pos') + '</div>';
    h += '</div><div class="row2"><button class="btn primary" data-act="picker">' + t('from_tpl') + '</button>' +
      '<button class="btn" data-act="addpos">' + t('own_pos') + '</button></div></section>';

    h += '<section class="box"><h2>' + t('tax_sum') + '</h2>';
    if (S.company.kleinunternehmer) {
      h += '<p class="muted small">' + t('klein_info') + '</p>';
    } else {
      h += field(t('vat_rate'), '<select data-f="vat">' + ['19', '7', '13b'].map(function (k) {
        return '<option value="' + k + '"' + (d.vat === k ? ' selected' : '') + '>' + t('vat_' + k) + '</option>';
      }).join('') + '</select>', d.vat === '13b' ? t('rc_hint') : '');
    }
    h += '<div id="totals">' + totalsHTML(c) + '</div>';
    h += '<label class="check"><input type="checkbox" data-f="show35a"' + (d.show35a ? ' checked' : '') + '> ' + t('show35a') + '</label>';
    if (isR) h += '<label class="check"><input type="checkbox" data-f="privateHint"' + (d.privateHint ? ' checked' : '') + '> ' + t('private_hint') + '</label>';
    h += '</section>';

    h += '<section class="box"><h2>' + t('texts') + '</h2>' +
      field(t('intro'), '<textarea rows="4" data-f="intro">' + esc(d.intro) + '</textarea>') +
      field(t('outro'), '<textarea rows="3" data-f="outro">' + esc(d.outro) + '</textarea>') + '</section>';

    h += '<div class="actions">' +
      '<a class="btn primary big" href="#/preview/' + d.id + '">' + t('preview_pdf') + '</a>' +
      (isR ? '' : '<button class="btn" data-act="toinvoice">' + t('to_invoice') + '</button>') +
      '<button class="btn" data-act="duplicate">' + t('duplicate') + '</button>' +
      '<button class="btn danger" data-act="deldoc">' + t('delete') + '</button></div>';
    h += '<p class="muted small center">' + t('autosave') + '</p>';
    view.innerHTML = h;
    view.dataset.doc = d.id;
  }
  function totalsHTML(c) {
    var h = '<table class="totals"><tr><td>' + t('net') + '</td><td>' + money(c.net) + '</td></tr>';
    if (c.mode === '19' || c.mode === '7') h += '<tr><td>' + t('vat') + ' ' + c.rate + '%</td><td>' + money(c.vat) + '</td></tr>';
    h += '<tr class="sum"><td>' + t('total') + '</td><td>' + money(c.gross) + '</td></tr>';
    if (c.labor) h += '<tr class="muted"><td>' + t('labor_incl') + '</td><td>' + money(c.laborGross) + '</td></tr>';
    return h + '</table>';
  }
  function refreshTotals(d) {
    var c = calc(d);
    c.lines.forEach(function (x, i) { var el = document.getElementById('lt-' + i); if (el) el.textContent = money(x); });
    var tt = document.getElementById('totals'); if (tt) tt.innerHTML = totalsHTML(c);
    var due = document.getElementById('due'); if (due) due.textContent = fmtDate(dueDate(d), uiLang());
  }

  // ---------- Okno wyboru pozycji ----------
  var pickerSrc = null, pickerLang = 'de';
  function openPicker(d) {
    if (!pickerSrc) pickerSrc = S.items.length ? 'mine' : (S.company.branche || 'maler');
    pickerLang = d.lang;
    var m = document.getElementById('modal');
    var opts = '<option value="mine"' + (pickerSrc === 'mine' ? ' selected' : '') + '>' + t('my_items_opt', { n: S.items.length }) + '</option>' +
      window.VORLAGEN.map(function (v) { return '<option value="' + v.id + '"' + (pickerSrc === v.id ? ' selected' : '') + '>' + v.icon + ' ' + esc(branchName(v)) + '</option>'; }).join('');
    m.innerHTML = '<div class="sheet"><div class="sheet-head"><h2>' + t('add_items') + '</h2><button class="icon" data-act="closemodal">✕</button></div>' +
      '<select id="pk-src">' + opts + '</select><input id="pk-q" placeholder="' + t('search') + '" autocomplete="off">' +
      '<div id="pk-list" class="pk-list"></div><button class="btn primary big" data-act="closemodal">' + t('done') + '</button></div>';
    m.hidden = false; m.dataset.doc = d.id;
    fillPicker();
  }
  function pickerItems() {
    if (pickerSrc === 'mine') return S.items;
    var v = tplById(pickerSrc);
    return v ? tplItems(v, pickerLang) : [];
  }
  function fillPicker() {
    var q = (document.getElementById('pk-q').value || '').toLowerCase();
    var items = pickerItems().map(function (it, i) { return { it: it, i: i }; })
      .filter(function (o) { return !q || o.it.name.toLowerCase().indexOf(q) > -1; });
    var el = document.getElementById('pk-list');
    if (!items.length) { el.innerHTML = '<div class="empty small">' + t(pickerSrc === 'mine' ? 'no_mine' : 'no_results') + '</div>'; return; }
    el.innerHTML = items.map(function (o) {
      return '<button class="pk-item" data-act="pick" data-i="' + o.i + '"><span>' + esc(o.it.name) +
        '<small>' + t('t_' + (o.it.type || 'sonstiges')) + '</small></span><b>' + money(o.it.price) + '/' + esc(unitLabel(o.it.unit, uiLang())) + '</b></button>';
    }).join('');
  }
  function closeModal() { var m = document.getElementById('modal'); m.hidden = true; m.innerHTML = ''; }

  // ---------- Podgląd i wydruk ----------
  function renderPreview(id) {
    var d = findDoc(id);
    if (!d) return go('#/docs');
    var warns = checkDoc(d);
    view.innerHTML = '<div class="toolbar"><a href="#/doc/' + d.id + '" class="btn">' + t('edit') + '</a>' +
      '<button class="btn primary" data-act="print">' + t('print_pdf') + '</button></div>' +
      (warns.length ? '<div class="warnbox"><b>' + t('check_before') + '</b><ul>' + warns.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul></div>' : '') +
      '<p class="muted small center noprint">' + t('phone_hint') + '</p>' +
      '<div class="paper-wrap" id="pw"><div class="paper" id="paper" lang="' + d.lang + '">' + docHTML(d) + '</div></div>';
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
    if (!c.name || !c.street || !c.zip || !c.city) w.push(t('w_company'));
    if (d.type === 'rechnung' && !c.taxNo && !c.vatId) w.push(t('w_tax'));
    if (d.type === 'rechnung' && !c.iban) w.push(t('w_iban'));
    if (!d.customer) w.push(t('w_customer'));
    if (!d.positions.length) w.push(t('w_nopos'));
    if (d.positions.some(function (p) { return !String(p.name || '').trim(); })) w.push(t('w_nodesc'));
    if (vatMode(d) === '13b' && d.customer && (d.customer.type !== 'firma' || !d.customer.vatId)) w.push(t('w_rc'));
    if (d.type === 'rechnung' && d.lang !== 'de') w.push(t('w_lang'));
    return w;
  }

  function docHTML(d) {
    var c = S.company, cu = d.customer || {}, k = calc(d), isR = d.type === 'rechnung', L = d.lang || 'de';
    var D = function (key, vars) { return dt(L, key, vars); };
    var M = function (n) { return money(n, L); };
    var F = function (iso) { return fmtDate(iso, L); };
    var title = D(isR ? 'invoice' : 'offer');
    var senderLine = [c.name, c.street, (c.zip + ' ' + c.city).trim()].filter(Boolean).join(' · ');
    var h = '<div class="dp">';
    h += '<div class="dp-top"><div class="dp-logo">' + (c.logo ? '<img src="' + c.logo + '" alt="">' : '<div class="dp-name">' + esc(c.name) + '</div>') + '</div>' +
      '<div class="dp-company"><b>' + esc(c.name) + '</b>' + (c.owner && c.owner !== c.name ? '<br>' + esc(c.owner) : '') +
      '<br>' + esc(c.street) + '<br>' + esc((c.zip + ' ' + c.city).trim()) +
      (c.phone ? '<br>' + D('tel') + ' ' + esc(c.phone) : '') + (c.email ? '<br>' + esc(c.email) : '') + (c.web ? '<br>' + esc(c.web) : '') + '</div></div>';
    h += '<div class="dp-mid"><div class="dp-addr"><div class="dp-sender">' + esc(senderLine) + '</div>' +
      '<div>' + esc(cu.name) + (cu.contact ? '<br>' + esc(cu.contact) : '') + '<br>' + esc(cu.street) + '<br>' + esc(((cu.zip || '') + ' ' + (cu.city || '')).trim()) +
      (cu.country && cu.country !== 'Deutschland' ? '<br>' + esc(cu.country) : '') + '</div></div>' +
      '<table class="dp-meta">' +
      '<tr><td>' + D(isR ? 'inv_no' : 'off_no') + '</td><td>' + esc(d.number) + '</td></tr>' +
      '<tr><td>' + D('date') + '</td><td>' + F(d.date) + '</td></tr>' +
      (isR ? (d.serviceTo
        ? '<tr><td>' + D('service_period') + '</td><td>' + F(d.serviceDate) + ' – ' + F(d.serviceTo) + '</td></tr>'
        : '<tr><td>' + D('service_date') + '</td><td>' + F(d.serviceDate || d.date) + '</td></tr>')
        : '<tr><td>' + D('valid_until') + '</td><td>' + F(d.validUntil) + '</td></tr>') +
      (d.offerRef ? '<tr><td>' + D('offer_ref') + '</td><td>' + esc(d.offerRef) + '</td></tr>' : '') +
      (cu.vatId ? '<tr><td>' + D('cust_vat') + '</td><td>' + esc(cu.vatId) + '</td></tr>' : '') +
      '</table></div>';
    h += '<h1 class="dp-title">' + title + ' ' + esc(d.number) + '</h1>';
    if (d.intro) h += '<p class="dp-text">' + nl2br(d.intro) + '</p>';
    h += '<table class="dp-items"><thead><tr><th>' + D('pos') + '</th><th>' + D('desc') + '</th><th class="r">' + D('qty') + '</th><th>' + D('unit') +
      '</th><th class="r">' + D('unit_price') + '</th><th class="r">' + D('amount') + '</th></tr></thead><tbody>';
    h += d.positions.map(function (p, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + nl2br(p.name) + '</td><td class="r">' + numFmt(parseNum(p.qty), L) + '</td><td>' + esc(unitLabel(p.unit, L)) +
        '</td><td class="r">' + M(parseNum(p.price)) + '</td><td class="r">' + M(k.lines[i]) + '</td></tr>';
    }).join('');
    h += '</tbody></table>';
    h += '<table class="dp-sum"><tr><td>' + D('net') + '</td><td>' + M(k.net) + '</td></tr>';
    if (k.mode === '19' || k.mode === '7') h += '<tr><td>' + D('plus_vat', { r: k.rate }) + '</td><td>' + M(k.vat) + '</td></tr>';
    if (k.mode === '13b') h += '<tr><td>' + D('vat0') + '</td><td>' + M(0) + '</td></tr>';
    h += '<tr class="sum"><td>' + D(isR ? 'inv_total' : 'off_total') + '</td><td>' + M(k.gross) + '</td></tr></table>';

    var notes = [];
    if (k.mode === 'klein') notes.push(D('klein'));
    if (k.mode === '13b') notes.push(D('rc'));
    if (d.show35a && k.labor > 0) notes.push(D('labor', { x: M(k.laborGross), v: k.rate ? D('labor_vat') : '' }));
    if (isR) {
      notes.push(D('pay', { x: M(k.gross), d: F(dueDate(d)), acc: c.iban ? D('pay_acc') : '', n: esc(d.number) }));
      if (d.privateHint) notes.push(D('keep'));
    } else {
      notes.push(D('valid', { d: F(d.validUntil) }));
    }
    h += '<div class="dp-notes">' + notes.map(function (n) { return '<p>' + n + '</p>'; }).join('') + '</div>';
    if (d.outro) h += '<p class="dp-text">' + nl2br(d.outro) + '<br><br>' + esc(c.owner || c.name) + '</p>';
    h += '<div class="dp-foot"><div><b>' + esc(c.name) + '</b><br>' + esc(c.street) + '<br>' + esc((c.zip + ' ' + c.city).trim()) + '</div>' +
      '<div>' + (c.taxNo ? D('tax_no') + ': ' + esc(c.taxNo) + '<br>' : '') + (c.vatId ? D('vat_id') + ': ' + esc(c.vatId) + '<br>' : '') +
      (c.phone ? D('tel') + ' ' + esc(c.phone) + '<br>' : '') + (c.email ? esc(c.email) : '') + '</div>' +
      '<div>' + (c.bank ? esc(c.bank) + '<br>' : '') + (c.iban ? 'IBAN: ' + esc(c.iban) + '<br>' : '') + (c.bic ? 'BIC: ' + esc(c.bic) : '') + '</div></div>';
    return h + '</div>';
  }

  // ---------- Klienci ----------
  function renderCustomers() {
    var h = '<div class="head"><h1>' + t('customers') + '</h1><a class="btn primary" href="#/customer/new">' + t('new_btn') + '</a></div>';
    if (!S.customers.length) h += '<div class="empty">' + t('no_customers') + '</div>';
    h += S.customers.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (c) {
      var n = S.docs.filter(function (d) { return d.customerId === c.id; }).length;
      return '<a class="card" href="#/customer/' + c.id + '"><b>' + esc(c.name) + '</b><div class="muted">' +
        esc([c.city, t(c.type === 'firma' ? 'business' : 'private'), t('n_docs', { n: n })].filter(Boolean).join(' · ')) + '</div></a>';
    }).join('');
    view.innerHTML = h;
  }
  function renderCustomer(id, q) {
    var c = id === 'new' ? { id: '', type: 'privat', country: 'Deutschland' } : findCustomer(id);
    if (!c) return go('#/customers');
    var f = function (k, label, extra) { return field(label, input('name="' + k + '"' + (extra || ''), c[k] || '')); };
    view.innerHTML = '<div class="head"><a class="back" href="' + (q.ret ? '#/doc/' + esc(q.ret) : '#/customers') + '">' + t('back') + '</a><h1>' + t(id === 'new' ? 'new_customer' : 'customer_title') + '</h1></div>' +
      '<form id="custform" class="box" data-id="' + esc(c.id) + '" data-ret="' + esc(q.ret || '') + '">' +
      '<div class="seg"><label><input type="radio" name="type" value="privat"' + (c.type !== 'firma' ? ' checked' : '') + '> ' + t('c_private') + '</label>' +
      '<label><input type="radio" name="type" value="firma"' + (c.type === 'firma' ? ' checked' : '') + '> ' + t('c_business') + '</label></div>' +
      f('name', t('name_req'), ' required') + f('contact', t('contact')) +
      f('street', t('street')) + '<div class="grid2">' + f('zip', t('zip'), ' inputmode="numeric"') + f('city', t('city')) + '</div>' +
      f('country', t('country')) + '<div class="grid2">' + f('email', t('email'), ' type="email"') + f('phone', t('phone'), ' type="tel"') + '</div>' +
      f('vatId', t('vatid_biz')) +
      '<div class="actions"><button class="btn primary big" type="submit">' + t('save') + '</button>' +
      (c.id ? '<button class="btn danger" type="button" data-act="delcust">' + t('delete') + '</button>' : '') + '</div></form>';
  }

  // ---------- Pozycje i szablony ----------
  var tplSel = null;
  function renderItems() {
    if (!tplSel) tplSel = S.company.branche || 'maler';
    var v = tplById(tplSel) || window.VORLAGEN[0], items = tplItems(v, S.settings.docLang);
    var h = '<div class="head"><h1>' + t('my_items') + '</h1><a class="btn primary" href="#/item/new">' + t('new_btn') + '</a></div>';
    h += '<p class="muted small">' + t('items_intro') + '</p>';
    if (!S.items.length) h += '<div class="empty small">' + t('items_empty') + '</div>';
    h += S.items.map(function (it) {
      return '<a class="card row" href="#/item/' + it.id + '"><span>' + esc(it.name) + '<small class="muted"> · ' + t('t_' + (it.type || 'sonstiges')) + '</small></span><b>' +
        money(it.price) + '/' + esc(unitLabel(it.unit, uiLang())) + '</b></a>';
    }).join('');
    h += '<h2 class="sec">' + t('templates') + '</h2><select data-act="tplsel">' + window.VORLAGEN.map(function (x) {
      return '<option value="' + x.id + '"' + (x.id === v.id ? ' selected' : '') + '>' + x.icon + ' ' + esc(branchName(x)) + '</option>';
    }).join('') + '</select>';
    h += '<p class="muted small">' + t('tpl_note') + ' ' + window.LANGS[S.settings.docLang].flag + '</p>';
    h += '<button class="btn" data-act="tplall">' + t('copy_all') + '</button>';
    h += items.map(function (it, i) {
      return '<div class="card row"><span>' + esc(it.name) + '<small class="muted"> · ' + money(it.price) + '/' + esc(unitLabel(it.unit, uiLang())) + '</small></span>' +
        '<button class="icon" data-act="tplone" data-i="' + i + '" title="' + t('add_to_mine') + '">＋</button></div>';
    }).join('');
    view.innerHTML = h;
  }
  function renderItem(id) {
    var it = id === 'new' ? { id: '', name: '', unit: 'Std', price: '', type: 'arbeit' } : S.items.filter(function (x) { return x.id === id; })[0];
    if (!it) return go('#/items');
    view.innerHTML = '<div class="head"><a class="back" href="#/items">' + t('back_items') + '</a><h1>' + t(it.id ? 'edit_item' : 'new_item') + '</h1></div>' +
      '<form id="itemform" class="box" data-id="' + esc(it.id) + '">' +
      field(t('desc_req'), '<textarea name="name" rows="2" required>' + esc(it.name) + '</textarea>') +
      '<div class="grid2">' + field(t('unit'), input('name="unit" list="units"', it.unit)) +
      field(t('price_net'), input('name="price" inputmode="decimal" required', fmtIn(it.price))) + '</div>' +
      field(t('kind'), '<select name="type">' + TYPES.map(function (k) { return '<option value="' + k + '"' + (it.type === k ? ' selected' : '') + '>' + t('t_' + k) + '</option>'; }).join('') + '</select>') +
      '<div class="actions"><button class="btn primary big" type="submit">' + t('save') + '</button>' +
      (it.id ? '<button class="btn danger" type="button" data-act="delitem">' + t('delete') + '</button>' : '') + '</div></form>';
  }

  // ---------- Firma ----------
  function renderCompany() {
    var c = S.company;
    var f = function (k, label, extra, hint) { return field(label, input('data-c="' + k + '"' + (extra || ''), c[k]), hint); };
    view.innerHTML = '<div class="head"><h1>' + t('your_company') + '</h1></div>' +
      '<section class="box"><div class="grid2">' +
      field(t('app_lang'), '<select data-s="uiLang">' + langOptions(uiLang()) + '</select>') +
      field(t('doc_lang_def'), '<select data-s="docLang">' + langOptions(S.settings.docLang) + '</select>') + '</div>' +
      '<button class="btn" data-act="restart-guide">' + t('restart_guide') + '</button></section>' +
      '<section class="box"><h2>' + t('doc_data') + '</h2>' +
      f('name', t('company_name')) + f('owner', t('owner')) + f('street', t('street_req')) +
      '<div class="grid2">' + f('zip', t('zip_req'), ' inputmode="numeric"') + f('city', t('city_req')) + '</div>' +
      '<div class="grid2">' + f('phone', t('phone'), ' type="tel"') + f('email', t('email'), ' type="email"') + '</div>' + f('web', t('web')) +
      '<div class="grid2">' + f('taxNo', t('tax_no'), '', t('tax_no_hint')) + f('vatId', t('vat_id'), '', t('vat_id_hint')) + '</div>' +
      '<label class="check"><input type="checkbox" data-c="kleinunternehmer"' + (c.kleinunternehmer ? ' checked' : '') + '> ' + t('klein') + '</label>' +
      '</section>' +
      '<section class="box"><h2>' + t('bank_acc') + '</h2>' + f('bank', t('bank_name')) + f('iban', t('iban')) + f('bic', t('bic')) + '</section>' +
      '<section class="box"><h2>' + t('logo') + '</h2>' + (c.logo ? '<img class="logo-prev" src="' + c.logo + '" alt=""><button class="btn" data-act="dellogo">' + t('del_logo') + '</button> ' : '') +
      '<label class="btn file">' + t('choose_logo') + '<input type="file" accept="image/*" id="logo" hidden></label></section>' +
      '<section class="box"><h2>' + t('settings') + '</h2><div class="grid2">' +
      f('paymentDays', t('pay_days_def'), ' type="number" min="0" inputmode="numeric"') +
      f('offerDays', t('offer_days_def'), ' type="number" min="0" inputmode="numeric"') + '</div>' +
      field(t('my_branch'), '<select data-c="branche">' + window.VORLAGEN.map(function (v) {
        return '<option value="' + v.id + '"' + (c.branche === v.id ? ' selected' : '') + '>' + v.icon + ' ' + esc(branchName(v)) + '</option>';
      }).join('') + '</select>', t('my_branch_hint')) + '</section>' +
      '<section class="box"><h2>' + t('backup') + '</h2><p class="muted small">' + t('backup_info') + '</p>' +
      '<div class="row2"><button class="btn" data-act="export">' + t('download') + '</button><label class="btn file">' + t('upload') + '<input type="file" accept="application/json,.json" id="import" hidden></label></div>' +
      '<button class="btn danger" data-act="wipe">' + t('wipe') + '</button></section>' +
      '<p class="legal small center"><a href="../poradnik.html">' + t('guide') + '</a> · <a href="../impressum.html">Impressum</a> · <a href="../datenschutz.html">Datenschutz</a></p>';
  }

  // ---------- Zdarzenia ----------
  function rerenderDoc(d) { keepScroll(function () { renderDoc(d.id); }); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.tagName === 'SELECT') return;
    var act = b.getAttribute('data-act'), d = findDoc(view.dataset.doc), i = parseInt(b.getAttribute('data-i'), 10), v = b.getAttribute('data-v');
    switch (act) {
      // przewodnik
      case 'wz-lang': S.settings.uiLang = v; save(); renderChrome(); renderWizard(); break;
      case 'wz-doclang': S.settings.docLang = v; save(); renderWizard(); break;
      case 'wz-branch': S.company.branche = v; tplSel = v; pickerSrc = null; save(); keepScroll(renderWizard); break;
      case 'wz-klein': S.company.kleinunternehmer = v === '1'; save(); keepScroll(renderWizard); break;
      case 'wz-next': wizardLeaveStep(); wz.step = Math.min(wz.step + 1, WZ_STEPS.length - 1); renderWizard(); window.scrollTo(0, 0); break;
      case 'wz-prev': wz.step = Math.max(wz.step - 1, 0); renderWizard(); window.scrollTo(0, 0); break;
      case 'wz-finish':
        if (WZ_STEPS[wz.step] === 'branch') wizardLeaveStep();
        S.settings.onboarded = true; save(); wz.step = 0;
        if (v === 'offer') go('#/doc/' + newDoc('angebot').id); else go('#/docs');
        break;
      case 'restart-guide': S.settings.onboarded = false; wz.step = 0; save(); go('#/welcome'); break;
      // dokumenty
      case 'new-rechnung': case 'new-angebot': go('#/doc/' + newDoc(act.slice(4)).id); break;
      case 'filter': docFilter = v; renderDocs(); break;
      case 'addpos': d.positions.push({ name: '', qty: 1, unit: 'Std', price: 0, type: 'arbeit' }); save(); rerenderDoc(d); focusLast(); break;
      case 'delpos': d.positions.splice(i, 1); save(); rerenderDoc(d); break;
      case 'up': if (i > 0) { d.positions.splice(i - 1, 0, d.positions.splice(i, 1)[0]); save(); rerenderDoc(d); } break;
      case 'down': if (i < d.positions.length - 1) { d.positions.splice(i + 1, 0, d.positions.splice(i, 1)[0]); save(); rerenderDoc(d); } break;
      case 'saveitem':
        var p = d.positions[i];
        if (!String(p.name || '').trim()) { toast(t('desc_first')); break; }
        S.items.push({ id: uid(), name: p.name, unit: p.unit, price: parseNum(p.price), type: p.type }); save(); toast(t('added_mine')); break;
      case 'picker': openPicker(d); break;
      case 'pick':
        var md = findDoc(document.getElementById('modal').dataset.doc), it = pickerItems()[i];
        md.positions.push({ name: it.name, qty: 1, unit: it.unit, price: it.price, type: it.type || 'sonstiges' }); save();
        b.classList.add('added'); toast(t('added', { x: it.name.slice(0, 40) })); break;
      case 'closemodal': closeModal(); if (d) rerenderDoc(d); break;
      case 'toinvoice': d.status = 'angenommen'; go('#/doc/' + newDoc('rechnung', d).id); toast(t('from_offer')); break;
      case 'duplicate': go('#/doc/' + newDoc(d.type, d).id); toast(t('copy_created')); break;
      case 'deldoc':
        if (confirm(t('confirm_del_doc', { n: d.number }))) { S.docs = S.docs.filter(function (x) { return x.id !== d.id; }); save(); go('#/docs'); }
        break;
      case 'print':
        var old = document.title;
        document.title = d.number + (d.customer ? ' ' + d.customer.name : '');
        window.print(); setTimeout(function () { document.title = old; }, 1000);
        break;
      // klienci, pozycje
      case 'delcust':
        var cid = document.getElementById('custform').dataset.id;
        if (confirm(t('confirm_del_cust'))) { S.customers = S.customers.filter(function (x) { return x.id !== cid; }); save(); go('#/customers'); }
        break;
      case 'delitem':
        var iid = document.getElementById('itemform').dataset.id;
        S.items = S.items.filter(function (x) { return x.id !== iid; }); save(); go('#/items'); break;
      case 'tplone':
        S.items.push(Object.assign({ id: uid() }, tplItems(tplById(tplSel), S.settings.docLang)[i])); save(); toast(t('added_mine')); keepScroll(renderItems); break;
      case 'tplall':
        var all = tplItems(tplById(tplSel), S.settings.docLang);
        all.forEach(function (x) { S.items.push(Object.assign({ id: uid() }, x)); });
        save(); toast(t('copied_n', { n: all.length })); renderItems(); break;
      // firma
      case 'dellogo': S.company.logo = ''; save(); renderCompany(); break;
      case 'export': exportData(); break;
      case 'wipe':
        if (confirm(t('wipe1')) && confirm(t('wipe2'))) {
          var keepLang = S.settings.uiLang;
          var fresh = defaults(); S.settings = fresh.settings; S.settings.uiLang = keepLang;
          S.company = fresh.company; S.customers = []; S.items = []; S.docs = []; save(); go('#/welcome');
        }
        break;
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'pk-q') return fillPicker();
    var d = findDoc(view.dataset.doc);
    if (el.hasAttribute('data-p') && d && el.tagName !== 'SELECT') {
      var p = d.positions[+el.getAttribute('data-p')], k = el.getAttribute('data-k');
      p[k] = (k === 'qty' || k === 'price') ? parseNum(el.value) : el.value;
      save(); refreshTotals(d); return;
    }
    if (el.hasAttribute('data-f') && d && el.type !== 'checkbox' && el.tagName !== 'SELECT') {
      var f = el.getAttribute('data-f');
      d[f] = f === 'paymentDays' ? (parseInt(el.value, 10) || 0) : el.value;
      save(); refreshTotals(d); return;
    }
    if (el.hasAttribute('data-c') && el.type !== 'checkbox' && el.tagName !== 'SELECT') {
      var ck = el.getAttribute('data-c');
      S.company[ck] = (ck === 'paymentDays' || ck === 'offerDays') ? (parseInt(el.value, 10) || 0) : el.value;
      save();
    }
  });

  document.addEventListener('change', function (e) {
    var el = e.target, d = findDoc(view.dataset.doc);
    if (el.id === 'pk-src') { pickerSrc = el.value; return fillPicker(); }
    if (el.id === 'wz-copy') { wz.copy = el.checked; return; }
    if (el.getAttribute('data-act') === 'tplsel') { tplSel = el.value; return renderItems(); }
    if (el.id === 'logo' && el.files[0]) return loadLogo(el.files[0]);
    if (el.id === 'import' && el.files[0]) return importData(el.files[0]);
    if (el.hasAttribute('data-s')) { S.settings[el.getAttribute('data-s')] = el.value; save(); renderChrome(); return renderCompany(); }
    if (el.hasAttribute('data-c') && (el.type === 'checkbox' || el.tagName === 'SELECT')) {
      S.company[el.getAttribute('data-c')] = el.type === 'checkbox' ? el.checked : el.value; save(); return;
    }
    if (el.hasAttribute('data-p') && el.tagName === 'SELECT' && d) {
      d.positions[+el.getAttribute('data-p')][el.getAttribute('data-k')] = el.value; save(); refreshTotals(d); return;
    }
    if (el.hasAttribute('data-f') && d && (el.type === 'checkbox' || el.tagName === 'SELECT')) {
      var f = el.getAttribute('data-f');
      if (el.type === 'checkbox') { d[f] = el.checked; save(); return; }
      if (f === 'customerId') {
        if (el.value === '__new') return go('#/customer/new?ret=' + d.id);
        var cu = findCustomer(el.value);
        d.customerId = el.value; d.customer = cu ? Object.assign({}, cu) : null;
        if (cu && d.type === 'rechnung') d.privateHint = cu.type !== 'firma';
      } else if (f === 'lang') {
        // standardowe teksty zmieniamy na nowy język; własne teksty zostają
        if (d.intro === defIntro(d.type, d.lang)) d.intro = defIntro(d.type, el.value);
        if (d.outro === defOutro(d.type, d.lang)) d.outro = defOutro(d.type, el.value);
        d.lang = el.value;
      } else d[f] = el.value;
      save(); rerenderDoc(d);
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
      save(); toast(t('saved_cust')); go(ret ? '#/doc/' + ret : '#/customers');
    }
    if (form.id === 'itemform') {
      var iid = form.dataset.id, data = { name: o.name, unit: o.unit, price: parseNum(o.price), type: o.type };
      if (iid) Object.assign(S.items.filter(function (x) { return x.id === iid; })[0], data);
      else S.items.push(Object.assign({ id: uid() }, data));
      save(); toast(t('saved_item')); go('#/items');
    }
  });

  function keepScroll(fn) { var y = window.scrollY; fn(); window.scrollTo(0, y); }
  function focusLast() {
    var ts = document.querySelectorAll('#positions textarea');
    if (ts.length) { ts[ts.length - 1].focus(); ts[ts.length - 1].scrollIntoView({ block: 'center' }); }
  }

  // Logo: zmniejszamy i automatycznie przycinamy białe / przezroczyste marginesy.
  function loadLogo(file) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 800, s = Math.min(1, max / Math.max(img.width, img.height));
        var cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        var ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0, cv.width, cv.height);
        cv = trimCanvas(cv);
        var s2 = Math.min(1, 500 / Math.max(cv.width, cv.height));
        var out = document.createElement('canvas'); out.width = Math.round(cv.width * s2); out.height = Math.round(cv.height * s2);
        out.getContext('2d').drawImage(cv, 0, 0, out.width, out.height);
        S.company.logo = out.toDataURL('image/png'); save(); toast(t('logo_added'));
        if (document.body.classList.contains('is-wizard')) renderWizard(); else renderCompany();
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function trimCanvas(cv) {
    var ctx = cv.getContext('2d'), w = cv.width, h = cv.height, data;
    try { data = ctx.getImageData(0, 0, w, h).data; } catch (e) { return cv; }
    var top = h, left = w, right = -1, bottom = -1;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4, a = data[i + 3];
        var bg = a < 20 || (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235);
        if (!bg) { if (x < left) left = x; if (x > right) right = x; if (y < top) top = y; if (y > bottom) bottom = y; }
      }
    }
    if (right < 0) return cv;
    var m = Math.round(Math.max(w, h) * 0.02);
    left = Math.max(0, left - m); top = Math.max(0, top - m); right = Math.min(w - 1, right + m); bottom = Math.min(h - 1, bottom + m);
    var out = document.createElement('canvas'); out.width = right - left + 1; out.height = bottom - top + 1;
    out.getContext('2d').drawImage(cv, left, top, out.width, out.height, 0, 0, out.width, out.height);
    return out;
  }
  function exportData() {
    var blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'fakturka-backup-' + today() + '.json'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function importData(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.docs)) throw new Error('format');
        if (!confirm(t('import_confirm'))) return;
        var fresh = defaults();
        S.settings = Object.assign(fresh.settings, data.settings || {}, { onboarded: true });
        S.company = Object.assign(fresh.company, data.company || {});
        S.customers = data.customers || []; S.items = data.items || []; S.docs = data.docs || [];
        S.docs.forEach(function (x) { if (!x.lang) x.lang = 'de'; });
        save(); toast(t('imported')); go('#/docs');
      } catch (e) { toast(t('not_json')); }
    };
    r.readAsText(file);
  }

  route();
})();
