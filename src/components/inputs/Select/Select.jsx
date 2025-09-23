import React, { useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";

import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { Error } from "../../errors";
import { appStyles } from "#styles";
import { useGetTheme, useDropdownOptions } from "#hooks";
// import { Context } from "#services";
import { Loading } from "../../loaders";

/**
 * Select (multi-select)
 *
 * Mirrors web Select using a Bottom Backdrop with checkbox-like selection.
 */
export const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select",
  errorMessage,
  disabled = false,
  dropdownId,
  style,
  emptyMessage,
  isLoading,
  handleChange, // web-style API
}) => {
  const { colors, isDarkMode } = useGetTheme();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const {
    isOpen: dropdownIsOpen,
    dropdownId: currentDropdownId,
    setDropdownOptions,
  } = useDropdownOptions();

  // const { dropdownOptions, setDropdownOptions } = useContext(Context);

  const placeholderText = useMemo(() => {
    if (placeholder && placeholder !== "Select") return placeholder;
    switch (lang) {
      case "kk":
        return "Таңдау";
      case "ru":
        return "Выбрать";
      case "pl":
        return "Wybierz";
      default:
        return "Select";
    }
  }, [placeholder, lang]);

  // Normalize API: support value/onChange (array of values) OR options with option.selected + handleChange
  const normalizedValues = useMemo(() => {
    if (Array.isArray(value)) return value;
    const selectedFromOptions = options
      .filter((o) => o.selected)
      .map((o) => o.value);
    return selectedFromOptions;
  }, [value, options]);

  const selectedLabels = useMemo(() => {
    const valueSet = new Set(normalizedValues);
    return options.filter((o) => valueSet.has(o.value)).map((o) => o.label);
  }, [normalizedValues, options]);

  const isOpen = dropdownIsOpen && currentDropdownId === dropdownId;

  const handleOpen = () => {
    if (disabled) return;
    setDropdownOptions({
      heading: label,
      options,
      selectedOption: null,
      dropdownId,
      isOpen: true,
      emptyMessage,
      selectedValues: normalizedValues,
      handleOptionSelect: (selectedValue) => {
        // If option is disabled, ignore
        const option = options.find((o) => o.value === selectedValue);
        if (option?.isDisabled) return;

        const isSelected = normalizedValues.includes(selectedValue);
        const nextValues = isSelected
          ? normalizedValues.filter((v) => v !== selectedValue)
          : [...normalizedValues, selectedValue];

        if (typeof onChange === "function") {
          onChange(nextValues);
        } else if (typeof handleChange === "function") {
          // Match web API: pass back options array with selected flags updated
          const updatedOptions = options.map((o) => ({
            ...o,
            selected: nextValues.includes(o.value),
          }));
          handleChange(updatedOptions);
        }
      },
    });
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <AppText
          namedStyle="text"
          style={[styles.label, { color: colors.text }]}
        >
          {label}
        </AppText>
      ) : null}

      <TouchableWithoutFeedback onPress={handleOpen}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.input },
            errorMessage && styles.containerError,
            isOpen && styles.containerOpen,
            appStyles.shadow2,
          ]}
        >
          {isLoading ? (
            <View style={{ justifyContent: "center", flex: 1 }}>
              <Loading style={{ width: 20, height: 20, alignSelf: "center" }} />
            </View>
          ) : (
            <AppText
              style={[
                styles.valueText,
                {
                  color: !isDarkMode
                    ? appStyles.colorGray_92989b
                    : appStyles.colorGray_ea,
                },
              ]}
            >
              {selectedLabels.length > 0
                ? selectedLabels.join(", ")
                : placeholderText}
            </AppText>
          )}
          <Icon
            name={isOpen ? "arrow-chevron-up" : "arrow-chevron-down"}
            color={
              !isDarkMode ? appStyles.colorBlack_37 : appStyles.colorGray_ea
            }
          />
        </View>
      </TouchableWithoutFeedback>

      {errorMessage && !disabled ? <Error message={errorMessage} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "96%",
    maxWidth: 420,
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
    flexDirection: "row",
    height: 48,
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 16,
    width: "97%",
  },
  containerError: {
    borderColor: appStyles.colorRed_eb5757,
  },
  containerOpen: {
    borderColor: appStyles.colorSecondary_9749fa,
  },
  valueText: {
    fontSize: 14,
    flexShrink: 1,
  },
});

Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
      isDisabled: PropTypes.bool,
    })
  ),
  value: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  errorMessage: PropTypes.string,
  disabled: PropTypes.bool,
  dropdownId: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  emptyMessage: PropTypes.string,
  isLoading: PropTypes.bool,
};
