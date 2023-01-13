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

export const Dropdown = ({
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
    // position: "absolute",
    top: 0,
    width: "90%",
    borderWidth: isOpen ? 1 : 0,
    borderRadius: 30,
    borderColor: "#E0E0E0",
    height: dropdownHeight.value,
    borderTopWidth: 0,
    transform: [{ translateY: -48 }],
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
        setIsOpen(!isOpen);
      }, 250);
    } else {
      setIsOpen(true);
      dropdownHeight.value = withTiming(180, { delay: 100 });
      arrowRotation.value = withTiming(0, { delay: 100 });
    }
  };

  return (
    <View style={[styles.dropdown, style]}>
      <TouchableWithoutFeedback onPress={handleDropdownClick}>
        <View
          style={[
            styles.container,
            {
              borderColor: isOpen
                ? appStyles.colorSecondary_9749fa
                : "transparent",
            },
          ]}
        >
          <AppText style={styles.selectedOption}>
            {selected ? selectedLabel : placeholder}
          </AppText>
          <Animated.View style={arrowIconStyles}>
            <Icon name="arrow-chevron-up" />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          dropdownStyles,
          isOpen && {
            padding: 10,
            paddingTop: 48 + 5,
          },
        ]}
      >
        <ScrollView>
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
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    width: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    ...appStyles.shadow2,
  },
  container: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 53,
    borderWidth: 1,
    elevation: 5,
    flexDirection: "row",
    height: 48,
    justifyContent: "space-between",
    position: "relative",
    width: "90%",
    zIndex: 2,
  },
  selectedOption: {
    paddingLeft: 16,
  },
  dropdownOption: {
    paddingVertical: 5,
  },
});
