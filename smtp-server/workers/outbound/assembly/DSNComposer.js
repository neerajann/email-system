const generateBounceHtml = (recipient) => {
  const accentColor = '#d93025'

  return `
    <div style="opacity: 0.9; line-height: 1.6;">
      
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <strong style="font-size: 1.1em;">Delivery Failed</strong>
      </div>

      <p style="margin: 0 0 16px 0;">
        Your message to <strong>${recipient}</strong> was rejected. The address likely does not exist or cannot receive mail.
      </p>

      <div style="
        border-left: 3px solid ${accentColor};
        padding: 8px 16px;
        margin: 16px 0;
        opacity: 0.85;">
        
        <span style="
          text-transform: uppercase; 
          font-size: 0.75em; 
          letter-spacing: 1px; 
          opacity: 0.7;">
          Server Response
        </span>
        
        <code style="
          display: block; 
          margin-top: 6px; 
          padding: 8px; 
          border: 1px solid currentColor; 
          border-radius: 4px; 
          font-family: monospace;">
          550 5.1.1 Recipient address rejected
        </code>
      </div>

      <p style="margin-top: 16px; font-size: 0.9em; opacity: 0.8;">
         Please check the email address for typos and try again.
      </p>
    </div>
  `
}

const generateDeliveryFailureHtml = (recipient) => {
  const accentColor = '#fbbc04'

  return `
    <div style="opacity: 0.9; line-height: 1.6;">
      
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px;">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <strong style="font-size: 1.1em;">Delivery Issue</strong>
      </div>

      <p style="margin: 0 0 16px 0;">
        We could not deliver your message to <strong>${recipient}</strong> after multiple attempts.
      </p>

      <div style="
        border-left: 3px solid ${accentColor};
        padding: 8px 16px;
        margin: 16px 0;
        opacity: 0.85;">
        
        <span style="
          text-transform: uppercase; 
          font-size: 0.75em; 
          letter-spacing: 1px; 
          opacity: 0.7;">
          Reason
        </span>

        <code style="
          display: block; 
          margin-top: 6px; 
          padding: 8px; 
          border: 1px solid currentColor;
          border-radius: 4px; 
          font-family: monospace;">
          The recipient mail server could not be reached.
        </code>
      </div>

      <p style="margin-top: 16px; font-size: 0.9em; opacity: 0.8;">
        This is usually a temporary network issue. You may try again later.
      </p>
    </div>
  `
}

export { generateBounceHtml, generateDeliveryFailureHtml }
