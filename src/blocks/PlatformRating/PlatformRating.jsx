import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Block, Rating, Textarea, AppButton } from "#components";

/**
 * PlatformRating
 *
 * PlatformRating block
 *
 * @return {jsx}
 */
export const PlatformRating = ({ navigation }) => {
  const { t } = useTranslation("platform-rating");

  const [data, setData] = useState({
    rating: null,
    comment: "",
  });

  const handleSendRating = () => {
    console.log(`Rating sent: ${data.rating} - ${data.comment}`);
  };

  const handleChange = (field, value) => {
    const newData = { ...data };

    newData[field] = value;

    setData(newData);
  };

  const canContinue = data.rating === null;

  return (
    <Block style={styles.block}>
      <Rating
        label={t("rating_label")}
        setParentState={(value) => handleChange("rating", value)}
        style={[styles.marginTop32, styles.rating]}
      />
      <Textarea
        label={t("textarea_label")}
        placeholder={t("textarea_placeholder")}
        onChange={(value) => handleChange("comment", value)}
        style={styles.textarea}
      />
      <AppButton
        label={t("button_label")}
        size="lg"
        onPress={() => handleSendRating()}
        disabled={canContinue}
        style={styles.marginTop32}
      />
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { alignItems: "center" },
  marginTop32: {
    marginTop: 32,
  },
  rating: { alignSelf: "flex-start" },
  textarea: {
    marginTop: 24,
  },
});
