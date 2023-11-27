import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";

import {
  Heading,
  Block,
  AppText,
  Notification,
  AppButton,
  Loading,
  Line,
} from "#components";

import { appStyles } from "#styles";

import {
  getDateView,
  getTimeAsString,
  ONE_HOUR,
  showToast,
  checkIsFiveMinutesBefore,
} from "#utils";

import { notificationsSvc, providerSvc } from "#services";

import {
  useMarkNotificationsAsRead,
  useAcceptConsultation,
  useRejectConsultation,
  useGetAllConsultations,
  useMarkAllNotificationsAsRead,
  useGetClientData,
} from "#hooks";

/**
 * Notifications
 *
 * Notifiations screen
 *
 * @returns {JSX.Element}
 */
export const Notifications = ({
  navigation,
  openJoinConsultation,
  openRequireDataAgreement,
}) => {
  const { t } = useTranslation("notifications");

  const queryClient = useQueryClient();

  const consultationsData = queryClient.getQueryData(["all-consultations"]);
  const clientDataQuery = useGetClientData()[0];

  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  let shouldFetchConsultations;
  if (!consultationsData) {
    shouldFetchConsultations = true;
  }
  const consultationsDataQuery = useGetAllConsultations(
    !!shouldFetchConsultations
  );

  const getNotifications = async ({ pageParam }) => {
    const { data } = await notificationsSvc.getNotifications(pageParam);
    return data.map((notification) => {
      const notificationContent = notification.content || {};
      return {
        notificationId: notification.notification_id,
        userId: notification.user_id,
        type: notification.type,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
        content: {
          ...notificationContent,
          time:
            typeof notificationContent.time === "string"
              ? new Date(notificationContent.time).getTime()
              : notificationContent.time * 1000,
          providerDetailId: notificationContent.provider_detail_id,
          consultationId: notificationContent.consultation_id,
          newConsultationTime: notificationContent.new_consultation_time * 1000,
          consultationChatId: notificationContent.consultationChatId,
        },
      };
    });
  };

  const [notificationProviders, setNotificationProviders] = useState({});
  const getProviderNameForNotification = async (providerId) => {
    // Check if we already have the provider name in the cache
    if (Object.keys(notificationProviders).includes(providerId)) {
      return notificationProviders[providerId];
    }
    if (!providerId) return null;
    return providerSvc.getProviderById(providerId);
  };

  const fetchProvidersData = async (data) => {
    const notificationProvidersCopy = { ...notificationProviders };
    const alreadyFetchedProviders = [];

    for (let i = 0; i < data.length; i++) {
      const notificationData = data[i];
      // Make sure we don't fetch the same provider twice
      if (alreadyFetchedProviders.includes(notificationData.providerId))
        continue;

      const response = await getProviderNameForNotification(
        notificationData.providerId
      );
      if (!response || !response.data) continue;

      // Construct the provider name
      const providerData = response.data;
      const providerName = `${providerData.name} ${
        providerData.patronym || "" + " "
      }${providerData.surname}`;

      alreadyFetchedProviders.push(notificationData.providerId);
      notificationProvidersCopy[notificationData.providerId] = providerName;
    }
    setNotificationProviders(notificationProvidersCopy);
    setIsLoadingProviders(false);
  };

  const notificationsQuery = useInfiniteQuery(
    ["notifications"],
    getNotifications,
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length + 1;
      },
      onSuccess: (data) => {
        fetchProvidersData(
          data.pages.flat().map((x) => {
            return {
              providerId: x.content.providerDetailId,
              notificationId: x.notificationId,
            };
          })
        );
      },
    }
  );

  // Accept consultation logic
  const onAcceptConsultationSuccess = () => {
    showToast({ message: t("accept_consultation_success") });
  };
  const onAcceptConsultationError = (error) => {
    showToast({ message: error }, { type: "error" });
  };
  const acceptConsultationMutation = useAcceptConsultation(
    onAcceptConsultationSuccess,
    onAcceptConsultationError
  );

  const handleAcceptSuggestion = (
    consultationId,
    consultationPrice,
    notificationId,
    slot
  ) => {
    if (!clientDataQuery.data?.dataProcessing) {
      openRequireDataAgreement();
    } else {
      markNotificationAsReadByIdMutation.mutate([notificationId]);
      acceptConsultationMutation.mutate({
        consultationId,
        price: consultationPrice,
        slot,
      });
    }
  };

  // Reject consultation loggic
  const onRejectConsultationSuccess = () => {
    showToast({ message: t("reject_consultation_success") });
  };
  const onRejectConsultationError = (error) => {
    showToast({ message: error }, { type: "error" });
  };
  const rejectConsultationMutation = useRejectConsultation(
    onRejectConsultationSuccess,
    onRejectConsultationError
  );
  const rejectConsultation = (consultationId, notificationId) => {
    rejectConsultationMutation.mutate(consultationId);
    markNotificationAsReadByIdMutation.mutate([notificationId]);
  };

  // Mark all notificartions as read logic
  // Because of the load on scroll we mark as read
  // only the currently shown/fetched notifications
  const onMarkAllAsReadError = (error) =>
    showToast({ message: error }, { type: "error" });

  const markNotificationAsReadByIdMutation =
    useMarkNotificationsAsRead(onMarkAllAsReadError);

  const markAllAsReadMutation =
    useMarkAllNotificationsAsRead(onMarkAllAsReadError);

  const handleMarkAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  const renderNotification = ({ item, index }) => {
    let notification = item;

    if (!notification.content) return null;
    let time, date, startHour, endHour;

    if (notification.content.time) {
      time = notification.content.time;
      date = getDateView(time);
      startHour = getTimeAsString(new Date(time));
      endHour = getTimeAsString(new Date(time + ONE_HOUR));
    }

    let newDate, newStartHour, newEndHour;
    if (notification.content.newConsultationTime) {
      const newTime = notification.content.newConsultationTime;
      newDate = getDateView(newTime);
      newStartHour = getTimeAsString(new Date(newTime));
      newEndHour = getTimeAsString(new Date(newTime + ONE_HOUR));
    }

    const handleNotificationClick = (
      notificationId,
      redirectTo = "Consultations"
    ) => {
      markNotificationAsReadByIdMutation.mutate([notificationId]);
      navigation.navigate(redirectTo);
    };

    switch (notification.type) {
      case "consultation_booking":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  providerName:
                    notificationProviders[
                      notification.content.providerDetailId
                    ],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_reschedule":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  providerName:
                    notificationProviders[
                      notification.content.providerDetailId
                    ],
                  date,
                  startHour,
                  endHour,
                  newDate,
                  newStartHour,
                  newEndHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_cancellation":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  providerName:
                    notificationProviders[
                      notification.content.providerDetailId
                    ],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_cancellation_provider":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  providerName:
                    notificationProviders[
                      notification.content.providerDetailId
                    ],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_remind_start":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  minutes: notification.content.minToConsultation,
                })}
              </Trans>
            }
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
            icon="calendar"
          >
            {checkIsFiveMinutesBefore(notification.content.time) ? (
              <AppButton
                size="sm"
                label={t("join")}
                color="purple"
                style={styles.centerButton}
                onPress={() =>
                  openJoinConsultation(
                    consultationsData.find(
                      (x) =>
                        x.consultationId === notification.content.consultationId
                    )
                  )
                }
              />
            ) : null}
          </Notification>
        );
      case "consultation_suggestion":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  providerName:
                    notificationProviders[
                      notification.content.providerDetailId
                    ],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
          >
            {!notification.isRead ? (
              <View style={styles.suggestButtonContainer}>
                <AppButton
                  onPress={() =>
                    handleAcceptSuggestion(
                      notification.content.consultationId,
                      notification.content.consultationPrice,
                      notification.notificationId,
                      notification.content.time
                    )
                  }
                  size="sm"
                  label={t("accept")}
                  color="purple"
                  style={styles.suggestButton}
                />
                <AppButton
                  onPress={() =>
                    rejectConsultation(
                      notification.content.consultationId,
                      notification.notificationId
                    )
                  }
                  size="sm"
                  label={t("reject")}
                  type="ghost"
                  color="green"
                  style={styles.suggestButton}
                />
              </View>
            ) : null}
          </Notification>
        );
      case "consultation_suggestion_booking":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  providerName:
                    notificationProviders[
                      notification.content.providerDetailId
                    ],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_suggestion_cancellation":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  providerName:
                    notificationProviders[
                      notification.content.providerDetailId
                    ],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_started":
        const canJoin = checkIsFiveMinutesBefore(notification.content.time);
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans
                components={[
                  <AppText namedStyle="smallText" style={styles.fontBold} />,
                ]}
              >
                {t(notification.type, {
                  providerName:
                    notificationProviders[
                      notification.content.providerDetailId
                    ],
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(
                notification.notificationId,
                canJoin ? null : "Consultations"
              )
            }
          >
            {canJoin && (
              <AppButton
                size="md"
                label={t("join")}
                color="purple"
                style={styles.centerButton}
                onPress={() =>
                  openJoinConsultation(
                    consultationsData.find(
                      (x) =>
                        x.consultationId === notification.content.consultationId
                    )
                  )
                }
              />
            )}
          </Notification>
        );
      default:
        return null;
    }
  };

  const MarkAllAsReadButton = () => {
    return (
      <TouchableOpacity onPress={handleMarkAllAsRead}>
        <AppText style={styles.markAllAsReadButton}>{t("mark_read")}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <Block style={styles.block}>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
        buttonComponent={<MarkAllAsReadButton />}
      />
      <View style={styles.flashListWrapper}>
        <FlashList
          ListEmptyComponent={
            isLoadingProviders ? (
              <View style={styles.loadingContainer}>
                <Loading size="lg" />
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <AppText namedStyle="h3">{t("no_notifications")}</AppText>
              </View>
            )
          }
          ListFooterComponent={
            notificationsQuery.isFetchingNextPage ? (
              <View style={styles.loadingContainer}>
                <Loading size="lg" />
              </View>
            ) : null
          }
          estimatedItemSize={25}
          keyExtractor={(item, index) => index.toString()}
          data={notificationsQuery.data?.pages?.flat() || []}
          renderItem={(item) => {
            return (
              <>
                {renderNotification(item)}
                {item.item.isRead && (
                  <Line
                    style={{ width: "85%", alignSelf: "center", marginTop: 0 }}
                  />
                )}
              </>
            );
          }}
          onEndReached={() => notificationsQuery.fetchNextPage()}
          contentContainerStyle={{
            paddingBottom: 200,
          }}
        />
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { paddingHorizontal: 0 },
  markAllAsReadButton: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
  loadingContainer: {
    width: "100%",
    paddingTop: 40,
    alignItems: "center",
  },
  flashListWrapper: {
    height: "100%",
    marginTop: 112,
  },
  centerButton: { alignSelf: "center", minWidth: 120, marginTop: 16 },
  suggestButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  suggestButton: { minWidth: 120 },
  fontBold: { fontFamily: appStyles.fontBold },
});
