import { getNavigationLabels } from "@/lib/navigation";
import type { SupportedLanguage } from "@/lib/site";

export function getGamesNavLabel(language: SupportedLanguage) {
  return getNavigationLabels(language).games;
}

export function getAboutNavLabel(language: SupportedLanguage) {
  return getNavigationLabels(language).about;
}

export function getUtilitiesNavLabel(language: SupportedLanguage) {
  return getNavigationLabels(language).utilities;
}

export function getAgeNavLabel(language: SupportedLanguage) {
  return getNavigationLabels(language).ageCalculator;
}
