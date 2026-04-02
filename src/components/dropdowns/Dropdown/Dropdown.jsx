import React, { useEffect } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { appStyles } from "#styles";
import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { Error } from "../../errors/Error";
import { useDropdownOptions, useGetTheme } from "#hooks";
import { Loading } from "../../loaders";

export const Dropdown = ({
  label,
  heading,
  options = [],
  selected,
  setSelected = () => {},
  errorMessage,
  placeholder = "Select",
  disabled,
  dropdownId,
  style,
  emptyMessage,
  isLoading,
  multiSelect = false,
  selectedValues = [],
  onMultiSelectChange = () => {},
}) => {
  const {
    isOpen: dropdownIsOpen,
    dropdownId: currentDropdownId,
    setDropdownOptions,
  } = useDropdownOptions();
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  let placeholderText = placeholder;
  if (!placeholder || placeholder === "Select") {
    switch (lang) {
      case "en":
        placeholderText = "Select";
        break;
      case "kk":
        placeholderText = "Таңдау";
        break;
      case "ru":
        placeholderText = "Выбрать";
        break;
      case "pl":
        placeholderText = "Wybierz";
        break;
      default:
        placeholderText = "Select";
    }
  }

  const handleClose = () => {
    setDropdownOptions({ isOpen: false });
  };
  const isOpen = dropdownIsOpen && dropdownId === currentDropdownId;

  const getLabelColor = () => {
    if (isHighContrast) return appStyles.colorHighContrast_ffff00;
    if (isDarkMode) return appStyles.colorPrimary_20809e;
    return appStyles.colorBlue_3d527b;
  };

  const getPlaceholderColor = () => {
    if (isHighContrast) return appStyles.colorHighContrast_ffff00;
    return appStyles.colorGray_a6b4b8;
  };

  const getBorderColor = () => {
    if (errorMessage) return appStyles.colorRed_eb5757;
    if (isOpen && !disabled) return appStyles.colorSecondary_9749fa;
    return colors.inputBorder || appStyles.colorGray_cdd8e1;
  };

  // Update dropdown options when selectedValues change for multi-select
  useEffect(() => {
    if (isOpen && multiSelect) {
      setDropdownOptions({
        selectedValues: selectedValues,
        // Also update the handleOptionSelect function with fresh selectedValues
        handleOptionSelect: (option) => {
          const isSelected = selectedValues.includes(option);
          const newSelectedValues = isSelected
            ? selectedValues.filter((val) => val !== option)
            : [...selectedValues, option];
          onMultiSelectChange(newSelectedValues);
          // Don't close dropdown for multi-select
        },
      });
    }
  }, [
    selectedValues,
    isOpen,
    multiSelect,
    setDropdownOptions,
    onMultiSelectChange,
  ]);

  const arrowRotation = useSharedValue(180);
  const arrowIconStyles = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${arrowRotation.value}deg` }],
  }));

  // Handle display text for both single and multi-select
  const getDisplayText = () => {
    if (multiSelect) {
      if (selectedValues.length === 0) return placeholderText;

      // Get labels for all selected values
      const selectedLabels = selectedValues
        .map((value) => options.find((opt) => opt.value === value)?.label)
        .filter(Boolean); // Remove any undefined labels

      const joinedLabels = selectedLabels.join(", ");

      // If the text is too long, show first few items + count
      if (joinedLabels.length > 50 && selectedLabels.length > 2) {
        return `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2} more`;
      }

      return joinedLabels;
    } else {
      const selectedLabel =
        options.find((option) => option.value === selected)?.label || "";
      return selected ? selectedLabel : placeholderText;
    }
  };

  const handleDropdownClick = () => {
    if (disabled) return;

    if (isOpen && currentDropdownId === dropdownId) {
      // Close the dropdown if it's the same dropdown that's currently open
      handleClose();
    } else {
      // Open the dropdown
      setDropdownOptions({
        heading: heading || label,
        options,
        selectedOption: multiSelect ? null : selected,
        selectedValues: multiSelect ? selectedValues : [],
        dropdownId,
        handleOptionSelect: (option) => {
          console.log(option, "option to select");
          if (multiSelect) {
            const isSelected = selectedValues.includes(option);
            const newSelectedValues = isSelected
              ? selectedValues.filter((val) => val !== option)
              : [...selectedValues, option];
            onMultiSelectChange(newSelectedValues);
            // Don't close dropdown for multi-select
          } else {
            setSelected(option);
            handleClose();
          }
        },
        isOpen: true,
        emptyMessage,
        multiSelect,
      });
    }
  };

  return (
    <View style={[styles.dropdown, disabled && styles.disabled, style]}>
      {label && (
        <AppText
          namedStyle="text"
          style={[styles.label, { color: getLabelColor() }]}
        >
          {label}
        </AppText>
      )}

      <TouchableWithoutFeedback onPress={handleDropdownClick}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.input,
              borderColor: getBorderColor(),
            },
            appStyles.shadow1,
          ]}
        >
          {isLoading ? (
            <View
              style={{
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Loading style={{ width: 20, height: 20, alignSelf: "center" }} />
            </View>
          ) : (
            <AppText
              style={[
                styles.selectedOption,
                {
                  color: selected
                    ? colors.inputText || colors.textTertiary
                    : getPlaceholderColor(),
                },
              ]}
            >
              {getDisplayText()}
            </AppText>
          )}

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
    width: "100%",
    textAlign: "left",
  },

  disabled: {
    opacity: 0.6,
  },

  dropdownOpen: {
    padding: 10,
  },

  label: {
    fontFamily: appStyles.fontMedium,
    marginBottom: 4,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
  },

  selectedOption: {
    flex: 1,
    fontSize: 16,
    fontFamily: appStyles.fontRegular,
    textAlignVertical: "center",
  },

  dropdownOption: {
    paddingVertical: 5,
  },
});
