import React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("screens", {
    keyPrefix: "change-passcode-screen",
  });

  const { hasGoBackArrow } = route.params || true;

  const subheading = route.params.isRemove
    ? t("delete_subheading")
    : t("create_subheading");

  return (
    <Screen>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={subheading}
          handleGoBack={() => navigation.goBack()}
          hasGoBackArrow={hasGoBackArrow}
        />
      </Block>
      <ChangePasscodeBlock route={route} navigation={navigation} />
    </Screen>
  );
};
