import { Match, Status } from "brackets-model";
import { TournamentManager } from "./Managers/TournamentManager";
import { TeamManager } from "./Managers/TeamManager";

class Demo {

  async run() {
    const t = TournamentManager.instance.createNewTournament({
      name: 'example',
      startDate: new Date(),
      endDate: new Date(),
      stages: [
        'double_elimination'
      ],
      stageSettings: [
        { grandFinal: 'double' }
      ]
    });

    for(let i = 1 ; i <= 8; i++)
    {
      this.generatePlayer(t.id,i);
    }

    TournamentManager.instance.startTournament(t.id);
  }

  generatePlayer(tid: string, num: number) {
    TeamManager.instance.registerTeam({
      tournamentId: tid,
      name: `Team ${num}`,
      players: 1
    })
  }

  onClick(match: Match) {
    switch(match.status)
    {
      case Status.Ready:
        TournamentManager.instance.startMatch(match);
        break;
      case Status.Running:
        
    }

  }
}

const demo = new Demo();

export { demo as Demo };