import { useContext } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { localStorage, Context, userSvc } from "#services";

export const useLogout = () => {
  const { setToken, setInitialRouteName } = useContext(Context);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation(async () => {
    userSvc.logoutRequest();
    queryClient.clear();
    setToken(null);
    setInitialRouteName("TabNavigation");
    setTimeout(() => {
      localStorage.removeItem("token");
    }, 500);
  });

  return logoutMutation;
};
