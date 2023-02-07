import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";

import { useError } from "./useError";

export const useAddPlatformRating = (onSuccess, onError) => {
  const addPlaftormRating = async (rating) => {
    const response = await clientSvc.addPlatformRating(rating);
    return response;
  };

  return useMutation(addPlaftormRating, {
    onSuccess,
    onError: (err) => {
      const { message: error } = useError(err);
      onError(error);
    },
  });
};
