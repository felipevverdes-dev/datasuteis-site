(function () {
    'use strict';

    var MONTH_FMT = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
    var WDAY_FMT = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
    var STATE = {
        suggestedScale: null,
        tooltipCounter: 0,
        tooltipDocBound: false,
        previewTimer: 0,
        lastPreview: null,
        referenceHours: 0,
        manualHoursDirty: false,
        lastResult: null,
        lastParams: null,
        resultHoursOverride: 0,
        printConfig: {
            managerName: '',
            showLegend: true,
            companyLogoUrl: ''
        }
    };
    var AD_SLOT_IDS = ['ads-top', 'ads-sidebar', 'ads-result'];
    var WDAY_LABELS = (function () {
        var ref = new Date(2026, 0, 4);
        var labels = [];
        for (var i = 0; i < 7; i++) {
            var d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + i);
            var label = WDAY_FMT.format(d).replace('.', '');
            labels.push(label.charAt(0).toUpperCase() + label.slice(1));
        }
        return labels;
    })();
    var TOOLTIPS = {
        'scale-type': {
            label: 'Tipo de escala',
            what: 'Escolha a jornada que mais se aproxima da operação.',
            when: 'Se houver dúvida, calcule primeiro com a sugestão do sistema.'
        },
        'workstations': {
            label: 'Quantidade de postos',
            what: 'Mostra quantas posições precisam estar cobertas ao mesmo tempo.',
            when: 'Use postos simultâneos, não o total de pessoas da empresa.'
        },
        'operation-type': {
            label: 'Tipo de operação',
            what: 'Define se a rotina é diurna, em turnos de 12h ou contínua.',
            when: 'Quanto mais fiel ao cenário real, mais confiável fica a comparação.'
        },
        'holidays': {
            label: 'Feriados nacionais',
            what: 'Indica se feriados entram como dias operados no mês.',
            when: 'Marque apenas quando houver cobertura real nesses dias.'
        },
        'result-headcount': {
            label: 'Quadro mínimo',
            what: 'Estimativa da menor equipe necessária para sustentar a cobertura informada.',
            when: 'Use como base de planejamento antes do fechamento definitivo da escala.'
        },
        'result-coverage': {
            label: 'Cobertura estimada',
            what: 'Mostra quanto da operação prevista a escala consegue atender.',
            when: 'Percentual menor que 100% costuma indicar ajuste de escala ou reforço de equipe.'
        },
        'result-status': {
            label: 'Status da cobertura',
            what: 'Resume o grau de aderência da sua escolha ao cenário informado.',
            when: 'Use para decidir se a escala está aderente, com ressalvas ou se exige revisão.'
        }
    };

    function byId(id) { return document.getElementById(id); }
    function monthName(month) {
        var label = MONTH_FMT.format(new Date(2026, month - 1, 1));
        return label.charAt(0).toUpperCase() + label.slice(1);
    }
    function formatHours(value) {
        var amount = Number(value) || 0;
        var hasDecimal = Math.abs(amount % 1) > 0.001;
        return amount.toLocaleString('pt-BR', { minimumFractionDigits: hasDecimal ? 1 : 0, maximumFractionDigits: 1 }) + 'h';
    }
    function formatHoursPerMonth(value) {
        return formatHours(value) + ' / mês';
    }
    function formatCompactHoursPerMonth(value) {
        var amount = Number(value) || 0;
        var hasDecimal = Math.abs(amount % 1) > 0.001;
        return amount.toLocaleString('pt-BR', {
            minimumFractionDigits: hasDecimal ? 1 : 0,
            maximumFractionDigits: 1
        }) + ' h/mês';
    }
    function parseHoursValue(raw) {
        if (raw === null || raw === undefined) return 0;
        var value = String(raw).trim();
        if (!value) return 0;
        value = value.replace(/h\s*\/?\s*m[eê]s/gi, '').replace(/h/gi, '').replace(/\s+/g, '');
        if (value.indexOf(',') !== -1 && value.indexOf('.') !== -1) {
            if (value.lastIndexOf(',') > value.lastIndexOf('.')) {
                value = value.replace(/\./g, '').replace(',', '.');
            } else {
                value = value.replace(/,/g, '');
            }
        } else if (value.indexOf(',') !== -1) {
            value = value.replace(/\./g, '').replace(',', '.');
        }
        value = value.replace(/[^0-9.-]/g, '');
        var parsed = Number(value);
        return parsed > 0 ? parsed : 0;
    }
    function service() {
        return window.AntiGravitySimulator && window.AntiGravitySimulator.services && window.AntiGravitySimulator.services.simulator;
    }
    function scales() {
        return window.AntiGravitySimulator && window.AntiGravitySimulator.domain && window.AntiGravitySimulator.domain.scales;
    }
    function getScaleChoice() {
        if (byId('sim-scale-manual') && byId('sim-scale-manual').checked) {
            return byId('sim-scale-type') && byId('sim-scale-type').value ? byId('sim-scale-type').value : '5x2';
        }
        return 'auto';
    }
    function getSimulationType() {
        return byId('sim-mode-project') && byId('sim-mode-project').checked ? 'project' : 'continuous';
    }
    function getOperationChoice() {
        return STATE.lastPreview && STATE.lastPreview.scenario && STATE.lastPreview.scenario.operationType
            ? STATE.lastPreview.scenario.operationType
            : 'diurna';
    }
    function isContinuous(scaleId) {
        var domain = scales();
        if (!domain || !scaleId || scaleId === 'auto') return false;
        var scale = domain.getScale(scaleId);
        return !!(scale && scale.continuous);
    }
    function uniq(items) {
        var seen = new Set();
        return (items || []).filter(function (item) {
            if (!item || seen.has(item)) return false;
            seen.add(item);
            return true;
        });
    }
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    function escapeAttribute(value) {
        return escapeHtml(value);
    }
    function getScaleToken(scale) {
        if (!scale) return '';
        return scale.id || scale.code || scale.label || '';
    }
    function isScaleMatch(result) {
        if (!result || !result.userBlock || !result.userBlock.scale || !result.suggestedScale) return false;
        return getScaleToken(result.userBlock.scale) === getScaleToken(result.suggestedScale);
    }
    function listNotes(blockData) {
        return uniq([].concat((blockData && blockData.alertas) || [], (blockData && blockData.observacoes) || []));
    }
    function tooltipSlotHtml(key, align) {
        if (!key) return '';
        return '<span class="ag-tip-slot" data-ag-tip-key="' + escapeAttribute(key) + '"' + (align ? ' data-ag-tip-align="' + escapeAttribute(align) + '"' : '') + '></span>';
    }
    function buildTooltipMarkup(key, align) {
        var tip = TOOLTIPS[key];
        if (!tip) return '';
        STATE.tooltipCounter += 1;
        var panelId = 'ag-tip-' + key + '-' + STATE.tooltipCounter;
        return '<span class="ag-tip-wrap' + (align === 'right' ? ' ag-tip-wrap--right' : '') + '" data-ag-tip>' +
            '<button type="button" class="ag-tip-trigger" data-ag-tip-button aria-label="Ajuda sobre ' + escapeAttribute(tip.label) + '" aria-expanded="false" aria-describedby="' + panelId + '">' +
            '<span aria-hidden="true">?</span><span class="visually-hidden">Abrir ajuda sobre ' + escapeHtml(tip.label) + '</span></button>' +
            '<span id="' + panelId + '" class="ag-tip-panel" role="tooltip" aria-hidden="true">' +
            '<p>' + escapeHtml(tip.what) + '</p>' +
            '<p>' + escapeHtml(tip.when) + '</p>' +
            '</span></span>';
    }
    function closeTooltip(root) {
        if (!root) return;
        var button = root.querySelector('[data-ag-tip-button]');
        var panel = root.querySelector('.ag-tip-panel');
        root.classList.remove('is-open');
        if (button) button.setAttribute('aria-expanded', 'false');
        if (panel) {
            panel.setAttribute('aria-hidden', 'true');
            panel.classList.remove('ag-tip-panel--left', 'ag-tip-panel--right', 'ag-tip-panel--top', 'ag-tip-panel--bottom');
            panel.style.left = '';
            panel.style.right = '';
            panel.style.top = '';
            panel.style.bottom = '';
        }
    }
    function closeAllTooltips(exceptRoot) {
        document.querySelectorAll('[data-ag-tip].is-open').forEach(function (root) {
            if (exceptRoot && root === exceptRoot) return;
            closeTooltip(root);
        });
    }
    function positionTooltip(root) {
        if (!root) return;
        var panel = root.querySelector('.ag-tip-panel');
        if (!panel) return;
        var gap = 8;
        var inset = 12;
        var rootRect = root.getBoundingClientRect();
        panel.classList.remove('ag-tip-panel--left', 'ag-tip-panel--right', 'ag-tip-panel--top', 'ag-tip-panel--bottom');
        panel.classList.add('ag-tip-panel--left', 'ag-tip-panel--bottom');
        panel.style.left = '0px';
        panel.style.right = 'auto';
        panel.style.top = 'calc(100% + ' + gap + 'px)';
        panel.style.bottom = 'auto';

        var rect = panel.getBoundingClientRect();
        if (rect.right > window.innerWidth - inset) {
            panel.classList.remove('ag-tip-panel--left');
            panel.classList.add('ag-tip-panel--right');
            panel.style.left = 'auto';
            panel.style.right = '0px';
            rect = panel.getBoundingClientRect();
        }

        if (rect.left < inset) {
            panel.classList.remove('ag-tip-panel--right');
            panel.classList.add('ag-tip-panel--left');
            panel.style.right = 'auto';
            panel.style.left = Math.max(inset - rootRect.left, 0) + 'px';
            rect = panel.getBoundingClientRect();
        }

        if (rect.right > window.innerWidth - inset) {
            panel.style.left = Math.max(window.innerWidth - inset - rect.width - rootRect.left, inset - rootRect.left) + 'px';
            rect = panel.getBoundingClientRect();
        }

        if (rect.bottom > window.innerHeight - inset && rootRect.top >= rect.height + gap + inset) {
            panel.classList.remove('ag-tip-panel--bottom');
            panel.classList.add('ag-tip-panel--top');
            panel.style.top = 'auto';
            panel.style.bottom = 'calc(100% + ' + gap + 'px)';
        }
    }
    function positionOpenTooltips() {
        document.querySelectorAll('[data-ag-tip].is-open').forEach(function (root) {
            positionTooltip(root);
        });
    }
    function openTooltip(root) {
        if (!root) return;
        var button = root.querySelector('[data-ag-tip-button]');
        var panel = root.querySelector('.ag-tip-panel');
        closeAllTooltips(root);
        root.classList.add('is-open');
        if (button) button.setAttribute('aria-expanded', 'true');
        if (panel) {
            panel.setAttribute('aria-hidden', 'false');
            positionTooltip(root);
        }
    }
    function bindTooltipDocumentEvents() {
        if (STATE.tooltipDocBound) return;
        STATE.tooltipDocBound = true;
        document.addEventListener('click', function (event) {
            if (!event.target.closest('[data-ag-tip]')) closeAllTooltips();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeAllTooltips();
        });
        window.addEventListener('resize', positionOpenTooltips);
    }
    function bindTooltips(root) {
        bindTooltipDocumentEvents();
        (root || document).querySelectorAll('[data-ag-tip]').forEach(function (tipRoot) {
            if (tipRoot.dataset.agTipBound === '1') return;
            var button = tipRoot.querySelector('[data-ag-tip-button]');
            if (!button) return;
            tipRoot.addEventListener('mouseenter', function () {
                if (window.matchMedia && window.matchMedia('(hover: hover)').matches) openTooltip(tipRoot);
            });
            tipRoot.addEventListener('mouseleave', function () {
                if (window.matchMedia && window.matchMedia('(hover: hover)').matches) closeTooltip(tipRoot);
            });
            tipRoot.addEventListener('focusin', function () { openTooltip(tipRoot); });
            tipRoot.addEventListener('focusout', function (event) {
                if (!tipRoot.contains(event.relatedTarget)) closeTooltip(tipRoot);
            });
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (tipRoot.classList.contains('is-open')) closeTooltip(tipRoot); else openTooltip(tipRoot);
            });
            button.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    closeTooltip(tipRoot);
                    button.focus();
                }
            });
            tipRoot.dataset.agTipBound = '1';
        });
    }
    function hydrateTooltipSlots(root) {
        (root || document).querySelectorAll('.ag-tip-slot[data-ag-tip-key]').forEach(function (slot) {
            if (slot.dataset.agTipReady === '1') return;
            var markup = buildTooltipMarkup(slot.getAttribute('data-ag-tip-key'), slot.getAttribute('data-ag-tip-align') || '');
            if (!markup) {
                slot.remove();
                return;
            }
            slot.innerHTML = markup;
            slot.dataset.agTipReady = '1';
        });
        bindTooltips(root || document);
    }
    function syncAdSlots() {
        AD_SLOT_IDS.forEach(function (id) {
            var slot = byId(id);
            if (!slot) return;
            var ins = slot.querySelector('.adsbygoogle');
            var filled = !!(ins && ins.getAttribute('data-ad-status') === 'filled');
            slot.classList.toggle('scale-ad-slot--filled', filled);
            slot.hidden = false;
            slot.removeAttribute('hidden');
        });
    }
    function tryPushConfiguredAd(ins) {
        var slotId = ins && ins.getAttribute('data-ad-slot');
        if (!ins || !slotId || !/^\d+$/.test(slotId) || ins.dataset.agPushed === '1') return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            ins.dataset.agPushed = '1';
        } catch (error) { }
    }
    function initAdSlots() {
        AD_SLOT_IDS.forEach(function (id) {
            var slot = byId(id);
            var ins = slot && slot.querySelector('.adsbygoogle');
            if (!ins) return;
            tryPushConfiguredAd(ins);
            if (window.MutationObserver && ins.dataset.agObserverBound !== '1') {
                var observer = new MutationObserver(function () {
                    syncAdSlots();
                });
                observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
                ins.dataset.agObserverBound = '1';
            }
        });
        syncAdSlots();
        window.setTimeout(syncAdSlots, 120);
        window.setTimeout(syncAdSlots, 900);
    }
    function metricCard(value, label, tooltipKey) {
        return '<div class="metric-card"><div class="metric-card__head"><span class="metric-card__label-copy"><span class="metric-card__label">' + escapeHtml(label) + '</span>' + tooltipSlotHtml(tooltipKey, 'right') + '</span></div><div class="metric-card__value">' + value + '</div></div>';
    }
    function statusUi(block) {
        var code = block && block.status ? block.status.code : 'incompatible';
        if (code === 'standard') return { badgeClass: 'status-ok', label: block.status.label || 'Dentro do padrão', icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' };
        if (code === 'below_reference' || code === 'above_reference') return { badgeClass: 'status-obs', label: block.status.label || 'Fora da referência', icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>' };
        return { badgeClass: 'status-no', label: block && block.status ? block.status.label : 'Incompatível com a escala', icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>' };
    }
    function getStatusDescription(block) {
        if (!block || !block.status) return 'O cenário precisa ser revisado antes da implantação.';
        if (block.status.code === 'standard') return 'A leitura ficou dentro da faixa natural da escala para o mês.';
        if (block.status.code === 'below_reference') return 'As horas consideradas ficaram abaixo da referência e o quadro foi reforçado.';
        if (block.status.code === 'above_reference') return 'As horas consideradas superam a referência e pedem validação de compensação.';
        return 'O cenário extrapola a faixa natural da escala ou da operação informada.';
    }
    function listBlock(title, items, tone, icon, tooltipKey) {
        if (!items || !items.length) return null;
        var wrap = document.createElement('div');
        wrap.className = 'mb-4';
        wrap.innerHTML = '<p class="text-sm font-semibold mb-2 ' + tone + '"><span class="list-title">' + title + tooltipSlotHtml(tooltipKey, 'right') + '</span></p>';
        var list = document.createElement('ul');
        list.className = 'reason-list';
        items.forEach(function (item) {
            var li = document.createElement('li');
            li.innerHTML = '<span class="reason-icon">' + icon + '</span><span>' + escapeHtml(item) + '</span>';
            list.appendChild(li);
        });
        wrap.appendChild(list);
        return wrap;
    }
    function coverageBox(block) {
        var tone = {
            integral: 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100',
            ajustada: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
            parcial: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
        }[block.coberturaNivel] || 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100';
        if (block.status && block.status.code === 'incompatible') {
            tone = 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100';
        } else if (block.status && (block.status.code === 'below_reference' || block.status.code === 'above_reference')) {
            tone = 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100';
        }
        var box = document.createElement('div');
        box.className = 'mb-4 p-3 rounded-lg border ' + tone;
        var ui = statusUi(block);
        box.innerHTML = '<div class="flex flex-wrap items-start justify-between gap-3"><div class="status-copy"><p class="text-xs font-semibold uppercase tracking-wide mb-1"><span class="list-title">Status da cobertura' + tooltipSlotHtml('result-status', 'right') + '</span></p><p class="text-sm font-semibold mb-1">' + escapeHtml(ui.label) + '</p><p class="status-desc">' + escapeHtml(getStatusDescription(block)) + '</p></div><span class="status-badge ' + ui.badgeClass + '">' + ui.icon + escapeHtml(ui.label) + '</span></div><p class="text-sm mt-3"><strong>Compatibilidade:</strong> ' + escapeHtml(block.compatibilidade.label) + '. ' + escapeHtml(block.coberturaLabel) + '</p>' + (block.hoursComparison ? '<p class="text-sm mt-2"><strong>Leitura das horas:</strong> ' + escapeHtml(block.hoursComparison.shortMessage) + '</p>' : '');
        return box;
    }
    function initSelects() {
        var monthSel = byId('sim-month-select');
        var yearSel = byId('sim-year-select');
        var scaleSel = byId('sim-scale-type');
        var operationSel = byId('sim-operation-type');
        var now = new Date();
        if (monthSel && !monthSel.options.length) {
            for (var month = 1; month <= 12; month++) {
                var m = document.createElement('option');
                m.value = month;
                m.textContent = monthName(month);
                if (month - 1 === now.getMonth()) m.selected = true;
                monthSel.appendChild(m);
            }
        }
        if (yearSel && !yearSel.options.length) {
            for (var year = now.getFullYear() - 1; year <= now.getFullYear() + 2; year++) {
                var y = document.createElement('option');
                y.value = year;
                y.textContent = year;
                if (year === now.getFullYear()) y.selected = true;
                yearSel.appendChild(y);
            }
        }
        if (scaleSel && scales()) {
            scaleSel.innerHTML = '<option value="auto">&#10024; Sugerida pelo sistema</option>';
            scales().getGroupedScaleOptions().forEach(function (group) {
                var optgroup = document.createElement('optgroup');
                optgroup.label = group.label;
                group.scales.forEach(function (scale) {
                    var option = document.createElement('option');
                    option.value = scale.id;
                    option.textContent = scale.label;
                    optgroup.appendChild(option);
                });
                scaleSel.appendChild(optgroup);
            });
            scaleSel.value = 'auto';
        }
        if (operationSel && !operationSel.value) {
            operationSel.value = 'diurna';
        }
    }
    function syncMobileMenuButton() {
        if (window.DataSuteis && typeof window.DataSuteis.syncMobileMenuButtonState === 'function') {
            window.DataSuteis.syncMobileMenuButtonState();
            return;
        }
        var button = byId('mobile-menu-btn');
        var menu = byId('mobile-menu');
        if (!button || !menu) return;
        button.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
    }
    function initMobileMenuState() {
        syncMobileMenuButton();
    }
    function setInlineNote(element, message, tone) {
        if (!element) return;
        if (!message) {
            element.textContent = '';
            element.className = 'inline-note hidden';
            return;
        }
        element.textContent = message;
        element.className = 'inline-note inline-note--' + (tone || 'info');
    }
    function setMutedGroup(element, isMuted) {
        if (!element) return;
        element.classList.toggle('muted-group', !!isMuted);
        element.setAttribute('aria-disabled', isMuted ? 'true' : 'false');
    }
    function statusTone(code) {
        if (code === 'standard') return 'status-ok';
        if (code === 'below_reference' || code === 'above_reference') return 'status-obs';
        return 'status-no';
    }
    function setFieldValue(id, value) {
        var field = byId(id);
        if (!field) return;
        field.value = value || '';
    }
    function syncManualHoursState() {
        var field = byId('sim-monthly-hours');
        if (!field) {
            STATE.manualHoursDirty = false;
            return false;
        }
        var rawValue = String(field.value || '').trim();
        var parsedValue = parseHoursValue(rawValue);
        STATE.manualHoursDirty = !!rawValue && parsedValue > 0 && Math.abs(parsedValue - (STATE.referenceHours || 0)) > 0.05;
        return STATE.manualHoursDirty;
    }
    function renderHoursPreview(preview) {
        if (!preview) return;
        STATE.lastPreview = preview;
        STATE.referenceHours = Number(preview.referenceHours) || 0;
        setFieldValue('sim-scale-reference-hours', formatHoursPerMonth(preview.referenceHours));
        setFieldValue('sim-hours-considered', formatHoursPerMonth(preview.consideredHours));
        if (!STATE.manualHoursDirty) {
            setFieldValue('sim-monthly-hours', formatHoursPerMonth(preview.referenceHours));
        }
        if (byId('sim-holiday-counter')) {
            byId('sim-holiday-counter').textContent = 'Feriados no período: ' + preview.holidays.count;
        }
        if (byId('sim-hours-help')) {
            byId('sim-hours-help').textContent = preview.usesManualHours
                ? 'Valor manual ativo. O sistema compara com a referência e mantém a simulação.'
                : 'Se editar este campo, a simulação passa a comparar o valor informado com a referência da escala.';
        }
        if (byId('sim-hours-status')) {
            byId('sim-hours-status').innerHTML =
                '<div class="flex flex-wrap items-start justify-between gap-3">' +
                    '<div class="status-copy">' +
                        '<p class="text-xs font-semibold uppercase tracking-wide mb-1">Status das horas</p>' +
                        '<p class="text-sm font-semibold mb-1">' + escapeHtml(preview.status.label) + '</p>' +
                        '<p class="status-desc">' + escapeHtml(preview.hoursComparison.shortMessage) + '</p>' +
                    '</div>' +
                    '<span class="status-badge ' + statusTone(preview.status.code) + '">' + escapeHtml(preview.status.label) + '</span>' +
                '</div>' +
                '<p class="text-sm mt-3"><strong>Faixa padrão:</strong> ' + formatHours(preview.hoursComparison.ranges.lowerAccept) + ' a ' + formatHours(preview.hoursComparison.ranges.upperAccept) + ' &bull; <strong>Faixa de alerta:</strong> ' + formatHours(preview.hoursComparison.ranges.lowerAlert) + ' a ' + formatHours(preview.hoursComparison.ranges.upperAlert) + '</p>' +
                '<p class="text-sm mt-2"><strong>Diferença vs. referência:</strong> ' + (preview.hoursComparison.deltaHours > 0 ? '+' : '') + escapeHtml(String(preview.hoursComparison.deltaHours).replace('.', ',')) + 'h (' + (preview.hoursComparison.deltaPct > 0 ? '+' : '') + escapeHtml(String(preview.hoursComparison.deltaPct).replace('.', ',')) + '%)</p>';
        }
    }
    function updateSuggestNote(scaleId) {
        var suggest = byId('sim-scale-suggest-note');
        if (!suggest) return;
        var previewScale = scales() && STATE.suggestedScale ? scales().getScale(STATE.suggestedScale) : null;
        suggest.style.display = scaleId === 'auto' ? 'block' : 'none';
        suggest.textContent = scaleId === 'auto' && previewScale ? 'Sugestão atual do sistema: ' + previewScale.label + '.' : 'O sistema escolherá automaticamente a melhor escala.';
    }
    function applyScaleLocks() {
        var scaleId = getScaleChoice();
        var operationType = getOperationChoice();
        var continuous = isContinuous(scaleId);
        var weekendsYes = byId('sim-weekends-yes');
        var weekendsNo = byId('sim-weekends-no');
        var saturday = byId('sim-sat');
        var sunday = byId('sim-sun');
        var holidayYes = byId('sim-holidays-yes');
        var holidayNo = byId('sim-holidays-no');
        var weekendDetails = byId('sim-weekend-details');
        var weekendNote = byId('sim-weekend-note');
        var holidayNote = byId('sim-holiday-note');
        var operationNote = byId('sim-operation-note');

        if (continuous) {
            weekendsYes.checked = true; weekendsNo.checked = false; weekendsYes.disabled = true; weekendsNo.disabled = true;
            saturday.checked = true; sunday.checked = true; saturday.disabled = true; sunday.disabled = true;
            holidayYes.checked = true; holidayNo.checked = false; holidayYes.disabled = true; holidayNo.disabled = true;
            setMutedGroup(weekendDetails, true);
            setInlineNote(weekendNote, 'Esta escala já cobre sábado e domingo.', 'info');
            setInlineNote(holidayNote, 'Os feriados seguem dentro da cobertura contínua.', 'info');
        } else {
            weekendsYes.disabled = false; weekendsNo.disabled = false;
            holidayYes.disabled = false; holidayNo.disabled = false;
            setMutedGroup(weekendDetails, false);
            if (weekendsYes.checked) {
                saturday.checked = true; sunday.checked = true;
                saturday.disabled = true; sunday.disabled = true;
                setInlineNote(weekendNote, 'Sábado e domingo entram juntos no cenário.', 'info');
            } else {
                saturday.disabled = false;
                sunday.disabled = false;
                if (saturday.checked && sunday.checked) setInlineNote(weekendNote, 'Fim de semana com operação nos dois dias.', 'info');
                else if (saturday.checked && !sunday.checked) setInlineNote(weekendNote, 'Domingo fora da operação neste cenário.', 'info');
                else if (!saturday.checked && sunday.checked) setInlineNote(weekendNote, 'Cobertura só no domingo: valide se esse padrão é real.', 'warning');
                else setInlineNote(weekendNote, 'Fim de semana fora da operação.', 'info');
            }
            if (holidayYes.checked) setInlineNote(holidayNote, 'Feriados entram na leitura do mês.', 'info');
            else setInlineNote(holidayNote, 'Feriados ficam fora da leitura deste cenário.', 'info');
        }

        if (operationType === '24h' && (scaleId === '5x2' || scaleId === '5x1' || scaleId === '6x1')) {
            setInlineNote(operationNote, 'Operação 24h tende a pedir escala de cobertura contínua.', 'warning');
        } else if (operationType === '12h' && scaleId === '5x2') {
            setInlineNote(operationNote, 'Turnos de 12h costumam pedir escala dedicada.', 'warning');
        } else if (operationType === 'diurna' && continuous) {
            setInlineNote(operationNote, 'Esta escala cobre um cenário mais contínuo que uma rotina diurna.', 'info');
        } else if (operationType === '24h' && scaleId === 'auto') {
            setInlineNote(operationNote, 'Na operação 24h, a sugestão automática tende a priorizar escalas contínuas.', 'info');
        } else if (operationType === '12h' && scaleId === 'auto') {
            setInlineNote(operationNote, 'No turno de 12h, a sugestão tende a favorecer coberturas em blocos longos.', 'info');
        } else {
            setInlineNote(operationNote, '', 'info');
        }

        if (STATE.lastPreview && STATE.lastPreview.compatibility && STATE.lastPreview.compatibility.code === 'baixa') {
            setInlineNote(operationNote, 'A combinação atual é simulável, mas pouco aderente ao padrão natural da escala.', 'warning');
        }
        if (STATE.lastPreview && STATE.lastPreview.compatibility && STATE.lastPreview.compatibility.code === 'incompativel') {
            setInlineNote(operationNote, 'A operação informada não é aderente a esta escala. O cenário sai do padrão.', 'warning');
        }

        updateSuggestNote(scaleId);
    }
    function collectParams() {
        var weekends = byId('sim-weekends-yes').checked;
        return {
            scaleChoice: getScaleChoice(),
            year: parseInt(byId('sim-year-select').value, 10),
            month: parseInt(byId('sim-month-select').value, 10),
            postos: Math.max(1, parseInt(byId('sim-postos').value, 10) || 1),
            operationType: getOperationChoice(),
            worksSaturday: weekends || byId('sim-sat').checked,
            worksSunday: weekends || byId('sim-sun').checked,
            worksHolidays: byId('sim-holidays-yes').checked,
            hoursOverride: parseHoursValue(byId('sim-monthly-hours') ? byId('sim-monthly-hours').value : '')
        };
    }
    function refreshPreview() {
        if (!service()) return Promise.resolve();
        return service().previewAutomaticHours(collectParams()).then(function (preview) {
            STATE.suggestedScale = preview.scale;
            renderHoursPreview(preview);
            applyScaleLocks();
        }).catch(function () {
            STATE.lastPreview = null;
            STATE.referenceHours = 0;
            setFieldValue('sim-scale-reference-hours', '0h / mês');
            setFieldValue('sim-hours-considered', '0h / mês');
            if (byId('sim-hours-status')) {
                byId('sim-hours-status').innerHTML = '<p class="text-sm font-semibold mb-1">Status das horas</p><p class="help-copy">Não foi possível atualizar a comparação neste momento.</p>';
            }
            if (!STATE.manualHoursDirty) {
                setFieldValue('sim-monthly-hours', '0h / mês');
            }
            applyScaleLocks();
        });
    }
    function queuePreviewRefresh() {
        syncManualHoursState();
        window.clearTimeout(STATE.previewTimer);
        STATE.previewTimer = window.setTimeout(function () {
            refreshPreview();
        }, 120);
    }
    function announceResult(message) {
        var live = byId('sim-result-live');
        if (!live) return;
        live.textContent = '';
        window.setTimeout(function () {
            live.textContent = message;
        }, 30);
    }
    function setBusy(isBusy) {
        var result = byId('sim-result');
        var button = byId('sim-calc-btn');
        if (result) result.setAttribute('aria-busy', isBusy ? 'true' : 'false');
        if (!button) return;
        var label = button.querySelector('span');
        if (!button.dataset.defaultLabel && label) button.dataset.defaultLabel = label.textContent;
        button.disabled = !!isBusy;
        button.setAttribute('aria-disabled', isBusy ? 'true' : 'false');
        if (label && button.dataset.defaultLabel) {
            label.textContent = isBusy ? 'Calculando...' : button.dataset.defaultLabel;
        }
    }
    function updateHowBlock(result) {
        if (!byId('sim-how-summary') || !byId('sim-how-list')) return;
        byId('sim-how-summary').textContent = result.userBlock.explicacaoCurta;
        byId('sim-how-list').innerHTML = [
            'Referência da escala: ' + formatHoursPerMonth(result.userBlock.automaticHoursReference) + ' • Horas consideradas: ' + formatHoursPerMonth(result.userBlock.consideredHours) + '.',
            'Postos simultâneos: ' + result.userBlock.coveragePlan.postos + ' • Colaboradores necessários: ' + result.userBlock.coveragePlan.colaboradoresNecessarios + '.',
            'Feriados monitorados no mês: ' + result.diasOperados.feriados + '.',
            result.userBlock.restrictionSummary
        ].map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('');
    }
    function renderSummaryHeader(result, isMatch) {
        var evaluation = result.userBlock;
        var userStatus = statusUi(evaluation);
        var compareHtml = isMatch
            ? '<div class="compare-summary"><div class="compare-summary__item compare-summary__item--recommended"><span class="compare-summary__label">Escala ideal e aderente</span><span class="compare-summary__value">' + escapeHtml(evaluation.scale.label) + '</span><span class="compare-summary__note">Sua escolha é a mais eficiente para este cenário operacional.</span></div><div class="compare-summary__item"><span class="compare-summary__label">Status das horas</span><span class="compare-summary__value">' + escapeHtml(userStatus.label) + '</span><span class="compare-summary__note">' + escapeHtml(getStatusDescription(evaluation)) + '</span></div><div class="compare-summary__item"><span class="compare-summary__label">Horas consideradas</span><span class="compare-summary__value">' + escapeHtml(formatHoursPerMonth(evaluation.consideredHours)) + '</span><span class="compare-summary__note">Referência do mês: ' + escapeHtml(formatHoursPerMonth(evaluation.automaticHoursReference)) + '.</span></div></div>'
            : '<div class="compare-summary"><div class="compare-summary__item compare-summary__item--recommended"><span class="compare-summary__label">Escala mais indicada</span><span class="compare-summary__value">' + escapeHtml(result.suggestedScale.label) + '</span><span class="compare-summary__note">Recomendação do sistema para este cenário.</span></div><div class="compare-summary__item"><span class="compare-summary__label">Sua escolha</span><span class="compare-summary__value">' + escapeHtml(evaluation.scale.label) + '</span><span class="compare-summary__note">Diferente da recomendação.</span></div><div class="compare-summary__item"><span class="compare-summary__label">Situação da sua escolha</span><span class="compare-summary__value">' + escapeHtml(userStatus.label) + '</span><span class="compare-summary__note">' + escapeHtml(getStatusDescription(evaluation)) + '</span></div></div>';
        var header = document.createElement('div');
        header.className = 'card p-4';
        header.innerHTML = '<div class="flex flex-wrap items-start justify-between gap-3 mb-4"><div><p class="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-1">Resumo do cenário</p><p class="font-bold text-base">' + escapeHtml(result.monthLabel) + '</p></div><p class="help-copy">' + evaluation.diasOperados + ' de ' + evaluation.totalDias + ' dias operados &bull; ' + result.postos + ' posto(s) &bull; ' + result.diasOperados.feriados + ' feriado(s) &bull; ' + evaluation.totalOperationHours.toLocaleString('pt-BR') + 'h de operação</p></div><div class="compare-summary mb-4"><div class="compare-summary__item"><span class="compare-summary__label">Postos a cobrir</span><span class="compare-summary__value">' + escapeHtml(String(evaluation.coveragePlan.postos)) + '</span><span class="compare-summary__note">Postos simultâneos informados no cenário.</span></div><div class="compare-summary__item"><span class="compare-summary__label">Colaboradores necessários</span><span class="compare-summary__value">' + escapeHtml(String(evaluation.coveragePlan.colaboradoresNecessarios)) + '</span><span class="compare-summary__note">' + escapeHtml(String(evaluation.coveragePlan.colaboradoresPorPosto)) + ' por posto para sustentar a cobertura.</span></div><div class="compare-summary__item"><span class="compare-summary__label">Horas comparadas</span><span class="compare-summary__value">' + escapeHtml(formatHoursPerMonth(evaluation.consideredHours)) + '</span><span class="compare-summary__note">Referência da escala: ' + escapeHtml(formatHoursPerMonth(evaluation.automaticHoursReference)) + '.</span></div></div>' + compareHtml;
        return header;
    }
    function renderBlock(result, blockData, system, options) {
        options = options || {};
        var ui = statusUi(blockData);
        var block = document.createElement('div');
        var variantClass = options.variantClass || (system ? 'result-block--system' : 'result-block--user');
        block.className = 'result-block ' + variantClass;
        var title = options.title || (system ? 'Escala mais indicada' : 'Sua escolha');
        var subtitle = options.subtitle || (system ? 'Recomendação do sistema.' : 'Detalhes da escala selecionada.');
        var color = options.color || (system ? 'rgb(29,78,216)' : 'rgb(21,128,61)');
        var icon = options.icon || (system
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>');
        var header = document.createElement('div');
        header.className = 'result-block__header';
        header.innerHTML = '<svg class="icon flex-shrink-0" style="color:' + color + '" fill="none" stroke="currentColor" viewBox="0 0 24 24">' + icon + '</svg><div class="flex-1"><p class="font-bold text-sm" style="color:' + color + '">' + escapeHtml(title) + '</p><p class="text-xs text-surface-500">' + escapeHtml(subtitle) + '</p></div><span class="status-badge ' + ui.badgeClass + '">' + ui.icon + escapeHtml(ui.label) + '</span>';
        block.appendChild(header);
        var body = document.createElement('div');
        body.className = 'result-block__body';
        body.innerHTML = '<div class="metric-grid">' + metricCard(escapeHtml(blockData.scale.label), system ? 'Escala sugerida' : 'Sua escala') + metricCard(String(blockData.coveragePlan.postos), 'Postos a cobrir') + metricCard(String(blockData.coveragePlan.colaboradoresNecessarios), 'Colaboradores necessários', 'result-headcount') + metricCard(String(blockData.coveragePlan.colaboradoresPorPosto), 'Por posto') + metricCard(formatHoursPerMonth(blockData.automaticHoursReference), 'Referência da escala') + metricCard(formatHoursPerMonth(blockData.consideredHours), 'Horas consideradas') + metricCard(formatHours(blockData.horasEstimadasPorFuncionario), 'Média estimada') + metricCard(blockData.coberturaPercentual + '%', 'Cobertura estimada', 'result-coverage') + '</div>';
        body.appendChild(coverageBox(blockData));
        var planSummary = document.createElement('div');
        planSummary.className = 'compare-summary mb-4';
        planSummary.innerHTML =
            '<div class="compare-summary__item compare-summary__item--recommended"><span class="compare-summary__label">Quadro padrão</span><span class="compare-summary__value">' + escapeHtml(String(blockData.coveragePlan.quadroPadrao)) + '</span><span class="compare-summary__note">Base natural da escala antes do ajuste por horas.</span></div>' +
            '<div class="compare-summary__item"><span class="compare-summary__label">Quadro por horas</span><span class="compare-summary__value">' + escapeHtml(String(blockData.coveragePlan.quadroPorHoras)) + '</span><span class="compare-summary__note">Leitura após comparar referência e horas consideradas.</span></div>' +
            '<div class="compare-summary__item"><span class="compare-summary__label">Leitura das horas</span><span class="compare-summary__value">' + escapeHtml(blockData.hoursComparison.label) + '</span><span class="compare-summary__note">' + escapeHtml(blockData.hoursComparison.detailMessage) + '</span></div>';
        body.appendChild(planSummary);
        if (options.summaryText) {
            var why = document.createElement('div');
            why.className = 'mb-4';
            why.innerHTML = '<p class="text-sm text-surface-600 dark:text-surface-400">' + escapeHtml(options.summaryText) + '</p>';
            body.appendChild(why);
        }
        if (!system) {
            body.appendChild(renderCalendar(result, blockData));
        }
        if (system && result.alternativas && result.alternativas.length) {
            var alternatives = document.createElement('div');
            alternatives.className = 'mb-4';
            alternatives.innerHTML = '<p class="text-xs text-surface-500 mb-1"><span class="list-title">Alternativas compatíveis</span></p>';
            result.alternativas.forEach(function (item) {
                var chip = document.createElement('span');
                chip.className = 'alt-chip mr-1';
                chip.textContent = item.label + ' • ' + item.tag;
                chip.setAttribute('aria-label', item.label + ', ' + item.tag);
                alternatives.appendChild(chip);
            });
            body.appendChild(alternatives);
        }
        var notes = listNotes(blockData);
        var notesBlock = listBlock(system ? 'Observações' : 'Restrições e alertas', notes, system ? 'text-surface-700 dark:text-surface-200' : 'text-amber-700 dark:text-amber-300', system ? '<span class="text-blue-600">i</span>' : '<span class="text-amber-500">&#9888;</span>');
        if (notesBlock) body.appendChild(notesBlock);
        if (blockData.legalSummary) {
            var legal = document.createElement('div');
            legal.className = 'legal-note' + (system ? '' : ' mt-2');
            legal.textContent = blockData.legalSummary;
            body.appendChild(legal);
        }
        block.appendChild(body);
        hydrateTooltipSlots(block);
        return block;
    }
    function renderCalendar(result, blockData) {
        var wrap = document.createElement('div');
        var cal = blockData.calendar;
        var sim = blockData.simulation;
        var header = document.createElement('div');
        header.className = 'calendar-head';
        header.innerHTML = '<div><p class="font-bold text-sm">Calendário da escala</p><p class="help-copy mt-1">Distribuição estimada da equipe no mês.</p></div>';
        wrap.appendChild(header);
        var summary = document.createElement('p');
        summary.className = 'help-copy mb-3';
        summary.innerHTML = 'Cobertura: <strong>' + sim.coveragePct + '%</strong> &bull; ' + sim.coveredDays + ' de ' + sim.operatedDays + ' dias completos &bull; ' + blockData.coveragePlan.postos + ' posto(s) &bull; ' + blockData.coveragePlan.colaboradoresNecessarios + ' colaborador(es)' + (sim.uncoveredHours > 0 ? ' &bull; <span class="text-red-600">' + sim.uncoveredHours + 'h sem cobertura</span>' : '') + (sim.maxHours > 0 ? ' &bull; pico de ' + sim.maxHours + 'h por colaborador' : '');
        wrap.appendChild(summary);
        var card = document.createElement('div');
        card.className = 'card p-3 app-calendar-shell scale-calendar';
        var scroll = document.createElement('div');
        scroll.className = 'calendar-scroll';
        var grid = document.createElement('div');
        grid.className = 'sim-cal-grid';
        grid.setAttribute('aria-hidden', 'true');
        WDAY_LABELS.forEach(function (label) {
            var cell = document.createElement('div');
            cell.className = 'sim-cal-cell sim-cal-cell--header';
            cell.textContent = label;
            grid.appendChild(cell);
        });
        var first = cal.days[0].iso.split('-').map(Number);
        for (var i = 0; i < new Date(first[0], first[1] - 1, 1).getDay(); i++) {
            var empty = document.createElement('div');
            empty.className = 'sim-cal-cell sim-cal-cell--empty';
            grid.appendChild(empty);
        }
        cal.days.forEach(function (dayData) {
            var cell = document.createElement('div');
            cell.className = 'sim-cal-cell ' + (dayData.deficit > 0 ? 'sim-cal-cell--deficit' : dayData.holiday ? 'sim-cal-cell--holiday' : dayData.operated ? 'sim-cal-cell--work' : 'sim-cal-cell--weekend-off');
            var titleParts = [String(dayData.day)];
            titleParts.push(dayData.operated ? dayData.assigned.length + '/' + dayData.requiredAssignments + ' turnos' : 'Sem operação');
            if (dayData.holiday) titleParts.push('Feriado monitorado');
            if (dayData.deficit > 0) titleParts.push('Pede ajuste manual');
            cell.setAttribute('title', titleParts.join(' • '));
            cell.innerHTML = '<span class="cal-day-num">' + dayData.day + '</span>';
            if (dayData.operated) cell.innerHTML += '<span style="font-size:9px;font-weight:700;">' + dayData.assigned.length + '/' + dayData.requiredAssignments + ' turnos</span>';
            if (dayData.operated && dayData.assigned.length) {
                cell.innerHTML += '<div class="cal-day-tags">' + dayData.assigned.slice(0, 4).map(function (employee) { return '<span class="cal-emp-tag">' + escapeHtml(employee) + '</span>'; }).join('') + (dayData.assigned.length > 4 ? '<span class="cal-emp-tag" style="background:rgb(100,116,139)">+' + (dayData.assigned.length - 4) + '</span>' : '') + '</div>';
            }
            if (dayData.deficit > 0) cell.innerHTML += '<span style="font-size:9px;font-weight:700;">ajuste</span>';
            grid.appendChild(cell);
        });
        scroll.appendChild(grid);
        card.appendChild(scroll);
        var legend = document.createElement('div');
        legend.className = 'sim-legend';
        legend.innerHTML = '<span class="sim-legend__item"><span class="sim-legend__swatch" style="background:rgb(219,234,254)"></span> Cobertura prevista</span><span class="sim-legend__item"><span class="sim-legend__swatch" style="background:rgb(248,250,252)"></span> Sem operação</span><span class="sim-legend__item"><span class="sim-legend__swatch" style="background:rgb(254,243,199)"></span> Feriado</span><span class="sim-legend__item"><span class="sim-legend__swatch" style="background:rgb(254,226,226);border:1px solid rgb(252,165,165)"></span> Ajuste</span>';
        card.appendChild(legend);
        var statsTitle = document.createElement('p');
        statsTitle.className = 'font-semibold text-sm mt-4 mb-2';
        statsTitle.innerHTML = '<span class="list-title">Horas por funcionário no mês</span>';
        card.appendChild(statsTitle);
        var chips = document.createElement('div');
        chips.className = 'flex flex-wrap gap-2';
        chips.setAttribute('role', 'list');
        cal.employees.forEach(function (employee) {
            var chip = document.createElement('span');
            chip.className = 'emp-chip';
            chip.textContent = employee + ': ' + cal.stats.hours[employee] + 'h (' + cal.stats.assignments[employee] + ' turno(s))';
            chip.setAttribute('role', 'listitem');
            chip.setAttribute('tabindex', '0');
            chip.setAttribute('aria-label', employee + ' com ' + cal.stats.hours[employee] + ' horas estimadas e ' + cal.stats.assignments[employee] + ' turnos no mês');
            chips.appendChild(chip);
        });
        card.appendChild(chips);
        wrap.appendChild(card);
        hydrateTooltipSlots(wrap);
        return wrap;
    }
    function renderResults(result) {
        var isMatch = isScaleMatch(result);
        var container = byId('sim-result');
        STATE.lastResult = result;
        container.innerHTML = '';
        var wrap = document.createElement('div');
        wrap.className = 'space-y-5';
        wrap.appendChild(renderSummaryHeader(result, isMatch));
        if (isMatch) {
            wrap.appendChild(renderBlock(result, result.userBlock, false, {
                variantClass: 'result-block--ideal',
                title: 'Escala ideal e aderente',
                subtitle: 'Configuração otimizada',
                color: 'rgb(29,78,216)',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>',
                summaryText: 'Sua escolha é a mais eficiente para este cenário operacional.'
            }));
        } else {
            wrap.appendChild(renderBlock(result, result.systemBlock, true, {
                title: 'Escala mais indicada',
                subtitle: 'Recomendação do sistema.',
                summaryText: result.systemBlock.explicacaoCurta
            }));
            var divider = document.createElement('div');
            divider.className = 'section-divider';
            divider.textContent = 'sua escolha';
            wrap.appendChild(divider);
            wrap.appendChild(renderBlock(result, result.userBlock, false, {
                title: 'Sua escolha',
                subtitle: 'Detalhes da escala selecionada.',
                summaryText: result.userBlock.restrictionSummary
            }));
        }
        container.appendChild(wrap);
        updateHowBlock(result);
        hydrateTooltipSlots(container);
        syncAdSlots();
        buildPrintSheet(STATE.printConfig);
        announceResult('Resultado atualizado. Escala sugerida: ' + result.suggestedScale.label + '. Status da escala escolhida: ' + result.userBlock.status.label + '.');
    }
    function updatePrintTimestamp() {
        var stamp = document.querySelector('.print-footer .timestamp');
        if (!stamp) return;
        stamp.textContent = 'Gerado em ' + new Date().toLocaleString('pt-BR');
    }
    function buildPrintMetricHtml(label, value) {
        return '<div class="scale-print-card"><span class="scale-print-kicker">' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
    }
    function buildPrintNotesHtml(title, items) {
        if (!items || !items.length) return '';
        return '<section class="scale-print-section scale-print-section--avoid"><h3>' + escapeHtml(title) + '</h3><ul class="scale-print-list">' + items.map(function (item) {
            return '<li>' + escapeHtml(item) + '</li>';
        }).join('') + '</ul></section>';
    }
    function buildPrintLegendHtml() {
        return '<div class="scale-print-legend"><span><span class="scale-print-legend__swatch scale-print-legend__swatch--work"></span>Cobertura prevista</span><span><span class="scale-print-legend__swatch scale-print-legend__swatch--off"></span>Sem operação</span><span><span class="scale-print-legend__swatch scale-print-legend__swatch--holiday"></span>Feriado</span><span><span class="scale-print-legend__swatch scale-print-legend__swatch--deficit"></span>Ajuste</span></div>';
    }
    function buildPrintCalendarHtml(blockData, showLegend) {
        if (!blockData || !blockData.calendar || !blockData.calendar.days || !blockData.calendar.days.length) return '';
        var cal = blockData.calendar;
        var sim = blockData.simulation;
        var first = cal.days[0].iso.split('-').map(Number);
        var blanks = new Array(new Date(first[0], first[1] - 1, 1).getDay() + 1).join('<div class="scale-print-day scale-print-day--empty" aria-hidden="true"></div>');
        var daysHtml = cal.days.map(function (dayData) {
            var dayClass = dayData.deficit > 0 ? ' scale-print-day--deficit' : dayData.holiday ? ' scale-print-day--holiday' : dayData.operated ? ' scale-print-day--work' : ' scale-print-day--off';
            var label = dayData.deficit > 0 ? 'Ajuste' : dayData.holiday ? 'Feriado' : dayData.operated ? dayData.assigned.length + '/' + dayData.requiredAssignments : 'Sem operação';
            return '<div class="scale-print-day' + dayClass + '"><strong>' + dayData.day + '</strong><span>' + escapeHtml(label) + '</span></div>';
        }).join('');
        return '<section class="scale-print-section scale-print-section--avoid"><h3>Calendário da escala</h3><p class="scale-print-note">Cobertura: <strong>' + sim.coveragePct + '%</strong> • ' + sim.coveredDays + ' de ' + sim.operatedDays + ' dias completos.</p><div class="scale-print-calendar"><div class="scale-print-calendar__grid"><div class="scale-print-weekday">Dom</div><div class="scale-print-weekday">Seg</div><div class="scale-print-weekday">Ter</div><div class="scale-print-weekday">Qua</div><div class="scale-print-weekday">Qui</div><div class="scale-print-weekday">Sex</div><div class="scale-print-weekday">Sab</div>' + blanks + daysHtml + '</div>' + (showLegend ? buildPrintLegendHtml() : '') + '</div></section>';
    }
    function buildPrintHoursHtml(blockData) {
        if (!blockData || !blockData.calendar || !blockData.calendar.employees || !blockData.calendar.employees.length) return '';
        var cal = blockData.calendar;
        var rows = cal.employees.map(function (employee) {
            return '<tr><td>' + escapeHtml(employee) + '</td><td>' + escapeHtml(String(cal.stats.hours[employee])) + 'h</td><td>' + escapeHtml(String(cal.stats.assignments[employee])) + '</td></tr>';
        }).join('');
        return '<section class="scale-print-section scale-print-section--avoid"><h3>Horas por funcionário</h3><table class="scale-print-table"><thead><tr><th>Colaborador</th><th>Horas</th><th>Turnos</th></tr></thead><tbody>' + rows + '</tbody></table></section>';
    }
    function buildPrintSheet(config) {
        var result = STATE.lastResult;
        var sheet = byId('scale-print-sheet');
        if (!sheet || !result) return false;
        var isMatch = isScaleMatch(result);
        var user = result.userBlock;
        var userStatus = statusUi(user);
        var summaryLine = user.diasOperados + ' de ' + user.totalDias + ' dias operados • ' + user.coveragePlan.postos + ' posto(s) • ' + user.coveragePlan.colaboradoresNecessarios + ' colaborador(es) • ' + result.diasOperados.feriados + ' feriado(s) • ' + user.totalOperationHours.toLocaleString('pt-BR') + 'h de operação';
        var manager = config && config.managerName ? config.managerName.trim() : '';
        var logoHtml = config && config.companyLogoUrl ? '<img class="scale-print-company-logo" src="' + escapeAttribute(config.companyLogoUrl) + '" alt="Logo da empresa">' : '';
        var compareHtml = isMatch
            ? '<section class="scale-print-section scale-print-section--avoid"><h3>Escala ideal e aderente</h3><p class="scale-print-note">Sua escolha é a mais eficiente para este cenário operacional.</p><div class="scale-print-grid">' + buildPrintMetricHtml('Escala', user.scale.label) + buildPrintMetricHtml('Colaboradores necessários', String(user.coveragePlan.colaboradoresNecessarios)) + buildPrintMetricHtml('Referência do mês', formatHoursPerMonth(user.automaticHoursReference)) + buildPrintMetricHtml('Horas consideradas', formatHoursPerMonth(user.consideredHours)) + buildPrintMetricHtml('Cobertura estimada', user.coberturaPercentual + '%') + '</div><p class="scale-print-status"><strong>Configuração otimizada</strong> • ' + escapeHtml(userStatus.label) + '</p></section>'
            : '<section class="scale-print-section scale-print-section--avoid"><h3>Comparação rápida</h3><div class="scale-print-compare"><article class="scale-print-card"><span class="scale-print-kicker">Escala recomendada</span><strong>' + escapeHtml(result.suggestedScale.label) + '</strong><p>Recomendação do sistema para este cenário.</p></article><article class="scale-print-card"><span class="scale-print-kicker">Sua escolha</span><strong>' + escapeHtml(user.scale.label) + '</strong><p>Diferente da recomendação.</p></article></div></section><section class="scale-print-section scale-print-section--avoid"><h3>Detalhes da sua escolha</h3><div class="scale-print-grid">' + buildPrintMetricHtml('Colaboradores necessários', String(user.coveragePlan.colaboradoresNecessarios)) + buildPrintMetricHtml('Referência do mês', formatHoursPerMonth(user.automaticHoursReference)) + buildPrintMetricHtml('Horas consideradas', formatHoursPerMonth(user.consideredHours)) + buildPrintMetricHtml('Cobertura estimada', user.coberturaPercentual + '%') + buildPrintMetricHtml('Status', userStatus.label) + '</div><p class="scale-print-note">' + escapeHtml(user.restrictionSummary) + '</p></section>';
        var alternativesHtml = !isMatch && result.alternativas && result.alternativas.length
            ? '<section class="scale-print-section scale-print-section--avoid"><h3>Alternativas compatíveis</h3><p class="scale-print-note">' + escapeHtml(result.alternativas.map(function (item) { return item.label + ' (' + item.tag + ')'; }).join(' • ')) + '</p></section>'
            : '';
        var legalHtml = user.legalSummary ? '<section class="scale-print-section scale-print-section--avoid"><h3>Observação legal</h3><p class="scale-print-note">' + escapeHtml(user.legalSummary) + '</p></section>' : '';
        sheet.innerHTML = '<div class="print-header scale-print-header">' + logoHtml + '<div><p class="scale-print-kicker">Simulador de Escalas de Trabalho Online</p><p class="print-title">Relatório da simulação mensal</p><p class="scale-print-meta">' + escapeHtml(result.monthLabel) + '</p>' + (manager ? '<p class="scale-print-meta">Gestor/solicitante: ' + escapeHtml(manager) + '</p>' : '') + '</div></div><section class="scale-print-section scale-print-section--avoid"><h3>Resumo operacional</h3><p class="scale-print-note">' + escapeHtml(summaryLine) + '</p></section>' + compareHtml + buildPrintCalendarHtml(user, !config || config.showLegend !== false) + buildPrintHoursHtml(user) + alternativesHtml + buildPrintNotesHtml('Restrições e observações', listNotes(user)) + (!isMatch ? buildPrintNotesHtml('Observações da recomendação', listNotes(result.systemBlock)) : '') + legalHtml;
        sheet.setAttribute('aria-hidden', 'false');
        updatePrintTimestamp();
        return true;
    }
    function syncPrintLogoPreview() {
        var preview = byId('scale-print-logo-preview');
        if (!preview) return;
        preview.src = STATE.printConfig.companyLogoUrl || '';
        preview.classList.toggle('is-visible', !!STATE.printConfig.companyLogoUrl);
    }
    function closePrintModal() {
        var modal = byId('scale-print-modal');
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
    function openPrintModal() {
        var modal = byId('scale-print-modal');
        if (!modal) return;
        if (byId('scale-print-manager')) byId('scale-print-manager').value = STATE.printConfig.managerName || '';
        if (byId('scale-print-legend')) byId('scale-print-legend').checked = STATE.printConfig.showLegend !== false;
        syncPrintLogoPreview();
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        if (byId('scale-print-manager')) byId('scale-print-manager').focus();
    }
    function bindPrintModal() {
        var trigger = document.querySelector('.js-scale-print');
        var confirm = byId('scale-print-confirm');
        var logoInput = byId('scale-print-logo');
        if (trigger) {
            trigger.addEventListener('click', function (event) {
                event.preventDefault();
                openPrintModal();
            });
        }
        document.querySelectorAll('[data-scale-print-close]').forEach(function (element) {
            element.addEventListener('click', function () {
                closePrintModal();
            });
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && byId('scale-print-modal') && byId('scale-print-modal').classList.contains('is-open')) {
                closePrintModal();
            }
        });
        if (logoInput) {
            logoInput.addEventListener('change', function (event) {
                var file = event.target.files && event.target.files[0];
                if (!file) {
                    STATE.printConfig.companyLogoUrl = '';
                    syncPrintLogoPreview();
                    return;
                }
                if (!/^image\/(png|jpeg)$/i.test(file.type) || file.size > 2097152) {
                    STATE.printConfig.companyLogoUrl = '';
                    syncPrintLogoPreview();
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    STATE.printConfig.companyLogoUrl = String(loadEvent.target.result || '');
                    syncPrintLogoPreview();
                };
                reader.readAsDataURL(file);
            });
        }
        if (confirm) {
            confirm.addEventListener('click', function () {
                if (byId('scale-print-manager')) STATE.printConfig.managerName = byId('scale-print-manager').value.trim();
                if (byId('scale-print-legend')) STATE.printConfig.showLegend = !!byId('scale-print-legend').checked;
                if (!buildPrintSheet(STATE.printConfig)) {
                    announceResult('Calcule um cenário antes de imprimir.');
                    closePrintModal();
                    return;
                }
                closePrintModal();
                window.setTimeout(function () {
                    window.print();
                }, 40);
            });
        }
    }
    function bindAdBlockNotice() {
        var closeButton = byId('adblock-note-close');
        if (closeButton) {
            closeButton.addEventListener('click', function () {
                var note = byId('adblock-note');
                if (note) note.classList.remove('is-visible');
            });
        }
    }
    function detectAdBlock() {
        var bait = document.createElement('div');
        bait.className = 'adsbox textads banner-ads';
        bait.setAttribute('aria-hidden', 'true');
        bait.style.position = 'absolute';
        bait.style.left = '-9999px';
        bait.style.width = '1px';
        bait.style.height = '1px';
        document.body.appendChild(bait);
        window.setTimeout(function () {
            var blocked = !bait || bait.offsetHeight === 0 || bait.offsetParent === null;
            if (!blocked && window.getComputedStyle) {
                var computed = window.getComputedStyle(bait);
                blocked = computed.display === 'none' || computed.visibility === 'hidden';
            }
            if (bait && bait.parentNode) bait.parentNode.removeChild(bait);
            if (blocked && byId('adblock-note')) byId('adblock-note').classList.add('is-visible');
        }, 180);
    }
    function calculate() {
        var form = byId('sim-form');
        if (!service() || !form) return;
        if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
        setBusy(true);
        service().simulate(collectParams()).then(function (result) {
            renderResults(result);
        }).catch(function () {
            byId('sim-result').innerHTML = '<div class="card p-6 text-sm text-red-600" role="alert">Não foi possível gerar a simulação neste momento. Revise os campos e tente novamente.</div>';
            announceResult('Não foi possível gerar a simulação neste momento.');
        }).finally(function () {
            setBusy(false);
        });
    }
    function bindEvents() {
        var hoursField = byId('sim-monthly-hours');
        if (hoursField) {
            hoursField.addEventListener('focus', function () {
                if (!STATE.manualHoursDirty && parseHoursValue(hoursField.value) === STATE.referenceHours) {
                    hoursField.value = '';
                }
            });
            hoursField.addEventListener('blur', function () {
                var parsed = parseHoursValue(hoursField.value);
                if (!String(hoursField.value || '').trim()) {
                    STATE.manualHoursDirty = false;
                    if (STATE.referenceHours > 0) {
                        hoursField.value = formatHoursPerMonth(STATE.referenceHours);
                    }
                    queuePreviewRefresh();
                    return;
                }
                if (parsed > 0) {
                    hoursField.value = formatHoursPerMonth(parsed);
                }
                syncManualHoursState();
            });
        }
        ['change', 'input'].forEach(function (eventName) {
            byId('sim-form').addEventListener(eventName, function () {
                applyScaleLocks();
                queuePreviewRefresh();
            });
        });
        byId('sim-form').addEventListener('submit', function (event) {
            event.preventDefault();
            calculate();
        });
    }
    function parseTimeValue(raw, fallbackMinutes) {
        var match = /^(\d{2}):(\d{2})$/.exec(String(raw || '').trim());
        if (!match) return fallbackMinutes;
        var hours = Number(match[1]);
        var minutes = Number(match[2]);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return fallbackMinutes;
        return (hours * 60) + minutes;
    }
    function formatTimeValue(totalMinutes) {
        var safe = ((Number(totalMinutes) || 0) % 1440 + 1440) % 1440;
        var hours = Math.floor(safe / 60);
        var minutes = safe % 60;
        return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
    }
    function collectShiftInputs() {
        return queryShiftRows().map(function (row, index) {
            return {
                label: 'Turno ' + (index + 1),
                start: row.querySelector('[data-shift-start]') ? row.querySelector('[data-shift-start]').value : '',
                end: row.querySelector('[data-shift-end]') ? row.querySelector('[data-shift-end]').value : ''
            };
        });
    }
    function queryShiftRows() {
        return Array.prototype.slice.call(document.querySelectorAll('[data-shift-row]'));
    }
    function buildShiftSeeds(count, overlapEnabled) {
        var operationStart = parseTimeValue(byId('sim-operation-start') ? byId('sim-operation-start').value : '08:00', 8 * 60);
        var operationEnd = parseTimeValue(byId('sim-operation-end') ? byId('sim-operation-end').value : '17:00', 17 * 60);
        var safeEnd = operationEnd <= operationStart ? operationEnd + 1440 : operationEnd;
        var totalMinutes = Math.max(60, safeEnd - operationStart);
        var shiftCount = Math.max(1, Number(count) || 1);
        var slot = totalMinutes / shiftCount;
        var overlapMinutes = overlapEnabled && shiftCount > 1 ? Math.min(120, Math.max(30, Math.round(slot * 0.18))) : 0;
        var seeds = [];

        for (var index = 0; index < shiftCount; index += 1) {
            var start = Math.round(operationStart + (slot * index) - (index > 0 ? overlapMinutes : 0));
            var end = index === shiftCount - 1
                ? safeEnd
                : Math.round(operationStart + (slot * (index + 1)) + overlapMinutes);

            seeds.push({
                start: formatTimeValue(start),
                end: formatTimeValue(end)
            });
        }

        return seeds;
    }
    function initSelects() {
        var scaleSel = byId('sim-scale-type');
        var today = new Date();
        var nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
        var todayValue = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        var nextWeekValue = nextWeek.getFullYear() + '-' + String(nextWeek.getMonth() + 1).padStart(2, '0') + '-' + String(nextWeek.getDate()).padStart(2, '0');
        if (byId('sim-start-date') && !byId('sim-start-date').value) byId('sim-start-date').value = todayValue;
        if (byId('sim-end-date') && !byId('sim-end-date').value) byId('sim-end-date').value = nextWeekValue;
        if (scaleSel && scales() && !scaleSel.options.length) {
            scaleSel.innerHTML = '';
            scales().getGroupedScaleOptions().forEach(function (group) {
                var optgroup = document.createElement('optgroup');
                optgroup.label = group.label;
                group.scales.forEach(function (scale) {
                    var option = document.createElement('option');
                    option.value = scale.id;
                    option.textContent = scale.label;
                    optgroup.appendChild(option);
                });
                scaleSel.appendChild(optgroup);
            });
            scaleSel.value = '5x2';
        }
    }
    function syncProjectFields() {
        var isProject = getSimulationType() === 'project';
        var projectFields = byId('sim-project-fields');
        var note = byId('sim-scenario-note');
        if (projectFields) projectFields.classList.toggle('hidden', !isProject);
        if (byId('sim-start-date')) byId('sim-start-date').required = isProject;
        if (byId('sim-end-date')) byId('sim-end-date').required = isProject;
        setInlineNote(note, isProject ? 'Projeto temporario usa a data inicial e final reais.' : 'Operacao continua usa base padrao de 30 dias para a simulacao.', 'info');
    }
    function syncManualScaleVisibility() {
        var manualWrap = byId('sim-manual-scale-wrap');
        var manual = byId('sim-scale-manual') && byId('sim-scale-manual').checked;
        if (manualWrap) manualWrap.classList.toggle('hidden', !manual);
    }
    function syncShiftRows() {
        var container = byId('sim-shift-rows');
        var note = byId('sim-turn-note');
        if (!container) return;

        var count = Math.max(1, parseInt(byId('sim-shift-count') ? byId('sim-shift-count').value : '1', 10) || 1);
        var overlapEnabled = !!(byId('sim-overlap-yes') && byId('sim-overlap-yes').checked);
        var shouldRenderRows = count > 1 || overlapEnabled;
        var currentRows = collectShiftInputs();

        container.classList.toggle('hidden', !shouldRenderRows);
        if (!shouldRenderRows) {
            container.innerHTML = '';
            setInlineNote(note, 'Sem encontro de turnos, o sistema distribui a cobertura pelo intervalo principal informado.', 'info');
            return;
        }

        var seeds = currentRows.length === count
            ? currentRows
            : buildShiftSeeds(count, overlapEnabled);

        container.innerHTML = '';
        seeds.forEach(function (shift, index) {
            var row = document.createElement('div');
            row.className = 'turn-row';
            row.setAttribute('data-shift-row', String(index));
            row.innerHTML =
                '<span class="turn-row__label">Turno ' + (index + 1) + '</span>' +
                '<div class="grid grid-cols-2 gap-3">' +
                    '<label class="field-cluster"><span class="field-label__text text-sm font-semibold">Inicio</span><input type="time" class="input-field" data-shift-start value="' + escapeAttribute(shift.start || '08:00') + '"></label>' +
                    '<label class="field-cluster"><span class="field-label__text text-sm font-semibold">Fim</span><input type="time" class="input-field" data-shift-end value="' + escapeAttribute(shift.end || '17:00') + '"></label>' +
                '</div>';
            container.appendChild(row);
        });

        setInlineNote(note, overlapEnabled
            ? 'Informe os horarios reais dos turnos para medir a sobreposicao entre equipes.'
            : 'Voce pode ajustar os horarios de cada turno para refletir a operacao real, mesmo sem encontro.',
        overlapEnabled ? 'warning' : 'info');
    }
    function updateCoverageNote() {
        var saturday = !!(byId('sim-sat') && byId('sim-sat').checked);
        var sunday = !!(byId('sim-sun') && byId('sim-sun').checked);
        var holidays = !!(byId('sim-holidays') && byId('sim-holidays').checked);
        var note = byId('sim-coverage-note');
        var message = 'Informe apenas o que realmente entra na operacao.';
        var tone = 'info';

        if (saturday && sunday && holidays) {
            message = 'Cobertura completa aos fins de semana e feriados.';
        } else if (saturday && !sunday) {
            message = 'Cenario com sabado ativo e domingo fora da operacao.';
        } else if (!saturday && sunday) {
            message = 'Cobertura so no domingo: valide se esse padrao e real para a operacao.';
            tone = 'warning';
        } else if (!saturday && !sunday && holidays) {
            message = 'Feriados entram, mas o fim de semana fica fora da operacao.';
            tone = 'warning';
        }

        if (STATE.lastPreview && STATE.lastPreview.compatibility && STATE.lastPreview.compatibility.code === 'baixa') {
            message = 'Combinacao simulavel, mas com aderencia baixa para a escala natural sugerida.';
            tone = 'warning';
        }

        if (STATE.lastPreview && STATE.lastPreview.compatibility && STATE.lastPreview.compatibility.code === 'incompativel') {
            message = 'A cobertura informada sai do padrao natural da escala para este tipo de operacao.';
            tone = 'warning';
        }

        setInlineNote(note, message, tone);
    }
    function updateSuggestNote() {
        var suggest = byId('sim-scale-suggest-note');
        if (!suggest) return;
        var manual = byId('sim-scale-manual') && byId('sim-scale-manual').checked;
        var scale = scales() && STATE.suggestedScale ? scales().getScale(STATE.suggestedScale) : null;
        if (manual) {
            suggest.style.display = 'block';
            suggest.textContent = scale ? 'Sugestao atual do sistema: ' + scale.label + '. Compare com a opcao manual abaixo.' : 'Selecione uma escala manual para comparar com a leitura do sistema.';
            return;
        }
        suggest.style.display = 'block';
        suggest.textContent = scale ? 'Escala sugerida no momento: ' + scale.label + '.' : 'O sistema definira automaticamente a escala mais aderente.';
    }
    function applyScaleLocks() {
        syncProjectFields();
        syncManualScaleVisibility();
        syncShiftRows();
        updateCoverageNote();
        updateSuggestNote();
    }
    function collectParams(hoursOverride) {
        return {
            simulationType: getSimulationType(),
            startDate: byId('sim-start-date') ? byId('sim-start-date').value : '',
            endDate: byId('sim-end-date') ? byId('sim-end-date').value : '',
            scaleChoice: getScaleChoice(),
            postos: Math.max(1, parseInt(byId('sim-postos') ? byId('sim-postos').value : '1', 10) || 1),
            operationStart: byId('sim-operation-start') ? byId('sim-operation-start').value : '08:00',
            operationEnd: byId('sim-operation-end') ? byId('sim-operation-end').value : '17:00',
            shiftCount: Math.max(1, parseInt(byId('sim-shift-count') ? byId('sim-shift-count').value : '1', 10) || 1),
            hasOverlap: !!(byId('sim-overlap-yes') && byId('sim-overlap-yes').checked),
            shifts: collectShiftInputs(),
            worksSaturday: !!(byId('sim-sat') && byId('sim-sat').checked),
            worksSunday: !!(byId('sim-sun') && byId('sim-sun').checked),
            worksHolidays: !!(byId('sim-holidays') && byId('sim-holidays').checked),
            hoursOverride: Number(hoursOverride) > 0 ? Number(hoursOverride) : 0
        };
    }
    function refreshPreview() {
        if (!service()) return Promise.resolve();
        return service().previewAutomaticHours(collectParams(0)).then(function (preview) {
            STATE.lastPreview = preview;
            STATE.suggestedScale = preview.scale;
            updateCoverageNote();
            updateSuggestNote();
        }).catch(function () {
            STATE.lastPreview = null;
            STATE.suggestedScale = null;
            updateCoverageNote();
            updateSuggestNote();
        });
    }
    function queuePreviewRefresh() {
        window.clearTimeout(STATE.previewTimer);
        STATE.previewTimer = window.setTimeout(function () {
            refreshPreview();
        }, 140);
    }
    function buildScenarioSummaryList(result) {
        var scenario = result.scenarioSummary || {};
        var items = [
            { label: 'Periodo', value: scenario.periodLabel || result.monthLabel || '-' },
            { label: 'Horario da operacao', value: scenario.operationWindowLabel || '-' },
            { label: 'Pessoas simultaneas', value: String(scenario.simultaneousPeople || result.postos || 0) },
            { label: 'Quantidade de turnos', value: String(scenario.shiftCount || 1) },
            { label: 'Encontro de turnos', value: scenario.hasOverlap ? 'Sim (' + formatHours(scenario.overlapHours || 0) + ')' : 'Nao' },
            { label: 'Sabado, domingo e feriados', value: scenario.coverageLabel || '-' }
        ];

        if (scenario.shiftLines && scenario.shiftLines.length) {
            items.push({ label: 'Turnos informados', value: scenario.shiftLines.join(' | ') });
        }

        return items.map(function (item) {
            return '<div class="sim-summary-item"><strong>' + escapeHtml(item.label) + '</strong><span>' + escapeHtml(item.value) + '</span></div>';
        }).join('');
    }
    function executiveMetric(label, value, className) {
        return '<article class="executive-card__metric' + (className ? ' ' + className : '') + '"><span class="executive-card__metric-label">' + escapeHtml(label) + '</span><div class="executive-card__metric-value">' + value + '</div></article>';
    }
    function formatOperatingFlag(value) {
        return value ? 'sim' : 'não';
    }
    function pluralize(count, singular, plural) {
        return Number(count) === 1 ? singular : plural;
    }
    function buildExecutiveSummaryLine(result) {
        var scenario = result.scenarioSummary || {};
        var postos = Number(scenario.simultaneousPeople || result.postos || 0);
        var turnos = Number(scenario.shiftCount || 1);

        return (scenario.operationWindowLabel || '-') +
            ' • ' + postos + ' ' + pluralize(postos, 'posto', 'postos') +
            ' • ' + turnos + ' ' + pluralize(turnos, 'turno', 'turnos') +
            ' • sábado: ' + formatOperatingFlag(!!scenario.worksSaturday) +
            ' • domingo: ' + formatOperatingFlag(!!scenario.worksSunday) +
            ' • feriados: ' + formatOperatingFlag(!!scenario.worksHolidays);
    }
    function renderExecutiveCard(result) {
        var userBlock = result.userBlock;
        var userStatus = statusUi(userBlock);
        var card = document.createElement('section');
        card.className = 'card p-5 executive-card';
        card.innerHTML =
            '<div class="executive-card__header">' +
                '<div><p class="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-1">RESULTADO</p><h3 class="font-bold text-lg">Resumo operacional</h3></div>' +
            '</div>' +
            '<div class="executive-card__grid">' +
                executiveMetric('Escala recomendada', '<span class="executive-card__text-value">' + escapeHtml(result.suggestedScale.label) + '</span>', 'executive-card__metric--highlight') +
                executiveMetric('Status', '<span class="status-badge ' + userStatus.badgeClass + '">' + userStatus.icon + escapeHtml(userStatus.label) + '</span>', 'executive-card__metric--status') +
                executiveMetric('Colaboradores necessários', '<span class="executive-card__text-value">' + escapeHtml(String(userBlock.coveragePlan.colaboradoresNecessarios)) + '</span>') +
                executiveMetric('Horas por colaborador', '<span class="executive-card__text-value">' + escapeHtml(formatCompactHoursPerMonth(userBlock.consideredHours)) + '</span>') +
            '</div>' +
            '<p class="executive-card__summary-line"><strong>Operação:</strong> ' + escapeHtml(buildExecutiveSummaryLine(result)) + '</p>';
        return card;
    }
    function renderHoursAdjustPanel(result) {
        var block = result.userBlock;
        var wrapper = document.createElement('div');
        var step = 1;
        var currentHours = Number(block.consideredHours || block.automaticHoursReference || 0);
        var referenceHours = Number(block.automaticHoursReference || 0);
        wrapper.className = 'result-hours-adjust';
        wrapper.innerHTML =
            '<div class="result-section-title">' +
                '<div><p class="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-1">Ajuste de jornada por colaborador</p><h3 class="font-bold text-base">Horas por colaborador consideradas</h3></div>' +
            '</div>' +
            '<p class="result-hours-adjust__status">Referência sugerida: <strong>' + escapeHtml(formatCompactHoursPerMonth(referenceHours)) + '</strong>. Ajuste para testar variações do quadro mínimo.</p>' +
            '<div class="result-hours-adjust__controls">' +
                '<button type="button" class="btn-secondary" data-result-hours-step="-1">- ' + step + 'h</button>' +
                '<input id="sim-result-hours-input" class="input-field result-hours-adjust__input" type="number" min="1" step="' + step + '" value="' + escapeAttribute(String(Number(currentHours.toFixed(1)))) + '">' +
                '<button type="button" class="btn-secondary" data-result-hours-step="1">+ ' + step + 'h</button>' +
            '</div>' +
            '<div class="flex flex-wrap gap-2">' +
                '<button type="button" class="btn-primary" data-result-hours-apply>Aplicar ajuste</button>' +
                '<button type="button" class="btn-secondary" data-result-hours-reset>Voltar ao sugerido</button>' +
            '</div>' +
            '<p class="result-hours-adjust__status">' + escapeHtml(block.hoursComparison.detailMessage) + '</p>';
        return wrapper;
    }
    function renderNotesPanel(result) {
        var block = result.userBlock || {};
        var notes = listNotes(block);
        var hasAlerts = !!(block.alertas && block.alertas.length);
        var icon = hasAlerts ? '<span class="text-amber-500">&#9888;</span>' : '<span class="text-blue-600">i</span>';

        if (!notes.length && !block.legalSummary) return null;

        var panel = document.createElement('section');
        panel.className = 'card p-5';
        panel.innerHTML =
            '<div class="result-section-title">' +
                '<div><p class="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-1">Observações / alertas</p><h3 class="font-bold text-base">' + (hasAlerts ? 'Alertas e observações' : 'Observações') + '</h3></div>' +
            '</div>';

        if (notes.length) {
            var list = document.createElement('ul');
            list.className = 'reason-list';
            notes.forEach(function (item) {
                var li = document.createElement('li');
                li.innerHTML = '<span class="reason-icon">' + icon + '</span><span>' + escapeHtml(item) + '</span>';
                list.appendChild(li);
            });
            panel.appendChild(list);
        }

        if (block.legalSummary && notes.indexOf(block.legalSummary) === -1) {
            var foot = document.createElement('p');
            foot.className = 'result-notes__foot';
            foot.textContent = block.legalSummary;
            panel.appendChild(foot);
        }

        return panel;
    }
    function renderComplementaryDetails(result) {
        if (result.selectedIsSuggested) return null;

        var block = result.userBlock;
        var panel = document.createElement('section');
        panel.className = 'card p-5';
        panel.innerHTML =
            '<div class="result-section-title">' +
                '<div><p class="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-1">Detalhes complementares</p><h3 class="font-bold text-base">Simulação aplicada</h3></div>' +
            '</div>' +
            '<div class="sim-summary-list">' +
                '<div class="sim-summary-item"><strong>Escala simulada</strong><span>' + escapeHtml(block.scale.label) + '</span></div>' +
                '<div class="sim-summary-item"><strong>Colaboradores na simulação</strong><span>' + escapeHtml(String(block.coveragePlan.colaboradoresNecessarios)) + '</span></div>' +
                '<div class="sim-summary-item"><strong>Horas consideradas</strong><span>' + escapeHtml(formatCompactHoursPerMonth(block.consideredHours)) + '</span></div>' +
                '<div class="sim-summary-item"><strong>Cobertura estimada</strong><span>' + escapeHtml(block.coberturaPercentual + '%') + '</span></div>' +
            '</div>' +
            '<p class="help-copy mt-3">O ajuste de jornada e o calendário acima seguem a escala simulada manualmente.</p>';

        if (result.alternativas && result.alternativas.length) {
            var alternatives = document.createElement('div');
            alternatives.className = 'mt-3';
            alternatives.innerHTML = '<p class="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">Outras alternativas</p>';
            result.alternativas.forEach(function (item) {
                var chip = document.createElement('span');
                chip.className = 'alt-chip mr-1';
                chip.textContent = item.label + ' • ' + item.tag;
                chip.setAttribute('aria-label', item.label + ', ' + item.tag);
                alternatives.appendChild(chip);
            });
            panel.appendChild(alternatives);
        }

        return panel;
    }
    function bindResultHoursAdjusters() {
        var input = byId('sim-result-hours-input');
        if (!input) return;
        document.querySelectorAll('[data-result-hours-step]').forEach(function (button) {
            button.addEventListener('click', function () {
                var delta = Number(button.getAttribute('data-result-hours-step') || 0);
                var nextValue = Math.max(1, (Number(input.value) || 0) + delta);
                input.value = String(Number(nextValue.toFixed(1)));
            });
        });
        var applyButton = document.querySelector('[data-result-hours-apply]');
        if (applyButton) {
            applyButton.addEventListener('click', function () {
                calculate(Number(input.value) || 0, true);
            });
        }
        var resetButton = document.querySelector('[data-result-hours-reset]');
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                STATE.resultHoursOverride = 0;
                calculate(0, true);
            });
        }
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                calculate(Number(input.value) || 0, true);
            }
        });
    }
    function renderBlock(result, blockData, system, options) {
        options = options || {};
        var ui = statusUi(blockData);
        var block = document.createElement('div');
        var variantClass = options.variantClass || (system ? 'result-block--system' : 'result-block--user');
        var title = options.title || (system ? 'Escala mais indicada' : 'Sua escolha');
        var subtitle = options.subtitle || (system ? 'Recomendacao do sistema para este cenario.' : 'Detalhes da escala selecionada.');
        var color = options.color || (system ? 'rgb(29,78,216)' : 'rgb(21,128,61)');
        block.className = 'result-block ' + variantClass;
        block.innerHTML =
            '<div class="result-block__header"><div class="flex-1"><p class="font-bold text-sm" style="color:' + color + '">' + escapeHtml(title) + '</p><p class="text-xs text-surface-500">' + escapeHtml(subtitle) + '</p></div><span class="status-badge ' + ui.badgeClass + '">' + ui.icon + escapeHtml(ui.label) + '</span></div>';

        var body = document.createElement('div');
        body.className = 'result-block__body';
        body.innerHTML =
            '<div class="metric-grid">' +
                metricCard(escapeHtml(blockData.scale.label), system ? 'Escala sugerida' : 'Escala avaliada') +
                metricCard(String(blockData.coveragePlan.postos), 'Postos a cobrir') +
                metricCard(String(blockData.coveragePlan.colaboradoresNecessarios), 'Colaboradores necessarios', 'result-headcount') +
                metricCard(String(blockData.coveragePlan.colaboradoresPorPosto), 'Por posto') +
                metricCard(formatHoursPerMonth(blockData.automaticHoursReference), 'Referencia da escala') +
                metricCard(formatHoursPerMonth(blockData.consideredHours), 'Horas consideradas') +
                metricCard(String(blockData.coveragePlan.quadroPadrao), 'Quadro padrao') +
                metricCard(String(blockData.coveragePlan.quadroPorHoras), 'Quadro por horas') +
            '</div>';
        body.appendChild(coverageBox(blockData));
        if (options.summaryText) {
            var summary = document.createElement('p');
            summary.className = 'text-sm text-surface-600 dark:text-surface-400 mb-4';
            summary.textContent = options.summaryText;
            body.appendChild(summary);
        }
        var notesBlock = listBlock(system ? 'Observacoes' : 'Restricoes e alertas', listNotes(blockData), system ? 'text-surface-700 dark:text-surface-200' : 'text-amber-700 dark:text-amber-300', system ? '<span class="text-blue-600">i</span>' : '<span class="text-amber-500">&#9888;</span>');
        if (notesBlock) body.appendChild(notesBlock);
        if (blockData.legalSummary) {
            var legal = document.createElement('div');
            legal.className = 'legal-note';
            legal.textContent = blockData.legalSummary;
            body.appendChild(legal);
        }
        block.appendChild(body);
        hydrateTooltipSlots(block);
        return block;
    }
    function updateHowBlock(result) {
        if (!byId('sim-how-summary') || !byId('sim-how-list')) return;
        var scenario = result.scenarioSummary || {};
        byId('sim-how-summary').textContent = 'A leitura parte da operacao real, cruza cobertura, escala e horas por colaborador.';
        byId('sim-how-list').innerHTML = [
            'Periodo analisado: ' + (scenario.periodLabel || result.monthLabel) + '.',
            'Turnos e sobreposicao alteram a carga diaria e o quadro minimo.',
            'Referencia da escala: ' + formatHoursPerMonth(result.userBlock.automaticHoursReference) + ' • Horas consideradas: ' + formatHoursPerMonth(result.userBlock.consideredHours) + '.',
            'Postos: ' + result.userBlock.coveragePlan.postos + ' • Colaboradores necessarios: ' + result.userBlock.coveragePlan.colaboradoresNecessarios + '.'
        ].map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('');
    }
    function renderResults(result) {
        var container = byId('sim-result');
        STATE.lastResult = result;
        container.innerHTML = '';
        var wrap = document.createElement('div');
        wrap.className = 'space-y-5';
        wrap.appendChild(renderExecutiveCard(result));
        wrap.appendChild(renderHoursAdjustPanel(result));
        wrap.appendChild(renderCalendar(result, result.userBlock));
        var notesPanel = renderNotesPanel(result);
        if (notesPanel) wrap.appendChild(notesPanel);
        var detailsPanel = renderComplementaryDetails(result);
        if (detailsPanel) wrap.appendChild(detailsPanel);
        container.appendChild(wrap);
        updateHowBlock(result);
        bindResultHoursAdjusters();
        hydrateTooltipSlots(container);
        syncAdSlots();
        buildPrintSheet(STATE.printConfig);
        announceResult('Resultado atualizado. Escala recomendada: ' + result.suggestedScale.label + '. Status: ' + result.userBlock.status.label + '.');
    }
    function calculate(hoursOverride, useStoredParams) {
        var form = byId('sim-form');
        if (!service() || !form) return;
        if (!useStoredParams && typeof form.reportValidity === 'function' && !form.reportValidity()) return;

        if (!useStoredParams) {
            STATE.lastParams = collectParams(0);
            STATE.resultHoursOverride = 0;
        }

        var baseParams = STATE.lastParams || collectParams(0);
        var nextOverride = Number(hoursOverride);
        if (useStoredParams) {
            STATE.resultHoursOverride = nextOverride > 0 ? nextOverride : 0;
        }

        var params = Object.assign({}, baseParams, {
            hoursOverride: STATE.resultHoursOverride > 0 ? STATE.resultHoursOverride : 0
        });

        setBusy(true);
        service().simulate(params).then(function (result) {
            renderResults(result);
        }).catch(function () {
            byId('sim-result').innerHTML = '<div class="card p-6 text-sm text-red-600" role="alert">Nao foi possivel gerar a simulacao neste momento. Revise os campos e tente novamente.</div>';
            announceResult('Nao foi possivel gerar a simulacao neste momento.');
        }).finally(function () {
            setBusy(false);
        });
    }
    function bindEvents() {
        var form = byId('sim-form');
        if (!form) return;
        ['change', 'input'].forEach(function (eventName) {
            form.addEventListener(eventName, function (event) {
                if (event.target && (event.target.id === 'sim-shift-count' || event.target.id === 'sim-overlap-no' || event.target.id === 'sim-overlap-yes' || event.target.id === 'sim-operation-start' || event.target.id === 'sim-operation-end')) {
                    syncShiftRows();
                }
                applyScaleLocks();
                queuePreviewRefresh();
            });
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            calculate();
        });
    }
    document.addEventListener('DOMContentLoaded', function () {
        if (!byId('sim-form')) return;
        initSelects();
        initMobileMenuState();
        initAdSlots();
        bindAdBlockNotice();
        bindPrintModal();
        hydrateTooltipSlots(document);
        applyScaleLocks();
        bindEvents();
        detectAdBlock();
        refreshPreview().then(calculate);
    });
})();
