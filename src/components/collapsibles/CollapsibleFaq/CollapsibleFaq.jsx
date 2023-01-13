import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible/Collapsible";
import { AppText } from "../../texts/AppText/AppText";
import { Line } from "../../separators/Line/Line";

/**
 * CollapsibleFAQ
 *
 * CollapsibleFAQ component
 *
 * @return {jsx}
 */
export const CollapsibleFAQ = ({ data }) => {
  return data?.map((faq, index) => {
    return (
      <View key={index} style={styles.collapsibleFaq}>
        <Collapsible
          heading={faq.question}
          content={<AppText namedStyle="text">{faq.answer}</AppText>}
        />
        {index < data.length - 1 && <Line style={styles.separator} />}
      </View>
    );
  });
};

const styles = StyleSheet.create({
  collapsibleFaq: {
    marginTop: 20,
  },

  separator: {
    marginTop: 20,
  },
});

CollapsibleFAQ.propTypes = {
  /**
   * Array of objects with question and answer
   * */
  data: PropTypes.arrayOf(PropTypes.object),
};
