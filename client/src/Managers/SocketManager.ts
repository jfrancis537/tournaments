import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { Action } from "@common/Utilities/Action";
import { autobind } from "@common/Utilities/Decorators";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";


type SocketState = 'initial' | 'connected' | 'disconnected'

const onconnectionchanged = new Action<SocketState>();

class SocketManager {

  private socket_: Socket;
  private connectionWasLost = false;

  constructor() {
    this.socket_ = io();
  }

  @autobind
  async ondisconnected() {
    this.connectionWasLost = true;
    onconnectionchanged.invoke('disconnected');
  }

  @autobind
  async onconnected() {
    if (this.connectionWasLost) {
      onconnectionchanged.invoke('connected');
    }
  }

  async initAPIs() {
    this.socket_.on('connect', this.onconnected);
    this.socket_.on('disconnect', this.ondisconnected);
    TournamentSocketAPI.initialize(this.socket_);
  }
}

export const useSocketState = () => {
  const [state,setState] = useState<SocketState>('initial');

  useEffect(() => {
    onconnectionchanged.addListener(setState);
    return () => {
      onconnectionchanged.removeListener(setState);
    }
  },[])

  return state;
}

const instance = new SocketManager();
export { instance as SocketManager };