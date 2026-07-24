import { View, StyleSheet } from "react-native";
import Config from "react-native-config";
const { AMAZON_S3_BUCKET } = Config;

import LinearGradient from "../../components/LinearGradient";
import { CachedImage } from "#components";

import { appStyles } from "#styles";

export const MascotHeadingBlock = ({ image, children, style }) => {
  return (
    <LinearGradient
      gradient={appStyles.gradientSecondary}
      style={styles.mascotHeadingBlock}
    >
      <View style={[styles.contentContainer, style]}>
        <CachedImage
          source={
            image || {
              uri: `${AMAZON_S3_BUCKET}/mascot-happy-purple-full`,
            }
          }
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.childrenContainer}>{children}</View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mascotHeadingBlock: {
    borderBottomLeftRadius: 80,
    width: appStyles.screenWidth,
  },

  image: {
    width: 95,
    height: 200,
  },

  contentContainer: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingRight: 16,
    borderBottomLeftRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
  },

  childrenContainer: {
    marginLeft: 20,
    flex: 1,
  },
});
