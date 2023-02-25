import React from "react";
import { StyleSheet } from "react-native";

import { AppText, Backdrop } from "#components";
import { appStyles } from "#styles";

export function DropdownBackdrop({
  isOpen,
  onClose,
  selectedOption,
  handleOptionSelect,
  heading,
  options = [
    { value: "1", label: "Option", selected: false },
    { value: "2", label: "Option 2", selected: false },
    { value: "3", label: "Option 3", selected: false },
    { value: "4", label: "Option 4", selected: false },
    { value: "5", label: "Option 5", selected: false },
    { value: "6", label: "Option 6", selected: false },
    { value: "7", label: "Option 7", selected: false },
    { value: "8", label: "Option 8", selected: false },
    { value: "9", label: "Option 9", selected: false },
    { value: "10", label: "Option 10", selected: false },
    { value: "11", label: "Option 11", selected: false },
  ],
}) {
  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      heading={heading}
      style={{
        height: appStyles.screenHeight * 0.35,
      }}
      scrollViewStyle={{
        paddingTop: 10,
      }}
    >
      {options?.map((option, index) => (
        <AppText
          style={styles.dropdownOption}
          onPress={() => handleOptionSelect(option.value)}
          key={index}
          namedStyle="text"
          isBold={option.value === selectedOption}
        >
          {option.label}
        </AppText>
      ))}
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  dropdownOption: {
    paddingVertical: 5,
    textAlign: "center",
  },
});
