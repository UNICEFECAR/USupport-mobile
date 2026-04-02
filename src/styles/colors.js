import appStyles from "./appStyles";

const light = {
  background: appStyles.colorWhite_ff,
  text: appStyles.colorTextMain_0e202f, // Matches web: #0e202f
  textSecondary: appStyles.colorGray_66768d,
  textTertiary: appStyles.colorBlack_37,
  card: appStyles.colorWhite_ff,
  navigation: appStyles.colorWhite_ff,
  input: appStyles.colorWhite_ff,
  inputText: appStyles.colorBlue_6989a4,
  inputBorder: appStyles.colorGray_cdd8e1,
  // CardMedia (match web CardMedia light theme)
  cardMedia: appStyles.colorCardMediaSurfaceLight_rgba,
  cardMediaBorder: appStyles.colorCardMediaBorderLight_rgba,
  cardMediaCategoryBg: appStyles.colorCardMediaCategoryBg_rgba,
  cardMediaCategoryBorder: appStyles.colorCardMediaCategoryBorder_rgba,
  cardMediaCategoryText: appStyles.colorCardMediaCategoryText_234567,
  cardMediaGradient: ["rgba(225, 233, 252, 0.9)", "rgba(205, 218, 248, 0.8)"],
  cardMediaGradientBorder: "rgba(224, 233, 255, 0.72)",
  cardMediaSeparator: appStyles.colorGray_ea,
  cardMediaMetaText: appStyles.colorOrangeArticleCreator_ba7446,
};

const dark = {
  background: appStyles.colorBlack_242127,
  text: appStyles.colorTextMain_ededed, // Matches web: #ededed
  textSecondary: appStyles.colorGray_a6b4b8,
  textTertiary: appStyles.colorWhite_ff,
  card: appStyles.colorBlack_1e,
  navigation: appStyles.colorBlack_1d,
  input: appStyles.colorBlack_31,
  inputText: appStyles.color_blue_c1d7e0,
  inputBorder: appStyles.colorGray_cdd8e1,
  cardMedia: appStyles.colorBlack_1e,
  cardMediaBorder: "rgba(137, 157, 209, 0.3)",
  cardMediaCategoryBg: appStyles.colorCardMediaCategoryBg_rgba,
  cardMediaCategoryBorder: appStyles.colorCardMediaCategoryBorder_rgba,
  cardMediaCategoryText: appStyles.colorCardMediaCategoryText_234567,
  cardMediaGradient: ["rgba(30, 46, 86, 0.82)", "rgba(19, 32, 65, 0.78)"],
  cardMediaGradientBorder: "rgba(137, 157, 209, 0.3)",
  cardMediaSeparator: appStyles.colorGray_344054,
  cardMediaMetaText: appStyles.colorOrangeArticleCreator_ba7446,
};

const highContrast = {
  background: appStyles.colorBlack_242127,
  text: appStyles.colorHighContrast_ffff00,
  textSecondary: appStyles.colorHighContrast_ffff00,
  textTertiary: appStyles.colorHighContrast_ffff00,
  card: appStyles.colorBlack_1e,
  navigation: appStyles.colorBlack_1d,
  input: appStyles.colorBlack_31,
  inputText: appStyles.colorHighContrast_ffff00,
  inputBorder: appStyles.colorGray_cdd8e1,
  cardMedia: appStyles.colorBlack_1e,
  cardMediaBorder: "rgba(137, 157, 209, 0.3)",
  cardMediaCategoryBg: appStyles.colorCardMediaCategoryBg_rgba,
  cardMediaCategoryBorder: appStyles.colorCardMediaCategoryBorder_rgba,
  cardMediaCategoryText: appStyles.colorCardMediaCategoryText_234567,
  cardMediaGradient: ["rgba(30, 46, 86, 0.82)", "rgba(19, 32, 65, 0.78)"],
  cardMediaGradientBorder: "rgba(137, 157, 209, 0.3)",
  cardMediaSeparator: appStyles.colorGray_344054,
  cardMediaMetaText: appStyles.colorOrangeArticleCreatorHC_ffc18c,
};

export default { light, dark, highContrast };
