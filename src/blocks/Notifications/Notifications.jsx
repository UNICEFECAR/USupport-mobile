import React from "react";
import { TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import {
  Heading,
  Block,
  AppText,
  Loading,
  Line,
} from "#components";

import { useNotificationsList, notificationListStyles } from "./useNotificationsList";

/**
 * Notifications
 *
 * Notifications screen block (full-page list)
 *
 * @returns {JSX.Element}
 */
export const Notifications = ({
  navigation,
  openJoinConsultation,
  openRequireDataAgreement,
}) => {
  const {
    t,
    isHighContrast,
    styles,
    notificationsQuery,
    isListLoading,
    renderNotification,
    handleMarkAllAsRead,
  } = useNotificationsList({
    navigation,
    openJoinConsultation,
    openRequireDataAgreement,
    notificationType: "all",
  });

  const MarkAllAsReadButton = () => {
    return (
      <TouchableOpacity
        onPress={handleMarkAllAsRead}
        style={styles.markAllAsReadButtonContainer}
      >
        <AppText
          style={[
            styles.markAllAsReadButton,
            isHighContrast ? styles.markAllAsReadButtonHC : {},
          ]}
        >
          {t("mark_read")}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <Block style={styles.block}>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      <View style={styles.flashListWrapper}>
        <MarkAllAsReadButton />
        <FlashList
          ListEmptyComponent={
            isListLoading ? (
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
                {item.item.isRead && <Line style={styles.line} />}
              </>
            );
          }}
          onEndReached={() => notificationsQuery.fetchNextPage()}
          contentContainerStyle={styles.paddingBottom200}
        />
      </View>
    </Block>
  );
};

export { notificationListStyles };
