(function (root) {
    'use strict';

    const simulator = root.AntiGravitySimulator = root.AntiGravitySimulator || {};
    const ui = simulator.ui = simulator.ui || {};
    const scalesDomain = simulator.domain && simulator.domain.scales;
    const labels = ui.labels || {};
    const visibilityRules = ui.visibilityRules;

    function byId(form, id) {
        return form.querySelector('#' + id);
    }

    function populateMonths(select) {
        if (!select) return;

        const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
        const currentMonth = new Date().getMonth();
        select.innerHTML = '';

        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = String(month).padStart(2, '0');
            const label = formatter.format(new Date(2026, month - 1, 1));
            option.textContent = label.charAt(0).toUpperCase() + label.slice(1);
            if (month - 1 === currentMonth) option.selected = true;
            select.appendChild(option);
        }
    }

    function populateYears(select) {
        if (!select) return;

        const currentYear = new Date().getFullYear();
        select.innerHTML = '';

        for (let year = currentYear - 1; year <= currentYear + 2; year++) {
            const option = document.createElement('option');
            option.value = String(year);
            option.textContent = String(year);
            if (year === currentYear) option.selected = true;
            select.appendChild(option);
        }
    }

    function populateScaleSelect(select) {
        if (!select || !scalesDomain) return;

        select.innerHTML = '';
        scalesDomain.getGroupedScaleOptions().forEach(function (group) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = group.label;

            group.scales.forEach(function (scale) {
                const option = document.createElement('option');
                option.value = scale.id;
                option.textContent = scale.label;
                optgroup.appendChild(option);
            });

            select.appendChild(optgroup);
        });

        select.value = '5x2';
    }

    function populateOperationSelect(select) {
        if (!select) return;

        select.innerHTML = '';
        (labels.operationTypes || []).forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            select.appendChild(option);
        });

        select.value = 'diurna';
    }

    function readForm(form) {
        return {
            scaleId: byId(form, 'ag-scale').value || '5x2',
            operationType: byId(form, 'ag-operation').value || 'diurna',
            year: Number(byId(form, 'ag-year').value || new Date().getFullYear()),
            month: Number(byId(form, 'ag-month').value || (new Date().getMonth() + 1)),
            postos: Math.max(1, Number(byId(form, 'ag-posts').value || 1)),
            worksSaturday: !!byId(form, 'ag-saturday').checked,
            worksSunday: !!byId(form, 'ag-sunday').checked,
            worksHolidays: !!byId(form, 'ag-holidays').checked
        };
    }

    function applyVisibility(form) {
        const current = readForm(form);
        const state = visibilityRules.getVisibilityState(current.scaleId, current.operationType);

        const weekendSection = byId(form, 'ag-weekend-section');
        const weekendNote = byId(form, 'ag-weekend-note');
        const holidayToggle = byId(form, 'ag-holiday-toggle');
        const holidayNote = byId(form, 'ag-holiday-note');
        const compatibilityHint = byId(form, 'ag-form-hint');

        if (weekendSection) {
            weekendSection.classList.toggle('hidden', !state.showWeekendSection);
        }

        if (holidayToggle) {
            holidayToggle.classList.toggle('hidden', !state.showHolidayToggle);
        }

        if (weekendNote) {
            weekendNote.textContent = state.weekendNote;
        }

        if (holidayNote) {
            holidayNote.textContent = state.holidayNote;
        }

        if (compatibilityHint) {
            compatibilityHint.textContent = state.compatibilityHint;
            compatibilityHint.classList.toggle('hidden', !state.compatibilityHint);
        }
    }

    function setAutomaticHours(form, hours) {
        const hoursField = byId(form, 'ag-hours-preview');
        if (!hoursField) return;
        hoursField.value = (Number(hours) || 0).toLocaleString('pt-BR') + ' h/mês';
    }

    function bindFormRules(form, onChange) {
        ['change', 'input'].forEach(function (eventName) {
            form.addEventListener(eventName, function () {
                applyVisibility(form);
                if (typeof onChange === 'function') {
                    onChange(readForm(form));
                }
            });
        });
    }

    function initForm(form, onChange) {
        populateMonths(byId(form, 'ag-month'));
        populateYears(byId(form, 'ag-year'));
        populateScaleSelect(byId(form, 'ag-scale'));
        populateOperationSelect(byId(form, 'ag-operation'));
        applyVisibility(form);
        bindFormRules(form, onChange);
    }

    ui.formRules = {
        initForm: initForm,
        readForm: readForm,
        applyVisibility: applyVisibility,
        setAutomaticHours: setAutomaticHours
    };
})(typeof window !== 'undefined' ? window : globalThis);
