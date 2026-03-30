/**
 * scale-dimensioner.js
 * Engine de dimensionamento e simulacao da pagina de teste de escalas.
 * Expondo window.ScaleDimensioner sem alterar a logica da pagina de producao.
 */
(function (root) {
    'use strict';

    const SCALE_INFO = {
        '5x2': {
            label: '5x2 (Segunda a Sexta)',
            compatible_24h: false,
            works_saturday: false,
            works_sunday: false,
            hours_shift: 8,
            monthly_hours_ref: 173,
            description: 'Rotina de segunda a sexta em jornada diaria de 8h.',
            legal_note: 'Escala padrao de dias uteis. Nao cobre sabados, domingos nem operacao continua 24h.',
            pattern: { type: 'cycle', cycle: ['T', 'T', 'T', 'T', 'T', 'F', 'F'] }
        },
        '6x1': {
            label: '6x1',
            compatible_24h: false,
            works_saturday: true,
            works_sunday: false,
            hours_shift: 8,
            monthly_hours_ref: 192,
            description: 'Seis dias de trabalho para um dia de folga.',
            legal_note: 'Pode atender operacoes com sabado, preservando a logica de descanso semanal.',
            pattern: { type: 'cycle', cycle: ['T', 'T', 'T', 'T', 'T', 'T', 'F'] }
        },
        '12x36': {
            label: '12x36',
            compatible_24h: true,
            works_saturday: true,
            works_sunday: true,
            hours_shift: 12,
            monthly_hours_ref: 180,
            description: 'Doze horas de trabalho seguidas por trinta e seis horas de descanso.',
            legal_note: 'Escala classica de cobertura continua, comum em portaria, saude e seguranca.',
            pattern: { type: 'cycle', cycle: ['T', 'F'] }
        },
        '24x48': {
            label: '24x48',
            compatible_24h: true,
            works_saturday: true,
            works_sunday: true,
            hours_shift: 24,
            monthly_hours_ref: 160,
            description: 'Vinte e quatro horas de trabalho seguidas por quarenta e oito horas de descanso.',
            legal_note: 'Escala de turno longo, geralmente condicionada a acordo ou convencao coletiva.',
            pattern: { type: 'cycle', cycle: ['T', 'F', 'F'] }
        },
        '4x2': {
            label: '4x2',
            compatible_24h: true,
            works_saturday: true,
            works_sunday: true,
            hours_shift: 8,
            monthly_hours_ref: 160,
            description: 'Quatro dias de trabalho para dois de folga em ciclo continuo.',
            legal_note: 'Boa opcao para operacoes 24h com turnos de 8h e revezamento continuo.',
            pattern: { type: 'cycle', cycle: ['T', 'T', 'T', 'T', 'F', 'F'] }
        },
        '6x2': {
            label: '6x2',
            compatible_24h: false,
            works_saturday: true,
            works_sunday: true,
            hours_shift: 8,
            monthly_hours_ref: 192,
            description: 'Seis dias de trabalho para dois de folga em rodizio.',
            legal_note: 'Atende operacoes com fim de semana em turno diurno, mas nao foi desenhada para 24h continuo.',
            pattern: { type: 'cycle', cycle: ['T', 'T', 'T', 'T', 'T', 'T', 'F', 'F'] }
        },
        '12x60': {
            label: '12x60',
            compatible_24h: true,
            works_saturday: true,
            works_sunday: true,
            hours_shift: 12,
            monthly_hours_ref: 120,
            description: 'Doze horas de trabalho seguidas por sessenta horas de descanso.',
            legal_note: 'Escala com descanso mais longo e densidade mensal menor, exigindo quadro maior.',
            pattern: { type: 'cycle', cycle: ['T', 'F', 'F'] }
        }
    };

    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    function toIso(year, month, day) {
        return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }

    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function dayDiff(startDate, endDate) {
        const start = startOfDay(startDate);
        const end = startOfDay(endDate);
        return Math.round((end - start) / 86400000);
    }

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

    function getHoursPerDay(opera24h) {
        return opera24h ? 24 : 8;
    }

    function normalizeOperationParams(params) {
        const worksWeekend = !!(params && params.trabalhaFinaisDeSemana);

        return {
            opera24h: !!(params && params.opera24h),
            trabalhaFinaisDeSemana: worksWeekend,
            trabalhaSabado: worksWeekend || !!(params && params.trabalhaSabado),
            trabalhaDomingo: worksWeekend || !!(params && params.trabalhaDomingo),
            trabalhaFeriados: !!(params && params.trabalhaFeriados)
        };
    }

    function isOperationDay(date, params, holidaysSet) {
        const normalized = normalizeOperationParams(params);
        const iso = toIso(date.getFullYear(), date.getMonth() + 1, date.getDate());
        const isHoliday = holidaysSet instanceof Set && holidaysSet.has(iso);

        if (isHoliday && !normalized.trabalhaFeriados) return false;

        const dow = date.getDay();
        if (dow === 6) return normalized.trabalhaSabado;
        if (dow === 0) return normalized.trabalhaDomingo;
        return true;
    }

    function getDaysOperated(year, month, params, holidaysSet) {
        const totalDays = getDaysInMonth(year, month);
        let count = 0;

        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month - 1, day);
            if (isOperationDay(date, params, holidaysSet)) count++;
        }

        return count;
    }

    function calcTotalOperationHours(daysOperated, hoursPerDay, numPostos) {
        return daysOperated * hoursPerDay * numPostos;
    }

    function calcMinStaff(daysOperated, hoursPerDay, numPostos, monthlyHoursPerEmployee) {
        const total = calcTotalOperationHours(daysOperated, hoursPerDay, numPostos);
        if (!monthlyHoursPerEmployee || monthlyHoursPerEmployee <= 0) return 0;
        return Math.ceil(total / monthlyHoursPerEmployee);
    }

    function getAssignmentsPerPost(scale, opera24h) {
        const cfg = SCALE_INFO[scale];
        if (!cfg) {
            return {
                valid: false,
                perPost: 0,
                reason: 'Escala desconhecida ou ainda nao cadastrada.'
            };
        }

        if (!opera24h) {
            return {
                valid: true,
                perPost: 1,
                reason: ''
            };
        }

        if (!cfg.compatible_24h) {
            return {
                valid: false,
                perPost: 0,
                reason: 'A escala ' + scale + ' nao e compativel com operacao 24h.'
            };
        }

        const perPost = 24 / cfg.hours_shift;
        if (!Number.isInteger(perPost)) {
            return {
                valid: false,
                perPost: 0,
                reason: 'A duracao do turno da escala ' + scale + ' nao fecha 24h de forma limpa.'
            };
        }

        return {
            valid: true,
            perPost: perPost,
            reason: ''
        };
    }

    function getScenarioPreferredScales(params) {
        const normalized = normalizeOperationParams(params);

        if (normalized.opera24h) {
            return ['12x36', '4x2', '24x48', '12x60'];
        }

        if (normalized.trabalhaSabado && normalized.trabalhaDomingo) {
            return ['6x2', '6x1', '5x2'];
        }

        if (normalized.trabalhaSabado && !normalized.trabalhaDomingo) {
            return ['6x1', '6x2', '5x2'];
        }

        if (!normalized.trabalhaSabado && normalized.trabalhaDomingo) {
            return ['6x2', '6x1'];
        }

        return ['5x2', '6x1', '6x2'];
    }

    function getEmployeeOffset(scale, employeeIndex) {
        const cfg = SCALE_INFO[scale];
        if (!cfg || !cfg.pattern || cfg.pattern.type !== 'cycle') return 0;
        return employeeIndex % cfg.pattern.cycle.length;
    }

    function isEmployeeAvailable(scale, startDate, date, employeeIndex, scenario) {
        const cfg = SCALE_INFO[scale];
        if (!cfg || !cfg.pattern) return false;

        if (
            scale === '5x2' &&
            scenario &&
            !scenario.trabalhaSabado &&
            !scenario.trabalhaDomingo
        ) {
            const dow = date.getDay();
            return dow !== 0 && dow !== 6;
        }

        if (cfg.pattern.type === 'week') {
            return cfg.pattern.offDays.indexOf(date.getDay()) === -1;
        }

        const cycle = cfg.pattern.cycle || [];
        if (!cycle.length) return false;

        const delta = dayDiff(startDate, date);
        const offset = getEmployeeOffset(scale, employeeIndex);
        const position = (delta + offset) % cycle.length;
        return cycle[position] === 'T';
    }

    function getCoverageStatus(simulation) {
        if (!simulation) {
            return {
                code: 'not_possible',
                label: 'Sem simulacao',
                detail: 'Nao foi possivel gerar a simulacao.'
            };
        }

        if (simulation.invalidReason) {
            return {
                code: 'not_possible',
                label: 'Cobertura inviavel',
                detail: simulation.invalidReason
            };
        }

        if (simulation.coveragePct >= 100 && simulation.overbookedEmployees.length === 0) {
            return {
                code: 'ok',
                label: 'Cobertura completa',
                detail: 'A distribuicao mensal cobre 100% das horas da operacao com o quadro minimo calculado.'
            };
        }

        if (simulation.coveragePct >= 100) {
            return {
                code: 'obs',
                label: 'Cobertura completa com ajuste',
                detail: 'A cobertura fecha, mas a carga mensal estimada excede a jornada informada para parte da equipe.'
            };
        }

        if (simulation.coveragePct >= 90) {
            return {
                code: 'obs',
                label: 'Cobertura parcial',
                detail: 'O quadro minimo pela formula ainda deixa lacunas operacionais neste mes.'
            };
        }

        return {
            code: 'not_possible',
            label: 'Cobertura insuficiente',
            detail: 'A distribuicao mensal nao consegue cobrir a operacao com o quadro calculado.'
        };
    }

    function buildSimulation(input) {
        const scale = input && input.scale;
        const cfg = SCALE_INFO[scale];
        const year = Number(input && input.year);
        const month = Number(input && input.month);
        const numPostos = Math.max(1, Number(input && input.numPostos) || 1);
        const monthlyHoursPerEmployee = Math.max(0, Number(input && input.monthlyHoursPerEmployee) || 0);
        const holidaysSet = input && input.holidaysSet instanceof Set ? input.holidaysSet : new Set();
        const params = normalizeOperationParams(input || {});
        const hoursPerDay = getHoursPerDay(params.opera24h);
        const totalDays = getDaysInMonth(year, month);
        const daysOperated = getDaysOperated(year, month, params, holidaysSet);
        const totalOperationHours = calcTotalOperationHours(daysOperated, hoursPerDay, numPostos);
        const minStaff = calcMinStaff(daysOperated, hoursPerDay, numPostos, monthlyHoursPerEmployee);
        const employeeCount = Math.max(minStaff, Math.max(1, Number(input && input.employeeCount) || 0));
        const employees = generateEmployeeIds(employeeCount);
        const assignmentModel = getAssignmentsPerPost(scale, params.opera24h);
        const monthStart = new Date(year, month - 1, 1);

        const stats = {
            hours: {},
            assignments: {},
            weekendAssignments: {},
            lastAssignedIndex: {}
        };

        employees.forEach(function (employeeId) {
            stats.hours[employeeId] = 0;
            stats.assignments[employeeId] = 0;
            stats.weekendAssignments[employeeId] = 0;
            stats.lastAssignedIndex[employeeId] = -9999;
        });

        const days = [];
        const notes = [];
        let coveredDays = 0;
        let requiredAssignmentsTotal = 0;
        let assignedAssignmentsTotal = 0;
        let requiredHoursTotal = 0;
        let coveredHoursTotal = 0;
        let assignedHoursTotal = 0;

        if (!cfg) {
            return {
                scale: scale,
                info: null,
                year: year,
                month: month,
                totalDays: totalDays,
                daysOperated: daysOperated,
                totalOperationHours: totalOperationHours,
                hoursPerDay: hoursPerDay,
                minStaff: minStaff,
                employeeCount: employeeCount,
                employees: employees,
                days: [],
                stats: stats,
                notes: ['Escala desconhecida ou nao cadastrada.'],
                coveragePct: 0,
                coveredDays: 0,
                uncoveredHoursTotal: totalOperationHours,
                requiredAssignmentsTotal: 0,
                assignedAssignmentsTotal: 0,
                averageHours: 0,
                minHours: 0,
                maxHours: 0,
                overbookedEmployees: [],
                invalidReason: 'Escala desconhecida ou nao cadastrada.',
                totalExcessHours: 0
            };
        }

        if (!assignmentModel.valid) {
            notes.push(assignmentModel.reason);
        }

        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month - 1, day);
            const iso = toIso(year, month, day);
            const operated = isOperationDay(date, params, holidaysSet);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isHoliday = holidaysSet.has(iso);
            const requiredAssignments = operated && assignmentModel.valid ? numPostos * assignmentModel.perPost : 0;
            const requiredHours = operated ? numPostos * hoursPerDay : 0;
            const available = assignmentModel.valid
                ? employees.filter(function (employeeId, employeeIndex) {
                    return isEmployeeAvailable(scale, monthStart, date, employeeIndex, params);
                })
                : [];

            available.sort(function (left, right) {
                if (stats.hours[left] !== stats.hours[right]) return stats.hours[left] - stats.hours[right];
                if (stats.assignments[left] !== stats.assignments[right]) return stats.assignments[left] - stats.assignments[right];
                if (isWeekend && stats.weekendAssignments[left] !== stats.weekendAssignments[right]) {
                    return stats.weekendAssignments[left] - stats.weekendAssignments[right];
                }
                if (stats.lastAssignedIndex[left] !== stats.lastAssignedIndex[right]) {
                    return stats.lastAssignedIndex[left] - stats.lastAssignedIndex[right];
                }
                return left.localeCompare(right);
            });

            const assigned = operated ? available.slice(0, requiredAssignments) : [];
            const assignedHours = assigned.length * cfg.hours_shift;
            const coveredHours = Math.min(requiredHours, assignedHours);
            const excessHours = Math.max(0, assignedHours - requiredHours);
            const deficitAssignments = Math.max(0, requiredAssignments - assigned.length);
            const deficitHours = Math.max(0, requiredHours - coveredHours);

            if (operated) {
                requiredAssignmentsTotal += requiredAssignments;
                assignedAssignmentsTotal += assigned.length;
                requiredHoursTotal += requiredHours;
                coveredHoursTotal += coveredHours;
                assignedHoursTotal += assignedHours;
                if (deficitHours === 0 && deficitAssignments === 0) coveredDays++;
            }

            assigned.forEach(function (employeeId) {
                stats.hours[employeeId] += cfg.hours_shift;
                stats.assignments[employeeId] += 1;
                if (isWeekend) stats.weekendAssignments[employeeId] += 1;
                stats.lastAssignedIndex[employeeId] = day;
            });

            days.push({
                day: day,
                iso: iso,
                operated: operated,
                holiday: isHoliday,
                weekend: isWeekend,
                requiredAssignments: requiredAssignments,
                requiredHours: requiredHours,
                assigned: assigned,
                availableCount: available.length,
                assignedHours: assignedHours,
                coveredHours: coveredHours,
                excessHours: excessHours,
                deficitAssignments: deficitAssignments,
                deficitHours: deficitHours
            });
        }

        const maxHours = employees.length
            ? Math.max.apply(null, employees.map(function (employeeId) { return stats.hours[employeeId]; }))
            : 0;
        const minHours = employees.length
            ? Math.min.apply(null, employees.map(function (employeeId) { return stats.hours[employeeId]; }))
            : 0;
        const overbookedEmployees = employees.filter(function (employeeId) {
            return monthlyHoursPerEmployee > 0 && stats.hours[employeeId] > monthlyHoursPerEmployee;
        });
        const coveragePct = requiredHoursTotal
            ? Number(((coveredHoursTotal / requiredHoursTotal) * 100).toFixed(1))
            : 100;

        if (!params.trabalhaFeriados) {
            notes.push('Feriados nao operados foram excluidos do calculo mensal.');
        }

        return {
            scale: scale,
            info: cfg,
            year: year,
            month: month,
            totalDays: totalDays,
            daysOperated: daysOperated,
            totalOperationHours: totalOperationHours,
            hoursPerDay: hoursPerDay,
            minStaff: minStaff,
            employeeCount: employeeCount,
            employees: employees,
            days: days,
            stats: stats,
            notes: notes,
            coveragePct: coveragePct,
            coveredDays: coveredDays,
            uncoveredHoursTotal: Math.max(0, requiredHoursTotal - coveredHoursTotal),
            requiredAssignmentsTotal: requiredAssignmentsTotal,
            assignedAssignmentsTotal: assignedAssignmentsTotal,
            averageHours: employees.length ? Number((assignedHoursTotal / employees.length).toFixed(1)) : 0,
            minHours: minHours,
            maxHours: maxHours,
            overbookedEmployees: overbookedEmployees,
            invalidReason: assignmentModel.valid ? '' : assignmentModel.reason,
            totalExcessHours: Math.max(0, assignedHoursTotal - requiredHoursTotal)
        };
    }

    function findOperationalMinStaff(scale, params, context, baselineMinStaff) {
        const monthlyHoursPerEmployee = Math.max(0, Number(context && context.monthlyHoursPerEmployee) || 0);
        if (!monthlyHoursPerEmployee || !baselineMinStaff) return baselineMinStaff || 0;

        const maxSearch = baselineMinStaff + 12;

        for (let current = baselineMinStaff; current <= maxSearch; current++) {
            const candidate = buildSimulation({
                scale: scale,
                year: context.year,
                month: context.month,
                numPostos: context.numPostos,
                monthlyHoursPerEmployee: monthlyHoursPerEmployee,
                holidaysSet: context.holidaysSet,
                employeeCount: current,
                opera24h: params.opera24h,
                trabalhaFinaisDeSemana: params.trabalhaFinaisDeSemana,
                trabalhaSabado: params.trabalhaSabado,
                trabalhaDomingo: params.trabalhaDomingo,
                trabalhaFeriados: params.trabalhaFeriados
            });

            if (!candidate.invalidReason && candidate.coveragePct >= 100 && candidate.overbookedEmployees.length === 0) {
                return current;
            }
        }

        return null;
    }

    const MATRIX_STATUS_RANK = {
        recomendado: 0,
        possivel: 1,
        possivel_com_restricoes: 2,
        nao_recomendado: 3,
        nao_possivel: 4
    };

    function matrixCreateDecision(status, reason, suggestion, observations, options) {
        return {
            status: status,
            reason: reason || '',
            suggestion: suggestion || null,
            observations: Array.isArray(observations) ? observations.slice() : [],
            options: options || {}
        };
    }

    function matrixWorsenStatus(currentStatus, candidateStatus) {
        const currentRank = Object.prototype.hasOwnProperty.call(MATRIX_STATUS_RANK, currentStatus)
            ? MATRIX_STATUS_RANK[currentStatus]
            : MATRIX_STATUS_RANK.nao_possivel;
        const candidateRank = Object.prototype.hasOwnProperty.call(MATRIX_STATUS_RANK, candidateStatus)
            ? MATRIX_STATUS_RANK[candidateStatus]
            : MATRIX_STATUS_RANK.nao_possivel;

        return candidateRank > currentRank ? candidateStatus : currentStatus;
    }

    function matrixUniqueText(values) {
        return Array.from(new Set((values || []).filter(Boolean)));
    }

    function getScenarioProfile(params) {
        const normalized = normalizeOperationParams(params);
        return {
            opera24h: normalized.opera24h,
            trabalhaFinaisDeSemana: normalized.trabalhaFinaisDeSemana,
            trabalhaSabado: normalized.trabalhaSabado,
            trabalhaDomingo: normalized.trabalhaDomingo,
            trabalhaFeriados: normalized.trabalhaFeriados,
            worksWeekend: normalized.trabalhaSabado || normalized.trabalhaDomingo,
            weekdaysOnly: !normalized.trabalhaSabado && !normalized.trabalhaDomingo,
            saturdayOnly: normalized.trabalhaSabado && !normalized.trabalhaDomingo,
            sundayOnly: !normalized.trabalhaSabado && normalized.trabalhaDomingo,
            fullWeekend: normalized.trabalhaSabado && normalized.trabalhaDomingo,
            continuous247: normalized.opera24h && normalized.trabalhaSabado && normalized.trabalhaDomingo && normalized.trabalhaFeriados,
            continuous24x7WithoutHoliday: normalized.opera24h && normalized.trabalhaSabado && normalized.trabalhaDomingo && !normalized.trabalhaFeriados
        };
    }

    function buildDefaultMatrixSuggestion(params) {
        const scenario = getScenarioProfile(params);

        if (scenario.continuous247 || scenario.continuous24x7WithoutHoliday || scenario.opera24h) {
            return 'Considere 12x36 como primeira referencia e compare com 4x2 quando precisar equilibrar melhor a carga mensal.';
        }

        if (scenario.saturdayOnly) {
            return 'Considere 6x1 como primeira opcao e compare com 6x2 ou 5x2 com revezamento.';
        }

        if (scenario.worksWeekend) {
            return 'Considere 6x2 ou 6x1 com revezamento, conforme a frequencia de sabados e domingos.';
        }

        return 'Considere 5x2 como primeira opcao para operacoes concentradas em dias uteis.';
    }

    function buildScaleAnalysis(scale, params, context) {
        const normalized = normalizeOperationParams(params);
        const scenario = getScenarioProfile(normalized);
        const evaluationContext = {
            year: Number(context && context.year),
            month: Number(context && context.month),
            numPostos: Math.max(1, Number(context && context.numPostos) || 1),
            monthlyHoursPerEmployee: Math.max(0, Number(context && context.monthlyHoursPerEmployee) || 0),
            holidaysSet: context && context.holidaysSet instanceof Set ? context.holidaysSet : new Set()
        };

        const daysOperated = getDaysOperated(
            evaluationContext.year,
            evaluationContext.month,
            normalized,
            evaluationContext.holidaysSet
        );
        const hoursPerDay = getHoursPerDay(normalized.opera24h);
        const totalOperationHours = calcTotalOperationHours(daysOperated, hoursPerDay, evaluationContext.numPostos);
        const minStaff = calcMinStaff(
            daysOperated,
            hoursPerDay,
            evaluationContext.numPostos,
            evaluationContext.monthlyHoursPerEmployee
        );
        const simulation = buildSimulation({
            scale: scale,
            year: evaluationContext.year,
            month: evaluationContext.month,
            numPostos: evaluationContext.numPostos,
            monthlyHoursPerEmployee: evaluationContext.monthlyHoursPerEmployee,
            holidaysSet: evaluationContext.holidaysSet,
            employeeCount: minStaff,
            opera24h: normalized.opera24h,
            trabalhaFinaisDeSemana: normalized.trabalhaFinaisDeSemana,
            trabalhaSabado: normalized.trabalhaSabado,
            trabalhaDomingo: normalized.trabalhaDomingo,
            trabalhaFeriados: normalized.trabalhaFeriados
        });

        simulation.operationalMinStaff = findOperationalMinStaff(scale, normalized, evaluationContext, minStaff);

        return {
            scale: scale,
            info: SCALE_INFO[scale] || null,
            params: normalized,
            scenario: scenario,
            year: evaluationContext.year,
            month: evaluationContext.month,
            numPostos: evaluationContext.numPostos,
            monthlyHoursPerEmployee: evaluationContext.monthlyHoursPerEmployee,
            daysOperated: daysOperated,
            hoursPerDay: hoursPerDay,
            totalOperationHours: totalOperationHours,
            minStaff: minStaff,
            simulation: simulation,
            coverageStatus: getCoverageStatus(simulation),
            monthlyReference: SCALE_INFO[scale] ? Number(SCALE_INFO[scale].monthly_hours_ref || 0) : 0,
            monthlyDiff: SCALE_INFO[scale]
                ? Math.abs(evaluationContext.monthlyHoursPerEmployee - Number(SCALE_INFO[scale].monthly_hours_ref || 0))
                : 0
        };
    }

    const SCALE_DECISION_MATRIX = {
        '5x2': {
            evaluate: function (analysis) {
                const scenario = analysis.scenario;
                const observations = [];

                if (scenario.opera24h) {
                    return matrixCreateDecision(
                        'nao_possivel',
                        'A escala 5x2 nao e adequada para operacao 24h nesta matriz.',
                        'Use 12x36 ou 4x2 para cobertura continua.',
                        observations,
                        { strictCoverage: true }
                    );
                }

                if (scenario.weekdaysOnly) {
                    return matrixCreateDecision(
                        'recomendado',
                        'A escala 5x2 e a aderencia natural para operacoes concentradas em dias uteis.',
                        null,
                        observations,
                        { strictCoverage: true }
                    );
                }

                if (scenario.saturdayOnly) {
                    observations.push('Quando ha cobertura aos sabados, a 5x2 depende de revezamento e folgas rotativas.');
                    return matrixCreateDecision(
                        'possivel_com_restricoes',
                        'A escala 5x2 pode atender sabado, mas exige revezamento.',
                        'Monte folgas rotativas ou compare com 6x1 e 6x2.',
                        observations,
                        { strictCoverage: true }
                    );
                }

                observations.push('Mesmo com revezamento, a 5x2 perde aderencia quando a operacao depende de domingo ou de todo o fim de semana.');
                return matrixCreateDecision(
                    'nao_recomendado',
                    'A escala 5x2 nao e a melhor escolha para domingo frequente ou cobertura forte de fim de semana.',
                    'Prefira 6x1, 6x2 ou uma escala continua se houver operacao prolongada.',
                    observations,
                    { strictCoverage: true }
                );
            }
        },
        '6x1': {
            evaluate: function (analysis) {
                const scenario = analysis.scenario;
                const observations = [];

                if (scenario.opera24h) {
                    return matrixCreateDecision(
                        'nao_possivel',
                        'A escala 6x1 nao foi tratada como escala de cobertura 24h nesta matriz.',
                        'Use 12x36 ou 4x2 para operacao continua.',
                        observations
                    );
                }

                if (scenario.saturdayOnly) {
                    return matrixCreateDecision(
                        'recomendado',
                        'A escala 6x1 e uma das melhores opcoes para operacao que inclui sabado e preserva logica semanal.',
                        null,
                        observations
                    );
                }

                if (scenario.fullWeekend || scenario.sundayOnly) {
                    observations.push('Domingo frequente em 6x1 pede revezamento formal e acompanhamento de descanso semanal.');
                    return matrixCreateDecision(
                        'possivel_com_restricoes',
                        'A escala 6x1 pode funcionar com domingo, desde que haja revezamento e controle de folgas.',
                        'Revise a distribuicao de folgas e compare com 6x2 se o domingo for recorrente.',
                        observations
                    );
                }

                return matrixCreateDecision(
                    'possivel',
                    'A escala 6x1 atende o cenario, mas a 5x2 tende a ser mais simples quando a operacao fica em dias uteis.',
                    'Se a operacao ficar em dias uteis, compare com 5x2.',
                    observations
                );
            }
        },
        '12x36': {
            evaluate: function (analysis) {
                if (analysis.scenario.opera24h) {
                    return matrixCreateDecision(
                        'recomendado',
                        'A escala 12x36 e a referencia principal desta matriz para cobertura continua 24h.',
                        null,
                        []
                    );
                }

                return matrixCreateDecision(
                    'possivel_com_restricoes',
                    'A escala 12x36 pode ser usada fora de 24h, mas nao e o arranjo mais natural para turno diurno simples.',
                    'Compare com 5x2, 6x1 ou 6x2 conforme o fim de semana.',
                    ['Fora de operacao 24h, a 12x36 pode gerar sobreposicao ou horas excedentes.']
                );
            }
        },
        '24x48': {
            evaluate: function (analysis) {
                const observations = [
                    'A escala 24x48 deve ser tratada como cenario especial e depende de convencao, politica interna e analise juridica.'
                ];

                if (!analysis.scenario.opera24h) {
                    observations.push('Turnos de 24h costumam ser excessivos para operacao que nao roda 24 horas.');
                    return matrixCreateDecision(
                        'nao_recomendado',
                        'A escala 24x48 nao e a primeira escolha para operacoes nao continuas.',
                        'So use esta escala com justificativa operacional e validacao interna.',
                        observations
                    );
                }

                return matrixCreateDecision(
                    'possivel_com_restricoes',
                    'A escala 24x48 pode atender operacao 24h, mas deve ser tratada como excecao e nao como padrao automatico.',
                    'Documente a justificativa interna e compare com 12x36 e 4x2.',
                    observations
                );
            }
        },
        '4x2': {
            evaluate: function (analysis) {
                if (analysis.scenario.opera24h) {
                    return matrixCreateDecision(
                        'recomendado',
                        'A escala 4x2 e uma boa candidata para operacao continua com revezamento em turnos de 8h.',
                        null,
                        []
                    );
                }

                if (analysis.scenario.worksWeekend) {
                    return matrixCreateDecision(
                        'possivel',
                        'A escala 4x2 pode cobrir fim de semana com rodizio, embora seja mais comum em operacoes continuas.',
                        'Compare com 6x1 ou 6x2 se a operacao nao for 24h.',
                        []
                    );
                }

                return matrixCreateDecision(
                    'nao_recomendado',
                    'A escala 4x2 nao costuma ser a melhor escolha para operacao apenas administrativa.',
                    'Prefira 5x2 ou 6x1.',
                    ['Para dias uteis puros, a 4x2 tende a ser mais complexa do que o necessario.']
                );
            }
        },
        '6x2': {
            evaluate: function (analysis) {
                const observations = [
                    'A escala 6x2 deve ser comparada com outras opcoes antes de ser escolhida automaticamente.'
                ];

                if (analysis.scenario.opera24h) {
                    return matrixCreateDecision(
                        'nao_possivel',
                        'A escala 6x2 nao foi priorizada nesta matriz para cobertura 24h continua.',
                        'Use 12x36 ou 4x2 para cobertura continua.',
                        observations
                    );
                }

                if (analysis.scenario.worksWeekend) {
                    return matrixCreateDecision(
                        'possivel',
                        'A escala 6x2 pode ser viavel para operacao com fim de semana, desde que a carga mensal e a cobertura fechem.',
                        'Compare com 6x1 quando o domingo nao for recorrente.',
                        observations
                    );
                }

                return matrixCreateDecision(
                    'nao_recomendado',
                    'A escala 6x2 nao costuma ser a alternativa mais simples para operacao apenas em dias uteis.',
                    'Prefira 5x2 ou 6x1.',
                    observations
                );
            }
        },
        '12x60': {
            evaluate: function (analysis) {
                const observations = [
                    'A escala 12x60 deve ser tratada como cenario especial e nao entra como primeira sugestao automatica.'
                ];

                if (!analysis.scenario.opera24h) {
                    observations.push('Fora de cobertura continua, a densidade desta escala tende a gerar baixa ocupacao ou sobras.');
                    return matrixCreateDecision(
                        'nao_recomendado',
                        'A escala 12x60 nao costuma ser a melhor escolha para operacao nao continua.',
                        'Use 5x2, 6x1 ou 6x2 conforme a necessidade de fim de semana.',
                        observations
                    );
                }

                return matrixCreateDecision(
                    'possivel_com_restricoes',
                    'A escala 12x60 pode ser avaliada em operacao 24h, mas exige confirmacao de cobertura real antes de aceitar o cenario.',
                    'Valide o quadro final e compare com 12x36 e 4x2.',
                    observations,
                    { strictCoverage: true }
                );
            }
        }
    };

    function finalizeMatrixDecision(analysis, baseDecision) {
        const decision = {
            status: baseDecision.status,
            reason: baseDecision.reason,
            suggestion: baseDecision.suggestion || null,
            observations: matrixUniqueText(baseDecision.observations)
        };
        const simulation = analysis.simulation;

        if (!analysis.info) {
            decision.status = 'nao_possivel';
            decision.reason = 'Escala desconhecida ou nao cadastrada.';
            decision.suggestion = 'Escolha uma das escalas cadastradas antes de simular.';
            return decision;
        }

        if (simulation.invalidReason) {
            decision.status = 'nao_possivel';
            decision.reason = simulation.invalidReason;
            decision.suggestion = buildDefaultMatrixSuggestion(analysis.params);
            return decision;
        }

        if (analysis.monthlyReference && analysis.monthlyDiff >= 24) {
            decision.observations.push(
                'A carga mensal informada (' + analysis.monthlyHoursPerEmployee + 'h) esta distante da referencia habitual desta escala (~' +
                analysis.monthlyReference + 'h).'
            );
            if (decision.status === 'recomendado' || decision.status === 'possivel') {
                decision.status = 'possivel_com_restricoes';
            }
        }

        if (simulation.overbookedEmployees.length > 0) {
            decision.observations.push(
                'A simulacao excede as ' + analysis.monthlyHoursPerEmployee + 'h informadas para ' +
                simulation.overbookedEmployees.length + ' colaborador(es), com pico de ' + simulation.maxHours + 'h.'
            );
            if (decision.status === 'recomendado' || decision.status === 'possivel') {
                decision.status = 'possivel_com_restricoes';
            }
        }

        if (simulation.coveragePct < 100) {
            const shortageMessage =
                'Com o quadro minimo da formula (' + analysis.minStaff + ' colaborador(es)), a distribuicao mensal cobre ' +
                simulation.coveragePct + '% das horas e deixa ' + simulation.uncoveredHoursTotal + 'h sem cobertura.';

            if (simulation.operationalMinStaff && simulation.operationalMinStaff > analysis.minStaff && !baseDecision.options.strictCoverage) {
                decision.observations.push(shortageMessage);
                decision.suggestion =
                    'Ajuste o quadro para ' + simulation.operationalMinStaff + ' colaborador(es) ou compare com outra escala mais aderente.';
                decision.status = matrixWorsenStatus(decision.status, 'possivel_com_restricoes');
            } else {
                decision.status = 'nao_possivel';
                decision.reason = shortageMessage;
                decision.suggestion =
                    'Aumente o quadro ou troque de escala para um modelo mais compativel com a cobertura desejada.';
            }
        }

        if (!analysis.scenario.opera24h && simulation.totalExcessHours > 0 && analysis.info.hours_shift > 8) {
            decision.observations.push(
                'A escala entrega turnos de ' + analysis.info.hours_shift + 'h para uma operacao de 8h/dia, gerando sobra estimada de ' +
                simulation.totalExcessHours + 'h no mes.'
            );
            if (decision.status === 'recomendado' || decision.status === 'possivel') {
                decision.status = 'possivel_com_restricoes';
            }
        }

        decision.observations = matrixUniqueText(decision.observations);

        if (!decision.reason) {
            if (decision.status === 'recomendado') decision.reason = 'A escala e aderente ao cenario e fecha a cobertura com a logica desta matriz.';
            if (decision.status === 'possivel') decision.reason = 'A escala pode atender o cenario e passou pelas verificacoes principais.';
            if (decision.status === 'possivel_com_restricoes') decision.reason = 'A escala pode ser usada, mas exige atencao a restricoes operacionais ou legais.';
            if (decision.status === 'nao_recomendado') decision.reason = 'A escala nao e a melhor escolha para este cenario, embora possa ter algum encaixe pontual.';
            if (decision.status === 'nao_possivel') decision.reason = 'A escala nao fecha para este cenario com a matriz atual.';
        }

        if (!decision.suggestion && decision.status !== 'recomendado') {
            decision.suggestion = buildDefaultMatrixSuggestion(analysis.params);
        }

        return decision;
    }

    function getMatrixSuggestionPriority(params) {
        const scenario = getScenarioProfile(params);

        if (scenario.continuous247 || scenario.continuous24x7WithoutHoliday || scenario.opera24h) {
            return ['12x36', '4x2', '24x48', '12x60', '6x2', '6x1', '5x2'];
        }

        if (scenario.saturdayOnly) {
            return ['6x1', '6x2', '5x2', '12x36', '4x2', '24x48', '12x60'];
        }

        if (scenario.weekdaysOnly) {
            return ['5x2', '6x1', '6x2', '12x36', '4x2', '24x48', '12x60'];
        }

        return ['6x2', '6x1', '5x2', '12x36', '4x2', '24x48', '12x60'];
    }

    function evaluateScaleScenario(scale, params, context) {
        const analysis = buildScaleAnalysis(scale, params, context);
        const rule = SCALE_DECISION_MATRIX[scale];
        const baseDecision = rule
            ? rule.evaluate(analysis)
            : matrixCreateDecision(
                'nao_possivel',
                'Escala desconhecida ou nao cadastrada.',
                'Escolha uma escala valida antes de simular.',
                []
            );
        const decision = finalizeMatrixDecision(analysis, baseDecision);

        return {
            scale: scale,
            info: analysis.info,
            params: analysis.params,
            year: analysis.year,
            month: analysis.month,
            numPostos: analysis.numPostos,
            monthlyHoursPerEmployee: analysis.monthlyHoursPerEmployee,
            daysOperated: analysis.daysOperated,
            hoursPerDay: analysis.hoursPerDay,
            totalOperationHours: analysis.totalOperationHours,
            minStaff: analysis.minStaff,
            simulation: analysis.simulation,
            coverageStatus: analysis.coverageStatus,
            status: decision.status,
            reason: decision.reason,
            suggestion: decision.suggestion,
            observations: decision.observations,
            legalNotes: matrixUniqueText([analysis.info && analysis.info.legal_note]),
            matrixNotes: matrixUniqueText([analysis.info && analysis.info.description])
        };
    }

    function suggestBestScale(params, context) {
        const priority = getMatrixSuggestionPriority(params);
        const evaluations = priority.map(function (scale) {
            return evaluateScaleScenario(scale, params, context);
        });
        const preferred = evaluations.find(function (item) {
            return item.status === 'recomendado' || item.status === 'possivel' || item.status === 'possivel_com_restricoes';
        }) || evaluations.find(function (item) {
            return item.status === 'nao_recomendado';
        }) || evaluations[0];

        return {
            scale: preferred.scale,
            status: preferred.status,
            reason: preferred.reason,
            suggestion: preferred.suggestion,
            alternatives: evaluations
                .filter(function (item) {
                    return item.scale !== preferred.scale &&
                        (item.status === 'recomendado' || item.status === 'possivel' || item.status === 'possivel_com_restricoes');
                })
                .map(function (item) { return item.scale; })
                .slice(0, 3),
            evaluation: preferred,
            evaluations: evaluations,
            priority: priority
        };
    }

    function checkViability(scale, params, context) {
        const evaluation = evaluateScaleScenario(scale, params, context);
        return {
            status: evaluation.status,
            reason: evaluation.reason,
            suggestion: evaluation.suggestion,
            observations: evaluation.observations
        };
    }

    function evaluateScale(scale, params, context) {
        return evaluateScaleScenario(scale, params, context);
    }

    function suggestScale(params, context) {
        return suggestBestScale(params, context);
    }

    const api = {
        SCALE_INFO: SCALE_INFO,
        SCALE_DECISION_MATRIX: SCALE_DECISION_MATRIX,
        generateEmployeeIds: generateEmployeeIds,
        getDaysInMonth: getDaysInMonth,
        getDaysOperated: getDaysOperated,
        calcTotalOperationHours: calcTotalOperationHours,
        calcMinStaff: calcMinStaff,
        getHoursPerDay: getHoursPerDay,
        getAssignmentsPerPost: getAssignmentsPerPost,
        buildSimulation: buildSimulation,
        getCoverageStatus: getCoverageStatus,
        evaluateScaleScenario: evaluateScaleScenario,
        suggestBestScale: suggestBestScale,
        evaluateScale: evaluateScale,
        suggestScale: suggestScale,
        checkViability: checkViability
    };

    if (root) root.ScaleDimensioner = api;
})(typeof window !== 'undefined' ? window : globalThis);
