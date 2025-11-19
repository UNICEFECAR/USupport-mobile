import { useQuery } from "@tanstack/react-query";
import { userSvc } from "#services";

/**
 * Hook to get user's content engagements (likes, dislikes, views, shares, downloads)
 * @param {boolean} enabled - Whether to enable the query
 * @returns {object} - Query result with content engagements data
 */
export const useGetUserContentEngagements = (enabled = true) => {
  const getUserContentEngagements = async () => {
    const { data } = await userSvc.getUserContentEngagements();
    return data;
  };

  const contentEngagementsQuery = useQuery(
    ["userContentEngagements"],
    getUserContentEngagements,
    { enabled }
  );

  return contentEngagementsQuery;
};
