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
