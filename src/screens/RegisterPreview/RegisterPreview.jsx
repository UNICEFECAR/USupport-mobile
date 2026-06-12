import { StyleSheet } from "react-native";
import Config from "react-native-config";

import { Screen, CachedImage } from "#components";
import { RegisterPreview as RegisterPreviewBlock } from "#blocks";

const { AMAZON_S3_BUCKET } = Config;

/**
 * RegisterPreview
 *
 * RegisterPreview screen
 *
 * @returns {JSX.Element}
 */
export const RegisterPreview = ({ navigation }) => {
  return (
    <Screen
      hasEmergencyButton={false}
      outsideComponent={
        <>
          <CachedImage
            source={{
              uri: `${AMAZON_S3_BUCKET}/spiral-background-2`,
            }}
            style={styles.background}
            resizeMode="cover"
          />
          <CachedImage
            source={{
              uri: `${AMAZON_S3_BUCKET}/radial-green`,
            }}
            style={styles.background}
            resizeMode="stretch"
          />
        </>
      }
    >
      <RegisterPreviewBlock navigation={navigation} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "120%",
    position: "absolute",
    zIndex: -1,
  },
});
