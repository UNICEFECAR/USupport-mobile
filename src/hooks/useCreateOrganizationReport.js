import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";
import { useError } from "./useError";

export const useCreateOrganizationReport = (onSuccess, onError) => {
  const submit = async ({ organizationId, reason }) => {
    return await clientSvc.createOrganizationReport(organizationId, {
      reason: reason ?? "",
    });
  };

  return useMutation({
    mutationFn: submit,
    mutationKey: ["create-organization-report"],
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError?.(errorMessage);
    },
  });
};
