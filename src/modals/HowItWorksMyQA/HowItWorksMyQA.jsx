import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, Image } from "react-native";
import Config from "react-native-config";

import { TransparentModal, CustomCarousel, AppText } from "#components";

import { appStyles } from "#styles";

const { AMAZON_S3_BUCKET } = Config;

/**
 * HowItWorksMyQA
 *
 * The HowItWorksMyQA modal
 *
 * @return {jsx}
 */
export const HowItWorksMyQA = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation("modals", {
    keyPrefix: "how-it-works-my-qa",
  });
  const width = appStyles.screenWidth * 0.96;

  const slides = [
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-${i18n.language}-1`,
      text: t("subheading_1"),
    },
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-${i18n.language}-2`,
      text: t("subheading_2"),
    },
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-${i18n.language}-3`,
      text: t("subheading_3"),
    },
  ];

  console.log(slides);

  const renderSlide = ({ item, index }) => (
    <View key={index} style={styles.slide}>
      <AppText namedStyle="text">{item.text}</AppText>
      <Image
        source={{
          uri: item.image,
        }}
        style={styles.image}
        resizeMode="contain"
      />
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
    paddingHorizontal: 16,
  },
  image: {
    width: appStyles.screenWidth * 0.85,
    height: 400,
  },
});
