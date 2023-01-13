import { messageSvc } from "#services";
import { useMutation } from "@tanstack/react-query";

export default function useSendSystemMessage(
  chatId,
  message,
  onSuccess = () => {}
) {
  const sendSystemMessage = async () => {
    const { data } = await messageSvc.sendSystemMessage(chatId, message);
    return data;
  };
  const mutation = useMutation(sendSystemMessage, {
    onSuccess,
  });
  return mutation;
}
export { useSendSystemMessage };
