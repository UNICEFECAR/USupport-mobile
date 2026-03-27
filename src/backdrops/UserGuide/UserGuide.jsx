import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";

import { Backdrop, ButtonSelector } from "#components";

/**
 * UserGuide
 *
 * The UserGuide backdrop
 *
 * @return {jsx}
 */
export const UserGuide = ({
  isOpen,
  onClose,
  handleOpenEmergencySituation,
}) => {
  const { t } = useTranslation("backdrops", { keyPrefix: "user-guide" });
  const navigation = useNavigation();

  const buttons = [
    { name: "emergency_services", icon: "phone-emergency", path: "SOSCenter" },
    { name: "map", icon: "location", onClick: handleOpenEmergencySituation },
    {
      name: "rights",
      icon: "read-book",
      path: "ChildrenRights",
      params: { start: "rights-intro" },
    },
  ];

  return (
    <Backdrop
      classes="user-guide"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
    >
      <View>
        {buttons.map((button) => (
          <ButtonSelector
            key={button.name}
            label={t(button.name)}
            iconName={button.icon}
            style={{ marginBottom: 16 }}
            onPress={() => {
              if (button.onClick) {
                button.onClick();
              } else {
                navigation.navigate(button.path, button.params);
              }
            }}
          />
        ))}
      </View>
    </Backdrop>
  );
};
