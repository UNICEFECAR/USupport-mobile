import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";

export const useAddPushNotificationToken = () => {
  const addPushNotificationToken = async (token) => {
    const res = await clientSvc.addPushNotificationToken(token);
    return res;
  };

  const addPushNotificationTokenMutation = useMutation(
    addPushNotificationToken,
    { onError: console.log }
  );

  return addPushNotificationTokenMutation;
};
