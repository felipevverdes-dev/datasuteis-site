(function () {
    'use strict';

    var MONTH_FMT = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
    var WDAY_FMT = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
    var STATE = {
        holidaysSet: new Set(),
        holidaysList: []
    };

    var WDAY_LABELS = (function () {
        var ref = new Date(2026, 0, 4);
        var labels = [];
        for (var index = 0; index < 7; index++) {
            var date = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + index);
            var label = WDAY_FMT.format(date).replace('.', '');
            labels.push(label.charAt(0).toUpperCase() + label.slice(1));
        }
        return labels;
    })();

    function byId(id) {
        return document.getElementById(id);
    }

    function monthName(month) {
        var label = MONTH_FMT.format(new Date(2026, month - 1, 1));
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    function formatHours(value) {
        var amount = Number(value) || 0;
        var hasDecimal = Math.abs(amount % 1) > 0.001;
        return amount.toLocaleString('pt-BR', {
            minimumFractionDigits: hasDecimal ? 1 : 0,
            maximumFractionDigits: 1
        }) + 'h';
    }

    function metricCard(value, label) {
        return '<div class="metric-card">' +
            '<div class="metric-card__value">' + value + '</div>' +
            '<div class="metric-card__label">' + label + '</div>' +
        '</div>';
    }

    function getStatusUi(status) {
        if (status === 'recomendado') {
            return {
                badgeClass: 'status-ok',
                label: 'Recomendado',
                icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>'
            };
        }

        if (status === 'possivel') {
            return {
                badgeClass: 'status-ok',
                label: 'Possivel',
                icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>'
            };
        }

        if (status === 'possivel_com_restricoes' || status === 'nao_recomendado') {
            return {
                badgeClass: 'status-obs',
                label: status === 'nao_recomendado' ? 'Nao recomendado' : 'Possivel com restricoes',
                icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>'
            };
        }

        return {
            badgeClass: 'status-no',
            label: 'Nao possivel',
            icon: '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>'
        };
    }

    function createListBlock(title, items, toneClass, iconHtml) {
        if (!items || !items.length) return null;

        var wrap = document.createElement('div');
        wrap.className = 'mb-4';
        wrap.innerHTML = '<p class="text-sm font-semibold mb-2 ' + toneClass + '">' + title + '</p>';

        var list = document.createElement('ul');
        list.className = 'reason-list';

        items.forEach(function (item) {
            var li = document.createElement('li');
            li.innerHTML =
                '<span class="reason-icon">' + iconHtml + '</span>' +
                '<span>' + item + '</span>';
            list.appendChild(li);
        });

        wrap.appendChild(list);
        return wrap;
    }

    function createCoverageBox(status, detail) {
        var toneMap = {
            ok: 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100',
            obs: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
            not_possible: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
        };
        var box = document.createElement('div');
        box.className = 'mb-4 p-3 rounded-lg border ' + (toneMap[status.code] || toneMap.obs);
        box.innerHTML =
            '<p class="text-xs font-semibold uppercase tracking-wide mb-1">Status da cobertura</p>' +
            '<p class="text-sm font-semibold mb-1">' + status.label + '</p>' +
            '<p class="text-sm">' + detail + '</p>';
        return box;
    }

    function initSelects() {
        var monthSel = byId('sim-month-select');
        var yearSel = byId('sim-year-select');
        var now = new Date();

        for (var month = 0; month < 12; month++) {
            var monthOption = document.createElement('option');
            monthOption.value = month + 1;
            monthOption.textContent = monthName(month + 1);
            if (month === now.getMonth()) monthOption.selected = true;
            monthSel.appendChild(monthOption);
        }

        for (var year = now.getFullYear() - 1; year <= now.getFullYear() + 2; year++) {
            var yearOption = document.createElement('option');
            yearOption.value = year;
            yearOption.textContent = year;
            if (year === now.getFullYear()) yearOption.selected = true;
            yearSel.appendChild(yearOption);
        }
    }

    function initTheme() {
        var button = byId('theme-toggle');
        if (!button) return;

        button.addEventListener('click', function () {
            var isDark = document.documentElement.classList.toggle('dark');
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (error) {}
        });
    }

    function initMobileMenu() {
        var button = byId('mobile-menu-btn');
        var menu = byId('mobile-menu');
        if (!button || !menu) return;

        button.addEventListener('click', function () {
            menu.classList.toggle('hidden');
        });
    }

    function initScaleTypeNote() {
        var select = byId('sim-scale-type');
        var note = byId('sim-scale-suggest-note');

        function update() {
            note.style.display = select.value === 'auto' ? 'block' : 'none';
        }

        select.addEventListener('change', update);
        update();
    }

    function initWeekendToggles() {
        var weekendsYes = byId('sim-weekends-yes');
        var weekendsNo = byId('sim-weekends-no');
        var saturday = byId('sim-sat');
        var sunday = byId('sim-sun');
        var saturdayWrap = byId('sim-sat-wrap');
        var sundayWrap = byId('sim-sun-wrap');

        function update() {
            var locked = weekendsYes.checked;
            if (locked) {
                saturday.checked = true;
                sunday.checked = true;
            }

            saturday.disabled = locked;
            sunday.disabled = locked;
            saturdayWrap.classList.toggle('weekend-detail-disabled', locked);
            sundayWrap.classList.toggle('weekend-detail-disabled', locked);

            if (!locked && !weekendsNo.checked) {
                weekendsNo.checked = true;
            }
        }

        weekendsYes.addEventListener('change', update);
        weekendsNo.addEventListener('change', update);
        update();
    }

    function loadHolidays() {
        var year = byId('sim-year-select').value || String(new Date().getFullYear());
        return fetch('/data/feriados/nacionais-' + year + '.json')
            .then(function (response) {
                if (!response.ok) throw new Error('not_found');
                return response.json();
            })
            .then(function (data) {
                var list = Array.isArray(data) ? data : (data.feriados || []);
                STATE.holidaysList = list;
                STATE.holidaysSet = new Set(list.map(function (item) {
                    return item.data || item.date || item;
                }));
            })
            .catch(function () {
                STATE.holidaysList = [];
                STATE.holidaysSet = new Set();
            });
    }

    function collectParams() {
        var weekends = byId('sim-weekends-yes').checked;

        return {
            month: parseInt(byId('sim-month-select').value, 10),
            year: parseInt(byId('sim-year-select').value, 10),
            scaleChoice: byId('sim-scale-type').value,
            monthlyHours: parseInt(byId('sim-monthly-hours').value, 10),
            numPostos: Math.max(1, parseInt(byId('sim-postos').value, 10) || 1),
            opera24h: byId('sim-24h-yes').checked,
            trabalhaFinaisDeSemana: weekends,
            trabalhaSabado: weekends || byId('sim-sat').checked,
            trabalhaDomingo: weekends || byId('sim-sun').checked,
            trabalhaFeriados: byId('sim-holidays-yes').checked
        };
    }

    function buildOperationParams(params) {
        return {
            opera24h: params.opera24h,
            trabalhaFinaisDeSemana: params.trabalhaFinaisDeSemana,
            trabalhaSabado: params.trabalhaSabado,
            trabalhaDomingo: params.trabalhaDomingo,
            trabalhaFeriados: params.trabalhaFeriados
        };
    }

    function calculate() {
        var engine = window.ScaleDimensioner;
        if (!engine) {
            alert('Engine ScaleDimensioner ainda nao carregou. Aguarde e tente novamente.');
            return;
        }

        var params = collectParams();
        var operationParams = buildOperationParams(params);
        var context = {
            year: params.year,
            month: params.month,
            numPostos: params.numPostos,
            monthlyHoursPerEmployee: params.monthlyHours,
            holidaysSet: STATE.holidaysSet
        };
        var suggestion = engine.suggestBestScale(operationParams, context);
        var systemEvaluation = suggestion.evaluation || engine.evaluateScaleScenario(suggestion.scale, operationParams, context);
        var userIsAuto = params.scaleChoice === 'auto';
        var userScale = userIsAuto ? suggestion.scale : params.scaleChoice;
        var userEvaluation = engine.evaluateScaleScenario(userScale, operationParams, context);

        renderResults({
            params: params,
            userIsAuto: userIsAuto,
            suggestion: suggestion,
            systemEvaluation: systemEvaluation,
            userEvaluation: userEvaluation
        });
    }

    function renderResults(viewModel) {
        var container = byId('sim-result');
        container.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'space-y-5';
        wrap.appendChild(renderSummaryHeader(viewModel));
        wrap.appendChild(renderSystemBlock(viewModel));

        var divider = document.createElement('div');
        divider.className = 'section-divider';
        divider.textContent = 'simulacao do usuario';
        wrap.appendChild(divider);

        wrap.appendChild(renderUserBlock(viewModel));
        container.appendChild(wrap);
    }

    function renderSummaryHeader(viewModel) {
        var evaluation = viewModel.systemEvaluation;
        var params = viewModel.params;
        var header = document.createElement('div');
        header.className = 'card p-4 flex flex-wrap gap-4 items-center justify-between';
        header.innerHTML =
            '<div>' +
                '<p class="font-bold text-base">' + monthName(params.month) + ' ' + params.year + '</p>' +
                '<p class="help-copy">' + evaluation.daysOperated + ' de ' + evaluation.simulation.totalDays + ' dias operados &bull; ' +
                evaluation.hoursPerDay + 'h/dia por posto &bull; ' + params.numPostos + ' posto(s)</p>' +
            '</div>' +
            '<div class="text-right">' +
                '<p class="text-xs text-surface-400">Horas totais de operacao</p>' +
                '<p class="font-extrabold text-2xl text-brand-600 dark:text-brand-400">' + evaluation.totalOperationHours.toLocaleString('pt-BR') + 'h</p>' +
            '</div>';
        return header;
    }

    function renderSystemBlock(viewModel) {
        var suggestion = viewModel.suggestion;
        var evaluation = viewModel.systemEvaluation;
        var ui = getStatusUi(evaluation.status);
        var block = document.createElement('div');
        block.className = 'result-block result-block--system';

        var header = document.createElement('div');
        header.className = 'result-block__header';
        header.innerHTML =
            '<svg class="icon flex-shrink-0" style="color:rgb(29,78,216)" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>' +
            '</svg>' +
            '<div>' +
                '<p class="font-bold text-sm" style="color:rgb(29,78,216)">Bloco 1 - Sugerido pelo sistema</p>' +
                '<p class="text-xs text-surface-500">Escala recomendada com justificativa e cobertura estimada</p>' +
            '</div>' +
            '<span class="status-badge ' + ui.badgeClass + '">' + ui.icon + ui.label + '</span>';
        block.appendChild(header);

        var body = document.createElement('div');
        body.className = 'result-block__body';
        body.innerHTML =
            '<div class="metric-grid">' +
                metricCard(evaluation.scale, 'Escala sugerida') +
                metricCard(evaluation.minStaff, 'Quadro minimo') +
                metricCard(formatHours(evaluation.simulation.averageHours), 'Horas estimadas/colab.') +
                metricCard(evaluation.simulation.coveragePct + '%', 'Cobertura estimada') +
            '</div>';

        body.appendChild(createCoverageBox(evaluation.coverageStatus, evaluation.coverageStatus.detail));

        var why = document.createElement('div');
        why.className = 'mb-4';
        why.innerHTML =
            '<p class="text-sm font-semibold mb-1">Por que esta escala?</p>' +
            '<p class="text-sm text-surface-600 dark:text-surface-400">' + suggestion.reason + '</p>';
        body.appendChild(why);

        if (suggestion.alternatives && suggestion.alternatives.length) {
            var alternatives = document.createElement('div');
            alternatives.className = 'mb-4';
            alternatives.innerHTML = '<p class="text-xs text-surface-500 mb-1">Alternativas compativeis:</p>';
            suggestion.alternatives.forEach(function (scale) {
                var chip = document.createElement('span');
                chip.className = 'alt-chip mr-1';
                chip.textContent = scale;
                alternatives.appendChild(chip);
            });
            body.appendChild(alternatives);
        }

        var systemObservations = [];
        Array.prototype.push.apply(systemObservations, evaluation.matrixNotes || []);
        Array.prototype.push.apply(systemObservations, evaluation.observations || []);
        Array.prototype.push.apply(systemObservations, evaluation.simulation.notes || []);
        var systemList = createListBlock(
            'Observacoes legais e operacionais',
            systemObservations,
            'text-surface-700 dark:text-surface-200',
            '<span class="text-blue-600">i</span>'
        );
        if (systemList) body.appendChild(systemList);

        if (evaluation.legalNotes && evaluation.legalNotes.length) {
            var legal = document.createElement('div');
            legal.className = 'legal-note';
            legal.textContent = evaluation.legalNotes.join(' ');
            body.appendChild(legal);
        }

        var formula = document.createElement('div');
        formula.className = 'mt-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-900 text-xs font-mono text-surface-600 dark:text-surface-400';
        formula.innerHTML =
            '<span class="font-semibold">Formula:</span> &#8968;' +
            evaluation.totalOperationHours.toLocaleString('pt-BR') + 'h &divide; ' +
            viewModel.params.monthlyHours + 'h&#8969; = <span class="font-bold text-brand-600 dark:text-brand-400">' +
            evaluation.minStaff + ' funcionario(s)</span>';
        body.appendChild(formula);

        block.appendChild(body);
        return block;
    }

    function renderUserBlock(viewModel) {
        var evaluation = viewModel.userEvaluation;
        var ui = getStatusUi(evaluation.status);
        var block = document.createElement('div');
        block.className = 'result-block result-block--user';

        var header = document.createElement('div');
        header.className = 'result-block__header';
        header.innerHTML =
            '<svg class="icon flex-shrink-0" style="color:rgb(21,128,61)" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>' +
            '</svg>' +
            '<div class="flex-1">' +
                '<p class="font-bold text-sm" style="color:rgb(21,128,61)">Bloco 2 - Simulacao do usuario</p>' +
                '<p class="text-xs text-surface-500">' + (viewModel.userIsAuto ? 'Escala acompanhando a sugestao automatica' : 'Escala escolhida manualmente') + '</p>' +
            '</div>' +
            '<span class="status-badge ' + ui.badgeClass + '">' + ui.icon + ui.label + '</span>';
        block.appendChild(header);

        var body = document.createElement('div');
        body.className = 'result-block__body';
        body.innerHTML =
            '<div class="metric-grid">' +
                metricCard(evaluation.scale, 'Escala escolhida') +
                metricCard(evaluation.minStaff, 'Quadro minimo') +
                metricCard(formatHours(evaluation.simulation.averageHours), 'Horas estimadas/colab.') +
                metricCard(evaluation.simulation.coveragePct + '%', 'Cobertura estimada') +
            '</div>';

        body.appendChild(createCoverageBox(evaluation.coverageStatus, evaluation.coverageStatus.detail));

        if (evaluation.simulation.operationalMinStaff && evaluation.simulation.operationalMinStaff > evaluation.minStaff) {
            var recommended = document.createElement('div');
            recommended.className = 'mb-4 p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950';
            recommended.innerHTML =
                '<p class="text-xs font-semibold text-surface-500 mb-1">Quadro operacional recomendado</p>' +
                '<p class="text-sm">A formula retorna ' + evaluation.minStaff + ' colaborador(es), mas a distribuicao mensal fica mais estavel com ' +
                evaluation.simulation.operationalMinStaff + ' colaborador(es).</p>';
            body.appendChild(recommended);
        }

        var reasonsBlock = createListBlock(
            'Justificativa',
            evaluation.reason ? [evaluation.reason] : [],
            'text-surface-700 dark:text-surface-200',
            '<span class="text-blue-500">i</span>'
        );
        if (reasonsBlock) body.appendChild(reasonsBlock);

        var observationsBlock = createListBlock(
            'Observacoes',
            evaluation.observations,
            'text-amber-700 dark:text-amber-300',
            '<span class="text-amber-500">&#9888;</span>'
        );
        if (observationsBlock) body.appendChild(observationsBlock);

        if (evaluation.suggestion) {
            var suggestion = document.createElement('div');
            suggestion.className = 'mb-4 p-3 rounded-lg border ' +
                (evaluation.status === 'nao_possivel'
                    ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950'
                    : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950');
            suggestion.innerHTML =
                '<p class="text-xs font-semibold text-surface-500 mb-1">Sugestao de ajuste</p>' +
                '<p class="text-sm">' + evaluation.suggestion + '</p>';
            body.appendChild(suggestion);
        }

        if (evaluation.status !== 'nao_possivel') {
            body.appendChild(renderSimulationCalendar(viewModel.params, evaluation));
        } else {
            var locked = document.createElement('div');
            locked.className = 'text-center text-surface-400 py-6 text-sm';
            locked.innerHTML =
                '<p>O calendario nao foi exibido porque a escala escolhida nao fecha este cenario.</p>' +
                '<p class="mt-1">Escolha uma escala compativel ou ajuste os parametros.</p>';
            body.appendChild(locked);
        }

        if (evaluation.legalNotes && evaluation.legalNotes.length) {
            var legal = document.createElement('div');
            legal.className = 'legal-note mt-2';
            legal.textContent = evaluation.legalNotes.join(' ');
            body.appendChild(legal);
        }

        block.appendChild(body);
        return block;
    }

    function renderSimulationCalendar(params, evaluation) {
        var simulation = evaluation.simulation;
        var wrap = document.createElement('div');

        var title = document.createElement('p');
        title.className = 'font-bold text-sm mb-3 mt-4';
        title.textContent = 'Distribuicao mensal - ' + monthName(params.month) + '/' + params.year +
            ' (' + evaluation.minStaff + ' funcionario(s), escala ' + evaluation.scale + ')';
        wrap.appendChild(title);

        var summary = document.createElement('p');
        summary.className = 'help-copy mb-3';
        summary.innerHTML =
            'Cobertura: <strong>' + simulation.coveragePct + '%</strong> &bull; ' +
            simulation.coveredDays + ' de ' + simulation.daysOperated + ' dias completos &bull; ' +
            simulation.assignedAssignmentsTotal + '/' + simulation.requiredAssignmentsTotal + ' turnos alocados' +
            (simulation.uncoveredHoursTotal > 0
                ? ' &bull; <span class="text-red-600">' + simulation.uncoveredHoursTotal + 'h sem cobertura</span>'
                : '');
        wrap.appendChild(summary);

        var card = document.createElement('div');
        card.className = 'card p-3 app-calendar-shell scale-calendar';

        var grid = document.createElement('div');
        grid.className = 'sim-cal-grid';

        WDAY_LABELS.forEach(function (label) {
            var headerCell = document.createElement('div');
            headerCell.className = 'sim-cal-cell sim-cal-cell--header';
            headerCell.textContent = label;
            grid.appendChild(headerCell);
        });

        for (var empty = 0; empty < new Date(params.year, params.month - 1, 1).getDay(); empty++) {
            var emptyCell = document.createElement('div');
            emptyCell.className = 'sim-cal-cell sim-cal-cell--empty';
            grid.appendChild(emptyCell);
        }

        simulation.days.forEach(function (dayData) {
            var cell = document.createElement('div');
            var className = 'sim-cal-cell ';

            if (!dayData.operated) {
                className += 'sim-cal-cell--weekend-off';
            } else if (dayData.deficitHours > 0) {
                className += 'sim-cal-cell--deficit';
            } else if (dayData.holiday) {
                className += 'sim-cal-cell--holiday';
            } else {
                className += 'sim-cal-cell--work';
            }

            cell.className = className;

            var number = document.createElement('span');
            number.className = 'cal-day-num';
            number.textContent = dayData.day;
            cell.appendChild(number);

            if (dayData.operated) {
                var meta = document.createElement('span');
                meta.style.cssText = 'font-size:9px;font-weight:700;';
                meta.textContent = dayData.assigned.length + '/' + dayData.requiredAssignments + ' turnos';
                cell.appendChild(meta);
            }

            if (dayData.operated && dayData.assigned.length) {
                var tags = document.createElement('div');
                tags.className = 'cal-day-tags';

                dayData.assigned.slice(0, 4).forEach(function (employee) {
                    var tag = document.createElement('span');
                    tag.className = 'cal-emp-tag';
                    tag.textContent = employee;
                    tags.appendChild(tag);
                });

                if (dayData.assigned.length > 4) {
                    var more = document.createElement('span');
                    more.className = 'cal-emp-tag';
                    more.style.background = 'rgb(100,116,139)';
                    more.textContent = '+' + (dayData.assigned.length - 4);
                    tags.appendChild(more);
                }

                cell.appendChild(tags);
            }

            if (dayData.deficitHours > 0) {
                var deficit = document.createElement('span');
                deficit.style.cssText = 'font-size:9px;font-weight:700;';
                deficit.textContent = '-' + dayData.deficitHours + 'h';
                cell.appendChild(deficit);
            }

            grid.appendChild(cell);
        });

        card.appendChild(grid);

        var legend = document.createElement('div');
        legend.className = 'flex flex-wrap gap-3 mt-3 text-xs text-surface-500';
        legend.innerHTML =
            '<span class="flex items-center gap-1"><span style="width:12px;height:12px;border-radius:3px;background:rgb(219,234,254);display:inline-block"></span> Dia operado</span>' +
            '<span class="flex items-center gap-1"><span style="width:12px;height:12px;border-radius:3px;background:rgb(241,245,249);display:inline-block"></span> Sem operacao</span>' +
            '<span class="flex items-center gap-1"><span style="width:12px;height:12px;border-radius:3px;background:rgb(254,243,199);display:inline-block"></span> Feriado operado</span>' +
            '<span class="flex items-center gap-1"><span style="width:12px;height:12px;border-radius:3px;background:rgb(254,226,226);border:1px solid rgb(252,165,165);display:inline-block"></span> Deficit de cobertura</span>';
        card.appendChild(legend);

        var statsTitle = document.createElement('p');
        statsTitle.className = 'font-semibold text-sm mt-4 mb-2';
        statsTitle.textContent = 'Horas estimadas por funcionario no mes:';
        card.appendChild(statsTitle);

        var chips = document.createElement('div');
        chips.className = 'flex flex-wrap gap-2';
        simulation.employees.forEach(function (employee) {
            var chip = document.createElement('span');
            chip.className = 'emp-chip';
            chip.textContent =
                employee + ': ' +
                simulation.stats.hours[employee] + 'h (' +
                simulation.stats.assignments[employee] + ' turno(s))';
            chips.appendChild(chip);
        });
        card.appendChild(chips);

        wrap.appendChild(card);
        return wrap;
    }

    function bindEvents() {
        byId('sim-year-select').addEventListener('change', loadHolidays);
        byId('sim-form').addEventListener('submit', function (event) {
            event.preventDefault();
            loadHolidays().then(calculate);
        });
        byId('sim-calc-btn').addEventListener('click', function () {
            loadHolidays();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initSelects();
        initTheme();
        initMobileMenu();
        initWeekendToggles();
        initScaleTypeNote();
        bindEvents();
        loadHolidays();
    });
})();
