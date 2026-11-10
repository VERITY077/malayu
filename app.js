(function () {
  'use strict';

  var COURSE = window.COURSE;
  var LS_KEY = 'ml_state_v3';
  var LEGACY_KEY = 'ml_state_v2';

  /* ---------------- utils ---------------- */
  function $(id) { return document.getElementById(id); }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(base, n) {
    var d = new Date(base + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  /* 用于听写判分：忽略空格、标点、大小写 */
  function normLoose(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  /* ---------------- number to Malay ---------------- */
  var ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan'];
  function toMalay(n) {
    n = Math.floor(n);
    if (n === 0) return 'sifar';
    if (n < 10) return ONES[n];
    if (n === 10) return 'sepuluh';
    if (n === 11) return 'sebelas';
    if (n < 20) return ONES[n - 10] + ' belas';
    if (n < 100) {
      var t = Math.floor(n / 10), r = n % 10;
      return (t === 1 ? 'sepuluh' : ONES[t] + ' puluh') + (r ? ' ' + ONES[r] : '');
    }
    if (n < 200) { var r1 = n - 100; return 'seratus' + (r1 ? ' ' + toMalay(r1) : ''); }
    if (n < 1000) {
      var h = Math.floor(n / 100), r2 = n % 100;
      return ONES[h] + ' ratus' + (r2 ? ' ' + toMalay(r2) : '');
    }
    if (n < 2000) { var r3 = n - 1000; return 'seribu' + (r3 ? ' ' + toMalay(r3) : ''); }
    if (n < 1000000) {
      var th = Math.floor(n / 1000), r4 = n % 1000;
      return toMalay(th) + ' ribu' + (r4 ? ' ' + toMalay(r4) : '');
    }
    var m = Math.floor(n / 1000000), r5 = n % 1000000;
    return (m === 1 ? 'sejuta' : toMalay(m) + ' juta') + (r5 ? ' ' + toMalay(r5) : '');
  }

  /* ---------------- state ---------------- */
  function defaultState() {
    return {
      profile: { onboarded: false, startWeek: 1, name: '', avatar: '🙂' },
      progress: { unitIndex: 0, learnIdx: 0 },
      srs: {}, log: {}, settings: { rate: 0.9, voice: '', micConsent: false },
      updatedAt: 0
    };
  }
  function loadState() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        var old = localStorage.getItem(LEGACY_KEY);
        if (old) {
          var o = JSON.parse(old), d0 = defaultState();
          d0.srs = o.srs || {};
          d0.log = o.log || {};
          if (o.settings) {
            d0.settings.rate = o.settings.rate || 0.9;
            d0.settings.voice = o.settings.voice || '';
          }
          return d0;
        }
        return defaultState();
      }
      var s = JSON.parse(raw), d = defaultState();
      s.profile = Object.assign(d.profile, s.profile || {});
      s.progress = Object.assign(d.progress, s.progress || {});
      s.settings = Object.assign(d.settings, s.settings || {});
      s.srs = s.srs || {};
      s.log = s.log || {};
      return s;
    } catch (e) { return defaultState(); }
  }
  var S = loadState();
  function persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {}
  }
  var cloudTimer = null;
  function queueCloud() {
    if (!window.Cloud || !Cloud.configured() || !Cloud.currentUser()) return;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(function () {
      Cloud.pushState(S).catch(function () {});
    }, 800);
  }
  var resetting = false;
  function save() {
    if (resetting) return;
    S.updatedAt = Date.now();
    persist();
    queueCloud();
  }

  /* ---------------- content ---------------- */
  function lessonOf(id) {
    return COURSE.lessons.filter(function (l) { return l.id === id; })[0] || null;
  }
  function buildUnits() {
    var out = [], i = 0;
    COURSE.lessons.forEach(function (l) {
      (l.groups || []).forEach(function (g) {
        var words = g.words.map(function (ms) {
          return (l.vocab || []).filter(function (v) { return v.ms === ms; })[0];
        }).filter(Boolean);
        if (!words.length) return;
        out.push({
          i: i++, lessonId: l.id, week: l.week, code: l.code,
          zh: l.zh, file: l.file, title: g.title, words: words
        });
      });
    });
    return out;
  }
  var UNITS = buildUnits();
  function currentUnit() { return UNITS[S.progress.unitIndex] || null; }
  function currentLesson() {
    var u = currentUnit();
    if (u) return lessonOf(u.lessonId);
    var last = UNITS[UNITS.length - 1];
    return last ? lessonOf(last.lessonId) : null;
  }
  function allVocab() {
    var out = [];
    COURSE.lessons.forEach(function (l) {
      (l.vocab || []).forEach(function (v) {
        out.push(Object.assign({}, v, { lessonId: l.id, lessonCode: l.code }));
      });
    });
    return out;
  }
  function sentencesOfLesson(l) { return l ? (l.sentences || []) : []; }
  /* 当前课没有例句时，借最近一周的例句来练，并标注来源 */
  function withLesson(list, l) {
    return (list || []).map(function (s, i) {
      return Object.assign({}, s, { lessonId: l.id, index: i });
    });
  }
  function sentenceContext() {
    var l = currentLesson();
    var list = sentencesOfLesson(l);
    if (list.length) return { list: withLesson(list, l), lesson: l, fallback: false };
    var w = l ? l.week : 0;
    var cands = COURSE.lessons.filter(function (x) { return (x.sentences || []).length; });
    cands.sort(function (a, b) { return Math.abs(a.week - w) - Math.abs(b.week - w); });
    if (!cands.length) return { list: [], lesson: l, fallback: false };
    return { list: withLesson(cands[0].sentences, cands[0]), lesson: cands[0], fallback: true };
  }
  function totalWords() { return UNITS.reduce(function (n, u) { return n + u.words.length; }, 0); }
  function learnedWords() {
    var n = 0;
    for (var i = 0; i < S.progress.unitIndex && i < UNITS.length; i++) n += UNITS[i].words.length;
    return n;
  }

  /* ---------------- stats ---------------- */
  function logActivity(correct) {
    var k = todayStr();
    if (!S.log[k]) S.log[k] = { n: 0, c: 0 };
    S.log[k].n++;
    if (correct) S.log[k].c++;
    save();
  }
  function totalReviews() {
    var n = 0;
    for (var k in S.log) n += S.log[k].n;
    return n;
  }
  function accuracy() {
    var n = 0, c = 0;
    for (var k in S.log) { n += S.log[k].n; c += S.log[k].c; }
    return n ? Math.round(c / n * 100) + '%' : '—';
  }
  function streak() {
    var d = todayStr(), s = 0;
    if (!S.log[d]) d = addDays(d, -1);
    while (S.log[d]) { s++; d = addDays(d, -1); }
    return s;
  }

  /* ---------------- TTS ---------------- */
  var voices = [];
  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices() || [];
    var sel = $('voice');
    if (!sel) return;
    var preferred = voices.filter(function (v) { return /^ms/i.test(v.lang); });
    var others = voices.filter(function (v) { return /^id/i.test(v.lang) || /^en/i.test(v.lang); });
    var list = preferred.concat(others);
    sel.innerHTML = '';
    if (!list.length) {
      var o = document.createElement('option');
      o.value = ''; o.textContent = '系统默认';
      sel.appendChild(o);
      return;
    }
    list.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v.name;
      o.textContent = v.name + ' · ' + v.lang + (/^ms/i.test(v.lang) ? ' ✓' : '');
      sel.appendChild(o);
    });
    if (S.settings.voice) sel.value = S.settings.voice;
    else if (preferred.length) { sel.value = preferred[0].name; S.settings.voice = preferred[0].name; }
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) { toast('当前浏览器不支持语音合成'); return; }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ms-MY';
    u.rate = Number(S.settings.rate) || 0.9;
    var v = voices.filter(function (x) { return x.name === S.settings.voice; })[0];
    if (v) { u.voice = v; u.lang = v.lang; }
    window.speechSynthesis.speak(u);
  }
  var audioPlayer = null;
  function playAudio(url, fallbackText) {
    if (!audioPlayer) audioPlayer = new Audio();
    audioPlayer.pause();
    audioPlayer.onerror = function () { speak(fallbackText); };
    audioPlayer.src = url;
    var p = audioPlayer.play();
    if (p && p.catch) p.catch(function () { speak(fallbackText); });
  }
  function vocabAudio(lessonId, ms) {
    return 'audio/vocab/' + lessonId + '-' + slugify(ms) + '.m4a';
  }
  function sentenceAudio(lessonId, idx) {
    return 'audio/sent/' + lessonId + '-s' + (idx + 1) + '.m4a';
  }
  function numberToClips(n) {
    n = Math.floor(n);
    if (n === 0) return ['n0'];
    if (n < 10) return ['n' + n];
    if (n === 10) return ['n10'];
    if (n === 11) return ['n11'];
    if (n < 20) return ['n' + (n - 10), 'belas'];
    if (n < 100) {
      var t = Math.floor(n / 10), r = n % 10;
      return ['t' + (t * 10)].concat(r ? ['n' + r] : []);
    }
    if (n < 200) { var r1 = n - 100; return ['seratus'].concat(r1 ? numberToClips(r1) : []); }
    if (n < 1000) {
      var h = Math.floor(n / 100), r2 = n % 100;
      return ['n' + h, 'ratus'].concat(r2 ? numberToClips(r2) : []);
    }
    if (n < 2000) { var r3 = n - 1000; return ['seribu'].concat(r3 ? numberToClips(r3) : []); }
    if (n < 1000000) {
      var th = Math.floor(n / 1000), r4 = n % 1000;
      return numberToClips(th).concat(['ribu']).concat(r4 ? numberToClips(r4) : []);
    }
    var m = Math.floor(n / 1000000), r5 = n % 1000000;
    return (m === 1 ? ['sejuta'] : numberToClips(m).concat(['juta'])).concat(r5 ? numberToClips(r5) : []);
  }
  var seqAudio = null, seqToken = 0;
  function playClips(clips, fallbackText) {
    if (!clips || !clips.length) { speak(fallbackText); return; }
    if (!seqAudio) seqAudio = new Audio();
    var token = ++seqToken;
    try { seqAudio.pause(); } catch (e) {}
    var i = 0;
    function next() {
      if (token !== seqToken || i >= clips.length) return;
      seqAudio.onerror = function () { if (token === seqToken) speak(fallbackText); };
      seqAudio.onended = function () { i++; next(); };
      seqAudio.src = 'audio/num/' + clips[i] + '.m4a';
      var p = seqAudio.play();
      if (p && p.catch) p.catch(function () { if (token === seqToken) speak(fallbackText); });
    }
    next();
  }
  function playItem(it) {
    if (!it) return;
    if (it.clips) playClips(it.clips, it.speak);
    else if (it.audioUrl) playAudio(it.audioUrl, it.speak);
    else speak(it.speak);
  }

  /* ---------------- misc UI ---------------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  /* ---------------- navigation ---------------- */
  var VIEWS = ['home', 'course', 'learn', 'vocab', 'dictation', 'sentence', 'speak'];
  var currentView = 'home';
  function show(name) {
    currentView = name;
    S.lastView = name;
    save();
    VIEWS.forEach(function (v) {
      var el = $('view-' + v);
      if (el) el.classList.toggle('active', v === name);
    });
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.go === name || (name === 'learn' && t.dataset.go === 'home'));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (name === 'home') renderHome();
    if (name === 'course') renderCourse();
    if (name === 'learn') renderLearn();
    if (name === 'vocab') { buildQueue(); nextCard(); }
    if (name === 'sentence') newSentence();
    if (name === 'speak') {
      var ctx = sentenceContext();
      speakIdx = 0;
      speakList = ctx.list;
      renderSpeak();
      $('speak-tip').textContent = ctx.fallback
        ? '本课暂无例句，改练 ' + ctx.lesson.code + ' 的句子'
        : '';
    }
  }

  /* ---------------- onboarding ---------------- */
  function seedPrior(week) {
    var t = todayStr(), i = 0;
    allVocab().forEach(function (v) {
      var l = lessonOf(v.lessonId);
      if (!l || l.week >= week) return;
      var k = v.lessonId + '::' + v.ms;
      if (!S.srs[k]) S.srs[k] = { stage: 2, due: addDays(t, 1 + (i % 7)), seeded: true };
      i++;
    });
  }
  function initOnboarding() {
    var sel = $('onb-week');
    if (!sel.options.length) {
      for (var i = 1; i <= 13; i++) {
        var o = document.createElement('option');
        o.value = i; o.textContent = '第 ' + i + ' 周';
        sel.appendChild(o);
      }
    }
    $('onb-start').addEventListener('click', function () {
      var wk = Number(sel.value) || 1;
      S.profile.startWeek = wk;
      S.profile.onboarded = true;
      var idx = -1;
      for (var i = 0; i < UNITS.length; i++) { if (UNITS[i].week >= wk) { idx = i; break; } }
      S.progress.unitIndex = idx < 0 ? UNITS.length : idx;
      seedPrior(wk);
      save();
      $('onboarding').hidden = true;
      renderHome();
      show('home');
      toast(wk > 1 ? '第 1–' + (wk - 1) + ' 周已放入复习库' : '从第 1 周开始');
    });
  }

  /* ---------------- home ---------------- */
  function md(iso) {
    var p = iso.split('-');
    return Number(p[1]) + ' 月 ' + Number(p[2]) + ' 日';
  }
  function daysToExam() {
    return Math.ceil((new Date(COURSE.exam.start + 'T00:00:00') - new Date()) / 86400000);
  }
  function dueCount() {
    var t = todayStr(), n = 0;
    for (var k in S.srs) { if (S.srs[k].due <= t) n++; }
    return n;
  }
  function renderExam() {
    var e = COURSE.exam;
    if (!e) return;
    $('exam-title').textContent = e.title + ' · ' + e.weight;
    $('exam-date').textContent = md(e.start) + ' – ' + md(e.end) + ' · 课内时间';
    $('exam-parts').innerHTML = e.parts.map(function (p) {
      return '<span>' + p.name + ' ' + p.marks + '</span>';
    }).join('');
    $('exam-others').innerHTML = e.others.map(function (o) {
      return o.name + ' ' + o.weight + ' · ' + o.due;
    }).join('<br>');
  }
  function renderHome() {
    var d = daysToExam();
    $('countdown').innerHTML = d > 0 ? '距考试 <b>' + d + '</b> 天' : '考试期间';

    var u = currentUnit();
    if (u) {
      $('hero-label').textContent = '第 ' + u.week + ' 周 · 单元 ' + (u.i + 1) + ' / ' + UNITS.length;
      $('hero-title').textContent = u.title;
      $('hero-sub').textContent = u.words.length + ' 个词 · ' + dueCount() + ' 张待复习';
    } else {
      $('hero-label').textContent = '全部完成';
      $('hero-title').textContent = '课程已学完';
      $('hero-sub').textContent = '继续复习巩固';
    }

    $('stat-streak').textContent = streak();
    $('stat-total').textContent = totalReviews();
    $('stat-acc').textContent = accuracy();

    var total = totalWords();
    var learned = learnedWords();
    $('progress-label').textContent = u ? ('第 ' + u.week + ' 周 · 单元 ' + (u.i + 1) + '/' + UNITS.length) : '全部完成';
    $('progress-count').textContent = learned + ' / ' + total;
    $('progress-fill').style.width = total ? Math.round(learned / total * 100) + '%' : '0%';
    $('progress-next').textContent = u ? ('下一课：' + u.title + ' · ' + u.words.length + ' 词') : '所有单元都学完了，继续复习吧';

    renderExam();

    $('rate').value = S.settings.rate;
    $('rate-val').textContent = Number(S.settings.rate).toFixed(2).replace(/0$/, '') + '×';
  }

  /* ---------------- course ---------------- */
  function renderCourse() {
    var box = $('lesson-list');
    box.innerHTML = '';
    COURSE.lessons.forEach(function (l) {
      var header = document.createElement('div');
      header.className = 'week-header';
      header.innerHTML = '<span class="week-badge">第 ' + l.week + ' 周</span>' +
        '<span>' + l.code + ' · ' + l.zh + '</span>';
      box.appendChild(header);

      var us = UNITS.filter(function (u) { return u.lessonId === l.id; });
      if (!us.length) {
        var empty = document.createElement('div');
        empty.className = 'unit-item';
        empty.innerHTML = '<div class="unit-main"><div class="unit-name">内容待建</div>' +
          '<div class="muted">' + l.file + '</div></div>';
        box.appendChild(empty);
        return;
      }
      us.forEach(function (u) {
        var done = u.i < S.progress.unitIndex;
        var cur = u.i === S.progress.unitIndex;
        var div = document.createElement('div');
        div.className = 'unit-item' + (cur ? ' current' : '') + (done ? ' done' : '');
        var label = done ? '已完成' : cur ? '进行中' : '未开始';
        div.innerHTML =
          '<div class="unit-main">' +
          '<div class="unit-name">' + u.title + '</div>' +
          '<div class="muted">' + u.words.length + ' 词 · ' + u.words[0].ms + ' … ' + u.words[u.words.length - 1].ms + '</div>' +
          '</div>' +
          '<span class="badge ' + (done ? 'ready' : cur ? 'partial' : 'pending') + '">' + label + '</span>';
        if (cur) div.addEventListener('click', function () { showLearn(); });
        box.appendChild(div);
      });
    });
  }

  /* ---------------- learn ---------------- */
  var learnIdx = 0;
  function showLearn() {
    var u = currentUnit();
    var idx = Number(S.progress.learnIdx) || 0;
    if (!u || idx < 0 || idx >= u.words.length) idx = 0;
    learnIdx = idx;
    show('learn');
  }
  var DIGIT = {
    sifar: '0', kosong: '0', satu: '1', dua: '2', tiga: '3', empat: '4',
    lima: '5', enam: '6', tujuh: '7', lapan: '8', sembilan: '9',
    sepuluh: '10', sebelas: '11', seratus: '100', seribu: '1000'
  };
  function glyphFor(w) {
    if (DIGIT[w.ms]) return DIGIT[w.ms];
    return (w.ms.trim().charAt(0) || '?').toUpperCase();
  }
  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  /* 先找课件图；没有就尝试 img/ai/<lessonId>-<slug>.jpg；再没有才回退到占位 */
  function applyImage(imgEl, lessonId, ms, onNone) {
    var key = lessonId + ':' + ms;
    var src = (COURSE.images && COURSE.images[key]) ||
              (window.AI_IMAGES && window.AI_IMAGES[key]) || '';
    if (!src) {
      imgEl.hidden = true;
      imgEl.removeAttribute('src');
      if (onNone) onNone();
      return;
    }
    imgEl.onerror = function () {
      imgEl.hidden = true;
      imgEl.removeAttribute('src');
      if (onNone) onNone();
    };
    imgEl.hidden = false;
    imgEl.src = src;
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function exampleFor(u, w) {
    var l = lessonOf(u.lessonId);
    var list = (l && l.sentences) || [];
    var re = new RegExp('\\b' + escapeRe(w.ms) + '\\b', 'i');
    return list.filter(function (s) { return re.test(s.ms); })[0] || null;
  }
  function highlight(text, word) {
    var re = new RegExp('\\b(' + escapeRe(word) + ')\\b', 'i');
    return text.replace(re, '<b>$1</b>');
  }
  function renderLearn() {
    var u = currentUnit();
    if (!u) {
      $('learn-word').textContent = '全部学完';
      $('learn-syl').textContent = '';
      $('learn-zh').textContent = '去复习吧';
      $('learn-note').textContent = '';
      $('learn-count').textContent = '';
      $('learn-img').hidden = true;
      $('learn-next').disabled = true;
      return;
    }
    if (learnIdx >= u.words.length || learnIdx < 0) learnIdx = 0;
    var w = u.words[learnIdx];
    $('learn-title').textContent = '第 ' + u.week + ' 周 · ' + u.title;
    $('learn-count').textContent = (learnIdx + 1) + ' / ' + u.words.length;
    $('learn-word').textContent = w.ms;
    $('learn-syl').textContent = w.syl;
    $('learn-zh').textContent = w.zh + ' · ' + w.pos;

    var imgEl = $('learn-img'), glyphEl = $('learn-glyph');
    glyphEl.hidden = true;
    $('learn-visual-note').hidden = true;
    applyImage(imgEl, u.lessonId, w.ms, function () {
      glyphEl.hidden = false;
      glyphEl.textContent = glyphFor(w);
      $('learn-visual-note').hidden = false;
    });

    var ex = exampleFor(u, w);
    var exEl = $('learn-example');
    if (ex) {
      exEl.hidden = false;
      exEl.innerHTML = highlight(ex.ms, w.ms) +
        '<div class="muted" style="font-size:12px;margin-top:2px">' + ex.zh + '</div>';
    } else {
      exEl.hidden = true;
      exEl.innerHTML = '';
    }

    $('learn-note').textContent = w.note || '';
    $('learn-src').textContent = '[出处：' + u.file + ' p.' + w.page + ']';

    $('learn-next').disabled = false;
    $('learn-next').textContent = learnIdx === u.words.length - 1 ? '完成本单元' : '下一个';
    $('learn-prev').disabled = learnIdx === 0;
  }
  function completeUnit() {
    var u = currentUnit();
    if (!u) return;
    u.words.forEach(function (v) {
      var k = u.lessonId + '::' + v.ms;
      if (!S.srs[k]) S.srs[k] = { stage: 0, due: todayStr() };
    });
    S.progress.unitIndex++;
    S.progress.learnIdx = 0;
    save();
    toast('「' + u.title + '」完成，已加入今日复习');
    show('home');
  }

  /* ---------------- SRS · 艾宾浩斯 ---------------- */
  var EBB = [1, 2, 4, 7, 15, 30, 60, 120];
  var queue = [], cur = null, flipped = false;

  function stageOf(c) {
    if (!c) return 0;
    if (typeof c.stage === 'number') return c.stage;
    return Math.min(c.reps || 0, EBB.length);
  }
  function intervalFor(stage) {
    if (stage <= 0) return 0;
    return EBB[Math.min(stage - 1, EBB.length - 1)];
  }
  function reviewCap() { return 10; }
  function buildQueue() {
    var t = todayStr(), due = [];
    allVocab().forEach(function (v) {
      var k = v.lessonId + '::' + v.ms;
      var c = S.srs[k];
      v._key = k;
      if (c && c.due <= t) due.push(v);
    });
    due.sort(function (a, b) { return (S.srs[a._key].due < S.srs[b._key].due) ? -1 : 1; });
    queue = due.slice(0, reviewCap());
  }
  function nextCard() {
    var wrap = $('review-wrap'), empty = $('vocab-empty');
    if (!queue.length) {
      wrap.hidden = true; empty.hidden = false;
      $('vocab-empty-text').textContent = '今天没有到期的卡片';
      $('vocab-sub').textContent = '复习节奏 1→2→4→7→15→30→60 天';
      return;
    }
    wrap.hidden = false; empty.hidden = true;
    cur = queue.shift();
    flipped = false;
    $('flashcard').classList.remove('flipped');
    $('grade-row').classList.remove('show');
    $('fc-word').textContent = cur.ms;

    var imgEl = $('fc-img');
    applyImage(imgEl, cur.lessonId, cur.ms, function () {});

    var st = stageOf(S.srs[cur._key]);
    $('fc-badge').textContent = st === 0 ? '新词' : '第 ' + st + ' 次复习';
    $('fc-syl').textContent = cur.syl;
    $('fc-zh').textContent = cur.zh;
    $('fc-pos').textContent = cur.pos + (cur.lessonCode ? ' · ' + cur.lessonCode : '');
    $('fc-src').textContent = '[出处：' + (lessonOf(cur.lessonId) ? lessonOf(cur.lessonId).file : '') + ' p.' + cur.page + ']';
    $('vocab-sub').textContent = '还剩 ' + (queue.length + 1) + ' 张 · 点击卡片翻面';
  }
  function flipCard() {
    if (!cur) return;
    flipped = !flipped;
    $('flashcard').classList.toggle('flipped', flipped);
    $('grade-row').classList.toggle('show', flipped);
  }
  function gradeCard(q) {
    if (!cur) return;
    var k = cur._key;
    var c = S.srs[k] || { stage: 0, due: todayStr(), lapses: 0 };
    if (typeof c.stage !== 'number') c.stage = Math.min(c.reps || 0, EBB.length);
    var st = c.stage;
    if (q === 0) {
      c.lapses = (c.lapses || 0) + 1;
      st = 0;
      if (!cur._again) queue.push(Object.assign({}, cur, { _again: true }));
    } else if (q === 1) {
      st = Math.max(1, st);
    } else if (q === 2) {
      st = Math.min(EBB.length, st + 1);
    } else {
      st = Math.min(EBB.length, st + 2);
    }
    var iv;
    if (q === 0) iv = 0;
    else if (q === 1) iv = Math.max(1, Math.round(intervalFor(st) / 2));
    else iv = intervalFor(st);
    c.stage = st;
    c.due = addDays(todayStr(), iv);
    c.last = todayStr();
    S.srs[k] = c;
    logActivity(q > 0);
    save();
    nextCard();
  }

  /* ---------------- dictation ---------------- */
  var dict = { list: [], idx: 0, correct: 0, locked: false };

  function makeItem(type) {
    if (type === 'number') {
      var n = Math.random() < 0.5 ? randInt(1, 99) : randInt(100, 9999);
      return {
        speak: toMalay(n), answer: String(n), clips: numberToClips(n), label: '数字',
        validate: function (inp) {
          var x = inp.replace(/[^\d]/g, '');
          if (x) return Number(x) === n;
          return normLoose(inp) === normLoose(toMalay(n));
        }
      };
    }
    if (type === 'currency') {
      var r = randInt(1, 200);
      var sen = [0, 5, 10, 20, 50][randInt(0, 4)];
      var ans = r + '.' + String(sen).padStart(2, '0');
      var cclips = numberToClips(r).concat(['ringgit']);
      if (sen) cclips = cclips.concat(numberToClips(sen)).concat(['sen']);
      return {
        speak: toMalay(r) + ' ringgit' + (sen ? ' ' + toMalay(sen) + ' sen' : ''),
        answer: 'RM ' + ans, clips: cclips, label: '货币',
        validate: function (inp) {
          var x = inp.toLowerCase().replace(/rm/g, '').replace(/[^\d.]/g, '');
          var v = parseFloat(x);
          if (isNaN(v)) return false;
          return Math.abs(v - (r + sen / 100)) < 0.001;
        }
      };
    }
    if (type === 'time') {
      var h = randInt(1, 12), m = [0, 15, 30, 45][randInt(0, 3)];
      return {
        speak: 'pukul ' + toMalay(h) + (m ? ' ' + toMalay(m) : ''),
        answer: h + ':' + String(m).padStart(2, '0'), label: '时间',
        clips: ['pukul'].concat(numberToClips(h)).concat(m ? numberToClips(m) : []),
        validate: function (inp) {
          var mm = inp.match(/(\d{1,2})\s*[:.．]\s*(\d{1,2})/);
          if (mm) return Number(mm[1]) === h && Number(mm[2]) === m;
          var only = inp.replace(/[^\d]/g, '');
          if (only) return Number(only) === h && m === 0;
          return false;
        }
      };
    }
    var l = currentLesson();
    var pool = l ? (l.vocab || []).filter(function (v) { return v.pos !== '数词'; }) : [];
    if (!pool.length) return null;
    var w = pool[randInt(0, pool.length - 1)];
    return {
      speak: w.ms, answer: w.ms, audioUrl: vocabAudio(l.id, w.ms), hint: w.zh,
      validate: function (inp) { return normLoose(inp) === normLoose(w.ms); }
    };
  }

  function startDictation(type) {
    dict.list = [];
    dict.idx = 0;
    dict.correct = 0;
    for (var i = 0; i < 30 && dict.list.length < 10; i++) {
      var it = makeItem(type);
      if (it) dict.list.push(it);
    }
    if (!dict.list.length) {
      toast('当前课没有可听写的词，试试数字 / 货币 / 时间');
      return;
    }
    openDictPlay();
  }
  function openDictPlay() {
    $('dict-setup').hidden = true;
    $('dict-done').hidden = true;
    $('dict-play').hidden = false;
    $('dict-total').textContent = String(dict.list.length);
    showItem();
  }
  function startUnitDictation(u) {
    dict.list = [];
    dict.idx = 0;
    dict.correct = 0;
    var words = shuffle(u.words.slice()).slice(0, 10);
    words.forEach(function (w) {
      dict.list.push({
        speak: w.ms, answer: w.ms, hint: w.zh,
        audioUrl: vocabAudio(u.lessonId, w.ms),
        validate: function (inp) { return normLoose(inp) === normLoose(w.ms); }
      });
    });
    if (!dict.list.length) { toast('这个场景没有可听写的词'); return; }
    openDictPlay();
  }
  function renderDictCategories() {
    var box = $('dict-categories');
    if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';
    var byWeek = {};
    UNITS.forEach(function (u) { (byWeek[u.week] = byWeek[u.week] || []).push(u); });
    Object.keys(byWeek).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (w) {
      var h = document.createElement('div');
      h.className = 'week-header';
      h.innerHTML = '<span class="week-badge">第 ' + w + ' 周</span>';
      box.appendChild(h);
      var grid = document.createElement('div');
      grid.className = 'dict-cats';
      byWeek[w].forEach(function (u) {
        var b = document.createElement('button');
        b.className = 'dict-cat';
        b.innerHTML = u.title + '<small>' + u.words.length + ' 词</small>';
        b.addEventListener('click', function () { startUnitDictation(u); });
        grid.appendChild(b);
      });
      box.appendChild(grid);
    });
  }
  function showItem() {
    var it = dict.list[dict.idx];
    dict.locked = false;
    $('dict-idx').textContent = dict.idx + 1;
    $('dict-input').value = '';
    $('dict-input').disabled = false;
    $('dict-submit').disabled = false;
    $('dict-feedback').textContent = '';
    $('dict-feedback').className = 'dict-feedback';
    $('dict-hint').textContent = it.hint ? ('提示：' + it.hint) : (it.label || '');
    $('dict-input').focus();
    setTimeout(function () { playItem(it); }, 250);
  }
  function submitDict() {
    var it = dict.list[dict.idx];
    if (!it || dict.locked) return;
    var val = $('dict-input').value;
    if (!val.trim()) return;
    dict.locked = true;
    var ok = it.validate(val);
    var fb = $('dict-feedback');
    if (ok) {
      dict.correct++;
      fb.textContent = '✓ 正确';
      fb.className = 'dict-feedback ok';
    } else {
      fb.textContent = '✗ 正确答案：' + it.answer + '（' + it.speak + '）';
      fb.className = 'dict-feedback bad';
    }
    logActivity(ok);
    $('dict-input').disabled = true;
    $('dict-submit').disabled = true;
    setTimeout(function () {
      dict.idx++;
      if (dict.idx >= dict.list.length) finishDict();
      else showItem();
    }, ok ? 900 : 1900);
  }
  function finishDict() {
    $('dict-play').hidden = true;
    $('dict-done').hidden = false;
    var total = dict.list.length;
    var pct = total ? Math.round(dict.correct / total * 100) : 0;
    $('dict-result').textContent = total + ' 题答对 ' + dict.correct + ' 题，正确率 ' + pct + '%。';
    save();
  }

  /* ---------------- sentence ---------------- */
  var sent = { answer: [], picked: [], current: null, lesson: null };

  var FUNC = {
    di: '在', situ: '那里', ada: '有', pelajar: '学生',
    kuala: '吉隆坡', lumpur: '吉隆坡', xiamen: '厦门', malaysia: '马来西亚',
    siti: '茜蒂（人名）', pen: '笔', hobi: '爱好', siapakah: '谁',
    dengan: '和、与', mana: '哪里', ini: '这'
  };
  function glossFor(tok, l) {
    var ms = tok.replace(/[.,!?;:"'()]/g, '');
    var low = ms.toLowerCase();
    if (/^\d+$/.test(ms)) return '数字 ' + ms;
    var vocab = (l && l.vocab) || [];
    var v = vocab.filter(function (x) { return x.ms.toLowerCase() === low; })[0];
    if (!v) v = allVocab().filter(function (x) { return x.ms.toLowerCase() === low; })[0];
    if (v) return v.zh;
    if (FUNC[low]) return FUNC[low];
    return '—';
  }
  function renderAnalysis(s, l) {
    var box = $('sent-analysis');
    if (!box) return;
    if (!s || !s.ms) { box.hidden = true; box.innerHTML = ''; return; }
    var rows = s.ms.split(/\s+/).map(function (t) {
      return '<div class="an-row"><span class="an-word">' + t + '</span><span class="an-zh">' + glossFor(t, l) + '</span></div>';
    }).join('');
    box.hidden = false;
    box.innerHTML = '<div class="an-title">详细解析</div>' +
      '<div class="an-sentence">' + s.ms + '</div>' +
      '<div class="an-trans">' + s.zh + '</div>' + rows +
      (s.note ? '<div class="an-note"><b>语法</b>：' + s.note + '</div>' : '');
  }

  function newSentence() {
    var ctx = sentenceContext();
    var l = ctx.lesson;
    var pool = ctx.list;
    if (!pool.length) {
      sent.answer = []; sent.picked = [];
      sent.current = null; sent.lesson = l;
      $('sent-slots').innerHTML = '';
      $('sent-bank').innerHTML = '';
      $('sent-zh').textContent = l ? (l.code + ' 暂无例句') : '暂无例句';
      $('sent-src').textContent = '';
      $('sent-feedback').textContent = '';
      renderAnalysis(null, l);
      return;
    }
    var s = pool[randInt(0, pool.length - 1)];
    sent.answer = s.ms.split(/\s+/);
    sent.picked = [];
    sent.current = s;
    sent.lesson = l;
    $('sent-zh').textContent = s.zh;
    $('sent-src').textContent = (ctx.fallback ? '本课暂无例句，改练 ' + l.code + ' 的句子 · ' : '') +
      '[出处：' + l.file + ' p.' + s.page + ']';
    $('sent-feedback').textContent = '';
    $('sent-feedback').className = 'dict-feedback';
    renderAnalysis(null, l);
    renderSentence();
  }
  function renderSentence() {
    var slots = $('sent-slots'), bank = $('sent-bank');
    slots.innerHTML = ''; bank.innerHTML = '';
    sent.picked.forEach(function (w, i) {
      var b = document.createElement('button');
      b.className = 'token';
      b.textContent = w;
      b.addEventListener('click', function () {
        sent.picked.splice(i, 1);
        renderSentence();
      });
      slots.appendChild(b);
    });
    var used = sent.picked.slice();
    sent.answer.forEach(function (w) {
      var idx = used.indexOf(w);
      if (idx >= 0) { used.splice(idx, 1); return; }
      var b = document.createElement('button');
      b.className = 'token';
      b.textContent = w;
      b.addEventListener('click', function () {
        sent.picked.push(w);
        renderSentence();
      });
      bank.appendChild(b);
    });
  }
  function checkSentence() {
    var fb = $('sent-feedback');
    var ok = sent.picked.join(' ') === sent.answer.join(' ');
    if (ok) {
      fb.textContent = '✓ 正确';
      fb.className = 'dict-feedback ok';
      logActivity(true);
    } else {
      fb.textContent = '✗ 正确顺序：' + sent.answer.join(' ');
      fb.className = 'dict-feedback bad';
      logActivity(false);
    }
    renderAnalysis(sent.current, sent.lesson);
    save();
  }

  /* ---------------- speak ---------------- */
  var speakList = [], speakIdx = 0;
  var pendingMic = null;
  function askMic(action) {
    pendingMic = action;
    $('mic-consent').checked = false;
    $('mic-allow').disabled = true;
    $('mic-msg').textContent = '';
    $('mic-modal').hidden = false;
  }
  function runPendingMic() {
    var a = pendingMic;
    pendingMic = null;
    if (a === 'eval') startEval();
  }
  function confirmMic() {
    S.settings.micConsent = true;
    save();
    $('mic-modal').hidden = true;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        runPendingMic();
      }).catch(function () {
        $('speak-tip').textContent = '麦克风未授权：请在浏览器和系统设置里允许后重试。';
      });
    } else {
      runPendingMic();
    }
  }

  function renderSpeak() {
    if (speakIdx >= speakList.length) speakIdx = 0;
    if (!speakList.length) {
      var l = currentLesson();
      $('speak-ms').textContent = '本课暂无例句';
      $('speak-zh').textContent = l ? l.code : '';
      $('speak-src').textContent = '';
        return;
    }
    var s = speakList[speakIdx];
    $('speak-ms').textContent = s.ms;
    $('speak-zh').textContent = s.zh;
    $('speak-src').textContent = '[出处：' + lessonOf(s.lessonId).file + ' p.' + s.page + ']';
    $('eval-panel').hidden = true;
    $('speak-tip').textContent = '';
  }
  /* ---------------- 发音评测（浏览器语音识别） ---------------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var evalBusy = false;

  function normTokens(text) {
    var out = [];
    (text || '').toLowerCase().replace(/[.,!?;:'"()\-–—]/g, ' ').split(/\s+/).forEach(function (t) {
      if (!t) return;
      if (/^\d+$/.test(t)) {
        toMalay(Number(t)).split(' ').forEach(function (x) { out.push(x); });
      } else {
        out.push(t);
      }
    });
    return out;
  }
  function lev(a, b) {
    var n = a.length, m = b.length, i, j;
    var d = [];
    for (i = 0; i <= n; i++) d.push([i]);
    for (j = 0; j <= m; j++) d[0][j] = j;
    for (i = 1; i <= n; i++) {
      for (j = 1; j <= m; j++) {
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return d[n][m];
  }
  function charSim(a, b) {
    if (a === b) return 1;
    var max = Math.max(a.length, b.length);
    return max ? Math.max(0, 1 - lev(a, b) / max) : 0;
  }
  /* 逐词对齐：读错一个音也能拿到部分分 */
  function alignTokens(a, b) {
    var n = a.length, m = b.length, i, j;
    var dp = [], from = [];
    for (i = 0; i <= n; i++) { dp.push(new Array(m + 1)); from.push(new Array(m + 1)); }
    dp[0][0] = 0;
    for (i = 1; i <= n; i++) { dp[i][0] = i; from[i][0] = 'del'; }
    for (j = 1; j <= m; j++) { dp[0][j] = j; from[0][j] = 'ins'; }
    for (i = 1; i <= n; i++) {
      for (j = 1; j <= m; j++) {
        var sub = dp[i - 1][j - 1] + (1 - charSim(a[i - 1], b[j - 1]));
        var del = dp[i - 1][j] + 1;
        var ins = dp[i][j - 1] + 1;
        if (sub <= del && sub <= ins) { dp[i][j] = sub; from[i][j] = 'sub'; }
        else if (del <= ins) { dp[i][j] = del; from[i][j] = 'del'; }
        else { dp[i][j] = ins; from[i][j] = 'ins'; }
      }
    }
    var sims = new Array(n).fill(0);
    i = n; j = m;
    while (i > 0 && j > 0) {
      var f = from[i][j];
      if (f === 'sub') { sims[i - 1] = charSim(a[i - 1], b[j - 1]); i--; j--; }
      else if (f === 'del') { i--; }
      else { j--; }
    }
    return sims;
  }
  function scoreSpeech(target, heard) {
    var t = normTokens(target), h = normTokens(heard);
    if (!t.length) return { score: 0, tokens: [], sims: [], heard: heard };
    var sims = alignTokens(t, h);
    var sum = sims.reduce(function (x, y) { return x + y; }, 0);
    return { score: Math.round(sum / t.length * 100), tokens: t, sims: sims, heard: heard };
  }
  function evaluateAlternatives(target, alts) {
    var best = null;
    (alts || []).forEach(function (a) {
      var r = scoreSpeech(target, a);
      if (!best || r.score > best.score) best = r;
    });
    if (!best) best = { score: 0, tokens: normTokens(target), sims: [], heard: '' };

    $('eval-panel').hidden = false;
    $('eval-num').textContent = best.score;
    $('eval-words').innerHTML = best.tokens.map(function (w, i) {
      var s = best.sims[i] || 0;
      var cls = s >= 0.85 ? 'ok' : s >= 0.5 ? 'near' : 'bad';
      var pct = cls === 'near' ? '<small>' + Math.round(s * 100) + '%</small>' : '';
      return '<span class="eval-word ' + cls + '">' + w + pct + '</span>';
    }).join('');
    $('eval-heard').textContent = best.heard ? ('识别为：' + best.heard) : '没有识别到语音';
    $('eval-tip').textContent = best.score >= 90 ? '很准，保持这个语速'
      : best.score >= 75 ? '基本准确，黄色词再读清楚一点'
      : best.score >= 50 ? '有些词没读准，放慢速度，逐个音节读'
      : '再试一次：靠近麦克风，逐词朗读';
    logActivity(best.score >= 75);
    save();
  }
  function startEval() {
    if (!SR) { toast('当前浏览器不支持语音识别，请用 Chrome'); return; }
    if (evalBusy) return;
    if (!S.settings.micConsent) { askMic('eval'); return; }
    var s = speakList[speakIdx];
    if (!s) return;
    evalBusy = true;
    var btn = $('speak-eval');
    btn.disabled = true;
    btn.textContent = '… 识别中';
    $('eval-panel').hidden = true;
    $('speak-tip').textContent = '请朗读上面的句子，读完自动结束';

    var rec = new SR();
    rec.lang = 'ms-MY';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = function (e) {
      var alts = [], res = e.results[0];
      for (var i = 0; i < res.length; i++) alts.push(res[i].transcript || '');
      evaluateAlternatives(s.ms, alts);
    };
    rec.onerror = function (e) {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        $('speak-tip').textContent = '麦克风被拒绝：点地址栏最左侧的网站图标 → 网站设置 → 麦克风 → 允许；再到 macOS 系统设置 → 隐私与安全性 → 麦克风，勾选 Chrome';
      } else if (e.error === 'no-speech') {
        $('speak-tip').textContent = '没有听到声音，靠近麦克风再试一次';
      } else {
        $('speak-tip').textContent = '识别失败：' + e.error + '（需要联网，Chrome 的识别在云端完成）';
      }
    };
    rec.onend = function () {
      evalBusy = false;
      btn.disabled = false;
      btn.textContent = '🎯 评测';
    };
    try { rec.start(); } catch (err) {
      evalBusy = false; btn.disabled = false; btn.textContent = '🎯 评测';
    }
  }

  /* ---------------- 账号与云同步 ---------------- */
  function isLoggedIn() { return !!(window.Cloud && Cloud.currentUser()); }
  var AVATARS = ['🙂', '😀', '🐱', '🐶', '🦊', '🐼', '🌸', '🍀', '⭐', '🌙', '🔥', '📚'];

  function renderProfileFields() {
    var grid = $('avatar-grid');
    if (!grid) return;
    if (!grid.children.length) {
      AVATARS.forEach(function (a) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'avatar-opt';
        b.textContent = a;
        b.addEventListener('click', function () {
          $('profile-avatar').textContent = a;
          Array.prototype.forEach.call(grid.children, function (c) {
            c.classList.toggle('active', c.textContent === a);
          });
        });
        grid.appendChild(b);
      });
    }
    var cur = S.profile.avatar || '🙂';
    $('profile-avatar').textContent = cur;
    $('profile-name').value = S.profile.name || '';
    Array.prototype.forEach.call(grid.children, function (c) {
      c.classList.toggle('active', c.textContent === cur);
    });
  }

  function saveProfile() {
    S.profile.name = ($('profile-name').value || '').trim().slice(0, 16);
    S.profile.avatar = $('profile-avatar').textContent || '🙂';
    save();
    updateAuthUI();
    toast('资料已保存');
  }

  function updateAuthUI() {
    var btn = $('btn-auth');
    if (!btn) return;
    if (!window.Cloud || !Cloud.configured()) { btn.hidden = true; return; }
    btn.hidden = false;
    var u = Cloud.currentUser();
    btn.textContent = u ? (S.profile.avatar || '🙂') : '登录';
    btn.classList.toggle('has-avatar', !!u);
    $('auth-form').hidden = !!u;
    $('auth-user').hidden = !u;
    if (u) {
      $('auth-code-box').hidden = true;
      $('auth-email-show').textContent = u.email || '';
      renderProfileFields();
    }
  }
  function openAuth() {
    if (!window.Cloud || !Cloud.configured()) { toast('未配置云端，当前为本机模式'); return; }
    $('auth-modal').hidden = false;
    $('auth-msg').textContent = '';
    $('auth-code-box').hidden = true;
    $('auth-code').value = '';
    updateAuthUI();
    setTimeout(function () {
      var e = $('auth-email');
      if (e && !$('auth-form').hidden) e.focus();
    }, 60);
  }
  function closeAuth() { $('auth-modal').hidden = true; }
  function sendLogin() {
    var email = ($('auth-email').value || '').trim();
    if (!email) { $('auth-msg').textContent = '请输入邮箱'; return; }
    $('auth-msg').textContent = '正在发送…';
    Cloud.signIn(email).then(function (res) {
      if (res && res.error) { $('auth-msg').textContent = '发送失败：' + res.error.message; return; }
      $('auth-msg').textContent = '验证码已发送。邮件在手机上也没关系，把 6 位数字填到下面。';
      $('auth-code-box').hidden = false;
      $('auth-code').focus();
    }).catch(function (err) {
      $('auth-msg').textContent = '发送失败：' + (err.message || err);
    });
  }
  function verifyCode() {
    var email = ($('auth-email').value || '').trim();
    var code = ($('auth-code').value || '').replace(/\D/g, '');
    if (!email) { $('auth-msg').textContent = '请先填邮箱'; return; }
    if (code.length < 6 || code.length > 10) { $('auth-msg').textContent = '请输入邮件里的验证码（6–10 位数字）'; return; }
    $('auth-msg').textContent = '正在验证…';
    Cloud.verifyOtp(email, code).then(function (res) {
      if (res && res.error) { $('auth-msg').textContent = '验证失败：' + res.error.message; return; }
      $('auth-msg').textContent = '登录成功';
      setTimeout(function () { closeAuth(); toast('登录成功，开始同步进度'); }, 400);
    }).catch(function (err) {
      $('auth-msg').textContent = '验证失败：' + (err.message || err);
    });
  }
  function logout() {
    Cloud.signOut().then(function () {
      closeAuth();
      updateAuthUI();
      toast('已退出登录，继续使用本机进度');
    });
  }
  var pulling = false;
  function pullCloud() {
    if (!isLoggedIn() || pulling) return;
    pulling = true;
    Cloud.fetchState().then(function (row) {
      pulling = false;
      if (!row || !row.state) { Cloud.pushState(S).catch(function () {}); return; }
      var remote = row.state;
      if ((remote.updatedAt || 0) > (S.updatedAt || 0)) {
        var d = defaultState();
        remote.profile = Object.assign(d.profile, remote.profile || {});
        remote.progress = Object.assign(d.progress, remote.progress || {});
        remote.settings = Object.assign(d.settings, remote.settings || {});
        remote.srs = remote.srs || {};
        remote.log = remote.log || {};
        S = remote;
        persist();
        toast('已同步云端进度');
        if (S.profile.onboarded) show(currentView === 'learn' ? 'learn' : 'home');
      } else {
        Cloud.pushState(S).catch(function () {});
      }
    }).catch(function () { pulling = false; });
  }

  /* ---------------- bind ---------------- */
  function bind() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-go]');
      if (t && t.dataset.go) show(t.dataset.go);
    });

    $('btn-refresh').addEventListener('click', function () { location.reload(); });
    $('btn-auth').addEventListener('click', openAuth);
    $('auth-close').addEventListener('click', closeAuth);
    $('auth-send').addEventListener('click', sendLogin);
    $('auth-verify').addEventListener('click', verifyCode);
    $('auth-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') verifyCode(); });
    $('profile-save').addEventListener('click', saveProfile);
    $('auth-logout').addEventListener('click', logout);
    $('auth-email').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendLogin(); });
    $('auth-modal').addEventListener('click', function (e) { if (e.target === $('auth-modal')) closeAuth(); });
    $('btn-learn').addEventListener('click', showLearn);
    $('btn-review').addEventListener('click', function () { show('vocab'); });
    $('learn-back').addEventListener('click', function () { show('home'); });

    $('learn-next').addEventListener('click', function () {
      var u = currentUnit();
      if (!u) return;
      if (learnIdx >= u.words.length - 1) completeUnit();
      else { learnIdx++; S.progress.learnIdx = learnIdx; save(); renderLearn(); }
    });
    $('learn-prev').addEventListener('click', function () {
      if (learnIdx > 0) { learnIdx--; S.progress.learnIdx = learnIdx; save(); renderLearn(); }
    });
    $('learn-audio').addEventListener('click', function () {
      var u = currentUnit();
      if (!u) return;
      var w = u.words[learnIdx];
      playAudio(vocabAudio(u.lessonId, w.ms), w.ms);
    });

    $('rate').addEventListener('input', function (e) {
      S.settings.rate = Number(e.target.value);
      $('rate-val').textContent = Number(e.target.value).toFixed(2).replace(/0$/, '') + '×';
      save();
    });
    $('voice').addEventListener('change', function (e) {
      S.settings.voice = e.target.value;
      save();
    });
    $('btn-test-voice').addEventListener('click', function () { speak('Selamat pagi. Nama saya Ali.'); });
    $('btn-reset').addEventListener('click', function () {
      if (!confirm('清空所有学习记录并重新开始？')) return;
      resetting = true;
      try { localStorage.removeItem(LS_KEY); localStorage.removeItem(LEGACY_KEY); } catch (e) {}
      location.reload();
    });

    $('flashcard').addEventListener('click', flipCard);
    $('fc-audio').addEventListener('click', function (e) {
      e.stopPropagation();
      if (cur) playAudio(vocabAudio(cur.lessonId, cur.ms), cur.ms);
    });
    document.querySelectorAll('.grade').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        gradeCard(Number(b.dataset.q));
      });
    });

    document.querySelectorAll('.dict-cat.special').forEach(function (b) {
      b.addEventListener('click', function () { startDictation(b.dataset.type); });
    });
    $('dict-back').addEventListener('click', function () {
      seqToken++;
      try { seqAudio.pause(); } catch (e) {}
      $('dict-play').hidden = true;
      $('dict-done').hidden = true;
      $('dict-setup').hidden = false;
      $('dict-input').value = '';
    });
    $('dict-play-audio').addEventListener('click', function () {
      var it = dict.list[dict.idx];
      if (it) playItem(it);
    });
    $('dict-submit').addEventListener('click', submitDict);
    $('dict-skip').addEventListener('click', function () {
      if (dict.locked) return;
      var it = dict.list[dict.idx];
      if (!it) return;
      dict.locked = true;
      var fb = $('dict-feedback');
      fb.textContent = '答案：' + it.answer + '（' + it.speak + '）';
      fb.className = 'dict-feedback bad';
      $('dict-input').disabled = true;
      $('dict-submit').disabled = true;
      setTimeout(function () {
        dict.idx++;
        if (dict.idx >= dict.list.length) finishDict();
        else showItem();
      }, 1900);
    });
    $('dict-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitDict();
    });
    $('dict-again').addEventListener('click', function () {
      $('dict-done').hidden = true;
      $('dict-setup').hidden = false;
    });

    $('sent-check').addEventListener('click', checkSentence);
    $('sent-reset').addEventListener('click', function () { sent.picked = []; renderSentence(); });
    $('sent-next').addEventListener('click', newSentence);

    $('speak-play').addEventListener('click', function () {
      var s = speakList[speakIdx];
      if (!s) return;
      playAudio(sentenceAudio(s.lessonId, s.index || 0), s.ms);
    });
    $('speak-eval').addEventListener('click', startEval);
    $('mic-consent').addEventListener('change', function (e) {
      $('mic-allow').disabled = !e.target.checked;
    });
    $('mic-allow').addEventListener('click', confirmMic);
    $('mic-cancel').addEventListener('click', function () { $('mic-modal').hidden = true; pendingMic = null; });
    $('mic-modal').addEventListener('click', function (e) {
      if (e.target === $('mic-modal')) { $('mic-modal').hidden = true; pendingMic = null; }
    });
    $('speak-prev').addEventListener('click', function () {
      if (!speakList.length) return;
      speakIdx = (speakIdx - 1 + speakList.length) % speakList.length;
      renderSpeak();
    });
    $('speak-next').addEventListener('click', function () {
      if (!speakList.length) return;
      speakIdx = (speakIdx + 1) % speakList.length;
      renderSpeak();
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    bind();
    initOnboarding();
    renderDictCategories();
    window.addEventListener('beforeunload', save);
    if (window.Cloud) {
      Cloud.init(function () { updateAuthUI(); pullCloud(); });
      Cloud.onChange(function () {
        updateAuthUI();
        setTimeout(pullCloud, 0);
      });
    }
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      setTimeout(loadVoices, 400);
    }
    if (!S.profile.onboarded) {
      $('onboarding').hidden = false;
      renderHome();
      $('countdown').innerHTML = '距考试 <b>' + daysToExam() + '</b> 天';
    } else {
      if (S.lastView === 'learn' && currentUnit()) showLearn();
      else show('home');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
