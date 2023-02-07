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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteBackdropShown, setIsDeleteBackdropShown] = useState(false);

  const openChangePasswordBackdrop = () => setIsChangePasswordOpen(true);
  const openDeleteAccountBackdrop = () => setIsDeleteBackdropShown(true);

  const closeChangePasswordBackdrop = () => setIsChangePasswordOpen(false);
  const closeDeleteAccountBackdrop = () => setIsDeleteBackdropShown(false);

  return (
    <Screen>
      <UserDetailsBlock
        navigation={navigation}
        openDeleteAccountBackdrop={openDeleteAccountBackdrop}
        openChangePasswordBackdrop={openChangePasswordBackdrop}
      />
      <DeleteAccount
        isOpen={isDeleteBackdropShown}
        onClose={closeDeleteAccountBackdrop}
      />
      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={closeChangePasswordBackdrop}
      />
    </Screen>
  );
};
