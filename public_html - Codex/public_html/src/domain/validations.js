(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const domain = simulator.domain = simulator.domain || {};
    const scalesDomain = domain.scales;

    function roundToSingleDecimal(value) {
        return Number((Number(value) || 0).toFixed(1));
    }

    function buildCompatibility(scale, operationType) {
        const code = scalesDomain.getCompatibilityCode(scale.id, operationType);

        if (code === 'alta') {
            return { code: code, label: 'Alta aderência' };
        }

        if (code === 'media') {
            return { code: code, label: 'Compatível' };
        }

        if (code === 'baixa') {
            return { code: code, label: 'Compatível com alerta' };
        }

        return { code: code, label: 'Operação incompatível' };
    }

    function pushUnique(list, message) {
        if (!message) return;
        if (list.indexOf(message) === -1) {
            list.push(message);
        }
    }

    function buildHoursComparison(scale, bundle) {
        const referenceHours = roundToSingleDecimal(bundle.formula.automaticHours);
        const consideredHours = roundToSingleDecimal(bundle.formula.effectiveHoursReference);
        const profile = scalesDomain.getHoursValidationProfile(scale.id);
        const lowerAlert = roundToSingleDecimal(referenceHours * profile.lowerAlertPct);
        const lowerAccept = roundToSingleDecimal(referenceHours * profile.lowerAcceptPct);
        const upperAccept = roundToSingleDecimal(referenceHours * profile.upperAcceptPct);
        const upperAlert = roundToSingleDecimal(referenceHours * profile.upperAlertPct);
        const deltaHours = roundToSingleDecimal(consideredHours - referenceHours);
        const deltaPct = referenceHours ? Number((((consideredHours - referenceHours) / referenceHours) * 100).toFixed(1)) : 0;

        let code = 'standard';
        let label = 'Dentro do padrão';
        let shortMessage = 'A carga informada segue a referência natural da escala para o mês.';
        let detailMessage = 'A leitura pode ser tratada como cenário padrão da escala.';

        if (consideredHours < lowerAlert || consideredHours > upperAlert) {
            code = 'incompatible';
            label = 'Incompatível com a escala';
            shortMessage = 'O valor informado extrapola a capacidade natural da escala ou do ciclo.';
            detailMessage = 'Este cenário não pode ser tratado como padrão porque foge da faixa parametrizada da escala.';
        } else if (consideredHours < lowerAccept) {
            code = 'below_reference';
            label = 'Abaixo da referência';
            shortMessage = 'Horas abaixo da referência do mês. A cobertura tende a exigir mais pessoas.';
            detailMessage = 'O quadro mínimo foi recalculado para cima para preservar a cobertura com menor disponibilidade por colaborador.';
        } else if (consideredHours > upperAccept) {
            code = 'above_reference';
            label = 'Acima da referência';
            shortMessage = 'Horas acima da referência do mês. Isso tende a depender de compensação ou ajuste coletivo.';
            detailMessage = 'A leitura foi mantida com alerta porque esse volume pode depender de horas extras, banco de horas ou compensação.';
        }

        return {
            code: code,
            label: label,
            shortMessage: shortMessage,
            detailMessage: detailMessage,
            referenceHours: referenceHours,
            consideredHours: consideredHours,
            deltaHours: deltaHours,
            deltaPct: deltaPct,
            ranges: {
                lowerAlert: lowerAlert,
                lowerAccept: lowerAccept,
                upperAccept: upperAccept,
                upperAlert: upperAlert
            }
        };
    }

    function buildStatus(compatibility, hoursComparison, bundle) {
        if (compatibility.code === 'incompativel' || hoursComparison.code === 'incompatible') {
            return { code: 'incompatible', label: 'Incompatível com a escala' };
        }

        if (bundle.searchLimitReached || bundle.simulation.coveragePct < 100) {
            return { code: 'incompatible', label: 'Incompatível com a escala' };
        }

        if (hoursComparison.code === 'below_reference') {
            return { code: 'below_reference', label: 'Abaixo da referência' };
        }

        if (hoursComparison.code === 'above_reference') {
            return { code: 'above_reference', label: 'Acima da referência' };
        }

        return { code: 'standard', label: 'Dentro do padrão' };
    }

    function validateScale(bundle, input, holidayContext) {
        const scale = bundle.scale;
        const formula = bundle.formula;
        const simulation = bundle.simulation;
        const compatibility = buildCompatibility(scale, input.operationType);
        const hoursComparison = buildHoursComparison(scale, bundle);
        const status = buildStatus(compatibility, hoursComparison, bundle);
        const alerts = [];
        const observations = [];
        const legalNotes = [];
        const coverageCriterionNote = scalesDomain.getCoverageCriterionNote(scale.id);

        if (status.code === 'below_reference') {
            pushUnique(alerts, 'Horas abaixo da referência aumentam a necessidade de equipe para fechar o mês.');
        }

        if (status.code === 'above_reference') {
            pushUnique(alerts, 'Horas acima da referência podem depender de compensação, horas extras ou ajuste coletivo.');
        }

        if (hoursComparison.code === 'incompatible') {
            pushUnique(alerts, 'As horas informadas extrapolam a capacidade natural da escala ou do ciclo.');
        }

        if (compatibility.code === 'incompativel') {
            pushUnique(alerts, 'O tipo de operação informado não é aderente a esta escala.');
        } else if (compatibility.code === 'baixa') {
            pushUnique(observations, 'A combinação entre escala e operação é possível, mas exige monitoramento mais atento.');
        }

        if (formula.scenarioMinimumHeadcount > formula.quadroMinimo) {
            pushUnique(observations, 'O quadro mínimo foi ampliado pela comparação entre horas consideradas e horas totais da operação.');
        }

        if (bundle.operationalHeadcount > formula.scenarioMinimumHeadcount) {
            pushUnique(observations, 'A distribuição do ciclo pediu reforço adicional para fechar todos os dias operados.');
        }

        if (bundle.searchLimitReached || simulation.coveragePct < 100) {
            pushUnique(alerts, 'Mesmo com reforço de quadro, a cobertura ainda pede revisão manual.');
        }

        if ((scale.id === '5x1' || scale.id === '6x1') && input.worksSunday) {
            pushUnique(alerts, 'Cobertura aos domingos nesta escala exige controle rigoroso do descanso semanal.');
        }

        if (!scale.continuous && !input.worksSaturday && input.worksSunday) {
            pushUnique(alerts, 'Cobertura apenas no domingo é pouco aderente e deve ser validada com a operação.');
        }

        if (!scale.continuous && input.worksSaturday && input.worksSunday && scale.id === '5x2') {
            pushUnique(observations, 'Na 5x2, operar sábado e domingo tende a exigir revezamento e compensação adicional.');
        }

        if (!scale.continuous && input.worksSunday && !input.worksSaturday && scale.id === '5x2') {
            pushUnique(alerts, 'Na 5x2, operar só domingo não acompanha o padrão natural de dias úteis da escala.');
        }

        if (!scale.continuous && holidayContext.count > 0 && !input.worksHolidays) {
            pushUnique(observations, 'Os feriados do período foram abatidos da referência mensal e dos dias operados.');
        }

        if (!scale.continuous && holidayContext.count > 0 && input.worksHolidays) {
            pushUnique(observations, 'Os feriados do período foram mantidos dentro da referência e da cobertura do mês.');
        }

        if (scale.continuous && holidayContext.count > 0) {
            pushUnique(observations, 'Nesta escala contínua, feriados não reduzem a referência natural do ciclo.');
        }

        if (coverageCriterionNote) {
            pushUnique(observations, coverageCriterionNote);
        }

        if (simulation.imbalanceHours >= scale.shiftHours * 2) {
            pushUnique(observations, 'Há concentração de horas em parte da equipe e vale revisar a distribuição final.');
        }

        if (simulation.maxHours > 220) {
            pushUnique(alerts, 'A leitura mensal chegou a uma faixa alta de horas e pede validação da jornada real.');
        }

        if (scale.id === '12x36' || scale.id === '24x48' || scale.id === '12x60') {
            pushUnique(legalNotes, 'Verifique exigência de norma coletiva ou política interna antes da implantação.');
        }

        if (scale.id === '24x48') {
            pushUnique(legalNotes, 'Turnos longos pedem validação formal de jornada, descanso e cobertura real da equipe.');
        }

        if (scale.id === '5x1' || scale.id === '6x1') {
            pushUnique(legalNotes, 'A folga semanal precisa ser acompanhada com atenção para evitar desequilíbrio no ciclo.');
        }

        if (status.code === 'above_reference') {
            pushUnique(legalNotes, 'Acima da referência natural, a viabilidade pode depender de compensação válida e instrumento coletivo.');
        }

        return {
            compatibility: compatibility,
            status: status,
            hoursComparison: hoursComparison,
            alerts: alerts,
            observations: observations,
            legalNotes: legalNotes
        };
    }

    domain.validations = {
        validateScale: validateScale
    };
})(typeof window !== 'undefined' ? window : globalThis);
