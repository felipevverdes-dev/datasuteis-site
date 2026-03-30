(function (root) {
    'use strict';

    const ESCALAS = {
        '12x36': { tipo: 'ciclo', ciclo: ['T', 'F'], horas: 12 },
        '24x48': { tipo: 'ciclo', ciclo: ['T', 'F', 'F'], horas: 24 },
        '4x2': { tipo: 'ciclo', ciclo: ['T', 'T', 'T', 'T', 'F', 'F'], horas: 8 },
        '6x1': { tipo: 'ciclo', ciclo: ['T', 'T', 'T', 'T', 'T', 'T', 'F'], horas: 8 },
        '5x2': { tipo: 'semana', folgas: new Set([0, 6]), horas: 8 },
        // Compatibilidade com opções já existentes na UI.
        '6x2': { tipo: 'ciclo', ciclo: ['T', 'T', 'T', 'T', 'T', 'T', 'F', 'F'], horas: 8 },
        '12x60': { tipo: 'ciclo', ciclo: ['T', 'F', 'F'], horas: 12 },
    };

    function zerarHoras(data) {
        return new Date(data.getFullYear(), data.getMonth(), data.getDate());
    }

    function deltaDias(dataInicio, dataAlvo) {
        const d1 = zerarHoras(dataInicio);
        const d2 = zerarHoras(dataAlvo);
        const msPerDay = 86400000;
        return Math.round((d2 - d1) / msPerDay);
    }

    function getStatusDia(escala, dataInicio, dataAlvo, grupoOffset = 0) {
        const cfg = ESCALAS[escala];
        if (!cfg) throw new Error('Escala desconhecida: ' + escala);

        if (cfg.tipo === 'semana') {
            return cfg.folgas.has(dataAlvo.getDay()) ? 'FOLGA' : 'TRABALHA';
        }

        const delta = deltaDias(dataInicio, dataAlvo);
        if (delta < 0) return null;
        const idx = (delta + grupoOffset) % cfg.ciclo.length;
        return cfg.ciclo[idx] === 'T' ? 'TRABALHA' : 'FOLGA';
    }

    function generateEmployeeIds(n) {
        const total = Math.max(0, Number(n) || 0);
        const ids = [];
        for (let i = 0; i < total; i++) {
            let idx = i;
            let label = '';
            while (idx >= 0) {
                label = String.fromCharCode((idx % 26) + 65) + label;
                idx = Math.floor(idx / 26) - 1;
            }
            ids.push(label);
        }
        return ids;
    }

    function getCurrentMonthParts() {
        const monthIndex = new Date().getMonth();
        return {
            month: monthIndex + 1,
            monthIndex
        };
    }

    function parseYearMonthValue(month) {
        if (typeof month !== 'string') return null;
        const yearMonthMatch = month.trim().match(/^(\d{4})-(\d{2})$/);
        if (!yearMonthMatch) return null;

        const parsedMonth = Number(yearMonthMatch[2]);
        if (parsedMonth < 1 || parsedMonth > 12) return null;

        return {
            month: parsedMonth,
            monthIndex: parsedMonth - 1
        };
    }

    function parseMonthIndex(monthIndex) {
        const explicitMonthIndex = Number(monthIndex);
        if (Number.isInteger(explicitMonthIndex) && explicitMonthIndex >= 0 && explicitMonthIndex <= 11) {
            return {
                month: explicitMonthIndex + 1,
                monthIndex: explicitMonthIndex
            };
        }

        return null;
    }

    function normalizeMonthParts(month, monthIndex) {
        const normalizedMonthIndex = parseMonthIndex(monthIndex);
        const normalizedYearMonth = parseYearMonthValue(month);

        // The UI sends YYYY-MM; treat that as the authoritative month when present.
        if (normalizedYearMonth) {
            return normalizedYearMonth;
        }

        const parsedMonth = Number(month);
        if (Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
            return {
                month: parsedMonth,
                monthIndex: parsedMonth - 1
            };
        }

        if (normalizedMonthIndex) {
            return normalizedMonthIndex;
        }

        if (Number.isInteger(parsedMonth) && parsedMonth >= 0 && parsedMonth <= 11) {
            return {
                month: parsedMonth + 1,
                monthIndex: parsedMonth
            };
        }

        return getCurrentMonthParts();
    }

    function parseInputDate(raw, fallback) {
        if (!raw) return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
        if (raw instanceof Date) return new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
        if (typeof raw === 'string') {
            const value = raw.trim();
            const fullDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (fullDateMatch) {
                return new Date(
                    Number(fullDateMatch[1]),
                    Number(fullDateMatch[2]) - 1,
                    Number(fullDateMatch[3])
                );
            }

            const yearMonthMatch = value.match(/^(\d{4})-(\d{2})$/);
            if (yearMonthMatch) {
                return new Date(
                    Number(yearMonthMatch[1]),
                    Number(yearMonthMatch[2]) - 1,
                    1
                );
            }
        }

        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function fmtIso(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function isWeekend(date) {
        const d = date.getDay();
        return d === 0 || d === 6;
    }

    function getGroupOffset(pattern, employeeIndex) {
        if (pattern === '24x48') return employeeIndex % 3; // A=0, B=1, C=2
        const cfg = ESCALAS[pattern];
        if (!cfg || cfg.tipo !== 'ciclo' || !cfg.ciclo?.length) return 0;
        return employeeIndex % cfg.ciclo.length;
    }

    function buildSchedule(input) {
        const year = Number(input.year);
        const { month, monthIndex } = normalizeMonthParts(input.month, input.monthIndex);
        const employees = Array.isArray(input.employees) ? input.employees : generateEmployeeIds(input.employees);
        const includeWeekends = !!input.includeWeekends;
        const includeHolidays = !!input.includeHolidays;
        const demandPerDay = Math.max(1, Number(input.demandPerDay) || 1);
        const holidaysSet = input.holidaysSet instanceof Set ? input.holidaysSet : new Set();
        const pattern = input.pattern || '5x2';
        const cfg = ESCALAS[pattern];
        if (!cfg) throw new Error('Escala desconhecida: ' + pattern);

        const monthStart = new Date(year, monthIndex, 1);
        const dataInicio = parseInputDate(input.dataInicio, monthStart);
        const dim = new Date(year, month, 0).getDate();

        const sundaysInMonth = [];
        for (let day = 1; day <= dim; day++) {
            if (new Date(year, monthIndex, day).getDay() === 0) sundaysInMonth.push(day);
        }

        const operatedSundayDays = sundaysInMonth.filter(day => {
            if (!includeWeekends) return false;
            const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const holiday = holidaysSet.has(iso);
            return !holiday || includeHolidays;
        });

        const workCount = Object.fromEntries(employees.map(id => [id, 0]));
        const hoursCount = Object.fromEntries(employees.map(id => [id, 0]));
        const weekendWorkCount = Object.fromEntries(employees.map(id => [id, 0]));
        const lastWorkedDay = Object.fromEntries(employees.map(id => [id, -999]));
        const sundayOffCount = Object.fromEntries(employees.map(id => [id, 0]));
        const deficits = [];
        const notes = [];
        const days = [];
        let operatedDays = 0;
        let coveredDays = 0;

        function isPatternAvailable(empId, empIndex, date) {
            const offset = getGroupOffset(pattern, empIndex);
            const st = getStatusDia(pattern, dataInicio, date, offset);
            return st === 'TRABALHA';
        }

        for (let d = 1; d <= dim; d++) {
            const date = new Date(year, monthIndex, d);
            const iso = fmtIso(date);
            const weekend = isWeekend(date);
            const holiday = holidaysSet.has(iso);
            const isOperated = (!weekend || includeWeekends) && (!holiday || includeHolidays);
            const isSunday = date.getDay() === 0;
            const available = employees.filter((id, idx) => isPatternAvailable(id, idx, date));

            let working = [];
            if (isOperated) {
                operatedDays++;
                const sortedAvailable = [...available];
                sortedAvailable.sort((a, b) => {
                    if (workCount[a] !== workCount[b]) return workCount[a] - workCount[b];
                    if (weekendWorkCount[a] !== weekendWorkCount[b]) return weekendWorkCount[a] - weekendWorkCount[b];
                    if (lastWorkedDay[a] !== lastWorkedDay[b]) return lastWorkedDay[a] - lastWorkedDay[b];
                    return a.localeCompare(b);
                });

                let forcedOffSet = new Set();
                if (isSunday && operatedSundayDays.length) {
                    const remainingSundays = operatedSundayDays.filter(day => day >= d).length;
                    const pendingSundayOff = employees.filter(id => sundayOffCount[id] < 1);
                    const offSlots = Math.max(0, employees.length - demandPerDay);
                    const minOffToday = remainingSundays > 0
                        ? Math.ceil(pendingSundayOff.length / remainingSundays)
                        : pendingSundayOff.length;
                    const forcedOffCount = Math.min(offSlots, minOffToday);
                    const forcedOff = sortedAvailable
                        .filter(id => pendingSundayOff.includes(id))
                        .sort((a, b) => {
                            if (weekendWorkCount[a] !== weekendWorkCount[b]) return weekendWorkCount[b] - weekendWorkCount[a];
                            if (workCount[a] !== workCount[b]) return workCount[b] - workCount[a];
                            return a.localeCompare(b);
                        })
                        .slice(0, forcedOffCount);
                    forcedOffSet = new Set(forcedOff);
                }

                const preferred = sortedAvailable.filter(id => !forcedOffSet.has(id));
                const pool = preferred.length >= demandPerDay ? preferred : sortedAvailable;
                working = pool.slice(0, demandPerDay);
                working.forEach(id => {
                    workCount[id] += 1;
                    hoursCount[id] += cfg.horas || 0;
                    if (weekend) weekendWorkCount[id] += 1;
                    lastWorkedDay[id] = d;
                });

                if (working.length >= demandPerDay) coveredDays++;
            }

            const off = employees.filter(id => !working.includes(id));
            if (isSunday) {
                off.forEach(id => { sundayOffCount[id] += 1; });
            }

            const deficit = isOperated ? Math.max(0, demandPerDay - working.length) : 0;
            if (deficit > 0) deficits.push({ day: d, deficit });

            days.push({
                day: d,
                iso,
                weekend,
                holiday,
                operated: isOperated,
                demand: isOperated ? demandPerDay : 0,
                working,
                off,
                deficit
            });
        }

        if (!includeHolidays) {
            notes.push('Feriados foram tratados como dias sem operacao.');
        }
        const sundayMissing = employees.filter(id => sundaysInMonth.length > 0 && sundayOffCount[id] < 1);
        const sundayConstraintImpossible = sundayMissing.length > 0;
        if (sundayConstraintImpossible) {
            notes.push('Nao foi possivel garantir 1 domingo de folga para todos neste mes com as configuracoes atuais.');
        }

        const coverage = operatedDays ? Number(((coveredDays / operatedDays) * 100).toFixed(1)) : 100;

        return {
            year,
            month,
            monthIndex,
            pattern,
            employees,
            days,
            deficits,
            coverage,
            operatedDays,
            coveredDays,
            sundayConstraintImpossible,
            sundayMissing,
            stats: {
                worked: workCount,
                hours: hoursCount,
                weekendWorked: weekendWorkCount,
                sundayOff: sundayOffCount
            },
            notes
        };
    }

    const api = {
        ESCALAS,
        zerarHoras,
        deltaDias,
        getStatusDia,
        generateEmployeeIds,
        buildSchedule
    };

    if (root) {
        root.ShiftScheduler = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
