const fs = require('fs')
const path = require('path')

module.exports = async function handler(request, response) {
  try {
    const url = request.url || '/'

    // Only SSR the landing page and key SEO pages
    const ssrPaths = ['/', '/landing', '/about']
    const shouldSSR = ssrPaths.some(pathname => url.startsWith(pathname))

    if (!shouldSSR) {
      // For other pages, redirect to SPA
      response.setHeader('Location', url)
      response.status(302).end()
      return
    }

    // Load the SSR build (fallback to SPA if SSR build not available)
    let render
    try {
      const serverModule = require('../dist-ssr/entry-server.js')
      render = serverModule.render
    } catch (ssrError) {
      console.log('SSR build not available, falling back to SPA:', ssrError.message)
      response.setHeader('Location', url)
      response.status(302).end()
      return
    }

    // Read the client-side built HTML template
    const templatePath = path.resolve(__dirname, '../dist/index.html')
    const template = await fs.promises.readFile(templatePath, 'utf-8')

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