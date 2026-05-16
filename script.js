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

    /* ========== FIREBASE ========== */
    var firebaseConfig = {
        apiKey: "AIzaSyCBfM0WIpPnz4fCH7sPu98IpIXZGRFxgro",
        authDomain: "guest-dd0a3.firebaseapp.com",
        projectId: "guest-dd0a3",
        storageBucket: "guest-dd0a3.firebasestorage.app",
        messagingSenderId: "950417950891",
        appId: "1:950417950891:web:ead4b62a37954c1480cfee"
    };
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();

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
        guestbookStats: $('#guestbookStats'),
        toast: $('#ucapanToast'),
        days: $('#days'),
        hours: $('#hours'),
        minutes: $('#minutes'),
        seconds: $('#seconds'),
        navWrapper: $('#navWrapper')
    };

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
            spawnFloatingHands();
        }, CONFIG.coverFadeMs);
    }

    /* ========== FLOATING HANDS ========== */
    function spawnFloatingHands() {
        var container = document.getElementById('float-hands');
        if (!container || container.hasChildNodes()) return;
        for (var i = 0; i < 10; i++) {
            var icon = document.createElement('i');
            icon.className = 'fa-solid fa-hand-middle-finger';
            container.appendChild(icon);
        }
    }

    /* ========== COUNTDOWN ========== */
    function mulaiCountdown() {
        var target = CONFIG.countdownDate.getTime();

        function update() {
            var now = Date.now();
            var selisih = target - now;

            if (selisih <= 0) {
                ['days', 'hours', 'minutes', 'seconds'].forEach(function (id) {
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

    function setupNavToggle() {
        if (!els.tabNavToggle) return;
        els.tabNavToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleNav();
        });
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

        allSections.forEach(function (s) {
            var rect = s.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                s.classList.add('in-view');
            }
        });
    }

    /* ========== GUESTBOOK (FIREBASE) ========== */
    function renderGuestbook(snapshot) {
        var el = els.guestbookList;
        var stats = els.guestbookStats;
        if (!el) return;

        var docs = snapshot.docs || [];
        var totalHadir = 0;

        if (!docs.length) {
            el.innerHTML = '<div class="guestbook-empty">Belum ada pesan. Jadilah yang pertama!</div>';
            if (stats) stats.textContent = '0 pesan · 0 hadir';
            return;
        }

        var html = '';
        docs.forEach(function (doc) {
            var msg = doc.data();
            var hadir = msg.attendance === 'hadir';
            if (hadir) totalHadir++;

            var initial = (msg.name || '?')[0].toUpperCase();
            var avatarClass = hadir ? 'hadir' : 'tidak';
            var badgeClass = hadir ? 'hadir' : 'tidak';
            var badgeText = hadir ? 'Hadir' : 'Tidak';

            var timeStr = msg.jam ? msg.jam : '--:--';
            var dateStr = msg.tanggal ? msg.tanggal : '';

            html += '<div class="guestbook-item">' +
                '<div class="guestbook-avatar ' + avatarClass + '">' + initial + '</div>' +
                '<div class="guestbook-body">' +
                    '<div class="guestbook-body-top">' +
                        '<span class="guestbook-item-name">' + escapeHtml(msg.name) + '</span>' +
                        '<span class="guestbook-item-badge ' + badgeClass + '">' + badgeText + '</span>' +
                    '</div>' +
                    '<div class="guestbook-item-pesan">' + escapeHtml(msg.message || '') + '</div>' +
                    '<div class="guestbook-item-time">' + timeStr + (dateStr ? ' · ' + dateStr : '') + '</div>' +
                '</div>' +
            '</div>';
        });

        el.innerHTML = html;
        el.scrollTop = el.scrollHeight;

        if (stats) {
            stats.textContent = docs.length + ' pesan · ' + totalHadir + ' hadir';
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /* ========== COPY REKENING ========== */
    window.copyRekening = function () {
        var rek = document.getElementById('rekening');
        var btn = rek ? rek.nextElementSibling : null;
        if (!rek) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(rek.textContent).then(function () {
                if (btn) {
                    btn.classList.add('copied');
                    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(function () {
                        btn.classList.remove('copied');
                        btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                    }, 2000);
                }
                showToast('Nomor rekening disalin!');
            }).catch(function () {
                fallbackCopy(rek);
            });
        } else {
            fallbackCopy(rek);
        }
    };

    function fallbackCopy(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
        showToast('Nomor rekening disalin!');
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

        var now = new Date();
        var jam = pad(now.getHours()) + ':' + pad(now.getMinutes());
        var tanggal = pad(now.getDate()) + '-' + pad(now.getMonth() + 1) + '-' + now.getFullYear();

        db.collection('guestbook').add({
            name: nama,
            attendance: kehadiran,
            message: pesan,
            jam: jam,
            tanggal: tanggal,
            time: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function () {
            showToast('Terima kasih! Ucapan Anda telah terkirim.');
            form.reset();
        }).catch(function () {
            showToast('Gagal mengirim. Coba lagi.');
        });
    }

    /* ========== VIDEO PLACEHOLDER ========== */
    function hideVideoPlaceholder() {
        var video = document.querySelector('#galeri video');
        if (!video) return;
        video.addEventListener('loadeddata', function () {
            var pl = document.querySelector('.video-placeholder');
            if (pl) pl.style.display = 'none';
        });
        if (video.readyState >= 2) {
            var pl = document.querySelector('.video-placeholder');
            if (pl) pl.style.display = 'none';
        }
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

            els.tabNav.addEventListener('mouseenter', function () {
                showNav();
                resetNavTimer();
            });
            els.tabNav.addEventListener('mouseleave', resetNavTimer);
        }

        if (els.tabNavToggle) {
            els.tabNavToggle.addEventListener('click', function () {
                toggleNav();
            });
        }

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
        hideVideoPlaceholder();

        // Nav auto-hide
        setTimeout(function () {
            if (els.tabNav) els.tabNav.classList.add('hide');
        }, 3000);

        // Active tab default
        var activeBtn = els.tabNav ? els.tabNav.querySelector('.tab-btn.active') : null;
        if (!activeBtn && els.tabNav) {
            var first = els.tabNav.querySelector('.tab-btn');
            if (first) first.classList.add('active');
        }

        // Firebase guestbook real-time listener
        db.collection('guestbook').orderBy('time', 'asc').onSnapshot(function (snapshot) {
            renderGuestbook(snapshot);
        }, function () {
            var el = els.guestbookList;
            if (el) {
                el.innerHTML = '<div class="guestbook-empty">Gagal memuat pesan. Periksa koneksi.</div>';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
