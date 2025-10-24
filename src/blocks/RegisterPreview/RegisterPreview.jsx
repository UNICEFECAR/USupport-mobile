import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StyleSheet, View, Image, ScrollView } from "react-native";
import Config from "react-native-config";

import {
  Block,
  Heading,
  AppButton,
  CustomCarousel,
  AppText,
} from "#components";

import { userSvc, localStorage, Context } from "#services";
import { useError, useGetTheme, useAddCountryEvent } from "#hooks";

const { AMAZON_S3_BUCKET } = Config;

/**
 * RegisterPreview
 *
 * RegisterPreview block
 *
 * @returns {JSX.Element}
 */
export const RegisterPreview = ({ navigation }) => {
  const { colors } = useGetTheme();
  const { t } = useTranslation("blocks", { keyPrefix: "register-preview" });
  const [error, setErrror] = useState();
  const queryClient = useQueryClient();
  const addCountryEventMutation = useAddCountryEvent();

  const tmpLogin = async () => {
    const res = await userSvc.tmpLogin();
    return res.data;
  };

  const { country, setToken } = useContext(Context);

  const tmpLoginMutation = useMutation(tmpLogin, {
    onSuccess: async (data) => {
      const { token, expiresIn, refreshToken } = data.token;
      await localStorage.setItem("token", token);
      localStorage.setItem("expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.setQueryData(
        ["client-data"],
        userSvc.transformUserData(data)
      );

      setToken(token);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrror(errorMessage);
    },
  });

  const carouselItems = [
    {
      heading: "heading_1",
      text: "text_1",
    },
    {
      heading: "heading_2",
      text: "text_2",
    },
    {
      heading: "heading_3",
      text: "text_3",
    },
  ];

  const renderCarouselItems = ({ item, index }) => (
    <View key={index} style={styles.carouselItem}>
      <AppText namedStyle="h3">{t(item.heading)}</AppText>
      <AppText
        style={[styles.carouselItemText, { color: colors.textSecondary }]}
      >
        {t(item.text)}
      </AppText>
    </View>
  );

  const eventMap = {
    Guest: "mobile_guest_register_click",
    RegisterAnonymous: "mobile_anonymous_register_click",
    RegisterEmail: "mobile_email_register_click",
  };

  const handleRedirect = (redirectTo) => {
    if (redirectTo !== "Login") {
      addCountryEventMutation.mutate({
        eventType: eventMap[redirectTo],
      });
    }

    if (redirectTo === "Guest") {
      tmpLoginMutation.mutate();
      return;
    }

    navigation.push(redirectTo);
  };

  return (
    <React.Fragment>
      <Heading
        handleGoBack={() => {
          navigation.navigate("Welcome");
        }}
        hasBackground={false}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Block style={styles.block}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: `${AMAZON_S3_BUCKET}/mascot-happy-blue`,
              }}
              style={styles.image}
            />
          </View>

          <View style={styles.contentContainer}>
            <CustomCarousel
              data={carouselItems}
              renderItem={renderCarouselItems}
              style={styles.carousel}
            />
            {country === "PL" && (
              <AppText style={styles.plText}>{t("pl_text")}</AppText>
            )}
            <AppButton
              label={t("login")}
              size="lg"
              color="purple"
              onPress={() => handleRedirect("Login")}
              style={styles.accessAnonymouslyButton}
            />
            <AppButton
              label={t("register_anonymously")}
              size="lg"
              onPress={() => handleRedirect("RegisterAnonymous")}
              style={styles.accessAnonymouslyButton}
            />
            <AppButton
              label={t("register_email")}
              size="lg"
              type="ghost"
              onPress={() => handleRedirect("RegisterEmail")}
            />
            <AppButton
              label={t("continue_as_guest")}
              type="ghost"
              size="lg"
              onPress={() => handleRedirect("Guest")}
              loading={tmpLoginMutation.isLoading}
            />
          </View>
        </Block>
      </ScrollView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  accessAnonymouslyButton: {
    marginVertical: 16,
  },
  block: {
    flex: 1,
  },
  carousel: { marginBottom: 20 },
  carouselItem: {
    alignSelf: "center",
    maxWidth: 420,
    padding: 16,
    width: "96%",
  },
  carouselItemText: { marginTop: 16 },
  contentContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 45,
  },
  image: {
    height: 258,
    resizeMode: "contain",
    width: 325,
  },
  imageContainer: {
    height: 258,
    paddingVertical: 32,
    position: "absolute",
    right: -185,
    top: 50,
    width: "100%",
  },
  plText: { fontWeight: "600", marginVertical: 16, textAlign: "center" },
  scrollView: { flexGrow: 1 },
});
