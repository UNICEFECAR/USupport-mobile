import React from "react";
import PropTypes from "prop-types";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "../../icons/Icon";
import { NewButton } from "../../buttons";

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
      <View>
        <TouchableOpacity
          onPress={handleDeleteClick}
          style={styles.iconContainer}
        >
          <Icon name="circle-actions-close-purple" size="md" />
        </TouchableOpacity>
        <Image source={imageSrc} style={styles.image} />
      </View>
      <NewButton
        type="ghost"
        label={changePhotoText}
        onPress={handleChangeClick}
        style={styles.changePhotoButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    // width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  iconContainer: {
    position: "absolute",
    top: -6,
    right: -5,
    zIndex: 2,
    borderRadius: 50,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    objectFit: "cover",
  },

  changePhotoButton: {
    marginLeft: 12,
    minWidth: "auto",
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
