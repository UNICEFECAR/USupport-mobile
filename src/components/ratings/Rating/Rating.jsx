import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * Rating
 *
 * Rating component
 *
 * @return {jsx}
 */
export const Rating = ({
  label,
  maxStars = 5,
  rating = 5,
  setParentState,
  style,
}) => {
  const [initialStarsState, setInitialStarsState] = useState();
  const [stars, setStars] = useState([]);
  const { colors } = useGetTheme();

  useEffect(() => {
    let initialStarsState = [];
    for (let i = 0; i < maxStars; i++) {
      if (i + 1 <= rating) {
        initialStarsState.push("star-full");
      } else {
        initialStarsState.push("star");
      }
    }
    setInitialStarsState(initialStarsState);
    setStars(initialStarsState);
  }, [rating, maxStars]);

  function onStarPress(numberOfStars) {
    let newStars = [...stars];

    // Set all previous stars as active
    for (let i = 0; i <= numberOfStars; i++) {
      newStars[i] = "star-full";
    }

    // Reset all next stars
    for (let i = numberOfStars + 1; i < initialStarsState.length; i++) {
      newStars[i] = "star";
    }

    setParentState(numberOfStars + 1);
    setStars(newStars);
  }

  return (
    <View style={[style]}>
      {label ? (
        <AppText style={[styles.label, { color: colors.text }]}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.starsContainer}>
        {stars.map((star, index) => {
          const starColor =
            star === "star"
              ? appStyles.colorGray_66768d
              : appStyles.colorSecondary_9749fa;
          return (
            <TouchableOpacity
              onPress={() => onStarPress(index)}
              key={star + index}
            >
              <Icon
                name={star}
                color={starColor}
                size="lg"
                style={[styles.star, index === 0 && styles.firstStar]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    // color: appStyles.colorBlue_3d527b,
    marginBottom: 4,
    fontFamily: "Nunito_600SemiBold",
  },
  starsContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: 40,
    alignItems: "center",
  },
  star: {
    marginLeft: 10,
  },
  firstStar: {
    marginLeft: 0,
  },
});
