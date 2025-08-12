const sanitizeHtml = require('sanitize-html');

/**
 * Sanitize un bloc HTML "riche" issu de l’éditeur (ReactQuill).
 * - on autorise une liste minimale de tags innocents
 * - <a> : URL http/https uniquement, force rel="noopener noreferrer" si target=_blank
 * - <img> : UNIQUEMENT sources locales (/...) ou data:image/* (pas d’URL externe)
 */
const ALLOWED_TAGS = [
  'p', 'br', 'ul', 'ol', 'li',
  'b', 'i', 'strong', 'em',
  'h2', 'h3', 'h4', 'a', 'img'
];

const ALLOWED_ATTR = {
  a:   ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title']
};

function sanitizeOne(html = '') {
  const out = sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ['http', 'https', 'data'],
    // On enlève les commentaires & <style>/<script> de toute façon
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || '';
        // refuse js: mailto: etc.
        if (!/^https?:\/\//i.test(href)) {
          return { tagName: 'span', text: '' };
        }
        const next = { ...attribs };
        if (next.target === '_blank') {
          next.rel = 'noopener noreferrer';
        }
        return { tagName, attribs: next };
      },
      img: (tagName, attribs) => {
        const src = attribs.src || '';
        const isLocal = src.startsWith('/') && !src.startsWith('//');
        const isDataImage = /^data:image\//i.test(src);
        if (!isLocal && !isDataImage) {
          // on supprime les images externes
          return { tagName: 'span', text: '' };
        }
        return { tagName, attribs };
      }
    }
  });
  return out;
}

/**
 * description attendue: { fr, en, es, ru, zh } (strings Quill)
 * Renvoie le même objet, nettoyé tag par tag.
 */
function sanitizeDescriptionMap(description) {
  const langs = ['fr','en','es','ru','zh'];
  const out = {};
  for (const l of langs) {
    out[l] = sanitizeOne(description?.[l] || '');
  }
  return out;
}

module.exports = {
  sanitizeOne,
  sanitizeDescriptionMap,
};