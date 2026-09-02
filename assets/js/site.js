/* Переключатель языка и превью проектов на карточках.
   Без JS страница остаётся полностью читаемой на русском,
   а карточки показывают статичный кадр вместо видео. */

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
    if (!toggle) return;
    var next = root.getAttribute('lang') === 'ru' ? 'en' : 'ru';
    store(STORE, next);
    apply(next);
  });

  /* ---- превью на карточках ----
     Мышь есть: по умолчанию постер, трейлер идёт под курсором.
     Мыши нет (телефон, планшет): наводить нечем, поэтому играем, когда карточка в экране. */

  var previews = Array.prototype.slice.call(document.querySelectorAll('.card-media video'));
  if (!previews.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  function start(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* браузер не дал — остаётся постер */ });
  }

  function stop(v) {
    v.pause();
    v.load(); /* возвращает постер вместо застывшего кадра */
  }

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    previews.forEach(function (v) {
      var card = v.closest('.card') || v;
      card.addEventListener('mouseenter', function () { start(v); });
      card.addEventListener('mouseleave', function () { stop(v); });
      /* с клавиатуры карточка тоже оживает */
      card.addEventListener('focus', function () { start(v); });
      card.addEventListener('blur', function () { stop(v); });
    });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    previews.forEach(start);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) start(entry.target);
      else entry.target.pause();
    });
  }, { threshold: 0.4 });

  previews.forEach(function (v) { io.observe(v); });
})();
