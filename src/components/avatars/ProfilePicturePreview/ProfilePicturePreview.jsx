import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { CachedImage } from "../../images";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";

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

  const shouldShowDelete =
    typeof handleDeleteClick === "function" &&
    (Boolean(imageFile) || (Boolean(image) && image !== "default"));

  return (
    <View style={[styles.container, style]}>
      <View>
        {shouldShowDelete ? (
          <TouchableOpacity
            onPress={handleDeleteClick}
            style={styles.iconContainer}
          >
            <Icon name="circle-actions-close-purple" size="md" />
          </TouchableOpacity>
        ) : null}
        <CachedImage source={imageSrc} style={styles.image} resizeMode="cover" />
      </View>
      <TouchableOpacity onPress={handleChangeClick}>
        <AppText style={styles.changePhotoText}>{changePhotoText}</AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
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
  },

  changePhotoText: {
    marginLeft: 12,
    minWidth: "auto",
    textDecorationLine: "underline",
    color: "#20809E",
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
