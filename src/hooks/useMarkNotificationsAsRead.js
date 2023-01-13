import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsSvc } from "#services";
import useError from "./useError";

export const useMarkNotificationsAsRead = (onError = () => {}) => {
  const queryClient = useQueryClient();
  /**
   *
   * @param {Array} notificationIds
   * @returns {object}
   */
  const markNotificationsAsRead = async (notificationIds) => {
    const { data } = await notificationsSvc.markNotificationsAsRead(
      notificationIds
    );
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
