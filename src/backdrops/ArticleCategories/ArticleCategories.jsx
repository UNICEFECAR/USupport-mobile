import { Backdrop, AppText, Loading } from "#components";
import { appStyles } from "#styles";
import { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

/**
 * ArticleCategories
 *
 * ArticleCategories backdrop
 *
 * @return {jsx}
 */

export const ArticleCategories = ({
  isOpen,
  onClose,
  allCategories,
  handleCategorySelect,
  selectedCategory,
  handleSetCategories,
}) => {
  const { t } = useTranslation("article-categories");
  const handleCategoryOnPress = useCallback(
    (index) => {
      const categoriesCopy = [...allCategories];

      for (let i = 0; i < categoriesCopy.length; i++) {
        if (i === index) {
          categoriesCopy[i].isSelected = true;
          handleCategorySelect(categoriesCopy[i]);
        } else {
          categoriesCopy[i].isSelected = false;
        }
      }
      handleSetCategories(categoriesCopy);
    },
    [allCategories, handleCategorySelect, handleSetCategories]
  );

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      heading={t("categories")}
      style={{
        height: appStyles.screenHeight * 0.5,
      }}
    >
      <View style={styles.wrapper}>
        {allCategories && allCategories.length > 0 ? (
          allCategories?.map((category, index) => (
            <TouchableOpacity
              style={styles.tab}
              key={index}
              onPress={() => {
                handleCategoryOnPress(index);
              }}
            >
              <AppText
                style={[
                  styles.tabText,
                  category?.isSelected && styles.tabTextSelected,
                ]}
              >
                {category.label}
              </AppText>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignSelf: "center" }}>
            <Loading />
          </View>
        )}
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  tab: {
    paddingTop: 10,
  },
  tabText: {
    textAlign: "center",
  },
  tabTextSelected: {
    color: appStyles.colorGray_66768d,
    fontFamily: appStyles.fontBold,
  },
  wrapper: {
    alignSelf: "center",
  },
});
