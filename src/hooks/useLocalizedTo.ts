import { useLanguage } from "@/contexts/LanguageContext";
import { localizedHref } from "@/lib/i18nRoutes";

/**
 * Returns a `to(path)` helper that prefixes an in-app path with the active
 * language segment. Use for every internal <Link to=...>.
 *
 * Example:
 *   const lto = useLocalizedTo();
 *   <Link to={lto("/lyssna")} />  // → "/sv/lyssna" / "/en/lyssna" / …
 */
export const useLocalizedTo = () => {
  const { language } = useLanguage();
  return (path: string) => localizedHref(path, language);
};
