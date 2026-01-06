const generateBounceHtml = (recipient) => {
  return `<p>
  Your message could not be delivered to <strong>${recipient}</strong>
  because the recipient address does not exist or is not able to receive mail.
</p>

<div style="background:#fff4f2;border-left:4px solid #d93025;padding:12px">
  <strong>Remote server response:</strong><br />
  <code> '550 5.1.1 Recipient address rejected'</code>
</div>

<p>
  Please check the recipient's email address and try again.
</p>
`
}

const generateDeliveryFailureHtml = (recipient) => {
  return `<p>
  We were unable to deliver your message to
  <strong>${recipient}</strong> after several attempts.
</p>

<div style="background:#fef7e0;border-left:4px solid #fbbc04;padding:12px">
  <strong>Reason:</strong><br />
  <code>The recipient mail server could not be reached.</code>
</div>

<p>
  This usually happens due to temporary network or DNS issues on the
  recipient's mail server.
</p>

<p>
  You may try sending the message again later.
</p>
`
}
export { generateBounceHtml, generateDeliveryFailureHtml }
