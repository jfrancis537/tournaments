import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { Socket, io } from "socket.io-client";

class SocketManager {
  private socket_: Socket;

  constructor() {
    this.socket_= io();
  }

  async initAPIs() {
    TournamentSocketAPI.initialize(this.socket_);
  }
}

const instance = new SocketManager();
export {instance as SocketManager};