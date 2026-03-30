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
