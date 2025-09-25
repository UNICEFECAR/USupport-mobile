import React, { useState } from "react";
import { Screen } from "#components";
import { UserDetails as UserDetailsBlock } from "#blocks";
import {
  DeleteAccount,
  ChangePassword,
  DeleteProfilePicture,
  SelectAvatar,
} from "#backdrops";
import { DeleteChatHistory, DeleteMoodTrackerHistory } from "#modals";

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
  const [isDeletePictureBackdropShown, setIsDeletePictureBackdropShown] =
    useState(false);
  const [
    isDeleteMoodTrackerHistoryBackdropShown,
    setIsDeleteMoodTrackerHistoryBackdropShown,
  ] = useState(false);
  const [
    isDeleteChatHistoryBackdropShown,
    setIsDeleteChatHistoryBackdropShown,
  ] = useState(false);

  const openChangePasswordBackdrop = () => setIsChangePasswordOpen(true);
  const openDeleteAccountBackdrop = () => setIsDeleteBackdropShown(true);
  const openSelectAvatarBackdrop = () => setIsSelectAvatarBackdropShown(true);
  const openDeletePictureBackdrop = () => setIsDeletePictureBackdropShown(true);
  const openDeleteChatHistoryBackdrop = () =>
    setIsDeleteChatHistoryBackdropShown(true);
  const openDeleteMoodTrackerHistoryBackdrop = () =>
    setIsDeleteMoodTrackerHistoryBackdropShown(true);

  const closeChangePasswordBackdrop = () => setIsChangePasswordOpen(false);
  const closeDeleteAccountBackdrop = () => setIsDeleteBackdropShown(false);
  const closeSelectAvatarBackdrop = () => setIsSelectAvatarBackdropShown(false);
  const closeDeletePictureBackdrop = () =>
    setIsDeletePictureBackdropShown(false);
  const closeDeleteChatHistoryBackdrop = () =>
    setIsDeleteChatHistoryBackdropShown(false);
  const closeDeleteMoodTrackerHistoryBackdrop = () =>
    setIsDeleteMoodTrackerHistoryBackdropShown(false);

  return (
    <Screen>
      <UserDetailsBlock
        navigation={navigation}
        openDeleteAccountBackdrop={openDeleteAccountBackdrop}
        openChangePasswordBackdrop={openChangePasswordBackdrop}
        openSelectAvatarBackdrop={openSelectAvatarBackdrop}
        openDeletePictureBackdrop={openDeletePictureBackdrop}
        openDeleteChatHistoryBackdrop={openDeleteChatHistoryBackdrop}
        openDeleteMoodTrackerHistoryBackdrop={
          openDeleteMoodTrackerHistoryBackdrop
        }
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
      <DeleteProfilePicture
        isOpen={isDeletePictureBackdropShown}
        onClose={closeDeletePictureBackdrop}
      />
      <DeleteChatHistory
        isOpen={isDeleteChatHistoryBackdropShown}
        onClose={closeDeleteChatHistoryBackdrop}
      />
      <DeleteMoodTrackerHistory
        isOpen={isDeleteMoodTrackerHistoryBackdropShown}
        onClose={closeDeleteMoodTrackerHistoryBackdrop}
      />
    </Screen>
  );
};
