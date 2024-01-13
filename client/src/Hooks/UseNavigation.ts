import { useLocation } from "wouter"

export const useNavigation = (location: string) => {
  const [,setLocation] = useLocation();

  function handleNavigation(event: React.MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    setLocation(location);
  }

  return handleNavigation;
}