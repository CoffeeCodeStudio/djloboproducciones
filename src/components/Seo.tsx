import { Helmet } from "react-helmet-async";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

const SITE_URL = "https://djloboproducciones.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/SocialMediaOg.png`;

// Open Graph locale codes (BCP 47 with underscore).
const OG_LOCALE: Record<Language, string> = {
  sv: "sv_SE",
  en: "en_US",
  es: "es_ES",
};

interface SeoProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article";
}

/**
 * Per-route SEO tags. Sets <title>, meta description, canonical and
 * Open Graph / Twitter equivalents for the current page. Overrides
 * the sitewide defaults baked into index.html.
 *
 * Multilingual note: the site serves all languages on the same URL
 * (client-side switch via localStorage), so true hreflang annotations
 * are not valid here — they require one URL per language. Instead we
 * emit og:locale + og:locale:alternate so social crawlers know which
 * languages this page is available in, and sync <html lang> to the
 * active language for screen-readers and JS-executing crawlers.
 */
const Seo = ({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: SeoProps) => {
  const { language } = useLanguage();
  const url = `${SITE_URL}${path}`;
  const activeLocale = OG_LOCALE[language];
  const alternateLocales = (Object.keys(OG_LOCALE) as Language[])
    .filter((l) => l !== language)
    .map((l) => OG_LOCALE[l]);

  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={activeLocale} />
      {alternateLocales.map((loc) => (
        <meta key={loc} property="og:locale:alternate" content={loc} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default Seo;
