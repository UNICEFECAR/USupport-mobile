import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

import { Backdrop, ButtonSelector } from "#components";
import { userSvc, messageSvc } from "#services";
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
  const { t } = useTranslation("join-consultation");

  const handleClick = async (redirectTo) => {
    const sytemMessage = {
      type: "system",
      content: t("client_joined"),
      time: JSON.stringify(new Date().getTime()),
    };

    const systemMessagePromise = messageSvc.sendMessage({
      message: sytemMessage,
      chatId: consultation.chatId,
    });

    const getConsultationTokenPromise = userSvc.getTwilioToken(
      consultation.consultationId
    );

    try {
      const result = await Promise.all([
        systemMessagePromise,
        getConsultationTokenPromise,
      ]);
      const token = result[1].data.token;

      navigation.navigate("Consultation", {
        consultation,
        videoOn: redirectTo === "video",
        token,
      });
    } catch (err) {
      console.log(err);
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
