import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useError } from "./useError";
import { clientSvc } from "#services";

/**
 *
 * @param {Object} data the data to send to the API
 * @param {Function} onSuccess function to be called with the response data
 * @param {Function} onError function to be called with the response error
 * @returns {Object} the mutation object which has a "mutate" function that can be used to execute the mutation
 */
export default function useUpdateClientData(data, onSuccess, onError) {
  const queryClient = useQueryClient();

  const updateClientData = async () => {
    // Delete the fields which the API doesn't accept
    const dataCopy = JSON.parse(JSON.stringify(data));

    delete dataCopy.accessToken;
    delete dataCopy.dataProcessing;
    delete dataCopy.image;
    delete dataCopy.clientID;

    dataCopy.email = dataCopy.email.toLowerCase();

    const res = await clientSvc.updateClientData(dataCopy);
    return res.data;
  };

  const updateClientDataMutation = useMutation(updateClientData, {
    onSuccess: (data) => {
      onSuccess(data);
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return updateClientDataMutation;
}

export { useUpdateClientData };
