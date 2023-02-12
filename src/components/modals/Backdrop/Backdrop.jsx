import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { AppButton } from "../../buttons";
import { Loading } from "../../loaders/";

import { appStyles } from "#styles";

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
  style,
  heading,
  text,
  ctaLabel,
  ctaHandleClick,
  ctaStyle,
  closeBackdropOnCtaClick = false,
  isCtaDisabled,
  isSecondaryCtaDisabled,
  secondaryCtaLabel,
  secondaryCtaHandleClick,
  secondaryCtaType = "ghost",
  ctaColor = "green",
  secondaryCtaColor = "green",
  showLoadingIfDisabled = false,
  children,
  errorMessage,
  reference,
}) => {
  const hasButtons = ctaLabel || secondaryCtaLabel;
  const [isOverlayShown, setIsOverlayShown] = useState(false);
  const [buttonsContainerHeight, setButtonsContainerHeight] = useState(0);
  const { bottom: bottomInset } = useSafeAreaInsets();

  const backdropBottom = useSharedValue(appStyles.screenHeight);
  const backdropStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: backdropBottom.value }],
    };
  });

  useEffect(() => {
    if (isOpen) {
      setIsOverlayShown(true);
      backdropBottom.value = withSpring(0, appStyles.springConfig);
    } else {
      handleCloseBackdrop();
    }
  }, [isOpen]);

  const handleCloseBackdrop = () => {
    backdropBottom.value = withSpring(
      appStyles.screenHeight,
      appStyles.springConfig
    );
    setIsOverlayShown(false);
    onClose();
  };

  const handleClick = () => {
    ctaHandleClick();
    if (closeBackdropOnCtaClick) {
      handleCloseBackdrop();
    }
  };

  const Overlay = () => (
    <TouchableWithoutFeedback onPress={handleCloseBackdrop}>
      <View style={styles.overlay} />
    </TouchableWithoutFeedback>
  );
  return (
    <>
      {isOverlayShown ? <Overlay /> : null}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <View>
          <TouchableOpacity onPress={handleCloseBackdrop}>
            <Icon
              name="close-x"
              size="md"
              color={appStyles.colorPrimary_20809e}
              style={styles.icon}
            />
          </TouchableOpacity>
          <View style={styles.header}>
            <AppText namedStyle="h3" style={styles.headingText}>
              {heading}
            </AppText>
          </View>
          <View>
            <AppText style={styles.subheading}>{text}</AppText>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 32,
              paddingBottom: buttonsContainerHeight * 2,
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
        {hasButtons ? (
          <View
            style={[
              styles.buttonContainer,
              { bottom: -bottomInset, paddingBottom: bottomInset / 2 },
            ]}
            onLayout={({ nativeEvent }) => {
              const height = nativeEvent.layout.height;
              setButtonsContainerHeight(height);
            }}
          >
            {errorMessage ? <Error message={errorMessage} /> : null}
            {ctaLabel ? (
              isCtaDisabled && showLoadingIfDisabled ? (
                <Loading />
              ) : (
                <AppButton
                  label={ctaLabel}
                  disabled={isCtaDisabled}
                  onPress={handleClick}
                  color={ctaColor}
                  size="lg"
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
                <AppButton
                  label={secondaryCtaLabel}
                  onPress={secondaryCtaHandleClick}
                  disabled={isSecondaryCtaDisabled}
                  size="lg"
                  type={secondaryCtaType}
                  color={secondaryCtaColor}
                  style={styles.secondButton}
                />
              )
            ) : null}
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
    zIndex: 2,
    top: "-50%",
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 16,
    backgroundColor: appStyles.colorWhite_ff,
    // top: 0,
    bottom: 0,
    height: appStyles.screenHeight * 0.8,
    zIndex: 1001, // Put higher zIndex in order to show the backdrop above the emergency button
    position: "absolute",
    width: "100%",
  },
  content: {
    backgroundColor: "white",
    zIndex: 99,
  },
  header: {
    width: "90%",
  },
  headingText: {
    color: appStyles.colorBlue_3d527b,
    alignSelf: "center",
    fontFamily: appStyles.fontSemiBold,
  },
  subheading: {
    marginTop: 24,
    width: "100%",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 0,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignSelf: "center",
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
