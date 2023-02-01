import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StyleSheet, View, Image } from "react-native";

import {
  Block,
  Heading,
  AppButton,
  CustomCarousel,
  AppText,
} from "#components";

import { userSvc, localStorage, Context } from "#services";
import { useError } from "#hooks";

/**
 * RegisterPreview
 *
 * RegisterPreview block
 *
 * @returns {JSX.Element}
 */
export const RegisterPreview = ({ navigation }) => {
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
      heading: "What to expect from us",
      text: "The first platform created to make your mental health a priority, providing highly personalized psychological care.",
    },
    {
      heading: "What to expect from us",
      text: "The first platform created to make your mental health a priority, providing highly personalized psychological care.",
    },
    {
      heading: "What to expect from us",
      text: "The first platform created to make your mental health a priority, providing highly personalized psychological care.",
    },
  ];

  const renderCarouselItems = ({ item, index }) => (
    <View key={index} style={styles.carouselItem}>
      <AppText namedStyle="h3">{item.heading}</AppText>
      <AppText style={styles.carouselItemText}>{item.text}</AppText>
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
    <Block style={styles.block}>
      <Heading
        buttonComponent={
          <AppButton
            label={t("login")}
            size="sm"
            color="purple"
            onPress={() => handleRedirect("Login")}
          />
        }
        handleGoBack={() => navigation.goBack()}
      />

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
          style={{ marginBottom: 20 }}
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
        />
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
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
  },
  accessAnonymouslyButton: {
    marginVertical: 16,
  },
  carouselItem: {
    padding: 16,
    width: "96%",
    maxWidth: 420,
  },
  carouselItemText: { marginTop: 16 },
});
