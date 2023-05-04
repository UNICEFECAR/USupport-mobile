import { useQuery } from "@tanstack/react-query";
import { notificationsSvc } from "#services";

export const useCheckHasUnreadNotifications = (enabled = true) => {
  const checkHasUnreadNotifications = async () => {
    if (!enabled) return false;
    const { data } = await notificationsSvc.checkHasUnreadNotifications();
    return data;
  };

  const checkHasUnreadNotificationsQuery = useQuery(
    ["has-unread-notifications"],
    checkHasUnreadNotifications,
    {
      enabled: !!enabled,
    }
  );

  return checkHasUnreadNotificationsQuery;
};
