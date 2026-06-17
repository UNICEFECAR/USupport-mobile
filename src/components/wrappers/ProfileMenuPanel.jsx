import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Config from "react-native-config";

import { AppText, Icon, CachedImage } from "#components";

import { useProfileMenu } from "#blocks";

import { useGetTheme, useLogout } from "#hooks";
import { appStyles } from "#styles";

const { AMAZON_S3_BUCKET } = Config;

const USER_GUIDE_URL =
  "https://7digit-1.gitbook.io/usupport/y0yJCW2nZ6Sb52p4arjv";

export function ProfileMenuPanel({ isOpen, onClose, navigation, panelTop }) {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const logoutMutation = useLogout();

  const {
    t,
    isTmpUser,
    clientData,
    displayName,
    SHOW_PAYMENT_HISTORY,
    handleRedirect,
    languagesData,
    handlOpenLanguageDropdown,
    handleThemeChange,
    handleHighContrast,
  } = useProfileMenu(navigation);

  const runAndClose = (fn) => {
    fn();
    onClose();
  };

  const onNavigate = (screen) => {
    handleRedirect(screen);
    onClose();
  };

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
              <AppText namedStyle="h3">{t("heading")}</AppText>
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

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <AppText style={[styles.groupHeading, { color: colors.text }]}>
                {t("first_group_heading")}
              </AppText>
              <View style={styles.profileRow}>
                <View style={styles.profileRowLeft}>
                  <CachedImage
                    source={{
                      uri: `${AMAZON_S3_BUCKET}/${clientData?.image || "default"}`,
                    }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                  <View style={styles.profileText}>
                    <AppText style={[styles.profileName, { color: colors.text }]}>
                      {displayName || t("guest")}
                    </AppText>
                    <TouchableOpacity
                      onPress={() => runAndClose(() => handleRedirect("UserDetails"))}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={t("edit_profile")}
                    >
                      <AppText style={styles.editProfileLink}>
                        {t("edit_profile")}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
                {!isTmpUser ? (
                  <TouchableOpacity
                    onPress={() => runAndClose(() => logoutMutation.mutate())}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={t("logout")}
                    activeOpacity={0.7}
                    style={styles.logoutIconButton}
                  >
                    <Icon
                      name="exit"
                      color={
                        isDarkMode || isHighContrast
                          ? appStyles.colorWhite_ff
                          : appStyles.colorBlue_263238
                      }
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              <MenuRow
                iconName="mood"
                label={t("mood_tracker_button_label")}
                onPress={() => onNavigate("MoodTracker")}
                colors={colors}
                isDarkMode={isDarkMode}
              />

              <AppText style={[styles.groupHeading, { color: colors.text }]}>
                {t("second_group_heading")}
              </AppText>
              <MenuRow
                iconName="fingerprint"
                label={t("passcoode_and_biometrics_button_label")}
                onPress={() => onNavigate("Passcode")}
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <MenuRow
                iconName="notification"
                label={t("notifications_settings_button_label")}
                onPress={() => onNavigate("NotificationPreferences")}
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <MenuRow
                iconName="globe"
                label={t("language_button_label")}
                onPress={() =>
                  languagesData &&
                  runAndClose(() => handlOpenLanguageDropdown())
                }
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <MenuRow
                iconName={isDarkMode ? "sun" : "moon"}
                label={
                  isDarkMode
                    ? t("light_mode_button_label")
                    : t("dark_mode_button_label")
                }
                onPress={() => runAndClose(() => handleThemeChange())}
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <MenuRow
                iconName="accessibility"
                label={t("high_contrast_mode")}
                onPress={() => runAndClose(() => handleHighContrast())}
                colors={colors}
                isDarkMode={isDarkMode}
              />

              <AppText style={[styles.groupHeading, { color: colors.text }]}>
                {t("rate_share")}
              </AppText>
              <MenuRow
                iconName="star"
                label={t("rate_us_button_label")}
                onPress={() => onNavigate("PlatformRating")}
                colors={colors}
                isDarkMode={isDarkMode}
              />

              <AppText style={[styles.groupHeading, { color: colors.text }]}>
                {t("other")}
              </AppText>
              {SHOW_PAYMENT_HISTORY && !isTmpUser ? (
                <MenuRow
                  iconName="payment-history"
                  label={t("payments_history_button_label")}
                  onPress={() => onNavigate("PaymentHistory")}
                  colors={colors}
                  isDarkMode={isDarkMode}
                />
              ) : null}
              <MenuRow
                iconName="comment"
                label={t("contact_us_button_label")}
                onPress={() => onNavigate("ContactUs")}
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <MenuRow
                iconName="document"
                label={t("privacy_policy_button_label")}
                onPress={() => onNavigate("PrivacyPolicy")}
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <MenuRow
                iconName="document"
                label={t("terms_and_conditions")}
                onPress={() => onNavigate("TermsOfUse")}
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <MenuRow
                iconName="document"
                label={t("user_guide")}
                onPress={() =>
                  runAndClose(() => Linking.openURL(USER_GUIDE_URL))
                }
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <MenuRow
                iconName="info"
                label={t("FAQ_button_label")}
                onPress={() => onNavigate("FAQ")}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MenuRow({ iconName, label, onPress, colors, isDarkMode }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leadingIcon}>
        <Icon
          name={iconName}
          color={isDarkMode ? appStyles.colorWhite_ff : "#20809e"}
        />
      </View>
      <AppText style={[styles.rowLabel, { color: colors.text }]}>
        {label}
      </AppText>
      <Icon
        name="arrow-chevron-forward"
        color={
          isDarkMode ? appStyles.colorWhite_ff : appStyles.colorGray_a6b4b8
        }
      />
    </TouchableOpacity>
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
    maxHeight: "88%",
  },
  panelInner: {
    flex: 1,
    minHeight: 280,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  groupHeading: {
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 8,
    fontFamily: appStyles.fontSemiBold,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  rowLabel: {
    flex: 1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  profileRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  profileText: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  profileName: {
    fontFamily: appStyles.fontBold,
  },
  editProfileLink: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: appStyles.fontMedium,
    color: appStyles.colorSecondary_9749fa,
  },
  logoutIconButton: {
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  leadingIcon: {
    marginRight: 12,
  },
});
