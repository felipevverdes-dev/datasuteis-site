(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const ui = simulator.ui = simulator.ui || {};
    const formRules = ui.formRules;
    const labels = ui.labels || {};
    const service = simulator.services && simulator.services.simulator;

    function byId(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function formatHours(value) {
        return (Number(value) || 0).toLocaleString('pt-BR', {
            maximumFractionDigits: 1,
            minimumFractionDigits: Math.abs((Number(value) || 0) % 1) > 0.001 ? 1 : 0
        }) + ' h';
    }

    function metricCard(label, value, tooltip) {
        return (
            '<article class="ag-metric-card">' +
                '<div class="ag-metric-label">' +
                    '<span>' + escapeHtml(label) + '</span>' +
                    '<span class="ag-metric-tip" title="' + escapeHtml(tooltip || '') + '" aria-label="' + escapeHtml(tooltip || '') + '">i</span>' +
                '</div>' +
                '<strong class="ag-metric-value">' + escapeHtml(value) + '</strong>' +
            '</article>'
        );
    }

    function tagClass(tag) {
        if (tag === 'Mais indicada') return 'ag-tag ag-tag--primary';
        if (tag === 'Alternativa compatível') return 'ag-tag ag-tag--success';
        return 'ag-tag ag-tag--warning';
    }

    function statusClass(code) {
        if (code === 'ok') return 'ag-badge ag-badge--ok';
        if (code === 'warning') return 'ag-badge ag-badge--warning';
        return 'ag-badge ag-badge--danger';
    }

    function compatibilityClass(code) {
        if (code === 'alta' || code === 'media') return 'ag-badge ag-badge--ok';
        if (code === 'baixa') return 'ag-badge ag-badge--warning';
        return 'ag-badge ag-badge--danger';
    }

    function renderListCard(title, items, toneClass) {
        if (!items || !items.length) return '';

        return (
            '<section class="card p-5">' +
                '<h3 class="font-bold text-base mb-3">' + escapeHtml(title) + '</h3>' +
                '<ul class="ag-list ' + escapeHtml(toneClass || '') + '">' +
                    items.map(function (item) {
                        return '<li>' + escapeHtml(item) + '</li>';
                    }).join('') +
                '</ul>' +
            '</section>'
        );
    }

    function renderCalendar(calendar) {
        if (!calendar || !calendar.days || !calendar.days.length) return '';

        const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const firstParts = calendar.days[0].iso.split('-').map(Number);
        const firstDate = new Date(firstParts[0], firstParts[1] - 1, firstParts[2]);
        const offset = firstDate.getDay();
        let cells = weekdayLabels.map(function (label) {
            return '<div class="ag-cal-head">' + label + '</div>';
        }).join('');

        for (let index = 0; index < offset; index++) {
            cells += '<div class="ag-cal-empty"></div>';
        }

        calendar.days.forEach(function (day) {
            const dayClass = day.deficit > 0
                ? 'ag-cal-day ag-cal-day--deficit'
                : day.operated
                    ? day.holiday
                        ? 'ag-cal-day ag-cal-day--holiday'
                        : 'ag-cal-day ag-cal-day--operated'
                    : 'ag-cal-day ag-cal-day--off';

            const assigned = day.assigned.slice(0, 4).map(function (employee) {
                return '<span class="ag-emp-tag">' + escapeHtml(employee) + '</span>';
            }).join('');

            const more = day.assigned.length > 4
                ? '<span class="ag-emp-tag ag-emp-tag--muted">+' + (day.assigned.length - 4) + '</span>'
                : '';

            cells += (
                '<article class="' + dayClass + '">' +
                    '<div class="ag-cal-daynum">' + day.day + '</div>' +
                    '<div class="ag-cal-sub">' + (day.operated ? day.assigned.length + '/' + day.requiredAssignments : 'Folga') + '</div>' +
                    '<div class="ag-cal-tags">' + assigned + more + '</div>' +
                    (day.deficit > 0 ? '<div class="ag-cal-alert">Déficit</div>' : '') +
                '</article>'
            );
        });

        return (
            '<section class="card p-5">' +
                '<div class="flex items-start justify-between gap-3 mb-3">' +
                    '<div>' +
                        '<h3 class="font-bold text-base">Calendário operacional</h3>' +
                        '<p class="help-copy">Visual resumido da distribuição estimada da equipe no mês.</p>' +
                    '</div>' +
                '</div>' +
                '<div class="ag-calendar-grid">' + cells + '</div>' +
                '<div class="ag-legend">' +
                    '<span><i class="ag-legend-box ag-legend-box--operated"></i>Dia operado</span>' +
                    '<span><i class="ag-legend-box ag-legend-box--off"></i>Sem operação</span>' +
                    '<span><i class="ag-legend-box ag-legend-box--holiday"></i>Feriado</span>' +
                    '<span><i class="ag-legend-box ag-legend-box--deficit"></i>Ajuste manual</span>' +
                '</div>' +
            '</section>'
        );
    }

    function renderResult(result) {
        const container = byId('ag-scale-result');
        if (!container) return;

        const suggestionBanner = !result.selectedIsSuggested
            ? (
                '<section class="card p-5 ag-highlight-card">' +
                    '<div class="flex items-start justify-between gap-3 flex-wrap">' +
                        '<div>' +
                            '<p class="text-xs font-semibold uppercase tracking-wide ag-highlight-kicker">Mais indicada</p>' +
                            '<h3 class="font-bold text-lg">' + escapeHtml(result.suggestedScale.label) + '</h3>' +
                            '<p class="help-copy mt-1">A escala escolhida continua simulada abaixo, mas este cenário ficou mais aderente com a sugestão automática.</p>' +
                        '</div>' +
                        '<span class="' + tagClass('Mais indicada') + '">Mais indicada</span>' +
                    '</div>' +
                '</section>'
            )
            : '';

        const alternatives = result.alternativas && result.alternativas.length
            ? (
                '<section class="card p-5">' +
                    '<h3 class="font-bold text-base mb-3">Alternativas</h3>' +
                    '<div class="flex flex-wrap gap-2">' +
                        result.alternativas.map(function (item) {
                            return '<span class="' + tagClass(item.tag) + '">' + escapeHtml(item.label) + ' • ' + escapeHtml(item.tag) + '</span>';
                        }).join('') +
                    '</div>' +
                '</section>'
            )
            : '';

        container.innerHTML = (
            '<div class="space-y-5">' +
                '<section class="card p-5 ag-summary-card">' +
                    '<div class="flex items-start justify-between gap-4 flex-wrap">' +
                        '<div>' +
                            '<p class="ag-kicker">' + escapeHtml(result.monthLabel) + ' — ' + result.diasOperados.operados + ' de ' + result.diasOperados.total + ' dias operados</p>' +
                            '<h2 class="font-bold text-xl mt-1">' + escapeHtml(result.selectedScale.label) + '</h2>' +
                            '<p class="help-copy mt-2">' + escapeHtml(result.holidaySummary) + '</p>' +
                        '</div>' +
                        '<div class="flex flex-wrap gap-2">' +
                            '<span class="' + statusClass(result.status.code) + '">' + escapeHtml(result.status.label) + '</span>' +
                            '<span class="' + compatibilityClass(result.compatibilidade.code) + '">' + escapeHtml(result.compatibilidade.label) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<p class="ag-summary-text">' + escapeHtml(result.explicacaoCurta) + '</p>' +
                '</section>' +
                suggestionBanner +
                '<section class="card p-5">' +
                    '<div class="ag-metric-grid">' +
                        metricCard('Quadro mínimo', result.quadroMinimo + ' profissionais', labels.metricTooltips && labels.metricTooltips.quadroMinimo) +
                        metricCard('Horas estimadas', formatHours(result.horasEstimadasPorFuncionario), labels.metricTooltips && labels.metricTooltips.horasEstimadas) +
                        metricCard('Cobertura', result.cobertura.percentual + '%', labels.metricTooltips && labels.metricTooltips.cobertura) +
                        metricCard('Compatibilidade', result.compatibilidade.label, labels.metricTooltips && labels.metricTooltips.compatibilidade) +
                    '</div>' +
                '</section>' +
                '<section class="card p-5">' +
                    '<h3 class="font-bold text-base mb-2">' + escapeHtml(labels.howTitle || 'Como esta estimativa foi montada') + '</h3>' +
                    '<p class="text-sm leading-relaxed text-surface-600 dark:text-surface-300">' + escapeHtml(result.buildSummary) + '</p>' +
                    '<div class="ag-justification-grid mt-4">' +
                        '<span class="ag-mini-pill">Cobertura compatível com a escala selecionada</span>' +
                        '<span class="ag-mini-pill">Revezamento necessário entre equipes</span>' +
                        '<span class="ag-mini-pill">Quadro calculado pelo padrão da jornada</span>' +
                        '<span class="ag-mini-pill">Distribuição ajustada aos dias operados do período</span>' +
                    '</div>' +
                    '<p class="help-copy mt-4">' + escapeHtml(labels.howDisclaimer || '') + '</p>' +
                '</section>' +
                renderListCard('Alertas operacionais e legais', result.alertas, 'ag-list--alert') +
                renderListCard('Observações resumidas', result.observacoes, 'ag-list--neutral') +
                '<section class="card p-5">' +
                    '<h3 class="font-bold text-base mb-2">Leitura rápida</h3>' +
                    '<p class="text-sm text-surface-600 dark:text-surface-300 mb-3">' + escapeHtml(result.cobertura.label) + '</p>' +
                    '<p class="text-sm text-surface-600 dark:text-surface-300 mb-2">' + escapeHtml(result.restrictionSummary) + '</p>' +
                    '<p class="text-xs text-surface-500">' + escapeHtml(result.legalSummary) + '</p>' +
                '</section>' +
                alternatives +
                renderCalendar(result.calendar) +
            '</div>'
        );
    }

    function renderError(message) {
        const container = byId('ag-scale-result');
        if (!container) return;
        container.innerHTML = (
            '<section class="card p-5">' +
                '<p class="text-sm text-red-600">' + escapeHtml(message) + '</p>' +
            '</section>'
        );
    }

    async function refreshAutomaticHours(form) {
        if (!service) return;

        try {
            const preview = await service.previewAutomaticHours(formRules.readForm(form));
            formRules.setAutomaticHours(form, preview.hours);
            const holidayCounter = byId('ag-holiday-counter');
            if (holidayCounter) {
                holidayCounter.textContent = 'Feriados no período: ' + preview.holidays.count;
            }
        } catch (error) {
            formRules.setAutomaticHours(form, 0);
        }
    }

    async function submitForm(form) {
        const button = byId('ag-submit');
        if (button) button.disabled = true;

        try {
            const result = await service.simulate(formRules.readForm(form));
            renderResult(result);
        } catch (error) {
            renderError('Não foi possível montar a estimativa neste momento.');
        } finally {
            if (button) button.disabled = false;
        }
    }

    function initScalePage() {
        const form = byId('ag-scale-form');
        if (!form || !service || !formRules) return;

        formRules.initForm(form, function () {
            refreshAutomaticHours(form);
        });

        refreshAutomaticHours(form);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            submitForm(form);
        });

        submitForm(form);
    }

    document.addEventListener('DOMContentLoaded', initScalePage);
})(typeof window !== 'undefined' ? window : globalThis);
