export default (name: string, tournamentName: string) => (
  `<!DOCTYPE html>
  <html>
    <body>
      <h1>We've received your registration for ${tournamentName}!</h1>
      <p>Hi ${name},</p>
      <p>Your registration is being reviewed. You'll get another email once it has been approved.</p>
    </body>
  </html>`
);
