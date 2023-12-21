import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { AppText } from "../texts";
import { Icon } from "../icons";
import { AppButton } from "../buttons/AppButton/AppButton";
import { Error } from "../errors/Error";

import { appStyles } from "#styles";

export function TransparentModal({
  heading,
  text,
  hasCloseIcon = true,
  children,
  handleClose,
  ctaLabel,
  ctaHandleClick,
  ctaColor = "green",
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
  return (
    <Modal transparent visible={isOpen}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.wrapper}>
          <SafeAreaView style={styles.safeAreaView}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={"transparent"}
              translucent={Platform.OS === "android" ? true : false}
            />
            <TouchableWithoutFeedback>
              <View style={[styles.content, style]}>
                <View style={styles.heading}>
                  <AppText namedStyle="h3" style={styles.headingText}>
                    {heading}
                  </AppText>
                  {hasCloseIcon ? (
                    <TouchableOpacity onPress={handleClose}>
                      <Icon name="close-x" color="#263238" />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {text && <AppText style={styles.text}>{text}</AppText>}
                {children}
                {errorMessage ? (
                  <Error style={styles.error} message={errorMessage} />
                ) : null}
                {ctaLabel ? (
                  <AppButton
                    label={ctaLabel}
                    onPress={ctaHandleClick}
                    size="lg"
                    disabled={isCtaDisabled}
                    loading={isCtaLoading}
                    color={ctaColor}
                  />
                ) : null}
                {secondaryCtaLabel && (
                  <AppButton
                    label={secondaryCtaLabel}
                    onPress={secondaryCtaHandleClick}
                    size="lg"
                    disabled={isSecondaryCtaDisabled}
                    type={secondaryCtaType}
                    style={styles.secondaryButton}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  safeAreaView: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    justifyContent: "center",
  },
  content: {
    alignSelf: "center",
    backgroundColor: appStyles.colorWhite_ff,
    borderRadius: 20,
    padding: 20,
    width: "95%",
  },
  heading: {
    flexDirection: "row",
    marginBottom: 10,
  },
  text: {
    marginBottom: 12,
  },
  headingText: {
    width: "95%",
  },
  secondaryButton: {
    marginTop: 12,
  },
  error: {
    marginBottom: 12,
    alignSelf: "center",
    marginLeft: 0,
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
