import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * TabsUnderlined
 *
 * TabsUnderlined component — colors aligned with client-ui tabs-underlined.scss
 * (input text when idle, accent underline + main text when selected).
 *
 * @return {jsx}
 */
export const TabsUnderlined = ({ style, options, handleSelect }) => {
  const { colors, isHighContrast } = useGetTheme();

  const renderAllOptions = () => {
    if (!options) {
      return null;
    }

    return options.map((option, index) => {
      const isSelected = option.isSelected;
      const underlineWidth = isSelected && isHighContrast ? 4 : 2;

      return (
        <TouchableOpacity
          onPress={() => handleSelect(index)}
          disabled={option.isInactive}
          key={index}
        >
          <View
            style={[
              styles.tab,
              {
                borderBottomWidth: underlineWidth,
                borderBottomColor: isSelected
                  ? colors.tabUnderlinedBorder
                  : "transparent",
              },
              option.isInactive && styles.tabDisabled,
            ]}
          >
            <AppText
              namedStyle="h3"
              style={[
                styles.label,
                { color: colors.inputText },
                isSelected && [styles.labelSelected, { color: colors.text }],
              ]}
            >
              {option.label}
            </AppText>
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={[styles.tabsUnderlined, style]}>{renderAllOptions()}</View>
  );
};

const styles = StyleSheet.create({
  tabsUnderlined: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tab: {
    // Client: $spacing_1_2 padding, 0.2rem (~2px) underline
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tabDisabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: appStyles.fontMedium,
  },
  labelSelected: {
    fontFamily: appStyles.fontBold,
  },
});

TabsUnderlined.propTypes = {
  /**
   * options to be displayed
   */
  options: PropTypes.arrayOf(PropTypes.object),

  /**
   *handleSelect function to be called when an option is selected
   **/
  handleSelect: PropTypes.func,

  /**
   * style to be applied to the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
