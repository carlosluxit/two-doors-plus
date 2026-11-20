// Generates a PDF blob from the quote HTML template using html2pdf.js.
// Returns a base64-encoded string suitable for Resend attachments.
//
// Renders inside an iframe (via srcdoc) so the template doesn't inherit
// the host page's Tailwind 4 oklch() colors — html2canvas can't parse those
// and paints everything black.
//
// Product thumbnails are pre-fetched and inlined as data URIs so html2canvas
// doesn't have to deal with cross-origin images inside the srcdoc iframe.

import html2pdf from 'html2pdf.js';
import { buildQuotePdfHtml, THUMB_SLUGS, LOGO_SVG } from './quotePdfHtml';
import { THUMB_SVG_BY_SLUG } from './productThumbs';

// Convert a bundled SVG string to a PNG data URI via an off-screen canvas.
// html2canvas handles PNG reliably but has issues rasterizing complex SVGs.
// Runs entirely offline — the SVG bytes are embedded in the JS bundle.
function svgStringToPngDataUri(svgText, size = 128) {
  if (!svgText) return Promise.resolve(null);
  const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const aspect = img.naturalWidth && img.naturalHeight
          ? img.naturalWidth / img.naturalHeight
          : 1;
        const w = aspect >= 1 ? size : Math.round(size * aspect);
        const h = aspect >= 1 ? Math.round(size / aspect) : size;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = svgDataUri;
  });
}

async function buildThumbsMap(items) {
  const neededSlugs = new Set();
  for (const li of items) {
    const slug = THUMB_SLUGS[li.product_type];
    if (slug) neededSlugs.add(slug);
  }
  const entries = await Promise.all(
    Array.from(neededSlugs).map(async (slug) => {
      const svg = THUMB_SVG_BY_SLUG[slug];
      const dataUri = await svgStringToPngDataUri(svg);
      return [slug, dataUri];
    })
  );
  const map = {};
  for (const [slug, dataUri] of entries) {
    if (dataUri) map[slug] = dataUri;
  }
  return map;
}

export async function generateQuotePdfBase64(quote, items) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // Thumbnails are bundled in the JS; no network needed.
  const thumbsMap = await buildThumbsMap(items || []);
  // Rasterize the header logo for the same reason as thumbnails: html2canvas
  // is unreliable with SVG data URIs. Without this the logo silently fails
  // to render and the header table collapses.
  const logoDataUri = await svgStringToPngDataUri(LOGO_SVG, 256);
  const html = buildQuotePdfHtml(quote, items, origin, thumbsMap, logoDataUri);

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '0';
    iframe.style.top = '0';
    iframe.style.width = '816px';
    iframe.style.height = '1056px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-1';

    iframe.onload = async () => {
      try {
        const doc = iframe.contentDocument;
        await new Promise((r) => setTimeout(r, 100));

        if (doc.fonts && doc.fonts.ready) {
          try { await doc.fonts.ready; } catch {}
        }
        const imgs = doc.querySelectorAll('img');
        await Promise.all(
          Array.from(imgs).map((img) =>
            img.complete && img.naturalWidth > 0
              ? Promise.resolve()
              : new Promise((r) => {
                  img.onload = r;
                  img.onerror = r;
                  setTimeout(r, 3000);
                })
          )
        );

        const opts = {
          margin: [0.4, 0.4, 0.4, 0.4],
          filename: `${quote.quote_number}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: null,
            windowWidth: 816,
          },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.no-break'] },
        };

        const pdfBlob = await html2pdf().set(opts).from(doc.body).outputPdf('blob');

        const reader = new FileReader();
        reader.onloadend = () => {
          iframe.remove();
          const base64 = String(reader.result).split(',')[1] || '';
          resolve(base64);
        };
        reader.onerror = (e) => {
          iframe.remove();
          reject(e);
        };
        reader.readAsDataURL(pdfBlob);
      } catch (err) {
        iframe.remove();
        reject(err);
      }
    };

    iframe.onerror = (err) => {
      iframe.remove();
      reject(err);
    };

    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}
