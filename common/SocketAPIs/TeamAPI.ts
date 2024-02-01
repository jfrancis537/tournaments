import { RegistrationData } from "../Models/RegistrationData";
import { Team } from "../Models/Team";
import { SocketAction, SocketLike } from "../Utilities/SocketAction";
import { SocketName } from "../Utilities/SocketName";

class TeamSocketAPI {
  private initialized = false;
  private onregistrationcreated_?: SocketAction<RegistrationData>;
  private onteamseednumberassigned_?: SocketAction<Team>;

  public initialize(socket: SocketLike) {
    // Team created
    this.onregistrationcreated_ = new SocketAction(
      SocketName.TeamCreated,
      socket
    );

    // Team seed number created
    this.onteamseednumberassigned_ = new SocketAction(
      SocketName.TeamSeedNumberAssigned,
      socket
    );

    this.initialized = true;
  }

  public get onregistrationcreated() {
    if (!this.initialized) {
      throw new Error('API is not initialized');
    }
    return this.onregistrationcreated_!;
  }

  public get onteamseednumberassigned() {
    if (!this.initialized) {
      throw new Error('API is not initialized');
    }
    return this.onteamseednumberassigned_!;
  }
}

const instance = new TeamSocketAPI();
export {instance as TeamSocketAPI};