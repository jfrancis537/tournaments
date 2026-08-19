export default (name: string, tournamentName: string, teamCode: string, registrationLink: string) => (
  `<!DOCTYPE html>
  <html>
    <body>
      <h1>Reminder: you still need a partner for ${tournamentName}</h1>
      <p>Hi ${name},</p>
      <p>
        You registered for <strong>${tournamentName}</strong> but your team code
        <strong>${teamCode}</strong> has not been matched with a partner yet.
      </p>
      <p>Send your partner this link — their team code is already filled in, they just add their name:</p>
      <p><a href="${registrationLink}">${registrationLink}</a></p>
      <p>Or share your team code <strong>${teamCode}</strong> with them directly, or contact the
         tournament organizer if you need assistance.</p>
    </body>
  </html>`
);
