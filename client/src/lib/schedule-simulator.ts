export type ScaleId = "5x2" | "5x1" | "6x1" | "6x2" | "12x36" | "4x2" | "12x60" | "24x48";
export type ScaleChoice = ScaleId | "auto";
type OperationType = "diurna" | "12h" | "24h";

export interface ScheduleHolidayContext {
  count: number;
  set: Set<string>;
}

export interface ShiftInput {
  start: string;
  end: string;
}

export interface ScheduleFormInput {
  year: number;
  month: number;
  scaleChoice: ScaleChoice;
  postos: number;
  operationStart: string;
  operationEnd: string;
  shiftCount: number;
  hasOverlap: boolean;
  shifts: ShiftInput[];
  worksSaturday: boolean;
  worksSunday: boolean;
  worksHolidays: boolean;
  hoursOverride: number;
}

export interface ScheduleSimulationResult {
  monthLabel: string;
  postos: number;
  holidayCount: number;
  scenarioSummary: {
    periodLabel: string;
    operationWindowLabel: string;
    simultaneousPeople: number;
    shiftCount: number;
    hasOverlap: boolean;
    overlapHours: number;
    coverageLabel: string;
    worksSaturday: boolean;
    worksSunday: boolean;
    worksHolidays: boolean;
    shiftLines: string[];
  };
  suggestedScale: { id: ScaleId; label: string; tag: string };
  selectedScale: { id: ScaleId; label: string };
  selectedIsSuggested: boolean;
  alternatives: Array<{ id: ScaleId; label: string; tag: string; tagCode: "compatible" | "warning" }>;
  userBlock: {
    scale: { id: ScaleId; label: string };
    coveragePlan: {
      postos: number;
      colaboradoresNecessarios: number;
      colaboradoresPorPosto: number;
      quadroPadrao: number;
      quadroPorHoras: number;
      quadroBasePorPosto: number;
    };
    automaticHoursReference: number;
    consideredHours: number;
    coberturaPercentual: number;
    coberturaNivel: "integral" | "ajustada" | "parcial";
    coberturaLabel: string;
    compatibilidade: { code: string; label: string };
    status: { code: string; label: string };
    hoursComparison: {
      code: string;
      label: string;
      shortMessage: string;
      detailMessage: string;
      referenceHours: number;
      consideredHours: number;
      deltaHours: number;
      deltaPct: number;
    };
    observacoes: string[];
    alertas: string[];
    legalNotes: string[];
    legalSummary: string;
    legalSummaryCode: string;
    simulation: {
      employees: string[];
      days: Array<{
        day: number;
        iso: string;
        holiday: boolean;
        weekend: boolean;
        operated: boolean;
        assigned: string[];
        off: string[];
        requiredAssignments: number;
        deficit: number;
      }>;
      coveragePct: number;
      averageHours: number;
      maxHours: number;
      minHours: number;
      imbalanceHours: number;
    };
    totalOperationHours: number;
  };
  holidaySummary: string;
}

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

