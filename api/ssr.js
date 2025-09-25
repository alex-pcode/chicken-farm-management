import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async function handler(request, response) {
  try {
    const url = request.url || '/'

    // Only SSR the landing page and key SEO pages
    const ssrPaths = ['/', '/landing', '/about']
    const shouldSSR = ssrPaths.some(path => url.startsWith(path))

    if (!shouldSSR) {
      // For other pages, redirect to SPA
      response.setHeader('Location', url)
      response.status(302).end()
      return
    }

    // Load the SSR build
    const { render } = await import('../dist-ssr/entry-server.js')

    // Read the client-side built HTML template
    const template = await import('fs').then(fs =>
      fs.promises.readFile(resolve(__dirname, '../dist/index.html'), 'utf-8')
    )

    // Render the app HTML
    const appHtml = render(url)

    // Replace the placeholder in template with rendered HTML
    const html = template
      .replace(`<!--ssr-outlet-->`, appHtml.html)
      .replace(`<!--ssr-head-->`, `
        <meta name="description" content="Complete modern solution for data-driven chicken keeping - Track egg production, manage expenses, and optimize your flock management.">
        <meta property="og:title" content="Chicken Manager - Modern Poultry Management">
        <meta property="og:description" content="Complete modern solution for data-driven chicken keeping">
        <meta property="og:type" content="website">
        <link rel="canonical" href="https://chickencare.app${url}">
      `)

    response.setHeader('Content-Type', 'text/html')
    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    response.status(200).send(html)

  } catch (error) {
    console.error('SSR Error:', error)
    // Fallback to SPA on SSR error
    response.setHeader('Location', request.url || '/')
    response.status(302).end()
  }
}