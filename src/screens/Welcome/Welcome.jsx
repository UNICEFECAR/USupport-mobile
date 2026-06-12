import { StyleSheet } from "react-native";
import Config from "react-native-config";

import { Screen, CachedImage } from "#components";
import { Welcome as WelcomeBlock } from "#blocks";

const { AMAZON_S3_BUCKET } = Config;

export const Welcome = ({ navigation }) => {
  return (
    <Screen
      hasEmergencyButton={false}
      backgroundImage={false}
      outsideComponent={
        <>
          <CachedImage
            source={{
              uri: `${AMAZON_S3_BUCKET}/welcome-spiral`,
            }}
            style={styles.spiralBackground}
            resizeMode="stretch"
          />
          <CachedImage
            source={{
              uri: `${AMAZON_S3_BUCKET}/welcome-radial`,
            }}
            style={styles.radialBackround}
            resizeMode="stretch"
          />
        </>
      }
    >
      <WelcomeBlock navigation={navigation} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  spiralBackground: {
    width: "120%",
    height: "120%",
    position: "absolute",
    zIndex: -1,
  },
  radialBackround: {
    width: "120%",
    height: "120%",
    position: "absolute",
    bottom: 0,
    right: 0,
    zIndex: -1,
  },
});