const SCALE_CATALOG = {
  "5x2": {
    id: "5x2",
    label: "5x2",
    shiftHours: 8,
    cycleType: "week",
    weeklyOffDays: [0, 6],
    continuous: false,
    priority: { diurna: 10, "12h": 1, "24h": 0 },
    marketUsage: 10,
    legalRisk: 2,
    operationalComplexity: 2,
    legalProfile: "Jornada clássica de dias úteis, com baixa complexidade operacional.",
    limits: { lowerAlertPct: 0.85, lowerAcceptPct: 0.94, upperAcceptPct: 1.04, upperAlertPct: 1.1 },
  },
  "5x1": {
    id: "5x1",
    label: "5x1",
    shiftHours: 8,
    cycleType: "cycle",
    cyclePattern: ["T", "T", "T", "T", "T", "F"],
    continuous: false,
    priority: { diurna: 7, "12h": 1, "24h": 0 },
    marketUsage: 6,
    legalRisk: 4,
    operationalComplexity: 4,
    legalProfile: "Precisa de controle mais atento do descanso semanal e da folga rotativa.",
    limits: { lowerAlertPct: 0.85, lowerAcceptPct: 0.93, upperAcceptPct: 1.05, upperAlertPct: 1.12 },
  },
  "6x1": {
    id: "6x1",
    label: "6x1",
    shiftHours: 8,
    cycleType: "cycle",
    cyclePattern: ["T", "T", "T", "T", "T", "T", "F"],
    continuous: false,
    priority: { diurna: 8, "12h": 1, "24h": 0 },
    marketUsage: 8,
    legalRisk: 4,
    operationalComplexity: 5,
    legalProfile: "Escala comum para cobrir sábado com folga semanal rotativa.",
    limits: { lowerAlertPct: 0.86, lowerAcceptPct: 0.94, upperAcceptPct: 1.05, upperAlertPct: 1.12 },
  },
  "6x2": {
    id: "6x2",
    label: "6x2",
    shiftHours: 8,
    cycleType: "cycle",
    cyclePattern: ["T", "T", "T", "T", "T", "T", "F", "F"],
    continuous: false,
    priority: { diurna: 7, "12h": 5, "24h": 8 },
    marketUsage: 6,
    legalRisk: 5,
    operationalComplexity: 6,
    legalProfile: "Exige coordenação maior de turnos e da folga rotativa da equipe.",
    limits: { lowerAlertPct: 0.84, lowerAcceptPct: 0.92, upperAcceptPct: 1.06, upperAlertPct: 1.14 },
  },
  "12x36": {
    id: "12x36",
    label: "12x36",
    shiftHours: 12,
    cycleType: "cycle",
    cyclePattern: ["T", "F"],
    continuous: true,
    priority: { diurna: 2, "12h": 10, "24h": 10 },
    marketUsage: 10,
    legalRisk: 6,
    operationalComplexity: 5,
    legalProfile: "Normalmente pede atenção a acordo coletivo, política interna e jornada real.",
    limits: { lowerAlertPct: 0.9, lowerAcceptPct: 0.96, upperAcceptPct: 1.04, upperAlertPct: 1.08 },
  },
  "4x2": {
    id: "4x2",
    label: "4x2",
    shiftHours: 12,
    cycleType: "cycle",
    cyclePattern: ["T", "T", "T", "T", "F", "F"],
    continuous: true,
    priority: { diurna: 3, "12h": 8, "24h": 9 },
    marketUsage: 7,
    legalRisk: 5,
    operationalComplexity: 7,
    legalProfile: "Escala cíclica com boa aderência a operação contínua, mas com rodízio mais sensível.",
    limits: { lowerAlertPct: 0.88, lowerAcceptPct: 0.95, upperAcceptPct: 1.05, upperAlertPct: 1.1 },
  },
  "12x60": {
    id: "12x60",
    label: "12x60",
    shiftHours: 12,
    cycleType: "cycle",
    cyclePattern: ["T", "F", "F"],
    continuous: true,
    priority: { diurna: 1, "12h": 6, "24h": 5 },
    marketUsage: 4,
    legalRisk: 7,
    operationalComplexity: 7,
    legalProfile: "Formato mais específico, normalmente usado com regras internas bem definidas.",
    limits: { lowerAlertPct: 0.88, lowerAcceptPct: 0.94, upperAcceptPct: 1.06, upperAlertPct: 1.12 },
  },
  "24x48": {
    id: "24x48",
    label: "24x48",
    shiftHours: 24,
    cycleType: "cycle",
    cyclePattern: ["T", "F", "F"],
    continuous: true,
    priority: { diurna: 0, "12h": 2, "24h": 7 },
    marketUsage: 5,
    legalRisk: 8,
    operationalComplexity: 8,
    legalProfile: "Formato mais restritivo e normalmente tratado como exceção operacional.",
    limits: { lowerAlertPct: 0.9, lowerAcceptPct: 0.96, upperAcceptPct: 1.04, upperAlertPct: 1.08 },
  },
} as const;

const SCALE_IDS = Object.keys(SCALE_CATALOG) as ScaleId[];

