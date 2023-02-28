import { useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { localStorage, Context } from "#services";

export const useLogout = () => {
  const { setToken, setInitialRouteName } = useContext(Context);
  const queryClient = useQueryClient();

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    setToken(null);
    setInitialRouteName("TabNavigation");
  };

  return logout;
};
