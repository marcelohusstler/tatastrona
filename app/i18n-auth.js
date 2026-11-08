// Teksty logowania (hasło) i numeracji dokumentów – 7 języków.
(function () {
  var T = {
    pl: {
      login_t: 'Logowanie', login_p: 'Wpisz hasło, żeby otworzyć aplikację.', password: 'Hasło', password2: 'Powtórz hasło',
      login_btn: 'Zaloguj', login_wrong: 'Nieprawidłowe hasło.',
      login_forgot: 'Nie pamiętasz hasła? Nie da się go odzyskać – usuń dane tej strony w przeglądarce i wczytaj kopię zapasową.',
      setpw_t: 'Ustaw hasło', setpw_p: 'Hasło będzie potrzebne przy każdym otwarciu aplikacji na tym urządzeniu. Zapisz je w bezpiecznym miejscu.',
      setpw_btn: 'Zapisz hasło', pw_short: 'Hasło musi mieć co najmniej 4 znaki.', pw_mismatch: 'Hasła nie są takie same.',
      sec_title: 'Logowanie', sec_off: 'Aplikacja nie jest chroniona hasłem.', sec_on: 'Aplikacja jest chroniona hasłem.',
      pw_change: 'Zmień hasło', pw_remove: 'Usuń hasło', logout: 'Wyloguj', pw_saved: 'Hasło zapisane', pw_removed: 'Hasło usunięte',
      confirm_rm_pw: 'Usunąć hasło? Aplikacja otworzy się bez logowania.',
      sec_note: 'Hasło chroni aplikację na tym urządzeniu. Dane nie są jeszcze zapisywane w chmurze.',
      num_title: 'Numeracja dokumentów', prefix_inv: 'Prefiks faktur', prefix_off: 'Prefiks ofert',
      start_inv: 'Następny nr faktury', start_off: 'Następny nr oferty', num_hint: 'Następny numer: {x}'
    },
    de: {
      login_t: 'Anmelden', login_p: 'Passwort eingeben, um die App zu öffnen.', password: 'Passwort', password2: 'Passwort wiederholen',
      login_btn: 'Anmelden', login_wrong: 'Falsches Passwort.',
      login_forgot: 'Passwort vergessen? Es kann nicht wiederhergestellt werden – Websitedaten im Browser löschen und eine Sicherung laden.',
      setpw_t: 'Passwort festlegen', setpw_p: 'Das Passwort wird bei jedem Öffnen der App auf diesem Gerät benötigt. Bewahre es sicher auf.',
      setpw_btn: 'Passwort speichern', pw_short: 'Das Passwort muss mindestens 4 Zeichen haben.', pw_mismatch: 'Die Passwörter stimmen nicht überein.',
      sec_title: 'Anmeldung', sec_off: 'Die App ist nicht mit einem Passwort geschützt.', sec_on: 'Die App ist mit einem Passwort geschützt.',
      pw_change: 'Passwort ändern', pw_remove: 'Passwort entfernen', logout: 'Abmelden', pw_saved: 'Passwort gespeichert', pw_removed: 'Passwort entfernt',
      confirm_rm_pw: 'Passwort entfernen? Die App öffnet sich dann ohne Anmeldung.',
      sec_note: 'Das Passwort schützt die App auf diesem Gerät. Die Daten werden noch nicht in der Cloud gespeichert.',
      num_title: 'Nummernkreise', prefix_inv: 'Präfix Rechnungen', prefix_off: 'Präfix Angebote',
      start_inv: 'Nächste Rechnungsnr.', start_off: 'Nächste Angebotsnr.', num_hint: 'Nächste Nummer: {x}'
    },
    en: {
      login_t: 'Log in', login_p: 'Enter your password to open the app.', password: 'Password', password2: 'Repeat password',
      login_btn: 'Log in', login_wrong: 'Wrong password.',
      login_forgot: 'Forgot your password? It cannot be recovered – clear this site’s data in your browser and load a backup.',
      setpw_t: 'Set a password', setpw_p: 'The password is needed every time you open the app on this device. Keep it somewhere safe.',
      setpw_btn: 'Save password', pw_short: 'The password must have at least 4 characters.', pw_mismatch: 'The passwords don’t match.',
      sec_title: 'Login', sec_off: 'The app is not protected by a password.', sec_on: 'The app is protected by a password.',
      pw_change: 'Change password', pw_remove: 'Remove password', logout: 'Log out', pw_saved: 'Password saved', pw_removed: 'Password removed',
      confirm_rm_pw: 'Remove the password? The app will open without logging in.',
      sec_note: 'The password protects the app on this device. Data is not stored in the cloud yet.',
      num_title: 'Document numbering', prefix_inv: 'Invoice prefix', prefix_off: 'Quote prefix',
      start_inv: 'Next invoice no.', start_off: 'Next quote no.', num_hint: 'Next number: {x}'
    },
    ru: {
      login_t: 'Вход', login_p: 'Введите пароль, чтобы открыть приложение.', password: 'Пароль', password2: 'Повторите пароль',
      login_btn: 'Войти', login_wrong: 'Неверный пароль.',
      login_forgot: 'Забыли пароль? Восстановить его нельзя – удалите данные сайта в браузере и загрузите резервную копию.',
      setpw_t: 'Установите пароль', setpw_p: 'Пароль понадобится при каждом открытии приложения на этом устройстве. Сохраните его в надёжном месте.',
      setpw_btn: 'Сохранить пароль', pw_short: 'Пароль должен содержать не менее 4 символов.', pw_mismatch: 'Пароли не совпадают.',
      sec_title: 'Вход', sec_off: 'Приложение не защищено паролем.', sec_on: 'Приложение защищено паролем.',
      pw_change: 'Изменить пароль', pw_remove: 'Удалить пароль', logout: 'Выйти', pw_saved: 'Пароль сохранён', pw_removed: 'Пароль удалён',
      confirm_rm_pw: 'Удалить пароль? Приложение будет открываться без входа.',
      sec_note: 'Пароль защищает приложение на этом устройстве. Данные пока не хранятся в облаке.',
      num_title: 'Нумерация документов', prefix_inv: 'Префикс счетов', prefix_off: 'Префикс предложений',
      start_inv: 'Следующий № счёта', start_off: 'Следующий № предложения', num_hint: 'Следующий номер: {x}'
    },
    tr: {
      login_t: 'Giriş', login_p: 'Uygulamayı açmak için şifrenizi girin.', password: 'Şifre', password2: 'Şifreyi tekrarla',
      login_btn: 'Giriş yap', login_wrong: 'Yanlış şifre.',
      login_forgot: 'Şifrenizi mi unuttunuz? Kurtarılamaz – tarayıcıda bu sitenin verilerini silin ve bir yedek yükleyin.',
      setpw_t: 'Şifre belirleyin', setpw_p: 'Bu cihazda uygulamayı her açtığınızda şifre gerekir. Güvenli bir yerde saklayın.',
      setpw_btn: 'Şifreyi kaydet', pw_short: 'Şifre en az 4 karakter olmalıdır.', pw_mismatch: 'Şifreler eşleşmiyor.',
      sec_title: 'Giriş', sec_off: 'Uygulama şifre ile korunmuyor.', sec_on: 'Uygulama şifre ile korunuyor.',
      pw_change: 'Şifreyi değiştir', pw_remove: 'Şifreyi kaldır', logout: 'Çıkış yap', pw_saved: 'Şifre kaydedildi', pw_removed: 'Şifre kaldırıldı',
      confirm_rm_pw: 'Şifre kaldırılsın mı? Uygulama girişsiz açılacak.',
      sec_note: 'Şifre uygulamayı bu cihazda korur. Veriler henüz bulutta saklanmıyor.',
      num_title: 'Belge numaralandırma', prefix_inv: 'Fatura ön eki', prefix_off: 'Teklif ön eki',
      start_inv: 'Sonraki fatura no.', start_off: 'Sonraki teklif no.', num_hint: 'Sonraki numara: {x}'
    },
    it: {
      login_t: 'Accesso', login_p: 'Inserisci la password per aprire l’app.', password: 'Password', password2: 'Ripeti password',
      login_btn: 'Accedi', login_wrong: 'Password errata.',
      login_forgot: 'Password dimenticata? Non si può recuperare – cancella i dati del sito nel browser e carica un backup.',
      setpw_t: 'Imposta una password', setpw_p: 'La password servirà ogni volta che apri l’app su questo dispositivo. Conservala in un posto sicuro.',
      setpw_btn: 'Salva password', pw_short: 'La password deve avere almeno 4 caratteri.', pw_mismatch: 'Le password non coincidono.',
      sec_title: 'Accesso', sec_off: 'L’app non è protetta da password.', sec_on: 'L’app è protetta da password.',
      pw_change: 'Cambia password', pw_remove: 'Rimuovi password', logout: 'Esci', pw_saved: 'Password salvata', pw_removed: 'Password rimossa',
      confirm_rm_pw: 'Rimuovere la password? L’app si aprirà senza accesso.',
      sec_note: 'La password protegge l’app su questo dispositivo. I dati non sono ancora salvati nel cloud.',
      num_title: 'Numerazione documenti', prefix_inv: 'Prefisso fatture', prefix_off: 'Prefisso preventivi',
      start_inv: 'Prossimo n. fattura', start_off: 'Prossimo n. preventivo', num_hint: 'Prossimo numero: {x}'
    },
    fr: {
      login_t: 'Connexion', login_p: 'Saisissez votre mot de passe pour ouvrir l’application.', password: 'Mot de passe', password2: 'Répéter le mot de passe',
      login_btn: 'Se connecter', login_wrong: 'Mot de passe incorrect.',
      login_forgot: 'Mot de passe oublié ? Il ne peut pas être récupéré – effacez les données du site dans le navigateur et chargez une sauvegarde.',
      setpw_t: 'Définir un mot de passe', setpw_p: 'Le mot de passe sera demandé à chaque ouverture de l’application sur cet appareil. Conservez-le en lieu sûr.',
      setpw_btn: 'Enregistrer le mot de passe', pw_short: 'Le mot de passe doit contenir au moins 4 caractères.', pw_mismatch: 'Les mots de passe ne correspondent pas.',
      sec_title: 'Connexion', sec_off: 'L’application n’est pas protégée par un mot de passe.', sec_on: 'L’application est protégée par un mot de passe.',
      pw_change: 'Changer le mot de passe', pw_remove: 'Supprimer le mot de passe', logout: 'Se déconnecter', pw_saved: 'Mot de passe enregistré', pw_removed: 'Mot de passe supprimé',
      confirm_rm_pw: 'Supprimer le mot de passe ? L’application s’ouvrira sans connexion.',
      sec_note: 'Le mot de passe protège l’application sur cet appareil. Les données ne sont pas encore stockées dans le cloud.',
      num_title: 'Numérotation des documents', prefix_inv: 'Préfixe factures', prefix_off: 'Préfixe devis',
      start_inv: 'Prochain n° de facture', start_off: 'Prochain n° de devis', num_hint: 'Prochain numéro : {x}'
    }
  };
  var V24 = {
    pl: ['7,8% – rolnik ryczałtowy (§24)', 'Tylko dla gospodarstw rozliczających się ryczałtem. Stawkę państwo sprawdza co roku – w razie wątpliwości zapytaj doradcę podatkowego.', 'Stawka ryczałtowa dla rolników (§ 24 niemieckiej ustawy o VAT): {r}%.'],
    de: ['7,8 % – Durchschnittssatz Landwirte (§24)', 'Nur für pauschalierende land- und forstwirtschaftliche Betriebe. Der Satz wird jährlich überprüft – im Zweifel den Steuerberater fragen.', 'Durchschnittssatz gemäß § 24 UStG: {r} %.'],
    en: ['7.8% – farmers’ flat rate (§24)', 'Only for farms using the flat-rate scheme. The rate is reviewed every year – if in doubt, ask your tax advisor.', 'Flat-rate scheme for farmers (§ 24 UStG): {r} %.'],
    ru: ['7,8% – фермер, средняя ставка (§24)', 'Только для хозяйств на паушальной системе. Ставка пересматривается ежегодно – при сомнениях спросите консультанта.', 'Средняя ставка для сельхозпроизводителей согласно § 24 UStG: {r} %.'],
    tr: ['%7,8 – çiftçi ortalama oranı (§24)', 'Sadece götürü usulde vergilendirilen tarım işletmeleri için. Oran her yıl gözden geçirilir – emin değilseniz danışmanınıza sorun.', '§ 24 UStG uyarınca çiftçiler için ortalama oran: %{r}.'],
    it: ['7,8% – forfait agricoltori (§24)', 'Solo per aziende agricole in regime forfettario. L’aliquota viene rivista ogni anno – in caso di dubbi chiedi al consulente.', 'Aliquota forfettaria agricoltori ai sensi del § 24 UStG: {r} %.'],
    fr: ['7,8 % – forfait agricole (§24)', 'Uniquement pour les exploitations au régime forfaitaire. Le taux est révisé chaque année – en cas de doute, demandez à votre conseiller.', 'Taux forfaitaire agricole selon le § 24 UStG : {r} %.']
  };
  Object.keys(V24).forEach(function (l) {
    if (T[l]) { T[l].vat_24 = V24[l][0]; T[l].vat24_hint = V24[l][1]; }
    if (window.DOC[l]) window.DOC[l].lf = V24[l][2];
  });
  Object.keys(T).forEach(function (l) { if (window.UI[l]) Object.assign(window.UI[l], T[l]); });
})();
