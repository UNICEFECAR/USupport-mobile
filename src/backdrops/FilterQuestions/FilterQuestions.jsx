import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

import { Backdrop, Dropdown, Loading } from "#components";
import { useGetQuestionsTags } from "#hooks";

/**
 * FilterQuestions
 *
 * The FilterQuestions backdrop
 *
 * @return {jsx}
 */
export const FilterQuestions = ({ isOpen, onClose, selectedTag, setTag }) => {
  const { t } = useTranslation("filter-questions");

  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (tags.length > 0 && selectedTag) {
      setSelectedTagId(tags.find((tag) => tag.label === selectedTag).id);
    }
  }, [tags]);

  const onSuccess = (data) => {
    setTags(data);
  };
  const tagsQuery = useGetQuestionsTags(onSuccess);

  const [selectedTagId, setSelectedTagId] = useState();

  const handleSave = () => {
    const selectedTag = tags.find((tag) => tag.id === selectedTagId).label;
    setTag(selectedTag);
    onClose();
  };

  const handleReset = () => {
    setTag("");
    onClose();
  };

  return (
    <Backdrop
      title="FilterQuestions"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      ctaLabel={t("cta_label")}
      ctaHandleClick={handleSave}
      secondaryCtaStyle={{ marginBottom: 85 }}
      secondaryCtaLabel={t("reset_label")}
      secondaryCtaHandleClick={handleReset}
      secondaryCtaType="secondary"
    >
      {tagsQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      ) : (
        <View>
          <Dropdown
            label={t("dropdown_label")}
            options={tags.map((tag) => {
              return { value: tag.id, ...tag };
            })}
            setSelected={setSelectedTagId}
            dropdownId="filter-questions-dropdown"
            selected={selectedTagId}
          />
        </View>
      )}
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    width: "96%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
