import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as LocalAuthentication from "expo-local-authentication";
import { useFocusEffect } from "@react-navigation/native";

import { Block, Heading, AppButton } from "#components";
import { localStorage } from "#services";

export const SetUpBiometrics = ({ navigation }) => {
  const { t } = useTranslation("set-up-biometrics");

  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  useFocusEffect(() => {
    const checkBiometrics = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      setCanUseBiometrics(hasHardware);
    };

    checkBiometrics();
  });

  const handleBtnPress = async () => {
    if (canUseBiometrics) {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (isEnrolled) {
        handleFaceId();
      }
    }
  };

  const handleFaceId = () => {
    LocalAuthentication.authenticateAsync({
      disableDeviceFallback: true,
      cancelLabel: "Cancel",
    }).then((result) => {
      if (result.success) {
        localStorage.setItem("biometrics-enabled", "true");
        navigation.navigate("ChangePasscode", { hasGoBackArrow: false });
      }
    });
  };

  const handleSkip = () => {
    localStorage.removeItem("token");
    navigation.navigate("TabNavigation");
  };

  return (
    <Block style={{ flex: 1 }}>
      <Heading
        heading={t("heading")}
        hasGoBackArrow={false}
        subheading={t("subheading")}
      />
      <AppButton
        label={t("btn_label")}
        onPress={handleBtnPress}
        style={{ marginTop: "auto", marginBottom: 6 }}
        size="lg"
      />
      <AppButton
        label={t("btn_skip")}
        onPress={handleSkip}
        size="lg"
        type={"ghost"}
      />
    </Block>
  );
};
