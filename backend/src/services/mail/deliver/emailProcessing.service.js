import sanitizeHtml from 'sanitize-html'
import { htmlToText } from 'html-to-text'

const processEmail = (body) => {
  const isHtml = /<[^>]+>/.test(body) // Determines if mail body contains html

  let bodyHtml
  let bodyText

  if (isHtml) {
    // Santize html and convert it to text  (since two version of mail body are stored : text,html)
    bodyHtml = sanitizeHtml(body, SANITIZE_CONFIG)
    bodyText = htmlToText(bodyHtml, {
      wordwrap: 80,
      selectors: [
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
        { selector: 'img', format: 'skip' },
      ],
    })
  } else {
    // Else convert normal text to html(this replaces new lines like /n with <br/>)
    const htmlVersion = plainTextToHtml(body)
    bodyHtml = sanitizeHtml(htmlVersion, SANITIZE_CONFIG) // Santize the html version just created
    bodyText = body
  }

  return {
    bodyHtml,
    bodyText,
  }
}

const plainTextToHtml = (text) => {
  if (!text) return ''

  // HTML-escape special characters to prevent markup injection
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Replace new line characters with <br/>
  escaped = escaped
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>')
    .replace(/\r/g, '<br>')

  // If url exist in mail body, convert it to anchor tag
  const urlRegex = /(https?:\/\/[^\s]+)/g
  escaped = escaped.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>',
  )
  // Wrap everything inside a div
  return `<div style="white-space: pre-wrap;">${escaped}</div>`
}

const SANITIZE_CONFIG = {
  // Allowed tags in html
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

  // Allowed attributes
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['style'],
  },

  allowedSchemes: ['http', 'https', 'mailto', 'cid'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data', 'cid'],
  },

  // Allowed CSS styles
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

  disallowedTagsMode: 'discard', // Discard the ones not in allowed list

  allowedIframeHostnames: [],
}
export default processEmail
