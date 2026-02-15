import { BlogPost } from '@/lib/blog';

interface BlogJsonLdProps {
  post: BlogPost;
  url: string;
}

export default function BlogJsonLd({ post, url }: BlogJsonLdProps) {
  // Use environment variable or default to production URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hipaa-policy.netlify.app';
  const absoluteUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Healthcare Compliance Solutions',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    keywords: post.keywords?.join(', '),
    url: absoluteUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl,
    },
  };

  const safeJson = JSON.stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
