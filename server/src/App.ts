import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import express, { Express, NextFunction, Request, Response } from "express";
import { auth } from "express-openid-connect";
import session, { MemoryStore, SessionOptions } from "express-session";
import path from 'path';
import { Server } from "socket.io";
import { AuthController } from "./Controllers/AuthController";
import { LocationAssignmentController } from "./Controllers/LocationAssignmentController";
import { MatchController } from "./Controllers/MatchController";
import { NewsController } from "./Controllers/NewsController";
import { TeamController } from "./Controllers/TeamController";
import { TournamentManagerController } from "./Controllers/TournamentManagementController";
import { TournamentManager } from "./Managers/TournamentManager";
import { ViteProxyMiddleware } from "./MiddleWare/ProxyMiddleware";
import { generateTokenSync } from "./Utilities/Crypto";
import { EnvironmentVariables } from "./Utilities/EnvironmentVariables";

class App {

  private expressApp: Express = express();
  private socket_?: Server;

  constructor() {
    this.expressApp.use(express.json());
    // this.addSessions();
    this.addOidc();
    this.addControllers();
    this.addStaticAssets();
    this.addErrorHandling();
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

  public addErrorHandling() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.expressApp.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      console.error('[Error]', err);
      if (!res.headersSent) {
        res.sendStatus(500);
      }
    });
  }

  public addControllers() {
    this.expressApp.use(...TournamentManagerController);
    this.expressApp.use(...TeamController);
    this.expressApp.use(...MatchController);
    this.expressApp.use(...AuthController);
    this.expressApp.use(...NewsController);
    this.expressApp.use(...LocationAssignmentController);
  }

  public addOidc() {
    this.expressApp.use(auth({
      authRequired: false,
      issuerBaseURL: EnvironmentVariables.OIDC_AUTHORITY,
      baseURL: EnvironmentVariables.OIDC_BASE_URL,
      clientID: EnvironmentVariables.OIDC_CLIENT_ID,
      secret: generateTokenSync(),
      clientSecret: EnvironmentVariables.OIDC_CLIENT_SECRET,
      routes: {
        login: '/oidc/login',
        logout: '/oidc/logout',
        callback: '/oidc/callback'
      },
      authorizationParams: {
        response_type: 'code'
      }
    }))
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
    await TournamentManager.instance.populateBracketData();
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
    TeamSocketAPI.initialize(this.socket);
  }
}

const instance = new App();
export { instance as App };

