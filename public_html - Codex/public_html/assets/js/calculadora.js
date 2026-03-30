(function () {
    'use strict';

    var HISTORY_KEY = 'datasuteis_calc_history_v2';
    var LEGACY_SIMPLE_HISTORY_KEY = 'datasuteis_calc_simple_history';
    var MODE_KEY = 'datasuteis_calc_mode';
    var HISTORY_LIMIT = 10;
    var CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    var DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' });

    var MODE_LABELS = {
        simple: 'Simples',
        financial: 'Financeira',
        scientific: 'Cientifica',
        programmer: 'Programador',
        date: 'Calcular Data'
    };

    var state = {
        currentMode: 'simple',
        history: [],
        financeTool: 'compound',
        dateTool: 'difference',
        simple: buildExpressionState(),
        scientific: buildExpressionState(),
        scientificAngle: 'deg'
    };

    function buildExpressionState() {
        return {
            expression: '',
            justEvaluated: false,
            error: false,
            lastExpression: ''
        };
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function queryAll(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
    }

    function getExpressionState(mode) {
        return state[mode === 'scientific' ? 'scientific' : 'simple'];
    }

    function isExpressionMode(mode) {
        return mode === 'simple' || mode === 'scientific';
    }

    function isOperator(value) {
        return value === '+' || value === '-' || value === '×' || value === '÷' || value === '^';
    }

    function isFunctionToken(value) {
        return /^(sin|cos|tan|sqrt|log|ln|abs)\($/.test(String(value || ''));
    }

    function lastChar(mode) {
        return getExpressionState(mode).expression.slice(-1);
    }

    function normalizeExpression(expression) {
        return String(expression || '')
            .replace(/−/g, '-')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\s+/g, '');
    }

    function isBalanced(expression) {
        var depth = 0;
        for (var index = 0; index < expression.length; index += 1) {
            if (expression[index] === '(') depth += 1;
            if (expression[index] === ')') depth -= 1;
            if (depth < 0) return false;
        }
        return depth === 0;
    }

    function formatResult(value) {
        var number = Number(value);
        if (!Number.isFinite(number)) return 'Erro';

        if (Math.abs(number) >= 1e12 || (Math.abs(number) > 0 && Math.abs(number) < 1e-9)) {
            return number.toExponential(6).replace(/\.?0+e/, 'e');
        }

        var rounded = Number(number.toFixed(10));
        return String(rounded).replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
    }

    function formatCurrency(value) {
        var amount = Number(value);
        return Number.isFinite(amount) ? CURRENCY_FORMATTER.format(amount) : 'R$ 0,00';
    }

    function formatDate(value) {
        if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
        return DATE_FORMATTER.format(value);
    }

    function formatDateShort(value) {
        if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
        var year = value.getFullYear();
        var month = String(value.getMonth() + 1).padStart(2, '0');
        var day = String(value.getDate()).padStart(2, '0');
        return day + '/' + month + '/' + year;
    }

    function parseIsoDate(value) {
        var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
        if (!match) return null;
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    function toIsoDate(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function addDays(date, days) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + Number(days || 0));
    }

    function safeNumber(value) {
        var parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function isValidHistoryItem(item) {
        return !!(item && typeof item.mode === 'string' && typeof item.summary === 'string');
    }

    function readLegacyHistory() {
        try {
            var stored = localStorage.getItem(LEGACY_SIMPLE_HISTORY_KEY);
            var parsed = stored ? JSON.parse(stored) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter(function (item) {
                    return item && typeof item.expression === 'string' && typeof item.result === 'string';
                })
                .slice(0, HISTORY_LIMIT)
                .map(function (item) {
                    return {
                        mode: 'simple',
                        summary: item.expression + ' = ' + item.result,
                        restore: { mode: 'simple', expression: item.expression }
                    };
                });
        } catch (error) {
            return [];
        }
    }

    function readHistory() {
        try {
            var stored = localStorage.getItem(HISTORY_KEY);
            var parsed = stored ? JSON.parse(stored) : [];
            if (Array.isArray(parsed) && parsed.length) {
                return parsed.filter(isValidHistoryItem).slice(0, HISTORY_LIMIT);
            }
        } catch (error) {
            return readLegacyHistory();
        }

        return readLegacyHistory();
    }

    function writeHistory() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history.slice(0, HISTORY_LIMIT)));
        } catch (error) {
            return;
        }
    }

    function renderHistory() {
        var listNode = byId('calc-history-list');
        var emptyNode = byId('calc-history-empty');
        var clearButton = document.querySelector('[data-calc-history-clear]');

        if (!listNode) return;
        listNode.innerHTML = '';

        state.history.forEach(function (item, index) {
            var listItem = document.createElement('li');
            var button = document.createElement('button');
            var indexNode = document.createElement('span');
            var copyNode = document.createElement('span');
            var modeNode = document.createElement('span');
            var summaryNode = document.createElement('span');

            button.type = 'button';
            button.className = 'calc-history-btn';
            button.setAttribute('aria-label', 'Abrir historico ' + (index + 1));
            button.addEventListener('click', function () { restoreHistoryItem(item); });

            indexNode.className = 'calc-history-index';
            indexNode.textContent = String(index + 1) + ' -';

            copyNode.className = 'calc-history-copy';
            modeNode.className = 'calc-history-mode';
            modeNode.textContent = MODE_LABELS[item.mode] || 'Modo';
            summaryNode.className = 'calc-history-formula';
            summaryNode.textContent = item.summary;

            copyNode.appendChild(modeNode);
            copyNode.appendChild(summaryNode);

            if (item.detail) {
                var detailNode = document.createElement('span');
                detailNode.className = 'calc-history-summary';
                detailNode.textContent = item.detail;
                copyNode.appendChild(detailNode);
            }

            button.appendChild(indexNode);
            button.appendChild(copyNode);
            listItem.appendChild(button);
            listNode.appendChild(listItem);
        });

        if (emptyNode) emptyNode.hidden = state.history.length > 0;
        if (clearButton) clearButton.disabled = state.history.length === 0;
    }

    function pushHistory(item) {
        if (!isValidHistoryItem(item)) return;

        var normalized = {
            mode: item.mode,
            summary: item.summary,
            detail: item.detail || '',
            restore: item.restore || null
        };

        if (state.history[0] && state.history[0].summary === normalized.summary && state.history[0].mode === normalized.mode) {
            return;
        }

        state.history = [normalized].concat(state.history).slice(0, HISTORY_LIMIT);
        writeHistory();
        renderHistory();
    }

    function clearHistory() {
        state.history = [];
        writeHistory();
        renderHistory();
    }

    function setMode(mode) {
        var targetMode = MODE_LABELS[mode] ? mode : 'simple';
        state.currentMode = targetMode;

        try {
            localStorage.setItem(MODE_KEY, targetMode);
        } catch (error) {
            return;
        }

        queryAll('[data-calc-mode-switch]').forEach(function (button) {
            var isActive = button.getAttribute('data-calc-mode-switch') === targetMode;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        queryAll('[data-calc-panel]').forEach(function (panel) {
            panel.hidden = panel.getAttribute('data-calc-panel') !== targetMode;
        });
    }

    function updateExpressionDisplay(mode) {
        var calcState = getExpressionState(mode);
        var expressionNode = byId(mode === 'scientific' ? 'calc-scientific-expression' : 'calc-simple-expression');
        var displayNode = byId(mode === 'scientific' ? 'calc-scientific-display' : 'calc-simple-display');

        if (!expressionNode || !displayNode) return;

        expressionNode.textContent = calcState.lastExpression || calcState.expression || '0';
        displayNode.textContent = calcState.error ? 'Erro' : (calcState.expression || '0');
    }

    function setExpression(mode, value, justEvaluated, lastExpression) {
        var calcState = getExpressionState(mode);
        calcState.expression = value;
        calcState.justEvaluated = !!justEvaluated;
        calcState.error = false;
        calcState.lastExpression = lastExpression || '';
        updateExpressionDisplay(mode);
    }

    function clearExpression(mode) {
        setExpression(mode, '', false, '');
    }

    function backspaceExpression(mode) {
        var calcState = getExpressionState(mode);
        if (calcState.justEvaluated || calcState.error) {
            clearExpression(mode);
            return;
        }

        setExpression(mode, calcState.expression.slice(0, -1), false, '');
    }

    function normalizeValueForInsert(mode, value) {
        var current = lastChar(mode);
        if (!value) return '';

        if ((value === '(' || value === 'π' || value === 'e' || isFunctionToken(value)) && current && /[0-9πe)%]/.test(current)) {
            return '×' + value;
        }

        return value;
    }

    function appendExpressionValue(mode, value) {
        var calcState = getExpressionState(mode);
        if (!value) return;

        if (calcState.error) {
            clearExpression(mode);
        }

        if (calcState.justEvaluated && !isOperator(value) && value !== '%' && value !== '^') {
            calcState.expression = '';
            calcState.justEvaluated = false;
            calcState.lastExpression = '';
        } else if (calcState.justEvaluated) {
            calcState.justEvaluated = false;
            calcState.lastExpression = '';
        }

        if (value === '.') {
            var segment = calcState.expression.split(/[+\-×÷()^]/).pop();
            if (segment.indexOf('.') !== -1) return;
            if (!segment || /[A-Za-zπe]/.test(segment)) value = '0.';
        }

        if (value === '%') {
            if (!lastChar(mode) || isOperator(lastChar(mode)) || lastChar(mode) === '(' || lastChar(mode) === '%') return;
            setExpression(mode, calcState.expression + '%', false, '');
            return;
        }

        if (isOperator(value)) {
            if (!calcState.expression) {
                if (value === '-') setExpression(mode, '-', false, '');
                return;
            }

            if (isOperator(lastChar(mode))) {
                setExpression(mode, calcState.expression.slice(0, -1) + value, false, '');
                return;
            }
        }

        if (value === ')') {
            var openCount = (calcState.expression.match(/\(/g) || []).length;
            var closeCount = (calcState.expression.match(/\)/g) || []).length;
            if (openCount <= closeCount || isOperator(lastChar(mode)) || lastChar(mode) === '(') return;
        }

        value = normalizeValueForInsert(mode, value);
        setExpression(mode, calcState.expression + value, false, '');
    }

    function applyScientificAction(action) {
        var calcState = getExpressionState('scientific');
        if (action === 'square') {
            if (!calcState.expression || isOperator(lastChar('scientific')) || lastChar('scientific') === '(') return;
            appendExpressionValue('scientific', '^2');
            return;
        }

        if (action === 'negate' && /^-?\d+(\.\d+)?$/.test(calcState.expression || '')) {
            setExpression(
                'scientific',
                calcState.expression.indexOf('-') === 0 ? calcState.expression.slice(1) : '-' + calcState.expression,
                false,
                ''
            );
        }
    }

    function replaceConstantToken(expression, token, replacement) {
        return expression.replace(new RegExp('(^|[^A-Za-z0-9_])' + token + '(?=$|[^A-Za-z0-9_])', 'g'), function (full, prefix) {
            return prefix + replacement;
        });
    }

    function evaluateSimpleExpression(expression) {
        var normalized = normalizeExpression(expression);
        if (!normalized || !isBalanced(normalized)) throw new Error('invalid_expression');
        if (!/^[0-9+\-*/().%]+$/.test(normalized)) throw new Error('unsafe_expression');

        var transformed = normalized.replace(/%/g, '/100');
        var result = Function('"use strict"; return (' + transformed + ');')();

        if (!Number.isFinite(result)) throw new Error('invalid_result');
        return formatResult(result);
    }

    function evaluateScientificExpression(expression) {
        var normalized = normalizeExpression(expression).replace(/π/g, 'PI');
        normalized = replaceConstantToken(normalized, 'e', 'E');

        if (!normalized || !isBalanced(normalized)) throw new Error('invalid_expression');
        if (!/^[0-9+\-*/().,%A-Za-z_^]+$/.test(normalized)) throw new Error('unsafe_expression');

        var identifiers = normalized.match(/[A-Za-z_]+/g) || [];
        var allowedIdentifiers = {
            PI: true,
            E: true,
            sin: true,
            cos: true,
            tan: true,
            sqrt: true,
            log: true,
            ln: true,
            abs: true
        };

        if (identifiers.some(function (identifier) { return !allowedIdentifiers[identifier]; })) {
            throw new Error('unsafe_identifier');
        }

        var transformed = normalized.replace(/\^/g, '**').replace(/%/g, '/100');
        var trigFactory = state.scientificAngle === 'deg'
            ? {
                sin: 'function(v){ return Math.sin(v * Math.PI / 180); }',
                cos: 'function(v){ return Math.cos(v * Math.PI / 180); }',
                tan: 'function(v){ return Math.tan(v * Math.PI / 180); }'
            }
            : {
                sin: 'Math.sin',
                cos: 'Math.cos',
                tan: 'Math.tan'
            };

        var evaluator = Function(
            '"use strict";' +
            'var PI = Math.PI;' +
            'var E = Math.E;' +
            'var sin = ' + trigFactory.sin + ';' +
            'var cos = ' + trigFactory.cos + ';' +
            'var tan = ' + trigFactory.tan + ';' +
            'var sqrt = Math.sqrt;' +
            'var log = Math.log10 ? Math.log10 : function(v){ return Math.log(v) / Math.LN10; };' +
            'var ln = Math.log;' +
            'var abs = Math.abs;' +
            'return (' + transformed + ');'
        );

        var result = evaluator();
        if (!Number.isFinite(result)) throw new Error('invalid_result');
        return formatResult(result);
    }

    function calculateExpression(mode, saveToHistory) {
        var calcState = getExpressionState(mode);

        try {
            if (calcState.justEvaluated && calcState.lastExpression) return;

            var originalExpression = calcState.expression;
            var result = mode === 'scientific'
                ? evaluateScientificExpression(originalExpression)
                : evaluateSimpleExpression(originalExpression);

            if (saveToHistory !== false) {
                pushHistory({
                    mode: mode,
                    summary: originalExpression + ' = ' + result,
                    restore: { mode: mode, expression: originalExpression }
                });
            }

            setExpression(mode, result, true, originalExpression + ' =');
        } catch (error) {
            calcState.expression = '';
            calcState.justEvaluated = false;
            calcState.error = true;
            calcState.lastExpression = '';
            updateExpressionDisplay(mode);
        }
    }

    function setScientificAngle(angle) {
        state.scientificAngle = angle === 'rad' ? 'rad' : 'deg';
        queryAll('[data-calc-angle]').forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-calc-angle') === state.scientificAngle);
        });
    }

    function renderFinancialResult(primaryLabel, primaryValue, cards) {
        var resultNode = byId('calc-financial-result');
        if (!resultNode) return;

        resultNode.innerHTML = '<div class="calc-result-lead"><strong>' + primaryLabel + '</strong><span>' + primaryValue + '</span></div>' +
            '<div class="calc-output-grid">' + (cards || []).map(function (card) {
                return '<div class="calc-output-card"><strong>' + card.label + '</strong><span>' + card.value + '</span></div>';
            }).join('') + '</div>';
    }

    function setFinanceTool(tool) {
        state.financeTool = tool === 'simple' || tool === 'payment' ? tool : 'compound';

        queryAll('[data-finance-tool]').forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-finance-tool') === state.financeTool);
        });

        if (state.financeTool === 'payment') {
            byId('calc-financial-label-principal').textContent = 'Valor financiado';
            byId('calc-financial-label-periods').textContent = 'Numero de parcelas';
            byId('calc-financial-help').textContent = 'Calcula a parcela fixa pela tabela Price com taxa por periodo.';
            return;
        }

        byId('calc-financial-label-principal').textContent = 'Capital inicial';
        byId('calc-financial-label-periods').textContent = 'Numero de periodos';
        byId('calc-financial-help').textContent = state.financeTool === 'simple'
            ? 'Use para calcular juros simples e montante final.'
            : 'Use para estimar montante e juros acumulados por periodo.';
    }

    function runFinancialCalculation(saveToHistory) {
        var principal = safeNumber(byId('calc-financial-principal').value);
        var rate = safeNumber(byId('calc-financial-rate').value) / 100;
        var periods = Math.max(1, Math.round(safeNumber(byId('calc-financial-periods').value)));
        var total = 0;
        var interest = 0;
        var primaryLabel = '';
        var cards = [];
        var summary = '';

        if (state.financeTool === 'simple') {
            interest = principal * rate * periods;
            total = principal + interest;
            primaryLabel = 'Montante final';
            cards = [
                { label: 'Juros', value: formatCurrency(interest) },
                { label: 'Capital', value: formatCurrency(principal) },
                { label: 'Resumo', value: periods + ' periodos a ' + (rate * 100).toFixed(2).replace('.', ',') + '%' }
            ];
            summary = formatCurrency(principal) + ' a juros simples = ' + formatCurrency(total);
        } else if (state.financeTool === 'payment') {
            var payment = rate === 0 ? (principal / periods) : (principal * rate) / (1 - Math.pow(1 + rate, -periods));
            total = payment * periods;
            interest = total - principal;
            primaryLabel = 'Parcela estimada';
            cards = [
                { label: 'Total pago', value: formatCurrency(total) },
                { label: 'Juros totais', value: formatCurrency(interest) },
                { label: 'Resumo', value: periods + ' parcelas a ' + (rate * 100).toFixed(2).replace('.', ',') + '%' }
            ];
            summary = 'Parcela estimada: ' + formatCurrency(payment);
            renderFinancialResult(primaryLabel, formatCurrency(payment), cards);

            if (saveToHistory !== false) {
                pushHistory({
                    mode: 'financial',
                    summary: summary,
                    detail: 'Price sobre ' + formatCurrency(principal),
                    restore: { mode: 'financial', tool: state.financeTool, principal: principal, rate: rate * 100, periods: periods }
                });
            }
            return;
        } else {
            total = principal * Math.pow(1 + rate, periods);
            interest = total - principal;
            primaryLabel = 'Montante final';
            cards = [
                { label: 'Juros', value: formatCurrency(interest) },
                { label: 'Capital', value: formatCurrency(principal) },
                { label: 'Resumo', value: periods + ' periodos a ' + (rate * 100).toFixed(2).replace('.', ',') + '%' }
            ];
            summary = formatCurrency(principal) + ' a juros compostos = ' + formatCurrency(total);
        }

        renderFinancialResult(primaryLabel, formatCurrency(total), cards);

        if (saveToHistory !== false) {
            pushHistory({
                mode: 'financial',
                summary: summary,
                detail: state.financeTool === 'simple' ? 'Juros simples' : 'Juros compostos',
                restore: { mode: 'financial', tool: state.financeTool, principal: principal, rate: rate * 100, periods: periods }
            });
        }
    }

    function parseBigIntValue(rawValue, defaultBase) {
        var raw = String(rawValue || '').trim();
        var sign = 1n;
        var base = Number(defaultBase) || 10;

        if (!raw) throw new Error('empty_integer');
        if (raw.indexOf('-') === 0) {
            sign = -1n;
            raw = raw.slice(1);
        }

        if (/^0x/i.test(raw)) {
            base = 16;
            raw = raw.slice(2);
        } else if (/^0b/i.test(raw)) {
            base = 2;
            raw = raw.slice(2);
        } else if (/^0o/i.test(raw)) {
            base = 8;
            raw = raw.slice(2);
        }

        if (!raw) throw new Error('invalid_integer');

        var valid = {
            2: /^[01]+$/,
            8: /^[0-7]+$/,
            10: /^[0-9]+$/,
            16: /^[0-9a-f]+$/i
        }[base];

        if (!valid || !valid.test(raw)) throw new Error('invalid_integer');

        var digits = raw.toUpperCase();
        var result = 0n;
        var bigBase = BigInt(base);

        for (var index = 0; index < digits.length; index += 1) {
            result = (result * bigBase) + BigInt(parseInt(digits[index], base));
        }

        return result * sign;
    }

    function toBaseString(value, base) {
        var prefix = value < 0 ? '-' : '';
        var absolute = value < 0 ? (value * -1n) : value;
        return prefix + absolute.toString(base).toUpperCase();
    }

    function renderProgrammerConversion(value) {
        var container = byId('calc-programmer-conversion');
        if (!container) return;

        container.innerHTML =
            '<div class="calc-output-grid">' +
                '<div class="calc-output-card"><strong>Decimal</strong><span>' + toBaseString(value, 10) + '</span></div>' +
                '<div class="calc-output-card"><strong>Hexadecimal</strong><span>' + toBaseString(value, 16) + '</span></div>' +
                '<div class="calc-output-card"><strong>Octal</strong><span>' + toBaseString(value, 8) + '</span></div>' +
                '<div class="calc-output-card"><strong>Binario</strong><span>' + toBaseString(value, 2) + '</span></div>' +
            '</div>';
    }

    function renderProgrammerResult(primaryValue, cards) {
        var container = byId('calc-programmer-result');
        if (!container) return;

        container.innerHTML = '<div class="calc-result-lead"><strong>Resultado principal</strong><span>' + primaryValue + '</span></div>' +
            '<div class="calc-output-grid">' + cards.map(function (card) {
                return '<div class="calc-output-card"><strong>' + card.label + '</strong><span>' + card.value + '</span></div>';
            }).join('') + '</div>';
    }

    function convertProgrammerValue(saveToHistory) {
        try {
            var base = Number(byId('calc-programmer-base').value || 10);
            var value = parseBigIntValue(byId('calc-programmer-value').value, base);

            renderProgrammerConversion(value);

            if (saveToHistory !== false) {
                pushHistory({
                    mode: 'programmer',
                    summary: 'Conversao: ' + toBaseString(value, 10) + ' = 0x' + toBaseString(value, 16),
                    detail: 'BIN ' + toBaseString(value, 2),
                    restore: { mode: 'programmer', base: base, value: byId('calc-programmer-value').value }
                });
            }
        } catch (error) {
            renderProgrammerConversion(0n);
            renderProgrammerResult('Valor invalido', [
                { label: 'Dica', value: 'Use decimal, hexadecimal, octal ou binario valido.' }
            ]);
        }
    }

    function updateProgrammerOperationState() {
        var operator = byId('calc-programmer-op').value;
        var inputB = byId('calc-programmer-b');
        if (inputB) inputB.disabled = operator === 'not';
    }

    function runProgrammerOperation(saveToHistory) {
        try {
            var base = Number(byId('calc-programmer-base').value || 10);
            var operator = byId('calc-programmer-op').value;
            var left = parseBigIntValue(byId('calc-programmer-a').value, base);
            var right = operator === 'not' ? 0n : parseBigIntValue(byId('calc-programmer-b').value, base);
            var result = 0n;
            var summary = '';

            if (operator === 'and') {
                result = left & right;
                summary = toBaseString(left, 10) + ' AND ' + toBaseString(right, 10) + ' = ' + toBaseString(result, 10);
            } else if (operator === 'or') {
                result = left | right;
                summary = toBaseString(left, 10) + ' OR ' + toBaseString(right, 10) + ' = ' + toBaseString(result, 10);
            } else if (operator === 'xor') {
                result = left ^ right;
                summary = toBaseString(left, 10) + ' XOR ' + toBaseString(right, 10) + ' = ' + toBaseString(result, 10);
            } else if (operator === 'not') {
                result = ~left;
                summary = 'NOT ' + toBaseString(left, 10) + ' = ' + toBaseString(result, 10);
            } else if (operator === 'lshift') {
                result = left << BigInt(Number(right));
                summary = toBaseString(left, 10) + ' << ' + Number(right) + ' = ' + toBaseString(result, 10);
            } else {
                result = left >> BigInt(Number(right));
                summary = toBaseString(left, 10) + ' >> ' + Number(right) + ' = ' + toBaseString(result, 10);
            }

            renderProgrammerResult(toBaseString(result, 10), [
                { label: 'Hexadecimal', value: toBaseString(result, 16) },
                { label: 'Octal', value: toBaseString(result, 8) },
                { label: 'Binario', value: toBaseString(result, 2) }
            ]);

            if (saveToHistory !== false) {
                pushHistory({
                    mode: 'programmer',
                    summary: summary,
                    detail: 'HEX ' + toBaseString(result, 16),
                    restore: {
                        mode: 'programmer',
                        base: base,
                        value: byId('calc-programmer-value').value,
                        left: byId('calc-programmer-a').value,
                        operator: operator,
                        right: byId('calc-programmer-b').value
                    }
                });
            }
        } catch (error) {
            renderProgrammerResult('Valor invalido', [
                { label: 'Dica', value: 'Revise os operandos e a base selecionada.' }
            ]);
        }
    }

    function setDateTool(tool) {
        state.dateTool = tool === 'offset' ? 'offset' : 'difference';

        queryAll('[data-date-tool]').forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-date-tool') === state.dateTool);
        });

        queryAll('[data-date-panel]').forEach(function (panel) {
            panel.hidden = panel.getAttribute('data-date-panel') !== state.dateTool;
        });
    }

    function renderDateResult(primaryLabel, primaryValue, cards) {
        var container = byId('calc-date-result');
        if (!container) return;

        container.innerHTML = '<div class="calc-result-lead"><strong>' + primaryLabel + '</strong><span>' + primaryValue + '</span></div>' +
            '<div class="calc-output-grid">' + cards.map(function (card) {
                return '<div class="calc-output-card"><strong>' + card.label + '</strong><span>' + card.value + '</span></div>';
            }).join('') + '</div>';
    }

    function runDateDifference(saveToHistory) {
        var start = parseIsoDate(byId('calc-date-start').value);
        var end = parseIsoDate(byId('calc-date-end').value);
        var includeEnd = !!byId('calc-date-include-end').checked;

        if (!start || !end) {
            renderDateResult('Resultado principal', 'Datas invalidas', [
                { label: 'Dica', value: 'Preencha as duas datas antes de calcular.' }
            ]);
            return;
        }

        var deltaDays = Math.round((end.getTime() - start.getTime()) / 86400000);
        if (includeEnd) deltaDays += deltaDays >= 0 ? 1 : -1;
        var absoluteDays = Math.abs(deltaDays);
        var weeks = Math.floor(absoluteDays / 7);
        var remainingDays = absoluteDays % 7;
        var direction = deltaDays === 0 ? 'Mesma data' : (deltaDays > 0 ? 'Data final depois da inicial' : 'Data final antes da inicial');

        renderDateResult('Dias corridos', String(absoluteDays), [
            { label: 'Leitura', value: weeks + ' semana(s) e ' + remainingDays + ' dia(s)' },
            { label: 'Direcao', value: direction },
            { label: 'Periodo', value: formatDateShort(start) + ' ate ' + formatDateShort(end) }
        ]);

        if (saveToHistory !== false) {
            pushHistory({
                mode: 'date',
                summary: formatDateShort(start) + ' ate ' + formatDateShort(end) + ' = ' + absoluteDays + ' dia(s)',
                detail: includeEnd ? 'Contagem com data final incluida' : 'Contagem padrao',
                restore: { mode: 'date', tool: 'difference', start: byId('calc-date-start').value, end: byId('calc-date-end').value, includeEnd: includeEnd }
            });
        }
    }

    function runDateOffset(saveToHistory) {
        var baseDate = parseIsoDate(byId('calc-date-base').value);
        var days = Math.round(safeNumber(byId('calc-date-offset-days').value));
        var direction = byId('calc-date-offset-direction').value === 'subtract' ? 'subtract' : 'add';

        if (!baseDate) {
            renderDateResult('Resultado principal', 'Data invalida', [
                { label: 'Dica', value: 'Preencha uma data base valida.' }
            ]);
            return;
        }

        var resultDate = addDays(baseDate, direction === 'subtract' ? (days * -1) : days);

        renderDateResult('Data resultante', formatDateShort(resultDate), [
            { label: 'Extenso', value: formatDate(resultDate) },
            { label: 'Base', value: formatDateShort(baseDate) },
            { label: 'Operacao', value: (direction === 'subtract' ? 'Subtrair ' : 'Somar ') + Math.abs(days) + ' dia(s)' }
        ]);

        if (saveToHistory !== false) {
            pushHistory({
                mode: 'date',
                summary: formatDateShort(baseDate) + (direction === 'subtract' ? ' - ' : ' + ') + Math.abs(days) + ' dia(s) = ' + formatDateShort(resultDate),
                detail: direction === 'subtract' ? 'Subtracao de datas' : 'Soma de datas',
                restore: { mode: 'date', tool: 'offset', baseDate: byId('calc-date-base').value, days: days, direction: direction }
            });
        }
    }

    function restoreHistoryItem(item) {
        if (!item || !item.restore || !item.restore.mode) return;

        setMode(item.restore.mode);

        if (item.restore.mode === 'simple' || item.restore.mode === 'scientific') {
            setExpression(item.restore.mode, item.restore.expression || '', false, '');
            return;
        }

        if (item.restore.mode === 'financial') {
            setFinanceTool(item.restore.tool || 'compound');
            byId('calc-financial-principal').value = item.restore.principal;
            byId('calc-financial-rate').value = item.restore.rate;
            byId('calc-financial-periods').value = item.restore.periods;
            runFinancialCalculation(false);
            return;
        }

        if (item.restore.mode === 'programmer') {
            byId('calc-programmer-base').value = String(item.restore.base || 10);
            if (item.restore.value !== undefined) byId('calc-programmer-value').value = item.restore.value;
            if (item.restore.left !== undefined) byId('calc-programmer-a').value = item.restore.left;
            if (item.restore.operator !== undefined) byId('calc-programmer-op').value = item.restore.operator;
            if (item.restore.right !== undefined) byId('calc-programmer-b').value = item.restore.right;
            updateProgrammerOperationState();
            convertProgrammerValue(false);
            runProgrammerOperation(false);
            return;
        }

        if (item.restore.mode === 'date') {
            setDateTool(item.restore.tool || 'difference');
            if (item.restore.start !== undefined) byId('calc-date-start').value = item.restore.start;
            if (item.restore.end !== undefined) byId('calc-date-end').value = item.restore.end;
            if (item.restore.includeEnd !== undefined) byId('calc-date-include-end').checked = !!item.restore.includeEnd;
            if (item.restore.baseDate !== undefined) byId('calc-date-base').value = item.restore.baseDate;
            if (item.restore.days !== undefined) byId('calc-date-offset-days').value = item.restore.days;
            if (item.restore.direction !== undefined) byId('calc-date-offset-direction').value = item.restore.direction;
            if ((item.restore.tool || 'difference') === 'offset') runDateOffset(false); else runDateDifference(false);
        }
    }

    function bindExpressionButtons() {
        queryAll('[data-calc-value]').forEach(function (button) {
            button.addEventListener('click', function () {
                appendExpressionValue(button.getAttribute('data-calc-target') || 'simple', button.getAttribute('data-calc-value'));
            });
        });

        queryAll('[data-calc-action]').forEach(function (button) {
            button.addEventListener('click', function () {
                var mode = button.getAttribute('data-calc-target') || state.currentMode;
                var action = button.getAttribute('data-calc-action');

                if (action === 'clear') clearExpression(mode);
                if (action === 'backspace') backspaceExpression(mode);
                if (action === 'equals') calculateExpression(mode);
                if (mode === 'scientific' && (action === 'square' || action === 'negate')) applyScientificAction(action);
            });
        });
    }

    function bindModeButtons() {
        queryAll('[data-calc-mode-switch]').forEach(function (button) {
            button.addEventListener('click', function () {
                setMode(button.getAttribute('data-calc-mode-switch'));
            });
        });
    }

    function bindFinancial() {
        queryAll('[data-finance-tool]').forEach(function (button) {
            button.addEventListener('click', function () {
                setFinanceTool(button.getAttribute('data-finance-tool'));
                runFinancialCalculation(false);
            });
        });

        var runButton = document.querySelector('[data-calc-financial-run]');
        if (runButton) {
            runButton.addEventListener('click', function () {
                runFinancialCalculation();
            });
        }
    }

    function bindScientific() {
        queryAll('[data-calc-angle]').forEach(function (button) {
            button.addEventListener('click', function () {
                setScientificAngle(button.getAttribute('data-calc-angle'));
            });
        });
    }

    function bindProgrammer() {
        var convertButton = document.querySelector('[data-calc-programmer-convert]');
        var runButton = document.querySelector('[data-calc-programmer-run]');
        var opSelect = byId('calc-programmer-op');

        if (convertButton) {
            convertButton.addEventListener('click', function () { convertProgrammerValue(); });
        }

        if (runButton) {
            runButton.addEventListener('click', function () { runProgrammerOperation(); });
        }

        if (opSelect) {
            opSelect.addEventListener('change', updateProgrammerOperationState);
        }
    }

    function bindDate() {
        queryAll('[data-date-tool]').forEach(function (button) {
            button.addEventListener('click', function () {
                setDateTool(button.getAttribute('data-date-tool'));
            });
        });

        queryAll('[data-calc-date-run]').forEach(function (button) {
            button.addEventListener('click', function () {
                if (button.getAttribute('data-calc-date-run') === 'offset') runDateOffset();
                else runDateDifference();
            });
        });
    }

    function bindHistory() {
        var clearButton = document.querySelector('[data-calc-history-clear]');
        if (!clearButton) return;
        clearButton.addEventListener('click', clearHistory);
    }

    function bindKeyboard() {
        document.addEventListener('keydown', function (event) {
            var target = event.target;
            if (target && /input|textarea|select/i.test(target.tagName || '')) return;
            if (!isExpressionMode(state.currentMode)) return;

            if (/^[0-9]$/.test(event.key)) {
                appendExpressionValue(state.currentMode, event.key);
                event.preventDefault();
                return;
            }

            if (event.key === '.' || event.key === ',') {
                appendExpressionValue(state.currentMode, '.');
                event.preventDefault();
                return;
            }

            if (event.key === '+' || event.key === '-' || event.key === '(' || event.key === ')' || event.key === '%' || event.key === '^') {
                appendExpressionValue(state.currentMode, event.key);
                event.preventDefault();
                return;
            }

            if (event.key === '*') {
                appendExpressionValue(state.currentMode, '×');
                event.preventDefault();
                return;
            }

            if (event.key === '/') {
                appendExpressionValue(state.currentMode, '÷');
                event.preventDefault();
                return;
            }

            if (event.key === 'Enter' || event.key === '=') {
                calculateExpression(state.currentMode);
                event.preventDefault();
                return;
            }

            if (event.key === 'Backspace') {
                backspaceExpression(state.currentMode);
                event.preventDefault();
                return;
            }

            if (event.key === 'Escape' || event.key === 'Delete') {
                clearExpression(state.currentMode);
                event.preventDefault();
            }
        });
    }

    function seedDates() {
        var today = new Date();
        var nextMonth = addDays(today, 30);

        if (byId('calc-date-start')) byId('calc-date-start').value = toIsoDate(today);
        if (byId('calc-date-end')) byId('calc-date-end').value = toIsoDate(nextMonth);
        if (byId('calc-date-base')) byId('calc-date-base').value = toIsoDate(today);
    }

    function bootstrapResults() {
        setExpression('simple', '', false, '');
        setExpression('scientific', '', false, '');
        setScientificAngle('deg');
        setFinanceTool('compound');
        updateProgrammerOperationState();
        runFinancialCalculation(false);
        convertProgrammerValue(false);
        runProgrammerOperation(false);
        runDateDifference(false);
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!byId('calc-simple-display')) return;

        try {
            var storedMode = localStorage.getItem(MODE_KEY);
            if (MODE_LABELS[storedMode]) state.currentMode = storedMode;
        } catch (error) {
            state.currentMode = 'simple';
        }

        state.history = readHistory();
        renderHistory();
        seedDates();
        bootstrapResults();
        bindModeButtons();
        bindExpressionButtons();
        bindFinancial();
        bindScientific();
        bindProgrammer();
        bindDate();
        bindHistory();
        bindKeyboard();
        setDateTool('difference');
        setMode(state.currentMode);
    });
})();
