//import libraries
import React, { useContext } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { appStyles } from "#styles";
import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { Error } from "../../errors/Error";
import { Context } from "#services";
import { useGetTheme } from "#hooks";

const DROPDOWN_HEADING_HEIGHT = 48;

export const Dropdown = ({
  label,
  options = [],
  selected,
  setSelected = () => {},
  errorMessage,
  placeholder = "Select",
  disabled,
  dropdownId,
  style,
}) => {
  const { dropdownOptions, setDropdownOptions } = useContext(Context);
  const { colors, isDarkMode } = useGetTheme();

  const handleClose = () => {
    setDropdownOptions((options) => {
      return { ...options, isOpen: false };
    });
  };
  const isOpen =
    dropdownOptions.isOpen && dropdownOptions.dropdownId === dropdownId;

  const arrowRotation = useSharedValue(180);
  const arrowIconStyles = useAnimatedStyle(() => ({
    paddingRight: 15,
    transform: [{ rotateX: `${arrowRotation.value}deg` }],
  }));

  const selectedLabel =
    options.find((option) => option.value === selected)?.label || "";

  const handleDropdownClick = () => {
    if (dropdownOptions.isOpen) {
      setDropdownOptions({
        heading: label,
        options,
        selectedOption: selected,
        handleOptionSelect: (option) => {
          setSelected(option);
          handleClose();
          handleDropdownClick();
        },
        isOpen: false,
      });
    } else {
      setDropdownOptions({
        heading: label,
        options,
        selectedOption: selected,
        dropdownId,
        handleOptionSelect: (option) => {
          setSelected(option);
          handleClose();
        },
        isOpen: true,
      });
    }
  };

  return (
    <View style={[styles.dropdown, style]}>
      {label && (
        <AppText
          namedStyle="text"
          style={[styles.label, { color: colors.text }]}
        >
          {label}
        </AppText>
      )}

      <TouchableWithoutFeedback onPress={handleDropdownClick}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.input },
            isOpen && styles.containerOpen,
            errorMessage && styles.containerError,
            appStyles.shadow1,
          ]}
        >
          <AppText
            style={[
              styles.selectedOption,
              {
                color: !isDarkMode
                  ? appStyles.colorGray_92989b
                  : appStyles.colorGray_ea,
              },
            ]}
          >
            {selected ? selectedLabel : placeholder}
          </AppText>
          <Animated.View style={arrowIconStyles}>
            <Icon
              name="arrow-chevron-up"
              color={
                !isDarkMode ? appStyles.colorBlack_37 : appStyles.colorGray_ea
              }
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {errorMessage && !disabled && <Error message={errorMessage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    width: "96%",
    maxWidth: 420,
    position: "relative",
    ...appStyles.shadow2,
  },

  dropdownOpen: {
    padding: 10,
  },

  label: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontSemiBold,
  },

  container: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: "transparent",
    borderRadius: 53,
    borderWidth: 1,
    elevation: 5,
    flexDirection: "row",
    height: DROPDOWN_HEADING_HEIGHT,
    justifyContent: "space-between",
    marginTop: 4,
    position: "relative",
    width: "97%",
    zIndex: 2,
  },

  containerError: {
    borderColor: appStyles.colorRed_eb5757,
  },

  containerOpen: {
    borderColor: appStyles.colorSecondary_9749fa,
  },

  selectedOption: {
    fontSize: 14,
    paddingLeft: 16,
  },

  dropdownOption: {
    paddingVertical: 5,
  },
});
