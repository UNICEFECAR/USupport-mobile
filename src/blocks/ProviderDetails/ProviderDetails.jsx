import React, { useCallback, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";

import { Avatar, AppText, Icon } from "#components";

import { getDateView, getTimeFromDate } from "#utils";

import { appStyles } from "#styles";

/**
 * ProviderDetails
 *
 * ProviderDetails block
 *
 * @return {jsx}
 */
export const ProviderDetails = ({
  provider,
  image,
  t,
  buttonComponent,
  currencySymbol,
}) => {
  const [isVideoShown, setVideoShown] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVideoShown(true);
    }, 1000);
    return () => {
      setVideoShown(false);
    };
  }, []);

  const allOptionsToString = (option) => {
    return provider[option]?.join(", ");
  };

  const renderSpecializations = useCallback(() => {
    if (provider) {
      return provider.specializations.map((x) => t(x))?.join(", ");
    }
  }, [provider]);

  const renderWorkWith = useCallback(() => {
    if (provider) {
      return provider.workWith
        .map((x) => t(x.topic.replaceAll("-", "_")))
        ?.join(", ");
    }
  }, [provider]);

  const renderLanguages = useCallback(() => {
    if (provider) {
      return provider.languages.map((x) => x.name)?.join(", ");
    }
  }, [provider]);

  let earliestAvailableSlot;
  if (provider) {
    const dateTime = getTimeFromDate(new Date(provider.earliestAvailableSlot));
    earliestAvailableSlot = `${getDateView(
      provider.earliestAvailableSlot
    )} - ${dateTime}`;
  }

  return (
    <View style={[styles.flexGrow1, { paddingBottom: 100 }]}>
      <View style={[styles.header]}>
        <Avatar image={image ? { uri: image } : null} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <AppText
            namedStyle="h3"
            style={[styles.providerName, styles.colorBlue]}
          >
            {provider.name} {provider.patronym ? provider.patronym : ""}{" "}
            {provider.surname}
          </AppText>
          <AppText namedStyle="smallText">{renderSpecializations()}</AppText>
        </View>
      </View>

      <View style={styles.marginTop16}>
        <AppText style={styles.headingText}>{t("description_label")}</AppText>
        <AppText style={styles.marginTop8}>{provider.description}</AppText>
      </View>

      <View style={styles.marginTop16}>
        {provider.videoLink ? (
          <>
            <AppText style={styles.headingText}>{t("video_label")}</AppText>
            {isVideoShown ? (
              <View style={styles.videoContainer}>
                <YoutubeIframe
                  height={230}
                  width={appStyles.screenWidth * 0.85}
                  play={false}
                  videoId={provider.videoId}
                />
              </View>
            ) : null}
          </>
        ) : null}

        {provider.consultationPrice > 0 ? (
          <View style={styles.iconAndTextContainer}>
            <Icon name="dollar" size="md" />
            <AppText style={styles.marginLeft12}>
              {provider.consultationPrice}
              {t("hour_consultation", { currencySymbol })}
            </AppText>
          </View>
        ) : null}

        <View style={styles.marginTop16}>
          <AppText style={styles.headingText}>{t("languages_label")}</AppText>
          <AppText style={styles.marginTop8}>{renderLanguages()}</AppText>
        </View>

        <View style={styles.marginTop16}>
          <AppText style={styles.headingText}>{t("work_with_label")}</AppText>
          <AppText style={styles.marginTop8}>{renderWorkWith()}</AppText>
        </View>

        <View style={styles.marginTop16}>
          <AppText style={styles.headingText}>
            {t("earliest_slot_label")}
          </AppText>
          <AppText style={styles.marginTop8}>
            {provider.earliestAvailableSlot
              ? earliestAvailableSlot
              : t("no_available_slot")}
          </AppText>
        </View>

        <View style={styles.marginTop16}>
          <AppText style={styles.headingText}>{t("education_label")}</AppText>
          <AppText style={styles.marginTop8}>
            {allOptionsToString("education")}
          </AppText>
        </View>

        <View style={styles.marginTop16}>
          <AppText style={styles.headingText}>
            {t("done_consultations_label")}
          </AppText>
          <AppText style={styles.marginTop8}>
            {provider.totalConsultations} {t("consultations")}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flexGrow1: { flexGrow: 1 },
  marginTop16: { marginTop: 16 },
  marginTop8: { marginTop: 8 },
  marginLeft12: { marginLeft: 12 },
  colorBlue: { color: appStyles.colorBlue_3d527b },

  header: {
    flexDirection: "row",
    marginTop: 24,
    width: "100%",
  },
  headerTextContainer: { marginLeft: 16 },
  providerName: {
    fontFamily: "Nunito_600SemiBold",
    maxWidth: "90%",
  },
  avatar: { width: 66, height: 66 },
  videoContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  iconAndTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  headingText: {
    fontFamily: "Nunito_700Bold",
    color: appStyles.colorBlue_3d527b,
  },
});
