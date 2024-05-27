export default (tournamentName: string, tournamentUrl: string) => (
  `<!DOCTYPE html>
  <html>
    <body>
      <h1>You have been confirmed for ${tournamentName}!</h1>
      <p>Check the <a href='${tournamentUrl}'>tournament details page</a> for start dates and match times.<p/>
    </body>
  </html>`
);