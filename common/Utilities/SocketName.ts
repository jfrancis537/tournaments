export enum SocketName {

  // Tournaments
  TournamentCreated = 'tournament_created',
  TournamentDeleted = 'tournament_deleted',
  TournamentStarted = 'tournament_started',
  TournamentStateUpdated = 'tournament_state_updated',
  MatchStarted = 'match_started',
  MatchUpdated = 'match_updated',
  MatchMetadataUpdated = 'match_metadata_updated',

  // Teams
  TeamCreated = 'team_created',
  TeamSeedNumberAssigned = 'team_seednumber_assigned',
}