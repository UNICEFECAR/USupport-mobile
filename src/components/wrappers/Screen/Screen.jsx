import React, { useContext, useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  View,
  StatusBar,
  Image,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ButtonOnlyIcon } from "../../buttons";
import pageMobileHero from "../../../assets/page-hero-new.png";
import pageTabletHero from "../../../assets/page-tablet-hero.png";
import { HeaderNavigation } from "../../headings";
import { JoinConsultation } from "#backdrops";
import { RequireDataAgreement } from "#modals";
import { NotificationsDropdownPanel } from "../NotificationsDropdownPanel";
import { ProfileMenuPanel } from "../ProfileMenuPanel";
import {
  useCheckHasUnreadNotifications,
  useGetTheme,
  useAddSosCenterClick,
} from "#hooks";
import { Context } from "#services";
import { appStyles } from "#styles";

// Main wrapper for every screen
export function Screen({
  children,
  style,
  isBackgroundColorEnabled = true,
  backgroundColor,
  outsideComponent,
  hasEmergencyButton = true,
  backgroundImage,
  hasHeaderNavigation = false,
  t,
}) {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const { isTmpUser, token, handleRegistrationModalOpen, hasCheckedTmpUser } =
    useContext(Context);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState();

  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] =
    useState(false);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [headerNavLayoutHeight, setHeaderNavLayoutHeight] = useState(96);
  const [selectedConsultation, setSelectedConsultation] = useState();
  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);

  const openJoinConsultation = useCallback((consultation) => {
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  }, []);
  const closeJoinConsultation = useCallback(
    () => setIsJoinConsultationOpen(false),
    []
  );
  const openRequireDataAgreement = useCallback(
    () => setIsRequireDataAgreementOpen(true),
    []
  );
  const closeRequireDataAgreement = useCallback(
    () => setIsRequireDataAgreementOpen(false),
    []
  );

  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  // Match web `Page` behavior: the hero/background image is only shown in light mode.
  const showBackgroundImage = backgroundImage !== false && !isDarkMode;
  const backgroundImageSource = useMemo(() => {
    if (width >= 768) return pageTabletHero;
    return pageMobileHero;
  }, [width]);

  const onCheckHasUnreadNotificationsSuccess = (data) => {
    setHasUnreadNotifications(data);
  };
  const queryEnabled = !isTmpUser && !!token && hasCheckedTmpUser;
  useCheckHasUnreadNotifications(
    queryEnabled,
    onCheckHasUnreadNotificationsSuccess
  );

  const addSosCenterClickMutation = useAddSosCenterClick();

  const handleSosCenterClick = () => {
    addSosCenterClickMutation.mutate({
      isMain: true,
      platform: "client",
    });
    navigation.push("SOSCenter");
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.screen,
        backgroundColor
          ? { backgroundColor }
          : isBackgroundColorEnabled
            ? { backgroundColor: colors.background }
            : "",
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={"transparent"}
        translucent={Platform.OS === "android" ? true : false}
      />
      <View
        style={[
          styles.screenChildren,
          style,
          Platform.OS === "android" && { paddingBottom: bottomInset },
        ]}
      >
        {children}
        {hasEmergencyButton && (
          <ButtonOnlyIcon
            style={[
              styles.emergencyButton,
              Platform.OS === "android" && { bottom: 16 + bottomInset },
            ]}
            onPress={() => handleSosCenterClick()}
            color="red"
            iconColor={
              isHighContrast
                ? appStyles.colorRed_ed5657
                : appStyles.colorWhite_ff
            }
          />
        )}
      </View>

      {showBackgroundImage && (
        <Image
          source={backgroundImageSource}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}

      {hasHeaderNavigation ? (
        <HeaderNavigation
          t={t}
          navigation={navigation}
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            paddingTop:
              Platform.OS === "android"
                ? StatusBar.currentHeight + 7
                : topInset + 7,
          }}
          hasUnreadNotifications={hasUnreadNotifications}
          isTmpUser={isTmpUser}
          handleRegistrationModalOpen={handleRegistrationModalOpen}
          onPressNotifications={() => {
            setIsProfilePanelOpen(false);
            setIsNotificationsPanelOpen(true);
          }}
          onPressProfile={() => {
            setIsNotificationsPanelOpen(false);
            setIsProfilePanelOpen(true);
          }}
          onHeaderLayout={setHeaderNavLayoutHeight}
        />
      ) : null}
      {hasHeaderNavigation ? (
        <>
          <NotificationsDropdownPanel
            isOpen={isNotificationsPanelOpen}
            onClose={() => setIsNotificationsPanelOpen(false)}
            navigation={navigation}
            panelTop={headerNavLayoutHeight}
            openJoinConsultation={openJoinConsultation}
            openRequireDataAgreement={openRequireDataAgreement}
          />
          <ProfileMenuPanel
            isOpen={isProfilePanelOpen}
            onClose={() => setIsProfilePanelOpen(false)}
            navigation={navigation}
            panelTop={headerNavLayoutHeight}
          />
          <JoinConsultation
            isOpen={isJoinConsultationOpen}
            onClose={closeJoinConsultation}
            consultation={selectedConsultation}
          />
          <RequireDataAgreement
            isOpen={isRequireDataAgreementOpen}
            onClose={closeRequireDataAgreement}
          />
        </>
      ) : null}
      {outsideComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    position: "relative",
  },
  screenBackground: { backgroundColor: appStyles.colorWhite_ff },
  screenChildren: {
    flex: 1,
  },
  radialGradient: {
    position: "absolute",
    top: 0,
    left: -50,
    width: "50%",
    height: "50%",
    zIndex: -1,
  },
  emergencyButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 998,
    elevation: 998,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
  },
});
