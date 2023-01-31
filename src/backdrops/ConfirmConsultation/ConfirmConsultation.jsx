import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, Image } from "react-native";

import { Backdrop, AppText } from "#components";
import { mascotHappyOrange } from "#assets";

/**
 * ConfirmConsultation
 *
 * The ConfirmConsultation backdrop
 *
 * @return {jsx}
 */
export const ConfirmConsultation = ({ isOpen, onClose, consultation }) => {
  const { t } = useTranslation("confirm-consultation");
  const navigation = useNavigation();

  const handleContinue = () => {
    onClose();
    navigation.navigate("Consultation");
  };

  const { startDate, endDate } = consultation;

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      ctaLabel={t("ctaLabel")}
      ctaHandleClick={handleContinue}
    >
      <View style={styles.contentContainer}>
        <Image source={mascotHappyOrange} style={styles.image} />
        <View style={styles.textContainer}>
          <AppText namedStyle="h3">{t("heading")}</AppText>
          <AppText style={styles.text}>
            {t("text", {
              startDate: startDate.getDate(),
              month: getMonthName(startDate),
              year: startDate.getFullYear(),
              startTime: getTimeAsString(startDate),
              endTime: getTimeAsString(endDate),
            })}
          </AppText>
        </View>
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: { width: "80%" },
  image: { width: 200, height: 159, marginBottom: 40 },
  text: { marginTop: 40 },
});
