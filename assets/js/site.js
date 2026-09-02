/* Переключатель языка и фасад ютуб-трейлера.
   Без JS страница остаётся полностью читаемой на русском. */

(function () {
  'use strict';

  var STORE = 'ag-lang';
  var root = document.documentElement;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {
      /* приватный режим или заблокированное хранилище — молча работаем без памяти */
    }
    return null;
  }

  function pick() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'ru' || q === 'en') return q;
    var saved = store(STORE);
    if (saved === 'ru' || saved === 'en') return saved;
    return (navigator.language || 'ru').toLowerCase().indexOf('ru') === 0 ? 'ru' : 'en';
  }

  function apply(lang) {
    root.setAttribute('lang', lang);
    var title = document.querySelector('title');
    if (title) {
      var alt = title.getAttribute('data-' + lang);
      if (alt) title.textContent = alt;
    }
    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      var d = desc.getAttribute('data-' + lang);
      if (d) desc.setAttribute('content', d);
    }
    Array.prototype.forEach.call(document.querySelectorAll('.langtoggle'), function (b) {
      b.textContent = lang === 'ru' ? 'EN' : 'RU';
      b.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
    });
  }

  apply(pick());

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.langtoggle');
    if (toggle) {
      var next = root.getAttribute('lang') === 'ru' ? 'en' : 'ru';
      store(STORE, next);
      apply(next);
      return;
    }

    /* Трейлер подгружается только по клику: до этого ни одного запроса на YouTube */
    var facade = e.target.closest('.trailer[data-video]');
    if (facade) play(facade);
  });

  /* Кнопка-фасад: клавиатура работает сама, но подстрахуемся для не-button разметки */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var facade = e.target.closest && e.target.closest('.trailer[data-video]');
    if (facade && facade.tagName !== 'BUTTON') {
      e.preventDefault();
      play(facade);
    }
  });

  function play(facade) {
    var frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + facade.getAttribute('data-video') + '?autoplay=1&rel=0';
    frame.title = facade.getAttribute('data-title') || 'Trailer';
    frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    frame.allowFullscreen = true;

    var box = document.createElement('div');
    box.className = 'trailer';
    box.appendChild(frame);
    facade.replaceWith(box);
  }
})();
