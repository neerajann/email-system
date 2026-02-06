import sanitizeHtml from 'sanitize-html'
import { htmlToText } from 'html-to-text'

const processEmail = (body) => {
  const isHtml = /<[^>]+>/.test(body)

  let bodyHtml
  let bodyText

  if (isHtml) {
    bodyHtml = sanitizeHtml(body, SANITIZE_CONFIG)
    bodyText = htmlToText(bodyHtml, {
      wordwrap: 80,
      selectors: [
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
        { selector: 'img', format: 'skip' },
      ],
    })
  } else {
    const htmlVersion = plainTextToHtml(body)
    bodyHtml = sanitizeHtml(htmlVersion, SANITIZE_CONFIG)
    bodyText = body
  }

  return {
    bodyHtml,
    bodyText,
  }
}

const plainTextToHtml = (text) => {
  if (!text) return ''

  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  escaped = escaped
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>')
    .replace(/\r/g, '<br>')

  const urlRegex = /(https?:\/\/[^\s]+)/g
  escaped = escaped.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  )

  return `<div style="white-space: pre-wrap;">${escaped}</div>`
}

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
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['style'],
  },

  allowedSchemes: ['http', 'https', 'mailto', 'cid'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data', 'cid'],
  },

  allowedStyles: {
    '*': {
      color: [/^#[0-9a-fA-F]{3,6}$/],
      'background-color': [/^#[0-9a-fA-F]{3,6}$/],
      'font-size': [/^\d+(px|em|%)$/],
      'font-weight': [/^(normal|bold|[1-9]00)$/],
      'text-align': [/^(left|right|center|justify)$/],
      'text-decoration': [/^(none|underline|line-through)$/],
      'white-space': [/^pre-wrap$/],
      'font-family': [/.*/],
    },
  },

  disallowedTagsMode: 'discard',

  allowedIframeHostnames: [],
}
export default processEmail
