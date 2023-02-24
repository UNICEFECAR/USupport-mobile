import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import { Block, ButtonSelector, AppText, Toggle } from "#components";
import { localStorage } from "#services";
import { appStyles } from "#styles";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Passcode
 *
 * Passcode and Biometrics block
 *
 * @returns {JSX.Element}
 */
export const Passcode = ({ navigation }) => {
  const { t } = useTranslation("passcode");

  const [userPin, setUserPin] = useState(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useFocusEffect(() => {
    const checkBiometrics = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const biometrics = await localStorage.getItem("biometrics-enabled");
      const pinCode = await localStorage.getItem("pin-code");

      setCanUseBiometrics(hasHardware);
      setBiometricsEnabled(!pinCode ? false : !!biometrics);
      setUserPin(pinCode);
    };

    checkBiometrics();
  });

  const handleToggle = async () => {
    setBiometricsEnabled(!biometricsEnabled);

    if (biometricsEnabled) {
      await localStorage.removeItem("biometrics-enabled");
    } else {
      await localStorage.setItem("biometrics-enabled", "true");
    }
    if (!userPin) {
      navigation.push("ChangePasscode", { isRemove: false });
    }
  };

  const handleEditPasscode = (action) => {
    const isCreate = action === "create";
    const isRemove = action === "remove";
    const isChange = action === "edit";

    if (isCreate) {
      navigation.push("ChangePasscode", { isRemove: isRemove });
    } else if (isRemove) {
      navigation.push("ChangePasscode", {
        userPin: userPin,
        isRemove: isRemove,
      });
    } else if (isChange) {
      navigation.push("ChangePasscode", { userPin: userPin });
    }
  };

  return (
    <Block style={styles.block}>
      <AppText style={styles.label}>{t("passcode")}</AppText>
      {userPin ? (
        <>
          <ButtonSelector
            label={t("change_passcode")}
            style={styles.buttonSelector}
            onPress={() => handleEditPasscode("edit")}
          />
          <ButtonSelector
            label={t("delete_passcode")}
            style={[styles.buttonSelector, styles.marginTop10]}
            onPress={() => handleEditPasscode("remove")}
          />
        </>
      ) : (
        <ButtonSelector
          label={t("create_passcode")}
          style={styles.buttonSelector}
          onPress={() => handleEditPasscode("create")}
        />
      )}
      {canUseBiometrics ? (
        <View style={styles.biometricsContainer}>
          <AppText style={styles.label}>{t("biometrics")}</AppText>
          <Toggle isToggled={biometricsEnabled} handleToggle={handleToggle} />
        </View>
      ) : null}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { paddingTop: 32 },
  label: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontSemiBold,
  },
  buttonSelector: { marginTop: 4, alignSelf: "center" },
  biometricsContainer: {
    flexDirection: "row",
    paddingTop: 32,
    justifyContent: "space-between",
    alignItems: "center",
  },
  marginTop10: { marginTop: 10 },
});
