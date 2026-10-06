import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Modal,
  Linking,
  AppState,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
// import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

import { Camera, PermissionStatus } from "expo-camera";

import {
  AppText,
  AppButton,
  Backdrop,
  Icon,
  TransparentModal,
} from "#components";

import { useAddCountryEvent, useError, useGetTheme } from "#hooks";
import { appStyles } from "#styles";
import { providerSvc } from "#services";
import { showToast } from "../../utils/showToast";
import { Loading } from "../../components/loaders";

// Each way of joining has its own accent, the same in both themes
const JOIN_OPTIONS = [
  {
    redirectTo: "video",
    iconName: "video",
    labelKey: "button_label_1",
    descriptionKey: "button_description_1",
    tint: "rgba(124, 58, 237, 0.18)",
    iconColorLight: "#7c3aed",
    iconColorDark: "#b9a3ff",
  },
  {
    redirectTo: "chat",
    iconName: "comment",
    labelKey: "button_label_2",
    descriptionKey: "button_description_2",
    tint: "rgba(32, 128, 158, 0.2)",
    iconColorLight: appStyles.colorPrimary_20809e,
    iconColorDark: "#7fd0e6",
  },
];

const JoinOption = ({ option, isJoining, isDisabled, onPress, t }) => {
  const { colors, isDarkMode } = useGetTheme();
  const iconColor = isDarkMode ? option.iconColorDark : option.iconColorLight;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isJoining}
      accessibilityRole="button"
      accessibilityState={{ busy: isJoining, disabled: isDisabled }}
      style={[
        styles.option,
        {
          backgroundColor: isDarkMode
            ? "rgba(255, 255, 255, 0.06)"
            : appStyles.colorWhite_ff,
          borderColor: isJoining
            ? colors.tabUnderlinedBorder
            : isDarkMode
              ? "rgba(255, 255, 255, 0.08)"
              : colors.inputBorder,
        },
        isDisabled && styles.optionDisabled,
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: option.tint }]}>
        <Icon name={option.iconName} size="md" color={iconColor} />
      </View>
      <View style={styles.optionText}>
        <AppText isSemibold>{t(option.labelKey)}</AppText>
        <AppText
          namedStyle="smallText"
          style={{ color: colors.textSecondary }}
        >
          {isJoining ? t("joining") : t(option.descriptionKey)}
        </AppText>
      </View>
      {isJoining ? (
        <ActivityIndicator color={colors.tabUnderlinedBorder} />
      ) : (
        <Icon
          name="arrow-chevron-forward"
          size="md"
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
};

/**
 * JoinConsultation
 *
 * The JoinConsultation backdrop
 *
 * @return {jsx}
 */
export const JoinConsultation = ({ isOpen, onClose, consultation }) => {
  const navigation = useNavigation();
  const { t } = useTranslation("backdrops", { keyPrefix: "join-consultation" });
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const appState = useRef("active");
  const hasCheckedPermissions = useRef(false);
  const addCountryEventMutation = useAddCountryEvent();

  const [permissionsStatus, setPermissionsStatus] = useState({
    camera: undefined,
    microphone: undefined,
  });

  const requestCameraAndMic = useCallback(async () => {
    if (!isOpen) return;
    const cameraRes = await Camera.requestCameraPermissionsAsync();
    const micRes = await Camera.requestMicrophonePermissionsAsync();

    
setPermissionsStatus({
        camera: cameraRes.granted,
        microphone: micRes.granted,
      });
    hasCheckedPermissions.current = true;
  }, [isOpen]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {

      appState.current = state;
      if (state === "active" && hasCheckedPermissions.current) {
        requestCameraAndMic();
      }
    });
    if (isOpen) {
      requestCameraAndMic();
    }

    return () => {
      subscription.remove();
    };
  }, [isOpen]);

  const isJoiningRef = useRef(false);
  // The option being joined, shown with a spinner while the request is in progress
  const [joiningOption, setJoiningOption] = useState(null);

  const handleClick = async (redirectTo) => {
    if (permissionsStatus.camera === undefined || permissionsStatus.microphone === undefined) {
      return;
    }
    if (isJoiningRef.current) return;
    isJoiningRef.current = true;
    setJoiningOption(redirectTo);

    addCountryEventMutation.mutate({
      eventType: "mobile_join_consultation_click",
    });

    // Join first, so the client enters the consultation only once joining actually succeeded
    try {
      await providerSvc.joinConsultation({
        consultationId: consultation.consultationId,
        userType: "client",
      });
    } catch (err) {
      console.error("Failed to join consultation", {
        consultationId: consultation.consultationId,
        status: err?.response?.status,
        error: err?.response?.data?.error || err?.message,
      });
      // The backend sends a translated reason, e.g. that the consultation is no longer scheduled
      const errorMessage = err?.response ? useError(err)?.message : null;
      showToast({ message: errorMessage || t("error"), type: "error" });
      isJoiningRef.current = false;
      setJoiningOption(null);
      return;
    }
    isJoiningRef.current = false;
    setJoiningOption(null);

    try {
      // Navigate with appropriate settings
      navigation.navigate("Consultation", {
        consultation,
        videoOn: redirectTo === "video" && permissionsStatus.camera,
        microphoneOn: (redirectTo === "video" || redirectTo === "audio") && permissionsStatus.microphone,
        cameraGranted: permissionsStatus.camera,
        microphoneGranted: permissionsStatus.microphone,
      });
    } catch (err) {
      console.error("Navigation error:", err);
      showToast({ message: t("error"), type: "error" });
    }

    onClose();
  };


  return (
    <React.Fragment>
      <TransparentModal
        isOpen={isPermissionsModalOpen}
        handleClose={() => {
          setIsPermissionsModalOpen(false);
          onClose();
        }}
        heading={t("permissions_error")}
        text={t("permissions_error_subheading")}
      >
        <AppText>{t("permissions_error")}</AppText>
        <AppText>{t("permissions_error_subheading")}</AppText>
        <AppButton
          label={t("open_settings")}
          onPress={() => {
            Linking.openSettings();
          }}
          style={{ marginTop: 16 }}
        />
      </TransparentModal>

      <Backdrop
        title="JoinConsultation"
        isOpen={isOpen}
        onClose={onClose}
        heading={t("heading")}
        text={t("subheading")}
        style={styles.backdrop}
      >
        <View style={styles.contentContainer}>
          {JOIN_OPTIONS.map((option) => (
            <JoinOption
              key={option.redirectTo}
              option={option}
              isJoining={joiningOption === option.redirectTo}
              isDisabled={!!joiningOption && joiningOption !== option.redirectTo}
              onPress={() => handleClick(option.redirectTo)}
              t={t}
            />
          ))}
        </View>
      </Backdrop>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  contentContainer: { paddingBottom: 16, gap: 12, paddingTop: 8 },
  option: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  optionText: {
    flex: 1,
  },
});