const round1 = (value: number) => Number(value.toFixed(1));
const clamp = (value: number, minimum = 1) => Math.max(minimum, Number.isFinite(value) ? value : minimum);
const formatMonth = (year: number, month: number) => {
  const label = MONTH_LABEL.format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
};
const toIso = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

function parseTime(value: string, fallback: number) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 ? hours * 60 + minutes : fallback;
}

function normalizeInterval(startMinutes: number, endMinutes: number) {
  const safeEnd = endMinutes <= startMinutes ? endMinutes + 1440 : endMinutes;
  return { startMinutes, endMinutes: safeEnd, durationHours: round1((safeEnd - startMinutes) / 60) };
}

function formatMinutes(minutes: number) {
  const safe = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function buildShiftPlan(input: ScheduleFormInput) {
  const startMinutes = parseTime(input.operationStart, 8 * 60);
  const endMinutes = parseTime(input.operationEnd, 18 * 60);
  const base = normalizeInterval(startMinutes, endMinutes);
  const count = clamp(input.shiftCount);

  const shifts = input.hasOverlap
    ? Array.from({ length: count }, (_, index) => {
        const raw = input.shifts[index] ?? input.shifts[input.shifts.length - 1] ?? { start: input.operationStart, end: input.operationEnd };
        const interval = normalizeInterval(parseTime(raw.start, startMinutes), parseTime(raw.end, endMinutes));
        return { label: `Turno ${index + 1}`, start: formatMinutes(interval.startMinutes), end: formatMinutes(interval.endMinutes), startMinutes: interval.startMinutes, endMinutes: interval.endMinutes, durationHours: interval.durationHours };
      })
    : Array.from({ length: count }, (_, index) => {
        const step = (base.endMinutes - base.startMinutes) / count;
        const interval = normalizeInterval(
          Math.round(base.startMinutes + step * index),
          index === count - 1 ? base.endMinutes : Math.round(base.startMinutes + step * (index + 1)),
        );
        return { label: `Turno ${index + 1}`, start: formatMinutes(interval.startMinutes), end: formatMinutes(interval.endMinutes), startMinutes: interval.startMinutes, endMinutes: interval.endMinutes, durationHours: interval.durationHours };
      });

  const merged = shifts
    .slice()
    .sort((left, right) => left.startMinutes - right.startMinutes)
    .reduce<Array<{ startMinutes: number; endMinutes: number }>>((acc, shift) => {
      const last = acc[acc.length - 1];
      if (!last || shift.startMinutes > last.endMinutes) acc.push({ startMinutes: shift.startMinutes, endMinutes: shift.endMinutes });
      else last.endMinutes = Math.max(last.endMinutes, shift.endMinutes);
      return acc;
    }, []);

  const laborMinutes = shifts.reduce((sum, shift) => sum + (shift.endMinutes - shift.startMinutes), 0);
  const coveredMinutes = merged.reduce((sum, interval) => sum + (interval.endMinutes - interval.startMinutes), 0);
  const averageShiftHours = shifts.length ? round1(laborMinutes / 60 / shifts.length) : 0;
  const coverageHoursPerDay = round1(coveredMinutes / 60);

  return {
    shifts: shifts.map(({ label, start, end, durationHours }) => ({ label, start, end, durationHours })),
    operationWindowLabel: `${formatMinutes(base.startMinutes)} às ${formatMinutes(base.endMinutes)}`,
    operationType:
      coverageHoursPerDay >= 20 || averageShiftHours >= 20
        ? "24h"
        : coverageHoursPerDay > 9 || count > 1 || averageShiftHours >= 10
          ? "12h"
          : "diurna" as OperationType,
    coverageHoursPerDay,
    laborHoursPerDayPerPost: round1(laborMinutes / 60),
    assignmentHours: averageShiftHours || base.durationHours,
    overlapHours: round1(Math.max(0, laborMinutes - coveredMinutes) / 60),
  };
}

function getAutomaticHours(scaleId: ScaleId, operatedDays: number, operatedWeekdays: number, totalDays: number) {
  switch (scaleId) {
    case "5x2":
      return operatedWeekdays * 8;
    case "5x1":
      return Math.round(Math.min(operatedDays, totalDays * (5 / 6))) * 8;
    case "6x1":
      return Math.round(Math.min(operatedDays, totalDays * (6 / 7))) * 8;
    case "6x2":
      return Math.round(Math.min(operatedDays || totalDays, totalDays * (6 / 8))) * 8;
    case "12x36":
      return Math.round((operatedDays || totalDays) * 0.5) * 12;
    case "4x2":
      return Math.round((operatedDays || totalDays) * (4 / 6)) * 12;
    case "12x60":
      return Math.round((operatedDays || totalDays) / 3) * 12;
    case "24x48":
      return Math.round((operatedDays || totalDays) / 3) * 24;
  }
}

function generateEmployeeIds(count: number) {
  return Array.from({ length: clamp(count, 0) }, (_, index) => {
    let current = index;
    let label = "";
    while (current >= 0) {
      label = String.fromCharCode((current % 26) + 65) + label;
      current = Math.floor(current / 26) - 1;
    }
    return label;
  });
}

function isEmployeeWorking(scaleId: ScaleId, dayIndex: number, employeeIndex: number, date: Date) {
  const scale = SCALE_CATALOG[scaleId];
  if (scale.cycleType === "week" && "weeklyOffDays" in scale) {
    return !(scale.weeklyOffDays as readonly number[]).includes(date.getDay());
  }
  const pattern = scale.cyclePattern ?? [];
  return pattern[(dayIndex + employeeIndex) % pattern.length] === "T";
}

function simulateCoverage(scaleId: ScaleId, input: ScheduleFormInput, shiftPlan: ReturnType<typeof buildShiftPlan>, headcount: number, holidaySet: Set<string>) {
  const employees = generateEmployeeIds(headcount);
  const stats = { hours: {} as Record<string, number>, assignments: {} as Record<string, number>, weekendAssignments: {} as Record<string, number>, lastAssignedDay: {} as Record<string, number> };

  employees.forEach((id) => {
    stats.hours[id] = 0;
    stats.assignments[id] = 0;
    stats.weekendAssignments[id] = 0;
    stats.lastAssignedDay[id] = -999;
  });

  let requiredHoursTotal = 0;
  let coveredHoursTotal = 0;
  let assignedHoursTotal = 0;

  const days = Array.from({ length: new Date(input.year, input.month, 0).getDate() }, (_, index) => {
    const day = index + 1;
    const date = new Date(input.year, input.month - 1, day);
    const iso = toIso(input.year, input.month, day);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const holiday = holidaySet.has(iso);
    const operated =
      (!holiday || input.worksHolidays) &&
      (date.getDay() === 6 ? input.worksSaturday : date.getDay() === 0 ? input.worksSunday : true);

    const requiredAssignments = operated ? input.shiftCount * input.postos : 0;
    const available = operated
      ? employees.filter((employeeId, employeeIndex) => isEmployeeWorking(scaleId, index, employeeIndex, date))
      : [];

    available.sort((left, right) => {
      if (stats.assignments[left] !== stats.assignments[right]) return stats.assignments[left] - stats.assignments[right];
      if (weekend && stats.weekendAssignments[left] !== stats.weekendAssignments[right]) return stats.weekendAssignments[left] - stats.weekendAssignments[right];
      if (stats.hours[left] !== stats.hours[right]) return stats.hours[left] - stats.hours[right];
      if (stats.lastAssignedDay[left] !== stats.lastAssignedDay[right]) return stats.lastAssignedDay[left] - stats.lastAssignedDay[right];
      return left.localeCompare(right);
    });

    const assigned = available.slice(0, requiredAssignments);
    const requiredHours = operated ? shiftPlan.laborHoursPerDayPerPost * input.postos : 0;
    const assignedHours = assigned.length * shiftPlan.assignmentHours;
    const coveredHours = Math.min(requiredHours, assignedHours);

    if (operated) {
      requiredHoursTotal += requiredHours;
      coveredHoursTotal += coveredHours;
      assignedHoursTotal += assignedHours;
    }

    assigned.forEach((employeeId) => {
      stats.hours[employeeId] += shiftPlan.assignmentHours;
      stats.assignments[employeeId] += 1;
      stats.lastAssignedDay[employeeId] = day;
      if (weekend) stats.weekendAssignments[employeeId] += 1;
    });

    return {
      day,
      iso,
      holiday,
      weekend,
      operated,
      assigned,
      off: employees.filter((employeeId) => !assigned.includes(employeeId)),
      requiredAssignments,
      deficit: operated ? Math.max(0, requiredAssignments - assigned.length) : 0,
    };
  });

  const hours = employees.map((employeeId) => stats.hours[employeeId]);
  return {
    employees,
    days,
    coveragePct: requiredHoursTotal ? Number(((coveredHoursTotal / requiredHoursTotal) * 100).toFixed(1)) : 100,
    averageHours: employees.length ? Number((assignedHoursTotal / employees.length).toFixed(1)) : 0,
    maxHours: hours.length ? Math.max(...hours) : 0,
    minHours: hours.length ? Math.min(...hours) : 0,
    imbalanceHours: hours.length ? Math.max(...hours) - Math.min(...hours) : 0,
  };
}

function getBaseHeadcountPerPost(scaleId: ScaleId, input: ScheduleFormInput, operatedDays: number, totalDays: number, shiftCount: number, operatedWeekdays: number) {
  const totalAssignments = operatedDays * shiftCount;
  if (scaleId === "5x2" && !input.worksSunday && !input.worksSaturday && shiftCount === 1) return 1;
  if (scaleId === "12x36") return Math.max(2, shiftCount * 2);
  if (scaleId === "24x48" || scaleId === "12x60") return Math.max(3, shiftCount * 3);
  if (scaleId === "4x2") return shiftCount >= 3 ? 3 : 2;

  const capacity =
    scaleId === "5x1" ? Math.round(Math.min(operatedDays, totalDays * (5 / 6))) :
    scaleId === "6x1" ? Math.round(Math.min(operatedDays, totalDays * (6 / 7))) :
    scaleId === "6x2" ? Math.round(Math.min(operatedDays || totalDays, totalDays * (6 / 8))) :
    Math.max(1, operatedWeekdays || 1);

  return Math.max(1, Math.ceil(totalAssignments / Math.max(1, capacity)));
}

function evaluateScale(scaleId: ScaleId, input: ScheduleFormInput, shiftPlan: ReturnType<typeof buildShiftPlan>, holidaySet: Set<string>, holidayCount: number) {
  const totalDays = new Date(input.year, input.month, 0).getDate();
  const operatedDays = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const date = new Date(input.year, input.month - 1, day);
    const iso = toIso(input.year, input.month, day);
    const isHoliday = holidaySet.has(iso);
    return (!isHoliday || input.worksHolidays) && (date.getDay() === 6 ? input.worksSaturday : date.getDay() === 0 ? input.worksSunday : true);
  });
  const operatedDaysCount = operatedDays.filter(Boolean).length;
  const operatedWeekdays = Array.from({ length: totalDays }, (_, index) => new Date(input.year, input.month - 1, index + 1))
    .filter((date) => date.getDay() !== 0 && date.getDay() !== 6)
    .filter((date) => {
      const iso = toIso(input.year, input.month, date.getDate());
      return !holidaySet.has(iso) || input.worksHolidays;
    }).length;

  const automaticHours = getAutomaticHours(scaleId, operatedDaysCount, operatedWeekdays, totalDays);
  const consideredHours = input.hoursOverride > 0 ? input.hoursOverride : automaticHours;
  const totalOperationHours = operatedDaysCount * shiftPlan.laborHoursPerDayPerPost * input.postos;
  const quadroBasePorPosto = getBaseHeadcountPerPost(scaleId, input, operatedDaysCount, totalDays, input.shiftCount, operatedWeekdays);
  const quadroPadrao = Math.max(input.postos, input.postos * quadroBasePorPosto);
  const quadroPorHoras = Math.max(quadroPadrao, Math.ceil(totalOperationHours / Math.max(1, consideredHours)));

  let bestHeadcount = quadroPorHoras;
  let bestSimulation = simulateCoverage(scaleId, input, shiftPlan, bestHeadcount, holidaySet);
  const maxSearch = quadroPorHoras + Math.max(8, input.postos * 8);

  for (let headcount = quadroPorHoras; headcount <= maxSearch; headcount += 1) {
    const simulation = simulateCoverage(scaleId, input, shiftPlan, headcount, holidaySet);
    bestHeadcount = headcount;
    bestSimulation = simulation;
    if (simulation.coveragePct >= 100) break;
  }

  const scale = SCALE_CATALOG[scaleId];
  const operationType = shiftPlan.operationType as OperationType;
  const priority = scale.priority[operationType];
  const compatibilidade =
    priority >= 8 ? { code: "alta", label: "Alta aderência" } :
    priority >= 5 ? { code: "media", label: "Compatível" } :
    priority >= 2 ? { code: "baixa", label: "Compatível com alerta" } :
    { code: "incompativel", label: "Operação incompatível" };

  const lowerAlert = round1(automaticHours * scale.limits.lowerAlertPct);
  const lowerAccept = round1(automaticHours * scale.limits.lowerAcceptPct);
  const upperAccept = round1(automaticHours * scale.limits.upperAcceptPct);
  const upperAlert = round1(automaticHours * scale.limits.upperAlertPct);
  const deltaHours = round1(consideredHours - automaticHours);
  const deltaPct = automaticHours ? Number((((consideredHours - automaticHours) / automaticHours) * 100).toFixed(1)) : 0;

  const hoursComparison =
    consideredHours < lowerAlert || consideredHours > upperAlert
      ? { code: "incompatible", label: "Incompatível com a escala", shortMessage: "Horas fora da faixa natural da escala.", detailMessage: "A jornada informada extrapola a faixa parametrizada da escala.", referenceHours: automaticHours, consideredHours, deltaHours, deltaPct }
      : consideredHours < lowerAccept
        ? { code: "below_reference", label: "Abaixo da referência", shortMessage: "Horas abaixo da referência aumentam o quadro mínimo.", detailMessage: "O quadro foi reforçado para manter a cobertura com menos horas por colaborador.", referenceHours: automaticHours, consideredHours, deltaHours, deltaPct }
        : consideredHours > upperAccept
          ? { code: "above_reference", label: "Acima da referência", shortMessage: "Horas acima da referência pedem validação de compensação.", detailMessage: "A leitura foi mantida com alerta porque as horas superam a referência natural da escala.", referenceHours: automaticHours, consideredHours, deltaHours, deltaPct }
          : { code: "standard", label: "Dentro do padrão", shortMessage: "A carga segue a referência natural da escala.", detailMessage: "A leitura pode ser tratada como cenário padrão.", referenceHours: automaticHours, consideredHours, deltaHours, deltaPct };

  const status =
    compatibilidade.code === "incompativel" || hoursComparison.code === "incompatible" || bestSimulation.coveragePct < 100
      ? { code: "incompatible", label: "Incompatível com a escala" }
      : hoursComparison.code === "below_reference"
        ? { code: "below_reference", label: "Abaixo da referência" }
        : hoursComparison.code === "above_reference"
          ? { code: "above_reference", label: "Acima da referência" }
          : { code: "standard", label: "Dentro do padrão" };

  const alertas: string[] = [];
  const observacoes: string[] = [];
  const legalNotes: string[] = [];

  if (status.code === "below_reference") alertas.push("hours_below_reference");
  if (status.code === "above_reference") alertas.push("hours_above_reference");
  if (hoursComparison.code === "incompatible") alertas.push("hours_incompatible");
  if (compatibilidade.code === "incompativel") alertas.push("operation_incompatible");
  if (compatibilidade.code === "baixa") observacoes.push("low_compatibility_monitoring");
  if (quadroPorHoras > quadroPadrao) observacoes.push("minimum_headcount_expanded");
  if (bestHeadcount > quadroPorHoras) observacoes.push("additional_headcount_required");
  if (bestSimulation.coveragePct < 100) alertas.push("coverage_manual_review");
  if ((scaleId === "5x1" || scaleId === "6x1") && input.worksSunday) alertas.push("sunday_control_required");
  if (!scale.continuous && holidayCount > 0 && !input.worksHolidays) observacoes.push("holidays_discounted");
  if (!scale.continuous && holidayCount > 0 && input.worksHolidays) observacoes.push("holidays_maintained");
  if (scale.continuous && holidayCount > 0) observacoes.push("continuous_holidays");
  if (bestSimulation.imbalanceHours >= scale.shiftHours * 2) observacoes.push("hours_imbalance");
  if (bestSimulation.maxHours > 220) alertas.push("high_monthly_hours");
  if (["12x36", "24x48", "12x60"].includes(scaleId)) legalNotes.push("collective_policy_required");
  if (scaleId === "24x48") legalNotes.push("long_shift_formal_validation");
  if (scaleId === "5x1" || scaleId === "6x1") legalNotes.push("weekly_rest_attention");
  if (status.code === "above_reference") legalNotes.push("compensation_required");

  const coberturaNivel: "integral" | "ajustada" | "parcial" =
    bestSimulation.coveragePct >= 100 ? "integral" : bestSimulation.coveragePct >= 90 ? "ajustada" : "parcial";

  const hiddenScore =
    scale.marketUsage * 3 +
    scale.priority[operationType] * 10 -
    scale.legalRisk * 2 -
    scale.operationalComplexity * 2 +
    Math.max(0, Math.round(bestSimulation.coveragePct)) +
    (shiftPlan.operationType === "24h" && scaleId === "12x36" ? 22 : 0) +
    (input.worksSaturday && !input.worksSunday && scaleId === "6x1" ? 18 : 0) +
    (input.worksSunday && scaleId === "6x2" ? 18 : 0) +
    (compatibilidade.code === "alta" ? 16 : compatibilidade.code === "media" ? 8 : compatibilidade.code === "baixa" ? -6 : -30) +
    (status.code === "standard" ? 10 : status.code === "below_reference" ? -2 : status.code === "above_reference" ? -5 : -24) -
    alertas.length * 4 -
    Math.max(0, bestHeadcount - quadroPadrao) * 3;

  return {
    id: scaleId,
    label: scale.label,
    hiddenScore,
    coveragePlan: {
      postos: input.postos,
      colaboradoresNecessarios: bestHeadcount,
      colaboradoresPorPosto: Math.max(1, Math.ceil(bestHeadcount / input.postos)),
      quadroPadrao,
      quadroPorHoras,
      quadroBasePorPosto,
    },
    automaticHoursReference: automaticHours,
    consideredHours,
    coberturaPercentual: bestSimulation.coveragePct,
    coberturaNivel,
    coberturaLabel:
      status.code === "incompatible"
        ? "O cenário saiu da faixa padrão da escala e precisa de revisão antes da implantação."
        : status.code === "below_reference"
          ? "A cobertura foi preservada com reforço de quadro por causa das horas informadas abaixo da referência."
          : status.code === "above_reference"
            ? "A cobertura foi lida com alerta porque as horas informadas superam a referência natural da escala."
            : "Cobertura compatível com o padrão natural da escala para o período analisado.",
    compatibilidade,
    status,
    hoursComparison,
    observacoes,
    alertas,
    legalNotes,
    legalSummary: legalNotes[0] ?? scale.legalProfile,
    legalSummaryCode: legalNotes[0] ?? `scale_profile_${scaleId}`,
    simulation: bestSimulation,
    totalOperationHours,
  };
}

