import { providerSvc } from "#services";
import { useMutation } from "@tanstack/react-query";
import { useError } from "./useError";
import React from "react";

export default function useLeaveConsultation(
  onSuccess = () => {},
  onError = () => {}
) {
  const leaveConsultation = async ({ consultationId, userType }) => {
    const response = await providerSvc.leaveConsultation(
      consultationId,
      userType
    );
    return response.data;
  };

  const leaveConsultationMutation = useMutation(leaveConsultation, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return leaveConsultationMutation;
}

export { useLeaveConsultation };
