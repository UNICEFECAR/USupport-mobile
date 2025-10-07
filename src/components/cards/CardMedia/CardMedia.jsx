import {
  View,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
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
  handlePlay,
  contentType = "articles",
  t,
  style,
  isRead = false,
}) => {
  const { colors, isHighContrast } = useGetTheme();

  const grayTextColor = isHighContrast
    ? colors.textSecondary
    : appStyles.colorGray_66768d;
  const linkTextColor = isHighContrast ? colors.text : "#6989a4";

  const showPlayButton =
    (contentType === "videos" || contentType === "podcasts") && handlePlay;

  const handlePlayPress = (e) => {
    e.stopPropagation();
    if (handlePlay) {
      handlePlay();
    }
  };

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
      <View style={styles.imageContainer}>
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

        {showPlayButton && (
          <TouchableOpacity
            style={styles.playButtonOverlay}
            onPress={handlePlayPress}
            activeOpacity={0.8}
          >
            <View style={styles.playButton}>
              <Icon name={"play"} size="lg" color="white" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={[
          styles.categoryContainer,
          isHighContrast && styles.categoryContainerHC,
        ]}
      >
        <AppText
          namedStyle="smallText"
          style={[styles.categoryText, { color: grayTextColor }]}
        >
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
          <AppText namedStyle="h3" style={styles.titleText}>
            {title}
          </AppText>
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
              <AppText
                namedStyle="smallText"
                style={[styles.creatorText, { color: grayTextColor }]}
              >
                {t("by", { creator })}
              </AppText>
              {readingTime && (
                <View style={styles.readingTime}>
                  <Icon
                    size="sm"
                    name="time"
                    color={grayTextColor}
                    style={styles.icon}
                  />
                  <AppText
                    namedStyle="smallText"
                    style={[styles.readingTimeText, { color: grayTextColor }]}
                  >
                    {readingTime} {t("min_read")}
                  </AppText>
                </View>
              )}
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
            style={[styles.descriptionText, { color: grayTextColor }]}
          >
            {description}
          </AppText>
        </View>
        <AppButton
          type="ghost"
          label={t(contentType === "articles" ? "read_more" : "view_more")}
          size="sm"
          style={styles.readMoreButton}
          textStyle={[styles.readMoreButtonText, { color: linkTextColor }]}
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
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 160,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
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
    zIndex: 2,
  },
  categoryContainerHC: {
    backgroundColor: appStyles.colorBlack_1e,
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
    flex: 1,
  },
  readMoreButton: {
    paddingLeft: 0,
    alignItems: "flex-start",
    flex: 1,
  },
  icon: {
    marginRight: 5,
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
    alignItems: "flex-start",
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
    zIndex: 2,
  },
  readText: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorWhite_ff,
  },
});
