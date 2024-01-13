import { Match } from "brackets-model";
import { Tournament } from "../Models/Tournament";
import { SocketAction, SocketLike } from "../Utilities/SocketAction";
import { SocketName } from "../Utilities/SocketName";

class TournamentSocketAPI {
  private initialized = false;
  private ontournamentcreated_?: SocketAction<Tournament>;
  private ontournamentstateupdated_?: SocketAction<Tournament>;
  private ontournamentstarted_?: SocketAction<Tournament>;

  private onmatchupdated_?: SocketAction<Match>;
  private onmatchstarted_?: SocketAction<Match>;

  public initialize(socket: SocketLike) {
    // Tournament Created
    this.ontournamentcreated_ = new SocketAction(
      SocketName.TournamentCreated,
      socket,
      undefined,
      Tournament.Deserialize
    );
    // Tournament Started
    this.ontournamentstarted_ = new SocketAction(
      SocketName.TournamentStarted,
      socket,
      undefined,
      Tournament.Deserialize
    );
    // Registration open
    this.ontournamentstateupdated_ = new SocketAction(
      SocketName.TournamentStateUpdated,
      socket,
      undefined,
      Tournament.Deserialize
    );

    this.onmatchstarted_ = new SocketAction(
      SocketName.MatchStarted,
      socket
    );

    this.onmatchupdated_ = new SocketAction(
      SocketName.MatchUpdated,
      socket
    );

    this.initialized = true;
  }

  public get ontournamentcreated() {
    if (!this.initialized) {
      throw new Error('API is not initialized');
    }
    return this.ontournamentcreated_!;
  }

  public get ontournamentstateupdated() {
    if (!this.initialized) {
      throw new Error('API is not initialized');
    }
    return this.ontournamentstateupdated_!;
  }

  public get ontournamentstarted() {
    if (!this.initialized) {
      throw new Error('API is not initialized');
    }
    return this.ontournamentstarted_!;
  }

  public get onmatchupdated() {
    if (!this.initialized) {
      throw new Error('API is not initialized');
    }
    return this.onmatchupdated_!;
  }

  public get onmatchstarted() {
    if (!this.initialized) {
      throw new Error('API is not initialized');
    }
    return this.onmatchstarted_!;
  }


}

const instance = new TournamentSocketAPI();
export { instance as TournamentSocketAPI };