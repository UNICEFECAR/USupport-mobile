import {
  View,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  UIManager,
  Platform,
} from "react-native";
import { useMemo, useState, useCallback, useEffect } from "react";

import { AppText } from "../../texts/AppText/AppText";
import { Icon } from "../../icons/Icon";
import { Like } from "../../icons/Like";
import LinearGradient from "../../LinearGradient";
import { NewButton } from "../../buttons";
import { Label } from "../../labels";

import { appStyles } from "#styles";

import { useGetTheme, useEventListener } from "#hooks";
import { localStorage } from "#services";
import { getBrandingLogoUrl } from "#utils";

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
  countryCode: countryCodeProp,
}) => {
  const { colors, isHighContrast, isDarkMode } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const labelPaletteIndices = useMemo(() => {
    const count = labels?.length ?? 0;
    const paletteSize = 6;
    if (count <= 0) return [];

    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const base = Array.from({ length: paletteSize }, (_, i) => i);
    const out = [];
    let last = null;

    while (out.length < count) {
      let chunk = shuffle(base);
      if (last !== null && chunk[0] === last && chunk.length > 1) {
        [chunk[0], chunk[1]] = [chunk[1], chunk[0]];
      }
      for (let i = 0; i < chunk.length && out.length < count; i += 1) {
        out.push(chunk[i]);
        last = chunk[i];
      }
    }

    return out;
  }, [labels]);
  const canRenderExpoBlur = (() => {
    try {
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

  const categoryContainerStyle = useMemo(() => {
    if (isHighContrast) {
      return {
        backgroundColor: "rgba(0, 0, 0, 0.92)",
        borderColor: appStyles.colorHighContrast_ffff00,
      };
    }
    return null;
  }, [isHighContrast]);

  const categoryTextColor = isHighContrast
    ? appStyles.colorHighContrast_ffff00
    : styles.categoryText.color;

  const showPlayButton =
    (contentType === "videos" || contentType === "podcasts") && handlePlay;

  const handlePlayPress = (e) => {
    e.stopPropagation();
    if (handlePlay) {
      handlePlay();
    }
  };

  const [syncedCountry, setSyncedCountry] = useState("KZ");

  const loadCountry = useCallback(async () => {
    try {
      const c = await localStorage.getItem("country");
      setSyncedCountry(c || "KZ");
    } catch {
      setSyncedCountry("KZ");
    }
  }, []);

  useEffect(() => {
    loadCountry();
  }, [loadCountry]);

  useEventListener("countryChanged", loadCountry);

  const resolvedCountryForBranding =
    countryCodeProp !== undefined ? countryCodeProp : syncedCountry;

  const brandingFallbackUrl = useMemo(
    () =>
      getBrandingLogoUrl({
        isDarkMode,
        isHighContrast,
        countryCode: resolvedCountryForBranding,
      }),
    [isDarkMode, isHighContrast, resolvedCountryForBranding],
  );

  const isBrandingFallback = !image;
  const imageUri = image || brandingFallbackUrl;

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
                colors: ["rgba(30, 46, 86, 0.82)", "rgba(19, 32, 65, 0.78)"],
              }}
              style={styles.gradientSurface}
            />
            <View style={styles.insetHighlight} />
          </>
        )}

        <View
          style={[
            styles.imageContainer,
            isBrandingFallback && [
              styles.imageContainerBranding,
              {
                backgroundColor: isLightTheme
                  ? "rgba(245, 248, 255, 0.92)"
                  : "rgba(22, 36, 70, 0.55)",
                borderColor:
                  colors.cardMediaBorder || "rgba(137, 157, 209, 0.35)",
              },
            ],
          ]}
        >
          {(image || brandingFallbackUrl) && (
            <Image
              source={{ uri: imageUri }}
              style={
                isBrandingFallback ? styles.imageBrandingFallback : styles.image
              }
              resizeMode={isBrandingFallback ? "contain" : "cover"}
            />
          )}

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
          <View style={[styles.categoryContainer, categoryContainerStyle]}>
            <AppText
              namedStyle="smallText"
              isSemibold
              style={[styles.categoryText, { color: categoryTextColor }]}
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
                  paletteIndex={labelPaletteIndices[index] ?? index}
                  style={styles.labelChip}
                  textStyle={styles.labelChipText}
                  textProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}
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
                    color={
                      isLightTheme
                        ? appStyles.colorTextMain_0e202f
                        : appStyles.colorTextMain_ededed
                    }
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
  imageContainerBranding: {
    minHeight: 160,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  image: {
    width: "100%",
    height: 160,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },
  imageBrandingFallback: {
    width: "100%",
    height: 80,
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
    backgroundColor: "rgba(209, 231, 250, 0.95)",
    borderColor: "rgba(60, 109, 159, 0.45)",
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
    borderRadius: 4,
    paddingHorizontal: 16,
    minHeight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  labelChipText: {
    includeFontPadding: false,
    textAlignVertical: "center",
    lineHeight: 12,
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
    includeFontPadding: false,
    textAlignVertical: "center",
    color: "#234567",
    fontSize: 14,
    lineHeight: 14,
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
    top: -18,
    right: 16,
    backgroundColor: appStyles.colorGreen_7ec680,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: "center",
    zIndex: 3,
  },
  readText: {
    fontFamily: appStyles.fontSemiBold,
    color: appStyles.colorWhite_ff,
  },
});
