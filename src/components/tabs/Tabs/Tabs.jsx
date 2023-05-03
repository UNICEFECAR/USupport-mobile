import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";

import { AppText } from "../../texts/AppText/AppText";

import { appStyles } from "#styles";

/**
 * Tabs
 *
 * Tabs component
 *
 * @return {jsx}
 */
export const Tabs = ({ options, handleSelect, style, t }) => {
  const NO_OPTIONS_TO_RENDER = 4;
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOptionSelected, setIsMoreOptionSelected] = useState(false);

  const handleOnSelect = (option) => {
    handleSelect ? handleSelect(option) : () => {};
    setIsOpen(false);
  };

  const renderOptions = () => {
    if (options) {
      return options
        ? options.map((option, index) => {
            if (index >= NO_OPTIONS_TO_RENDER) {
              return null;
            }
            return (
              <TouchableWithoutFeedback
                onPress={
                  option.isInactive
                    ? () => {}
                    : () => {
                        handleSelect(index);
                        setIsMoreOptionSelected(false);
                      }
                }
                key={index}
              >
                <View
                  style={[
                    styles.tab,
                    option.isSelected && styles.tabSelected,
                    option.isInactive && styles.tabInactive,
                  ]}
                >
                  <AppText style={styles.tabText}>{option.label}</AppText>
                </View>
              </TouchableWithoutFeedback>
            );
          })
        : null;
    }
  };

  const renderShowMoreOptions = () => {
    if (options) {
      return options.map((option, index) => {
        if (index >= NO_OPTIONS_TO_RENDER) {
          return (
            <TouchableWithoutFeedback
              onPress={
                option.isInactive
                  ? () => {}
                  : () => {
                      handleOnSelect(index);
                      setIsMoreOptionSelected(option.isSelected);
                    }
              }
              key={index}
            >
              <View
                style={[
                  styles.option,
                  option.isInactive && styles.optionInactive,
                ]}
              >
                <AppText style={option.isSelected && styles.optionSelectedText}>
                  {option.label}
                </AppText>
              </View>
            </TouchableWithoutFeedback>
          );
        }
      });
    }
  };

  return (
    <View style={style}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.tabs]}>
          {renderOptions()}
          {options.length > NO_OPTIONS_TO_RENDER && (
            <AppText
              style={[
                styles.showMoreText,
                isMoreOptionSelected && styles.showMoreTextSelected,
              ]}
              onPress={() => setIsOpen(!isOpen)}
            >
              +
              {t("number_of_more_options", {
                count: options.length - NO_OPTIONS_TO_RENDER,
              })}
            </AppText>
          )}
        </View>
      </ScrollView>
      {isOpen ? (
        <View style={[appStyles.shadow1, styles.showMoreContainer]}>
          <ScrollView>
            <View style={styles.showMoreOptionsContainer}>
              {renderShowMoreOptions()}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 24,
    backgroundColor: appStyles.colorGreen_f4f7fe,
    borderRadius: 40,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabSelected: {
    borderColor: appStyles.colorSecondary_9749fa,
    backgroundColor: appStyles.colorWhite_ff,
  },
  tabInactive: { opacity: 0.2 },
  tabText: { color: appStyles.colorBlack_37 },
  showMoreText: {
    color: appStyles.colorPrimary_20809e,
    textDecorationLine: "underline",
    paddingLeft: 8,
    whiteSpace: "nowrap",
  },
  showMoreTextSelected: {
    color: appStyles.colorSecondaryPressed_6c16d9,
    fontFamily: "Nunito_600SemiBold",
  },
  showMoreContainer: {
    position: "absolute",
    alignSelf: "center",
    marginVertical: 50,
    paddingVertical: 8,
    width: "90%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: appStyles.colorGray_ea,
    backgroundColor: appStyles.colorWhite_ff,
    borderRadius: 24,
  },
  showMoreOptionsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    maxHeight: 220,
  },
  option: { padding: 8 },
  optionInactive: { opacity: 0.2 },
  optionSelectedText: { color: appStyles.colorSecondary_9749fa },
});
