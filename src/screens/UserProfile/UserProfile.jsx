import Raect from "react";
import { UserProfile as UserProfileBlock } from "#blocks";
import { Screen } from "#components";

/**
 * UserProfile
 *
 * UserProfile screen
 *
 * @returns {JSX.Element}
 */
export const UserProfile = ({ navigation }) => {
  return (
    <Screen>
      <UserProfileBlock navigation={navigation} />
    </Screen>
  );
};
