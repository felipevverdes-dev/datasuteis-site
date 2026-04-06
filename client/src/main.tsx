import "./index.css";
import { createRoot, hydrateRoot } from "react-dom/client";
import { applyDocumentLanguage, readStoredLanguage } from "@/lib/site";
import App from "./App";

function isSameOriginServiceWorkerScope(scope: string) {
  try {
    return new URL(scope).origin === window.location.origin;
  } catch {
    return false;
  }
}

async function syncLegacyServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const hasSameOriginRegistration = registrations.some(registration =>
      isSameOriginServiceWorkerScope(registration.scope)
    );

    if (!hasSameOriginRegistration) {
      return;
    }

    await navigator.serviceWorker.register("/service-worker.js", {
      scope: "/",
    });
  } catch {
    // Keep the application running even if the browser rejects SW updates.
  }
}

const initialLanguage = readStoredLanguage();

applyDocumentLanguage(initialLanguage);

window.addEventListener(
  "load",
  () => {
    void syncLegacyServiceWorker();
  },
  { once: true }
);

const rootElement = document.getElementById("root");

if (rootElement) {
  if (rootElement.hasChildNodes() && initialLanguage === "pt") {
    hydrateRoot(rootElement, <App />);
  } else {
    rootElement.replaceChildren();
    createRoot(rootElement).render(<App />);
  }
}
