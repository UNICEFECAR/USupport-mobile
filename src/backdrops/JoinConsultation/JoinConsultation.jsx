import React, { useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

import { Backdrop, ButtonSelector } from "#components";
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

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      if (Platform.OS === "ios") {
        const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
        const microphoneStatus = await check(PERMISSIONS.IOS.MICROPHONE);

        // If permissions not granted, request them
        if (
          cameraStatus !== RESULTS.GRANTED ||
          microphoneStatus !== RESULTS.GRANTED
        ) {
          await requestPermissions();
        }
      } else if (Platform.OS === "android") {
        const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA);
        const microphoneStatus = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);

        // If permissions not granted, request them
        if (
          cameraStatus !== RESULTS.GRANTED ||
          microphoneStatus !== RESULTS.GRANTED
        ) {
          await requestPermissions();
        }
      }
    };

    if (isOpen) {
      checkAndRequestPermissions();
    }
  }, [isOpen]);

  const checkCurrentPermissions = async () => {
    try {
      if (Platform.OS === "ios") {
        const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
        const microphoneStatus = await check(PERMISSIONS.IOS.MICROPHONE);

        return (
          cameraStatus === RESULTS.GRANTED &&
          microphoneStatus === RESULTS.GRANTED
        );
      } else if (Platform.OS === "android") {
        const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA);
        const microphoneStatus = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);

        return (
          cameraStatus === RESULTS.GRANTED &&
          microphoneStatus === RESULTS.GRANTED
        );
      }
    } catch (error) {
      console.error("Permission check error:", error);
      return false;
    }
    return false;
  };

  const requestPermissions = async () => {
    try {
      if (Platform.OS === "ios") {
        const cameraResult = await request(PERMISSIONS.IOS.CAMERA);
        const microphoneResult = await request(PERMISSIONS.IOS.MICROPHONE);

        const granted =
          cameraResult === RESULTS.GRANTED &&
          microphoneResult === RESULTS.GRANTED;

        if (!granted) {
          showToast({ message: t("permissions_error"), type: "error" });
        }

        return granted;
      } else if (Platform.OS === "android") {
        const cameraResult = await request(PERMISSIONS.ANDROID.CAMERA);
        const microphoneResult = await request(
          PERMISSIONS.ANDROID.RECORD_AUDIO
        );

        const granted =
          cameraResult === RESULTS.GRANTED &&
          microphoneResult === RESULTS.GRANTED;

        if (!granted) {
          showToast({ message: t("permissions_error"), type: "error" });
        }

        return granted;
      }
    } catch (error) {
      console.error("Permission request error:", error);
      showToast({ message: t("permissions_error"), type: "error" });
      return false;
    }
    return false;
  };

  const handleClick = async (redirectTo) => {
    try {
      // Check current permissions
      const hasPermissions = await checkCurrentPermissions();

      if (!hasPermissions) {
        // Try to request permissions again if they're not granted
        const permissionsGranted = await requestPermissions();
        if (!permissionsGranted) {
          // Permissions still not granted, don't navigate
          return;
        }
      }

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
  );
};

const styles = StyleSheet.create({
  contentContainer: { paddingBottom: 16, alignItems: "center" },
  buttonSelector: { marginTop: 16 },
});
