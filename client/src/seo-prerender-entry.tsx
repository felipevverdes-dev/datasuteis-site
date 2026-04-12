import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Age from "@/pages/Age";
import Calculator from "@/pages/Calculator";
import Calendar from "@/pages/Calendar";
import Home from "@/pages/Home";
import MyIp from "@/pages/MyIp";
import Schedule from "@/pages/Schedule";
import ThrottlingTest from "@/pages/ThrottlingTest";
import WorldClock from "@/pages/WorldClock";
import WorldClockMarkets from "@/pages/WorldClockMarkets";

function normalizePath(pathname: string) {
  if (pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function getPage(pathname: string) {
  const normalizedPath = normalizePath(pathname);

  switch (normalizedPath) {
    case "/":
      return <Home />;
    case "/calcular/":
      return <Calculator />;
    case "/idade/":
      return <Age />;
    case "/calendario/":
      return <Calendar />;
    case "/escala/":
      return <Schedule />;
    case "/utilitarios/qual-e-meu-ip/":
      return <MyIp />;
    case "/utilitarios/teste-de-throttling/":
      return <ThrottlingTest />;
    case "/utilitarios/horario-mundial/":
      return <WorldClock />;
    case "/utilitarios/horario-mercados/":
      return <WorldClockMarkets />;
    default:
      return null;
  }
}

export function renderPrerenderRoute(pathname: string) {
  const page = getPage(pathname);

  if (!page) {
    return "";
  }

  return renderToStaticMarkup(
    <Router ssrPath={normalizePath(pathname)}>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          {page}
          <CookieConsentBanner />
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}
