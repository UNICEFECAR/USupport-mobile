import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import Markdown from "react-native-markdown-display";

import { Icon, Label, Block, AppText } from "#components";

import { appStyles } from "#styles";

import articlePlaceholder from "#assets";

/**
 * ArticleView
 *
 * ArticleView block
 *
 * @return {jsx}
 */
export const ArticleView = ({ articleData, navigation }) => {
  return (
    <>
      <View style={styles.imageContainer}>
        <Image
          source={
            articleData.imageMedium
              ? { uri: articleData.imageMedium }
              : articlePlaceholder
          }
          style={styles.image}
        />
        <TouchableOpacity
          style={styles.goBackIconContainer}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-chevron-back"
            color={appStyles.colorPrimary_20809e}
          />
        </TouchableOpacity>
      </View>

      <Block style={styles.block}>
        <View style={styles.labelsContainer}>
          {articleData.labels.map((label, index) => {
            return <Label style={styles.label} text={label.name} key={index} />;
          })}
        </View>
        <AppText namedStyle="h3" style={styles.articleTitleText}>
          {articleData.title}
        </AppText>

        <View style={styles.creatorContainer}>
          <AppText namedStyle="smallText">By {articleData.creator}</AppText>
          <Icon
            size="sm"
            name="time"
            color={appStyles.colorGray_66768d}
            style={styles.iconTime}
          />
          <AppText namedStyle="smallText">
            {articleData.readingTime} min read
          </AppText>
        </View>

        <Markdown style={styles}>{articleData.body}</Markdown>
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  block: { paddingBottom: 40 },
  imageContainer: { width: "100%", height: 264, position: "relative" },
  image: { flex: 1 },
  goBackIconContainer: { position: "absolute", top: 20, left: 20 },
  labelsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 16,
  },
  label: { margin: 4 },
  creatorContainer: { flexDirection: "row", marginVertical: 16 },
  iconTime: { marginLeft: 16, marginRight: 5 },

  heading3: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: "Nunito_600SemiBold",
    color: appStyles.colorBlue_3d527b,
    marginTop: 20,
    marginBottom: 8,
  },
  heading4: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Nunito_600SemiBold",
    color: appStyles.colorBlue_3d527b,
  },
  paragraph: {
    color: appStyles.colorGray_66768d,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    lineHeight: 24,
  },
});
