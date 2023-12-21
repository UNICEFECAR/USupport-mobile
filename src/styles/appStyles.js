import { Dimensions, Platform, Test } from "react-native";

export default {
  screenWidth: Dimensions.get("window").width,
  screenHeight: Dimensions.get("window").height,

  maxFontSizeMultiplier: 1.5,

  platform: Platform.OS,

  //Fonts
  fontLight: "Nunito_300Light",
  fontRegular: "Nunito_400Regular",
  fontMedium: "Nunito_500Medium",
  fontSemiBold: "Nunito_600SemiBold",
  fontBold: "Nunito_700Bold",
  fontExtraBold: "Nunito_800ExtraBold",

  // Colors
  colorPrimary_20809e: "#20809e",
  colorPrimaryPressed_156f8c: "#156f8c",
  colorPrimaryPressed_0c5f7a: "#0c5f7a",

  colorSecondary_9749fa: "#9749fa",
  colorSecondaryPressed_7f2ee5: "#7f2ee5",
  colorSecondaryPressed_6c16d9: "#6c16d9",

  colorBlack_00: "#000000",
  colorBlack_37: "#373737",

  colorWhite_ff: "#ffffff",
  colorTransparent: "rgba(0, 0, 0, 0)",

  colorGray_ea: "#eaeaea",
  colorGray_92989b: "#92989b",
  colorGray_a6b4b8: "#a6b4b8",
  colorGray_66768d: "#66768d",
  colorGray_344054: "#344054",

  colorGreen_54cfd9: "#54cfd9",
  colorGreen_c1eaea: "#c1eaea",
  colorGreen_f4f7fe: "#f4f7fe",
  colorGreen_e6f1f4: "#e6f1f4",
  colorGreen_7ec680: "#7ec680",

  colorPurple_dac3f6: "#dac3f6",
  colorPurple_c39af9: "#c39af9",

  colorBlue_2a54bc: "#2a54bc",
  colorBlue_3d527b: "#3d527b",
  colorBlue_263238: "#263238",
  colorBlue_20809E_0_3: "rgba(32, 128, 158, 0.3)",
  color_blue_c1d7e0: "#c1d7e0",

  colorRed_eb5757: "#eb5757",
  colorRed_cc4c4c: "#cc4c4c",
  colorRed_a63d3d: "#a63d3d",
  colorRed_ed5657: "#ed5657",

  // Gradients
  gradientPrimary: {
    degrees: 270,
    locations: [1.31, 42.92, 93.14],
    colors: ["#0daeb2", "#d6d2ff", "#814afd"],
  },
  gradientSecondary: {
    degrees: 90.14,
    locations: [0.27, 57.25, 99.5],
    colors: [
      "rgba(13, 174, 178, 0.2)",
      "rgba(214, 210, 255, 0.0846922)",
      "rgba(129, 74, 253, 0.2)",
    ],
  },
  gradientSecondary2: {
    degrees: 270,
    locations: [1.31, 42.92, 93.14],
    colors: [
      "rgba(13, 174, 178, 0.1)",
      "rgba(214, 210, 255, 0.1)",
      "rgba(129, 74, 253, 0.1)",
    ],
  },
  gradientSecondary3: {
    degrees: 270,
    locations: [1.31, 42.92, 93.14],
    colors: [
      "rgba(13, 174, 178, 0.4)",
      "rgba(214, 210, 255, 0.4)",
      "rgba(129, 74, 253, 0.2)",
    ],
  },

  gradientConsultationBig: {
    degrees: 80.08,
    locations: [0, 54.48, 100],
    colors: [
      "rgba(13, 174, 178, 0.3)",
      "rgba(191, 234, 234, 0.3)",
      "rgba(85, 208, 218, 0.3)",
    ],
  },

  gradientTransparent: {
    degrees: 180,
    locations: [0, 100],
    colors: ["rgba(255, 255, 255, 0)", "#ffffff"],
  },

  shadow1: {
    shadowColor: Platform.OS === "ios" ? "#684dfd1a" : "#684dfd",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.57,
    shadowRadius: 5,

    elevation: 5,
  },

  shadow2: {
    shadowColor: Platform.OS === "ios" ? "#684dfd33" : "#684dfd",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,

    elevation: 5,
  },

  shadow3: {
    shadowColor: Platform.OS === "ios" ? "#684dfd4d" : "#684dfd",
    shadowOffset: {
      width: 4,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 7,

    elevation: 5,
  },

  overlay: "rgba(102, 118, 141, 0.5)",
  springConfig: {
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 200,
  },
  hitSlop: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
};
