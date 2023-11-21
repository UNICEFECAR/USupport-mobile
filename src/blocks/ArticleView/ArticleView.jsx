import React from "react";
import { View, StyleSheet, Image } from "react-native";
import Markdown from "react-native-markdown-display";

import { Icon, Label, Block, AppText } from "#components";
import { appStyles } from "#styles";
import articlePlaceholder from "#assets";
import { useGetTheme } from "#hooks";

/**
 * ArticleView
 *
 * ArticleView block
 *
 * @return {jsx}
 */
export const ArticleView = ({ articleData }) => {
  const { colors } = useGetTheme();

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
      </View>

      <Block style={styles.block}>
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

          <View style={styles.categoryContainer}>
            <AppText
              namedStyle="smallText"
              style={[styles.categoryText, { color: colors.text }]}
            >
              {articleData.categoryName}
            </AppText>
          </View>
        </View>

        <View style={styles.labelsContainer}>
          {articleData.labels.map((label, index) => {
            return <Label style={styles.label} text={label.name} key={index} />;
          })}
        </View>

        <Markdown
          style={{
            ...styles,
            heading3: {
              fontSize: 20,
              lineHeight: 24,
              fontFamily: "Nunito_600SemiBold",
              color: colors.text,
              marginTop: 20,
              marginBottom: 8,
            },
            heading4: {
              fontSize: 16,
              lineHeight: 24,
              fontFamily: "Nunito_600SemiBold",
              color: colors.text,
              marginTop: 12,
            },
            paragraph: {
              color: colors.textSecondary,
              fontSize: 16,
              fontFamily: "Nunito_400Regular",
              lineHeight: 24,
            },
            list_item: {
              color: colors.textSecondary,
              fontSize: 16,
              fontFamily: "Nunito_400Regular",
              lineHeight: 24,
            },
          }}
        >
          {articleData.body}
        </Markdown>
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  block: { paddingBottom: 40, paddingTop: 16 },
  imageContainer: { width: "100%", height: 264, position: "relative" },
  image: { flex: 1 },

  labelsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  label: { marginRight: 8, marginBottom: 8 },
  creatorContainer: { flexDirection: "row", marginVertical: 8 },
  iconTime: { marginLeft: 16, marginRight: 5 },
  categoryContainer: {
    marginLeft: 12,
    backgroundColor: appStyles.colorBlue_20809E_0_3,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 25,
    justifyContent: "center",
  },
  categoryText: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorBlue_3d527b,
  },
});
