export default (name: string, tournamentName: string, teamCode: string) => (
  `<!DOCTYPE html>
  <html>
    <body>
      <h1>Reminder: you still need a partner for ${tournamentName}</h1>
      <p>Hi ${name},</p>
      <p>
        You registered for <strong>${tournamentName}</strong> but your team code
        <strong>${teamCode}</strong> has not been matched with a partner yet.
      </p>
      <p>Share your team code with your partner so they can complete their registration,
         or contact the tournament organizer if you need assistance.</p>
    </body>
  </html>`
);
