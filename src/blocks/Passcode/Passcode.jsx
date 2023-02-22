import React, { useState } from "react";
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

  const [hasPasscode, setHasPasscode] = useState(false);

  const userPin = null; //TODO: get user pin from the API

  const handleToggle = () => {
    if (!hasPasscode) {
      navigation.push("ChangePasscode", { isRemove: false });
    }

    //TODO: add biometrics functionality
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
      <View style={styles.biometricsContainer}>
        <AppText style={styles.label}>{t("biometrics")}</AppText>
        <Toggle isToggled={hasPasscode} handleToggle={handleToggle} />
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
  marginTop10: { marginTop: 10 },
});
