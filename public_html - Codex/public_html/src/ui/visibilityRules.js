(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const ui = simulator.ui = simulator.ui || {};
    const scalesDomain = simulator.domain && simulator.domain.scales;

    function getVisibilityState(scaleId, operationType) {
        const isContinuous = scalesDomain ? scalesDomain.isContinuousScale(scaleId) : false;
        const operationHint = isContinuous
            ? 'Esta escala já considera operação em todos os dias.'
            : 'Use sábado e domingo apenas quando a operação realmente exigir cobertura nesses dias.';

        const compatibilityHint = !isContinuous && operationType !== 'diurna'
            ? 'Escalas diurnas e mistas em jornadas prolongadas exigem revisão de aderência.'
            : isContinuous && operationType === 'diurna'
                ? 'Escalas contínuas costumam performar melhor em operações de 12h ou 24h.'
                : '';

        return {
            showWeekendSection: !isContinuous,
            showHolidayToggle: !isContinuous,
            weekendNote: operationHint,
            holidayNote: isContinuous
                ? 'Feriados não reduzem o quadro mínimo desta escala, mas podem gerar alertas operacionais.'
                : 'Se desmarcado, os feriados do período serão abatidos da operação.',
            compatibilityHint: compatibilityHint
        };
    }

    ui.visibilityRules = {
        getVisibilityState: getVisibilityState
    };
})(typeof window !== 'undefined' ? window : globalThis);
