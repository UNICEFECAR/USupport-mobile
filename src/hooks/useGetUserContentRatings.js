import { useQuery } from "@tanstack/react-query";
import { userSvc } from "#services";

export const useGetUserContentRatings = (enabled = true) => {
  const getUserContentRatings = async () => {
    const response = await userSvc.getUserContentRatings();
    const { data } = response;
    return data;
  };

  return useQuery({
    queryKey: ["userContentRatings"],
    queryFn: getUserContentRatings,
    enabled,
  });
};
