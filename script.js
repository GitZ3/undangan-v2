(function () {
    'use strict';

    /* ========== KONFIGURASI ========== */
    var CONFIG = {
        countdownDate: (function () {
            var d = new Date();
            d.setMonth(d.getMonth() + 1);
            d.setDate(30);
            d.setHours(8, 0, 0, 0);
            return d;
        })(),
        coverFadeMs: 800,
        autoScrollIntervalMs: 5000,
        toastDurationMs: 3000
    };

    /* ========== STATE ========== */
    var state = {
        autoScrollEnabled: false,
        scrollInterval: null,
        countdownInterval: null
    };

    /* ========== DOM CACHE ========== */
    var $ = function (sel) { return document.querySelector(sel); };
    var $$ = function (sel) { return document.querySelectorAll(sel); };

    var els = {
        cover: $('#cover'),
        undangan: $('#undangan'),
        btnBuka: $('#btnBuka'),
        autoScrollBtn: $('#autoScrollBtn'),
        scrollIcon: $('#scrollIcon'),
        tabNav: $('#tabNav'),
        tabBtns: function () { return $$('.tab-btn'); },
        sections: function () { return $$('section[id]'); },
        ucapanForm: $('#ucapanForm'),
        toast: $('#ucapanToast'),
        days: $('#days'),
        hours: $('#hours'),
        minutes: $('#minutes'),
        seconds: $('#seconds')
    };

    /* ========== UTILS ========== */
    function pad(n) { return String(n).padStart(2, '0'); }

    function showToast(msg) {
        var t = els.toast;
        if (!t) return;
        t.textContent = msg;
        t.classList.remove('hidden');
        setTimeout(function () { t.classList.add('hidden'); }, CONFIG.toastDurationMs);
    }

    function safeId(id) { return id || ''; }

    /* ========== COVER ========== */
    function bukaUndangan() {
        if (!els.cover || !els.undangan) return;

        els.cover.classList.add('fade-out');

        setTimeout(function () {
            els.cover.style.display = 'none';
            els.undangan.classList.remove('hidden');
            window.scrollTo(0, 0);
            mulaiCountdown();
        }, CONFIG.coverFadeMs);
    }

    /* ========== COUNTDOWN ========== */
    function mulaiCountdown() {
        var target = CONFIG.countdownDate.getTime();

        function update() {
            var now = Date.now();
            var selisih = target - now;

            if (selisih <= 0) {
                ['days','hours','minutes','seconds'].forEach(function (id) {
                    var el = document.getElementById(id);
                    if (el) el.textContent = '00';
                });
                if (state.countdownInterval) {
                    clearInterval(state.countdownInterval);
                    state.countdownInterval = null;
                }
                return;
            }

            var hari = Math.floor(selisih / 86400000);
            var jam = Math.floor((selisih % 86400000) / 3600000);
            var menit = Math.floor((selisih % 3600000) / 60000);
            var detik = Math.floor((selisih % 60000) / 1000);

            if (els.days) els.days.textContent = pad(hari);
            if (els.hours) els.hours.textContent = pad(jam);
            if (els.minutes) els.minutes.textContent = pad(menit);
            if (els.seconds) els.seconds.textContent = pad(detik);
        }

        update();
        state.countdownInterval = setInterval(update, 1000);
    }

    /* ========== AUTO SCROLL ========== */
    function toggleAutoScroll() {
        state.autoScrollEnabled = !state.autoScrollEnabled;

        if (state.autoScrollEnabled) {
            els.scrollIcon.className = 'fa-solid fa-pause';
            els.autoScrollBtn.classList.add('active');
            startAutoScroll();
        } else {
            els.scrollIcon.className = 'fa-solid fa-play';
            els.autoScrollBtn.classList.remove('active');
            stopAutoScroll();
        }
    }

    function startAutoScroll() {
        var sectionList = $$('section');
        var current = 0;

        function next() {
            if (!state.autoScrollEnabled) return;

            if (current < sectionList.length) {
                sectionList[current].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                current++;
            } else {
                current = 0;
            }
        }

        stopAutoScroll();
        state.scrollInterval = setInterval(next, CONFIG.autoScrollIntervalMs);
        next();
    }

    function stopAutoScroll() {
        if (state.scrollInterval) {
            clearInterval(state.scrollInterval);
            state.scrollInterval = null;
        }
    }

    /* ========== TAB NAV ========== */
    function scrollToSection(sectionId) {
        var section = document.getElementById(sectionId);
        if (!section) return;

        section.scrollIntoView({ behavior: 'smooth', block: 'center' });

        els.tabBtns().forEach(function (b) { b.classList.remove('active'); });
        var match = els.tabNav.querySelector('[data-section="' + sectionId + '"]');
        if (match) match.classList.add('active');
    }

    function setupIntersectionObserver() {
        var allSections = els.sections();
        if (!allSections.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var id = entry.target.getAttribute('id');
                var found = null;

                els.tabBtns().forEach(function (btn) {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-section') === id) {
                        btn.classList.add('active');
                        found = btn;
                    }
                });

                if (found) {
                    found.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            });
        }, { root: null, threshold: 0.3 });

        allSections.forEach(function (s) { observer.observe(s); });
    }

    /* ========== UCAPAN FORM ========== */
    function handleUcapanSubmit(e) {
        e.preventDefault();

        var form = e.target;
        var data = new FormData(form);
        var nama = (data.get('nama') || '').trim();
        var kehadiran = data.get('kehadiran') || '';
        var pesan = (data.get('pesan') || '').trim();

        if (!nama) {
            showToast('Silakan isi nama Anda');
            return;
        }

        if (!kehadiran) {
            showToast('Pilih konfirmasi kehadiran');
            return;
        }

        console.log('[Ucapan]', { nama: nama, kehadiran: kehadiran, pesan: pesan });
        showToast('Terima kasih! Ucapan Anda telah terkirim.');
        form.reset();
    }

    /* ========== EVENT BINDING ========== */
    function bindEvents() {
        if (els.btnBuka) {
            els.btnBuka.addEventListener('click', bukaUndangan);
        }

        if (els.autoScrollBtn) {
            els.autoScrollBtn.addEventListener('click', toggleAutoScroll);
        }

        if (els.tabNav) {
            els.tabNav.addEventListener('click', function (e) {
                var btn = e.target.closest('.tab-btn');
                if (!btn) return;
                var sectionId = btn.getAttribute('data-section');
                if (sectionId) scrollToSection(sectionId);
            });
        }

        if (els.ucapanForm) {
            els.ucapanForm.addEventListener('submit', handleUcapanSubmit);
        }

        window.addEventListener('beforeunload', function () {
            if (state.countdownInterval) clearInterval(state.countdownInterval);
            if (state.scrollInterval) clearInterval(state.scrollInterval);
        });
    }

    /* ========== INIT ========== */
    function init() {
        bindEvents();
        setupIntersectionObserver();

        var activeBtn = els.tabNav ? els.tabNav.querySelector('.tab-btn.active') : null;
        if (!activeBtn && els.tabNav) {
            var first = els.tabNav.querySelector('.tab-btn');
            if (first) first.classList.add('active');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
