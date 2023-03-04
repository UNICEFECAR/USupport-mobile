import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "../../texts/AppText";
import { Loading } from "../../loaders/Loading/Loading";
import { Icon } from "../../icons/Icon";

import { showToast } from "#utils";
import { appStyles } from "#styles";

/**
 * AccessToken
 *
 * Display and copy Access token
 *
 * @return {jsx}
 */
export const AccessToken = ({
  accessTokenLabel,
  successLabel,
  isLoading = false,
  accessToken,
  style,
}) => {
  // TODO: Show confirmation for copying ?
  const handleCopyToClipboard = async () => {
    await Clipboard.setStringAsync(accessToken);
    showToast({
      message: successLabel,
    });
  };

  return (
    <View style={style}>
      {accessTokenLabel && (
        <AppText style={styles.label}>{accessTokenLabel}</AppText>
      )}
      <View style={styles.container}>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <AppText namedStyle="h3">{accessToken}</AppText>
            <TouchableOpacity
              style={styles.icon}
              onPress={handleCopyToClipboard}
            >
              <Icon name="copy" color={appStyles.colorSecondary_9749fa} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 13,
    marginBottom: 36,
  },

  label: {
    paddingBottom: 13,
  },

  icon: {
    marginLeft: 12,
  },
});

AccessToken.propTypes = {
  /**
   * Access token label
   * */
  accessTokenLabel: PropTypes.string,

  /**
   * Access token
   * */
  accessToken: PropTypes.string,

  /**
   * Is loading
   * */
  isLoading: PropTypes.bool,

  /**
   * Classes
   * */
  classes: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};
