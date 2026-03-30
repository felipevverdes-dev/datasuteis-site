import { buildDate, getCalendarDayDifference } from "@/lib/date-utils";
import type { SupportedLanguage } from "@/lib/site";

export interface AgeDetails {
  years: number;
  months: number;
  days: number;
  totalDaysAlive: number;
  weekdayOfBirth: string;
  nextBirthday: Date;
  daysUntilNextBirthday: number;
  zodiacSign: string | null;
}

function getWeekday(date: Date, language: SupportedLanguage) {
  const locale =
    language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
}

function getZodiacSign(date: Date, language: SupportedLanguage) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const zodiacRanges = [
    {
      startMonth: 1,
      startDay: 20,
      sign: { pt: "Aquário", en: "Aquarius", es: "Acuario" },
    },
    {
      startMonth: 2,
      startDay: 19,
      sign: { pt: "Peixes", en: "Pisces", es: "Piscis" },
    },
    {
      startMonth: 3,
      startDay: 21,
      sign: { pt: "Áries", en: "Aries", es: "Aries" },
    },
    {
      startMonth: 4,
      startDay: 20,
      sign: { pt: "Touro", en: "Taurus", es: "Tauro" },
    },
    {
      startMonth: 5,
      startDay: 21,
      sign: { pt: "Gêmeos", en: "Gemini", es: "Géminis" },
    },
    {
      startMonth: 6,
      startDay: 21,
      sign: { pt: "Câncer", en: "Cancer", es: "Cáncer" },
    },
    {
      startMonth: 7,
      startDay: 23,
      sign: { pt: "Leão", en: "Leo", es: "Leo" },
    },
    {
      startMonth: 8,
      startDay: 23,
      sign: { pt: "Virgem", en: "Virgo", es: "Virgo" },
    },
    {
      startMonth: 9,
      startDay: 23,
      sign: { pt: "Libra", en: "Libra", es: "Libra" },
    },
    {
      startMonth: 10,
      startDay: 23,
      sign: { pt: "Escorpião", en: "Scorpio", es: "Escorpio" },
    },
    {
      startMonth: 11,
      startDay: 22,
      sign: { pt: "Sagitário", en: "Sagittarius", es: "Sagitario" },
    },
    {
      startMonth: 12,
      startDay: 22,
      sign: { pt: "Capricórnio", en: "Capricorn", es: "Capricornio" },
    },
  ] as const;

  let activeSign = { pt: "Capricórnio", en: "Capricorn", es: "Capricornio" };

  zodiacRanges.forEach(range => {
    const passedStart =
      month > range.startMonth ||
      (month === range.startMonth && day >= range.startDay);
    if (passedStart) {
      activeSign = range.sign;
    }
  });

  return activeSign[language] ?? activeSign.pt;
}

function getBirthdayForYear(birthDate: Date, year: number) {
  const candidate = buildDate(
    year,
    birthDate.getMonth() + 1,
    birthDate.getDate()
  );
  if (
    birthDate.getMonth() === 1 &&
    birthDate.getDate() === 29 &&
    candidate.getMonth() !== 1
  ) {
    return buildDate(year, 2, 28);
  }

  return candidate;
}

export function calculateAgeDetails(
  birthDate: Date,
  referenceDate: Date,
  language: SupportedLanguage,
  options: { includeZodiac?: boolean } = {}
) {
  const birth = new Date(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  const ref = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  let years = ref.getFullYear() - birth.getFullYear();
  let months = ref.getMonth() - birth.getMonth();
  let days = ref.getDate() - birth.getDate();

  if (days < 0) {
    const previousMonth = new Date(ref.getFullYear(), ref.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalDaysAlive = Math.max(0, getCalendarDayDifference(birth, ref));

  let nextBirthday = getBirthdayForYear(birth, ref.getFullYear());
  if (nextBirthday < ref) {
    nextBirthday = getBirthdayForYear(birth, ref.getFullYear() + 1);
  }

  const daysUntilNextBirthday = Math.max(
    0,
    getCalendarDayDifference(ref, nextBirthday)
  );

  return {
    years,
    months,
    days,
    totalDaysAlive,
    weekdayOfBirth: getWeekday(birth, language),
    nextBirthday,
    daysUntilNextBirthday,
    zodiacSign: options.includeZodiac ? getZodiacSign(birth, language) : null,
  } satisfies AgeDetails;
}
