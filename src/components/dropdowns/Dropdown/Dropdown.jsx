//import liraries
import React, { useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
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
  ],
  selected,
  setSelected = () => {},
  errorMessage,
  placeholder = "Select",
  disabled,
}) => {
  const dropdownHeight = useSharedValue(48);
  const dropdownStyles = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    width: "90%",
    borderWidth: 1,
    borderRadius: 30,
    borderColor: "#E0E0E0",
    height: dropdownHeight.value,
    borderTopWidth: 0,
  }));

  const arrowRotation = useSharedValue(0);
  const arrowIconStyles = useAnimatedStyle(() => ({
    paddingRight: 15,
    transform: [{ rotateX: `${arrowRotation.value}deg` }],
  }));

  const [isOpen, setIsOpen] = useState(false);

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
      dropdownHeight.value = withTiming(48, { delay: 100 });
      arrowRotation.value = withTiming(0, { delay: 100 });
      setTimeout(() => {
        setIsOpen(!isOpen);
      }, 250);
    } else {
      setIsOpen(true);
      dropdownHeight.value = withTiming(150, { delay: 100 });
      arrowRotation.value = withTiming(180, { delay: 100 });
    }
  };

  return (
    <View style={styles.dropdown}>
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

      <Animated.ScrollView
        style={[
          dropdownStyles,
          isOpen && {
            padding: 10,
            paddingTop: 48 + 5,
          },
        ]}
      >
        {options.map((option, index) => (
          <AppText
            style={[styles.dropdownOption]}
            onPress={() => handleChooseOption(option.value)}
            key={index}
            namedStyle="text"
            isBold={option.value === selected}
          >
            {option.label}
          </AppText>
        ))}
        <View style={{ paddingBottom: 60 }} />
      </Animated.ScrollView>
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
