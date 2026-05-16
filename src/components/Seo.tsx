import { Helmet } from "react-helmet-async";

const SITE_URL = "https://djloboproducciones.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/SocialMediaOg.png`;

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
 */
const Seo = ({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default Seo;
