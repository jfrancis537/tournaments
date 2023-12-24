import { AuthAPIConstants, LoginResult, RegistrationResult } from "@common/Constants/AuthAPIConstants";
import { User } from "@common/Models/User";
import express, { Router } from "express";
import { Session } from "express-session";
import { UserManager } from "../Managers/UserManager";

export interface AuthSession extends Session {
  user?: User
}

namespace AuthController {
  export const path = AuthAPIConstants.BASE_PATH;
  export const router = express.Router();

  function destorySession(authSession: AuthSession) {
    return new Promise<void>((resolve, reject) => {
      authSession.destroy((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  function regenSession(authSession: AuthSession) {
    return new Promise<AuthSession>((resolve, reject) => {
      let retval = authSession.regenerate((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(retval);
      });
    });
  }

  router.post(AuthAPIConstants.LOGIN, async (req, resp) => {
    let authSession = req.session as AuthSession;
    try {
      // Destroy any existing session.
      await regenSession(authSession);
      authSession = req.session;
    } catch (err) {
      resp.sendStatus(500);
      return;
    }
    // Verify Login details
    const body = req.body as AuthAPIConstants.LoginRequest;
    if (body.password && body.username) {
      // TODO actually verify login details
      const [result, user] = await UserManager.instance.loginUser(body);
      if (result === LoginResult.SUCCESS) {
        authSession.user = user;
        resp.json(user);
      } else if (result === LoginResult.INVALID_CREDENTIALS) {
        resp.status(401).send('Credentials invalid.');
      } else {
        resp.sendStatus(500);
      }
      return;
    } else {
      resp.sendStatus(400);
      return;
    }
  });

  router.post(AuthAPIConstants.LOGOUT, async (req, resp) => {
    try {
      await regenSession(req.session);
      resp.redirect("/");
    } catch (err) {
      resp.sendStatus(500);
      return;
    }
  });

  router.put(AuthAPIConstants.REGISTER, async (req, resp) => {
    const body: AuthAPIConstants.AccountRegistrationRequest = req.body;
    if (!body) {
      // Send bad request if no body.
      resp.sendStatus(400);
      return;
    }

    const result = await UserManager.instance.registerUser(body);
    let responseBody: AuthAPIConstants.AccountRegistrationResponse = { result };
    switch (result) {
      case RegistrationResult.SUCCESS:
        resp.status(200).json(responseBody);
        break;
      case RegistrationResult.FAILED_USER_EXISTS:
      case RegistrationResult.FAILED_BAD_PASSWORD:
      case RegistrationResult.FAILED_BAD_EMAIL:
      case RegistrationResult.FAILED_BAD_USERNAME:
        resp.status(400).json(responseBody);
        break;
      case RegistrationResult.FAILED_UNK:
        resp.status(500).json(responseBody);
        break;
    }
  });

  router.get(AuthAPIConstants.CURRENT_USER, async (req, resp) => {
    let authSession = req.session as AuthSession;
    resp.json(authSession.user ?? null);
  });
}

const both: [string, Router] = [AuthController.path, AuthController.router];
export { both as AuthController };