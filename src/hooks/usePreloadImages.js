import { useEffect } from "react";
import Config from "react-native-config";
import { Image } from "expo-image";

const { AMAZON_S3_BUCKET } = Config;

export function usePreloadImages() {
  useEffect(() => {
    const images = [
      `${AMAZON_S3_BUCKET}/logo-horizontal-app`,
      `${AMAZON_S3_BUCKET}/logo-horizontal-dark-app`,
      `${AMAZON_S3_BUCKET}/logo-horizontal-ro-app`,
      `${AMAZON_S3_BUCKET}/logo-horizontal-ro-dark-app`,
      `${AMAZON_S3_BUCKET}/page-hero-new`,
      `${AMAZON_S3_BUCKET}/page-tablet-hero`,
      `${AMAZON_S3_BUCKET}/information-portal-mobile`,
      `${AMAZON_S3_BUCKET}/information-portal-ps-mobile`,
      `${AMAZON_S3_BUCKET}/information-portal-ps-mobile-dark`,
      `${AMAZON_S3_BUCKET}/my-qa-mobile`,
      `${AMAZON_S3_BUCKET}/mascot-happy-blue`,
      `${AMAZON_S3_BUCKET}/mascot-happy-orange`,
      `${AMAZON_S3_BUCKET}/mascot-happy-purple-full`,
      `${AMAZON_S3_BUCKET}/logo-vertical`,
      `${AMAZON_S3_BUCKET}/logo-vertical-dark`,
      `${AMAZON_S3_BUCKET}/logo-vertical-ro`,
    ];

    Image.prefetch(images);
  }, []);
}
