import React, { useState } from "react";
import { Screen } from "#components";
import { UserDetails as UserDetailsBlock } from "#blocks";
import { DeleteAccount, ChangePassword } from "#backdrops";

/**
 * UserDetails
 *
 * User Details page
 *
 * @returns {JSX.Element}
 */
export const UserDetails = ({ navigation }) => {
  const [isBackdropOpen, setIsBackdropOpen] = useState(false);
  const [isDeleteBackdropShown, setIsDeleteBackdropShown] = useState(false);

  const openDataProcessingBackdrop = () => setIsBackdropOpen(true);
  const openDeleteAccountBackdrop = () => setIsDeleteBackdropShown(true);

  const closeDataProcessingBackdrop = () => setIsBackdropOpen(false);
  const closeDeleteAccountBackdrop = () => setIsDeleteBackdropShown(false);

  return (
    <Screen>
      <UserDetailsBlock
        navigation={navigation}
        openDeleteAccountBackdrop={openDeleteAccountBackdrop}
        openDataProcessingBackdrop={openDataProcessingBackdrop}
      />
      <DeleteAccount
        isOpen={isDeleteBackdropShown}
        onClose={closeDeleteAccountBackdrop}
      />
      <ChangePassword
        isOpen={isBackdropOpen}
        onClose={closeDataProcessingBackdrop}
      />
    </Screen>
  );
};
