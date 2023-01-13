import React, { useState } from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";

import { appStyles } from "#styles";

/**
 * Collapsible
 *
 * Base Collapsible component
 *
 * @return {jsx}
 */
export const Collapsible = ({ heading, content, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const expandableContainerHeight = useSharedValue(0);
  const expandableContainerStyles = useAnimatedStyle(() => ({
    maxHeight: expandableContainerHeight.value,
  }));

  const arrowRotation = useSharedValue(0);
  const arrowIconStyles = useAnimatedStyle(() => ({
    paddingRight: 15,
    transform: [{ rotateX: `${arrowRotation.value}deg` }],
  }));

  const handleCollapsibleClick = () => {
    if (isExpanded) {
      expandableContainerHeight.value = withTiming(0, { delay: 100 });
      arrowRotation.value = withTiming(0, { delay: 100 });
      setTimeout(() => {
        setIsExpanded(!isExpanded);
      }, 250);
    } else {
      setIsExpanded(true);
      expandableContainerHeight.value = withTiming(150, { delay: 100 });
      arrowRotation.value = withTiming(180, { delay: 100 });
    }
  };

  return (
    <View style={style}>
      <TouchableOpacity onPress={() => handleCollapsibleClick()}>
        <View style={[styles.heading]}>
          <AppText
            namedStyle="h3"
            style={[styles.headingText, isExpanded && styles.headingExpanded]}
          >
            {heading}
          </AppText>
          <Animated.View style={arrowIconStyles}>
            <Icon
              name="arrow-chevron-down"
              size="md"
              color={appStyles.colorPrimary_20809e}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View style={[expandableContainerStyles, styles.content]}>
          {content}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    width: "100%",
  },

  headingText: {
    maxWidth: "80%",
  },

  content: {
    marginTop: 16,
    paddingHorizontal: 12,
    overflow: "hidden",
  },

  headingExpanded: {
    color: appStyles.colorPrimary_20809e,
  },
});

Collapsible.propTypes = {
  /**
   * Heading of the collapsible
   */
  heading: PropTypes.string.isRequired,

  /**
   * Content of the collapsible
   * */
  content: PropTypes.node.isRequired,

  /**
   * Additional styles to apply to the collapsible
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
