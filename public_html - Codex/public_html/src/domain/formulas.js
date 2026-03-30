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
