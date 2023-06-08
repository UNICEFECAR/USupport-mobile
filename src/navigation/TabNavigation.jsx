import React from "react";
import { useTranslation } from "react-i18next";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import { View, StyleSheet, TouchableOpacity, Pressable } from "react-native";

import { Icon, AppText } from "#components";

import {
  Dashboard,
  InformationalPortal,
  MyQA,
  Consultations,
  MoodTracker,
} from "#screens";

import { appStyles } from "#styles";

const screens = [
  {
    name: "Dashboard",
    component: Dashboard,
    text: "home",
    iconName: "home",
    position: "LEFT",
  },
  {
    name: "MoodTrackHistory",
    component: MoodTracker,
    iconName: "mood",
    text: "mood",
    position: "RIGHT",
  },
  {
    name: "MyQA",
    component: MyQA,
    iconName: "my-qa",
    text: "qaa",
    position: "RIGHT",
  },
  {
    name: "InformationalPortal",
    component: InformationalPortal,
    iconName: "read-book",
    text: "articles",
    position: "LEFT",
  },
  {
    name: "Consultations",
    component: Consultations,
    iconName: "consultation",
    position: "CENTER",
  },
];

export const TabNavigation = () => {
  const { t } = useTranslation("tab-navigation");

  const takeIconName = ({ routeName, selectedTab }) => {
    return screens.find((screen) => screen.name === routeName).iconName;
  };
  const takeText = ({ routeName, selectedTab }) => {
    return screens.find((screen) => screen.name === routeName).text;
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }) => {
    const iconName = takeIconName({ routeName, selectedTab });
    const text = takeText({ routeName, selectedTab });

    return (
      <TouchableOpacity
        onPress={() => {
          navigate(routeName);
        }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          name={iconName}
          color={
            selectedTab === routeName
              ? appStyles.colorPrimary_20809e
              : appStyles.colorGray_92989b
          }
        />
        <AppText namedStyle="smallText">{t(text)}</AppText>
      </TouchableOpacity>
    );
  };

  const renderScreens = () => {
    return screens.map((screen, index) => {
      return (
        <CurvedBottomBar.Screen
          name={screen.name}
          component={screen.component}
          position={screen.position}
          key={index}
        />
      );
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <CurvedBottomBar.Navigator
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarHideOnKeyboard: Platform.OS !== "ios",
        }}
        strokeWidth={0.5}
        height={75}
        circleWidth={55}
        bgColor="white"
        initialRouteName="Dashboard"
        borderTopLeftRight={false}
        renderCircle={({ navigate, selectedTab }) => (
          <View style={[styles.btnCircle]}>
            <Pressable
              style={{
                flex: 1,
                justifyContent: "center",
              }}
              onPress={() => {
                navigate("Consultations");
              }}
            >
              <View
                style={[
                  styles.circleButton,
                  selectedTab === "Consultations" &&
                    styles.selectedCircleButton,
                ]}
              >
                <Icon
                  name="consultation"
                  color={
                    selectedTab === "Consultations"
                      ? appStyles.colorPrimary_20809e
                      : appStyles.colorGray_92989b
                  }
                />
              </View>
            </Pressable>
          </View>
        )}
        tabBar={renderTabBar}
        style={appStyles.shadow3}
      >
        {renderScreens()}
      </CurvedBottomBar.Navigator>
    </View>
  );
};

export const styles = StyleSheet.create({
  btnCircle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Platform.OS !== "ios" && "white",
    bottom: 20,
  },
  circleButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedCircleButton: { borderColor: appStyles.colorPrimary_20809e },
});
