import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  toolName?: string;
  jsonLdSchema?: Record<string, unknown>;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'SmartPDF AI - Enterprise PDF & Document Productivity Suite',
  description = 'Free online PDF tools to merge, split, compress, protect, unlock, OCR, convert, and AI-chat with PDF files. 100% private client-side processing.',
  path = '/',
  toolName,
  jsonLdSchema,
}) => {
  const fullTitle = toolName
    ? `${toolName} - SmartPDF AI`
    : title.includes('SmartPDF')
    ? title
    : `${title} | SmartPDF AI`;

  const canonicalUrl = `https://smartpdfai.tech${path.startsWith('/') ? path : '/' + path}`;

  useEffect(() => {
    // Update Document Title
    document.title = fullTitle;

    // Helper to update meta tag or create if missing
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Update Meta Description
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // Update Open Graph Metadata
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'SmartPDF AI');

    // Update Twitter Card Metadata
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    // Update Canonical URL Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Dynamic JSON-LD Schema
    const schemaId = 'seo-json-ld';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = jsonLdSchema || {
      '@context': 'https://schema.org',
      '@type': toolName ? 'SoftwareApplication' : 'WebApplication',
      name: fullTitle,
      description: description,
      url: canonicalUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
    };

    scriptTag.textContent = JSON.stringify(schemaData);

    // Track SPA page view in Google Analytics
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('config', 'G-SCDQ6X3ZC3', {
        page_path: path,
        page_title: fullTitle,
      });
    }
  }, [fullTitle, description, canonicalUrl, toolName, path]);

  return null;
};
