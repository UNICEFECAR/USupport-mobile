import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StyleSheet, View, Image, ScrollView } from "react-native";

import {
  Block,
  Heading,
  AppButton,
  CustomCarousel,
  AppText,
} from "#components";

import { userSvc, localStorage, Context } from "#services";
import { useError, useGetTheme } from "#hooks";

/**
 * RegisterPreview
 *
 * RegisterPreview block
 *
 * @returns {JSX.Element}
 */
export const RegisterPreview = ({ navigation }) => {
  const { colors } = useGetTheme();
  const { t } = useTranslation("register-preview");
  const [error, setErrror] = useState();
  const queryClient = useQueryClient();

  const tmpLogin = async () => {
    const res = await userSvc.tmpLogin();
    return res.data;
  };

  const { setToken } = useContext(Context);

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

  const handleRedirect = (redirectTo) => {
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
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("Welcome");
          }
        }}
        hasBackground={false}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Block style={styles.block}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/mascot-happy-blue.png")}
              style={styles.image}
            />
          </View>

          <View style={styles.contentContainer}>
            <CustomCarousel
              data={carouselItems}
              renderItem={renderCarouselItems}
              style={styles.carousel}
            />
            <AppButton
              label={t("login")}
              size="lg"
              color="purple"
              onPress={() => handleRedirect("Login")}
              style={styles.accessAnonymouslyButton}
            />
            <AppButton
              label={t("register_email")}
              size="lg"
              onPress={() => handleRedirect("RegisterEmail")}
            />
            <AppButton
              label={t("register_anonymously")}
              size="lg"
              type="secondary"
              onPress={() => handleRedirect("RegisterAnonymous")}
              style={styles.accessAnonymouslyButton}
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
  scrollView: { flexGrow: 1 },
  block: {
    flex: 1,
  },
  imageContainer: {
    height: 258,
    width: "100%",
    position: "absolute",
    right: -185,
    top: 50,
    paddingVertical: 32,
  },
  image: {
    width: 325,
    height: 258,
    resizeMode: "contain",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 45,
  },
  carousel: { marginBottom: 20 },
  accessAnonymouslyButton: {
    marginVertical: 16,
  },
  carouselItem: {
    padding: 16,
    width: "96%",
    maxWidth: 420,
    alignSelf: "center",
  },
  carouselItemText: { marginTop: 16 },
});
