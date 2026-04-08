import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { NewButton } from "../../buttons";
import { Loading } from "../../loaders/";
import { Error } from "../../errors/";
import { appStyles } from "#styles";
import { useKeyboard } from "../../../hooks/useKeyboard";
import { useGetTheme } from "#hooks";

/**
 * Backdrop
 *
 * Backdrop component
 *
 * @return {jsx}
 */
export const Backdrop = ({
  isOpen,
  onClose,
  disableOverlayClose = false,
  overlayVariant = "default",
  style,
  topHeaderComponent,
  topHeaderStyles,
  hasGoBackArrow = false,
  handleGoBack,
  hasHeader = true,
  hasCloseIcon = true,
  heading,
  text,
  ctaLabel,
  ctaHandleClick,
  ctaStyle,
  closeBackdropOnCtaClick = false,
  isCtaDisabled,
  isCtaLoading,
  isSecondaryCtaDisabled,
  isSecondaryCtaLoading,
  secondaryCtaLabel,
  secondaryCtaHandleClick,
  secondaryCtaType = "ghost",
  secondaryCtaStyle,
  ctaColor = "green",
  scrollViewStyle,
  secondaryCtaColor = "green",
  showLoadingIfDisabled = false,
  children,
  errorMessage,
  customRender = false,
  hasKeyboardListener = false,
  handleCloseIconPress,
  headerStyles,
  footerComponent,
  overlayStyles,
  handleShowKeyboard,
  handleHideKeyboard,
  isInVideoTherapy = false,
  setKeyboardHeight,
}) => {
  const { colors } = useGetTheme();
  const hasButtons = ctaLabel || secondaryCtaLabel;
  const [isOverlayShown, setIsOverlayShown] = useState(false);
  const [buttonsContainerHeight, setButtonsContainerHeight] = useState(0);
  const { bottom: bottomInset } = useSafeAreaInsets();

  const isClosing = useRef(false);
  const [shrinkBackdrop, setShrinkBackdrop] = useState(false);

  const backdropBottom = useSharedValue(appStyles.screenHeight);
  const backdropStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: backdropBottom.value }],
    };
  });

  const onShowKeyboard = (height) => {
    if (Platform.OS === "ios") {
      backdropBottom.value = withSpring(-height + 24, appStyles.springConfig);
    }
    if (isInVideoTherapy) {
      handleShowKeyboard();
      setShrinkBackdrop(true);
    }
  };
  const onHideKeyboard = () => {
    if (Platform.OS === "ios" && !isClosing.current) {
      backdropBottom.value = withSpring(0, appStyles.springConfig);
    }
    if (isInVideoTherapy) {
      handleHideKeyboard();
      setShrinkBackdrop(false);
    }
  };
  const keyboardHeight = useKeyboard(
    hasKeyboardListener,
    onShowKeyboard,
    onHideKeyboard
  );

  useEffect(() => {
    if (keyboardHeight) {
      setKeyboardHeight(keyboardHeight);
    }
  }, [keyboardHeight]);

  useEffect(() => {
    if (isOpen) {
      isClosing.current = false;
      setIsOverlayShown(true);
      backdropBottom.value = withSpring(0, appStyles.springConfig);
    } else {
      Keyboard.dismiss();
      handleCloseBackdrop();
    }
  }, [isOpen]);

  const handleCloseBackdrop = () => {
    isClosing.current = true;
    setIsOverlayShown(false);
    backdropBottom.value = withSpring(
      appStyles.screenHeight,
      appStyles.springConfig
    );
    setTimeout(() => {
      onClose();
    });
  };

  const handleClick = () => {
    ctaHandleClick();
    if (closeBackdropOnCtaClick) {
      handleCloseBackdrop();
    }
  };

  const handleCustomClose = () => {
    handleCloseBackdrop();
    handleCloseIconPress();
  };

  const toNewButtonType = (type) => {
    switch (type) {
      case "primary":
        return "gradient";
      case "secondary":
        return "outline";
      default:
        return type;
    }
  };

  const overlayContent =
    overlayVariant === "auth" ? (
      <>
        <BlurView
          intensity={18}
          tint="dark"
          style={[StyleSheet.absoluteFill, styles.authOverlay]}
        />
        <View style={[styles.overlay, styles.authOverlay, overlayStyles]} />
      </>
    ) : (
      <View style={[styles.overlay, overlayStyles]} />
    );

  const Overlay = () =>
    disableOverlayClose ? (
      overlayContent
    ) : (
      <TouchableWithoutFeedback onPress={handleCloseBackdrop}>
        {overlayContent}
      </TouchableWithoutFeedback>
    );
  return (
    <>
      {isOverlayShown ? <Overlay /> : null}
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: colors.background },
          Platform.OS === "android" && {
            paddingBottom: bottomInset + 6,
          },
          backdropStyle,
          style,
          shrinkBackdrop ? { height: appStyles.screenHeight * 0.3 } : {},
        ]}
      >
        {customRender ? (
          children
        ) : (
          <>
            {topHeaderComponent ? (
              <View style={[styles.topHeader, topHeaderStyles]}>
                {topHeaderComponent}
              </View>
            ) : null}

            {hasGoBackArrow ? (
              <TouchableOpacity
                onPress={handleGoBack}
                hitSlop={appStyles.hitSlop}
                style={styles.goBackRow}
              >
                <Icon
                  name="arrow-chevron-back"
                  size="md"
                  color={appStyles.colorPrimary_20809e}
                  style={styles.goBackIcon}
                />
              </TouchableOpacity>
            ) : null}

            {hasHeader ? (
              <View>
                {hasCloseIcon ? (
                  <TouchableOpacity
                    hitSlop={appStyles.hitSlop}
                    style={{
                      zIndex: 999,
                    }}
                    onPress={
                      handleCloseIconPress
                        ? handleCustomClose
                        : handleCloseBackdrop
                    }
                  >
                    <Icon
                      name="close-x"
                      size="md"
                      color={appStyles.colorPrimary_20809e}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                ) : null}

                {heading ? (
                  <View style={[styles.header, headerStyles]}>
                    <AppText namedStyle="h3" style={styles.headingText}>
                      {heading}
                    </AppText>
                  </View>
                ) : null}

                {text ? (
                  <View>
                    <AppText style={styles.subheading}>{text}</AppText>
                  </View>
                ) : heading ? (
                  <View style={{ height: 10 }} />
                ) : null}
              </View>
            ) : null}

            <ScrollView
              contentContainerStyle={[
                styles.scrollView,
                {
                  paddingBottom: hasButtons
                    ? buttonsContainerHeight * 2
                    : 32 + bottomInset,
                },
                scrollViewStyle,
              ]}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </>
        )}
        {hasButtons ? (
          <View
            style={[
              styles.buttonContainer,
              { backgroundColor: colors.background },
              overlayVariant === "auth" ? styles.buttonContainerAuth : null,
              {
                bottom: 0,
                paddingBottom:
                  bottomInset === 0
                    ? 24
                    : Platform.OS === "android"
                      ? bottomInset
                      : bottomInset / 2,
              },
            ]}
            onLayout={({ nativeEvent }) => {
              const height = nativeEvent.layout.height;
              setButtonsContainerHeight(height);
            }}
          >
            {errorMessage ? (
              <Error style={{ marginBottom: 6 }} message={errorMessage} />
            ) : null}
            {ctaLabel ? (
              isCtaDisabled && showLoadingIfDisabled ? (
                <Loading />
              ) : (
                <NewButton
                  label={ctaLabel}
                  disabled={isCtaDisabled || isCtaLoading}
                  loading={isCtaLoading}
                  onPress={handleClick}
                  type={toNewButtonType("primary")}
                  size="lg"
                  isFullWidth
                  style={ctaStyle}
                />
              )
            ) : null}
            {secondaryCtaLabel ? (
              isSecondaryCtaDisabled && showLoadingIfDisabled ? (
                <View style={styles.secondButtonLoadingContainer}>
                  <Loading />
                </View>
              ) : (
                <NewButton
                  label={secondaryCtaLabel}
                  onPress={secondaryCtaHandleClick}
                  disabled={isSecondaryCtaDisabled || isSecondaryCtaLoading}
                  loading={isSecondaryCtaLoading}
                  size="lg"
                  type={toNewButtonType(secondaryCtaType)}
                  isFullWidth
                  style={[styles.secondButton, secondaryCtaStyle]}
                />
              )
            ) : null}
            {footerComponent}
          </View>
        ) : null}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    height: appStyles.screenHeight,
    backgroundColor: appStyles.overlay,
    position: "absolute",
    zIndex: 5,
    left: 0,
    right: 0,
    bottom: 0,
  },
  authOverlay: {
    backgroundColor: "rgba(18, 18, 24, 0.55)",
  },
  backdrop: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 16,
    bottom: 0,
    height: appStyles.screenHeight * 0.8,
    zIndex: 999, // Put higher zIndex in order to show the backdrop above the emergency button
    elevation: 999,
    position: "absolute",
    width: "100%",
  },
  content: {
    backgroundColor: "white",
    zIndex: 99,
  },
  header: {
    width: "100%",
    paddingLeft: 30,
    paddingRight: 30,
  },
  headingText: {
    alignSelf: "center",
    fontFamily: appStyles.fontSemiBold,
    // marginRight: "-10%",
  },
  subheading: {
    marginTop: 24,
    width: "100%",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 0,
    zIndex: 999,
  },
  scrollView: {
    flexGrow: 1,
    paddingTop: 32,
  },
  topHeader: {
    width: "100%",
  },
  goBackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    alignSelf: "flex-start",
  },
  goBackIcon: {
    marginRight: 8,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    position: "absolute",
    width: "100%",
    alignSelf: "center",
  },
  buttonContainerAuth: {
    paddingHorizontal: 16,
  },
  secondButton: {
    marginTop: 16,
  },
  secondButtonLoadingContainer: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});

