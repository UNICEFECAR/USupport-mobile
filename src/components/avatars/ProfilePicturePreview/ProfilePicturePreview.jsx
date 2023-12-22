import React from "react";
import PropTypes from "prop-types";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";

import { appStyles } from "#styles";

import Config from "react-native-config";
const { AMAZON_S3_BUCKET } = Config;

/**
 * ProfilePicturePreview
 *
 * Profile picture preview
 *
 * @return {jsx}
 */
export const ProfilePicturePreview = ({
  image,
  handleDeleteClick,
  handleChangeClick,
  changePhotoText,
  imageFile,
  style,
}) => {
  const imageSrc = imageFile
    ? imageFile
    : { uri: AMAZON_S3_BUCKET + "/" + (image || "default") };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={handleDeleteClick}
        style={styles.iconContainer}
      >
        <Icon name="circle-actions-close-purple" size="md" />
      </TouchableOpacity>
      <Image source={imageSrc} style={styles.image} />
      <AppText onPress={handleChangeClick} style={styles.text}>
        {changePhotoText}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    position: "relative",
  },

  iconContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
    objectFit: "cover",
  },

  text: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 4,
    alignSelf: "center",
    textAlign: "center",
    width: 100,
  },
});

ProfilePicturePreview.propTypes = {
  /**
   * Image url
   **/
  image: PropTypes.string,

  /**
   * handleDeleteClick
   * */
  handleDeleteClick: PropTypes.func,

  /**
   * handleChangeClick
   * */
  handleChangeClick: PropTypes.func,

  /**
   * changePhotoText
   * */
  changePhotoText: PropTypes.string,

  /**
   * imageFile
   * */
  imageFile: PropTypes.string,
};
