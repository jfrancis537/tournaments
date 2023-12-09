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
        { grandFinal: 'double', seedOrdering: ['natural'] }
      ]
    });

    for(let i = 1 ; i <= 7; i++)
    {
      this.generatePlayer(t.id,i);
    }

    return t.id;
  }

  generatePlayer(tid: string, num: number) {
    TeamManager.instance.registerTeam({
      tournamentId: tid,
      name: `Team ${num}`,
      players: 1,
    });
  }

  async onClick(match: Match) {
    switch(match.status)
    {
      case Status.Ready:
        await TournamentManager.instance.updateScore(match.opponent1!.id as number,match,12);
        break;
      case Status.Running:
        await TournamentManager.instance.updateScore(match.opponent2!.id as number,match,13);

    }

  }
}

const demo = new Demo();

export { demo as Demo };