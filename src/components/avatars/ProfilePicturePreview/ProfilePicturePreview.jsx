import React from "react";
import PropTypes from "prop-types";
import { View, Image, StyleSheet } from "react-native";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";

import { appStyles } from "#styles";

import placeholder from "../../../assets/SpecialistPlaceholderImage.png";

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
  // const imageSrc = imageFile ? imageFile : AMAZON_S3_BUCKET + "/" + image;
  const imageSrc = placeholder;

  return (
    <View style={[styles.container, style]}>
      <View onPress={handleDeleteClick} style={styles.iconContainer}>
        <Icon name="circle-actions-close-purple" size="md" />
      </View>
      <Image source={imageSrc} style={styles.image} />
      <AppText
        namedStyle="smallText"
        onPress={handleChangeClick}
        style={styles.text}
      >
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
