import { useMutation } from "@tanstack/react-query";

import { userSvc } from "#services";
import useError from "./useError";

export const useAddContentEngagement = (onMutate, onError, onSuccess) => {
  const addContentEngagement = async (payload) => {
    const { data } = await userSvc.addContentEngagement(payload);
    return { ...data, ...payload };
  };

  const { mutate: addContentEngagementMutation } = useMutation({
    mutationFn: addContentEngagement,
    onMutate,
    onError: (error, _, rollback) => {
      const { message: errorMessage } = useError(error);
      onError?.(errorMessage, rollback);
    },
    onSuccess,
  });

  return addContentEngagementMutation;
};
