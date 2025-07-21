import { View, StyleSheet, Image, Pressable } from "react-native";
import Config from "react-native-config";

import { AppText } from "../../texts/AppText/AppText";
import { AppButton } from "../../buttons/AppButton/AppButton";
import { Icon } from "../../icons/Icon";
import { Like } from "../../icons/Like";

import { appStyles } from "#styles";

import { useGetTheme } from "#hooks";

const { AMAZON_S3_BUCKET } = Config;

/**
 * CardMedia
 *
 * CardMedia component to be used to display article details
 *
 * @return {jsx}
 */
export const CardMedia = ({
  image,
  title,
  creator,
  readingTime,
  description,
  categoryName,
  likes,
  dislikes,
  isLikedByUser,
  isDislikedByUser,
  onPress,
  contentType = "articles",
  t,
  style,
  isRead = false,
}) => {
  const { colors } = useGetTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        appStyles.shadow2,
        styles.cardMedia,
        {
          backgroundColor: colors.cardMedia,
          opacity: isRead ? 0.75 : 1,
        },
        style,
      ]}
    >
      <Image
        source={
          image
            ? { uri: image }
            : {
                uri: `${AMAZON_S3_BUCKET}/article-placeholder`,
              }
        }
        style={styles.image}
      />
      <View style={styles.categoryContainer}>
        <AppText namedStyle="smallText" style={styles.categoryText}>
          {categoryName}
        </AppText>
      </View>
      {isRead && (
        <View style={styles.readContainer}>
          <AppText namedStyle="smallText" style={styles.readText}>
            {t("read")}
          </AppText>
        </View>
      )}
      <View style={styles.textContainer}>
        <View style={styles.headingContainer}>
          <AppText namedStyle="h3">{title}</AppText>
          {contentType !== "articles" && (
            <Like
              likes={likes}
              isLiked={isLikedByUser}
              dislikes={dislikes}
              isDisliked={isDislikedByUser}
            />
          )}
        </View>
        {creator && (
          <View style={styles.creatorAndLikeContainer}>
            <View style={styles.creatorContainer}>
              <AppText namedStyle="smallText" style={styles.creatorText}>
                {t("by", { creator })}
              </AppText>
              <View style={styles.readingTime}>
                <Icon
                  size="sm"
                  name="time"
                  color="#66768d"
                  style={styles.icon}
                />
                <AppText namedStyle="smallText" style={styles.readingTimeText}>
                  {readingTime} {t("min_read")}
                </AppText>
              </View>
            </View>
            <View style={styles.likeContainer}>
              <Like
                likes={likes}
                isLiked={isLikedByUser}
                dislikes={dislikes}
                isDisliked={isDislikedByUser}
              />
            </View>
          </View>
        )}
        <View style={styles.descriptionContainer}>
          <AppText
            namedStyle="smallText"
            id="description"
            numberOfLines={2}
            style={styles.descriptionText}
          >
            {description}
          </AppText>
        </View>
        <AppButton
          type="ghost"
          label={t(contentType === "articles" ? "read_more" : "view_more")}
          size="sm"
          style={styles.readMoreButton}
          textStyle={styles.readMoreButtonText}
          onPress={onPress}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardMedia: {
    width: "96%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: appStyles.colorWhite_ff,
    ...appStyles.shadow2,
    borderWidth: 1,
    borderColor: "transparent",
    alignSelf: "center",
  },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryContainer: {
    backgroundColor: appStyles.colorWhite_ff,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 4,
    position: "absolute",
    top: 16,
    left: 16,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 160,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },
  textContainer: {
    padding: 16,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  creatorContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 8,
  },
  icon: { marginRight: 5 },
  readMoreButton: {
    marginTop: 16,
    paddingLeft: 0,
    alignItems: "flex-start",
  },
  readMoreButtonText: {
    color: "#6989a4",
    fontWeight: appStyles.fontSemiBold,
  },
  categoryText: {
    fontFamily: appStyles.fontBold,
    color: "#66768d",
  },
  creatorText: {
    color: "#66768d",
  },
  readingTimeText: {
    color: "#66768d",
  },
  descriptionText: {
    color: "#66768d",
  },
  likeContainer: {
    justifyContent: "flex-start",
  },
  creatorAndLikeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  readingTime: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  readContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: appStyles.colorGreen_7ec680,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 24,
  },
  readText: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorWhite_ff,
  },
});
