import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  toolName?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'SmartPDF AI - Enterprise PDF & Document Productivity Suite',
  description = 'Free online PDF tools to merge, split, compress, protect, unlock, OCR, convert, and AI-chat with PDF files. 100% private client-side processing.',
  path = '/',
  toolName,
}) => {
  const fullTitle = toolName
    ? `${toolName} - SmartPDF AI`
    : title.includes('SmartPDF')
    ? title
    : `${title} | SmartPDF AI`;

  useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    // Update OG Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // Dynamic JSON-LD Schema
    const schemaId = 'seo-json-ld';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': toolName ? 'SoftwareApplication' : 'WebApplication',
      name: fullTitle,
      description: description,
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
  }, [fullTitle, description, path, toolName]);

  return null;
};
