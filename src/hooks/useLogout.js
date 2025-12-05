import { useContext } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { localStorage, Context, userSvc } from "#services";

export const useLogout = () => {
  const { setToken, setInitialRouteName, setInitialAuthRouteName } =
    useContext(Context);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation(async () => {
    userSvc.logoutRequest();
    setInitialRouteName("TabNavigation");
    setInitialAuthRouteName("Login");
    setToken(null);
    setTimeout(() => {
      localStorage.removeItem("token");
      queryClient.clear();
    }, 900);
  });

  return logoutMutation;
};
