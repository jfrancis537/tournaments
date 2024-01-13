import { User } from "@common/Models/User";
import React from "react";

interface UserContext {
  user?: User;
  setUser: (user?: User) => void;
}

const ctx = React.createContext<UserContext>({setUser: () => {}});
export { ctx as UserContext }