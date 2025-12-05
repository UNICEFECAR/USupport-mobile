import { useMutation } from "@tanstack/react-query";

import { userSvc } from "#services";
import useError from "./useError";

export const useRemoveContentEngagement = (onMutate, onError, onSuccess) => {
  const removeContentEngagement = async (payload) => {
    const { data } = await userSvc.removeContentEngagement(payload);
    return { ...data, ...payload };
  };

  const { mutate: removeContentEngagementMutation } = useMutation({
    mutationFn: removeContentEngagement,
    onMutate,
    onError: (error, _, rollback) => {
      const { message: errorMessage } = useError(error);
      onError?.(errorMessage, rollback);
    },
    onSuccess,
  });

  return removeContentEngagementMutation;
};
