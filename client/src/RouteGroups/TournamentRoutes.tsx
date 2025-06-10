import { Route } from "wouter"
import { AuthenticatedRoute } from "../Components/AuthenticatedRoute"
import { MatchPage } from "../Pages/MatchPage/MatchPage"
import { NotFound } from "../Pages/NotFound"
import { RegistrationManagement } from "../Pages/TournamentPage/RegistrationManagement"
import { SeedAssignmentTool } from "../Pages/TournamentPage/SeedAssignmentTool"
import { TeamAssignment } from "../Pages/TournamentPage/TeamAssignment"
import { TournamentCreator } from "../Pages/TournamentPage/TournamentCreator"
import { TournamentManagment } from "../Pages/TournamentPage/TournamentManagement"
import { TournamentRegistration } from "../Pages/TournamentPage/TournamentRegistration"
import { TournamentViewer } from "../Pages/TournamentPage/TournamentViewer"
import { NEW_TOURNAMENT_ID } from "../Utilities/RouteUtils"

export const TournamentRoutes = (
  <>
    <Route path='/tournament/:id'>
      {(params) => {
        if (params.id === NEW_TOURNAMENT_ID) {
          return (
            <TournamentCreator />
          )
        }
        return <TournamentViewer tournamentId={params.id} />
      }}
    </Route>
    <Route path='/tournament/:id/register'>
      {(params) => {
        if (params.id === NEW_TOURNAMENT_ID) {
          return (
            <NotFound />
          )
        }
        return <TournamentRegistration tournamentId={params.id} />
      }}
    </Route>
    <AuthenticatedRoute roles={['Admin']} path='/tournament/:id/manage'>
      {(params) => {
        if (params.id === NEW_TOURNAMENT_ID) {
          return (
            <NotFound />
          )
        }
        return <TournamentManagment tournamentId={params.id} />
      }}
    </AuthenticatedRoute>
    <AuthenticatedRoute roles={['Admin']} path='/tournament/:id/assigning'>
      {(params) => {
        if (params.id === NEW_TOURNAMENT_ID) {
          return (
            <NotFound />
          )
        }
        return <SeedAssignmentTool tournamentId={params.id} />
      }}
    </AuthenticatedRoute>
    <AuthenticatedRoute roles={['Admin']} path='/tournament/:id/registration-approval'>
      {(params) => {
        if (params.id === NEW_TOURNAMENT_ID) {
          return (
            <NotFound />
          )
        }
        return <RegistrationManagement editable tournamentId={params.id} />
      }}
    </AuthenticatedRoute>
    <AuthenticatedRoute roles={['Admin']} path='/tournament/:id/registrations'>
      {(params) => {
        if (params.id === NEW_TOURNAMENT_ID) {
          return (
            <NotFound />
          )
        }
        return <RegistrationManagement editable={false} tournamentId={params.id} />
      }}
    </AuthenticatedRoute>
    <AuthenticatedRoute roles={['Admin']} path='/tournament/:id/team-assignment'>
      {(params) => {
        if (params.id === NEW_TOURNAMENT_ID) {
          return (
            <NotFound />
          )
        }
        return <TeamAssignment tournamentId={params.id} />
      }}
    </AuthenticatedRoute>
    <Route path='/tournament/:tournamentId/match/:matchId'>
      {(params) => {
        const matchIdNumber = Number(params.matchId);
        if (isNaN(matchIdNumber)) {
          return <NotFound />
        }
        return <MatchPage tournamentId={params.tournamentId} matchId={matchIdNumber} />
      }}
    </Route>
  </>
)