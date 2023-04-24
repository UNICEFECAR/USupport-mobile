import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, Image } from "react-native";

import { TransparentModal, CustomCarousel, AppText } from "#components";

import { appStyles } from "#styles";

/**
 * HowItWorksMyQA
 *
 * The HowItWorksMyQA modal
 *
 * @return {jsx}
 */
export const HowItWorksMyQA = ({ isOpen, onClose }) => {
  const { t } = useTranslation("how-it-works-my-qa");
  const width = appStyles.screenWidth * 0.96;

  const slides = [
    {
      image: require("./assets/HowItWorks1Mobile.png"),
      text: t("subheading_1"),
    },
    {
      image: require("./assets/HowItWorks2Mobile.png"),
      text: t("subheading_2"),
    },
    {
      image: require("./assets/HowItWorks3Mobile.png"),
      text: t("subheading_3"),
    },
  ];

  const renderSlide = ({ item, index }) => (
    <View key={index} style={styles.slide}>
      <AppText namedStyle="text">{item.text}</AppText>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <TransparentModal
      heading={t("heading")}
      isOpen={isOpen}
      handleClose={onClose}
      scrollAnimationDuration={4000}
    >
      <View style={{ height: 480 }}>
        <CustomCarousel
          data={slides}
          renderItem={renderSlide}
          width={width}
          height={470}
        />
      </View>
    </TransparentModal>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: "96%",
    alignItems: "center",
  },
  image: {
    width: appStyles.screenWidth * 0.85,
    height: 400,
  },
});
