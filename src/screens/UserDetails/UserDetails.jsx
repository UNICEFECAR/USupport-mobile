import React, { useState } from "react";
import { Screen } from "#components";
import { UserDetails as UserDetailsBlock } from "#blocks";
import { DeleteAccount, ChangePassword } from "#backdrops";
import { SelectAvatar } from "../../backdrops/SelectAvatar/SelectAvatar";

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
  const [isSelectAvatarBackdropShown, setIsSelectAvatarBackdropShown] =
    useState(false);

  const openChangePasswordBackdrop = () => setIsChangePasswordOpen(true);
  const openDeleteAccountBackdrop = () => setIsDeleteBackdropShown(true);
  const openSelectAvatarBackdrop = () => setIsSelectAvatarBackdropShown(true);

  const closeChangePasswordBackdrop = () => setIsChangePasswordOpen(false);
  const closeDeleteAccountBackdrop = () => setIsDeleteBackdropShown(false);
  const closeSelectAvatarBackdrop = () => setIsSelectAvatarBackdropShown(false);

  return (
    <Screen>
      <UserDetailsBlock
        navigation={navigation}
        openDeleteAccountBackdrop={openDeleteAccountBackdrop}
        openChangePasswordBackdrop={openChangePasswordBackdrop}
        openSelectAvatarBackdrop={openSelectAvatarBackdrop}
      />
      <SelectAvatar
        isOpen={isSelectAvatarBackdropShown}
        onClose={closeSelectAvatarBackdrop}
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
