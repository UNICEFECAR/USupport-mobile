import {
  View,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  UIManager,
  Platform,
} from "react-native";
import Config from "react-native-config";

import { AppText } from "../../texts/AppText/AppText";
import { Icon } from "../../icons/Icon";
import { Like } from "../../icons/Like";
import LinearGradient from "../../LinearGradient";
import { NewButton } from "../../buttons";
import { Label } from "../../labels";

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
  labels = [],
  showLabels = true,
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
  const isLightTheme = colors.background === appStyles.colorWhite_ff;
  const canRenderExpoBlur = (() => {
    try {
      // expo-blur requires a native view manager registered as `ExpoBlurView`.
      // If the dev client hasn't been rebuilt with expo-blur, this will be missing.
      return !!UIManager.getViewManagerConfig?.("ExpoBlurView");
    } catch (e) {
      return false;
    }
  })();

  const shouldRenderBlur =
    !isHighContrast && Platform.OS !== "web" && canRenderExpoBlur;
  const BlurViewComponent = shouldRenderBlur
    ? // eslint-disable-next-line global-require
      require("expo-blur").BlurView
    : null;

  const grayTextColor = isHighContrast
    ? colors.textSecondary
    : appStyles.colorGray_66768d;
  const metaTextColor = colors.cardMediaMetaText || grayTextColor;
  const linkTextColor = isHighContrast
    ? colors.text
    : appStyles.colorBlue_6989a4;

  const showPlayButton =
    (contentType === "videos" || contentType === "podcasts") && handlePlay;

  const handlePlayPress = (e) => {
    e.stopPropagation();
    if (handlePlay) {
      handlePlay();
    }
  };

  const cardContainerStyle = [
    styles.cardMediaOuter,
    isLightTheme
      ? appStyles.cardMediaShadowLight
      : appStyles.cardMediaShadowDark,

    style,
  ];

  return (
    <Pressable onPress={onPress} style={cardContainerStyle}>
      {isRead && (
        <View style={styles.readContainer}>
          <AppText namedStyle="text" style={styles.readText}>
            {t("read")}
          </AppText>
        </View>
      )}

      <View
        style={[
          styles.cardMediaSurface,
          {
            backgroundColor: isLightTheme
              ? shouldRenderBlur
                ? "transparent"
                : colors.cardMedia
              : "transparent",
            borderColor: colors.cardMediaBorder || "transparent",
          },
        ]}
      >
        {shouldRenderBlur && BlurViewComponent && (
          <>
            <BlurViewComponent
              style={styles.blurSurface}
              intensity={70}
              tint="default"
              blurReductionFactor={2}
              pointerEvents="none"
            />
            <View
              style={[
                styles.blurTintOverlay,
                { backgroundColor: colors.cardMedia },
              ]}
              pointerEvents="none"
            />
          </>
        )}
        {!isLightTheme && (
          <>
            <LinearGradient
              gradient={{
                degrees: 145,
                locations: [0, 1],
                // Without real `backdrop-filter` blur we lower the alpha
                // so the content behind the card still reads through.
                colors: [
                  // Match web `glass_panel_background` (client-ui CardMedia)
                  "rgba(30, 46, 86, 0.82)",
                  "rgba(19, 32, 65, 0.78)",
                ],
              }}
              style={styles.gradientSurface}
            />
            <View style={styles.insetHighlight} />
          </>
        )}

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

        {!!categoryName && (
          <View
            style={[
              styles.categoryContainer,
              {
                backgroundColor: colors.cardMediaCategoryBg,
                borderColor: colors.cardMediaCategoryBorder,
              },
            ]}
          >
            <AppText
              namedStyle="smallText"
              isSemibold
              style={[
                styles.categoryText,
                { color: colors.cardMediaCategoryText },
              ]}
            >
              {categoryName}
            </AppText>
          </View>
        )}

        <View style={styles.textContainer}>
          {showLabels && labels?.length > 0 && (
            <View style={styles.labelsContainer}>
              {labels.map((label, index) => (
                <Label
                  key={label.id ?? index}
                  text={label.name}
                  paletteIndex={index}
                  style={styles.labelChip}
                />
              ))}
            </View>
          )}

          <View style={styles.headingContainer}>
            <AppText namedStyle="h3" style={styles.titleText}>
              {title}
            </AppText>
          </View>

          {creator && (
            <View style={styles.creatorAndReadingTimeRow}>
              <AppText
                namedStyle="text"
                numberOfLines={1}
                style={[styles.creatorText, { color: metaTextColor }]}
              >
                {t("by", { creator })}
              </AppText>

              {readingTime && (
                <View style={styles.readingTime}>
                  <Icon
                    size="sm"
                    name="time"
                    color={metaTextColor}
                    style={styles.icon}
                  />
                  <AppText
                    namedStyle="text"
                    numberOfLines={1}
                    style={[styles.readingTimeText, { color: metaTextColor }]}
                  >
                    {readingTime} {t("min_read")}
                  </AppText>
                </View>
              )}
            </View>
          )}
          <View style={styles.descriptionContainer}>
            <AppText
              namedStyle="text"
              id="description"
              numberOfLines={2}
              style={[styles.descriptionText, { color: colors.text }]}
            >
              {description}
            </AppText>
          </View>

          <View
            style={[
              styles.bottomContainer,
              { borderTopColor: colors.cardMediaSeparator },
            ]}
          >
            <NewButton
              label={t(contentType === "articles" ? "read_more" : "view_more")}
              onPress={onPress}
              style={styles.readMoreButton}
            />

            <Like
              likes={likes}
              isLiked={isLikedByUser}
              dislikes={dislikes}
              isDisliked={isDislikedByUser}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardMediaOuter: {
    width: "96%",
    maxWidth: 420,
    alignSelf: "center",
    position: "relative",
    borderRadius: 24,
    overflow: "visible",
  },
  cardMediaSurface: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
    position: "relative",
  },
  blurSurface: {
    ...StyleSheet.absoluteFillObject,
  },
  blurTintOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientSurface: {
    ...StyleSheet.absoluteFillObject,
  },
  insetHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,

    zIndex: 2,
  },
  imageContainer: {
    position: "relative",
    zIndex: 3,
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
    position: "absolute",
    top: 20,
    left: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
    elevation: 4,
  },
  textContainer: {
    padding: 16,
    flex: 1,
  },
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
    marginBottom: 8,
  },
  labelChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  creatorAndReadingTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    minWidth: 0,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 2,
  },
  readMoreButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignSelf: "flex-start",
  },
  icon: {
    marginRight: 5,
  },
  readMoreButtonText: {
    color: appStyles.colorBlue_6989a4,
    fontWeight: appStyles.fontSemiBold,
    textDecorationLine: "underline",
  },
  categoryText: {
    // Better vertical centering across iOS + Android (custom fonts can sit low)
    includeFontPadding: false,
    textAlignVertical: "center",
    fontSize: 12,
    lineHeight: 18,
  },
  creatorText: {
    color: "#66768d",
    flexShrink: 1,
    minWidth: 0,
  },
  readingTimeText: {
    color: "#66768d",
    flexShrink: 0,
  },
  descriptionText: {
    color: "#66768d",
  },
  readingTime: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    minWidth: 0,
  },
  readContainer: {
    position: "absolute",
    top: -13,
    right: 16,
    backgroundColor: appStyles.colorGreen_7ec680,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    textAlign: "center",
    zIndex: 3,
  },
  readText: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorWhite_ff,
  },
});
