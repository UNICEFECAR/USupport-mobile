import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Config from "react-native-config";

import { TransparentModal, CustomCarousel, AppText, CachedImage } from "#components";

import { appStyles } from "#styles";

const { AMAZON_S3_BUCKET } = Config;

/**
 * HowItWorksBA
 *
 * The HowItWorksBA modal
 *
 * @return {jsx}
 */
export const HowItWorksBA = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation("modals", {
    keyPrefix: "how-it-works-ba",
  });
  const width = appStyles.screenWidth * 0.96;

  const slides = [
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-ba-${i18n.language}-1`,
      text: t("subheading_1"),
    },
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-ba-${i18n.language}-2`,
      text: t("subheading_2"),
    },
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-ba-${i18n.language}-3`,
      text: t("subheading_3"),
    },
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-ba-${i18n.language}-4`,
      text: t("subheading_4"),
    },
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-ba-${i18n.language}-5`,
      text: t("subheading_5"),
    },
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-ba-${i18n.language}-6`,
      text: t("subheading_6"),
    },
    {
      image: `${AMAZON_S3_BUCKET}/how-it-works-ba-${i18n.language}-7`,
      text: t("subheading_7"),
    },
  ];

  const renderSlide = ({ item, index }) => (
    <View key={index} style={styles.slide}>
      <AppText namedStyle="text">{item.text}</AppText>
      <CachedImage
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
      scrollableBody={false}
    >
      <View style={styles.carouselContainer}>
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
  carouselContainer: {
    height: 480,
  },
  image: {
    height: 400,
    width: appStyles.screenWidth * 0.85,
  },
  slide: {
    alignItems: "center",
    paddingHorizontal: 16,
    width: "96%",
  },
});
