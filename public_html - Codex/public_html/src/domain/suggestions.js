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
