import React from "react";
import { useTranslation } from "react-i18next";
import Share from "react-native-share";
import { Linking, StyleSheet } from "react-native";

import { Block, AppButton } from "#components";

/**
 * SharePlatform
 *
 * SharePlatform block
 *
 * @return {jsx}
 */
export const SharePlatform = ({}) => {
  const { t } = useTranslation("share-platform");

  const shareToFacebook = async () => {
    const shareOptions = {
      social: Share.Social.FACEBOOK,
      message: "Example message",
      url: "https://www.staging.usupport.online",
    };
    try {
      const ShareResponse = await Share.shareSingle(shareOptions);
    } catch (error) {
      console.log("Error =>", error);
    }
  };

  const shareToTelegram = async () => {
    const shareOptions = {
      social: Share.Social.TELEGRAM,
      message: "Example message",
      url: "https://www.staging.usupport.online",
    };
    try {
      const url =
        "tg://msg_url?url=https://www.staging.usupport.online&text=Download uSupport app";
      Linking.openURL(url);
    } catch (error) {
      console.log("Error =>", error);
    }
  };

  //TODO: Add share to VKontakte

  return (
    <Block style={styles.block}>
      <AppButton
        label={t("button_label_share_text") + " " + "Facebook"}
        size="lg"
        type="secondary"
        onPress={shareToFacebook}
        style={styles.marginTop32}
      />
      <AppButton
        label={t("button_label_share_text") + " " + "Telegram"}
        size="lg"
        type="secondary"
        onPress={shareToTelegram}
        style={styles.marginTop16}
      />
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { alignItems: "center", paddingBottom: 64 },
  marginTop32: {
    marginTop: 32,
  },
  marginTop16: {
    marginTop: 16,
  },
});
