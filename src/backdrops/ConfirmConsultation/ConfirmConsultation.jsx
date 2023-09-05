import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, Image } from "react-native";

import { Backdrop, AppText } from "#components";
import { mascotHappyOrange } from "#assets";

import { getMonthName, getTimeAsString } from "#utils";

/**
 * ConfirmConsultation
 *
 * The ConfirmConsultation backdrop
 *
 * @return {jsx}
 */
export const ConfirmConsultation = ({
  isOpen,
  onClose,
  consultation,
  customMascotImage,
  customHeading,
  customDescription,
  customButtonLabel,
  ctaStyle,
}) => {
  const { t } = useTranslation("confirm-consultation");
  const navigation = useNavigation();

  const handleContinue = () => {
    onClose();
    navigation.navigate("TabNavigation", { screen: "Consultations" });
  };

  const { startDate, endDate } = consultation;

  const getMonthNameString = (date) => {
    let monthNameString = t(getMonthName(date).toLowerCase())
    return monthNameString;
  }

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      ctaLabel={customButtonLabel || t("ctaLabel")}
      ctaHandleClick={handleContinue}
      ctaStyle={ctaStyle}
    >
      <View style={styles.contentContainer}>
        <Image
          source={customMascotImage || mascotHappyOrange}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <AppText namedStyle="h3">{customHeading || t("heading")}</AppText>
          <AppText style={styles.text}>
            {customDescription ||
              t("text", {
                startDate: startDate.getDate(),
                month: getMonthNameString(startDate),
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
  image: { width: 200, height: 159, marginBottom: 40, resizeMode: "contain" },
  text: { marginTop: 40 },
});
