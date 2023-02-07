import React, { useState } from "react";
import { Screen } from "#components";
import { UserDetails as UserDetailsBlock } from "#blocks";
import { DeleteAccount } from "#backdrops";

/**
 * UserDetails
 *
 * User Details page
 *
 * @returns {JSX.Element}
 */
export const UserDetails = ({ navigation }) => {
  const [isDeleteBackdropShown, setIsDeleteBackdropShown] = useState(false);

  const openDeleteAccountBackdrop = () => setIsDeleteBackdropShown(true);

  const closeDeleteAccountBackdrop = () => setIsDeleteBackdropShown(false);

  return (
    <Screen>
      <UserDetailsBlock
        navigation={navigation}
        openDeleteAccountBackdrop={openDeleteAccountBackdrop}
      />
      <DeleteAccount
        isOpen={isDeleteBackdropShown}
        onClose={closeDeleteAccountBackdrop}
      />
    </Screen>
  );
};
