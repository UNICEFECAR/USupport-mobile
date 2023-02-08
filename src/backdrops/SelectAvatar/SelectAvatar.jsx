import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Backdrop, AppText } from "#components";
import { clientSvc } from "#services";
import { useError } from "#hooks";
import { appStyles } from "#styles";

import { AMAZON_S3_BUCKET } from "@env";

/**
 * SelectAvatar
 *
 * The SelectAvatar backdrop
 *
 * @return {jsx}
 */
export const SelectAvatar = ({ isOpen, onClose }) => {
  const { t } = useTranslation("select-avatar");

  const queryClient = useQueryClient();
  const clientData = queryClient.getQueryData(["client-data"]);
  const image = clientData?.image;

  const [selectedAvatar, setSelectedAvatar] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const changeAvatar = async () => {
    const res = await clientSvc.changeImage(selectedAvatar);
    return res;
  };

  const changeAvatarMutation = useMutation(changeAvatar, {
    onSuccess: (res) => {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
      onClose();
    },
    onError: (error) => {
      setIsLoading(false);
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
    },
  });

  const avatars = [
    "avatar-1",
    "avatar-2",
    "avatar-3",
    "avatar-4",
    "avatar-5",
    "avatar-6",
    "avatar-7",
    "avatar-8",
    "avatar-9",
    "avatar-10",
    "avatar-11",
    "avatar-12",
  ];

  return (
    <Backdrop
      title="SelectAvatar"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      ctaLabel={t("cta_label")}
      ctaHandleClick={() => {
        changeAvatarMutation.mutate();
      }}
    >
      <View style={styles.selectedAvatarContent}>
        <Image
          style={styles.imagePreview}
          resizeMode="contain"
          source={{ uri: AMAZON_S3_BUCKET + "/" + image }}
        />
        <View style={styles.avatarsContainer}>
          {avatars.map((avatar, index) => (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => setSelectedAvatar(avatar)}
            >
              <Image
                style={[
                  styles.avatarImage,
                  avatar === selectedAvatar && styles.selectedAvatar,
                ]}
                resizeMode="contain"
                source={{ uri: AMAZON_S3_BUCKET + "/" + avatar }}
              />
            </TouchableWithoutFeedback>
          ))}
        </View>
      </View>
      <AppText namedStyle="paragraph" style={styles.selectText}>
        {t("select")}
      </AppText>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  selectedAvatarContent: {},
  imagePreview: {
    alignSelf: "center",
    width: 100,
    height: 100,
  },
  avatarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: 36,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  selectedAvatar: {
    borderWidth: 2,
    borderColor: appStyles.colorPrimary_20809e,
  },
  selectText: {
    textAlign: "center",
    paddingTop: 18,
  },
});
