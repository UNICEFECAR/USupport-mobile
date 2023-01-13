import { useQuery } from "@tanstack/react-query";
import { userSvc } from "#services";

/**
 * Reuseable hook to get and transform the client data in a desired format
 */
export default function useGetNotificationPreferences() {
  const fetchNotificationsData = async () => {
    const { data } = await userSvc.getNotificationPreferences();
    let transformedData = {
      consultationReminder: data.consultation_reminder,
      consultationReminderMin: data.consultation_reminder_min,
      email: data.email,
      inPlatform: data.in_platform,
      push: data.push,
    };
    return transformedData;
  };

  const notificationsPreferencesQuery = useQuery(
    ["notification-preferences"],
    fetchNotificationsData,
    {
      notifyOnChangeProps: ["data"],
    }
  );

  return [notificationsPreferencesQuery];
}

export { useGetNotificationPreferences };
