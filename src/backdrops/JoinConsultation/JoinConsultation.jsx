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

import { useAddCountryEvent } from "#hooks";
import { providerSvc } from "#services";
import { showToast } from "../../utils/showToast";
import { Loading } from "../../components/loaders";

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

  const handleClick = async (redirectTo) => {
    if (permissionsStatus.camera === undefined || permissionsStatus.microphone === undefined) {
      return;
    }

    addCountryEventMutation.mutate({
      eventType: "mobile_join_consultation_click",
    });

    await providerSvc
      .joinConsultation({
        consultationId: consultation.consultationId,
        userType: "client",
      })
      .catch((err) => {
        console.log("Error sending join consultation request", err);
      });

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
