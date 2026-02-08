import sanitizeHtml from 'sanitize-html'

const SANITIZE_CONFIG = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'b',
    'strong',
    'i',
    'em',
    'ul',
    'ol',
    'li',
    'br',
    'span',
    'div',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    'img',
    'a',
  ],

  allowedAttributes: {
    a: ['href', 'target'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['style'],
  },

  allowedSchemes: ['http', 'https', 'mailto', 'cid'],

  allowedStyles: {
    '*': {
      color: [/^#[0-9a-fA-F]{3,6}$/],
      'background-color': [/^#[0-9a-fA-F]{3,6}$/],
      'font-size': [/^\d+(px|em|%)$/],
      'font-weight': [/^(normal|bold|[1-9]00)$/],
      'text-align': [/^(left|right|center|justify)$/],
      'text-decoration': [/^(none|underline|line-through)$/],
    },
  },
}

const htmlSanitizer = (html) => {
  return sanitizeHtml(html, SANITIZE_CONFIG)
}

export default htmlSanitizer
