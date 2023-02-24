//import liraries
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { appStyles } from "#styles";
import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { Error } from "../../errors/Error";

const DROPDOWN_HEADING_HEIGHT = 48;

export const Dropdown = ({
  label,
  options = [
    { value: "1", label: "Option", selected: false },
    { value: "2", label: "Option 2", selected: false },
    { value: "3", label: "Option 3", selected: false },
    { value: "4", label: "Option 4", selected: false },
    { value: "5", label: "Option 5", selected: false },
    { value: "6", label: "Option 6", selected: false },
    { value: "7", label: "Option 7", selected: false },
  ],
  selected,
  setSelected = () => {},
  errorMessage,
  placeholder = "Select",
  disabled,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownHeight = useSharedValue(0);
  const dropdownStyles = useAnimatedStyle(() => ({
    alignSelf: "center",
    backgroundColor: "white",
    borderColor: "#E0E0E0",
    borderRadius: 30,
    borderTopWidth: 0,
    borderWidth: isOpen ? 1 : 0,
    height: dropdownHeight.value,
    // position: "absolute",
    top: 75,
    transform: [{ translateY: -120 }],
    width: "97%",
  }));

  const arrowRotation = useSharedValue(180);
  const arrowIconStyles = useAnimatedStyle(() => ({
    paddingRight: 15,
    transform: [{ rotateX: `${arrowRotation.value}deg` }],
  }));

  const selectedLabel =
    options.find((option) => option.value === selected)?.label || "";

  const handleOnClick = () => {
    if (disabled) return;
    handleDropdownClick();
  };

  const handleChooseOption = (option) => {
    setSelected(option);
    handleDropdownClick();
  };

  const handleDropdownClick = () => {
    if (isOpen) {
      dropdownHeight.value = withTiming(0, { delay: 100 });
      arrowRotation.value = withTiming(180, { delay: 100 });
      setTimeout(() => {
        setIsOpen(false);
      }, 250);
    } else {
      setIsOpen(true);
      dropdownHeight.value = withTiming(180, { delay: 100 });
      arrowRotation.value = withTiming(0, { delay: 100 });
    }
  };

  return (
    <View style={[styles.dropdown, style]}>
      {label && (
        <AppText namedStyle="text" style={styles.label}>
          {label}
        </AppText>
      )}

      <TouchableWithoutFeedback onPress={handleDropdownClick}>
        <View
          style={[
            styles.container,
            isOpen && styles.containerOpen,
            errorMessage && styles.containerError,
            appStyles.shadow1,
          ]}
        >
          <AppText style={styles.selectedOption}>
            {selected ? selectedLabel : placeholder}
          </AppText>
          <Animated.View style={arrowIconStyles}>
            <Icon name="arrow-chevron-up" color={appStyles.colorBlack_37} />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <Animated.View style={[dropdownStyles, isOpen && styles.dropdownOpen]}>
        <ScrollView
          nestedScrollEnabled
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: 50,
          }}
        >
          <TouchableWithoutFeedback onPress={handleDropdownClick}>
            <View style={{ height: DROPDOWN_HEADING_HEIGHT + 5 }} />
          </TouchableWithoutFeedback>
          {options.map((option, index) => (
            <AppText
              style={styles.dropdownOption}
              onPress={() => handleChooseOption(option.value)}
              key={index}
              namedStyle="text"
              isBold={option.value === selected}
            >
              {option.label}
            </AppText>
          ))}
        </ScrollView>
      </Animated.View>

      {errorMessage && !disabled && <Error message={errorMessage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    width: "96%",
    maxWidth: 420,
    // alignSelf: "center",
    position: "relative",
    // zIndex: 999,
    ...appStyles.shadow2,
  },

  dropdownOpen: {
    padding: 10,
    // paddingTop: DROPDOWN_HEADING_HEIGHT + 5,
  },

  label: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontSemiBold,
  },

  container: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: appStyles.colorWhite_ff,
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
    paddingLeft: 16,
  },

  dropdownOption: {
    paddingVertical: 5,
  },
});
