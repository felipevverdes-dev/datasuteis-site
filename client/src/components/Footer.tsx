import { Link } from "wouter";
import Brand from "@/components/Brand";
import { useI18n } from "@/contexts/LanguageContext";
import {
  getAboutNavLabel,
  getAgeNavLabel,
  getGamesNavLabel,
  getUtilitiesNavLabel,
} from "@/lib/games-nav";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { language, t } = useI18n();
  const gamesNavLabel = getGamesNavLabel(language);
  const aboutNavLabel = getAboutNavLabel(language);
  const utilitiesNavLabel = getUtilitiesNavLabel(language);
  const ageNavLabel = getAgeNavLabel(language);
  const contactPageLabel =
    language === "en" ? "Contact page" : language === "es" ? "Página de contacto" : "Página de contato";
  const termsLabel =
    language === "en" ? "Terms of use" : language === "es" ? "Términos de uso" : "Termos de uso";
  const homeLabel = language === "en" ? "Home" : language === "es" ? "Inicio" : "Home";
  const privacyLabel =
    language === "en"
      ? "Privacy policy"
      : language === "es"
        ? "Política de privacidad"
        : "Política de Privacidade";
  const relatedLabel =
    language === "en"
      ? "Related pages"
      : language === "es"
        ? "Páginas relacionadas"
        : "Páginas relacionadas";
  const institutionalLabel =
    language === "en"
      ? "Institutional"
      : language === "es"
        ? "Institucional"
        : "Institucional";
  const fifthBusinessDayLabel =
    language === "en"
      ? "Fifth business day"
      : language === "es"
        ? "Quinto día hábil"
        : "5º dia útil";
  const suggestionsLabel =
    language === "en"
      ? "Send a suggestion"
      : language === "es"
        ? "Enviar una sugerencia"
        : "Enviar sugestão";
  const correctionsLabel =
    language === "en"
      ? "Report a correction"
      : language === "es"
        ? "Informar una corrección"
        : "Informar correção";

  return (
    <footer
      role="contentinfo"
      className="mt-20 border-t border-border bg-secondary/35"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4">
            <Brand href="/" logoClassName="h-10 w-[148px] sm:h-11 sm:w-[163px]" />
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {t("components.footer.description")}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("components.footer.tools")}
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <Link
                href="/"
                className="block transition-colors hover:text-primary"
              >
                {homeLabel}
              </Link>
              <Link
                href="/calcular/"
                className="block transition-colors hover:text-primary"
              >
                {t("components.footer.businessDays")}
              </Link>
              <Link
                href="/calendario/"
                className="block transition-colors hover:text-primary"
              >
                {t("components.footer.calendar")}
              </Link>
              <Link
                href="/escala/"
                className="block transition-colors hover:text-primary"
              >
                {t("components.footer.schedule")}
              </Link>
              <Link
                href="/idade/"
                className="block transition-colors hover:text-primary"
              >
                {ageNavLabel}
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {relatedLabel}
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <Link
                href="/quinto-dia-util/"
                className="block transition-colors hover:text-primary"
              >
                {fifthBusinessDayLabel}
              </Link>
              <Link
                href="/blog/"
                className="block transition-colors hover:text-primary"
              >
                {t("components.footer.blog")}
              </Link>
              <Link
                href="/blog/dias-uteis-o-que-sao/"
                className="block transition-colors hover:text-primary"
              >
                {t("components.footer.workingDays")}
              </Link>
              <Link
                href="/utilitarios/"
                className="block transition-colors hover:text-primary"
              >
                {utilitiesNavLabel}
              </Link>
              <Link
                href="/jogos/"
                className="block transition-colors hover:text-primary"
              >
                {gamesNavLabel}
              </Link>
              <Link
                href="/blog/escalas-de-trabalho-clt/"
                className="block transition-colors hover:text-primary"
              >
                {t("components.footer.cltScales")}
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {institutionalLabel}
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <Link
                href="/sobre/"
                className="block transition-colors hover:text-primary"
              >
                {aboutNavLabel}
              </Link>
              <Link
                href="/privacidade/"
                className="block transition-colors hover:text-primary"
              >
                {privacyLabel}
              </Link>
              <Link
                href="/termos/"
                className="block transition-colors hover:text-primary"
              >
                {termsLabel}
              </Link>
              <Link
                href="/contato/"
                className="block transition-colors hover:text-primary"
              >
                {contactPageLabel}
              </Link>
              <a
                href="mailto:contato@datasuteis.com.br"
                className="block transition-colors hover:text-primary"
              >
                contato@datasuteis.com.br
              </a>
              <a
                href="mailto:contato@datasuteis.com.br?subject=Sugestao%20-%20Datas%20Uteis"
                className="block transition-colors hover:text-primary"
              >
                {suggestionsLabel}
              </a>
              <a
                href="mailto:contato@datasuteis.com.br?subject=Correcao%20-%20Datas%20Uteis"
                className="block transition-colors hover:text-primary"
              >
                {correctionsLabel}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} Datas Úteis. {t("common.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
