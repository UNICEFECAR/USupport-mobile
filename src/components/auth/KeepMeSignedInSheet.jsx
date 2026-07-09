import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { AppText, Icon, NewButton } from "#components";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

const SHEET_LAYER_INDEX = 1000;

/**
 * Bottom sheet shown when the user enables "Keep me signed in".
 * Overlay matches auth Backdrop (blur + tinted dim), not a separate Modal.
 */
export function KeepMeSignedInSheet({ isOpen, onCancel, onContinue }) {
  const { t } = useTranslation("blocks", { keyPrefix: "login" });
  const { colors } = useGetTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [isRendered, setIsRendered] = useState(false);
  const sheetTranslateY = useSharedValue(appStyles.screenHeight);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      sheetTranslateY.value = withSpring(0, appStyles.springConfig);
      return;
    }

    if (!isRendered) return;

    sheetTranslateY.value = withSpring(
      appStyles.screenHeight,
      appStyles.springConfig
    );
    const timer = setTimeout(() => setIsRendered(false), 280);
    return () => clearTimeout(timer);
  }, [isOpen, isRendered, sheetTranslateY]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  if (!isRendered) return null;

  const overlayContent = (
    <>
      <BlurView
        intensity={18}
        tint="dark"
        style={[StyleSheet.absoluteFill, styles.authOverlay]}
      />
      <View style={[StyleSheet.absoluteFill, styles.authOverlay]} />
    </>
  );

  return (
    <>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={[
            styles.overlay,
            {
              zIndex: SHEET_LAYER_INDEX,
              elevation: SHEET_LAYER_INDEX,
            },
          ]}
        >
          {overlayContent}
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          sheetAnimatedStyle,
          {
            backgroundColor: colors.background,
            paddingBottom: Math.max(bottomInset, 16),
            zIndex: SHEET_LAYER_INDEX + 1,
            elevation: SHEET_LAYER_INDEX + 1,
          },
        ]}
      >
        <View style={styles.grabber} />

        <View style={styles.iconCircle}>
          <Icon
            name="circle-actions-success"
            size="lg"
            color={appStyles.colorSecondary_9749fa}
          />
        </View>

        <AppText namedStyle="h3" style={styles.title}>
          {t("keep_me_signed_in_sheet_title")}
        </AppText>

        <AppText namedStyle="text" style={styles.body}>
          {t("keep_me_signed_in_sheet_body")}
        </AppText>

        <View style={styles.buttonsRow}>
          <NewButton
            label={t("keep_me_signed_in_sheet_cancel")}
            type="outline"
            size="lg"
            onPress={onCancel}
            style={styles.button}
          />
          <NewButton
            label={t("keep_me_signed_in_sheet_continue")}
            type="solid"
            size="lg"
            onPress={onContinue}
            style={styles.button}
          />
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: appStyles.screenHeight,
  },
  authOverlay: {
    backgroundColor: "rgba(18, 18, 24, 0.55)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: "center",
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: appStyles.colorGray_ea,
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(151, 73, 250, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    textAlign: "center",
    opacity: 0.85,
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
  },
});
