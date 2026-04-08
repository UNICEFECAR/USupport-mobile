import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { AppText, Icon, Loading, Line, Tabs } from "#components";

import { useNotificationsList } from "#blocks";

import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

/**
 * Full-screen overlay notifications panel (matches client-ui navbar bell panel).
 */
export function NotificationsDropdownPanel({
  isOpen,
  onClose,
  navigation,
  /** Distance from top of screen to top of panel content (below header bar) */
  panelTop,
  openJoinConsultation,
  openRequireDataAgreement,
}) {
  const { t } = useTranslation("blocks", { keyPrefix: "notifications" });
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const tabValues = ["all", "new", "read"];
  const [selectedTab, setSelectedTab] = useState("all");

  const {
    styles: notificationStyles,
    notificationsQuery,
    isLoadingProviders,
    renderNotification,
    handleMarkAllAsRead,
  } = useNotificationsList({
    navigation,
    openJoinConsultation,
    openRequireDataAgreement,
    notificationType: selectedTab,
    onAfterNavigate: onClose,
  });

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View
          style={[
            styles.panel,
            {
              top: panelTop,
              backgroundColor: colors.background,
              paddingBottom: Math.max(bottomInset, 8),
            },
          ]}
        >
          <View style={styles.panelInner}>
            <View style={styles.panelHeader}>
              <AppText namedStyle="h3">{t("panel_heading")}</AppText>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Icon
                  name="close-x"
                  color={
                    isDarkMode || isHighContrast
                      ? appStyles.colorWhite_ff
                      : appStyles.colorBlue_263238
                  }
                />
              </TouchableOpacity>
            </View>

            <View style={styles.tabsRow}>
              <View style={styles.tabsFlex}>
                <Tabs
                  options={tabValues.map((tab) => ({
                    label: t(`tab_${tab}`),
                    value: tab,
                    isSelected: selectedTab === tab,
                  }))}
                  handleSelect={(index) => setSelectedTab(tabValues[index])}
                  tabsStyle={{ paddingHorizontal: 0 }}
                />
              </View>
            </View>
            <View style={styles.markReadContainer}>
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                style={styles.markReadTouchable}
                hitSlop={8}
              >
                <AppText
                  style={[
                    notificationStyles.markAllAsReadButton,
                    isHighContrast
                      ? notificationStyles.markAllAsReadButtonHC
                      : null,
                  ]}
                >
                  {t("mark_read")}
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.listWrap}>
              <FlashList
                ListEmptyComponent={
                  isLoadingProviders ? (
                    <View style={notificationStyles.loadingContainer}>
                      <Loading size="lg" />
                    </View>
                  ) : (
                    <View style={notificationStyles.loadingContainer}>
                      <AppText namedStyle="h3">{t("no_notifications")}</AppText>
                    </View>
                  )
                }
                ListFooterComponent={
                  notificationsQuery.isFetchingNextPage ? (
                    <View style={notificationStyles.loadingContainer}>
                      <Loading size="lg" />
                    </View>
                  ) : null
                }
                estimatedItemSize={80}
                keyExtractor={(item, index) =>
                  `${item.notificationId}-${index}`
                }
                data={notificationsQuery.data?.pages?.flat() || []}
                renderItem={(row) => (
                  <View>
                    {renderNotification(row)}
                    {row.item.isRead && (
                      <Line style={notificationStyles.line} />
                    )}
                  </View>
                )}
                onEndReached={() => notificationsQuery.fetchNextPage()}
                contentContainerStyle={notificationStyles.paddingBottom200}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    zIndex: 2,
    elevation: 10,
  },
  panelInner: {
    flex: 1,
    minHeight: 400,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabsRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 8,
    gap: 8,
  },
  tabsFlex: {
    flex: 1,
    minWidth: 0,
  },
  markReadContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  markReadTouchable: {
    justifyContent: "center",
    paddingTop: 4,
    paddingLeft: 4,
  },
  listWrap: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
