import React from "react";
import { View } from "react-native";
import { useTranslation, Trans } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

import { Backdrop, ButtonSelector, AppText } from "#components";

/**
 * EmergencySituation
 *
 * The EmergencySituation backdrop
 *
 * @return {jsx}
 */
export const EmergencySituation = ({ isOpen, onClose }) => {
  const { t } = useTranslation("backdrops", {
    keyPrefix: "emergency-situation",
  });

  const navigation = useNavigation();

  return (
    <Backdrop
      title="EmergencySituation"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      headerStyles={{ paddingLeft: 0 }}
    >
      <AppText>{t("paragraph")}</AppText>
      <AppText>
        <Trans
          i18nKey="emergency-situation.paragraph_two"
          ns="backdrops"
          components={[<AppText isBold key="0" />]}
        />
      </AppText>
      <AppText namedStyle="h3" style={{ textAlign: "left", marginTop: 12 }}>
        {t("question")}
      </AppText>
      <AppText style={{ marginTop: 2 }}>{t("subquestion")}</AppText>
      <View style={{ flexGrow: 1, alignItems: "center" }}>
        <ButtonSelector
          style={{ marginBottom: 18, marginTop: 24 }}
          label={t("yes")}
          onPress={() => navigation.navigate("SOSCenter")}
        />
        <ButtonSelector
          style={{ marginBottom: 18 }}
          label={t("no")}
          onPress={() =>
            navigation.navigate("ChildrenRights", { start: "non-emergency" })
          }
        />
        <ButtonSelector
          style={{ marginBottom: 200 }}
          label={t("dont_know")}
          onPress={() =>
            navigation.navigate("ChildrenRights", { start: "non-emergency" })
          }
        />
      </View>
    </Backdrop>
  );
};
