import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPostingMeta {
  datePublished?: string;
  dateModified?: string;
  author?: string;
  category?: string;
  image?: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  toolName?: string;
  type?: 'website' | 'article' | 'SoftwareApplication' | 'CollectionPage' | 'BlogPosting';
  image?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  blogMeta?: BlogPostingMeta;
  featureList?: string;
  jsonLdSchema?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'SmartPDF AI - Enterprise PDF & Document Productivity Suite',
  description = 'Free online PDF tools to merge, split, compress, protect, unlock, OCR, convert, and AI-chat with PDF files. 100% private client-side processing.',
  path = '/',
  toolName,
  type,
  image = 'https://smartpdfai.tech/og-image.png',
  breadcrumbs,
  faqs,
  blogMeta,
  featureList,
  jsonLdSchema,
}) => {
  const fullTitle = toolName
    ? `${toolName} Online Free - SmartPDF AI`
    : title.includes('SmartPDF')
    ? title
    : `${title} | SmartPDF AI`;

  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const canonicalUrl = `https://smartpdfai.tech${cleanPath}`;

  // Auto-detect primary type
  const isTool = Boolean(
    toolName ||
      type === 'SoftwareApplication' ||
      (cleanPath !== '/' &&
        !cleanPath.startsWith('/blog') &&
        !cleanPath.startsWith('/legal') &&
        !cleanPath.startsWith('/privacy') &&
        !cleanPath.startsWith('/terms') &&
        !cleanPath.startsWith('/about') &&
        !cleanPath.startsWith('/contact'))
  );

  const primaryType = type || (isTool ? 'SoftwareApplication' : 'website');

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to set or create meta tags
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Description
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // 3. Open Graph Meta Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', primaryType === 'BlogPosting' ? 'article' : 'website');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'SmartPDF AI');
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);

    // 4. Twitter Card Meta Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@smartpdfai');

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. Build JSON-LD Schema Graph
    const graphNodes: Array<Record<string, unknown>> = [];

    // Node 1: Organization Schema
    graphNodes.push({
      '@type': 'Organization',
      '@id': 'https://smartpdfai.tech/#organization',
      name: 'SmartPDF AI',
      url: 'https://smartpdfai.tech/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://smartpdfai.tech/logo.png',
        caption: 'SmartPDF AI Logo',
      },
      sameAs: [
        'https://twitter.com/smartpdfai',
        'https://github.com/smartpdfai',
      ],
      description: 'SmartPDF AI provides client-side WebAssembly PDF utilities, document editing tools, and AI document chat.',
    });

    // Node 2: WebSite Schema with SearchAction Schema
    graphNodes.push({
      '@type': 'WebSite',
      '@id': 'https://smartpdfai.tech/#website',
      url: 'https://smartpdfai.tech/',
      name: 'SmartPDF AI',
      description: 'Enterprise PDF & Document Productivity Suite',
      publisher: {
        '@id': 'https://smartpdfai.tech/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://smartpdfai.tech/?s={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    });

    // Node 3: Breadcrumb Schema (BreadcrumbList)
    const activeBreadcrumbs: BreadcrumbItem[] = breadcrumbs || (() => {
      const items: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
      if (cleanPath !== '/') {
        if (cleanPath.startsWith('/blog/')) {
          items.push({ name: 'Blog', path: '/blog' });
          items.push({ name: toolName || title.split('-')[0].trim(), path: cleanPath });
        } else if (cleanPath === '/blog') {
          items.push({ name: 'Blog', path: '/blog' });
        } else {
          const name = toolName || title.split('-')[0].trim() || 'Tool';
          items.push({ name, path: cleanPath });
        }
      }
      return items;
    })();

    if (activeBreadcrumbs.length > 0) {
      graphNodes.push({
        '@type': 'BreadcrumbList',
        '@id': `https://smartpdfai.tech${cleanPath}#breadcrumb`,
        itemListElement: activeBreadcrumbs.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: `https://smartpdfai.tech${item.path.startsWith('/') ? item.path : '/' + item.path}`,
        })),
      });
    }

    // Node 4: Primary Entity Schema
    if (primaryType === 'SoftwareApplication') {
      graphNodes.push({
        '@type': 'SoftwareApplication',
        '@id': `https://smartpdfai.tech${cleanPath}#software`,
        name: fullTitle,
        description: description,
        url: canonicalUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All (Windows, macOS, Linux, iOS, Android)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        browserRequirements: 'Requires JavaScript. Requires HTML5 web browser.',
        softwareVersion: '2.0.0',
        featureList: featureList || 'Client-side processing, WebAssembly acceleration, 100% privacy, zero server uploads',
        publisher: {
          '@id': 'https://smartpdfai.tech/#organization',
        },
      });
    } else if (primaryType === 'CollectionPage') {
      graphNodes.push({
        '@type': 'CollectionPage',
        '@id': `https://smartpdfai.tech${cleanPath}#collection`,
        name: fullTitle,
        description: description,
        url: canonicalUrl,
        publisher: {
          '@id': 'https://smartpdfai.tech/#organization',
        },
      });
    } else if (primaryType === 'BlogPosting') {
      graphNodes.push({
        '@type': 'BlogPosting',
        '@id': `https://smartpdfai.tech${cleanPath}#article`,
        headline: title,
        description: description,
        url: canonicalUrl,
        datePublished: blogMeta?.datePublished || '2026-08-01',
        dateModified: blogMeta?.dateModified || '2026-08-03',
        author: {
          '@type': 'Person',
          name: blogMeta?.author || 'SmartPDF AI Editorial Team',
        },
        publisher: {
          '@id': 'https://smartpdfai.tech/#organization',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        image: image,
      });
    }

    // Node 5: FAQ Schema (FAQPage)
    if (faqs && faqs.length > 0) {
      graphNodes.push({
        '@type': 'FAQPage',
        '@id': `https://smartpdfai.tech${cleanPath}#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    // Node 6: Custom JSON-LD Schema override/extension if provided
    if (jsonLdSchema) {
      if (Array.isArray(jsonLdSchema)) {
        // If passed as an array or object containing @graph
        jsonLdSchema.forEach((item) => {
          if (item['@graph'] && Array.isArray(item['@graph'])) {
            graphNodes.push(...(item['@graph'] as Array<Record<string, unknown>>));
          } else {
            graphNodes.push(item);
          }
        });
      } else if (jsonLdSchema['@graph'] && Array.isArray(jsonLdSchema['@graph'])) {
        graphNodes.push(...(jsonLdSchema['@graph'] as Array<Record<string, unknown>>));
      } else {
        graphNodes.push(jsonLdSchema);
      }
    }

    // Inject JSON-LD Script Tag
    const schemaId = 'seo-json-ld';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const fullJsonLd = {
      '@context': 'https://schema.org',
      '@graph': graphNodes,
    };

    scriptTag.textContent = JSON.stringify(fullJsonLd, null, 2);

    // Track SPA page view in Google Analytics
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('config', 'G-SCDQ6X3ZC3', {
        page_path: cleanPath,
        page_title: fullTitle,
      });
    }
  }, [
    fullTitle,
    description,
    canonicalUrl,
    cleanPath,
    primaryType,
    image,
    breadcrumbs,
    faqs,
    blogMeta,
    featureList,
    jsonLdSchema,
    toolName,
    title,
  ]);

  return null;
};

