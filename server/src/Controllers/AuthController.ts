import { AuthAPIConstants } from "@common/Constants/AuthAPIConstants";
import express, { Router } from "express";

namespace AuthController {
  export const path = AuthAPIConstants.BASE_PATH;
  export const router = express.Router();

  router.get(AuthAPIConstants.LOGIN, async (req, resp) => {
    if (!req.oidc.isAuthenticated()) {
      resp.oidc.login();
      return;
    }
    resp.redirect('/');
    return;
  });

  router.get(AuthAPIConstants.LOGOUT, async (req, resp) => {
    if (req.oidc.isAuthenticated()) {
      resp.oidc.logout();
      return;
    }
    resp.sendStatus(200);
    return;
  });

  router.get(AuthAPIConstants.CURRENT_USER, async (req, resp) => {
    if (req.oidc.isAuthenticated() && req.oidc.user) {
      resp.json({
        username: req.oidc.user["preferred_username"],
        email: req.oidc.user['email'],
        roles: req.oidc.user['roles']
      })
      // resp.json(req.oidc.user);
      return;
    }
    resp.json(null);
  });
}

const both: [string, Router] = [AuthController.path, AuthController.router];
export { both as AuthController };
