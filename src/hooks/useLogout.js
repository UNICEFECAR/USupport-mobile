import { useContext } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  localStorage,
  Context,
  userSvc,
} from "#services";
import { clearSessionPersistenceFlags } from "#utils";

export const useLogout = () => {
  const {
    setToken,
    setInitialRouteName,
    setInitialAuthRouteName,
    setRequireBiometricsSetup,
  } = useContext(Context);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation(async () => {
    userSvc.logoutRequest();
    setInitialRouteName("TabNavigation");
    setInitialAuthRouteName("Login");
    setRequireBiometricsSetup?.(false);
    setToken(null);
    await clearSessionPersistenceFlags();
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh-token");
      localStorage.removeItem("token-expires-in");
      queryClient.clear();
    }, 900);
  });

  return logoutMutation;
};
