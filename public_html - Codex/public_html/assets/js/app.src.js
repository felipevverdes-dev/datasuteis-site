!function() {
    "use strict";
    const e = "datasuteis_", t = new Set([ "pt", "en", "es" ]), a = {
        pt: "pt-BR",
        en: "en",
        es: "es"
    }, n = {
        pt: "pt-BR",
        en: "en-US",
        es: "es-ES"
    }, SCALE_DATE_LOCALE = "pt-BR", SCALE_LOCALE_REFERENCE_DATE = new Date(2026, 0, 4), SCALE_MONTH_FORMATTER = new Intl.DateTimeFormat(SCALE_DATE_LOCALE, {
        month: "long"
    }), SCALE_WEEKDAY_FORMATTER = new Intl.DateTimeFormat(SCALE_DATE_LOCALE, {
        weekday: "short"
    }), ADSENSE_CLIENT_ID = "ca-pub-3377250238500968", ADSENSE_SLOT_IDS = Object.freeze({
        "ads-top": "",
        "ads-sidebar": "",
        "ads-result": ""
    }), r = {
        lang: "pt",
        i18n: {},
        theme: "light",
        rStart: null,
        rEnd: null,
        selecting: !1,
        calcMode: "range",
        curMonth: (new Date).getMonth(),
        curYear: (new Date).getFullYear(),
        curWeekStart: null,
        homeView: "monthly",
        calView: "annual",
        holidays: [],
        inclStart: !0,
        scaleParams: null,
        adsPushed: new Set,
        dataFeedback: {
            mode: "hidden",
            message: "",
            retry: null
        },
        scaleFocusLocked: "",
        scaleFocusHover: "",
        nonCriticalUiReady: !1
    }, o = (e, t) => (t || document).querySelector(e), s = (e, t) => [ ...(t || document).querySelectorAll(e) ];
    function getPageKey() {
        const e = document.body?.dataset.page || "";
        return "cidade" === e ? "calcular" : e;
    }
    function isBlogArticlePage() {
        const e = window.location.pathname.replace(/index\.html$/i, "");
        return e.startsWith("/blog/") && "/blog/" !== e;
    }
    function replacePlaceholderNode(e, t) {
        if (!e) return;
        const a = document.createElement("template");
        a.innerHTML = t.trim(), e.replaceWith(a.content.cloneNode(!0));
    }
    function getNavLinkHtml({href: e, key: t, label: a, active: n}) {
        return `<a href="${e}" class="tab-btn${n ? " active" : ""}"${n ? ' aria-current="page"' : ""} data-i18n="${t}">${a}</a>`;
    }
    function getMobileMenuLinkHtml({href: e, key: t, label: a}) {
        return `<a href="${e}" class="block px-6 py-2 text-sm font-medium hover:bg-surface-100 dark:hover:bg-surface-800" data-i18n="${t}">${a}</a>`;
    }
    function getBottomNavItemHtml({href: e, key: t, label: a, icon: n, active: r}) {
        return `<a href="${e}" class="mobile-bottom-nav__item${r ? " is-active" : ""}" data-mobile-nav="${t}"${r ? ' aria-current="page"' : ""}>${n}<span data-i18n="${a}"></span></a>`;
    }
    function getSiteNavHtml() {
        const e = getPageKey(), t = [ {
            href: "/",
            key: "nav_home",
            label: "Início",
            active: "home" === e
        }, {
            href: "/calcular/",
            key: "nav_calc",
            label: "Dias Úteis",
            active: "calcular" === e
        }, {
            href: "/calculadora/",
            key: "nav_calculator",
            label: "Calculadora",
            active: "calculadora" === e
        }, {
            href: "/calendario/",
            key: "nav_calendar",
            label: "Calendário",
            active: "calendario" === e
        }, {
            href: "/escala/",
            key: "nav_scale",
            label: "Escala",
            active: "escala" === e
        }, {
            href: "/blog/",
            key: "nav_blog",
            label: "Blog",
            active: "blog" === e
        } ].map(getNavLinkHtml).join(""), a = [ {
            href: "/",
            key: "nav_home",
            label: "Início"
        }, {
            href: "/calcular/",
            key: "nav_calc",
            label: "Dias Úteis"
        }, {
            href: "/calculadora/",
            key: "nav_calculator",
            label: "Calculadora"
        }, {
            href: "/calendario/",
            key: "nav_calendar",
            label: "Calendário"
        }, {
            href: "/escala/",
            key: "nav_scale",
            label: "Escala"
        }, {
            href: "/blog/",
            key: "nav_blog",
            label: "Blog"
        } ].map(getMobileMenuLinkHtml).join("");
        return `<nav class="sticky top-0 z-50 glass border-b border-surface-200/50 dark:border-surface-700/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <a href="/" class="flex items-center">
                    <img src="/assets/brand/datasuteis-logo.png" width="112" height="54" alt="Datas Úteis" class="img-logo">
                </a>
                <div class="hidden md:flex items-center gap-1">
                    ${t}
                </div>
                <div class="flex items-center gap-2">
                    <div class="hidden sm:flex items-center gap-1 text-xs mr-2">
                        <button class="lang-btn active px-1.5 py-0.5 rounded" data-lang="pt">PT</button>
                        <button class="lang-btn px-1.5 py-0.5 rounded" data-lang="en">EN</button>
                        <button class="lang-btn px-1.5 py-0.5 rounded" data-lang="es">ES</button>
                    </div>
                    <button id="theme-toggle" class="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="Alternar tema" data-i18n-aria="tooltip_theme" data-tooltip="tooltip_theme">
                        <svg id="theme-icon" class="icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                        </svg>
                    </button>
                    <button id="mobile-menu-btn" class="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800" aria-label="Menu" aria-controls="mobile-menu" aria-expanded="false" data-i18n-aria="nav_menu_label">
                        <svg class="icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="mobile-lang-bar md:hidden">
            <button class="lang-btn active px-1.5 py-0.5 rounded text-xs" data-lang="pt">PT</button>
            <button class="lang-btn px-1.5 py-0.5 rounded text-xs" data-lang="en">EN</button>
            <button class="lang-btn px-1.5 py-0.5 rounded text-xs" data-lang="es">ES</button>
        </div>
        <div id="mobile-menu" class="hidden md:hidden border-t border-surface-200 dark:border-surface-700 pb-3">
            ${a}
        </div>
    </nav>`;
    }
    function getSiteFooterHtml() {
        return isBlogArticlePage() ? `<footer class="site-footer">
        <p data-i18n="footer_about">O Datas Úteis é uma ferramenta gratuita para calcular dias úteis no Brasil, consultar calendário com feriados nacionais e utilizar um simulador de escala de trabalho online.</p>
        <p data-i18n="footer_tools">Ferramentas disponíveis: cálculo de dias úteis, contador de dias úteis entre datas, calendário com feriados nacionais, simulador de escala 12x36, simulador de escala 6x1, simulador de escala de plantão.</p>
        <p><a href="/privacidade/" data-i18n="footer_privacy">Política de Privacidade</a> | <a href="mailto:contato@datasuteis.com.br" data-i18n="footer_contact">Contato</a></p>
    </footer>` : `<footer class="site-footer">
        <p data-i18n="footer_about">O Datas Úteis é uma ferramenta gratuita para calcular dias úteis no Brasil, consultar calendário com feriados nacionais e utilizar um simulador de escala de trabalho online.</p>
        <p data-i18n="footer_tools">Ferramentas disponíveis: cálculo de dias úteis, contador de dias úteis entre datas, calendário com feriados nacionais, simulador de escala 12x36, simulador de escala 6x1, simulador de escala de plantão.</p>
        <p><a href="/calcular/">Dias Úteis</a> | <a href="/calculadora/">Calculadora</a> | <a href="/calendario/">Calendário</a> | <a href="/escala/">Simulador de Escalas</a> | <a href="/blog/">Blog</a></p>
        <p><a href="/privacidade/" data-i18n="footer_privacy">Política de Privacidade</a> | <a href="mailto:contato@datasuteis.com.br" data-i18n="footer_contact">Contato</a></p>
    </footer>`;
    }
    function getMobileBottomNavHtml() {
        const e = getCurrentMobileNavKey(), t = [ {
            href: "/",
            key: "home",
            label: "bnav_home",
            active: "home" === e,
            icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10.5l9-7 9 7V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"/></svg>'
        }, {
            href: "/calcular/",
            key: "calcular",
            label: "bnav_calc",
            active: "calcular" === e,
            icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/><line x1="3" y1="9" x2="21" y2="9"/></svg>'
        }, {
            href: "/calculadora/",
            key: "calculadora",
            label: "bnav_calculator",
            active: "calculadora" === e,
            icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h4"/></svg>'
        }, {
            href: "/calendario/",
            key: "calendario",
            label: "bnav_calendar",
            active: "calendario" === e,
            icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/><line x1="3" y1="9" x2="21" y2="9"/></svg>'
        }, {
            href: "/escala/",
            key: "escala",
            label: "bnav_scale",
            active: "escala" === e,
            icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8"/><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/></svg>'
        }, {
            href: "/blog/",
            key: "blog",
            label: "nav_blog",
            active: "blog" === e,
            icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 4h10a2 2 0 012 2v14l-5-2-5 2V4z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 8h5M9 11h5"/></svg>'
        } ].map(getBottomNavItemHtml).join("");
        return `<nav class="mobile-bottom-nav" aria-label="Navegacao principal">${t}</nav>`;
    }
    function getHelpSheetHtml() {
        return `<div id="help-sheet" class="help-sheet" aria-hidden="true">
        <div class="help-sheet__backdrop" data-help-close></div>
        <div class="help-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="help-sheet-title">
            <h2 id="help-sheet-title" class="help-sheet__title" data-i18n="help_default_title">Ajuda</h2>
            <div id="help-sheet-body" class="text-sm leading-relaxed"></div>
            <button type="button" class="btn-secondary help-sheet__close mt-4" data-help-close data-i18n="help_close">Fechar</button>
        </div>
    </div>`;
    }
    function renderSiteChrome() {
        replacePlaceholderNode(o("[data-site-nav]"), getSiteNavHtml()), replacePlaceholderNode(o("[data-site-footer]"), getSiteFooterHtml()), 
        replacePlaceholderNode(o("[data-mobile-bottom-nav]"), getMobileBottomNavHtml()), replacePlaceholderNode(o("[data-help-sheet]"), getHelpSheetHtml());
    }
    function syncMobileMenuButtonState() {
        const e = o("#mobile-menu-btn"), t = o("#mobile-menu");
        e && t && e.setAttribute("aria-expanded", t.classList.contains("hidden") ? "false" : "true");
    }
    function getCurrentMobileNavKey() {
        return {
            home: "home",
            calcular: "calcular",
            cidade: "calcular",
            calculadora: "calculadora",
            calendario: "calendario",
            escala: "escala",
            blog: "blog"
        }[document.body.dataset.page] || "";
    }
    function syncMobileBottomNavState() {
        const e = getCurrentMobileNavKey();
        s("[data-mobile-nav]").forEach(t => {
            const a = t.dataset.mobileNav === e;
            t.classList.toggle("is-active", a), a ? t.setAttribute("aria-current", "page") : t.removeAttribute("aria-current");
        });
    }
    function getAdsenseClientId() {
        return o('meta[name="google-adsense-account"]')?.content?.trim() || ADSENSE_CLIENT_ID;
    }
    function getConfiguredAdSlotId(e, t = null) {
        const a = t || document.getElementById(e), n = a?.querySelector("ins.adsbygoogle"), r = n?.getAttribute("data-ad-slot")?.trim() || a?.dataset.adSlot || ADSENSE_SLOT_IDS[e] || "";
        return /^\d+$/.test(r) ? r : "";
    }
    function primeAdsElements() {
        const e = getAdsenseClientId();
        s("ins.adsbygoogle").forEach(t => {
            e && !t.getAttribute("data-ad-client") && t.setAttribute("data-ad-client", e);
        });
    }
    // Deprecated runtime kept only for non-v2 pages until the final legacy removal.
    function isLegacyScaleRuntimeEnabled() {
        return "escala" === getPageKey() && "v2" !== document.body.dataset.scaleSimulator && !!window.ShiftScheduler;
    }
    function c(t) {
        try {
            return localStorage.getItem(t) || localStorage.getItem(e + t);
        } catch {
            return null;
        }
    }
    function i(t, a) {
        try {
            localStorage.setItem(t, a), localStorage.setItem(e + t, a);
        } catch {}
    }
    function d(e) {
        "complete" !== document.readyState ? window.addEventListener("load", e, {
            once: !0
        }) : e();
    }
    function l(e, t = {}) {
        const a = t.timeout || 2500, n = t.fallbackDelay || 1200;
        "requestIdleCallback" in window ? window.requestIdleCallback(() => e(), {
            timeout: a
        }) : window.setTimeout(e, n);
    }
    function u(e, t, a = {}) {
        const n = document.getElementById(e) || document.querySelector(`script[src="${t}"]`);
        return n ? "1" === n.dataset.loaded ? Promise.resolve(n) : new Promise(e => n.addEventListener("load", () => e(n), {
            once: !0
        })) : new Promise((n, r) => {
            const o = document.createElement("script");
            o.id = e, o.src = t, o.async = !1 !== a.async, Object.entries(a).forEach(([e, t]) => {
                "async" !== e && o.setAttribute(e, t);
            }), o.addEventListener("load", () => {
                o.dataset.loaded = "1", n(o);
            }, {
                once: !0
            }), o.addEventListener("error", r, {
                once: !0
            }), document.head.appendChild(o);
        });
    }
    function m() {
        r.nonCriticalUiReady || (r.nonCriticalUiReady = !0, me(), function() {
            const e = o("#help-sheet"), t = o("#help-sheet-title"), a = o("#help-sheet-body");
            function n() {
                e.classList.remove("is-open"), e.setAttribute("aria-hidden", "true");
            }
            function r(n, r) {
                t.textContent = n || v("help_default_title"), a.textContent = r || "", e.classList.add("is-open"), 
                e.setAttribute("aria-hidden", "false");
            }
            e && t && a && (s("[data-help-close]").forEach(e => e.addEventListener("click", n)), 
            document.addEventListener("keydown", e => {
                "Escape" === e.key && n();
            }), s(".help-btn").forEach(e => {
                e.addEventListener("click", () => {
                    r(e.dataset.helpTitleI18n ? v(e.dataset.helpTitleI18n) : e.dataset.helpTitle || v("help_default_title"), e.dataset.helpBodyI18n ? v(e.dataset.helpBodyI18n) : e.dataset.helpBody || "");
                });
            }));
        }(), function() {
            const e = new Set;
            s("a[href]").forEach(t => {
                const a = t.getAttribute("href");
                if (!a || a.startsWith("#") || a.startsWith("mailto:") || a.startsWith("tel:") || a.startsWith("javascript:")) return;
                let n;
                try {
                    n = new URL(a, window.location.origin);
                } catch {
                    return;
                }
                if (n.origin !== window.location.origin || n.pathname === window.location.pathname) return;
                const r = () => {
                    e.has(n.pathname) || (e.add(n.pathname), xe(n.pathname));
                };
                t.addEventListener("mouseenter", r, {
                    once: !0
                }), t.addEventListener("focusin", r, {
                    once: !0
                }), t.addEventListener("touchstart", r, {
                    once: !0,
                    passive: !0
                });
            });
        }());
    }
    function p(e) {
        return t.has(e) ? e : "en";
    }
    function h() {
        return document.body?.dataset.dateLocale || n[r.lang] || "en-US";
    }
    function f(e, t) {
        const a = Number(e), n = Number(t);
        if (Number.isInteger(a) && Number.isInteger(n) && n >= 0 && n <= 11) return {
            value: `${a}-${String(n + 1).padStart(2, "0")}`,
            year: a,
            month: n + 1,
            monthIndex: n
        };
        const r = new Date;
        return {
            value: `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, "0")}`,
            year: r.getFullYear(),
            month: r.getMonth() + 1,
            monthIndex: r.getMonth()
        };
    }
    function g() {
        const e = new Date;
        return f(e.getFullYear(), e.getMonth());
    }
    async function y(e) {
        const t = p(e);
        try {
            const e = await fetch(`/assets/js/i18n/${t}.json`);
            if (!e.ok) throw new Error(`i18n_http_${e.status}`);
            r.i18n = await e.json(), r.lang = t;
        } catch {
            if ("en" !== t) return void await y("en");
            r.lang = "en", r.i18n = r.i18n || {};
        }
        i("lang", r.lang);
    }
    function v(e) {
        return r.i18n[e] || e;
    }
    function w(e, t) {
        const a = v(e);
        return a === e ? t : a;
    }
    function b(e, t = {}) {
        let a = v(e);
        return Object.entries(t).forEach(([e, t]) => {
            a = a.replace(new RegExp(`\\{${e}\\}`, "g"), String(t));
        }), a;
    }
    function x(e, t) {
        const a = s(t, e);
        return e && 1 === e.nodeType && e.matches(t) && a.unshift(e), a;
    }
    function E(e) {
        if (!e) return {};
        try {
            const t = JSON.parse(e);
            return t && "object" == typeof t ? t : {};
        } catch {
            return {};
        }
    }
    function k(e, t) {
        return {
            ...t,
            ...E(e.dataset.i18nVars)
        };
    }
    function _() {
        const e = parseInt(o("#calendar-year")?.value || document.body?.dataset.year || String(r.curYear), 10);
        return Number.isFinite(e) ? e : (new Date).getFullYear();
    }
    function L(e = {}) {
        const t = e.root || document, n = !1 !== e.hydrateText, c = t !== document;
        c || (document.documentElement.lang = a[r.lang] || "en", Y(), H()), function(e, t = {}) {
            const a = !1 !== t.hydrateText, n = {
                year: (new Date).getFullYear()
            };
            a && (x(e, "[data-i18n]").forEach(e => {
                e.textContent = b(e.dataset.i18n, k(e, n));
            }), x(e, "[data-i18n-html]").forEach(e => {
                e.innerHTML = b(e.dataset.i18nHtml, k(e, n));
            })), x(e, "[data-calendar-year-i18n]").forEach(e => {
                e.textContent = b(e.dataset.calendarYearI18n, {
                    ...k(e, n),
                    year: _()
                });
            }), x(e, "[data-i18n-placeholder]").forEach(e => {
                e.placeholder = b(e.dataset.i18nPlaceholder, k(e, n));
            }), x(e, "[data-i18n-aria]").forEach(e => {
                e.setAttribute("aria-label", b(e.dataset.i18nAria, k(e, n)));
            }), x(e, "[data-i18n-title]").forEach(e => {
                e.title = b(e.dataset.i18nTitle, k(e, n));
            });
        }(t, {
            hydrateText: n
        }), c || (s(".lang-btn").forEach(e => {
            e.classList.toggle("active", e.dataset.lang === r.lang);
        }), R(), he(), r.nonCriticalUiReady && me(), n && (s(".faq-section, section:has(> .space-y-4 > details[data-faq])"), 
        s("details[data-faq]").forEach(e => {
            const t = e.dataset.faqQ, a = e.dataset.faqA;
            if (!t || !a) return;
            const n = o("summary", e), r = o("p", e);
            if (n) {
                o("svg", n);
                const e = n.firstChild;
                e && e.nodeType === Node.TEXT_NODE ? e.textContent = v(t) + "\n                        " : e && n.childNodes.forEach(e => {
                    e.nodeType === Node.TEXT_NODE && e.textContent.trim() && (e.textContent = v(t) + "\n                        ");
                });
            }
            r && (r.textContent = v(a));
        }), s(".faq-section").forEach(e => {
            const t = o("h2", e);
            t && (t.textContent = v("faq_title")), s("details[data-faq]", e).forEach(e => {
                const t = e.dataset.faqQ, a = e.dataset.faqA;
                if (!t || !a) return;
                const n = o("summary", e), r = o("p", e);
                n && (n.textContent = v(t)), r && (r.textContent = v(a));
            });
        })), function() {
            const e = (new Date).getFullYear();
            s("[data-dynamic-year]").forEach(t => {
                const a = t.dataset.dynamicYear;
                a && (t.textContent = a.replace("{year}", e));
            }), document.title = document.title.replace(/\b20\d{2}\b/g, e);
            const t = o('meta[name="description"]');
            t && (t.content = t.content.replace(/\b20\d{2}\b/g, e));
            const a = o('meta[name="keywords"]');
            a && (a.content = a.content.replace(/\b20\d{2}\b/g, e)), document.body.dataset.year && (document.body.dataset.year = e), 
            s("[data-year-title]").forEach(t => {
                const a = t.dataset.yearTitle;
                a && (t.textContent = a.replace("{year}", e));
            }), s(".site-footer").forEach(t => {
                t.innerHTML = t.innerHTML.replace(/\b20\d{2}\b/g, e);
            });
        }());
    }
    function C(e) {
        if (!e) return null;
        if (e instanceof Date) return new Date(e.getFullYear(), e.getMonth(), e.getDate());
        const [t, a, n] = e.split("-").map(Number);
        return new Date(t, a - 1, n);
    }
    function S(e) {
        return e ? function(e) {
            const t = C(e);
            return t ? new Intl.DateTimeFormat(h(), {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }).format(t) : "";
        }(e) : "";
    }
    function $(e) {
        return e ? `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}` : "";
    }
    function M(e, t) {
        return e && t && e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth() && e.getDate() === t.getDate();
    }
    function N(e) {
        const t = e.getDay();
        return 0 === t || 6 === t;
    }
    function D(e) {
        return e ? e.charAt(0).toUpperCase() + e.slice(1) : e;
    }
    function getScaleMonthParts(e) {
        const t = /^(\d{4})-(\d{2})$/.exec((e || "").trim());
        if (!t) return g();
        const a = Number(t[1]), n = Number(t[2]);
        return Number.isInteger(a) && n >= 1 && n <= 12 ? {
            value: `${a}-${String(n).padStart(2, "0")}`,
            year: a,
            month: n,
            monthIndex: n - 1
        } : g();
    }
    function getScaleMonthNames() {
        return Array.from({
            length: 12
        }, (e, t) => D(SCALE_MONTH_FORMATTER.format(new Date(2026, t, 1))));
    }
    function getScaleWeekdayLabels() {
        return Array.from({
            length: 7
        }, (e, t) => D(SCALE_WEEKDAY_FORMATTER.format(new Date(SCALE_LOCALE_REFERENCE_DATE.getFullYear(), SCALE_LOCALE_REFERENCE_DATE.getMonth(), SCALE_LOCALE_REFERENCE_DATE.getDate() + t))).replace(".", ""));
    }
    function normalizeScaleMonthIndex(e, t) {
        const a = Number(e), n = Number(t);
        if (Number.isInteger(a) && a >= 1 && a <= 12) return a - 1;
        if (Number.isInteger(n) && n >= 0 && n <= 11) return n;
        return (new Date).getMonth();
    }
    function formatScaleMonthLabel(e, t, a) {
        const n = Number(e), r = Number.isInteger(n) ? n : (new Date).getFullYear(), o = normalizeScaleMonthIndex(t, a);
        return `${D(SCALE_MONTH_FORMATTER.format(new Date(r, o, 1)))} ${r}`;
    }
    function F() {
        return getScaleMonthNames();
    }
    let T = [], I = [];
    function Y() {
        const e = h(), t = new Intl.DateTimeFormat(e, {
            month: "long"
        });
        T = Array.from({
            length: 12
        }, (e, a) => D(t.format(new Date(2026, a, 1))));
        const a = new Intl.DateTimeFormat(e, {
            weekday: "short"
        }), n = new Date(2026, 0, 4);
        I = Array.from({
            length: 7
        }, (e, t) => D(a.format(new Date(n.getFullYear(), n.getMonth(), n.getDate() + t))).replace(".", ""));
    }
    function H() {
        s('input[type="date"], input[type="month"]').forEach(e => {
            e.setAttribute("lang", h());
        });
    }
    function A() {
        return {
            hiddenInput: o("#scale-month-year"),
            monthSelect: o("#scale-month-select"),
            yearSelect: o("#scale-year-select")
        };
    }
    function j() {
        const {monthSelect: e, yearSelect: t} = A();
        return e && t && e.value && t.value ? `${t.value}-${e.value}` : "";
    }
    function V(e) {
        const t = getScaleMonthParts(e), {hiddenInput: a, monthSelect: n, yearSelect: r} = A();
        return function(e) {
            if (!e || 12 === e.options.length) return;
            const t = getScaleMonthNames();
            e.innerHTML = "", t.forEach((t, a) => {
                const n = document.createElement("option");
                n.value = String(a + 1).padStart(2, "0"), n.textContent = t, e.appendChild(n);
            });
        }(n), function(e, t) {
            if (!e) return;
            const a = (new Date).getFullYear(), n = Math.min(a - 5, t - 2), r = Math.max(a + 5, t + 2), o = Array.from(e.options).map(e => Number(e.value)).filter(e => Number.isFinite(e));
            if (o.length !== r - n + 1 || o[0] !== n || o[o.length - 1] !== r) {
                e.innerHTML = "";
                for (let t = n; t <= r; t++) {
                    const a = document.createElement("option");
                    a.value = String(t), a.textContent = String(t), e.appendChild(a);
                }
            }
        }(r, t.year), n && (n.value = String(t.month).padStart(2, "0")), r && (r.value = String(t.year)), 
        a && a.value !== t.value && (a.value = t.value), t;
    }
    function P() {
        const {hiddenInput: e, monthSelect: t, yearSelect: a} = A();
        if (!e && !t && !a) return g();
        const n = V(j() || e?.value || ""), r = () => {
            V(j() || e?.value || "");
        };
        return t && "1" !== t.dataset.scaleBound && (t.addEventListener("change", r), t.dataset.scaleBound = "1"), 
        a && "1" !== a.dataset.scaleBound && (a.addEventListener("change", r), a.dataset.scaleBound = "1"), 
        n;
    }
    function getSelectedScaleMonthLabel(e = null) {
        const {hiddenInput: t} = A(), a = e || getScaleMonthParts(j() || t?.value || "");
        return formatScaleMonthLabel(a.year, a.month, a.monthIndex);
    }
    function B(e) {
        return e && e.kind ? "timeout" === e.kind ? v("load_error_timeout") : "network" === e.kind ? v("load_error_network") : "json" === e.kind ? v("load_error_json") : "http" === e.kind ? v("load_error_http").replace("{status}", String(e.status || "---")) : v("load_error_generic") : v("load_error_generic");
    }
    function z(e, t, a = null) {
        r.dataFeedback = {
            mode: e,
            message: t,
            retry: a
        }, R();
    }
    function q() {
        z("hidden", "", null);
    }
    function R() {
        if ("calculadora" === document.body?.dataset.page) {
            const e = o("#data-feedback");
            return void (e && e.remove());
        }
        const e = function() {
            let e = o("#data-feedback");
            if (e) return e;
            const t = o(".app-main");
            if (!t) return null;
            e = document.createElement("div"), e.id = "data-feedback", e.className = "data-feedback hidden mb-4";
            const a = o("#fallback-warning");
            return a && a.parentNode ? a.parentNode.insertBefore(e, a.nextSibling) : t.prepend(e), 
            e;
        }();
        if (!e) return;
        if ("hidden" === r.dataFeedback.mode) return e.className = "data-feedback hidden mb-4", 
        void (e.innerHTML = "");
        const t = "loading" === r.dataFeedback.mode, a = t ? '<span class="loader-spinner" aria-hidden="true"></span>' : '<svg class="icon w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>';
        e.className = `data-feedback ${t ? "data-feedback--loading" : "data-feedback--error"} mb-4`, 
        e.innerHTML = `<div class="flex items-center gap-3 text-sm">${a}<span>${r.dataFeedback.message}</span></div>${!t && r.dataFeedback.retry ? `<button type="button" class="btn-secondary text-xs data-feedback__retry">${v("retry_action")}</button>` : ""}`;
        const n = o(".data-feedback__retry", e);
        n && r.dataFeedback.retry && n.addEventListener("click", () => r.dataFeedback.retry()), 
        e.classList.remove("hidden");
    }
    async function O(e, {retries: t = 3, backoff: a = 250} = {}) {
        let n = {
            kind: "unknown",
            url: e
        };
        for (let r = 0; r < t; r++) {
            const o = new AbortController, s = setTimeout(() => o.abort(), 8e3);
            try {
                const t = await fetch(e, {
                    signal: o.signal
                });
                if (clearTimeout(s), t.ok) try {
                    return await t.json();
                } catch {
                    n = {
                        kind: "json",
                        url: e
                    };
                } else n = {
                    kind: "http",
                    status: t.status,
                    url: e
                };
            } catch (t) {
                clearTimeout(s), n = {
                    kind: "AbortError" === t?.name ? "timeout" : "network",
                    url: e
                };
            }
            r < t - 1 && await new Promise(e => setTimeout(e, a * Math.pow(2, r)));
        }
        throw n;
    }
    function normalizeHolidayItems(e) {
        const t = new Map;
        return (Array.isArray(e) ? e : []).forEach(e => {
            const a = "string" == typeof e ? e : e?.data || e?.date || "";
            /^\d{4}-\d{2}-\d{2}$/.test(a) && t.set(a, {
                data: a,
                nome: "string" == typeof e ? e : e?.nome || e?.name || "Feriado",
                tipo: "string" == typeof e ? "nacional" : e?.tipo || e?.level || "nacional"
            });
        }), [ ...t.values() ].sort((e, t) => e.data.localeCompare(t.data));
    }
    function getHolidayCacheKey(e) {
        return `nac_${e}`;
    }
    function readHolidayCache(t) {
        const a = getHolidayCacheKey(t);
        for (const t of [ e + a, a ]) try {
            const e = JSON.parse(localStorage.getItem(t));
            if (!e) continue;
            if (Date.now() - e.ts > 6048e5) {
                localStorage.removeItem(t);
                continue;
            }
            return normalizeHolidayItems(e.data);
        } catch {}
        return null;
    }
    function writeHolidayCache(t, a) {
        const n = JSON.stringify({
            data: normalizeHolidayItems(a),
            ts: Date.now()
        }), r = getHolidayCacheKey(t);
        for (const t of [ e + r, r ]) try {
            localStorage.setItem(t, n);
        } catch {}
    }
    function showHolidayFallbackWarning(e, t = null) {
        const a = o("#fallback-warning");
        if (!a) return;
        let n = v("fallback_warning");
        "nacional_api" === e && (n = v("fallback_nacional_api")), t && (n = `${n} ${B(t)}`), 
        a.classList.remove("hidden"), a.innerHTML = `<svg class="icon w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg><span>${n}</span>`;
    }
    async function fetchHolidayYearData(e) {
        let t = null;
        try {
            return normalizeHolidayItems(await O(`/data/feriados/nacionais-${e}.json`));
        } catch (a) {
            t = a;
        }
        try {
            return normalizeHolidayItems(await O("https://brasilapi.com.br/api/feriados/v1/" + e));
        } catch (a) {
            throw a || t || {
                kind: "json",
                url: `/data/feriados/nacionais-${e}.json`
            };
        }
    }
    async function getSharedYearHolidays(e, t = {}) {
        const a = readHolidayCache(e);
        if (a) return a;
        try {
            const a = await fetchHolidayYearData(e);
            return writeHolidayCache(e, a), a;
        } catch (a) {
            throw t.onError?.(a), a;
        }
    }
    async function getSharedHolidayRange(e, t, a = {}) {
        const n = C(e), r = C(t);
        if (!n || !r) return [];
        const o = Math.min(n.getFullYear(), r.getFullYear()), s = Math.max(n.getFullYear(), r.getFullYear()), c = new Map;
        for (let e = o; e <= s; e++) (await getSharedYearHolidays(e, a)).forEach(e => {
            c.has(e.data) || c.set(e.data, e);
        });
        return [ ...c.values() ].sort((e, t) => e.data.localeCompare(t.data));
    }
    async function getSharedMonthHolidayContext(e, t, a = {}) {
        const n = await getSharedYearHolidays(e, a), r = `${e}-${String(t).padStart(2, "0")}`, o = n.filter(e => e.data.slice(0, 7) === r);
        return {
            year: e,
            month: t,
            all: n,
            monthItems: o,
            monthSet: new Set(o.map(e => e.data)),
            count: o.length
        };
    }
    async function U(t, a) {
        const n = await getSharedYearHolidays(a, {
            onError: e => showHolidayFallbackWarning("nacional_api", e)
        });
        return r.holidays = [ ...n ], r.holidays;
    }
    async function J(e, t, a) {
        const n = await getSharedHolidayRange(t, a, {
            onError: e => showHolidayFallbackWarning("nacional_api", e)
        });
        return r.holidays = [ ...n ], new Set(r.holidays.map(e => e.data));
    }
    function W(e) {
        return r.holidays.find(t => t.data === $(e));
    }
    function X() {
        const e = o("#fallback-warning");
        e && (e.classList.add("hidden"), e.innerHTML = "");
    }
    function Q(e, t) {
        const a = C(e), n = C(t);
        if (!a || !n || a > n) return null;
        let o = (d = a, l = n, Math.round((l - d) / 864e5)), s = 0, c = 0, i = [];
        var d, l;
        const u = new Date(a);
        for (r.inclStart ? o += 1 : u.setDate(u.getDate() + 1); u <= n; ) {
            const e = W(u);
            N(u) ? c++ : e ? i.push({
                ...e
            }) : s++, u.setDate(u.getDate() + 1);
        }
        return {
            diasCorridos: o,
            diasUteis: s,
            fimDeSemana: c,
            feriadosNoPeriodo: i
        };
    }
    function G(e, t) {
        const a = C(e);
        if (!a || t <= 0) return null;
        let n = 0;
        const r = [], o = new Date(a);
        for (;n < t; ) {
            o.setDate(o.getDate() + 1);
            const e = W(o);
            N(o) || (e ? r.push({
                ...e
            }) : n++);
        }
        return {
            dataResultado: new Date(o),
            feriadosPulados: r
        };
    }
    function K() {
        document.documentElement.classList.toggle("dark", "dark" === r.theme);
        const e = o("#theme-icon");
        e && (e.innerHTML = "dark" === r.theme ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>');
    }
    function Z() {
        r.theme = "dark" === r.theme ? "light" : "dark", i("theme", r.theme), K();
    }
    function ee(e) {
        if (r.adsPushed.has(e)) return;
        const t = document.getElementById(e);
        if (!t) return;
        const a = t.querySelector("ins.adsbygoogle"), n = getConfiguredAdSlotId(e, t);
        if (a) {
            const e = getAdsenseClientId();
            e && !a.getAttribute("data-ad-client") && a.setAttribute("data-ad-client", e), 
            n && !a.getAttribute("data-ad-slot") && a.setAttribute("data-ad-slot", n);
        }
        if (a && n) {
            t.hidden = !1, t.removeAttribute("hidden");
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({}), r.adsPushed.add(e);
            } catch {}
        } else t.hidden = !0;
    }
    function te() {
        return r.rStart && r.rEnd ? r.rStart <= r.rEnd ? {
            start: r.rStart,
            end: r.rEnd
        } : {
            start: r.rEnd,
            end: r.rStart
        } : r.rStart && r.selecting && !r.rEnd ? {
            start: r.rStart,
            end: r.rStart
        } : null;
    }
    function ae(e, t, a, n = {}) {
        const o = !1 !== n.interactive, c = new Date(e, t, 1).getDay(), i = new Date(e, t + 1, 0).getDate(), d = new Date, l = te();
        let u = `<div class="${n.shellClass || ""}"><div class="text-center mb-3"><h3 class="font-bold text-base">${T[t]} ${e}</h3></div>\n    <div class="grid grid-cols-7 gap-1 text-center mb-1">${I.map(e => `<div class="text-xs font-semibold calendar-weekday-label uppercase">${e}</div>`).join("")}</div>\n    <div class="grid grid-cols-7 gap-1">`;
        for (let e = 0; e < c; e++) u += '<div class="cal-cell opacity-0"></div>';
        for (let a = 1; a <= i; a++) {
            const n = new Date(e, t, a), r = $(n), s = W(n), c = n.getDay(), i = 6 === c, m = 0 === c;
            let p = "cal-cell";
            o && (p += " interactive"), M(n, d) && (p += " today"), s ? p += " holiday" : (m || i) && (p += " weekend"), 
            l && (r >= l.start && r <= l.end && (p += " in-range"), r === l.start && r === l.end ? p += " range-single selected" : r === l.start ? p += " range-start selected" : r === l.end && (p += " range-end selected"));
            const h = s ? s.nome : "";
            u += `<div class="${p}" data-date="${r}" title="${h}"${o ? ` role="button" tabindex="0" aria-label="${a} ${T[t]}${h ? " - " + h : ""}"` : ""}>${a}</div>`;
        }
        u += "</div></div>", a.innerHTML = u, o && function(e) {
            function t(e) {
                if (e) {
                    if (r.selecting) {
                        if (r.rEnd = e, r.rEnd < r.rStart) {
                            const e = r.rStart;
                            r.rStart = r.rEnd, r.rEnd = e;
                        }
                        r.selecting = !1, function(e, t) {
                            document.dispatchEvent(new CustomEvent("datasuteis:range-selected", {
                                detail: {
                                    start: e,
                                    end: t
                                }
                            }));
                        }(r.rStart, r.rEnd);
                    } else r.rStart = e, r.rEnd = null, r.selecting = !0;
                    oe(), ce(), de();
                }
            }
            s(".cal-cell[data-date]", e).forEach(e => {
                e.addEventListener("pointerdown", a => {
                    a.preventDefault(), t(e.dataset.date);
                }), e.addEventListener("pointerenter", () => {
                    r.selecting && (r.rEnd = e.dataset.date, oe(), ce(), de());
                }), e.addEventListener("keydown", a => {
                    "Enter" !== a.key && " " !== a.key || (a.preventDefault(), t(e.dataset.date));
                });
            }), e.addEventListener("pointermove", e => {
                !function(e, t) {
                    if (!r.selecting) return;
                    const a = document.elementFromPoint(e, t), n = a?.closest?.(".cal-cell[data-date]"), o = n?.dataset?.date;
                    o && r.rEnd !== o && (r.rEnd = o, ce(), de());
                }(e.clientX, e.clientY);
            }, {
                passive: !0
            });
        }(a);
    }
    function ne(e, t) {
        t.innerHTML = "";
        const a = document.createElement("div");
        a.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
        for (let t = 0; t < 12; t++) {
            const n = document.createElement("div");
            n.className = "card p-4", ae(e, t, n), a.appendChild(n);
        }
        t.appendChild(a), ee("ads-result");
    }
    function re(e, t, a) {
        a.innerHTML = "";
        const n = document.createElement("div");
        n.className = "grid grid-cols-12";
        const s = document.createElement("div");
        s.className = "hidden lg:block lg:col-span-3", n.appendChild(s);
        const c = document.createElement("div");
        c.className = "col-span-12 lg:col-span-6";
        const i = t + 1 > 11 ? e + 1 : e, d = t + 1 > 11 ? 0 : t + 1, l = document.createElement("div");
        l.className = "flex items-center justify-between mb-6", l.innerHTML = `<button id="month-prev" class="btn-secondary p-2 rounded-xl" aria-label="Anterior"><svg class="icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>\n    <h3 class="text-xl font-bold">${T[t]} ${e}</h3>\n    <button id="month-next" class="btn-secondary p-2 rounded-xl" aria-label="Próximo"><svg class="icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>`, 
        c.appendChild(l);
        const u = document.createElement("div");
        u.className = "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6";
        const m = document.createElement("div");
        m.className = "card p-6", ae(e, t, m, {
            interactive: !0,
            shellClass: "monthly-matrix"
        }), u.appendChild(m);
        const p = document.createElement("div");
        p.className = "card p-6", ae(i, d, p, {
            interactive: !0,
            shellClass: "monthly-matrix"
        }), u.appendChild(p), c.appendChild(u);
        const h = r.holidays.filter(a => {
            const n = C(a.data);
            return !!n && (n.getMonth() === t && n.getFullYear() === e || n.getMonth() === d && n.getFullYear() === i);
        });
        if (h.length) {
            const e = document.createElement("div");
            e.className = "card p-5", e.innerHTML = `<h4 class="font-bold text-base mb-3 flex items-center gap-2"><svg class="icon w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>${v("holidays_in")} ${T[t]}${d !== t ? " / " + T[d] : ""}</h4>\n      <div class="space-y-2">${h.map(e => {
                const t = C(e.data), a = I[t.getDay()];
                return `<div class="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700 last:border-0"><div><span class="font-semibold">${S(t)}</span><span class="text-surface-500 text-sm ml-1">(${a})</span><span class="ml-2">${e.nome}</span></div><span class="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400">${v("loc_type_nacional")}</span></div>`;
            }).join("")}</div>`, c.appendChild(e);
        }
        n.appendChild(c);
        const f = document.createElement("div");
        f.className = "hidden lg:block lg:col-span-3", n.appendChild(f), a.appendChild(n), 
        o("#month-prev", a)?.addEventListener("click", () => {
            let n = t - 1, o = e;
            n < 0 && (n = 11, o--), r.curMonth = n, r.curYear = o, re(o, n, a);
        }), o("#month-next", a)?.addEventListener("click", () => {
            let n = t + 1, o = e;
            n > 11 && (n = 0, o++), r.curMonth = n, r.curYear = o, re(o, n, a);
        }), ee("ads-result");
    }
    function oe() {
        const e = o("#range-start"), t = o("#range-end");
        e && (e.value = r.rStart || ""), t && (t.value = r.rEnd || "");
    }
    function se() {
        const e = o("#range-start"), t = o("#range-end");
        r.rStart = e?.value || null, r.rEnd = t?.value || null, r.selecting = !1;
    }
    function ce() {
        const e = o("#picker-calendar");
        if (!e) return;
        const t = window.matchMedia("(min-width: 1024px)").matches ? 2 : 1, a = o("#picker-month-title");
        e.className = 2 === t ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "", e.innerHTML = "";
        const n = [];
        for (let a = 0; a < t; a++) {
            const t = new Date(r.curYear, r.curMonth + a, 1);
            n.push(`${T[t.getMonth()]} ${t.getFullYear()}`);
            const o = document.createElement("div");
            o.className = "card p-4", ae(t.getFullYear(), t.getMonth(), o, {
                interactive: !0
            }), e.appendChild(o);
        }
        a && (a.textContent = n.join(" / "));
    }
    function ie() {
        r.rStart = null, r.rEnd = null, r.selecting = !1;
        const e = o("#range-start"), t = o("#range-end");
        e && (e.value = ""), t && (t.value = ""), o("#calc-result") && (o("#calc-result").innerHTML = ""), 
        ce();
    }
    async function de() {
        const e = o("#calc-result");
        if (e && "range" === r.calcMode) {
            const t = te();
            if (!t) return;
            try {
                await J(0, t.start, t.end);
                const a = Q(t.start, t.end);
                a && le(a, e);
            } catch (e) {
                z("error", `${v("load_error_holidays")} ${B(e)}`, de);
            }
        }
    }
    function le(e, t) {
        t.innerHTML = `<div class="card p-6 border-l-4 border-brand-500 animate-fade-in">\n      <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><svg class="icon w-6 h-6 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>${v("calc_result_title")}</h3>\n      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">\n        <div class="text-center p-4 rounded-xl bg-brand-50 dark:bg-brand-950"><div class="text-3xl font-extrabold text-brand-600">${e.diasUteis}</div><div class="text-sm text-surface-500 mt-1">${v("calc_business_days")}</div></div>\n        <div class="text-center p-4 rounded-xl bg-surface-100 dark:bg-surface-800"><div class="text-3xl font-extrabold">${e.diasCorridos}</div><div class="text-sm text-surface-500 mt-1">${v("calc_calendar_days")}</div></div>\n        <div class="text-center p-4 rounded-xl bg-surface-100 dark:bg-surface-800"><div class="text-3xl font-extrabold">${e.fimDeSemana}</div><div class="text-sm text-surface-500 mt-1">${v("calc_weekends")}</div></div>\n        <div class="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950"><div class="text-3xl font-extrabold text-red-500">${e.feriadosNoPeriodo.length}</div><div class="text-sm text-surface-500 mt-1">${v("calc_holidays")}</div></div>\n      </div>\n      ${e.feriadosNoPeriodo.length ? `<div><h4 class="font-semibold text-sm mb-2 text-surface-500 uppercase tracking-wider">${v("calc_holidays_period")}</h4><div class="space-y-1">${e.feriadosNoPeriodo.map(e => {
            const t = C(e.data), a = I[t.getDay()];
            return `<div class="flex items-center gap-3 py-1.5 text-sm"><span class="font-mono text-surface-500">${S(t)} (${a})</span><span class="px-1.5 py-0.5 text-xs rounded bg-surface-100 dark:bg-surface-700">BR</span><span>${e.nome}</span></div>`;
        }).join("")}</div></div>` : ""}</div>`, ee("ads-result");
    }
    async function ue() {
        X(), z("loading", v("loading_holidays"));
        try {
            await U(0, r.curYear), ce(), await de(), q();
        } catch (e) {
            z("error", `${v("load_error_holidays")} ${B(e)}`, () => ue());
        }
    }
    function me() {
        s("[data-tooltip]").forEach(e => {
            const t = v(e.dataset.tooltip) || e.dataset.tooltip;
            let a = o('[data-tooltip-node="true"]', e);
            if (!a) {
                const t = "tt-" + Math.random().toString(36).slice(2, 8);
                a = document.createElement("div"), a.dataset.tooltipNode = "true", a.id = t, a.role = "tooltip", 
                a.className = "absolute z-50 px-3 py-1.5 text-xs rounded-lg bg-surface-900 text-white dark:bg-surface-100 dark:text-surface-900 shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 whitespace-nowrap -translate-x-1/2 left-1/2", 
                e.style.position = "relative", e.appendChild(a);
            }
            a.textContent = t, e.setAttribute("aria-describedby", a.id), [ "A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SUMMARY" ].includes(e.tagName) || e.hasAttribute("tabindex") || e.setAttribute("tabindex", "0"), 
            "1" !== e.dataset.tooltipBound && (e.addEventListener("mouseenter", () => {
                a.classList.remove("opacity-0"), a.classList.add("opacity-100");
            }), e.addEventListener("mouseleave", () => {
                a.classList.remove("opacity-100"), a.classList.add("opacity-0");
            }), e.addEventListener("focusin", () => {
                a.classList.remove("opacity-0"), a.classList.add("opacity-100");
            }), e.addEventListener("focusout", () => {
                a.classList.remove("opacity-100"), a.classList.add("opacity-0");
            }), e.dataset.tooltipBound = "1");
        });
    }
    function pe(e = _()) {
        s("[data-calendar-year-i18n]").forEach(t => {
            t.textContent = b(t.dataset.calendarYearI18n, {
                year: e
            });
        });
    }
    function he() {
        const e = o("#consent-banner");
        if (!e) return;
        const t = o(".consent-banner__text", e), a = o(".consent-banner__link", e), n = o(".consent-banner__ok", e);
        t && a && (t.firstChild && (t.firstChild.textContent = `${w("consent_text", "Usamos armazenamento local/cookies para lembrar idioma e preferências. Veja a política.")} `), 
        a.textContent = w("consent_policy", "Política de Privacidade")), n && (n.textContent = w("consent_ok", "Entendi"));
    }
    function fe() {
        const e = o("#scale-result");
        if (!e) return;
        const t = r.scaleFocusLocked || r.scaleFocusHover || "";
        e.dataset.empFocus = t, s(".emp-chip", e).forEach(e => {
            e.classList.toggle("is-active", !!t && e.dataset.emp === t), e.setAttribute("aria-pressed", t && e.dataset.emp === t ? "true" : "false");
        }), s(".emp-token", e).forEach(e => {
            const a = e.dataset.emp === t;
            e.classList.toggle("emp-highlight-work", !!t && a && "work" === e.dataset.status), 
            e.classList.toggle("emp-highlight-off", !!t && a && "off" === e.dataset.status), 
            e.classList.toggle("emp-muted", !!t && !a);
        });
    }
    async function ge(e = !1) {
        if (!window.ShiftScheduler) return;
        const t = o("#scale-month-year"), a = function() {
            const {hiddenInput: e} = A();
            return V(j() || e?.value || "");
        }(), n = a.value, c = a.year, i = a.month, d = a.monthIndex, l = getSelectedScaleMonthLabel(a), u = Math.max(1, parseInt(o("#scale-employees")?.value || "1", 10)), m = o("#scale-type")?.value || "5x2", p = o("#scale-weekends-yes")?.checked || !1, h = o("#scale-holidays-yes")?.checked || !1, f = Math.max(1, parseInt(o("#scale-demand")?.value || "1", 10)), g = {
            year: c,
            month: i,
            monthIndex: d,
            employeesQty: u,
            scaleType: m,
            includeWeekends: p,
            includeHolidays: h,
            demandPerDay: f
        };
        if (t && t.value !== n && (t.value = n), !e || !r.scaleParams || JSON.stringify(r.scaleParams) === JSON.stringify(g)) {
            r.scaleParams = g, e || z("loading", v("loading_holidays"));
            try {
                const t = window.ShiftScheduler.generateEmployeeIds(u);
                t.includes(r.scaleFocusLocked) || (r.scaleFocusLocked = ""), r.scaleFocusHover = "";
                const a = await async function(e) {
                    return await U(0, e), new Set(r.holidays.map(e => e.data));
                }(c);
                (function(e, t, a, n) {
                    const root = o("#scale-result");
                    if (!root) return;
                    const c = getScaleWeekdayLabels(), i = e.reduce((e, t) => e + t.operatedDays, 0), d = e.reduce((e, t) => e + t.coveredDays, 0), l = e.flatMap(e => e.deficits.map(t => `${String(t.day).padStart(2, "0")}/${String(e.month).padStart(2, "0")} (${b("scale_deficit_short", {
                        count: t.deficit
                    })})`)), u = i ? (d / i * 100).toFixed(1) : "100.0", m = Object.fromEntries(t.map(e => [ e, 0 ])), p = [ ...new Set(e.flatMap(e => e.notes || [])) ].map(e => "Feriados foram tratados como dias sem operacao." === e ? v("scale_note_holidays_off") : "Nao foi possivel garantir 1 domingo de folga para todos neste mes com as configuracoes atuais." === e ? "" : e).filter(Boolean), h = e.some(e => e.sundayConstraintImpossible), f = [ ...new Set(e.flatMap(e => e.sundayMissing || [])) ];
                    e.forEach(e => {
                        Object.keys(e.stats.worked).forEach(t => {
                            m[t] = (m[t] || 0) + e.stats.worked[t];
                        });
                    });
                    const g = document.createElement("div");
                    g.className = "space-y-4";
                    const y = document.createElement("div");
                    y.className = "card p-5";
                    const w = document.createElement("h3");
                    w.className = "font-bold text-lg mb-3", w.dataset.i18n = "scale_result_title", y.appendChild(w);
                    const x = document.createElement("p");
                    x.className = "text-sm mb-2", x.dataset.i18nHtml = "scale_coverage_summary", x.dataset.i18nVars = JSON.stringify({
                        coverage: u,
                        demand: a
                    }), y.appendChild(x);
                    const E = document.createElement("p");
                    if (E.className = "text-sm " + (l.length ? "text-red-600" : "text-green-600"), E.dataset.i18n = l.length ? "scale_deficit_summary" : "scale_no_deficit", 
                    l.length && (E.dataset.i18nVars = JSON.stringify({
                        count: l.length
                    })), y.appendChild(E), h) {
                        const e = document.createElement("p");
                        e.className = "text-sm text-amber-700 mt-2", e.dataset.i18n = "scale_sunday_warning", 
                        y.appendChild(e);
                    }
                    if (f.length) {
                        const e = document.createElement("p");
                        e.className = "text-xs text-amber-700 mt-1";
                        const t = document.createElement("span");
                        t.dataset.i18n = "scale_sunday_missing", e.appendChild(t), e.appendChild(document.createTextNode(`: ${f.join(", ")}`)), 
                        y.appendChild(e);
                    }
                    if (l.length) {
                        const e = document.createElement("p");
                        e.className = "text-xs text-surface-500 mt-2", e.textContent = `${l.slice(0, 10).join(" | ")}${l.length > 10 ? " ..." : ""}`, 
                        y.appendChild(e);
                    }
                    if (p.length) {
                        const e = document.createElement("p");
                        e.className = "text-xs text-surface-500 mt-2", e.textContent = p.join(" "), y.appendChild(e);
                    }
                    g.appendChild(y);
                    const k = document.createElement("div");
                    k.className = "card p-5";
                    const _ = document.createElement("h3");
                    _.className = "font-bold text-base mb-3", _.dataset.i18n = "scale_legend_title", 
                    k.appendChild(_);
                    const C = document.createElement("p");
                    C.className = "help-copy mb-2", C.dataset.i18n = "scale_legend_desc", k.appendChild(C);
                    const S = document.createElement("p");
                    S.className = "text-xs text-surface-500 mb-3", S.dataset.i18n = "scale_legend_toggle_hint", 
                    k.appendChild(S);
                    const $ = document.createElement("div");
                    $.className = "legend-grid", t.forEach(e => {
                        const t = document.createElement("button");
                        t.type = "button", t.className = "emp-chip", t.dataset.emp = e, t.dataset.i18n = "scale_employee_days", 
                        t.dataset.i18nTitle = "scale_legend_toggle_hint", t.dataset.i18nVars = JSON.stringify({
                            employee: e,
                            days: m[e]
                        }), t.setAttribute("aria-pressed", "false"), $.appendChild(t);
                    }), k.appendChild($), g.appendChild(k), e.forEach(e => g.appendChild(function(e) {
                        const t = document.createElement("div");
                        t.className = "card p-4 app-calendar-shell scale-calendar";
                        const a = document.createElement("h3");
                        a.className = "font-bold text-base mb-3", a.textContent = n || formatScaleMonthLabel(e.year, e.month, e.monthIndex), 
                        t.appendChild(a);
                        const monthHeader = document.createElement("div");
                        monthHeader.className = "grid grid-cols-7 gap-1 mb-1", c.forEach(e => {
                            const t = document.createElement("div");
                            t.className = "text-[11px] uppercase text-surface-500 text-center font-semibold", 
                            t.textContent = e, monthHeader.appendChild(t);
                        }), t.appendChild(monthHeader);
                        const r = document.createElement("div");
                        r.className = "grid grid-cols-7 gap-1";
                        const o = new Date(e.year, e.monthIndex, 1).getDay();
                        for (let e = 0; e < o; e++) {
                            const e = document.createElement("div");
                            e.className = "min-h-[78px] rounded-lg bg-transparent", r.appendChild(e);
                        }
                        const s = document.createDocumentFragment();
                        return e.days.forEach(e => {
                            const t = document.createElement("article");
                            t.className = "min-h-[86px] border rounded-lg p-1.5 text-[11px] " + (e.deficit ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : "border-surface-200 dark:border-surface-700"), 
                            t.dataset.day = e.iso;
                            const a = document.createElement("div");
                            a.className = "flex items-center justify-between mb-1";
                            const n = document.createElement("strong");
                            n.textContent = e.day;
                            const r = document.createElement("span");
                            r.className = "text-[10px] text-surface-500", r.dataset.i18n = e.operated ? "scale_day_operated" : "scale_day_off", 
                            a.appendChild(n), a.appendChild(r), t.appendChild(a);
                            const o = document.createElement("div");
                            o.className = "leading-tight", o.innerHTML = `T: ${e.working.length ? e.working.map(e => `<span class="emp-token emp-token--work" data-emp="${e}" data-status="work">${e}</span>`).join(" ") : '<span class="emp-token emp-token--empty">-</span>'}`, 
                            t.appendChild(o);
                            const c = document.createElement("div");
                            if (c.className = "leading-tight text-surface-500", c.innerHTML = `F: ${e.off.length ? e.off.map(e => `<span class="emp-token emp-token--off" data-emp="${e}" data-status="off">${e}</span>`).join(" ") : '<span class="emp-token emp-token--empty">-</span>'}`, 
                            t.appendChild(c), e.deficit > 0) {
                                const a = document.createElement("div");
                                a.className = "text-[10px] text-red-600 font-semibold mt-1", a.dataset.i18n = "scale_day_deficit", 
                                a.dataset.i18nVars = JSON.stringify({
                                    count: e.deficit
                                }), t.appendChild(a);
                            }
                            s.appendChild(t);
                        }), r.appendChild(s), t.appendChild(r), t;
                    }(e))), root.innerHTML = "", root.appendChild(g), L({
                        root
                    }), s(".emp-chip", root).forEach(e => {
                        const t = e.dataset.emp;
                        t && (e.addEventListener("mouseenter", () => {
                            r.scaleFocusLocked || (r.scaleFocusHover = t, fe());
                        }), e.addEventListener("mouseleave", () => {
                            r.scaleFocusLocked || (r.scaleFocusHover = "", fe());
                        }), e.addEventListener("click", () => {
                            r.scaleFocusLocked = r.scaleFocusLocked === t ? "" : t, r.scaleFocusLocked && (r.scaleFocusHover = ""), 
                            fe();
                        }));
                    }), fe(), ee("ads-result");
                })([ window.ShiftScheduler.buildSchedule({
                    year: c,
                    month: i,
                    monthIndex: d,
                    employees: t,
                    pattern: m,
                    includeWeekends: p,
                    includeHolidays: h,
                    holidaysSet: a,
                    demandPerDay: f
                }) ], t, f, l), e || q();
            } catch (e) {
                z("error", `${v("load_error_holidays")} ${B(e)}`, () => ge(!1));
            }
        }
    }
    async function ye() {
        const e = o("#correios-post-date"), t = o("#correios-promised-days"), a = o("#correios-deadline-result");
        if (!e || !t || !a) return;
        const n = e.value, r = parseInt(t.value || "0", 10);
        if (!n || !r || r < 1) a.innerHTML = `<p class="text-sm text-red-600">${v("correios_fill_fields")}</p>`; else {
            z("loading", v("loading_holidays"));
            try {
                const e = C(n), t = new Date(e.getFullYear(), 0, 1), o = new Date(e.getFullYear() + 1, 11, 31);
                await J(0, t, o);
                const s = G(n, r);
                if (!s) throw {
                    kind: "json",
                    url: "calcAdd"
                };
                const c = new Date, i = s.dataResultado, d = c <= i;
                a.innerHTML = `<div class="card p-4 border-l-4 ${d ? "border-green-500" : "border-amber-500"}">\n                <p class="text-sm">${v("correios_deadline_label")} <strong>${S(i)}</strong></p>\n                <p class="text-sm mt-1 ${d ? "text-green-700" : "text-amber-700"}">${v(d ? "correios_status_ok" : "correios_status_late")}</p>\n            </div>`, 
                q();
            } catch (e) {
                a.innerHTML = `<p class="text-sm text-red-600">${v("load_error_holidays")} ${B(e)}</p>`, 
                z("error", `${v("load_error_holidays")} ${B(e)}`, () => ye());
            }
        }
    }
    function ve() {
        const e = o("#calc-result");
        r.calcMode = "range";
        const t = o("#picker-prev"), a = o("#picker-next"), n = o("#picker-month-title");
        t && t.addEventListener("click", () => {
            r.curMonth--, r.curMonth < 0 && (r.curMonth = 11, r.curYear--), ce();
        }), a && a.addEventListener("click", () => {
            r.curMonth++, r.curMonth > 11 && (r.curMonth = 0, r.curYear++), ce();
        }), window.addEventListener("resize", ce);
        const s = o("#range-start"), c = o("#range-end");
        s && s.addEventListener("input", () => {
            se(), ce(), de();
        }), c && c.addEventListener("input", () => {
            se(), ce(), de();
        }), o("#btn-clear")?.addEventListener("click", ie);
        const i = async () => {
            if (e) if (X(), se(), r.rStart && r.rEnd) {
                z("loading", v("loading_holidays"));
                try {
                    await J(0, r.rStart, r.rEnd);
                    const t = Q(r.rStart, r.rEnd);
                    t && le(t, e), q();
                } catch (e) {
                    return void z("error", `${v("load_error_holidays")} ${B(e)}`, i);
                }
                e.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            } else e.innerHTML = `<div class="text-red-500 text-sm p-4">${v("calc_start")} / ${v("calc_end")}</div>`;
        };
        o("#btn-calculate")?.addEventListener("click", i), o("#correios-calc-deadline")?.addEventListener("click", ye), 
        n && (n.textContent = `${T[r.curMonth]} ${r.curYear}`), (async () => {
            await ue();
        })();
    }
    async function we() {
        r.homeView = localStorage.getItem(e + "home_view") || r.homeView || "monthly", "weekly" === r.homeView && (r.homeView = "monthly");
        const t = s(".home-view-tab"), a = o("#mini-calendar");
        async function n() {
            X(), z("loading", v("loading_holidays"));
            try {
                const e = new Date;
                await U(0, e.getFullYear()), function() {
                    if (!a) return;
                    const e = new Date, t = e.getFullYear();
                    "annual" === r.homeView ? ne(t, a) : ae(t, e.getMonth(), a, {
                        interactive: !1,
                        shellClass: "calendar-month-shell monthly-matrix"
                    });
                }(), q();
            } catch (e) {
                z("error", `${v("load_error_holidays")} ${B(e)}`, we);
            }
        }
        t.forEach(a => {
            a.classList.toggle("active", a.dataset.view === r.homeView), a.addEventListener("click", () => {
                r.homeView = a.dataset.view, localStorage.setItem(e + "home_view", r.homeView), 
                t.forEach(e => e.classList.toggle("active", e.dataset.view === r.homeView)), n();
            });
        }), await n();
    }
    async function be() {
        const e = document.body.dataset.page;
        if ("home" !== e) {
            if ("calcular" === e) return ce(), await de(), void (o("#correios-post-date")?.value && await ye());
            if ("calendario" === e) {
                const e = o("#calendar-container");
                if (!e) return;
                return pe(r.curYear), void ("annual" === r.calView ? ne(r.curYear, e) : re(r.curYear, r.curMonth, e));
            }
            isLegacyScaleRuntimeEnabled() && await ge();
        } else {
            const e = o("#mini-calendar");
            if (!e) return;
            const t = new Date;
            "annual" === r.homeView ? ne(t.getFullYear(), e) : ae(t.getFullYear(), t.getMonth(), e, {
                interactive: !1,
                shellClass: "calendar-month-shell monthly-matrix"
            });
        }
    }
    function xe(e) {
        if (!e || document.head.querySelector(`link[rel="prefetch"][href="${e}"]`)) return;
        const t = document.createElement("link");
        t.rel = "prefetch", t.href = e, t.as = "document", document.head.appendChild(t);
    }
    async function Ee() {
        renderSiteChrome(), primeAdsElements(), syncMobileMenuButtonState(), syncMobileBottomNavState(), 
        window.DataSuteisConfig = {
            analyticsMeasurementId: "G-E9198198D5",
            adsenseClientId: getAdsenseClientId()
        };
        window.DataSuteis && (window.DataSuteis.config = window.DataSuteisConfig);
        !function() {
            const e = c("theme");
            r.theme = "dark" === e ? "dark" : "light", K();
        }();
        const t = function() {
            const e = c("lang");
            return e ? p(e) : "pt";
        }();
        r.lang = t, document.documentElement.lang = a[r.lang] || r.lang, Y(), H();
        const n = "pt" !== t, i = y(t).then(async () => {
            L({
                hydrateText: n
            }), n && await be();
        }).catch(() => {});
        o("#theme-toggle")?.addEventListener("click", Z), s(".btn-print").forEach(e => {
            e.addEventListener("click", () => function(e = "portrait") {
                const t = "print-page-style";
                let a = document.getElementById(t);
                a || (a = document.createElement("style"), a.id = t, document.head.appendChild(a)), 
                a.textContent = "landscape" === e ? "@page { size: A4 landscape; margin: 14mm 12mm 16mm 12mm; }" : "@page { size: A4 portrait; margin: 14mm 12mm 16mm 12mm; }";
                const n = o(".print-footer");
                if (n) {
                    const e = n.querySelector(".timestamp");
                    e && (e.textContent = `${v("print_generated_at")} ${(new Date).toLocaleString(h())}`), 
                    n.style.display = "block";
                }
                document.body.classList.toggle("print-landscape", "landscape" === e), window.print();
            }(e.dataset.format || "portrait"));
        }), window.adsbygoogle = window.adsbygoogle || [], o(".adsbygoogle") && d(() => {
            u("adsense-js", `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${getAdsenseClientId()}`, {
                crossorigin: "anonymous"
            }).catch(() => {});
        }), s(".lang-btn").forEach(e => {
            e.addEventListener("click", async () => {
                await y(e.dataset.lang), L(), await be();
            });
        }), o("#mobile-menu-btn")?.addEventListener("click", () => {
            o("#mobile-menu")?.classList.toggle("hidden"), syncMobileMenuButtonState();
        }), syncMobileBottomNavState(), function() {
            d(() => l(m, {
                timeout: 3200,
                fallbackDelay: 1400
            }));
            const e = () => m();
            window.addEventListener("pointerdown", e, {
                once: !0,
                passive: !0
            }), window.addEventListener("keydown", e, {
                once: !0
            }), window.addEventListener("touchstart", e, {
                once: !0,
                passive: !0
            });
        }(), i.finally(() => function() {
            const t = "consent_ok";
            if ("1" === localStorage.getItem(t) || "1" === localStorage.getItem(e + t)) return;
            let a = o("#consent-banner");
            a || (a = document.createElement("aside"), a.id = "consent-banner", a.className = "consent-banner", 
            a.innerHTML = '<p class="consent-banner__text"></p><button type="button" class="btn-primary text-sm consent-banner__ok"></button>', 
            o(".consent-banner__text", a).innerHTML = '<span></span><a href="/privacidade/" class="consent-banner__link"></a>', 
            document.body.appendChild(a)), he(), o(".consent-banner__ok", a)?.addEventListener("click", () => {
                localStorage.setItem(t, "1"), localStorage.setItem(e + t, "1"), a.remove();
            });
        }()), function() {
            if (!function() {
                const e = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
                return !e?.saveData && (!e?.effectiveType || !/(slow-2g|2g|3g)/i.test(e.effectiveType)) && !(navigator.deviceMemory && navigator.deviceMemory <= 2) && window.matchMedia("(min-width: 1024px)").matches;
            }()) return;
            const e = [ "/", "/calcular/", "/calculadora/", "/calendario/", "/escala/", "/blog/" ], t = window.location.pathname, a = () => {
                e.forEach(e => {
                    e !== t && xe(e);
                });
            };
            d(() => l(a, {
                timeout: 4500,
                fallbackDelay: 2600
            }));
        }();
        const f = document.body.dataset.page;
        "calcular" === f ? ve() : "calendario" === f ? function() {
            const t = o("#calendar-container");
            if (!t) return;
            const a = document.body.dataset, n = (new Date).getFullYear();
            let c = parseInt(a.year || String(n), 10);
            r.curYear = c, r.calView = localStorage.getItem(e + "cal_view") || r.calView || "annual", 
            "weekly" === r.calView && (r.calView = "annual");
            const i = o("#calendar-year");
            if (i) {
                i.innerHTML = "";
                for (let e = n - 5; e <= n + 5; e++) {
                    const t = document.createElement("option");
                    t.value = e, t.textContent = e, e === c && (t.selected = !0), i.appendChild(t);
                }
                i.addEventListener("change", async () => {
                    c = parseInt(i.value, 10), r.curYear = c, await d();
                });
            }
            async function d() {
                X(), z("loading", v("loading_holidays"));
                try {
                    await U(0, c), pe(c), "annual" === r.calView ? ne(c, t) : re(c, r.curMonth, t), 
                    q();
                } catch (e) {
                    z("error", `${v("load_error_holidays")} ${B(e)}`, d);
                }
            }
            s(".calendar-view-tab").forEach(t => {
                t.classList.toggle("active", t.dataset.view === r.calView), t.addEventListener("click", () => {
                    r.calView = t.dataset.view, localStorage.setItem(e + "cal_view", r.calView), s(".calendar-view-tab").forEach(e => e.classList.toggle("active", e.dataset.view === r.calView)), 
                    d();
                });
            }), d();
        }() : "home" === f ? await we() : isLegacyScaleRuntimeEnabled() && function(e = Promise.resolve(), t = {}) {
            const a = o("#scale-form");
            if (!a) return;
            const n = Promise.resolve(e).catch(() => {}), s = async (e = !1) => {
                await n, await ge(e);
            };
            P(), a.addEventListener("submit", async e => {
                e.preventDefault(), await s();
            }), o("#scale-calc-btn")?.addEventListener("click", async e => {
                e.preventDefault(), await s();
            }), window.addEventListener("resize", () => {
                r.scaleParams && s(!0);
            }), t.deferInitialRender || s();
        }(i, {
            deferInitialRender: n
        }), ee("ads-top"), ee("ads-sidebar"), await i;
    }
    Y(), "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", Ee) : Ee(), 
    window.DataSuteis = {
        ...(window.DataSuteis || {}),
        calcRange: Q,
        calcAdd: G,
        config: window.DataSuteisConfig || {
            analyticsMeasurementId: "G-E9198198D5",
            adsenseClientId: ADSENSE_CLIENT_ID
        },
        syncMobileMenuButtonState,
        syncMobileBottomNavState,
        holidays: {
            getYearHolidays: getSharedYearHolidays,
            getRangeHolidays: getSharedHolidayRange,
            getMonthHolidayContext: getSharedMonthHolidayContext,
            normalizeHolidayItems
        }
    };
}();

