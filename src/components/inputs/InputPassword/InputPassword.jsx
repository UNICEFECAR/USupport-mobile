import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Input } from "../Input/Input";
import { Icon } from "../../icons/Icon";

import { appStyles } from "#styles";

/**
 * InputPassword
 *
 * Input Password component
 *
 * @return {jsx}
 */
export const InputPassword = ({ ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);

  return (
    <Input isPassword={isPasswordVisible} {...props}>
      <TouchableOpacity
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
      >
        <Icon
          name={isPasswordVisible ? "view" : "hide"}
          color={appStyles.colorSecondary_9749fa}
          style={styles.icon}
        />
      </TouchableOpacity>
    </Input>
  );
};

const styles = StyleSheet.create({
  icon: { width: 20, height: 20 },
});

InputPassword.propTypes = {
  /**
   * Additional props to pass to the Input component
   **/
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