function buildScenarioSummary(input: ScheduleFormInput, shiftPlan: ReturnType<typeof buildShiftPlan>) {
  return {
    periodLabel: formatMonth(input.year, input.month),
    operationWindowLabel: shiftPlan.operationWindowLabel,
    simultaneousPeople: input.postos,
    shiftCount: input.shiftCount,
    hasOverlap: input.hasOverlap,
    overlapHours: shiftPlan.overlapHours,
    coverageLabel: `Sábado: ${input.worksSaturday ? "sim" : "não"} • Domingo: ${input.worksSunday ? "sim" : "não"} • Feriados: ${input.worksHolidays ? "sim" : "não"}`,
    worksSaturday: input.worksSaturday,
    worksSunday: input.worksSunday,
    worksHolidays: input.worksHolidays,
    shiftLines: shiftPlan.shifts.map((shift) => `${shift.label}: ${shift.start} às ${shift.end}`),
  };
}

export const SCALE_OPTIONS = SCALE_IDS.map((id) => ({
  id,
  label: SCALE_CATALOG[id].label,
  continuous: SCALE_CATALOG[id].continuous,
}));

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: formatMonth(new Date().getFullYear(), index + 1)
    .split(" de ")[0]
    .replace(/^\w/, letter => letter.toUpperCase()),
}));

