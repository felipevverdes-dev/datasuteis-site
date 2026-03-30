import { cn } from "@/lib/utils";
import { LanguageContext } from "@/contexts/LanguageContext";
import { readStoredLanguage } from "@/lib/site";
import { translate } from "@/lib/i18n";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const showStackTrace = import.meta.env.DEV;
      return (
        <LanguageContext.Consumer>
          {(context) => {
            const language = context?.language ?? readStoredLanguage();
            const title = context?.t?.("components.errorBoundary.title") ?? translate(language, "components.errorBoundary.title");
            const reload = context?.t?.("components.errorBoundary.reload") ?? translate(language, "components.errorBoundary.reload");

            return (
              <div className="flex min-h-screen items-center justify-center bg-background p-8">
                <div className="flex w-full max-w-2xl flex-col items-center p-8">
                  <AlertTriangle
                    size={48}
                    className="mb-6 flex-shrink-0 text-destructive"
                  />

                  <h2 className="mb-4 text-xl">{title}</h2>

                  {showStackTrace ? (
                    <div className="mb-6 w-full overflow-auto rounded bg-muted p-4">
                      <pre className="whitespace-break-spaces text-sm text-muted-foreground">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                  ) : null}

                  <button
                    onClick={() => window.location.reload()}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2",
                      "bg-primary text-primary-foreground",
                      "hover:opacity-90",
                    )}
                  >
                    <RotateCcw size={16} />
                    {reload}
                  </button>
                </div>
              </div>
            );
          }}
        </LanguageContext.Consumer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
