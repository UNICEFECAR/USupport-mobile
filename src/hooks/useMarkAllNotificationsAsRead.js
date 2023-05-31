import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsSvc } from "#services";
import useError from "./useError";

export const useMarkAllNotificationsAsRead = (onError = () => {}) => {
  const queryClient = useQueryClient();
  /**
   *
   * @param {Array} notificationIds
   * @returns {object}
   */
  const markNotificationsAsRead = async () => {
    const { data } = await notificationsSvc.markAllNotificationsAsRead();
    return data;
  };

  const markNotificationAsReadMutation = useMutation(markNotificationsAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["has-unread-notifications"]);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return markNotificationAsReadMutation;
};
