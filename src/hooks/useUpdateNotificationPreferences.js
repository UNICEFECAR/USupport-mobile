import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userSvc } from "#services";

/**
 * Reuseable hook to get update the user's notification preferences
 */
export default function useUpdateNotificationPreferences(onSuccess, onError) {
  const queryClient = useQueryClient();
  const updateNotificationsData = async (data) => {
    const res = await userSvc.updateNotificationPreferences(data);
    return res.data;
  };

  const notificationsPreferencesMutation = useMutation(
    updateNotificationsData,
    {
      onMutate: (data) => {
        // Perform an optimistic update and return the rollback function
        const oldData = queryClient.getQueryData(["notification-preferences"]);
        queryClient.setQueryData(["notification-preferences"], data);
        return () => {
          queryClient.setQueryData(["notification-preferences"], oldData);
        };
      },
      onSuccess: (data) => {
        onSuccess(data);
        queryClient.invalidateQueries({
          queryKey: ["notification-preferences"],
        });
      },
      onError: (error, variables, restoreCache) => {
        restoreCache();
        onError(error);
      },
    }
  );

  return notificationsPreferencesMutation;
}

export { useUpdateNotificationPreferences };
