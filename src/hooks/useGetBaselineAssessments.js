import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export const useGetBaselineAssessments = () => {
  return useQuery({
    queryKey: ["baseline-assessments"],
    queryFn: async () => {
      const response = await clientSvc.getBaselineAssessments();
      return response.data;
    },
  });
};
