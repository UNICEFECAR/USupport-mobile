// import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notificationsSvc } from "#services";

export const useGetNotifications = () => {
  const getNotifications = async () => {
    const { data } = await notificationsSvc.getNotifications();
    const formattedData = [];

    data.forEach((notification) => {
      const content = notification.content || {};
      formattedData.push({
        notificationId: notification.notification_id,
        userId: notification.user_id,
        type: notification.type,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
        content: {
          ...content,
          time: content.time * 1000,
        },
      });
    });

    return formattedData;
  };

  const getNotificationsQuery = useQuery(["notifications"], getNotifications);

  return getNotificationsQuery;
};
