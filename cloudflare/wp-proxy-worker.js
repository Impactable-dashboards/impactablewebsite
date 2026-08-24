const WP_ORIGIN = 'https://bisque-cat-190519.hostingersite.com';
const PUBLIC_HOST = 'impactable.com';

/** Paths that should be served from WordPress (exact pages + assets) */
const WP_PREFIXES = [
  '/blog',
  '/impactable-about-us',
  '/about-us',
  '/careers',
  '/paid-ads',
  '/linkedin-ads-budget-defense-kit',
  '/automated-messaging',
  '/facebook-ads',
  '/programmatic-retargeting',
  '/b2b-creative-services',
  '/b2b-marketing-resources',
  '/events',
  '/demand-gen',
  '/identify-website-visitors-activation',
  '/omnichannel-marketing-packages',
  '/it-services-marketing',
  '/marketing-services-providers',
  '/b2b-saas-marketing',
  '/privacy',
  '/wp-content',
  '/wp-includes',
  '/wp-json',
  '/wp-admin',
  '/wp-login.php',
  '/xmlrpc.php',
];

/**
 * Only these public URLs get index,follow.
 * Everything else proxied from WP gets noindex,follow.
 */
const INDEXABLE_PREFIXES = [
  '/blog',
  '/impactable-about-us',
  '/about-us',
  '/careers',
  '/paid-ads',
  '/linkedin-ads-budget-defense-kit',
  '/automated-messaging',
  '/facebook-ads',
  '/programmatic-retargeting',
  '/b2b-creative-services',
  '/b2b-marketing-resources',
  '/events',
  '/demand-gen',
  '/identify-website-visitors-activation',
  '/omnichannel-marketing-packages',
  '/it-services-marketing',
  '/marketing-services-providers',
  '/b2b-saas-marketing',
  '/privacy',
];

/** Marketing site paths on Vercel — never send these to WP /blog */
const VERCEL_PREFIXES = [
  '/assets',
  '/api',
  '/lp',
  '/thought-leadership',
  '/marketing-ecosystem',
  '/linkedin-ads-agency',
  '/linkedin-ads-agency-new',
  '/linkedin-launch',
  '/linkedin-scale',
  '/linkedin-scale-new',
  '/linkedin-ads-audit',
  '/linkedin-ads-by-industry',
  '/linkedin-ads-for-saas',
  '/linkedin-ads-for-cybersecurity',
  '/linkedin-ads-for-financial-services',
  '/google',
  '/programmatic',
  '/events-resources',
  '/pricing',
  '/pricing-table-embed',
  '/competitor-intel-report',
  '/intelligence-room',
  '/activation',
  '/thank-you',
  '/redesign',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/favicon.ico',
  '/favicon.png',
];

const NOINDEX_UNDER_BLOG = ['/blog/category/', '/blog/tag/', '/blog/author/'];

function pathMatchesPrefix(pathname, prefix) {
  return (
    pathname === prefix ||
    pathname === prefix + '/' ||
    pathname.startsWith(prefix + '/')
  );
}

function isVercelPath(pathname) {
  if (pathname === '/' || pathname === '') return true;
  return VERCEL_PREFIXES.some((p) => pathMatchesPrefix(pathname, p));
}

function isWpSitemap(pathname) {
  if (pathname === '/sitemap.xml') return false;
  if (pathname === '/sitemap_index.xml') return true;
  return /^\/[a-z0-9_-]+-sitemap\d*\.xml$/i.test(pathname);
}

function isWpPath(pathname) {
  if (isWpSitemap(pathname)) return true;
  if (pathname === '/category' || pathname.startsWith('/category/')) return true;
  if (pathname === '/tag' || pathname.startsWith('/tag/')) return true;
  if (pathname === '/author' || pathname.startsWith('/author/')) return true;
  return WP_PREFIXES.some((p) => pathMatchesPrefix(pathname, p));
}

/** /category|tag|author → /blog/category|tag|author */
function blogTaxonomyRedirect(url) {
  const { pathname, search } = url;
  for (const kind of ['category', 'tag', 'author']) {
    if (pathname === `/${kind}` || pathname.startsWith(`/${kind}/`)) {
      const suffix = pathname === `/${kind}` ? `/${kind}/` : pathname;
      return `https://${url.hostname}/blog${suffix}${search}`;
    }
  }
  return null;
}

/**
 * Old permalinks: /post-slug/ → /blog/post-slug/
 * (WP 301s the same way; this fixes Vercel 404s in one hop)
 */
function legacyBlogPostRedirect(url) {
  const { pathname, search, hostname } = url;
  if (pathname.startsWith('/blog/') || pathname === '/blog') return null;
  if (isVercelPath(pathname)) return null;
  if (isWpPath(pathname)) return null;

  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 1) return null;

  const slug = parts[0];
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(slug)) return null;
  if (slug.includes('.')) return null;

  return `https://${hostname}/blog/${slug}/${search}`;
}

