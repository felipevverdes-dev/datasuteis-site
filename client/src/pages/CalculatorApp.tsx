import { useState, type ReactNode } from "react";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";

type CalculatorMode = "simple" | "financial" | "developer" | "scientific";

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

export default function CalculatorApp() {
  const [mode, setMode] = useState<CalculatorMode>("simple");
  const { language, t, tm } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities, href: "/utilitarios/" },
    { label: t("pages.calculatorApp.heroTitle") },
  ];
  const modes = tm<Array<{ id: CalculatorMode; label: string }>>(
    "pages.calculatorApp.modes"
  );
  const modeCards = tm<
    Array<{ id: CalculatorMode; label: string; description: string }>
  >("pages.calculatorApp.modeCards");
  const [calc, setCalc] = useState<CalculatorState>({
    display: "0",
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });

  const faqItems =
    language === "en"
      ? [
          {
            question: "Does the calculator work on mobile?",
            answer:
              "Yes. The keypad and mode selector are organized for touch and smaller screens.",
          },
          {
            question: "Which modes are available?",
            answer:
              "Simple, financial, developer and scientific modes are available on the same page.",
          },
          {
            question: "Do I need to install anything?",
            answer: "No. The calculator runs directly in the browser.",
          },
        ]
      : language === "es"
        ? [
            {
              question: "¿La calculadora funciona en el celular?",
              answer:
                "Sí. El teclado y el selector de modo están organizados para toque y pantallas menores.",
            },
            {
              question: "¿Qué modos están disponibles?",
              answer:
                "La página reúne modo simple, financiero, desarrollador y científico.",
            },
            {
              question: "¿Necesito instalar algo?",
              answer:
                "No. La calculadora funciona directamente en el navegador.",
            },
          ]
        : [
            {
              question: "A calculadora funciona no celular?",
              answer:
                "Sim. O teclado e o seletor de modo foram organizados para toque e telas menores.",
            },
            {
              question: "Quais modos estão disponíveis?",
              answer:
                "A página reúne modo simples, financeiro, desenvolvedor e científico.",
            },
            {
              question: "Preciso instalar algo?",
              answer: "Não. A calculadora roda diretamente no navegador.",
            },
          ];

  const exampleItems =
    language === "en"
      ? [
          "Use the simple mode for quick arithmetic and percentage checks during daily work.",
          "Use the financial shortcuts for percentage and bill split support.",
          "Use the developer mode for base conversion and bitwise checks without switching tools.",
        ]
      : language === "es"
        ? [
            "Use el modo simple para cuentas rápidas y conferencias de porcentaje durante la rutina.",
            "Use los atajos financieros para porcentaje y división rápida de valores.",
            "Use el modo desarrollador para conversión entre bases y comprobaciones bitwise.",
          ]
        : [
            "Use o modo simples para contas rápidas e conferência de porcentagem na rotina.",
            "Use os atalhos financeiros para porcentagem e divisão rápida de valores.",
            "Use o modo desenvolvedor para conversão entre bases e verificações bitwise sem trocar de ferramenta.",
          ];

  usePageSeo({
    title: t("pages.calculatorApp.seoTitle"),
    description: t("pages.calculatorApp.seoDescription"),
    path: "/utilitarios/calculadora/",
    keywords: [
      "calculadora online",
      "calculadora científica",
      "calculadora financeira",
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Calculadora Online",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: "https://datasuteis.com.br/utilitarios/calculadora/",
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
        {
          label: t("pages.calculatorApp.heroTitle"),
          href: "/utilitarios/calculadora/",
        },
      ]),
    ],
  });

  const handleNumber = (num: string) => {
    const newDisplay =
      calc.waitingForOperand || calc.display === "0" ? num : calc.display + num;
    setCalc({ ...calc, display: newDisplay, waitingForOperand: false });
  };

  const handleDecimal = () => {
    if (calc.waitingForOperand) {
      setCalc({ ...calc, display: "0.", waitingForOperand: false });
    } else if (calc.display.indexOf(".") === -1) {
      setCalc({ ...calc, display: calc.display + "." });
    }
  };

  const handleOperation = (op: string) => {
    const inputValue = parseFloat(calc.display);

    if (calc.previousValue === null) {
      setCalc({
        ...calc,
        previousValue: inputValue,
        operation: op,
        waitingForOperand: true,
      });
    } else if (calc.operation) {
      const result = performCalculation(
        calc.previousValue,
        inputValue,
        calc.operation
      );
      setCalc({
        ...calc,
        display: String(result),
        previousValue: result,
        operation: op,
        waitingForOperand: true,
      });
    }
  };

  const performCalculation = (
    prev: number,
    current: number,
    operation: string
  ): number => {
    switch (operation) {
      case "+":
        return prev + current;
      case "-":
        return prev - current;
      case "*":
        return prev * current;
      case "/":
        return prev / current;
      case "%":
        return prev % current;
      case "pow":
        return Math.pow(prev, current);
      case "and":
        return prev & current;
      case "or":
        return prev | current;
      case "xor":
        return prev ^ current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(calc.display);

    if (calc.previousValue !== null && calc.operation) {
      const result = performCalculation(
        calc.previousValue,
        inputValue,
        calc.operation
      );
      setCalc({
        display: String(result),
        previousValue: null,
        operation: null,
        waitingForOperand: true,
      });
    }
  };

  const handleClear = () => {
    setCalc({
      display: "0",
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    });
  };

  const handleBackspace = () => {
    const newDisplay =
      calc.display.length === 1 ? "0" : calc.display.slice(0, -1);
    setCalc({ ...calc, display: newDisplay });
  };

  const handleScientific = (func: string) => {
    const value = parseFloat(calc.display);
    let result = 0;

    switch (func) {
      case "sin":
        result = Math.sin((value * Math.PI) / 180);
        break;
      case "cos":
        result = Math.cos((value * Math.PI) / 180);
        break;
      case "tan":
        result = Math.tan((value * Math.PI) / 180);
        break;
      case "sqrt":
        result = Math.sqrt(value);
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "pi":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      case "1/x":
        result = 1 / value;
        break;
      case "x!":
        result = factorial(value);
        break;
      default:
        result = value;
    }

    setCalc({
      ...calc,
      display: String(result),
      waitingForOperand: true,
    });
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i += 1) {
      result *= i;
    }
    return result;
  };

  const handleDeveloper = (func: string) => {
    const value = parseInt(calc.display);
    let result = 0;

    switch (func) {
      case "hex":
        setCalc({
          ...calc,
          display: `0x${value.toString(16).toUpperCase()}`,
          waitingForOperand: true,
        });
        return;
      case "bin":
        setCalc({
          ...calc,
          display: `0b${value.toString(2)}`,
          waitingForOperand: true,
        });
        return;
      case "oct":
        setCalc({
          ...calc,
          display: `0o${value.toString(8)}`,
          waitingForOperand: true,
        });
        return;
      case "not":
        result = ~value;
        break;
      case "and":
        handleOperation("and");
        return;
      case "or":
        handleOperation("or");
        return;
      case "xor":
        handleOperation("xor");
        return;
      default:
        result = value;
    }

    setCalc({
      ...calc,
      display: String(result),
      waitingForOperand: true,
    });
  };

  const handleFinancial = (func: string) => {
    const value = parseFloat(calc.display);
    let result = 0;

    switch (func) {
      case "%":
        result = value / 100;
        break;
      case "tip15":
        result = value * 0.15;
        break;
      case "tip20":
        result = value * 0.2;
        break;
      default:
        result = value;
    }

    setCalc({
      ...calc,
      display: String(result),
      waitingForOperand: true,
    });
  };

  const Button = ({
    onClick,
    className = "",
    children,
  }: {
    onClick: () => void;
    className?: string;
    children: ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded p-3 font-semibold transition-[transform,opacity] hover:opacity-80 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <PageShell
      eyebrow={
        language === "en"
          ? "Utilities"
          : language === "es"
            ? "Utilidades"
            : "Utilitários"
      }
      title={t("pages.calculatorApp.heroTitle")}
      description={t("pages.calculatorApp.heroSubtitle")}
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
    >
      <div id="ferramenta" className="section-anchor">
        <div className="section-card">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap justify-center gap-2">
              {modes.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id as CalculatorMode);
                    handleClear();
                  }}
                  className={mode === item.id ? "btn-primary" : "btn-secondary"}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mx-auto mt-6 max-w-md">
              <div className="card-base mb-4 border-slate-700 bg-slate-900 p-4 dark:bg-slate-950">
                <div className="text-right">
                  <div className="h-6 text-sm text-slate-400">
                    {calc.operation && calc.previousValue !== null
                      ? `${calc.previousValue} ${calc.operation}`
                      : ""}
                  </div>
                  <div className="break-words font-mono text-4xl font-bold text-green-400">
                    {calc.display}
                  </div>
                </div>
              </div>

              {mode === "simple" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={handleClear}
                      className="col-span-2 bg-red-500 text-white"
                    >
                      C
                    </Button>
                    <Button
                      onClick={handleBackspace}
                      className="bg-orange-500 text-white"
                    >
                      ←
                    </Button>
                    <Button
                      onClick={() => handleOperation("/")}
                      className="bg-blue-500 text-white"
                    >
                      ÷
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["7", "8", "9"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("*")}
                      className="bg-blue-500 text-white"
                    >
                      ×
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["4", "5", "6"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("-")}
                      className="bg-blue-500 text-white"
                    >
                      −
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["1", "2", "3"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("+")}
                      className="bg-blue-500 text-white"
                    >
                      +
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={() => handleNumber("0")}
                      className="col-span-2 bg-slate-200 text-foreground dark:bg-slate-700"
                    >
                      0
                    </Button>
                    <Button
                      onClick={handleDecimal}
                      className="bg-slate-200 text-foreground dark:bg-slate-700"
                    >
                      .
                    </Button>
                    <Button
                      onClick={handleEquals}
                      className="bg-green-500 text-white"
                    >
                      =
                    </Button>
                  </div>
                </div>
              )}

              {mode === "financial" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={handleClear}
                      className="col-span-2 bg-red-500 text-white"
                    >
                      C
                    </Button>
                    <Button
                      onClick={handleBackspace}
                      className="bg-orange-500 text-white"
                    >
                      ←
                    </Button>
                    <Button
                      onClick={() => handleOperation("/")}
                      className="bg-blue-500 text-white"
                    >
                      ÷
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["7", "8", "9"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("*")}
                      className="bg-blue-500 text-white"
                    >
                      ×
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["4", "5", "6"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("-")}
                      className="bg-blue-500 text-white"
                    >
                      −
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["1", "2", "3"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("+")}
                      className="bg-blue-500 text-white"
                    >
                      +
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={() => handleNumber("0")}
                      className="col-span-2 bg-slate-200 text-foreground dark:bg-slate-700"
                    >
                      0
                    </Button>
                    <Button
                      onClick={handleDecimal}
                      className="bg-slate-200 text-foreground dark:bg-slate-700"
                    >
                      .
                    </Button>
                    <Button
                      onClick={handleEquals}
                      className="bg-green-500 text-white"
                    >
                      =
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                    <Button
                      onClick={() => handleFinancial("%")}
                      className="bg-purple-500 text-white"
                    >
                      %
                    </Button>
                    <Button
                      onClick={() => handleFinancial("tip15")}
                      className="bg-purple-500 text-sm text-white"
                    >
                      {t("pages.calculatorApp.tip15")}
                    </Button>
                    <Button
                      onClick={() => handleFinancial("tip20")}
                      className="bg-purple-500 text-sm text-white"
                    >
                      {t("pages.calculatorApp.tip20")}
                    </Button>
                  </div>
                </div>
              )}

              {mode === "developer" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={handleClear}
                      className="col-span-2 bg-red-500 text-white"
                    >
                      C
                    </Button>
                    <Button
                      onClick={handleBackspace}
                      className="bg-orange-500 text-white"
                    >
                      ←
                    </Button>
                    <Button
                      onClick={() => handleOperation("/")}
                      className="bg-blue-500 text-white"
                    >
                      ÷
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["7", "8", "9"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("*")}
                      className="bg-blue-500 text-white"
                    >
                      ×
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["4", "5", "6"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("-")}
                      className="bg-blue-500 text-white"
                    >
                      −
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["1", "2", "3"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("+")}
                      className="bg-blue-500 text-white"
                    >
                      +
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={() => handleNumber("0")}
                      className="col-span-2 bg-slate-200 text-foreground dark:bg-slate-700"
                    >
                      0
                    </Button>
                    <Button
                      onClick={handleDecimal}
                      className="bg-slate-200 text-foreground dark:bg-slate-700"
                    >
                      .
                    </Button>
                    <Button
                      onClick={handleEquals}
                      className="bg-green-500 text-white"
                    >
                      =
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                    <Button
                      onClick={() => handleDeveloper("hex")}
                      className="bg-indigo-500 text-sm text-white"
                    >
                      HEX
                    </Button>
                    <Button
                      onClick={() => handleDeveloper("bin")}
                      className="bg-indigo-500 text-sm text-white"
                    >
                      BIN
                    </Button>
                    <Button
                      onClick={() => handleDeveloper("oct")}
                      className="bg-indigo-500 text-sm text-white"
                    >
                      OCT
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={() => handleDeveloper("not")}
                      className="bg-indigo-500 text-sm text-white"
                    >
                      NOT
                    </Button>
                    <Button
                      onClick={() => handleDeveloper("and")}
                      className="bg-indigo-500 text-sm text-white"
                    >
                      AND
                    </Button>
                    <Button
                      onClick={() => handleDeveloper("or")}
                      className="bg-indigo-500 text-sm text-white"
                    >
                      OR
                    </Button>
                    <Button
                      onClick={() => handleDeveloper("xor")}
                      className="bg-indigo-500 text-sm text-white"
                    >
                      XOR
                    </Button>
                  </div>
                </div>
              )}

              {mode === "scientific" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={handleClear}
                      className="col-span-2 bg-red-500 text-white"
                    >
                      C
                    </Button>
                    <Button
                      onClick={handleBackspace}
                      className="bg-orange-500 text-white"
                    >
                      ←
                    </Button>
                    <Button
                      onClick={() => handleOperation("/")}
                      className="bg-blue-500 text-white"
                    >
                      ÷
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["7", "8", "9"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("*")}
                      className="bg-blue-500 text-white"
                    >
                      ×
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["4", "5", "6"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("-")}
                      className="bg-blue-500 text-white"
                    >
                      −
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["1", "2", "3"].map(num => (
                      <Button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="bg-slate-200 text-foreground dark:bg-slate-700"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleOperation("+")}
                      className="bg-blue-500 text-white"
                    >
                      +
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={() => handleNumber("0")}
                      className="col-span-2 bg-slate-200 text-foreground dark:bg-slate-700"
                    >
                      0
                    </Button>
                    <Button
                      onClick={handleDecimal}
                      className="bg-slate-200 text-foreground dark:bg-slate-700"
                    >
                      .
                    </Button>
                    <Button
                      onClick={handleEquals}
                      className="bg-green-500 text-white"
                    >
                      =
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                    <Button
                      onClick={() => handleScientific("sin")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      sin
                    </Button>
                    <Button
                      onClick={() => handleScientific("cos")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      cos
                    </Button>
                    <Button
                      onClick={() => handleScientific("tan")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      tan
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleScientific("sqrt")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      √
                    </Button>
                    <Button
                      onClick={() => handleScientific("log")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      log
                    </Button>
                    <Button
                      onClick={() => handleScientific("ln")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      ln
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleOperation("pow")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      x^y
                    </Button>
                    <Button
                      onClick={() => handleScientific("1/x")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      1/x
                    </Button>
                    <Button
                      onClick={() => handleScientific("x!")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      x!
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleScientific("pi")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      π
                    </Button>
                    <Button
                      onClick={() => handleScientific("e")}
                      className="bg-cyan-500 text-sm text-white"
                    >
                      e
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">
            {t("pages.calculatorApp.modesTitle")}
          </h2>
          <div className="mt-5 page-grid">
            {modeCards.map(modeCard => (
              <article
                key={modeCard.id}
                className="rounded-2xl bg-secondary p-5"
              >
                <h3 className="text-lg font-semibold">{modeCard.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {modeCard.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">
            {language === "en"
              ? "Practical uses"
              : language === "es"
                ? "Usos prácticos"
                : "Usos práticos"}
          </h2>
          <div className="mt-5 page-grid">
            {exampleItems.map(item => (
              <article
                key={item}
                className="rounded-2xl bg-secondary p-5 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{t("faq_title")}</h2>
          <div className="mt-5 space-y-3">
            {faqItems.map(item => (
              <details
                key={item.question}
                className="rounded-2xl bg-secondary px-5 py-4"
              >
                <summary className="font-semibold">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
