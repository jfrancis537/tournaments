import { AuthAPIConstants } from "@common/Constants/AuthAPIConstants";
import { User } from "@common/Models/User";
import express, { Router } from "express";
import { Session } from "express-session";

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
      const user: User = {
        username: 'example',
        role: 'admin'
      }
      authSession.user = user;
      resp.json(user);
      return;
    } else {
      resp.sendStatus(400);
      return;
    }
  });

  router.post(AuthAPIConstants.LOGOUT,async (req,resp) => {
    try {
      await regenSession(req.session);
      resp.redirect("/");
    } catch (err) {
      resp.sendStatus(500);
      return;
    }
  });

  router.get(AuthAPIConstants.CURRENT_USER, async (req,resp) => {
    let authSession = req.session as AuthSession;
    resp.json(authSession.user ?? null);
  });
}

const both: [string, Router] = [AuthController.path, AuthController.router];
export { both as AuthController };