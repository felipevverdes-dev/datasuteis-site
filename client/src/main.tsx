import { createRoot, hydrateRoot } from "react-dom/client";
import { applyDocumentLanguage, readStoredLanguage } from "@/lib/site";
import App from "./App";
import "./index.css";

const initialLanguage = readStoredLanguage();

applyDocumentLanguage(initialLanguage);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/service-worker.js");
  });
}

const rootElement = document.getElementById("root");

if (rootElement) {
  if (rootElement.hasChildNodes() && initialLanguage === "pt") {
    hydrateRoot(rootElement, <App />);
  } else {
    createRoot(rootElement).render(<App />);
  }
}
