(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const ui = simulator.ui = simulator.ui || {};

    ui.labels = {
        operationTypes: [
            { value: 'diurna', label: 'Diurna' },
            { value: '12h', label: '12 horas' },
            { value: '24h', label: '24 horas' }
        ],
        metricTooltips: {
            quadroMinimo: 'Menor quadro estimado para sustentar a cobertura da escala no período.',
            horasEstimadas: 'Carga mensal média estimada por profissional neste cenário.',
            cobertura: 'Leitura resumida da aderência da escala ao nível de operação selecionado.',
            compatibilidade: 'Nível de aderência entre a escala escolhida e o tipo de operação.'
        },
        howTitle: 'Como esta estimativa foi montada',
        howDisclaimer: 'Esta é uma estimativa operacional para planejamento e não substitui análise jurídica ou norma coletiva.'
    };
})(typeof window !== 'undefined' ? window : globalThis);
