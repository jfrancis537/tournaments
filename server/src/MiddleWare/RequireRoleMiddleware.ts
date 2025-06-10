import { UserRole } from "@common/Models/User";
import { RequestHandler } from "express";
import { EnvironmentVariables } from "../Utilities/EnvironmentVariables";


export function RequireRole(role: UserRole): RequestHandler
export function RequireRole(roles: UserRole[]): RequestHandler
export function RequireRole(roles: UserRole | UserRole[]): RequestHandler {
  return (req, resp, next) => {
    let hasCorrectRole = false;
    if (req.oidc.user) {
      const userRoles: string[] = req.oidc.user['roles'];
      if (typeof roles === 'string') {

        hasCorrectRole = userRoles.includes(roles);
      } else {
        hasCorrectRole = roles.every(role => userRoles.includes(role));
      }
    }
    if (!hasCorrectRole) {
      if (EnvironmentVariables.IS_DEVELOPMENT) {
        next();
        return;
      }
      resp.sendStatus(403);
      return;
    }

    next();
  }
}