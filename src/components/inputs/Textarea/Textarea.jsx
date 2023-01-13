import React, { useState } from "react";
import PropTypes from "prop-types";
import { Input } from "../Input/Input";

/**
 * Textarea
 *
 * Textarea component
 *
 * @return {jsx}
 */
export const Textarea = ({ ...props }) => {
  return <Input {...props} multiline numberOfLines={5} isTextarea />;
};
