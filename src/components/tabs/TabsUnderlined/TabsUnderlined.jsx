import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";

/**
 * TabsUnderlined
 *
 * TabsUnderlined component
 *
 * @return {jsx}
 */
export const TabsUnderlined = ({ style, options, handleSelect }) => {
  const renderAllOptions = () => {
    if (options) {
      return options
        ? options.map((option, index) => {
            return (
              <TouchableOpacity
                onPress={() => handleSelect(index)}
                disabled={option.isInactive}
                key={index}
              >
                <View
                  style={[
                    styles.tab,
                    option.isSelected && styles.tabSelected,
                    option.isInactive && styles.tabDisabled,
                  ]}
                >
                  <AppText
                    namedStyle="h3"
                    style={[
                      styles.label,
                      option.isSelected && styles.labelSelected,
                    ]}
                  >
                    {option.label}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })
        : null;
    }
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
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabSelected: {
    borderBottomColor: appStyles.colorPrimary_20809e,
  },
  tabDisabled: {
    opacity: 0.4,
  },
  label: {
    marginHorizontal: 12,
    fontFamily: appStyles.fontMedium,
    color: appStyles.colorGray_66768d,
  },
  labelSelected: {
    color: appStyles.colorPrimary_20809e,
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
