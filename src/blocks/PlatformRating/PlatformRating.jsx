import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useAddPlatformRating } from "#hooks";

import { Block, Rating, Textarea, AppButton } from "#components";
import { showToast } from "../../utils/showToast";

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
    rating: 5,
    comment: "",
  });

  const onSuccess = () => {
    showToast({
      message: t("rating_success"),
    });
    setData({
      rating: 5,
      comment: "",
    });
  };
  const onError = () => {
    showToast({
      message: t("rating_error"),
      type: "error",
    });
  };
  const addPlatformRatingMutation = useAddPlatformRating(onSuccess, onError);
  const handleSendRating = () => {
    addPlatformRatingMutation.mutate(data);
  };

  const handleChange = (field, value) => {
    const newData = { ...data };

    newData[field] = value;

    setData(newData);
  };

  const canContinue = data.rating === null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={50}
    >
      <ScrollView
        contentContainerStyle={{
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        <Block style={styles.block}>
          <View>
            <Rating
              label={t("rating_label")}
              setParentState={(value) => handleChange("rating", value)}
              style={[styles.marginTop32, styles.rating]}
            />
            <Textarea
              label={t("textarea_label")}
              placeholder={t("textarea_placeholder")}
              value={data.comment}
              onChange={(value) => handleChange("comment", value)}
              style={styles.textarea}
            />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              width: "100%",
              paddingBottom: 40,
            }}
          >
            <AppButton
              label={t("button_label")}
              size="lg"
              onPress={() => handleSendRating()}
              disabled={canContinue || addPlatformRatingMutation.isLoading}
              style={[styles.marginTop32]}
            />
          </View>
        </Block>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  block: {
    // alignItems: "center",
    // justifyContent: "space-between",
    flex: 1,
  },
  marginTop32: {
    marginTop: 32,
  },
  rating: { alignSelf: "flex-start" },
  textarea: {
    marginTop: 24,
    width: "98%",
    // marginHorizontal: 20,
  },
});
