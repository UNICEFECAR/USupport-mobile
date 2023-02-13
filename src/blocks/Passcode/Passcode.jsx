import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Block, ButtonSelector, AppText, Toggle } from "#components";
import { appStyles } from "#styles";

/**
 * Passcode
 *
 * Passcode and Biometrics block
 *
 * @returns {JSX.Element}
 */
export const Passcode = ({ navigation }) => {
  const { t } = useTranslation("passcode");

  const handleChangePasscode = () => {
    navigation.navigate("ChangePasscode");
  };

  return (
    <Block style={styles.block}>
      <AppText style={styles.label}>{t("passcode")}</AppText>
      <ButtonSelector
        label={t("change_passcode")}
        style={styles.buttonSelector}
        onPress={handleChangePasscode}
      />
      <View style={styles.biometricsContainer}>
        <AppText style={styles.label}>{t("biometrics")}</AppText>
        <Toggle />
      </View>
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
});
