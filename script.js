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
        autoScrollSpeed: 2,
        toastDurationMs: 3000
    };

    /* ========== STATE ========== */
    var state = {
        autoScrollEnabled: false,
        scrollRafId: null,
        countdownInterval: null,
        musicPlaying: false
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
        musicBtn: $('#musicBtn'),
        musicIcon: $('#musicIcon'),
        bgMusic: $('#bgMusic'),
        tabNav: $('#tabNav'),
        tabNavToggle: $('#tabNavToggle'),
        tabBtns: function () { return $$('.tab-btn'); },
        sections: function () { return $$('section[id]'); },
        ucapanForm: $('#ucapanForm'),
        guestbookList: $('#guestbookList'),
        toast: $('#ucapanToast'),
        days: $('#days'),
        hours: $('#hours'),
        minutes: $('#minutes'),
        seconds: $('#seconds')
    };

    var STORAGE_KEY = 'undangan_ucapan';
    var NAV_AUTOHIDE_MS = 3000;

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
        playMusic();

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

    /* ========== MUSIC ========== */
    function playMusic() {
        var audio = els.bgMusic;
        if (!audio) return;

        audio.play().then(function () {
            state.musicPlaying = true;
            if (els.musicBtn) els.musicBtn.classList.add('playing');
            if (els.musicBtn) els.musicBtn.classList.remove('muted');
        }).catch(function () {});
    }

    function toggleMusic() {
        var audio = els.bgMusic;
        if (!audio) return;

        if (state.musicPlaying) {
            audio.pause();
            state.musicPlaying = false;
            if (els.musicBtn) els.musicBtn.classList.remove('playing');
            if (els.musicBtn) els.musicBtn.classList.add('muted');
        } else {
            audio.play().then(function () {
                state.musicPlaying = true;
                if (els.musicBtn) els.musicBtn.classList.add('playing');
                if (els.musicBtn) els.musicBtn.classList.remove('muted');
            }).catch(function () {});
        }
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
        if (state.scrollRafId) return;

        function step() {
            if (!state.autoScrollEnabled) {
                state.scrollRafId = null;
                return;
            }

            var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            var current = window.scrollY;

            if (current >= maxScroll - 2) {
                window.scrollTo(0, 0);
            } else {
                window.scrollBy(0, CONFIG.autoScrollSpeed);
            }

            state.scrollRafId = requestAnimationFrame(step);
        }

        state.scrollRafId = requestAnimationFrame(step);
    }

    function stopAutoScroll() {
        if (state.scrollRafId) {
            cancelAnimationFrame(state.scrollRafId);
            state.scrollRafId = null;
        }
    }

    /* ========== TAB NAV ========== */
    var navHideTimer = null;

    function showNav() {
        if (els.tabNav) els.tabNav.classList.remove('hide');
        resetNavTimer();
    }

    function hideNav() {
        if (els.tabNav) els.tabNav.classList.add('hide');
    }

    function toggleNav() {
        var isHidden = els.tabNav && els.tabNav.classList.contains('hide');
        if (isHidden) {
            showNav();
        } else {
            hideNav();
        }
    }

    function resetNavTimer() {
        if (navHideTimer) clearTimeout(navHideTimer);
        navHideTimer = setTimeout(hideNav, NAV_AUTOHIDE_MS);
    }

    function scrollToSection(sectionId) {
        var section = document.getElementById(sectionId);
        if (!section) return;

        section.scrollIntoView({ behavior: 'smooth', block: 'center' });

        els.tabBtns().forEach(function (b) { b.classList.remove('active'); });
        var match = els.tabNav.querySelector('[data-section="' + sectionId + '"]');
        if (match) match.classList.add('active');

        showNav();
    }

    function scrollNavToActive(btn) {
        var nav = els.tabNav;
        if (!nav) return;

        var navHeight = nav.clientHeight;
        var btnTop = btn.offsetTop;
        var btnHeight = btn.offsetHeight;
        var targetScroll = btnTop - (navHeight / 2) + (btnHeight / 2);

        targetScroll = Math.max(0, Math.min(targetScroll, nav.scrollHeight - navHeight));
        nav.scrollTop = targetScroll;
    }

    function setupIntersectionObserver() {
        var allSections = els.sections();
        if (!allSections.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');

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
                        scrollNavToActive(found);
                    }
                }
            });
        }, { root: null, threshold: 0.15 });

        allSections.forEach(function (s) {
            s.classList.add('anim-section');
            observer.observe(s);
        });

        // Mark already visible sections immediately
        allSections.forEach(function (s) {
            var rect = s.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                s.classList.add('in-view');
            }
        });
    }

    /* ========== UCAPAN FORM ========== */
    function getUcapan() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch (e) { return []; }
    }

    function simpanUcapan(data) {
        var list = getUcapan();
        list.push({ /* push, not unshift — newest at bottom */
            id: Date.now() + Math.random(),
            nama: data.nama,
            kehadiran: data.kehadiran,
            pesan: data.pesan,
            time: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function renderGuestbook() {
        var list = getUcapan();
        var el = els.guestbookList;
        if (!el) return;

        if (!list.length) {
            el.innerHTML = '<div class="guestbook-empty">Belum ada pesan. Jadilah yang pertama!</div>';
            return;
        }

        el.innerHTML = list.map(function (item) {
            var dotClass = item.kehadiran === 'hadir' ? 'hadir' : 'tidak';
            var time = new Date(item.time).toLocaleDateString('id-ID', {
                hour: '2-digit', minute: '2-digit'
            });
            var pesanHtml = item.pesan ? '<div class="guestbook-item-pesan">' + escapeHtml(item.pesan) + '</div>' : '';
            return '<div class="guestbook-item">' +
                '<div class="guestbook-item-meta">' +
                    '<span class="guestbook-item-name">' + escapeHtml(item.nama) + '</span>' +
                    '<span class="guestbook-item-dot ' + dotClass + '"></span>' +
                    '<span class="guestbook-item-time">' + time + '</span>' +
                '</div>' +
                pesanHtml +
            '</div>';
        }).join('');

        el.scrollTop = el.scrollHeight;
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

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

        simpanUcapan({ nama: nama, kehadiran: kehadiran, pesan: pesan });
        renderGuestbook();
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

        if (els.musicBtn) {
            els.musicBtn.addEventListener('click', toggleMusic);
        }

        if (els.tabNav) {
            els.tabNav.addEventListener('click', function (e) {
                var btn = e.target.closest('.tab-btn');
                if (!btn) return;
                var sectionId = btn.getAttribute('data-section');
                if (sectionId) scrollToSection(sectionId);
            });

            els.tabNav.addEventListener('mouseenter', showNav);
            els.tabNav.addEventListener('mouseleave', resetNavTimer);
        }

        if (els.tabNavToggle) {
            els.tabNavToggle.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleNav();
            });
        }

        document.addEventListener('mousemove', function (e) {
            if (e.clientX < 100 && els.tabNav && els.tabNav.classList.contains('hide')) {
                showNav();
            }
        });

        if (els.ucapanForm) {
            els.ucapanForm.addEventListener('submit', handleUcapanSubmit);
        }

        window.addEventListener('beforeunload', function () {
            if (state.countdownInterval) clearInterval(state.countdownInterval);
            stopAutoScroll();
        });
    }

    /* ========== INIT ========== */
    function init() {
        bindEvents();
        setupIntersectionObserver();
        renderGuestbook();

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
