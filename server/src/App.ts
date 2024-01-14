import express, { Express } from "express";
import { EnvironmentVariables } from "./Utilities/EnvironmentVariables";
import { TournamentManagerController } from "./Controllers/TournamentManagementController";
import { ViteProxyMiddleware } from "./MiddleWare/ProxyMiddleware";
import { Server } from "socket.io";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { TeamController } from "./Controllers/TeamController";
import { MatchController } from "./Controllers/MatchController";
import path from 'path';
import session, { MemoryStore, SessionOptions } from "express-session";
import { AuthController } from "./Controllers/AuthController";
import { TeamManager } from "./Managers/TeamManager";
import { TournamentManager } from "./Managers/TournamentManager";
import { generateToken, generateTokenSync } from "./Utilities/Crypto";

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
      secret: generateTokenSync(),
      // Two hours
      cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: true, sameSite: 'strict' },
      resave: false,
      // TODO don't use memory store.
      store: new MemoryStore(),
      saveUninitialized: false
    };

    if (!EnvironmentVariables.IS_DEVELOPMENT) {
      this.expressApp.set('trust proxy', 1);
      sessionOptions.cookie!.secure = true;
    }

    this.expressApp.use(session(sessionOptions));
  }

  public async start() {
    // Load data
    await TournamentManager.instance.load();
    await TeamManager.instance.load();
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
