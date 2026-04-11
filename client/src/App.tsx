import { lazy, Suspense } from "react";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import RouteBehavior from "@/components/RouteBehavior";
import SkipNavigation from "@/components/layout/SkipNavigation";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { GeolocationProvider } from "./contexts/GeolocationContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
const Calculator = lazy(() => import("./pages/Calculator"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Age = lazy(() => import("./pages/Age"));
const AgeCalculate = lazy(() => import("./pages/AgeCalculate"));
const AgeBirthDate = lazy(() => import("./pages/AgeBirthDate"));
const AgeBirthWeekday = lazy(() => import("./pages/AgeBirthWeekday"));
const AgeLifeDays = lazy(() => import("./pages/AgeLifeDays"));
const BusinessDaysArchive = lazy(() => import("./pages/BusinessDaysArchive"));
const FifthBusinessDay = lazy(() => import("./pages/FifthBusinessDay"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Games = lazy(() => import("./pages/Games"));
const Utilities = lazy(() => import("./pages/Utilities"));
const RandomPicker = lazy(() => import("./pages/RandomPicker"));
const CurrencyConverter = lazy(() => import("./pages/CurrencyConverter"));
const Weather = lazy(() => import("./pages/Weather"));
const WorldClock = lazy(() => import("./pages/WorldClock"));
const WorldClockMarkets = lazy(() => import("./pages/WorldClockMarkets"));
const WordSearch = lazy(() => import("./pages/WordSearch"));
const Crossword = lazy(() => import("./pages/Crossword"));
const Sudoku = lazy(() => import("./pages/Sudoku"));
const TicTacToe = lazy(() => import("./pages/TicTacToe"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const CalculatorApp = lazy(() => import("./pages/CalculatorApp"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RealNotFound() {
  return <NotFound seoPath="/404/" />;
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto h-11 w-36 animate-pulse rounded-full bg-secondary" />
        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="h-10 w-2/3 animate-pulse rounded-full bg-secondary" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-secondary" />
          <div className="mt-3 h-4 w-5/6 animate-pulse rounded-full bg-secondary" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded-3xl bg-secondary" />
            <div className="h-28 animate-pulse rounded-3xl bg-secondary" />
            <div className="h-28 animate-pulse rounded-3xl bg-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/calcular/"} component={Calculator} />
        <Route path={"/calcular"} component={Calculator} />
        <Route
          path={"/dias-uteis/:year/:month/"}
          component={BusinessDaysArchive}
        />
        <Route
          path={"/dias-uteis/:year/:month"}
          component={BusinessDaysArchive}
        />
        <Route path={"/dias-uteis/:year/"} component={BusinessDaysArchive} />
        <Route path={"/dias-uteis/:year"} component={BusinessDaysArchive} />
        <Route path={"/dias-uteis/"} component={BusinessDaysArchive} />
        <Route path={"/dias-uteis"} component={BusinessDaysArchive} />
        <Route path={"/calendario/:year/:month/"} component={Calendar} />
        <Route path={"/calendario/:year/:month"} component={Calendar} />
        <Route path={"/calendario/:year/"} component={Calendar} />
        <Route path={"/calendario/:year"} component={Calendar} />
        <Route path={"/calendario/"} component={Calendar} />
        <Route path={"/calendario"} component={Calendar} />
        <Route path={"/escala/"} component={Schedule} />
        <Route path={"/escala"} component={Schedule} />
        <Route
          path={"/quinto-dia-util/:year/:month/"}
          component={FifthBusinessDay}
        />
        <Route
          path={"/quinto-dia-util/:year/:month"}
          component={FifthBusinessDay}
        />
        <Route path={"/quinto-dia-util/:year/"} component={FifthBusinessDay} />
        <Route path={"/quinto-dia-util/:year"} component={FifthBusinessDay} />
        <Route path={"/quinto-dia-util/"} component={FifthBusinessDay} />
        <Route path={"/quinto-dia-util"} component={FifthBusinessDay} />
        <Route path={"/idade/calcular-idade/"} component={AgeCalculate} />
        <Route path={"/idade/calcular-idade"} component={AgeCalculate} />
        <Route path={"/idade/data-de-nascimento/"} component={AgeBirthDate} />
        <Route path={"/idade/data-de-nascimento"} component={AgeBirthDate} />
        <Route
          path={"/idade/dia-da-semana-que-nasceu/"}
          component={AgeBirthWeekday}
        />
        <Route
          path={"/idade/dia-da-semana-que-nasceu"}
          component={AgeBirthWeekday}
        />
        <Route
          path={"/idade/quantos-dias-eu-tenho-de-vida/"}
          component={AgeLifeDays}
        />
        <Route
          path={"/idade/quantos-dias-eu-tenho-de-vida"}
          component={AgeLifeDays}
        />
        <Route path={"/idade/"} component={Age} />
        <Route path={"/idade"} component={Age} />
        <Route path={"/utilitarios/"} component={Utilities} />
        <Route path={"/utilitarios"} component={Utilities} />
        <Route path={"/utilitarios/calculadora/"} component={CalculatorApp} />
        <Route path={"/utilitarios/calculadora"} component={CalculatorApp} />
        <Route path={"/utilitarios/sorteador/"} component={RandomPicker} />
        <Route path={"/utilitarios/sorteador"} component={RandomPicker} />
        <Route
          path={"/utilitarios/conversor-de-moeda/"}
          component={CurrencyConverter}
        />
        <Route
          path={"/utilitarios/conversor-de-moeda"}
          component={CurrencyConverter}
        />
        <Route path={"/utilitarios/clima/"} component={Weather} />
        <Route path={"/utilitarios/clima"} component={Weather} />
        <Route path={"/utilitarios/horario-mundial/"} component={WorldClock} />
        <Route path={"/utilitarios/horario-mundial"} component={WorldClock} />
        <Route
          path={"/utilitarios/horario-mercados/"}
          component={WorldClockMarkets}
        />
        <Route
          path={"/utilitarios/horario-mercados"}
          component={WorldClockMarkets}
        />
        <Route path={"/jogos/caca-palavras/"} component={WordSearch} />
        <Route path={"/jogos/caca-palavras"} component={WordSearch} />
        <Route path={"/jogos/palavras-cruzadas/"} component={Crossword} />
        <Route path={"/jogos/palavras-cruzadas"} component={Crossword} />
        <Route path={"/jogos/sudoku/"} component={Sudoku} />
        <Route path={"/jogos/sudoku"} component={Sudoku} />
        <Route path={"/jogos/jogo-da-velha/"} component={TicTacToe} />
        <Route path={"/jogos/jogo-da-velha"} component={TicTacToe} />
        <Route path={"/jogos/"} component={Games} />
        <Route path={"/jogos"} component={Games} />
        <Route path={"/sobre/"} component={About} />
        <Route path={"/sobre"} component={About} />
        <Route path={"/contato/"} component={Contact} />
        <Route path={"/contato"} component={Contact} />
        <Route path={"/blog/:slug/"} component={BlogPost} />
        <Route path={"/blog/:slug"} component={BlogPost} />
        <Route path={"/blog/"} component={Blog} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/privacidade/"} component={Privacy} />
        <Route path={"/privacidade"} component={Privacy} />
        <Route path={"/termos/"} component={Terms} />
        <Route path={"/termos"} component={Terms} />
        <Route path={"/calculadora/"} component={CalculatorApp} />
        <Route path={"/calculadora"} component={CalculatorApp} />
        <Route path={"/404/"} component={RealNotFound} />
        <Route path={"/404"} component={RealNotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <LanguageProvider>
          <GeolocationProvider>
            <TooltipProvider>
              <Toaster />
              <RouteBehavior />
              <SkipNavigation />
              <Router />
              <CookieConsentBanner />
            </TooltipProvider>
          </GeolocationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
