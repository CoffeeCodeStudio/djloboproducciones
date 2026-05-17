import { Helmet } from "react-helmet-async";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { LANGS, DEFAULT_LANG, localizedHref } from "@/lib/i18nRoutes";

const SITE_URL = "https://djloboproducciones.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/SocialMediaOg.png`;

// Open Graph locale codes (BCP 47 with underscore).
const OG_LOCALE: Record<Language, string> = {
  sv: "sv_SE",
  en: "en_US",
  es: "es_ES",
};
// hreflang values (BCP 47 with hyphen).
const HREFLANG: Record<Language, string> = {
  sv: "sv-SE",
  en: "en-US",
  es: "es-ES",
};

interface SeoProps {
  /** Unprefixed canonical path for this page, e.g. "/", "/lyssna". */
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article";
}

/**
 * Per-route SEO tags. Emits canonical + hreflang alternates for each language
 * variant (URL-prefixed: /sv/..., /en/..., /es/...) and sets Open Graph /
 * Twitter equivalents for the current page.
 */
const Seo = ({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: SeoProps) => {
  const { language } = useLanguage();
  const canonical = `${SITE_URL}${localizedHref(path, language)}`;
  const activeLocale = OG_LOCALE[language];
  const alternates = LANGS.map((l) => ({
    lang: l,
    href: `${SITE_URL}${localizedHref(path, l)}`,
  }));
  const xDefault = `${SITE_URL}${localizedHref(path, DEFAULT_LANG)}`;

  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {alternates.map((a) => (
        <link
          key={a.lang}
          rel="alternate"
          hrefLang={HREFLANG[a.lang]}
          href={a.href}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={xDefault} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={activeLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default Seo;
