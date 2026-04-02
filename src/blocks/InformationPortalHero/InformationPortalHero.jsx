import React, { useContext } from "react";
import PropTypes from "prop-types";
import {
  View,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { InputSearch, Icon, NewButton } from "#components";
import { useGetTheme } from "#hooks";
import { Context } from "#services";
import { appStyles } from "#styles";
import informationPortalMobile from "./assets/information-portal-mobile.png";
import informationPortalPsMobile from "./assets/information-portal-ps-mobile.png";
import informationPortalPsMobileDark from "./assets/information-portal-ps-mobile-dark.png";

/**
 * InformationPortalHero
 *
 * Reusable hero component for information portal pages
 *
 * @returns {JSX.Element}
 */
export const InformationPortalHero = ({
  navigation,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  placeholder = "Search",
  showGoBackArrow = false,
  buttonLabel,
  buttonOnPress,
  image,
}) => {
  const { isDarkMode } = useGetTheme();
  const { country } = useContext(Context);
  const IS_PS = country === "PS";
  const selectedImage =
    image ||
    (IS_PS
      ? isDarkMode
        ? informationPortalPsMobileDark
        : informationPortalPsMobile
      : informationPortalMobile);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={selectedImage}
      style={styles.imageBackground}
      resizeMode="cover"
      imageStyle={styles.image}
    >
      {showGoBackArrow && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Icon name="arrow-chevron-back" size="md" color="#fff" />
        </TouchableOpacity>
      )}

      {buttonLabel && buttonOnPress && (
        <View style={styles.buttonContainer}>
          <NewButton label={buttonLabel} onPress={buttonOnPress} />
        </View>
      )}

      {showSearch && (
        <View style={styles.searchContainer}>
          <InputSearch
            onChange={onSearchChange}
            value={searchValue}
            placeholder={placeholder}
            returnKeyType="search"
            onSubmitEditing={() => onSearchSubmit?.(searchValue)}
          />
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    width: "100%",
    alignSelf: "stretch",
    height: 300,
    justifyContent: "flex-end",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appStyles.colorPrimary_20809e,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "20%",
    paddingHorizontal: "5%",
  },
  buttonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
  },
});

InformationPortalHero.propTypes = {
  /**
   * Navigation object
   */
  navigation: PropTypes.object,

  /**
   * Whether to show the search input
   */
  showSearch: PropTypes.bool,

  /**
   * Current search value
   */
  searchValue: PropTypes.string,

  /**
   * Callback when search input changes
   */
  onSearchChange: PropTypes.func,

  /**
   * Callback when the search input is submitted
   */
  onSearchSubmit: PropTypes.func,

  /**
   * Placeholder text for the search input
   */
  placeholder: PropTypes.string,

  /**
   * Whether to show the go back arrow
   */
  showGoBackArrow: PropTypes.bool,

  /**
   * Label for the optional button
   */
  buttonLabel: PropTypes.string,

  /**
   * Callback when the optional button is pressed
   */
  buttonOnPress: PropTypes.func,

  /**
   * Image source for the hero (e.g. require("./assets/hero.png"))
   */
  image: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
};
