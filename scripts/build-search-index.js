/*
 * Builds the full-text search index for /blog.html.
 *
 * Reads every D:/RBSWebsite/blog/*.html, strips the body text out of either
 * `.blog-post-content` (newer posts) or `.article-body` (older posts), and
 * writes a single JSON file at /data/blog-search-index.json that the live
 * search on /blog.html lazy-fetches on first interaction.
 *
 * Run after adding/editing a post:
 *   node scripts/build-search-index.js
 *
 * Output is one array of { slug, body } objects, lowercased, ~270 KB for 38 posts.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const OUT_FILE = path.join(ROOT, 'data', 'blog-search-index.json');

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));

const index = files.map(f => {
  const html = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8');

  let m =
    html.match(/<div\s+class="blog-post-content"[\s\S]*?>([\s\S]+?)<\/article>/) ||
    html.match(/<div\s+class="article-body"[\s\S]*?>([\s\S]+?)<\/article>/) ||
    html.match(/<div\s+class="article-body"[\s\S]*?>([\s\S]+?)<\/main>/);

  let body = '';
  if (m) {
    body = m[1]
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  return { slug: f.replace(/\.html$/, ''), body };
}).filter(x => x.body.length > 0);

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(index));

const totalKB = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
const totalWords = index.reduce((s, x) => s + x.body.split(/\s+/).length, 0);
console.log(`Indexed ${index.length} of ${files.length} posts | ${totalKB} KB | ${totalWords} words`);

const skipped = files.length - index.length;
if (skipped > 0) {
  console.warn(`Warning: ${skipped} file(s) had no extractable body — check the wrapper class.`);
}
