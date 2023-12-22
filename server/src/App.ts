import express, { Express } from "express";
import { EnvironmentVariables } from "./Utilities/EnvironmentVariables";
import { TournamentManagerController } from "./APIs/TournamentManagementController";
import { ViteProxyMiddleware } from "./MiddleWare/ProxyMiddleware";
import { Server } from "socket.io";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { TeamController } from "./APIs/TeamController";
import { MatchController } from "./APIs/MatchController";
import path from 'path';
import session, { MemoryStore, SessionOptions } from "express-session";
import { AuthController } from "./APIs/AuthController";

class App {

  private expressApp: Express = express();
  private socket_?: Server;

  constructor() {
    this.expressApp.use(express.json());
    this.addSessions();
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
      this.expressApp.use('/assets', express.static('public/assets'));
      this.expressApp.get('*', (req, resp) => {
        resp.sendFile(path.resolve('./public/index.html'));
      });
    }
  }

  public addControllers() {
    this.expressApp.use(...TournamentManagerController);
    this.expressApp.use(...TeamController);
    this.expressApp.use(...MatchController);
    this.expressApp.use(...AuthController);
  }

  public addSessions() {

    const sessionOptions: SessionOptions = {
      // TODO cryptographically random env variable.
      secret: 'jdfhlaksjdhflajknfaf38h29802n3fy293p8dyh238d209fpg2b37',
      cookie: { maxAge: 1000 * 60 * 2, httpOnly: true, sameSite: 'strict' },
      resave: false,
      store: new MemoryStore(),
      saveUninitialized: false
    };

    if (!EnvironmentVariables.IS_DEVELOPMENT) {
      this.expressApp.set('trust proxy', 1);
      sessionOptions.cookie!.secure = true;
    }

    this.expressApp.use(session(sessionOptions));
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
export { instance as App }
