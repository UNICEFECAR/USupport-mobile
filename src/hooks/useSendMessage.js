import { useMutation } from "@tanstack/react-query";
import { messageSvc } from "#services";
import { useError } from "./useError";

export default function useSendMessage(
  onSuccess = () => {},
  onError = () => {}
) {
  const sendMessage = async (payload) => {
    const { data } = await messageSvc.sendMessage(payload);
    return data;
  };
  const mutation = useMutation(["send-message"], sendMessage, {
    onSuccess,
    onError: (err) => {
      const { message: errorMessage } = useError(err);
      onError(errorMessage);
    },
  });

  return mutation;
}

export { useSendMessage };
