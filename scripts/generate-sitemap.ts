import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BLOG_POSTS } from '../src/data/blogData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DOMAIN = 'https://smartpdfai.tech';

// Format date to YYYY-MM-DD
function formatDate(dateInput?: string | Date): string {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  try {
    const parsed = new Date(dateInput);
    if (isNaN(parsed.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return parsed.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

const currentDateStr = formatDate();

// Define non-indexable, private, or internal routes to exclude
const EXCLUDED_ROUTES = new Set([
  '*',
  '/404',
  '/dashboard',
  '/team',
  '/admin',
  '/admin/content-generator',
  '/settings',
  '/cloud-storage'
]);

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export function generateSitemap(): string {
  const urlMap = new Map<string, SitemapUrl>();

  // 1. Automatically parse AppRoutes.tsx for declared static routes
  const appRoutesPath = path.join(rootDir, 'src', 'routes', 'AppRoutes.tsx');
  if (fs.existsSync(appRoutesPath)) {
    const routeContent = fs.readFileSync(appRoutesPath, 'utf-8');
    const routeRegex = /path=["']([^"']+)["']/g;
    let match: RegExpExecArray | null;

    while ((match = routeRegex.exec(routeContent)) !== null) {
      const routePath = match[1].trim();

      // Skip wildcards, parameterized routes, and explicitly excluded private routes
      if (
        EXCLUDED_ROUTES.has(routePath) ||
        routePath.includes(':') ||
        routePath.startsWith('/admin')
      ) {
        continue;
      }

      // Determine default priority and changefreq based on path category
      let priority = '0.7';
      let changefreq: SitemapUrl['changefreq'] = 'weekly';

      if (routePath === '/') {
        priority = '1.0';
        changefreq = 'daily';
      } else if (routePath === '/blog') {
        priority = '0.9';
        changefreq = 'daily';
      } else if (
        routePath.includes('privacy') ||
        routePath.includes('terms') ||
        routePath.includes('cookies') ||
        routePath.includes('disclaimer') ||
        routePath.includes('editorial') ||
        routePath.includes('review') ||
        routePath.includes('policy')
      ) {
        priority = '0.5';
        changefreq = 'monthly';
      } else if (
        routePath.includes('pdf') ||
        routePath.includes('word') ||
        routePath.includes('compress') ||
        routePath.includes('merge') ||
        routePath.includes('split') ||
        routePath.includes('image') ||
        routePath.includes('ocr') ||
        routePath.includes('excel') ||
        routePath.includes('jpg') ||
        routePath.includes('chat')
      ) {
        priority = '0.9';
        changefreq = 'weekly';
      }

      urlMap.set(routePath, {
        loc: `${DOMAIN}${routePath}`,
        lastmod: currentDateStr,
        changefreq,
        priority
      });
    }
  }

  // 2. Automatically add all dynamic blog posts from blogData.ts
  if (Array.isArray(BLOG_POSTS)) {
    BLOG_POSTS.forEach((post) => {
      if (post && post.slug) {
        const blogPath = `/blog/${post.slug}`;
        const postDate = formatDate(post.lastUpdated || post.publishDate);
        urlMap.set(blogPath, {
          loc: `${DOMAIN}${blogPath}`,
          lastmod: postDate,
          changefreq: 'monthly',
          priority: '0.8'
        });

        // Track author profiles from blog posts
        if (post.author) {
          const authorSlug = post.author.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          const authorPath = `/author/${authorSlug}`;
          if (!urlMap.has(authorPath)) {
            urlMap.set(authorPath, {
              loc: `${DOMAIN}${authorPath}`,
              lastmod: currentDateStr,
              changefreq: 'monthly',
              priority: '0.6'
            });
          }
        }
      }
    });
  }

  // Ensure default author page is present if declared
  urlMap.set('/author/mridanga-mondal', {
    loc: `${DOMAIN}/author/mridanga-mondal`,
    lastmod: currentDateStr,
    changefreq: 'monthly',
    priority: '0.6'
  });

  // Sort URLs deterministically: root first, then alphabetically
  const sortedEntries = Array.from(urlMap.values()).sort((a, b) => {
    if (a.loc === DOMAIN) return -1;
    if (b.loc === DOMAIN) return 1;
    return a.loc.localeCompare(b.loc);
  });

  // Build Google Search Console compliant XML string
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of sortedEntries) {
    xml += `  <url>\n`;
    xml += `    <loc>${entry.loc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export function writeSitemapFiles(): void {
  const xmlContent = generateSitemap();

  // Write to public/sitemap.xml
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, xmlContent, 'utf-8');
  console.log(`[Sitemap] Successfully generated ${publicSitemapPath}`);

  // Write to dist/sitemap.xml if dist directory exists
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    const distSitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distSitemapPath, xmlContent, 'utf-8');
    console.log(`[Sitemap] Successfully copied to ${distSitemapPath}`);
  }
}

// Execute directly if run via CLI
if (process.argv[1] && (process.argv[1].endsWith('generate-sitemap.ts') || process.argv[1].endsWith('generate-sitemap.js'))) {
  writeSitemapFiles();
}
