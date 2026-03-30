(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const domain = simulator.domain = simulator.domain || {};

    const DEFAULT_HOURS_VALIDATION = Object.freeze({
        lowerAlertPct: 0.88,
        lowerAcceptPct: 0.95,
        upperAcceptPct: 1.05,
        upperAlertPct: 1.10
    });

    const SCALE_GROUPS = [
        { id: 'daytime', label: 'Diurnas' },
        { id: 'mixed', label: 'Mistas' },
        { id: 'continuous12', label: 'Contínuas 12h' },
        { id: 'continuous24', label: 'Contínuas 24h' }
    ];

    const SCALE_CATALOG = {
        '5x2': {
            id: '5x2',
            label: '5x2',
            group: 'daytime',
            shiftHours: 8,
            cycleType: 'week',
            weeklyOffDays: [0, 6],
            continuous: false,
            marketUsage: 10,
            legalRisk: 2,
            operationalComplexity: 2,
            priority: { diurna: 10, '12h': 1, '24h': 0 },
            explanationKey: '5x2',
            legalProfile: 'Jornada clássica de dias úteis, com baixa complexidade operacional.',
            hoursValidation: {
                lowerAlertPct: 0.85,
                lowerAcceptPct: 0.94,
                upperAcceptPct: 1.04,
                upperAlertPct: 1.10
            }
        },
        '5x1': {
            id: '5x1',
            label: '5x1',
            group: 'daytime',
            shiftHours: 8,
            cycleType: 'cycle',
            cyclePattern: ['T', 'T', 'T', 'T', 'T', 'F'],
            continuous: false,
            marketUsage: 6,
            legalRisk: 4,
            operationalComplexity: 4,
            priority: { diurna: 7, '12h': 1, '24h': 0 },
            explanationKey: '5x1',
            legalProfile: 'Precisa de controle mais atento do descanso semanal e da folga rotativa.',
            hoursValidation: {
                lowerAlertPct: 0.85,
                lowerAcceptPct: 0.93,
                upperAcceptPct: 1.05,
                upperAlertPct: 1.12
            }
        },
        '6x1': {
            id: '6x1',
            label: '6x1',
            group: 'daytime',
            shiftHours: 8,
            cycleType: 'cycle',
            cyclePattern: ['T', 'T', 'T', 'T', 'T', 'T', 'F'],
            continuous: false,
            marketUsage: 8,
            legalRisk: 4,
            operationalComplexity: 5,
            priority: { diurna: 8, '12h': 1, '24h': 0 },
            explanationKey: '6x1',
            legalProfile: 'Escala comum para cobrir sábado com folga semanal rotativa.',
            hoursValidation: {
                lowerAlertPct: 0.86,
                lowerAcceptPct: 0.94,
                upperAcceptPct: 1.05,
                upperAlertPct: 1.12
            }
        },
        '6x2': {
            id: '6x2',
            label: '6x2',
            group: 'mixed',
            shiftHours: 8,
            cycleType: 'cycle',
            cyclePattern: ['T', 'T', 'T', 'T', 'T', 'T', 'F', 'F'],
            continuous: false,
            marketUsage: 6,
            legalRisk: 5,
            operationalComplexity: 6,
            priority: { diurna: 7, '12h': 5, '24h': 8 },
            explanationKey: '6x2',
            legalProfile: 'Exige coordenação maior de turnos e da folga rotativa da equipe.',
            hoursValidation: {
                lowerAlertPct: 0.84,
                lowerAcceptPct: 0.92,
                upperAcceptPct: 1.06,
                upperAlertPct: 1.14
            }
        },
        '12x36': {
            id: '12x36',
            label: '12x36',
            group: 'continuous12',
            shiftHours: 12,
            cycleType: 'cycle',
            cyclePattern: ['T', 'F'],
            continuous: true,
            marketUsage: 10,
            legalRisk: 6,
            operationalComplexity: 5,
            priority: { diurna: 2, '12h': 10, '24h': 10 },
            explanationKey: '12x36',
            legalProfile: 'Normalmente pede atenção a acordo coletivo, política interna e jornada real.',
            hoursValidation: {
                lowerAlertPct: 0.90,
                lowerAcceptPct: 0.96,
                upperAcceptPct: 1.04,
                upperAlertPct: 1.08
            }
        },
        '4x2': {
            id: '4x2',
            label: '4x2',
            group: 'continuous12',
            shiftHours: 12,
            cycleType: 'cycle',
            cyclePattern: ['T', 'T', 'T', 'T', 'F', 'F'],
            continuous: true,
            marketUsage: 7,
            legalRisk: 5,
            operationalComplexity: 7,
            priority: { diurna: 3, '12h': 8, '24h': 9 },
            explanationKey: '4x2',
            legalProfile: 'Escala cíclica com boa aderência a operação contínua, mas com rodízio mais sensível.',
            coverageCriterionNote: 'Padrão prático de cobertura.',
            hoursValidation: {
                lowerAlertPct: 0.88,
                lowerAcceptPct: 0.95,
                upperAcceptPct: 1.05,
                upperAlertPct: 1.10
            }
        },
        '12x60': {
            id: '12x60',
            label: '12x60',
            group: 'continuous12',
            shiftHours: 12,
            cycleType: 'cycle',
            cyclePattern: ['T', 'F', 'F'],
            continuous: true,
            marketUsage: 4,
            legalRisk: 7,
            operationalComplexity: 7,
            priority: { diurna: 1, '12h': 6, '24h': 5 },
            explanationKey: '12x60',
            legalProfile: 'Formato mais específico, normalmente usado com regras internas bem definidas.',
            hoursValidation: {
                lowerAlertPct: 0.88,
                lowerAcceptPct: 0.94,
                upperAcceptPct: 1.06,
                upperAlertPct: 1.12
            }
        },
        '24x48': {
            id: '24x48',
            label: '24x48',
            group: 'continuous24',
            shiftHours: 24,
            cycleType: 'cycle',
            cyclePattern: ['T', 'F', 'F'],
            continuous: true,
            marketUsage: 5,
            legalRisk: 8,
            operationalComplexity: 8,
            priority: { diurna: 0, '12h': 2, '24h': 7 },
            explanationKey: '24x48',
            legalProfile: 'Formato mais restritivo e normalmente tratado como exceção operacional.',
            hoursValidation: {
                lowerAlertPct: 0.90,
                lowerAcceptPct: 0.96,
                upperAcceptPct: 1.04,
                upperAlertPct: 1.08
            }
        }
    };

    function getScale(scaleId) {
        return SCALE_CATALOG[scaleId] || null;
    }

    function getAllScales() {
        return Object.values(SCALE_CATALOG);
    }

    function getGroup(groupId) {
        return SCALE_GROUPS.find(function (group) {
            return group.id === groupId;
        }) || null;
    }

    function getGroupedScaleOptions() {
        return SCALE_GROUPS.map(function (group) {
            return {
                id: group.id,
                label: group.label,
                scales: getAllScales().filter(function (scale) {
                    return scale.group === group.id;
                })
            };
        }).filter(function (group) {
            return group.scales.length > 0;
        });
    }

    function isContinuousScale(scaleId) {
        const scale = getScale(scaleId);
        return !!(scale && scale.continuous);
    }

    function getOperationPriority(scaleId, operationType) {
        const scale = getScale(scaleId);
        if (!scale) return 0;
        return Number(scale.priority && scale.priority[operationType]) || 0;
    }

    function getCompatibilityCode(scaleId, operationType) {
        const priority = getOperationPriority(scaleId, operationType);
        if (priority >= 8) return 'alta';
        if (priority >= 5) return 'media';
        if (priority >= 2) return 'baixa';
        return 'incompativel';
    }

    function getShiftHours(scaleId) {
        const scale = getScale(scaleId);
        return scale ? scale.shiftHours : 0;
    }

    function getHoursValidationProfile(scaleId) {
        const scale = getScale(scaleId);
        if (!scale || !scale.hoursValidation) {
            return DEFAULT_HOURS_VALIDATION;
        }

        return {
            lowerAlertPct: Number(scale.hoursValidation.lowerAlertPct) || DEFAULT_HOURS_VALIDATION.lowerAlertPct,
            lowerAcceptPct: Number(scale.hoursValidation.lowerAcceptPct) || DEFAULT_HOURS_VALIDATION.lowerAcceptPct,
            upperAcceptPct: Number(scale.hoursValidation.upperAcceptPct) || DEFAULT_HOURS_VALIDATION.upperAcceptPct,
            upperAlertPct: Number(scale.hoursValidation.upperAlertPct) || DEFAULT_HOURS_VALIDATION.upperAlertPct
        };
    }

    function getCoverageCriterionNote(scaleId) {
        const scale = getScale(scaleId);
        return scale && scale.coverageCriterionNote ? scale.coverageCriterionNote : '';
    }

    domain.scales = {
        SCALE_GROUPS: SCALE_GROUPS,
        SCALE_CATALOG: SCALE_CATALOG,
        DEFAULT_HOURS_VALIDATION: DEFAULT_HOURS_VALIDATION,
        getScale: getScale,
        getAllScales: getAllScales,
        getGroup: getGroup,
        getGroupedScaleOptions: getGroupedScaleOptions,
        isContinuousScale: isContinuousScale,
        getOperationPriority: getOperationPriority,
        getCompatibilityCode: getCompatibilityCode,
        getShiftHours: getShiftHours,
        getHoursValidationProfile: getHoursValidationProfile,
        getCoverageCriterionNote: getCoverageCriterionNote
    };
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const domain = simulator.domain = simulator.domain || {};

    const cache = {};

    function uniqueHolidayItems(items) {
        const seen = new Set();
        return (items || []).filter(function (item) {
            const key = item && item.date;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function getSharedHolidayApi() {
        return root.DataSuteis && root.DataSuteis.holidays ? root.DataSuteis.holidays : null;
    }

    function mapSharedHolidayItem(item) {
        return {
            date: item.data || item.date || '',
            name: item.nome || item.name || 'Feriado',
            level: item.tipo || item.level || 'nacional'
        };
    }

    async function fetchLocalYear(year) {
        const response = await fetch('/data/feriados/nacionais-' + year + '.json', {
            cache: 'force-cache'
        });

        if (!response.ok) {
            throw new Error('local_' + response.status);
        }

        const data = await response.json();
        return normalizeHolidayItems(data);
    }

    async function fetchBrasilApiYear(year) {
        const response = await fetch('https://brasilapi.com.br/api/feriados/v1/' + year);
        if (!response.ok) {
            throw new Error('api_' + response.status);
        }

        const data = await response.json();
        return normalizeHolidayItems(data);
    }

    function normalizeHolidayItems(items) {
        return uniqueHolidayItems((items || []).map(function (item) {
            if (typeof item === 'string') {
                return {
                    date: item,
                    name: item,
                    level: 'nacional'
                };
            }

            return {
                date: item.data || item.date || '',
                name: item.nome || item.name || 'Feriado',
                level: item.tipo || item.level || 'nacional'
            };
        }).filter(function (item) {
            return /^\d{4}-\d{2}-\d{2}$/.test(item.date);
        })).sort(function (left, right) {
            return left.date.localeCompare(right.date);
        });
    }

    function toDate(value) {
        if (!value) return null;
        if (value instanceof Date) {
            return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        }

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
        if (!match) return null;
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    function toIso(date) {
        if (!(date instanceof Date)) return '';
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }

    async function getYearHolidays(year) {
        const shared = getSharedHolidayApi();
        if (shared && typeof shared.getYearHolidays === 'function') {
            return normalizeHolidayItems((await shared.getYearHolidays(year)).map(mapSharedHolidayItem));
        }

        if (cache[year]) {
            return cache[year];
        }

        try {
            cache[year] = await fetchLocalYear(year);
        } catch (localError) {
            try {
                cache[year] = await fetchBrasilApiYear(year);
            } catch (apiError) {
                cache[year] = [];
            }
        }

        return cache[year];
    }

    async function getMonthHolidayContext(year, month) {
        const shared = getSharedHolidayApi();
        if (shared && typeof shared.getMonthHolidayContext === 'function') {
            const context = await shared.getMonthHolidayContext(year, month);
            const yearItems = normalizeHolidayItems((context && context.all || []).map(mapSharedHolidayItem));
            const monthItems = normalizeHolidayItems((context && context.monthItems || []).map(mapSharedHolidayItem));

            return {
                year: year,
                month: month,
                all: yearItems,
                monthItems: monthItems,
                monthSet: new Set(monthItems.map(function (item) {
                    return item.date;
                })),
                count: monthItems.length
            };
        }

        const yearItems = await getYearHolidays(year);
        const monthPrefix = String(year) + '-' + String(month).padStart(2, '0');
        const monthItems = yearItems.filter(function (item) {
            return item.date.slice(0, 7) === monthPrefix;
        });

        return {
            year: year,
            month: month,
            all: yearItems,
            monthItems: monthItems,
            monthSet: new Set(monthItems.map(function (item) {
                return item.date;
            })),
            count: monthItems.length
        };
    }

    async function getPeriodHolidayContext(startDate, endDate) {
        const start = toDate(startDate);
        const end = toDate(endDate);

        if (!start || !end) {
            return {
                start: '',
                end: '',
                all: [],
                periodItems: [],
                set: new Set(),
                count: 0
            };
        }

        const safeStart = start <= end ? start : end;
        const safeEnd = start <= end ? end : start;
        const all = [];

        for (let year = safeStart.getFullYear(); year <= safeEnd.getFullYear(); year += 1) {
            all.push.apply(all, await getYearHolidays(year));
        }

        const startIso = toIso(safeStart);
        const endIso = toIso(safeEnd);
        const periodItems = normalizeHolidayItems(all).filter(function (item) {
            return item.date >= startIso && item.date <= endIso;
        });

        return {
            start: startIso,
            end: endIso,
            all: normalizeHolidayItems(all),
            periodItems: periodItems,
            set: new Set(periodItems.map(function (item) {
                return item.date;
            })),
            count: periodItems.length
        };
    }

    domain.holidays = {
        getYearHolidays: getYearHolidays,
        getMonthHolidayContext: getMonthHolidayContext,
        getPeriodHolidayContext: getPeriodHolidayContext,
        normalizeHolidayItems: normalizeHolidayItems
    };
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const domain = simulator.domain = simulator.domain || {};
    const scalesDomain = domain.scales;

    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    function parseDate(value) {
        if (!value) return null;
        if (value instanceof Date) {
            return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        }

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
        if (!match) return null;
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    function addDays(date, days) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + Number(days || 0));
    }

    function toIso(year, month, day) {
        return String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }

    function roundToSingleDecimal(value) {
        return Number((Number(value) || 0).toFixed(1));
    }

    function getOperationDailyHours(operationType, input) {
        if (input && Number(input.operationHoursPerDay) > 0) {
            return roundToSingleDecimal(input.operationHoursPerDay);
        }
        if (operationType === '24h') return 24;
        if (operationType === '12h') return 12;
        return 8;
    }

    function getRequiredAssignmentsPerDay(scale, operationType, input) {
        if (input && Number(input.assignmentsPerDay) > 0) {
            return Math.max(1, Math.round(Number(input.assignmentsPerDay)));
        }

        if (!scale) return 0;

        if (scale.id === '24x48') {
            return 1;
        }

        if (scale.shiftHours === 24) {
            return 1;
        }

        if (scale.shiftHours === 12) {
            return operationType === '24h' ? 2 : 1;
        }

        if (operationType === '24h') return 3;
        if (operationType === '12h') return 2;
        return 1;
    }

    function isOperationDay(scale, input, date, holidayContext) {
        if (!scale) return false;

        const iso = toIso(date.getFullYear(), date.getMonth() + 1, date.getDate());
        const holidaySet = holidayContext && (holidayContext.set || holidayContext.monthSet);
        const isHoliday = !!(holidaySet && holidaySet.has(iso));
        if (isHoliday && !input.worksHolidays) return false;

        const dayOfWeek = date.getDay();
        if (dayOfWeek === 6) return !!input.worksSaturday;
        if (dayOfWeek === 0) return !!input.worksSunday;
        return true;
    }

    function buildPeriodEntries(input, holidayContext) {
        const entries = [];
        const start = parseDate(input.periodStart) || new Date(input.year, input.month - 1, 1);
        const end = parseDate(input.periodEnd) || addDays(start, Math.max(0, Number(input.periodDays || getDaysInMonth(input.year, input.month)) - 1));
        const safeStart = start <= end ? start : end;
        const safeEnd = start <= end ? end : start;
        const holidaySet = holidayContext && (holidayContext.set || holidayContext.monthSet);

        for (let current = new Date(safeStart.getFullYear(), safeStart.getMonth(), safeStart.getDate()); current <= safeEnd; current = addDays(current, 1)) {
            const iso = toIso(current.getFullYear(), current.getMonth() + 1, current.getDate());
            entries.push({
                date: new Date(current.getFullYear(), current.getMonth(), current.getDate()),
                iso: iso,
                day: current.getDate(),
                month: current.getMonth() + 1,
                year: current.getFullYear(),
                dayOfWeek: current.getDay(),
                holiday: !!(holidaySet && holidaySet.has(iso))
            });
        }

        return entries;
    }

    function buildCalendarContext(input, holidayContext) {
        const scale = scalesDomain.getScale(input.scaleId);
        const dayEntries = buildPeriodEntries(input, holidayContext);
        const totalDays = dayEntries.length;
        const calendar = {
            year: input.year,
            month: input.month,
            totalDays: totalDays,
            dayEntries: dayEntries,
            weekdayCount: 0,
            saturdayCount: 0,
            sundayCount: 0,
            holidayCount: holidayContext ? holidayContext.count : 0,
            holidayOnWeekdayCount: 0,
            operatedDays: 0,
            operatedWeekdays: 0,
            operatedSaturdayCount: 0,
            operatedSundayCount: 0,
            operatedHolidayCount: 0,
            operatesOnlyWeekdays: false
        };

        dayEntries.forEach(function (entry) {
            const date = entry.date;
            const dayOfWeek = entry.dayOfWeek;
            const isHoliday = entry.holiday;

            if (dayOfWeek === 0) {
                calendar.sundayCount += 1;
            } else if (dayOfWeek === 6) {
                calendar.saturdayCount += 1;
            } else {
                calendar.weekdayCount += 1;
            }

            if (isHoliday && dayOfWeek !== 0 && dayOfWeek !== 6) {
                calendar.holidayOnWeekdayCount += 1;
            }

            if (!isOperationDay(scale, input, date, holidayContext)) {
                return;
            }

            calendar.operatedDays += 1;

            if (dayOfWeek === 0) {
                calendar.operatedSundayCount += 1;
            } else if (dayOfWeek === 6) {
                calendar.operatedSaturdayCount += 1;
            } else {
                calendar.operatedWeekdays += 1;
            }

            if (isHoliday) {
                calendar.operatedHolidayCount += 1;
            }
        });

        calendar.operatesOnlyWeekdays = calendar.operatedDays === calendar.operatedWeekdays;

        return calendar;
    }

    function getCycleCapacityDays(totalDays, operatedDays, ratio) {
        return Math.max(1, Math.min(operatedDays, Math.round(totalDays * ratio)));
    }

    function estimateAutomaticMonthlyHours(scale, input, calendar) {
        if (!scale) return 0;

        switch (scale.id) {
        case '5x2':
            return Math.max(0, calendar.operatedWeekdays * 8);
        case '5x1':
            return getCycleCapacityDays(calendar.totalDays, calendar.operatedDays, 5 / 6) * 8;
        case '6x1':
            return getCycleCapacityDays(calendar.totalDays, calendar.operatedDays, 6 / 7) * 8;
        case '6x2':
            return getCycleCapacityDays(calendar.totalDays, calendar.operatedDays || calendar.totalDays, 6 / 8) * 8;
        case '12x36':
            return Math.round((calendar.operatedDays || calendar.totalDays) * 0.5) * 12;
        case '4x2':
            return Math.round((calendar.operatedDays || calendar.totalDays) * (4 / 6)) * 12;
        case '12x60':
            return Math.round((calendar.operatedDays || calendar.totalDays) * (1 / 3)) * 12;
        case '24x48':
            return Math.round((calendar.operatedDays || calendar.totalDays) * (1 / 3)) * 24;
        default:
            return 0;
        }
    }

    function calculateHoursDrivenHeadcount(totalOperationHours, effectiveHoursReference) {
        const totalHours = Math.max(0, Number(totalOperationHours) || 0);
        const perEmployee = Math.max(1, Number(effectiveHoursReference) || 0);
        return Math.max(1, Math.ceil(totalHours / perEmployee));
    }

    function finalizeFormula(scale, input, formula) {
        const usedHoursOverride = Number(input.hoursOverride) > 0;
        const effectiveHoursReference = usedHoursOverride ? Number(input.hoursOverride) : Number(formula.automaticHours);
        const hoursDrivenHeadcount = calculateHoursDrivenHeadcount(formula.totalOperationHours, effectiveHoursReference);
        const scenarioMinimumHeadcount = Math.max(formula.quadroMinimo, hoursDrivenHeadcount);

        formula.scaleId = scale.id;
        formula.operationType = input.operationType;
        formula.effectiveHoursReference = roundToSingleDecimal(effectiveHoursReference);
        formula.usedHoursOverride = usedHoursOverride;
        formula.assignmentHours = roundToSingleDecimal(Number(input.assignmentHours) || scale.shiftHours || 0);
        formula.hoursDrivenHeadcount = hoursDrivenHeadcount;
        formula.scenarioMinimumHeadcount = scenarioMinimumHeadcount;
        formula.scenarioHeadcountPerPost = Math.max(1, Math.ceil(scenarioMinimumHeadcount / Math.max(1, input.postos)));

        return formula;
    }

    function buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay) {
        const hoursPerDayPerPost = roundToSingleDecimal(Number(input.laborHoursPerDayPerPost) || getOperationDailyHours(input.operationType, input));
        const hoursPerDay = hoursPerDayPerPost * input.postos;

        return finalizeFormula(scale, input, {
            assignmentsPerDay: assignmentsPerDay,
            headcountPerPost: headcountPerPost,
            quadroMinimo: Math.max(input.postos, input.postos * headcountPerPost),
            automaticHours: roundToSingleDecimal(automaticHours),
            hoursPerDay: hoursPerDay,
            hoursPerDayPerPost: hoursPerDayPerPost,
            totalOperationHours: calendar.operatedDays * hoursPerDay,
            calendar: calendar
        });
    }

    function calculate5x2(scale, input, calendar, automaticHours) {
        const weekdayCapacity = Math.max(1, calendar.operatedWeekdays || calendar.weekdayCount);
        const assignmentsPerDay = getRequiredAssignmentsPerDay(scale, input.operationType, input);
        const totalAssignments = calendar.operatedDays * assignmentsPerDay;
        let headcountPerPost = 1;

        if (!(input.operationType === 'diurna' && calendar.operatesOnlyWeekdays)) {
            headcountPerPost = Math.max(1, Math.ceil(totalAssignments / weekdayCapacity));
        }

        return buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay);
    }

    function calculate5x1(scale, input, calendar, automaticHours) {
        const capacityDays = getCycleCapacityDays(calendar.totalDays, calendar.operatedDays, 5 / 6);
        const assignmentsPerDay = getRequiredAssignmentsPerDay(scale, input.operationType, input);
        const totalAssignments = calendar.operatedDays * assignmentsPerDay;
        const headcountPerPost = Math.max(1, Math.ceil(totalAssignments / capacityDays));

        return buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay);
    }

    function calculate6x1(scale, input, calendar, automaticHours) {
        const capacityDays = getCycleCapacityDays(calendar.totalDays, calendar.operatedDays, 6 / 7);
        const assignmentsPerDay = getRequiredAssignmentsPerDay(scale, input.operationType, input);
        const totalAssignments = calendar.operatedDays * assignmentsPerDay;
        const headcountPerPost = Math.max(1, Math.ceil(totalAssignments / capacityDays));

        return buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay);
    }

    function calculate6x2(scale, input, calendar, automaticHours) {
        const baseOperatedDays = calendar.operatedDays || calendar.totalDays;
        const capacityDays = getCycleCapacityDays(calendar.totalDays, baseOperatedDays, 6 / 8);
        const assignmentsPerDay = getRequiredAssignmentsPerDay(scale, input.operationType, input);
        const totalAssignments = baseOperatedDays * assignmentsPerDay;
        const headcountPerPost = Math.max(1, Math.ceil(totalAssignments / capacityDays));

        return buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay);
    }

    function calculate12x36(scale, input, calendar, automaticHours) {
        const assignmentsPerDay = getRequiredAssignmentsPerDay(scale, input.operationType, input);
        const headcountPerPost = Math.max(2, assignmentsPerDay * 2);
        return buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay);
    }

    function calculate24x48(scale, input, calendar, automaticHours) {
        const assignmentsPerDay = getRequiredAssignmentsPerDay(scale, input.operationType, input);
        const headcountPerPost = Math.max(3, assignmentsPerDay * 3);
        return buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay);
    }

    function calculate4x2(scale, input, calendar, automaticHours) {
        const assignmentsPerDay = getRequiredAssignmentsPerDay(scale, input.operationType, input);
        const headcountPerPost = assignmentsPerDay >= 3 ? 3 : 2;
        return buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay);
    }

    function calculate12x60(scale, input, calendar, automaticHours) {
        const assignmentsPerDay = getRequiredAssignmentsPerDay(scale, input.operationType, input);
        const headcountPerPost = Math.max(3, assignmentsPerDay * 3);
        return buildFormulaBase(scale, input, calendar, automaticHours, headcountPerPost, assignmentsPerDay);
    }

    const FORMULA_BY_SCALE = {
        '5x2': calculate5x2,
        '5x1': calculate5x1,
        '6x1': calculate6x1,
        '6x2': calculate6x2,
        '12x36': calculate12x36,
        '24x48': calculate24x48,
        '4x2': calculate4x2,
        '12x60': calculate12x60
    };

    function generateEmployeeIds(count) {
        const total = Math.max(0, Number(count) || 0);
        const ids = [];

        for (let index = 0; index < total; index++) {
            let current = index;
            let label = '';

            while (current >= 0) {
                label = String.fromCharCode((current % 26) + 65) + label;
                current = Math.floor(current / 26) - 1;
            }

            ids.push(label);
        }

        return ids;
    }

    function isEmployeeWorking(scale, dayIndex, employeeIndex, date) {
        if (scale.cycleType === 'week') {
            return scale.weeklyOffDays.indexOf(date.getDay()) === -1;
        }

        const pattern = scale.cyclePattern || [];
        if (!pattern.length) return false;
        const position = (dayIndex + employeeIndex) % pattern.length;
        return pattern[position] === 'T';
    }

    function simulateSchedule(scale, input, formula, holidayContext, employeeCount) {
        const totalEmployees = Math.max(1, Number(employeeCount) || Number(formula.quadroMinimo) || 1);
        const employees = generateEmployeeIds(totalEmployees);
        const assignmentHours = Number(formula.assignmentHours) || Number(scale.shiftHours) || 0;
        const requiredHoursPerDay = Number(formula.hoursPerDay) || (getOperationDailyHours(input.operationType, input) * input.postos);

        const stats = {
            hours: {},
            assignments: {},
            weekendAssignments: {},
            lastAssignedDay: {}
        };

        employees.forEach(function (employeeId) {
            stats.hours[employeeId] = 0;
            stats.assignments[employeeId] = 0;
            stats.weekendAssignments[employeeId] = 0;
            stats.lastAssignedDay[employeeId] = -999;
        });

        const days = [];
        let coveredHoursTotal = 0;
        let requiredHoursTotal = 0;
        let assignedHoursTotal = 0;
        let operatedDays = 0;
        let coveredDays = 0;

        (formula.calendar.dayEntries || []).forEach(function (entry, dayIndex) {
            const date = entry.date;
            const iso = entry.iso;
            const holidaySet = holidayContext && (holidayContext.set || holidayContext.monthSet);
            const holiday = !!(holidaySet && holidaySet.has(iso));
            const operated = isOperationDay(scale, input, date, holidayContext);
            const weekend = date.getDay() === 0 || date.getDay() === 6;
            const requiredAssignments = operated ? formula.assignmentsPerDay * input.postos : 0;
            const available = operated ? employees.filter(function (employeeId, employeeIndex) {
                return isEmployeeWorking(scale, dayIndex, employeeIndex, date);
            }) : [];

            available.sort(function (left, right) {
                if (stats.assignments[left] !== stats.assignments[right]) {
                    return stats.assignments[left] - stats.assignments[right];
                }

                if (weekend && stats.weekendAssignments[left] !== stats.weekendAssignments[right]) {
                    return stats.weekendAssignments[left] - stats.weekendAssignments[right];
                }

                if (stats.hours[left] !== stats.hours[right]) {
                    return stats.hours[left] - stats.hours[right];
                }

                if (stats.lastAssignedDay[left] !== stats.lastAssignedDay[right]) {
                    return stats.lastAssignedDay[left] - stats.lastAssignedDay[right];
                }

                return left.localeCompare(right);
            });

            const assigned = available.slice(0, requiredAssignments);
            const assignedHours = assigned.length * assignmentHours;
            const coveredHours = Math.min(requiredHoursPerDay, assignedHours);
            const deficit = operated ? Math.max(0, requiredAssignments - assigned.length) : 0;

            if (operated) {
                operatedDays += 1;
                requiredHoursTotal += requiredHoursPerDay;
                coveredHoursTotal += coveredHours;
                assignedHoursTotal += assignedHours;

                if (coveredHours >= requiredHoursPerDay) {
                    coveredDays += 1;
                }
            }

            assigned.forEach(function (employeeId) {
                stats.hours[employeeId] += assignmentHours;
                stats.assignments[employeeId] += 1;
                stats.lastAssignedDay[employeeId] = dayIndex + 1;

                if (weekend) {
                    stats.weekendAssignments[employeeId] += 1;
                }
            });

            days.push({
                day: entry.day,
                iso: iso,
                month: entry.month,
                year: entry.year,
                holiday: holiday,
                weekend: weekend,
                operated: operated,
                assigned: assigned,
                off: employees.filter(function (employeeId) {
                    return assigned.indexOf(employeeId) === -1;
                }),
                requiredAssignments: requiredAssignments,
                assignedHours: assignedHours,
                requiredHours: operated ? requiredHoursPerDay : 0,
                coveredHours: coveredHours,
                deficit: deficit
            });
        });

        const employeeHours = employees.map(function (employeeId) {
            return stats.hours[employeeId];
        });
        const maxHours = employeeHours.length ? Math.max.apply(null, employeeHours) : 0;
        const minHours = employeeHours.length ? Math.min.apply(null, employeeHours) : 0;

        return {
            employees: employees,
            days: days,
            stats: stats,
            operatedDays: operatedDays,
            coveredDays: coveredDays,
            coveragePct: requiredHoursTotal ? Number(((coveredHoursTotal / requiredHoursTotal) * 100).toFixed(1)) : 100,
            averageHours: employees.length ? Number((assignedHoursTotal / employees.length).toFixed(1)) : 0,
            maxHours: maxHours,
            minHours: minHours,
            imbalanceHours: Math.max(0, maxHours - minHours),
            uncoveredHours: Math.max(0, requiredHoursTotal - coveredHoursTotal),
            excessHours: Math.max(0, assignedHoursTotal - requiredHoursTotal)
        };
    }

    function findOperationalHeadcount(scale, input, formula, holidayContext) {
        const start = Math.max(formula.scenarioMinimumHeadcount, formula.quadroMinimo);
        const maxSearch = start + Math.max(8, input.postos * 8);
        let lastSimulation = null;
        let lastHeadcount = start;

        for (let current = start; current <= maxSearch; current++) {
            const simulation = simulateSchedule(scale, input, formula, holidayContext, current);
            lastSimulation = simulation;
            lastHeadcount = current;

            if (simulation.coveragePct >= 100) {
                return {
                    headcount: current,
                    simulation: simulation,
                    limitReached: false
                };
            }
        }

        return {
            headcount: lastHeadcount,
            simulation: lastSimulation || simulateSchedule(scale, input, formula, holidayContext, start),
            limitReached: true
        };
    }

    function calculateScaleFormula(input, holidayContext) {
        const scale = scalesDomain.getScale(input.scaleId);
        if (!scale) {
            return null;
        }

        const calendar = buildCalendarContext(input, holidayContext);
        const automaticHours = estimateAutomaticMonthlyHours(scale, input, calendar);
        const calculator = FORMULA_BY_SCALE[scale.id];
        const formula = calculator ? calculator(scale, input, calendar, automaticHours) : null;

        if (!formula) {
            return null;
        }

        const operational = findOperationalHeadcount(scale, input, formula, holidayContext);

        return {
            scale: scale,
            year: input.year,
            month: input.month,
            calendar: calendar,
            formula: formula,
            operationalHeadcount: operational.headcount,
            simulation: operational.simulation,
            searchLimitReached: operational.limitReached
        };
    }

    domain.formulas = {
        getDaysInMonth: getDaysInMonth,
        getOperationDailyHours: getOperationDailyHours,
        getRequiredAssignmentsPerDay: getRequiredAssignmentsPerDay,
        buildCalendarContext: buildCalendarContext,
        estimateAutomaticMonthlyHours: estimateAutomaticMonthlyHours,
        calculateHoursDrivenHeadcount: calculateHoursDrivenHeadcount,
        calculateScaleFormula: calculateScaleFormula,
        generateEmployeeIds: generateEmployeeIds,
        simulateSchedule: simulateSchedule
    };
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const domain = simulator.domain = simulator.domain || {};
    const scalesDomain = domain.scales;

    function roundToSingleDecimal(value) {
        return Number((Number(value) || 0).toFixed(1));
    }

    function buildCompatibility(scale, operationType) {
        const code = scalesDomain.getCompatibilityCode(scale.id, operationType);

        if (code === 'alta') {
            return { code: code, label: 'Alta aderência' };
        }

        if (code === 'media') {
            return { code: code, label: 'Compatível' };
        }

        if (code === 'baixa') {
            return { code: code, label: 'Compatível com alerta' };
        }

        return { code: code, label: 'Operação incompatível' };
    }

    function pushUnique(list, message) {
        if (!message) return;
        if (list.indexOf(message) === -1) {
            list.push(message);
        }
    }

    function buildHoursComparison(scale, bundle) {
        const referenceHours = roundToSingleDecimal(bundle.formula.automaticHours);
        const consideredHours = roundToSingleDecimal(bundle.formula.effectiveHoursReference);
        const profile = scalesDomain.getHoursValidationProfile(scale.id);
        const lowerAlert = roundToSingleDecimal(referenceHours * profile.lowerAlertPct);
        const lowerAccept = roundToSingleDecimal(referenceHours * profile.lowerAcceptPct);
        const upperAccept = roundToSingleDecimal(referenceHours * profile.upperAcceptPct);
        const upperAlert = roundToSingleDecimal(referenceHours * profile.upperAlertPct);
        const deltaHours = roundToSingleDecimal(consideredHours - referenceHours);
        const deltaPct = referenceHours ? Number((((consideredHours - referenceHours) / referenceHours) * 100).toFixed(1)) : 0;

        let code = 'standard';
        let label = 'Dentro do padrão';
        let shortMessage = 'A carga informada segue a referência natural da escala para o mês.';
        let detailMessage = 'A leitura pode ser tratada como cenário padrão da escala.';

        if (consideredHours < lowerAlert || consideredHours > upperAlert) {
            code = 'incompatible';
            label = 'Incompatível com a escala';
            shortMessage = 'O valor informado extrapola a capacidade natural da escala ou do ciclo.';
            detailMessage = 'Este cenário não pode ser tratado como padrão porque foge da faixa parametrizada da escala.';
        } else if (consideredHours < lowerAccept) {
            code = 'below_reference';
            label = 'Abaixo da referência';
            shortMessage = 'Horas abaixo da referência do mês. A cobertura tende a exigir mais pessoas.';
            detailMessage = 'O quadro mínimo foi recalculado para cima para preservar a cobertura com menor disponibilidade por colaborador.';
        } else if (consideredHours > upperAccept) {
            code = 'above_reference';
            label = 'Acima da referência';
            shortMessage = 'Horas acima da referência do mês. Isso tende a depender de compensação ou ajuste coletivo.';
            detailMessage = 'A leitura foi mantida com alerta porque esse volume pode depender de horas extras, banco de horas ou compensação.';
        }

        return {
            code: code,
            label: label,
            shortMessage: shortMessage,
            detailMessage: detailMessage,
            referenceHours: referenceHours,
            consideredHours: consideredHours,
            deltaHours: deltaHours,
            deltaPct: deltaPct,
            ranges: {
                lowerAlert: lowerAlert,
                lowerAccept: lowerAccept,
                upperAccept: upperAccept,
                upperAlert: upperAlert
            }
        };
    }

    function buildStatus(compatibility, hoursComparison, bundle) {
        if (compatibility.code === 'incompativel' || hoursComparison.code === 'incompatible') {
            return { code: 'incompatible', label: 'Incompatível com a escala' };
        }

        if (bundle.searchLimitReached || bundle.simulation.coveragePct < 100) {
            return { code: 'incompatible', label: 'Incompatível com a escala' };
        }

        if (hoursComparison.code === 'below_reference') {
            return { code: 'below_reference', label: 'Abaixo da referência' };
        }

        if (hoursComparison.code === 'above_reference') {
            return { code: 'above_reference', label: 'Acima da referência' };
        }

        return { code: 'standard', label: 'Dentro do padrão' };
    }

    function validateScale(bundle, input, holidayContext) {
        const scale = bundle.scale;
        const formula = bundle.formula;
        const simulation = bundle.simulation;
        const compatibility = buildCompatibility(scale, input.operationType);
        const hoursComparison = buildHoursComparison(scale, bundle);
        const status = buildStatus(compatibility, hoursComparison, bundle);
        const alerts = [];
        const observations = [];
        const legalNotes = [];
        const coverageCriterionNote = scalesDomain.getCoverageCriterionNote(scale.id);

        if (status.code === 'below_reference') {
            pushUnique(alerts, 'Horas abaixo da referência aumentam a necessidade de equipe para fechar o mês.');
        }

        if (status.code === 'above_reference') {
            pushUnique(alerts, 'Horas acima da referência podem depender de compensação, horas extras ou ajuste coletivo.');
        }

        if (hoursComparison.code === 'incompatible') {
            pushUnique(alerts, 'As horas informadas extrapolam a capacidade natural da escala ou do ciclo.');
        }

        if (compatibility.code === 'incompativel') {
            pushUnique(alerts, 'O tipo de operação informado não é aderente a esta escala.');
        } else if (compatibility.code === 'baixa') {
            pushUnique(observations, 'A combinação entre escala e operação é possível, mas exige monitoramento mais atento.');
        }

        if (formula.scenarioMinimumHeadcount > formula.quadroMinimo) {
            pushUnique(observations, 'O quadro mínimo foi ampliado pela comparação entre horas consideradas e horas totais da operação.');
        }

        if (bundle.operationalHeadcount > formula.scenarioMinimumHeadcount) {
            pushUnique(observations, 'A distribuição do ciclo pediu reforço adicional para fechar todos os dias operados.');
        }

        if (bundle.searchLimitReached || simulation.coveragePct < 100) {
            pushUnique(alerts, 'Mesmo com reforço de quadro, a cobertura ainda pede revisão manual.');
        }

        if ((scale.id === '5x1' || scale.id === '6x1') && input.worksSunday) {
            pushUnique(alerts, 'Cobertura aos domingos nesta escala exige controle rigoroso do descanso semanal.');
        }

        if (!scale.continuous && !input.worksSaturday && input.worksSunday) {
            pushUnique(alerts, 'Cobertura apenas no domingo é pouco aderente e deve ser validada com a operação.');
        }

        if (!scale.continuous && input.worksSaturday && input.worksSunday && scale.id === '5x2') {
            pushUnique(observations, 'Na 5x2, operar sábado e domingo tende a exigir revezamento e compensação adicional.');
        }

        if (!scale.continuous && input.worksSunday && !input.worksSaturday && scale.id === '5x2') {
            pushUnique(alerts, 'Na 5x2, operar só domingo não acompanha o padrão natural de dias úteis da escala.');
        }

        if (!scale.continuous && holidayContext.count > 0 && !input.worksHolidays) {
            pushUnique(observations, 'Os feriados do período foram abatidos da referência mensal e dos dias operados.');
        }

        if (!scale.continuous && holidayContext.count > 0 && input.worksHolidays) {
            pushUnique(observations, 'Os feriados do período foram mantidos dentro da referência e da cobertura do mês.');
        }

        if (scale.continuous && holidayContext.count > 0) {
            pushUnique(observations, 'Nesta escala contínua, feriados não reduzem a referência natural do ciclo.');
        }

        if (coverageCriterionNote) {
            pushUnique(observations, coverageCriterionNote);
        }

        if (simulation.imbalanceHours >= scale.shiftHours * 2) {
            pushUnique(observations, 'Há concentração de horas em parte da equipe e vale revisar a distribuição final.');
        }

        if (simulation.maxHours > 220) {
            pushUnique(alerts, 'A leitura mensal chegou a uma faixa alta de horas e pede validação da jornada real.');
        }

        if (scale.id === '12x36' || scale.id === '24x48' || scale.id === '12x60') {
            pushUnique(legalNotes, 'Verifique exigência de norma coletiva ou política interna antes da implantação.');
        }

        if (scale.id === '24x48') {
            pushUnique(legalNotes, 'Turnos longos pedem validação formal de jornada, descanso e cobertura real da equipe.');
        }

        if (scale.id === '5x1' || scale.id === '6x1') {
            pushUnique(legalNotes, 'A folga semanal precisa ser acompanhada com atenção para evitar desequilíbrio no ciclo.');
        }

        if (status.code === 'above_reference') {
            pushUnique(legalNotes, 'Acima da referência natural, a viabilidade pode depender de compensação válida e instrumento coletivo.');
        }

        return {
            compatibility: compatibility,
            status: status,
            hoursComparison: hoursComparison,
            alerts: alerts,
            observations: observations,
            legalNotes: legalNotes
        };
    }

    domain.validations = {
        validateScale: validateScale
    };
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const domain = simulator.domain = simulator.domain || {};

    function buildScenarioScore(candidate) {
        const input = candidate.input || {};
        const scaleId = candidate.scale.id;

        if (input.operationType === '24h') {
            if (scaleId === '12x36') return 22;
            if (scaleId === '4x2') return 18;
            if (scaleId === '24x48') return 10;
            if (scaleId === '12x60') return 8;
            if (scaleId === '6x2') return 4;
            return -22;
        }

        if (input.operationType === '12h') {
            if (scaleId === '12x36') return 18;
            if (scaleId === '4x2') return 16;
            if (scaleId === '12x60') return 10;
            if (scaleId === '24x48') return 2;
            if (scaleId === '6x2') return -2;
            return -14;
        }

        if (input.worksSaturday && !input.worksSunday) {
            if (scaleId === '6x1') return 18;
            if (scaleId === '5x1') return 14;
            if (scaleId === '6x2') return 10;
            if (scaleId === '5x2') return -8;
            return -10;
        }

        if (input.worksSunday) {
            if (scaleId === '6x2') return 18;
            if (scaleId === '6x1') return 8;
            if (scaleId === '5x1') return 6;
            if (scaleId === '5x2') return -16;
            return -8;
        }

        if (scaleId === '5x2') return 18;
        if (scaleId === '6x1') return 8;
        if (scaleId === '6x2') return 4;
        return -8;
    }

    function buildHiddenScore(candidate) {
        const scale = candidate.scale;
        const validation = candidate.validation;
        const bundle = candidate.bundle;
        let score = 0;

        score += (scale.marketUsage || 0) * 3;
        score += (scale.priority && scale.priority[bundle.formula.operationType] || 0) * 10;
        score -= (scale.legalRisk || 0) * 2;
        score -= (scale.operationalComplexity || 0) * 2;
        score += Math.max(0, Math.round(bundle.simulation.coveragePct || 0));
        score += buildScenarioScore(candidate);

        if (validation.compatibility.code === 'alta') score += 16;
        if (validation.compatibility.code === 'media') score += 8;
        if (validation.compatibility.code === 'baixa') score -= 6;
        if (validation.compatibility.code === 'incompativel') score -= 30;

        if (validation.status.code === 'standard') score += 10;
        if (validation.status.code === 'below_reference') score -= 2;
        if (validation.status.code === 'above_reference') score -= 5;
        if (validation.status.code === 'incompatible') score -= 24;

        score -= (validation.alerts || []).length * 4;
        score -= Math.max(0, bundle.operationalHeadcount - bundle.formula.quadroMinimo) * 3;
        return score;
    }

    function getAlternativeTag(candidate, suggestedScaleId) {
        if (candidate.scale.id === suggestedScaleId) {
            return 'Mais indicada';
        }

        if (candidate.validation.status.code === 'standard' && candidate.validation.compatibility.code !== 'baixa') {
            return 'Alternativa compatível';
        }

        return 'Alternativa com alerta';
    }

    function suggestScale(candidates) {
        const ranked = (candidates || []).map(function (candidate) {
            return Object.assign({}, candidate, {
                hiddenScore: buildHiddenScore(candidate)
            });
        }).sort(function (left, right) {
            return right.hiddenScore - left.hiddenScore;
        });

        const suggested = ranked[0] || null;
        const alternatives = ranked.filter(function (candidate) {
            return suggested && candidate.scale.id !== suggested.scale.id;
        }).filter(function (candidate) {
            return candidate.validation.compatibility.code !== 'incompativel' && candidate.validation.status.code !== 'incompatible';
        }).slice(0, 3).map(function (candidate) {
            return {
                id: candidate.scale.id,
                label: candidate.scale.label,
                tag: getAlternativeTag(candidate, suggested.scale.id)
            };
        });

        return {
            suggested: suggested,
            alternatives: alternatives
        };
    }

    domain.suggestions = {
        suggestScale: suggestScale
    };
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const domain = simulator.domain = simulator.domain || {};

    const SCALE_EXPLANATIONS = {
        '5x2': 'A referência mensal foi montada sobre os dias úteis operados e a jornada padrão da escala 5x2.',
        '5x1': 'A referência mensal considera o ciclo 5x1, a folga rotativa e os dias realmente operados no mês.',
        '6x1': 'O cálculo cruza o ciclo 6x1 com sábado, domingo e feriados para estimar a referência e o quadro mínimo.',
        '6x2': 'A leitura considera o revezamento 6x2, a quantidade de turnos do cenário e o impacto do mês selecionado.',
        '12x36': 'A escala 12x36 foi tratada com revezamento contínuo e comparação entre a referência natural e as horas informadas.',
        '24x48': 'A escala 24x48 foi avaliada com base no ciclo longo de descanso e na cobertura contínua do posto.',
        '4x2': 'A escala 4x2 foi tratada pelo padrão prático de cobertura do mercado para este tipo de operação.',
        '12x60': 'A escala 12x60 considera o descanso ampliado do ciclo e a necessidade de equipe para manter a continuidade.'
    };

    function getScaleExplanation(scaleId) {
        return SCALE_EXPLANATIONS[scaleId] || 'O sistema combinou o ciclo da escala com a operação do mês.';
    }

    function getRestrictionsExplanation(validation) {
        if (!validation || !validation.hoursComparison) {
            return 'Sem restrições críticas na leitura inicial do cenário.';
        }

        return validation.hoursComparison.detailMessage;
    }

    function getLegalSummary(scale, validation) {
        if (validation && validation.legalNotes && validation.legalNotes.length) {
            return validation.legalNotes[0];
        }

        return scale && scale.legalProfile
            ? scale.legalProfile
            : 'Esta estimativa é operacional e não substitui validação jurídica.';
    }

    function getCoverageSummary(bundle, validation) {
        const simulation = bundle && bundle.simulation;
        if (!simulation) {
            return 'Cobertura não disponível para este cenário.';
        }

        if (validation && validation.status && validation.status.code === 'incompatible') {
            return 'O cenário saiu da faixa padrão da escala e precisa de revisão antes de implantação.';
        }

        if (validation && validation.status && validation.status.code === 'below_reference') {
            return 'A cobertura foi preservada com reforço de quadro por causa das horas informadas abaixo da referência.';
        }

        if (validation && validation.status && validation.status.code === 'above_reference') {
            return 'A cobertura foi lida com alerta porque as horas informadas superam a referência natural da escala.';
        }

        if (simulation.coveragePct >= 100) {
            return 'Cobertura compatível com o padrão natural da escala para o mês analisado.';
        }

        return 'A distribuição do mês ainda deixa lacunas e precisa de ajuste operacional.';
    }

    function getBuildSummary() {
        return 'O sistema cruza escala, mês, operação, sábado, domingo, feriados, horas de referência e horas consideradas para montar o quadro mínimo.';
    }

    domain.explanations = {
        getScaleExplanation: getScaleExplanation,
        getRestrictionsExplanation: getRestrictionsExplanation,
        getLegalSummary: getLegalSummary,
        getCoverageSummary: getCoverageSummary,
        getBuildSummary: getBuildSummary
    };
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const services = simulator.services = simulator.services || {};
    const scalesDomain = simulator.domain && simulator.domain.scales;
    const holidaysDomain = simulator.domain && simulator.domain.holidays;
    const formulasDomain = simulator.domain && simulator.domain.formulas;
    const validationsDomain = simulator.domain && simulator.domain.validations;
    const suggestionsDomain = simulator.domain && simulator.domain.suggestions;
    const explanationsDomain = simulator.domain && simulator.domain.explanations;

    const PT_DATE = new Intl.DateTimeFormat('pt-BR');

    function roundToSingleDecimal(value) {
        return Number((Number(value) || 0).toFixed(1));
    }

    function parseDate(value) {
        if (!value) return null;
        if (value instanceof Date) {
            return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        }

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
        if (!match) return null;
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    function toIso(date) {
        if (!(date instanceof Date)) return '';
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }

    function formatDate(date) {
        return date instanceof Date ? PT_DATE.format(date) : '';
    }

    function parseTimeToMinutes(value, fallback) {
        const match = /^(\d{2}):(\d{2})$/.exec(String(value || '').trim());
        if (!match) return fallback;
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return fallback;
        return (hours * 60) + minutes;
    }

    function formatMinutes(minutes) {
        const safe = ((Number(minutes) || 0) % 1440 + 1440) % 1440;
        const hours = Math.floor(safe / 60);
        const mins = safe % 60;
        return String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
    }

    function normalizeInterval(startMinutes, endMinutes) {
        const safeStart = Number(startMinutes) || 0;
        let safeEnd = Number(endMinutes);
        if (!Number.isFinite(safeEnd)) safeEnd = safeStart + 60;
        if (safeEnd <= safeStart) safeEnd += 1440;
        return {
            startMinutes: safeStart,
            endMinutes: safeEnd,
            durationHours: roundToSingleDecimal((safeEnd - safeStart) / 60)
        };
    }

    function mergeIntervals(intervals) {
        const sorted = (intervals || []).slice().sort(function (left, right) {
            return left.startMinutes - right.startMinutes;
        });
        const merged = [];

        sorted.forEach(function (interval) {
            const last = merged[merged.length - 1];
            if (!last || interval.startMinutes > last.endMinutes) {
                merged.push({
                    startMinutes: interval.startMinutes,
                    endMinutes: interval.endMinutes
                });
                return;
            }

            last.endMinutes = Math.max(last.endMinutes, interval.endMinutes);
        });

        return merged;
    }

    function buildSequentialShifts(startMinutes, endMinutes, count) {
        const totalMinutes = Math.max(60, endMinutes - startMinutes);
        const safeCount = Math.max(1, Number(count) || 1);
        const step = totalMinutes / safeCount;
        const shifts = [];

        for (let index = 0; index < safeCount; index += 1) {
            const currentStart = Math.round(startMinutes + (step * index));
            const currentEnd = index === safeCount - 1
                ? endMinutes
                : Math.round(startMinutes + (step * (index + 1)));
            const interval = normalizeInterval(currentStart, currentEnd);
            shifts.push({
                label: 'Turno ' + (index + 1),
                start: formatMinutes(interval.startMinutes),
                end: formatMinutes(interval.endMinutes),
                startMinutes: interval.startMinutes,
                endMinutes: interval.endMinutes,
                durationHours: interval.durationHours
            });
        }

        return shifts;
    }

    function buildManualShifts(rawShifts, count, fallbackStart, fallbackEnd) {
        const items = Array.isArray(rawShifts) ? rawShifts : [];
        const shifts = [];

        for (let index = 0; index < Math.max(1, count); index += 1) {
            const raw = items[index] || {};
            const baseStart = parseTimeToMinutes(raw.start, fallbackStart);
            const baseEnd = parseTimeToMinutes(raw.end, fallbackEnd);
            const interval = normalizeInterval(baseStart, baseEnd);
            shifts.push({
                label: 'Turno ' + (index + 1),
                start: formatMinutes(interval.startMinutes),
                end: formatMinutes(interval.endMinutes),
                startMinutes: interval.startMinutes,
                endMinutes: interval.endMinutes,
                durationHours: interval.durationHours
            });
        }

        return shifts;
    }

    function deriveOperationType(coverageHours, shiftCount, averageShiftHours) {
        if (coverageHours >= 20 || averageShiftHours >= 20) {
            return '24h';
        }

        if (coverageHours > 9 || shiftCount > 1 || averageShiftHours >= 10) {
            return '12h';
        }

        return 'diurna';
    }

    function buildShiftPlan(input) {
        const startMinutes = parseTimeToMinutes(input.operationStart || input.startTime, 8 * 60);
        const endMinutes = parseTimeToMinutes(input.operationEnd || input.endTime, 17 * 60);
        const mainInterval = normalizeInterval(startMinutes, endMinutes);
        const requestedShiftCount = Math.max(1, Number(input.shiftCount) || Number(input.turnos) || 1);
        const wantsOverlap = !!input.hasOverlap;
        const shifts = wantsOverlap
            ? buildManualShifts(input.shifts, requestedShiftCount, mainInterval.startMinutes, mainInterval.endMinutes)
            : buildSequentialShifts(mainInterval.startMinutes, mainInterval.endMinutes, requestedShiftCount);
        const merged = mergeIntervals(shifts);
        const laborMinutes = shifts.reduce(function (total, shift) {
            return total + Math.max(0, shift.endMinutes - shift.startMinutes);
        }, 0);
        const coveredMinutes = merged.reduce(function (total, interval) {
            return total + Math.max(0, interval.endMinutes - interval.startMinutes);
        }, 0);
        const overlapMinutes = Math.max(0, laborMinutes - coveredMinutes);
        const averageShiftHours = shifts.length ? roundToSingleDecimal((laborMinutes / 60) / shifts.length) : 0;
        const coverageHoursPerDay = roundToSingleDecimal(coveredMinutes / 60);
        const laborHoursPerDayPerPost = roundToSingleDecimal(laborMinutes / 60);

        return {
            operationStart: formatMinutes(mainInterval.startMinutes),
            operationEnd: formatMinutes(mainInterval.endMinutes),
            operationWindowLabel: formatMinutes(mainInterval.startMinutes) + ' às ' + formatMinutes(mainInterval.endMinutes),
            operationWindowHours: roundToSingleDecimal((mainInterval.endMinutes - mainInterval.startMinutes) / 60),
            shiftCount: shifts.length,
            assignmentsPerDay: shifts.length,
            shifts: shifts,
            hasOverlap: overlapMinutes > 0,
            overlapHours: roundToSingleDecimal(overlapMinutes / 60),
            coverageHoursPerDay: coverageHoursPerDay,
            laborHoursPerDayPerPost: laborHoursPerDayPerPost,
            assignmentHours: averageShiftHours || roundToSingleDecimal(mainInterval.durationHours),
            operationType: deriveOperationType(coverageHoursPerDay, shifts.length, averageShiftHours)
        };
    }

    function buildStandardContinuousPeriod() {
        const start = new Date(2026, 0, 5);
        const end = new Date(2026, 1, 3);
        const holiday = new Date(2026, 0, 19);

        return {
            start: start,
            end: end,
            holiday: holiday,
            label: 'Base padrão de 30 dias',
            note: 'Base padrão de 30 dias com 1 feriado de referência.'
        };
    }

    function normalizeInput(input) {
        const raw = input || {};
        const today = new Date();
        const simulationType = raw.simulationType === 'project' ? 'project' : 'continuous';
        const standardPeriod = buildStandardContinuousPeriod();
        const requestedStart = parseDate(raw.startDate) || new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const requestedEnd = parseDate(raw.endDate) || requestedStart;
        const safeStart = requestedStart <= requestedEnd ? requestedStart : requestedEnd;
        const safeEnd = requestedStart <= requestedEnd ? requestedEnd : requestedStart;
        const shiftPlan = buildShiftPlan(raw);

        return {
            scaleChoice: raw.scaleChoice || raw.scaleId || 'auto',
            simulationType: simulationType,
            periodMode: simulationType === 'project' ? 'project' : 'standard30',
            year: simulationType === 'project' ? safeStart.getFullYear() : standardPeriod.start.getFullYear(),
            month: simulationType === 'project' ? (safeStart.getMonth() + 1) : (standardPeriod.start.getMonth() + 1),
            periodStart: simulationType === 'project' ? toIso(safeStart) : toIso(standardPeriod.start),
            periodEnd: simulationType === 'project' ? toIso(safeEnd) : toIso(standardPeriod.end),
            periodDays: simulationType === 'project'
                ? Math.max(1, Math.round((safeEnd.getTime() - safeStart.getTime()) / 86400000) + 1)
                : 30,
            periodLabel: simulationType === 'project'
                ? formatDate(safeStart) + ' a ' + formatDate(safeEnd)
                : standardPeriod.label,
            periodNote: simulationType === 'project'
                ? 'Projeto temporário com datas reais.'
                : standardPeriod.note,
            standardHolidayIso: simulationType === 'project' ? '' : toIso(standardPeriod.holiday),
            postos: Math.max(1, Number(raw.postos || raw.simultaneousWorkers) || 1),
            operationStart: shiftPlan.operationStart,
            operationEnd: shiftPlan.operationEnd,
            operationWindowLabel: shiftPlan.operationWindowLabel,
            operationWindowHours: shiftPlan.operationWindowHours,
            shiftCount: shiftPlan.shiftCount,
            shifts: shiftPlan.shifts,
            hasOverlap: shiftPlan.hasOverlap,
            overlapHours: shiftPlan.overlapHours,
            operationType: shiftPlan.operationType,
            assignmentsPerDay: shiftPlan.assignmentsPerDay,
            operationHoursPerDay: shiftPlan.laborHoursPerDayPerPost,
            coverageHoursPerDay: shiftPlan.coverageHoursPerDay,
            laborHoursPerDayPerPost: shiftPlan.laborHoursPerDayPerPost,
            assignmentHours: shiftPlan.assignmentHours,
            worksSaturday: !!raw.worksSaturday,
            worksSunday: !!raw.worksSunday,
            worksHolidays: !!raw.worksHolidays,
            hoursOverride: Number(raw.hoursOverride) > 0 ? Number(raw.hoursOverride) : 0
        };
    }

    async function getHolidayContext(normalized) {
        if (normalized.simulationType === 'project') {
            const context = await holidaysDomain.getPeriodHolidayContext(normalized.periodStart, normalized.periodEnd);
            return {
                mode: 'project',
                start: context.start,
                end: context.end,
                items: context.periodItems,
                set: context.set,
                count: context.count,
                note: context.count ? 'Feriados reais do período.' : 'Sem feriados nacionais no período informado.'
            };
        }

        const items = normalized.standardHolidayIso ? [{
            date: normalized.standardHolidayIso,
            name: 'Feriado de referência',
            level: 'base'
        }] : [];

        return {
            mode: 'standard30',
            start: normalized.periodStart,
            end: normalized.periodEnd,
            items: items,
            set: new Set(items.map(function (item) {
                return item.date;
            })),
            count: items.length,
            note: normalized.periodNote
        };
    }

    function buildCoveragePlan(candidate) {
        const input = candidate.input;
        const bundle = candidate.bundle;
        const formula = bundle.formula;

        return {
            postos: input.postos,
            colaboradoresNecessarios: bundle.operationalHeadcount,
            colaboradoresPorPosto: Math.max(1, Math.ceil(bundle.operationalHeadcount / input.postos)),
            quadroPadrao: formula.quadroMinimo,
            quadroPorHoras: formula.scenarioMinimumHeadcount,
            quadroBasePorPosto: formula.headcountPerPost
        };
    }

    function buildHoursSummary(candidate) {
        const formula = candidate.bundle.formula;
        const comparison = candidate.validation.hoursComparison;

        return {
            reference: formula.automaticHours,
            considered: formula.effectiveHoursReference,
            suggested: formula.automaticHours,
            usesManualOverride: formula.usedHoursOverride,
            delta: comparison.deltaHours,
            deltaPct: comparison.deltaPct,
            ranges: comparison.ranges
        };
    }

    function buildScenarioSummary(candidate, holidayContext) {
        const input = candidate.input;
        const shiftLines = (input.shifts || []).map(function (shift) {
            return shift.label + ': ' + shift.start + ' às ' + shift.end;
        });

        return {
            periodLabel: input.periodLabel,
            periodTypeLabel: input.simulationType === 'project' ? 'Projeto temporário' : 'Operação contínua / recorrente',
            operationWindowLabel: input.operationWindowLabel,
            simultaneousPeople: input.postos,
            shiftCount: input.shiftCount,
            hasOverlap: input.hasOverlap,
            overlapLabel: input.hasOverlap ? 'Sim' : 'Não',
            overlapHours: input.overlapHours,
            coverageHoursPerDay: input.coverageHoursPerDay,
            laborHoursPerDayPerPost: input.laborHoursPerDayPerPost,
            worksSaturday: input.worksSaturday,
            worksSunday: input.worksSunday,
            worksHolidays: input.worksHolidays,
            coverageLabel: 'Sábado: ' + (input.worksSaturday ? 'sim' : 'não') + ' • Domingo: ' + (input.worksSunday ? 'sim' : 'não') + ' • Feriados: ' + (input.worksHolidays ? 'sim' : 'não'),
            holidayNote: holidayContext.note || '',
            shiftLines: shiftLines,
            operationTypeLabel: input.operationType === '24h' ? 'Operação 24h' : (input.operationType === '12h' ? 'Cobertura em turnos' : 'Jornada diurna')
        };
    }

    function evaluateScale(input, holidayContext, scaleId) {
        const currentInput = Object.assign({}, input, { scaleId: scaleId });
        const bundle = formulasDomain.calculateScaleFormula(currentInput, holidayContext);
        if (!bundle) return null;

        const validation = validationsDomain.validateScale(bundle, currentInput, holidayContext);

        return {
            input: currentInput,
            scale: bundle.scale,
            bundle: bundle,
            validation: validation,
            explanation: explanationsDomain.getScaleExplanation(scaleId),
            restrictionExplanation: explanationsDomain.getRestrictionsExplanation(validation),
            coverageSummary: explanationsDomain.getCoverageSummary(bundle, validation),
            legalSummary: explanationsDomain.getLegalSummary(bundle.scale, validation)
        };
    }

    function buildBlock(candidate, holidayContext, includeCalendar) {
        const bundle = candidate.bundle;
        const simulation = bundle.simulation;
        const coveragePlan = buildCoveragePlan(candidate);
        const hoursSummary = buildHoursSummary(candidate);

        return {
            scale: {
                id: candidate.scale.id,
                label: candidate.scale.label
            },
            quadroMinimo: bundle.operationalHeadcount,
            formulaHeadcount: bundle.formula.quadroMinimo,
            horasEstimadasPorFuncionario: simulation.averageHours || bundle.formula.automaticHours,
            horasSugeridasPorColaborador: bundle.formula.automaticHours,
            automaticHoursReference: bundle.formula.automaticHours,
            consideredHours: bundle.formula.effectiveHoursReference,
            hoursSummary: hoursSummary,
            coveragePlan: coveragePlan,
            coberturaPercentual: simulation.coveragePct,
            coberturaNivel: simulation.coveragePct >= 100 ? 'integral' : (simulation.coveragePct >= 90 ? 'ajustada' : 'parcial'),
            coberturaLabel: candidate.coverageSummary,
            compatibilidade: candidate.validation.compatibility,
            status: candidate.validation.status,
            hoursComparison: candidate.validation.hoursComparison,
            explicacaoCurta: candidate.explanation,
            restrictionSummary: candidate.restrictionExplanation,
            legalSummary: candidate.legalSummary,
            observacoes: candidate.validation.observations,
            alertas: candidate.validation.alerts,
            legalNotes: candidate.validation.legalNotes,
            diasOperados: bundle.calendar.operatedDays,
            totalDias: bundle.calendar.totalDays,
            totalOperationHours: bundle.formula.totalOperationHours,
            hoursPerDay: bundle.formula.hoursPerDay,
            hoursPerDayPerPost: bundle.formula.hoursPerDayPerPost,
            searchLimitReached: bundle.searchLimitReached,
            simulation: {
                employees: simulation.employees,
                days: simulation.days,
                stats: simulation.stats,
                averageHours: simulation.averageHours,
                coveragePct: simulation.coveragePct,
                coveredDays: simulation.coveredDays,
                operatedDays: simulation.operatedDays,
                uncoveredHours: simulation.uncoveredHours,
                excessHours: simulation.excessHours,
                imbalanceHours: simulation.imbalanceHours,
                maxHours: simulation.maxHours,
                minHours: simulation.minHours
            },
            feriados: holidayContext.count,
            holidayModeNote: holidayContext.note || '',
            calendar: includeCalendar ? {
                employees: simulation.employees,
                days: simulation.days,
                stats: simulation.stats
            } : null
        };
    }

    function buildPreviewPayload(candidate, holidayContext) {
        const coveragePlan = buildCoveragePlan(candidate);
        const hoursSummary = buildHoursSummary(candidate);

        return {
            scale: candidate.scale.id,
            scaleLabel: candidate.scale.label,
            hours: candidate.bundle.formula.automaticHours,
            referenceHours: candidate.bundle.formula.automaticHours,
            consideredHours: candidate.bundle.formula.effectiveHoursReference,
            usesManualHours: candidate.bundle.formula.usedHoursOverride,
            holidays: holidayContext,
            status: candidate.validation.status,
            compatibility: candidate.validation.compatibility,
            hoursComparison: candidate.validation.hoursComparison,
            coveragePlan: coveragePlan,
            hoursSummary: hoursSummary,
            scenario: buildScenarioSummary(candidate, holidayContext)
        };
    }

    function buildStructuredResult(selectedCandidate, suggestion, holidayContext) {
        const suggestedCandidate = suggestion && suggestion.suggested ? suggestion.suggested : selectedCandidate;
        const userBlock = buildBlock(selectedCandidate, holidayContext, true);
        const systemBlock = buildBlock(suggestedCandidate, holidayContext, false);
        const scenarioSummary = buildScenarioSummary(selectedCandidate, holidayContext);

        return {
            monthLabel: scenarioSummary.periodLabel,
            postos: selectedCandidate.input.postos,
            scenarioSummary: scenarioSummary,
            selectedScale: userBlock.scale,
            suggestedScale: {
                id: suggestedCandidate.scale.id,
                label: suggestedCandidate.scale.label,
                tag: 'Mais indicada'
            },
            selectedIsSuggested: userBlock.scale.id === suggestedCandidate.scale.id,
            quadroMinimo: userBlock.quadroMinimo,
            horasEstimadasPorFuncionario: userBlock.horasEstimadasPorFuncionario,
            referenceHours: userBlock.automaticHoursReference,
            consideredHours: userBlock.consideredHours,
            horasStatus: userBlock.status,
            diasOperados: {
                operados: userBlock.diasOperados,
                total: userBlock.totalDias,
                feriados: holidayContext.count
            },
            cobertura: {
                percentual: userBlock.coberturaPercentual,
                nivel: userBlock.coberturaNivel,
                label: userBlock.coberturaLabel
            },
            status: userBlock.status,
            compatibilidade: userBlock.compatibilidade,
            explicacaoCurta: userBlock.explicacaoCurta,
            observacoes: userBlock.observacoes,
            alertas: userBlock.alertas,
            alternativas: suggestion ? suggestion.alternatives : [],
            buildSummary: explanationsDomain.getBuildSummary(),
            legalSummary: userBlock.legalSummary,
            restrictionSummary: userBlock.restrictionSummary,
            automaticHours: userBlock.automaticHoursReference,
            holidaySummary: holidayContext.note || ('Feriados no período: ' + holidayContext.count),
            coveragePlan: userBlock.coveragePlan,
            hoursSummary: userBlock.hoursSummary,
            calendar: userBlock.calendar,
            systemBlock: systemBlock,
            userBlock: userBlock
        };
    }

    function evaluateCandidates(input, holidayContext) {
        return scalesDomain.getAllScales().map(function (scale) {
            return evaluateScale(input, holidayContext, scale.id);
        }).filter(Boolean);
    }

    function resolveSelectedCandidate(normalized, candidates, suggestion) {
        const chosenScaleId = normalized.scaleChoice === 'auto' && suggestion && suggestion.suggested
            ? suggestion.suggested.scale.id
            : normalized.scaleChoice;

        return candidates.find(function (candidate) {
            return candidate.scale.id === chosenScaleId;
        }) || (suggestion ? suggestion.suggested : null);
    }

    async function previewAutomaticHours(input) {
        const normalized = normalizeInput(input);
        const holidayContext = await getHolidayContext(normalized);
        const candidates = evaluateCandidates(normalized, holidayContext);
        const suggestion = suggestionsDomain.suggestScale(candidates);
        const candidate = resolveSelectedCandidate(normalized, candidates, suggestion);

        if (!candidate) {
            throw new Error('scale_not_found');
        }

        return buildPreviewPayload(candidate, holidayContext);
    }

    async function simulate(input) {
        const normalized = normalizeInput(input);
        const holidayContext = await getHolidayContext(normalized);
        const candidates = evaluateCandidates(normalized, holidayContext);
        const suggestion = suggestionsDomain.suggestScale(candidates);
        const selectedCandidate = resolveSelectedCandidate(normalized, candidates, suggestion);

        if (!selectedCandidate) {
            throw new Error('scale_not_found');
        }

        return buildStructuredResult(selectedCandidate, suggestion, holidayContext);
    }

    services.simulator = {
        normalizeInput: normalizeInput,
        previewAutomaticHours: previewAutomaticHours,
        simulate: simulate
    };
})(typeof window !== 'undefined' ? window : globalThis);

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

