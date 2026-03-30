import { BriefcaseBusiness, CalendarDays, Cake, Clock3 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/contexts/LanguageContext";

function normalizePath(path: string) {
  if (path === "/") {
    return "/";
  }

  return path.endsWith("/") ? path : `${path}/`;
}

function getToolGroup(path: string) {
  const normalizedPath = normalizePath(path);

  if (normalizedPath.startsWith("/calcular/")) {
    return "/calcular/";
  }

  if (normalizedPath.startsWith("/calendario/")) {
    return "/calendario/";
  }

  if (normalizedPath.startsWith("/escala/")) {
    return "/escala/";
  }

  if (normalizedPath.startsWith("/idade/")) {
    return "/idade/";
  }

  return normalizedPath;
}

const COPY = {
  pt: {
    title: "Ferramentas relacionadas",
    description:
      "Continue a navegação com ferramentas complementares para revisar prazos, calendário, escalas e idade sem sair do fluxo.",
    cta: "Abrir ferramenta",
  },
  en: {
    title: "Related tools",
    description:
      "Keep browsing with complementary tools to review deadlines, calendars, schedules and age checks in the same flow.",
    cta: "Open tool",
  },
  es: {
    title: "Herramientas relacionadas",
    description:
      "Siga navegando con herramientas complementarias para revisar plazos, calendario, escalas y edad en un mismo flujo.",
    cta: "Abrir herramienta",
  },
} as const;

export default function CoreNavigationBlock() {
  const { language, t } = useI18n();
  const [location] = useLocation();
  const copy = COPY[language] ?? COPY.pt;
  const currentPath = normalizePath(location);
  const currentGroup = getToolGroup(currentPath);

  const items = [
    {
      href: "/calcular/",
      title: t("nav_calc"),
      description:
        language === "en"
          ? "Calculate business days between dates."
          : language === "es"
            ? "Calcule días hábiles entre fechas."
            : "Calcule dias úteis entre datas.",
      icon: Clock3,
    },
    {
      href: "/calendario/",
      title: t("nav_calendar"),
      description:
        language === "en"
          ? "Review months, weekends and holidays."
          : language === "es"
            ? "Consulte meses, fines de semana y feriados."
            : "Consulte meses, finais de semana e feriados.",
      icon: CalendarDays,
    },
    {
      href: "/escala/",
      title: t("nav_scale"),
      description:
        language === "en"
          ? "Simulate work schedule and headcount scenarios."
          : language === "es"
            ? "Simule escenarios de escala y dotación."
            : "Simule cenários de escala e quadro mínimo.",
      icon: BriefcaseBusiness,
    },
    {
      href: "/idade/",
      title: language === "en" ? "Age" : language === "es" ? "Edad" : "Idade",
      description:
        language === "en"
          ? "Calculate exact age, days alive and birth weekday."
          : language === "es"
            ? "Calcule edad exacta, días de vida y día de nacimiento."
            : "Calcule idade exata, dias de vida e dia da semana de nascimento.",
      icon: Cake,
    },
  ].filter(item => getToolGroup(item.href) !== currentGroup);

  return (
    <section className="section-card">
      <h2 className="text-3xl font-bold">{copy.title}</h2>
      <p className="mt-3 max-w-3xl text-muted-foreground">{copy.description}</p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="card-base card-hover block rounded-2xl p-5"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <span className="mt-4 inline-flex font-semibold text-primary">
                {copy.cta}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
