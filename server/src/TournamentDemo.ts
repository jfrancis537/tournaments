import { TeamManager } from "./Managers/TeamManager";
import { Tournament } from "@common/Models/Tournament";

class Demo {

  async run(t: Tournament) {
    for(let i = 1 ; i <= 31; i++)
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
}

const demo = new Demo();

export { demo as Demo };