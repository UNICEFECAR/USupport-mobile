import { useContext } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Context,
  userSvc,
} from "#services";
import { clearAuthSessionOnLogout } from "#utils";

export const useLogout = () => {
  const {
    setToken,
    setInitialRouteName,
    setInitialAuthRouteName,
    setRequireBiometricsSetup,
    setUserPin,
    setHasAuthenticatedWithPin,
    setIsAnonymousRegister,
  } = useContext(Context);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation(async () => {
    userSvc.logoutRequest();
    setInitialRouteName("TabNavigation");
    setInitialAuthRouteName("Login");
    setRequireBiometricsSetup?.(false);
    setUserPin?.(null);
    setHasAuthenticatedWithPin?.(false);
    setIsAnonymousRegister?.(false);
    setToken(null);
    await clearAuthSessionOnLogout();
    queryClient.clear();
  });

  return logoutMutation;
};
