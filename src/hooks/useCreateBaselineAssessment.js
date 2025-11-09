import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";

export function useCreateBaselineAssessment() {
  const createBaselineAssessment = async () => {
    const { data } = await clientSvc.createBaselineAssessment();
    return data;
  };

  const createBaselineAssessmentMutation = useMutation(
    createBaselineAssessment
  );

  return createBaselineAssessmentMutation;
}
