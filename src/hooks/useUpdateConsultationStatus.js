import { videoSvc } from "#services";
import { useMutation } from "@tanstack/react-query";

export const useUpdateConsultationStatus = () => {
  const updateConsultationStatus = async (data) => {
    const res = await videoSvc.updateConsultationStatus(data);
    return res.data;
  };

  const updateSponorMutation = useMutation(
    ["update-consultation-status"],
    updateConsultationStatus,
    {
      onSuccess: () => {},
      onError: (err) => {},
    }
  );

  return updateSponorMutation;
};
