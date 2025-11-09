import appStyles from "./appStyles";

const light = {
  background: appStyles.colorWhite_ff,
  text: appStyles.colorBlue_3d527b,
  textSecondary: appStyles.colorGray_66768d,
  textTertiary: appStyles.colorBlack_37,
  card: appStyles.colorWhite_ff,
  navigation: appStyles.colorWhite_ff,
  input: appStyles.colorWhite_ff,
  cardMedia: appStyles.colorBlue_eaf7f9,
};

const dark = {
  background: appStyles.colorBlack_242127,
  text: appStyles.colorGray_ea,
  textSecondary: appStyles.colorGray_a6b4b8,
  textTertiary: appStyles.colorWhite_ff,
  card: appStyles.colorBlack_1e,
  navigation: appStyles.colorBlack_1d,
  input: appStyles.colorBlack_37,
  cardMedia: appStyles.colorBlack_1e,
};

const highContrast = {
  background: appStyles.colorBlack_242127,
  text: appStyles.colorHighContrast_ffff00,
  textSecondary: appStyles.colorHighContrast_ffff00,
  textTertiary: appStyles.colorHighContrast_ffff00,
  card: appStyles.colorBlack_1e,
  navigation: appStyles.colorBlack_1d,
  input: appStyles.colorBlack_37,
  cardMedia: appStyles.colorBlack_1e,
};

export default { light, dark, highContrast };
