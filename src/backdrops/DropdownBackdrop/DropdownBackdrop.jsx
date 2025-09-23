import React from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Backdrop, Icon } from "#components";
import { appStyles } from "#styles";
import { useGetTheme, useDropdownOptions } from "#hooks";

export function DropdownBackdrop() {
  const store = useDropdownOptions();
  const {
    isOpen,
    selectedOption,
    handleOptionSelect,
    selectedValues,
    heading,
    options = [],
    emptyMessage,
    closeDropdown,
    loading,
    shouldShowNavigationOnClose,
    multiSelect,
  } = store;
  const { colors, isDarkMode } = useGetTheme();
  return (
    <Backdrop
      isOpen={isOpen}
      onClose={closeDropdown}
      heading={heading}
      style={{
        height: appStyles.screenHeight * 0.35,
      }}
      scrollViewStyle={{
        paddingTop: 10,
      }}
    >
      {options?.length === 0 && emptyMessage && (
        <AppText
          style={{ textAlign: "center", alignSelf: "center", paddingTop: 12 }}
        >
          {emptyMessage}
        </AppText>
      )}
      {options?.map((option, index) => {
        const isSelected = Array.isArray(selectedValues)
          ? selectedValues.includes(option.value)
          : option.value === selectedOption;

        return (
          <View
            key={index}
            style={[
              styles.optionContainer,
              multiSelect && styles.multiSelectOption,
              isSelected && multiSelect && styles.selectedMultiOption,
            ]}
          >
            <AppText
              style={[
                styles.dropdownOption,
                multiSelect && styles.multiSelectText,
              ]}
              onPress={() => handleOptionSelect(option.value)}
              namedStyle="text"
              isBold={isSelected}
            >
              {option.label}
            </AppText>
            {multiSelect && isSelected && (
              <Icon
                name="check"
                color={appStyles.colorSecondary_9749fa}
                size="md"
                style={styles.checkIcon}
              />
            )}
          </View>
        );
      })}
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  multiSelectOption: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  selectedMultiOption: {
    backgroundColor: appStyles.colorSecondary_9749fa + "20", // 20% opacity
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 2,
  },
  dropdownOption: {
    paddingVertical: 5,
    textAlign: "center",
    flex: 1,
  },
  multiSelectText: {
    textAlign: "left",
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
});
