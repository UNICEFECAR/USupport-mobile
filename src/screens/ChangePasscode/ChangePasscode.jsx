import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Screen, Block, Heading } from "#components";
import { ChangePasscode as ChangePasscodeBlock } from "#blocks";

/**
 * ChangePasscode
 *
 * ChangePasscode screen
 *
 * @returns {JSX.Element}
 */
export const ChangePasscode = ({ navigation, route }) => {
  const { t } = useTranslation("change-passcode-screen");

  const { hasGoBackArrow } = route.params || true;

  const subheading = route.params.isRemove
    ? t("delete_subheading")
    : t("create_subheading");

  return (
    <Screen>
      <Heading
        heading={t("heading")}
        subheading={subheading}
        handleGoBack={() => navigation.goBack()}
        hasGoBackArrow={hasGoBackArrow}
      />
      <Block></Block>
      <ChangePasscodeBlock route={route} navigation={navigation} />
    </Screen>
  );
};

const styles = StyleSheet.create({});
