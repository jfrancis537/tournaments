import express, { Express } from "express";
import { EnvironmentVariables } from "./Utilities/EnvironmentVariables";
import { TournamentManagerController } from "./APIs/TournamentManagementController";
import { ViteProxyMiddleware } from "./MiddleWare/ProxyMiddleware";
import { Server } from "socket.io";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { TeamController } from "./APIs/TeamController";
import { Demo } from "./TournamentDemo";
import { MatchController } from "./APIs/MatchController";
import path from 'path';

class App {
  private expressApp: Express = express();
  private socket_?: Server;
  constructor() {
    this.expressApp.use(express.json());
    this.addControllers();
    this.addStaticAssets();
  }

  public get socket(): Readonly<Server> {
    return this.socket_!;
  }

  public addStaticAssets() {
    if (EnvironmentVariables.IS_DEVELOPMENT) {
      // In development proxy all non-api calls to the vite server.
      this.expressApp.use(...ViteProxyMiddleware());
    } else {
      this.expressApp.use('/assets',express.static('public/assets'));
      this.expressApp.get('*', (req, resp) => {
        resp.sendFile(path.resolve('./public/index.html'));
      });
    }
  }

  public addControllers() {
    this.expressApp.use(...TournamentManagerController);
    this.expressApp.use(...TeamController);
    this.expressApp.use(...MatchController);
  }

  public start() {
    // Start Http server.
    const server = this.expressApp.listen(EnvironmentVariables.PORT, () => {
      console.log("Server listening on port", EnvironmentVariables.PORT);
    });
    // Setup socket
    this.socket_ = new Server(server);
    this.socket.on('connection', (socket) => {
      console.log('a user connected');
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
    // Initialize APIs
    TournamentSocketAPI.initialize(this.socket);
  }
}

const instance = new App();
export {instance as App}
