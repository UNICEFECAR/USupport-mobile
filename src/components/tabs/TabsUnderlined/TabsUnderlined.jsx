import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";

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
              <TouchableWithoutFeedback
                key={index}
                onPress={() => (option.isInactive ? {} : handleSelect(index))}
              >
                <View
                  style={[styles.tab, option.isSelected && styles.tabSelected]}
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
              </TouchableWithoutFeedback>
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
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    padding: 12,
    marginHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabSelected: { borderBottomColor: appStyles.colorPrimary_20809e },
  label: {
    color: appStyles.colorGray_66768d,
    fontFamily: "Nunito_500Medium",
  },
  labelSelected: {
    color: appStyles.colorPrimary_20809e,
    fontFamily: "Nunito_600SemiBold",
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
