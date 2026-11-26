import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* One switch for the production domain: SITE_URL (in .env or the build
   environment). Unset — the current state — nothing domain-specific is
   emitted, because a guessed canonical points search engines at someone
   else's site. Set, this adds canonical + og:url, makes social image URLs
   absolute, adds `url` to the Person/WebSite schema, and writes
   sitemap.xml and the robots.txt Sitemap line. */
function siteUrl() {
  let url = ''
  return {
    name: 'site-url',
    config(_, { mode }) {
      url = (loadEnv(mode, process.cwd(), '').SITE_URL || '').trim().replace(/\/+$/, '')
      if (url && !/^https?:\/\/[^/\s]+$/.test(url)) throw new Error(`SITE_URL must be an origin like https://example.com, got "${url}"`)
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (!url) return html
        return html
          .replace('<!-- site:domain -->', `<link rel="canonical" href="${url}/" />\n    <meta property="og:url" content="${url}/" />`)
          .replaceAll('content="/og.png"', `content="${url}/og.png"`)
          .replace('"@type": "Person",', `"@type": "Person",\n            "url": "${url}/",`)
          .replace('"@type": "WebSite",', `"@type": "WebSite",\n            "url": "${url}/",`)
      },
    },
    generateBundle() {
      const robots = `User-agent: *\nAllow: /\n${url ? `\nSitemap: ${url}/sitemap.xml\n` : ''}`
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
      if (url) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}/</loc></url>\n</urlset>\n`,
        })
      }
    },
  }
}

// No manualChunks: a manual vendor chunk once swallowed `scheduler`, which
// react-dom needs, and turned a lazy chunk into a static preload.
export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
})
