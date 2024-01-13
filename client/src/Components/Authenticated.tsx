import { UserRole } from "@common/Models/User"
import { PropsWithChildren, useContext } from "react";
import { UserContext } from "../Contexts/UserContext";

interface AuthenticatedProps extends PropsWithChildren {
  roles: UserRole[];
}

export const Authenticated: React.FC<AuthenticatedProps> = (props) => {
  const { user } = useContext(UserContext);
  if (!user || !props.roles.includes(user.role)) {
    return null;
  }

  return (
    <>
      {props.children}
    </>
  )
}