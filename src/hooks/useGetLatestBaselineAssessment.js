import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export const useGetLatestBaselineAssessment = (enabled = true) => {
  return useQuery({
    queryKey: ["latest-baseline-assessment"],
    queryFn: async () => {
      const response = await clientSvc.getLatestBaselineAssessment();
      const data = response.data;
      if (!data.baselineAssessmentId) {
        return null;
      }
      return data;
    },
    enabled,
    retry: false,
  });
};
