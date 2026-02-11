import type { Metadata } from "next";

export const siteConfig = {
  name: "HIPAA Policy Library",
  description: "Production-ready HIPAA compliance policies for Covered Entities and Business Associates. 100% Security Rule coverage.",
  url: "https://hipaa-policy-library.oneGuyconsulting.com",
  ogImage: "https://hipaa-policy-library.oneGuyconsulting.com/og-image.png",
  links: {
    twitter: "https://twitter.com/oneGuyconsulting",
    linkedin: "https://linkedin.com/company/one-guy-consulting",
  },
};

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = "/"
): Metadata {
  const fullUrl = `${siteConfig.url}${path}`;

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    keywords: ["HIPAA", "compliance", "policies", "healthcare", "security"],
    authors: [{ name: "One Guy Consulting" }],
    creator: "One Guy Consulting",
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      type: "website",
      url: fullUrl,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      creator: "@oneGuyconsulting",
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

export const policyPageMetadata: Record<string, { title: string; description: string }> = {
  "covered-entities": {
    title: "Covered Entity Policies",
    description: "39 production-ready HIPAA policies for Covered Entities including Privacy Rule and Security Rule compliance.",
  },
  "business-associates": {
    title: "Business Associate Policies",
    description: "23 production-ready HIPAA policies for Business Associates including Security Rule and Breach Notification compliance.",
  },
  "privacy-rule": {
    title: "Privacy Rule Policies",
    description: "Comprehensive Privacy Rule policies covering administrative requirements, individual rights, and uses/disclosures of PHI.",
  },
  "security-rule": {
    title: "Security Rule Policies",
    description: "Complete Security Rule policies covering administrative, physical, and technical safeguards.",
  },
  "breach-notification": {
    title: "Breach Notification Policies",
    description: "Breach Notification Rule policies for responding to security incidents and notifying individuals.",
  },
};
