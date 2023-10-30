import React from "react";
import { useTranslation } from "react-i18next";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";

import { Icon, AppText } from "#components";
import {
  Dashboard,
  InformationalPortal,
  MyQA,
  Consultations,
  MoodTracker,
} from "#screens";

import { appStyles } from "#styles";
import LinearGradient from "../components/LinearGradient";

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
    iconName: "calendar",
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
          <LinearGradient
            gradient={appStyles.gradientPrimary}
            style={styles.gradientCircle}
          >
            <View style={styles.btnCircle}>
              <Pressable
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
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
                    name="calendar"
                    color={
                      selectedTab === "Consultations"
                        ? appStyles.colorPrimary_20809e
                        : appStyles.colorGray_92989b
                    }
                  />
                </View>
              </Pressable>
            </View>
          </LinearGradient>
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
    backgroundColor: appStyles.colorWhite_ff,
    borderColor: "transparent",
    borderRadius: 50,
    borderWidth: 1,
    elevation: Platform.OS === "android" ? 5 : 0,
    flexGrow: 1,
    height: 57,
    padding: 16,
    width: 57,
  },
  gradientCircle: {
    alignItems: "center",
    borderRadius: 35,
    bottom: 20,
    elevation: Platform.OS === "android" ? 10 : 0,
    height: 60,
    justifyContent: "center",
    overflow: "hidden",
    padding: 2,
    width: 60,
  },

  selectedCircleButton: { borderColor: appStyles.colorPrimary_20809e },
});
