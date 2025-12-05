import { useQuery } from "@tanstack/react-query";
import { userSvc } from "#services";

export const useGetContentEngagementsById = ({ ids, contentType }) => {
  return useQuery({
    queryKey: ["contentEngagementsByIds", ids, contentType],
    queryFn: () => userSvc.getContentEngagementsById({ ids, contentType }),
  });
};
