import React, { useState } from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";
import { Input } from "../Input/Input";
import { Icon } from "../../icons/Icon";

import { appStyles } from "#styles";

/**
 * InputSearch
 *
 * Input Search component
 *
 * @return {jsx}
 */
export const InputSearch = ({ onChange, ...props }) => {
  const [inputEmpty, setinputEmpty] = useState(false);

  function handleInputChange(value) {
    if (value !== "") {
      setinputEmpty(true);
    } else {
      setinputEmpty(false);
    }

    onChange ? onChange(value) : null;
  }

  const preInput = (
    <View style={styles.iconContainer}>
      <Icon
        name="search"
        color={
          inputEmpty ? appStyles.colorBlack_37 : appStyles.colorSecondary_9749fa
        }
      />
    </View>
  );

  return (
    <Input
      preInput={preInput}
      onChange={(newValue) => handleInputChange(newValue)}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    // Match client-ui: `.pre-input-wrapper { margin-left: $spacing_1_8 }`
    marginLeft: 18,
  },
});

InputSearch.propTypes = {
  /**
   * onChange function
   */
  onChange: PropTypes.func,

  /**
   * Additional props to pass to the Input component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
