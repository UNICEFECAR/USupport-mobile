import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";

import { AppText } from "../texts";
import { Icon } from "../icons";
import { NewButton } from "../buttons/NewButton/NewButton";
import { Error } from "../errors/Error";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

/** Matches web base-modal: max-width 61.6rem, min-width 34.3rem (at 10px/rem) */
const MODAL_MAX_WIDTH = 616;
const MODAL_MIN_WIDTH = 343;

/**
 * Map legacy AppButton `secondaryCtaType` to NewButton `type` (web Modal secondary is outline).
 */
function getSecondaryNewButtonType(secondaryCtaType) {
  if (secondaryCtaType === "ghost") return "ghost";
  if (secondaryCtaType === "primary") return "solid";
  return "outline";
}

/**
 * Mobile counterpart to client-ui `Modal` / `.base-modal` (see modal.scss).
 */
export function TransparentModal({
  heading,
  text,
  hasCloseIcon = true,
  children,
  handleClose,
  ctaLabel,
  ctaHandleClick,
  isCtaDisabled = false,
  secondaryCtaLabel,
  secondaryCtaHandleClick,
  isSecondaryCtaDisabled = false,
  isCtaLoading = false,
  secondaryCtaType,
  isOpen,
  errorMessage,
  style,
}) {
  const { width: windowWidth } = useWindowDimensions();
  const { isDarkMode, isHighContrast, colors } = useGetTheme();

  const hasFooter = !!(ctaLabel || secondaryCtaLabel);
  const showErrorInFooter = hasFooter && !!errorMessage;
  const showErrorInBody = !hasFooter && !!errorMessage;

  /** Horizontal inset from safeAreaView padding (matches web margin on overlay). */
  const cardWidth = Math.min(MODAL_MAX_WIDTH, windowWidth - 32);

  const modalBg = isHighContrast
    ? appStyles.colorBlack_37
    : isDarkMode
      ? appStyles.colorBlack_37
      : appStyles.colorWhite_ff;

  const headingColor = isHighContrast
    ? appStyles.colorHighContrast_ffff00
    : isDarkMode
      ? appStyles.color_blue_c1d7e0
      : colors.text;

  /** Intro `text` prop: inherits like web `.text.base-modal__text` */
  const introTextColor = isHighContrast
    ? appStyles.colorHighContrast_ffff00
    : isDarkMode
      ? appStyles.color_blue_c1d7e0
      : colors.text;

  const closeIconColor = isHighContrast
    ? appStyles.colorHighContrast_ffff00
    : isDarkMode
      ? appStyles.color_blue_c1d7e0
      : appStyles.colorBlue_263238;

  const footerBorderColor = colors.cardMediaSeparator ?? appStyles.colorGray_ea;

  return (
    <Modal transparent visible={isOpen}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.wrapper}>
          <SafeAreaView style={styles.safeAreaView}>
            <StatusBar
              barStyle={
                isDarkMode || isHighContrast ? "light-content" : "dark-content"
              }
              backgroundColor="transparent"
              translucent={Platform.OS === "android"}
            />
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.content,
                  {
                    backgroundColor: modalBg,
                    width: cardWidth,
                    maxWidth: MODAL_MAX_WIDTH,
                    minWidth: Math.min(MODAL_MIN_WIDTH, windowWidth - 32),
                  },
                  style,
                ]}
              >
                {heading ? (
                  <View style={styles.header}>
                    <AppText
                      style={[styles.modalHeading, { color: headingColor }]}
                    >
                      {heading}
                    </AppText>
                  </View>
                ) : null}

                {hasCloseIcon ? (
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeIcon}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Icon name="close-x" size="md" color={closeIconColor} />
                  </TouchableOpacity>
                ) : null}

                {text ? (
                  <AppText
                    namedStyle="text"
                    style={[
                      styles.leadText,
                      {
                        color: introTextColor,
                      },
                    ]}
                  >
                    {text}
                  </AppText>
                ) : null}

                <ScrollView
                  style={styles.body}
                  contentContainerStyle={styles.bodyContent}
                  showsVerticalScrollIndicator={false}
                >
                  {children}
                  {showErrorInBody ? (
                    <Error style={styles.errorInBody} message={errorMessage} />
                  ) : null}
                </ScrollView>

                {hasFooter ? (
                  <View
                    style={[
                      styles.footerWrapper,
                      { borderTopColor: footerBorderColor },
                    ]}
                  >
                    <View style={styles.footerInner}>
                      {showErrorInFooter ? (
                        <Error
                          style={styles.footerError}
                          message={errorMessage}
                        />
                      ) : null}
                      <View style={styles.footerButtonsRow}>
                        {ctaLabel ? (
                          <NewButton
                            label={ctaLabel}
                            onPress={ctaHandleClick}
                            size="lg"
                            disabled={isCtaDisabled}
                            loading={isCtaLoading}
                            // color={ctaColor}
                            style={styles.footerButton}
                          />
                        ) : null}
                        {secondaryCtaLabel ? (
                          <NewButton
                            label={secondaryCtaLabel}
                            onPress={secondaryCtaHandleClick}
                            size="lg"
                            disabled={isSecondaryCtaDisabled}
                            type={getSecondaryNewButtonType(secondaryCtaType)}
                            style={styles.footerButton}
                          />
                        ) : null}
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  /** base-modal__overlay — $overlay_66768D */
  wrapper: {
    flex: 1,
    backgroundColor: "rgba(102,118,141,0.5)",
  },
  safeAreaView: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  /**
   * .base-modal — padding $spacing_2_4 $spacing_1_6, radius $border_radius_2_4,
   * shadow $shadow_1, max-height 80%
   */
  content: {
    alignSelf: "center",
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
    maxHeight: "80%",
    overflow: "hidden",
    flexDirection: "column",
    shadowColor: "rgba(104, 77, 253, 0.1)",
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 2, height: 2 },
    elevation: 6,
  },
  /** base-modal__header + base-modal__header--no-close */
  header: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 0,
    minHeight: 28,
  },
  /** Web uses h4 for heading */
  modalHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: appStyles.fontSemiBold,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  /** base-modal__close-icon — top/right $spacing_2_4 / $spacing_1_6 */
  closeIcon: {
    position: "absolute",
    right: 16,
    top: 24,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  leadText: {
    marginTop: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    width: "100%",
    textAlign: "left",
  },
  body: {
    minHeight: 0,
    marginTop: 8,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  errorInBody: {
    marginTop: 8,
    marginLeft: 0,
    alignSelf: "stretch",
  },
  footerWrapper: {
    width: "100%",
    borderTopWidth: 1,
    marginTop: 0,
  },
  footerInner: {
    marginTop: 24,
    paddingHorizontal: 16,
    width: "100%",
    alignSelf: "center",
  },
  footerError: {
    marginLeft: 0,
    marginBottom: 16,
    marginTop: 0,
    textAlign: "center",
    alignSelf: "stretch",
  },
  footerButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    width: "100%",
  },
  footerButton: {
    flex: 1,
    minWidth: 0,
  },
});

TransparentModal.propTypes = {
  /**
   * Heading of the modal
   */
  heading: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

  /**
   * If the modal should have a close icon in the heading
   */
  hasCloseIcon: PropTypes.bool,

  /**
   * Function to be called to close the modal
   */
  handleClose: PropTypes.func,

  /**
   * If the modal is visible
   */
  isOpen: PropTypes.bool,

  /**
   * Additional styles to be passed to the view that renders the content
   */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),

  children: PropTypes.node,
};
