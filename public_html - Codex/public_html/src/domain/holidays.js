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
