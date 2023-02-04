import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Backdrop, ButtonSelector } from "#components";
import { userSvc } from "#services";

/**
 * JoinConsultation
 *
 * The JoinConsultation backdrop
 *
 * @return {jsx}
 */
export const JoinConsultation = ({ isOpen, onClose, consultation }) => {
  // const navigate = useNavigate();
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

      navigate("/consultation", {
        state: { consultation, videoOn: redirectTo === "video", token },
      });
    } catch {
      toast(t("error"), { type: "error" });
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
          onClick={() => handleClick("video")}
        />
        <ButtonSelector
          label={t("button_label_2")}
          iconName="comment"
          style={styles.buttonSelector}
          onClick={() => handleClick("chat")}
        />
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  contentContainer: { paddingBottom: 16, alignItems: "center" },
  buttonSelector: { marginTop: 16 },
});
