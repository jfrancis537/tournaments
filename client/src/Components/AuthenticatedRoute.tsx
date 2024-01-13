import { ReactElement, useContext } from "react";
import { DefaultParams, Path, Route, RouteProps } from "wouter";
import { UserContext } from "../Contexts/UserContext";
import { UserRole } from "@common/Models/User";
import { Forbidden } from "../Pages/Forbidden";

interface AuthenticatedRouteProps<T extends DefaultParams | undefined = undefined,
RoutePath extends Path = Path> extends RouteProps<T, RoutePath> {
  roles?: UserRole[]
}

export function AuthenticatedRoute<T extends DefaultParams | undefined = undefined,
RoutePath extends Path = Path>(props: AuthenticatedRouteProps<T, RoutePath>): ReactElement {
  const { user } = useContext(UserContext);

  if (!user || (props.roles && !props.roles.includes(user.role))) {
    const updatedProps = {...props, children: undefined};
    return (
      <Route {...updatedProps}>
        <Forbidden />
      </Route>
    )
  }

  return (
    <Route {...props} />
  )
}