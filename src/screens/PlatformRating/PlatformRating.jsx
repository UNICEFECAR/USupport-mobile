import React from "react";

import { PlatformRating as PlatformRatingBlock } from "#blocks";

import { Screen } from "#components";

/**
 * PlatformRating
 *
 * PlatformRating screen
 *
 * @returns {JSX.Element}
 */
export const PlatformRating = ({ navigation }) => {
  return (
    <Screen>
      <PlatformRatingBlock navigation={navigation} />
    </Screen>
  );
};
