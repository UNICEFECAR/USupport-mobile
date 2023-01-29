import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";

/**
 * TabsUnderlined
 *
 * TabsUnderlined component
 *
 * @return {jsx}
 */
export const TabsUnderlined = ({ options, handleSelect }) => {
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
              </TouchableOpacity>
            );
          })
        : null;
    }
  };

  return <View style={styles.tabsUnderlined}>{renderAllOptions()}</View>;
};

const styles = StyleSheet.create({
  tabsUnderlined: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabSelected: {
    borderBottomColor: appStyles.colorPrimary_20809e,
  },
  label: {
    marginHorizontal: 10,
    fontFamily: appStyles.fontMedium,
    color: appStyles.colorGray_66768d,
  },
  labelSelected: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorPrimary_20809e,
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
};