Backdrop.propTypes = {
  /**
   * Is the backdrop/modal open
   */
  isOpen: PropTypes.bool.isRequired,

  /**
   * Function to be called when the backdrop/modal is closed
   */
  onClose: PropTypes.func.isRequired,

  /**
   * If true, tapping the dimmed overlay won't close the backdrop.
   */
  disableOverlayClose: PropTypes.bool,

  /**
   * Controls overlay look. "auth" matches client-ui auth overlay.
   */
  overlayVariant: PropTypes.oneOf(["default", "auth"]),

  /**
   * Optional component to render as a full-width header above the modal content.
   * Mirrors client-ui Backdrop's `topHeaderComponent`.
   */
  topHeaderComponent: PropTypes.node,

  /**
   * Optional styles for the top header wrapper.
   */
  topHeaderStyles: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Whether to show a go-back arrow row.
   */
  hasGoBackArrow: PropTypes.bool,

  /**
   * Handler for the go-back action when `hasGoBackArrow` is true.
   */
  handleGoBack: PropTypes.func,

  /**
   * Whether to render the standard header area (close icon + heading/text).
   */
  hasHeader: PropTypes.bool,

  /**
   * Whether to show the close icon (when `hasHeader` is true).
   */
  hasCloseIcon: PropTypes.bool,

  /**
   * Additional styles for the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Heading of the backdrop/modal
   */
  heading: PropTypes.string,

  /**
   * Label of the CTA button
   * */
  ctaLabel: PropTypes.string,

  /**
   * Function to be called when the CTA button is clicked
   * */
  ctaHandleClick: PropTypes.func,

  /**
   * If the CTA button is disabled
   */
  isCtaDisabled: PropTypes.bool,

  /**
   * If the secondary CTA button is disabled
   */
  isSecondaryCtaDisabled: PropTypes.bool,

  /**
   * If true and the CTA button is disabled, a loading spinner will be shown instead
   */
  showLoadingIfDisabled: PropTypes.bool,

  /**
   * Label of the secondary CTA button
   */
  secondaryCtaLabel: PropTypes.string,

  /**
   * Function to be called when the secondary CTA button is clicked
   */
  secondaryCtaHandleClick: PropTypes.func,

  /**
   * Type of the secondary CTA button
   */
  secondaryCtaType: PropTypes.oneOf([
    "primary",
    "secondary",
    "ghost",
    "text",
    "link",
  ]),

  /**
   * Error message to be displayed
   */
  errorMessage: PropTypes.string,

  /**
   * Children to be rendered in the backdrop/modal
   */
  children: PropTypes.node,
};
