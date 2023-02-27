import { useQueryClient } from "@tanstack/react-query";
import { localStorage } from "#services";

export const useLogout = (setToken) => {
  const queryClient = useQueryClient();

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    setToken(null);
  };

  return logout;
};
