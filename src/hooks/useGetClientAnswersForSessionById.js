import { useQuery } from "@tanstack/react-query";

import { clientSvc } from "#services";

export function useGetClientAnswersForSessionById(sessionId, enabled = true) {
  /**
   * Fetch client answers for a specific screening session
   * @param {string} sessionId - The session ID to fetch answers for
   * @returns {Object} React Query object with session answers data
   */
  const getClientAnswersForSessionById = async () => {
    if (!sessionId) return [];
    const { data } = await clientSvc.getClientAnswersForSessionById(sessionId);
    return data;
  };

  const getClientAnswersForSessionByIdQuery = useQuery(
    ["getClientAnswersForSessionById", sessionId],
    getClientAnswersForSessionById,
    {
      enabled: enabled && !!sessionId,
    }
  );

  return getClientAnswersForSessionByIdQuery;
}
