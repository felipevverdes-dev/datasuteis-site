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