function isIndexablePath(pathname) {
  if (
    pathname.startsWith('/wp-admin') ||
    pathname.startsWith('/wp-login') ||
    pathname.startsWith('/wp-json') ||
    pathname.startsWith('/xmlrpc') ||
    pathname.startsWith('/wp-content') ||
    pathname.startsWith('/wp-includes')
  ) {
    return false;
  }
  if (NOINDEX_UNDER_BLOG.some((p) => pathname.startsWith(p))) return false;
  return INDEXABLE_PREFIXES.some((p) => pathMatchesPrefix(pathname, p));
}

function applyRobotsToHtml(body, indexable) {
  const content = indexable ? 'index, follow' : 'noindex, follow';
  const robotsTag = `<meta name="robots" content="${content}" />`;
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(body)) {
    return body.replace(/<meta\s+name=["']robots["'][^>]*>/gi, robotsTag);
  }
  if (/<\/head>/i.test(body)) {
    return body.replace(/<\/head>/i, `  ${robotsTag}\n</head>`);
  }
  return body;
}

function rewriteLocation(location, requestUrl) {
  if (!location) return location;
  try {
    const abs = new URL(location, WP_ORIGIN);
    if (
      abs.hostname === 'bisque-cat-190519.hostingersite.com' ||
      abs.hostname === PUBLIC_HOST ||
      abs.hostname === 'www.' + PUBLIC_HOST ||
      abs.hostname === 'impactable.marketing' ||
      abs.hostname === 'www.impactable.marketing'
    ) {
      abs.protocol = 'https:';
      abs.hostname = requestUrl.hostname;
      return abs.toString();
    }
  } catch (_) {
    /* ignore */
  }
  return location.replaceAll(
    'https://bisque-cat-190519.hostingersite.com',
    requestUrl.origin
  );
}

async function proxyToWordPress(request) {
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, WP_ORIGIN);
  const indexable = isIndexablePath(incoming.pathname);

  const headers = new Headers(request.headers);
  headers.set('Host', 'bisque-cat-190519.hostingersite.com');
  headers.set('X-Forwarded-Host', incoming.hostname);
  headers.set('X-Forwarded-Proto', 'https');
  headers.delete('cf-connecting-ip');

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  const upstream = await fetch(target.toString(), init);
  const outHeaders = new Headers(upstream.headers);

  const loc = outHeaders.get('Location');
  if (loc) outHeaders.set('Location', rewriteLocation(loc, incoming));

  outHeaders.delete('content-security-policy');
  outHeaders.delete('x-frame-options');

  if (!isWpSitemap(incoming.pathname)) {
    outHeaders.set(
      'X-Robots-Tag',
      indexable ? 'index, follow' : 'noindex, follow'
    );
  }

  const contentType = outHeaders.get('content-type') || '';
  if (
    contentType.includes('text/html') ||
    contentType.includes('text/css') ||
    contentType.includes('javascript') ||
    contentType.includes('application/json') ||
    contentType.includes('text/xml') ||
    contentType.includes('application/xml') ||
    contentType.includes('application/rss')
  ) {
    let body = await upstream.text();
    body = body
      .replaceAll('https://bisque-cat-190519.hostingersite.com', incoming.origin)
      .replaceAll('http://bisque-cat-190519.hostingersite.com', incoming.origin)
      .replaceAll('//bisque-cat-190519.hostingersite.com', '//' + incoming.host)
      .replaceAll('https://impactable.marketing', incoming.origin)
      .replaceAll('http://impactable.marketing', incoming.origin);

    if (contentType.includes('text/html')) {
      body = applyRobotsToHtml(body, indexable);
    }

    return new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (
      url.hostname !== PUBLIC_HOST &&
      url.hostname !== 'www.' + PUBLIC_HOST
    ) {
      return fetch(request);
    }

    // /google-ads → Vercel /google
    if (
      url.pathname === '/google-ads' ||
      url.pathname === '/google-ads/'
    ) {
      return Response.redirect(`https://${url.hostname}/google`, 301);
    }

    const taxonomyRedirect = blogTaxonomyRedirect(url);
    if (taxonomyRedirect) {
      return Response.redirect(taxonomyRedirect, 301);
    }

    // Old post URLs without /blog → /blog/{slug}/
    const legacyPost = legacyBlogPostRedirect(url);
    if (legacyPost) {
      return Response.redirect(legacyPost, 301);
    }

    if (isVercelPath(url.pathname)) {
      return fetch(request);
    }

    if (isWpPath(url.pathname)) {
      return proxyToWordPress(request);
    }

    // Unknown multi-segment etc. → Vercel (404 there if missing)
    return fetch(request);
  },
};