export function getDefaultScheduleInput(date = new Date()): ScheduleFormInput {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    scaleChoice: "auto",
    postos: 2,
    operationStart: "08:00",
    operationEnd: "18:00",
    shiftCount: 2,
    hasOverlap: false,
    shifts: [
      { start: "08:00", end: "14:00" },
      { start: "12:00", end: "18:00" },
    ],
    worksSaturday: true,
    worksSunday: false,
    worksHolidays: false,
    hoursOverride: 0,
  };
}

export function simulateScheduleScenario(
  input: ScheduleFormInput,
  holidayContext: ScheduleHolidayContext
): ScheduleSimulationResult {
  const shiftPlan = buildShiftPlan(input);

  const results = SCALE_IDS.map((scaleId) => evaluateScale(scaleId, input, shiftPlan, holidayContext.set, holidayContext.count)).sort(
    (left, right) => right.hiddenScore - left.hiddenScore,
  );

  const suggested = results[0];
  const selected =
    input.scaleChoice === "auto"
      ? suggested
      : results.find((result) => result.id === input.scaleChoice) ?? suggested;

  const alternatives = results
    .filter((result) => result.id !== suggested.id)
    .filter((result) => result.compatibilidade.code !== "incompativel" && result.status.code !== "incompatible")
    .slice(0, 3)
    .map((result) => {
      const tagCode: "compatible" | "warning" =
        result.status.code === "standard" && result.compatibilidade.code !== "baixa" ? "compatible" : "warning";

      return {
        id: result.id,
        label: result.label,
        tag: tagCode === "compatible" ? "Alternativa compatível" : "Alternativa com alerta",
        tagCode,
      };
    });

  return {
    monthLabel: formatMonth(input.year, input.month),
    postos: input.postos,
    holidayCount: holidayContext.count,
    scenarioSummary: buildScenarioSummary(input, shiftPlan),
    suggestedScale: { id: suggested.id, label: suggested.label, tag: "Mais indicada" },
    selectedScale: { id: selected.id, label: selected.label },
    selectedIsSuggested: selected.id === suggested.id,
    alternatives,
    userBlock: {
      scale: { id: selected.id, label: selected.label },
      coveragePlan: selected.coveragePlan,
      automaticHoursReference: selected.automaticHoursReference,
      consideredHours: selected.consideredHours,
      coberturaPercentual: selected.coberturaPercentual,
      coberturaNivel: selected.coberturaNivel,
      coberturaLabel: selected.coberturaLabel,
      compatibilidade: selected.compatibilidade,
      status: selected.status,
      hoursComparison: selected.hoursComparison,
      observacoes: selected.observacoes,
      alertas: selected.alertas,
      legalNotes: selected.legalNotes,
      legalSummary: selected.legalSummary,
      legalSummaryCode: selected.legalSummaryCode,
      simulation: selected.simulation,
      totalOperationHours: selected.totalOperationHours,
    },
    holidaySummary:
      holidayContext.count > 0
        ? `${holidayContext.count} feriado(s) no periodo selecionado.`
        : "Sem feriados no periodo selecionado.",
  };
}
