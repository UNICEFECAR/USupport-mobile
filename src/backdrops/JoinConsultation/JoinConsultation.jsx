import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
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
  ButtonSelector,
  TransparentModal,
} from "#components";
import { showToast } from "../../utils/showToast";

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

  const requestCameraAndMic = useCallback(async () => {
    if (!isOpen) return;
    const cameraRes = await Camera.requestCameraPermissionsAsync();
    const micRes = await Camera.requestMicrophonePermissionsAsync();

    if (!cameraRes.granted || !micRes.granted) {
      setIsPermissionsModalOpen(true);
    } else {
      setIsPermissionsModalOpen(false);
    }

    hasCheckedPermissions.current = true;
  }, [isOpen]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      console.log(state, "state");
      console.log(appState.current, "appState");
      console.log(hasCheckedPermissions.current, "hasCheckedPermissions");

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

  const handleClick = async (redirectTo) => {
    try {
      // Navigate with appropriate settings
      navigation.navigate("Consultation", {
        consultation,
        videoOn: redirectTo === "video",
        microphoneOn: redirectTo === "video" || redirectTo === "audio",
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
          <ButtonSelector
            label={t("button_label_1")}
            iconName="video"
            style={styles.buttonSelector}
            onPress={() => handleClick("video")}
          />
          <ButtonSelector
            label={t("button_label_2")}
            iconName="comment"
            style={styles.buttonSelector}
            onPress={() => handleClick("chat")}
          />
        </View>
      </Backdrop>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  contentContainer: { paddingBottom: 16, alignItems: "center" },
  buttonSelector: { marginTop: 16 },
});
