import { ArrowRight, Calculator } from "lucide-react";
import { Link } from "wouter";
import type { SupportedLanguage } from "@/lib/site";

interface CtaFinalBlockProps {
  language: SupportedLanguage;
  title?: string;
  buttonLabel?: string;
  href?: string;
}

const DEFAULT_COPY: Record<
  SupportedLanguage,
  { title: string; button: string }
> = {
  pt: {
    title: "Calcule agora seus dias úteis com precisão",
    button: "Usar calculadora",
  },
  en: {
    title: "Calculate your business days with precision now",
    button: "Use calculator",
  },
  es: {
    title: "Calcule ahora sus días hábiles con precisión",
    button: "Usar calculadora",
  },
};

export default function CtaFinalBlock({
  language,
  title,
  buttonLabel,
  href = "/calcular/",
}: CtaFinalBlockProps) {
  const copy = DEFAULT_COPY[language] ?? DEFAULT_COPY.pt;
  const finalTitle = title ?? copy.title;
  const finalButton = buttonLabel ?? copy.button;

  return (
    <section className="cta-final-section" id="cta-final">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
          {finalTitle}
        </h2>
        <div className="mt-8">
          <Link href={href} className="btn-cta-final">
            <Calculator className="h-5 w-5" />
            {finalButton}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
