import React, { useState } from "react";
import { Screen } from "#components";
import { UserDetails as UserDetailsBlock } from "#blocks";

import { userSvc } from "#services";

/**
 * UserDetails
 *
 * User Details page
 *
 * @returns {JSX.Element}
 */
export const UserDetails = ({ navigation }) => {
  const isTmpUser = userSvc.getUserID() === "tmp-user";

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegisterRedirection = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("expires-in");
    navigate("/register-preview");
  };

  const handleLogout = () => {
    userSvc.logout();
    navigate("/");
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Screen>
      <UserDetailsBlock
        {...{ openModal, closeModal, isTmpUser }}
        navigation={navigation}
      />
    </Screen>
  );
};
