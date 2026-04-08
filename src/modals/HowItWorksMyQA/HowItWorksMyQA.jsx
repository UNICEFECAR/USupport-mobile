import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, Image } from "react-native";

import { TransparentModal, CustomCarousel, AppText } from "#components";

import { appStyles } from "#styles";

const SLIDE_IMAGES_BY_LANG = {
  en: [
    require("./assets/how-it-works-1-en-mobile.png"),
    require("./assets/how-it-works-2-en-mobile.png"),
    require("./assets/how-it-works-3-en-mobile.png"),
  ],
  pl: [
    require("./assets/how-it-works-1-pl-mobile.png"),
    require("./assets/how-it-works-2-pl-mobile.png"),
    require("./assets/how-it-works-3-pl-mobile.png"),
  ],
  kk: [
    require("./assets/how-it-works-1-kz-mobile.png"),
    require("./assets/how-it-works-2-kz-mobile.png"),
    require("./assets/how-it-works-3-kz-mobile.png"),
  ],
  kz: [
    require("./assets/how-it-works-1-kz-mobile.png"),
    require("./assets/how-it-works-2-kz-mobile.png"),
    require("./assets/how-it-works-3-kz-mobile.png"),
  ],
  uk: [
    require("./assets/how-it-works-1-uk-mobile.png"),
    require("./assets/how-it-works-2-uk-mobile.png"),
    require("./assets/how-it-works-3-uk-mobile.png"),
  ],
  ua: [
    require("./assets/how-it-works-1-uk-mobile.png"),
    require("./assets/how-it-works-2-uk-mobile.png"),
    require("./assets/how-it-works-3-uk-mobile.png"),
  ],
  ru: [
    require("./assets/how-it-works-1-ru-mobile.png"),
    require("./assets/how-it-works-2-ru-mobile.png"),
    require("./assets/how-it-works-3-ru-mobile.png"),
  ],
};

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
  const lang = i18n.language || "en";
  const images = SLIDE_IMAGES_BY_LANG[lang] || SLIDE_IMAGES_BY_LANG.en;

  const slides = [
    {
      image: images[0],
      text: t("subheading_1"),
    },
    {
      image: images[1],
      text: t("subheading_2"),
    },
    {
      image: images[2],
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
    paddingHorizontal: 16,
  },
  image: {
    width: appStyles.screenWidth * 0.85,
    height: 400,
  },
});
