import { User } from "@common/Models/User";
import { RequestHandler } from "express";
import { AuthSession } from "../APIs/AuthController";

type RoleType = User['role'];

export function RequireRole(role: RoleType): RequestHandler
export function RequireRole(roles: RoleType[]): RequestHandler
export function RequireRole(roles: RoleType | RoleType[]): RequestHandler {
  return (req,resp,next) => {
    const session: AuthSession = req.session;
    let hasCorrectRole = false;
    if(session.user)
    {
      if(typeof roles === 'string')
      {
        hasCorrectRole = session.user.role === roles;
      } else {
        hasCorrectRole = roles.includes(session.user.role);
      }
    }
    if(!hasCorrectRole)
    {
      resp.sendStatus(403);
      return;
    }
    
    next();
  }
}