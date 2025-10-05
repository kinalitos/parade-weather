import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/lib/constants";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
    featureList: [
      "NASA satellite imagery",
      "Climate probability analysis",
      "Interactive weather maps",
      "Precipitation heatmaps",
      "Point and regional forecasts",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
