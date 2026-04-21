import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";

import { AppText } from "../../texts/AppText";
import { Icon } from "../../icons/Icon";
import { NewButton } from "../../buttons/NewButton/NewButton";
import LinearGradient from "../../LinearGradient";
import { useGetTheme } from "#hooks";
import { notFoundTransparent } from "#assets";
import { appStyles } from "#styles";

const ICON_ACCENT = "#20809e";

/**
 * NotFoundCard
 *
 * Mobile version of the web NotFoundCard (simple / illustrated).
 *
 * @return {JSX.Element}
 */
export const NotFoundCard = ({
  mode,
  iconName,
  title,
  subtitle,
  radialColor,
  headingText,
  descriptionLine1,
  descriptionLine2,
  primaryLabel,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
  imageSrc,
  imageAlt, // kept for API parity (RN Image uses accessibilityLabel)
  isRtl,
  style,
}) => {
  const { colors, isDarkMode } = useGetTheme();
  const { width } = useWindowDimensions();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const iconColor = isDarkMode ? "#54cfd9" : ICON_ACCENT;

  const isWide = width >= 768;
  const illustration = imageSrc || notFoundTransparent;

  const surfaceStyle = useMemo(() => {
    if (isDarkMode) {
      return {
        backgroundColor: "transparent",
        borderColor: colors.cardMediaBorder || "rgba(255,255,255,0.08)",
      };
    }
    return {
      backgroundColor: colors.cardMedia || "rgba(255, 255, 255, 0.95)",
      borderColor: colors.cardMediaBorder || "rgba(224, 233, 255, 0.70)",
    };
  }, [colors.cardMedia, colors.cardMediaBorder, isDarkMode]);

  const iconWrapStyle = useMemo(() => {
    if (isDarkMode) {
      return {
        backgroundColor: "transparent",
        borderColor: colors.cardMediaBorder || "rgba(255,255,255,0.08)",
      };
    }
    return {
      backgroundColor: "rgba(209, 231, 250, 0.88)",
      borderColor: "rgba(224, 233, 255, 0.85)",
    };
  }, [colors.cardMediaBorder, isDarkMode]);

  // NOTE: radial glow removed for mobile parity (requested).

  if (mode === "illustrated") {
    return (
      <View style={[styles.root, isRtl && styles.rootRtl, style]}>
        <View
          style={[
            styles.cardOuter,
            isLightTheme
              ? appStyles.cardMediaShadowLight
              : appStyles.cardMediaShadowDark,
          ]}
        >
          <View style={[styles.cardSurface, surfaceStyle]}>
            {!isDarkMode ? null : (
              <>
                <LinearGradient
                  gradient={{
                    degrees: 145,
                    locations: [0, 1],
                    colors: colors.cardMediaGradient,
                  }}
                  style={styles.darkGradientSurface}
                />
                {/* Match CardMedia dark glass background */}
                <View style={styles.darkInsetHighlight} pointerEvents="none" />
              </>
            )}
            <View
              style={[
                styles.cardIllustrated,
                isWide && styles.cardIllustratedWide,
              ]}
            >
              <View style={[styles.media, isWide && styles.mediaWide]}>
                <Image
                  source={illustration}
                  accessibilityLabel={imageAlt || ""}
                  style={[styles.image, isWide && styles.imageWide]}
                  resizeMode="contain"
                />
              </View>

              <View style={[styles.body, isWide && styles.bodyWide]}>
                {!!headingText && (
                  <AppText namedStyle="h3" style={styles.heading}>
                    {headingText}
                  </AppText>
                )}
                {!!descriptionLine1 && (
                  <AppText
                    style={[styles.line, { color: colors.text, opacity: 0.88 }]}
                  >
                    {descriptionLine1}
                  </AppText>
                )}
                {!!descriptionLine2 && (
                  <AppText
                    style={[styles.line, { color: colors.text, opacity: 0.88 }]}
                  >
                    {descriptionLine2}
                  </AppText>
                )}

                {(primaryLabel || secondaryLabel) && (
                  <View style={styles.actions}>
                    {primaryLabel && onPrimaryClick ? (
                      <NewButton
                        type="solid"
                        size="md"
                        label={primaryLabel}
                        onPress={onPrimaryClick}
                        style={styles.actionBtn}
                      />
                    ) : null}
                    {secondaryLabel && onSecondaryClick ? (
                      <NewButton
                        type="outline"
                        size="md"
                        label={secondaryLabel}
                        onPress={onSecondaryClick}
                        style={styles.actionBtn}
                      />
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      <View
        style={[
          styles.cardOuter,
          isLightTheme
            ? appStyles.cardMediaShadowLight
            : appStyles.cardMediaShadowDark,
        ]}
      >
        <View style={[styles.cardSurface, styles.cardSimple, surfaceStyle]}>
          {!isDarkMode ? null : (
            <>
              <LinearGradient
                gradient={{
                  degrees: 145,
                  locations: [0, 1],
                  colors: colors.cardMediaGradient,
                }}
                style={styles.darkGradientSurface}
              />
              {/* Match CardMedia dark glass background */}
              <View style={styles.darkInsetHighlight} pointerEvents="none" />
            </>
          )}
          <View style={[styles.iconWrap, iconWrapStyle]}>
            <Icon name={iconName} size="xl" color={iconColor} />
          </View>
          {!!title && (
            <AppText namedStyle="h3" style={styles.title}>
              {title}
            </AppText>
          )}
          {!!subtitle && (
            <AppText
              style={[styles.subtitle, { color: colors.text, opacity: 0.82 }]}
            >
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
};

NotFoundCard.propTypes = {
  mode: PropTypes.oneOf(["simple", "illustrated"]),
  iconName: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  radialColor: PropTypes.oneOf(["blue", "purple"]),
  headingText: PropTypes.string,
  descriptionLine1: PropTypes.string,
  descriptionLine2: PropTypes.string,
  primaryLabel: PropTypes.string,
  secondaryLabel: PropTypes.string,
  onPrimaryClick: PropTypes.func,
  onSecondaryClick: PropTypes.func,
  imageSrc: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  imageAlt: PropTypes.string,
  isRtl: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

NotFoundCard.defaultProps = {
  mode: "simple",
  iconName: "search",
  title: "",
  subtitle: "",
  radialColor: "blue",
  headingText: "",
  descriptionLine1: "",
  descriptionLine2: "",
  primaryLabel: "",
  secondaryLabel: "",
  onPrimaryClick: undefined,
  onSecondaryClick: undefined,
  imageSrc: undefined,
  imageAlt: "",
  isRtl: false,
  style: undefined,
};

const styles = StyleSheet.create({
  root: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 16,
    overflow: "hidden",
  },
  rootRtl: {
    direction: "rtl",
  },
  cardOuter: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    overflow: "visible",
  },
  cardSurface: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  cardSimple: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  title: { textAlign: "center", lineHeight: 27 },
  subtitle: { textAlign: "center", marginTop: 6 },
  cardIllustrated: {
    flexDirection: "column",
  },
  cardIllustratedWide: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 220,
  },
  media: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  mediaWide: {
    width: "42%",
    maxWidth: 380,
    paddingVertical: 24,
    paddingLeft: 32,
    paddingRight: 16,
  },
  image: {
    width: "100%",
    maxWidth: 280,
    height: 170,
  },
  imageWide: { maxWidth: undefined },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  bodyWide: {
    paddingTop: 32,
    paddingRight: 40,
    paddingLeft: 24,
    paddingBottom: 32,
  },
  heading: { marginBottom: 12, textAlign: "left" },
  line: { marginTop: 0, marginBottom: 8, textAlign: "left" },
  actions: { marginTop: 16, width: "100%" },
  actionBtn: { width: "100%", marginTop: 12, minWidth: undefined },
  darkInsetHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    zIndex: 2,
  },
  darkGradientSurface: {
    ...StyleSheet.absoluteFillObject,
  },
});
