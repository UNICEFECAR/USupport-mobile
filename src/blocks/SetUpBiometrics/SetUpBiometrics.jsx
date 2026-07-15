import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as LocalAuthentication from "expo-local-authentication";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Block, Heading, NewButton } from "#components";
import { localStorage } from "#services";

export const SetUpBiometrics = ({ navigation, goBackOnSkip, mandatory = false }) => {
  const { t } = useTranslation("blocks", { keyPrefix: "set-up-biometrics" });
  const { bottom: bottomInset } = useSafeAreaInsets();
  const bottomPadding = Math.max(bottomInset, 16);

  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  useFocusEffect(() => {
    const checkBiometrics = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      setCanUseBiometrics(hasHardware);
    };

    checkBiometrics();
  });

  const handleBtnPress = async () => {
    if (!canUseBiometrics) {
      navigation.navigate("ChangePasscode", {
        hasGoBackArrow: false,
        mandatory,
      });
      return;
    }

    if (canUseBiometrics) {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (isEnrolled) {
        handleFaceId();
      } else {
        navigation.navigate("ChangePasscode", {
          hasGoBackArrow: false,
          mandatory,
        });
      }
    }
  };

  const handleFaceId = () => {
    LocalAuthentication.authenticateAsync({
      disableDeviceFallback: true,
      cancelLabel: "Cancel",
    }).then(async (result) => {
      if (result.success) {
        await localStorage.setItem("biometrics-enabled", "true");
        navigation.navigate("ChangePasscode", {
          hasGoBackArrow: false,
          mandatory,
        });
      }
    });
  };

  const handleSkip = async () => {
    if (mandatory) return;

    await localStorage.setItem("has-declined-biometrics", "true");

    if (goBackOnSkip) {
      navigation.goBack();
    } else {
      navigation.navigate("TabNavigation");
    }
  };

  return (
    <Block style={{ flex: 1, paddingBottom: bottomPadding }}>
      <Heading
        heading={t("heading")}
        hasGoBackArrow={false}
        subheading={mandatory ? t("subheading_mandatory") : t("subheading")}
      />
      <NewButton
        label={t("btn_label")}
        onPress={handleBtnPress}
        style={{ marginTop: "auto" }}
        size="lg"
      />
      {!mandatory ? (
        <NewButton
          label={t("btn_skip")}
          onPress={handleSkip}
          size="lg"
          type="ghost"
          style={{ marginTop: 16 }}
        />
      ) : null}
    </Block>
  );
};
