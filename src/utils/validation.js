import Joi, { required } from "joi";

/**
 * Use to validate a single property from the provided schema.
 *
 * @param {string} name the name of the property as it appears in the schema
 * @param {string} value the value of the property to validate
 * @param {object} schema the schema against which to validate the property
 * @param {function} setErrors the function used to set the errors if any
 */
function validateProperty(name, value, schema, setErrors) {
  try {
    setErrors({}); // clear all errors

    const obj = { [name]: value };
    const result = Joi.attempt(obj, schema);

    return result[name];
  } catch (err) {
    const errMsg = err.details[0].context.label;

    setErrors({ [name]: errMsg }); // dispay the error
  }
}

/**
 * Use to validate all properties in a provided schema.
 *
 * @param {object} data the data to validate
 * @param {object} schema the schema against which to validate the data
 * @param {function} setErrors the function used to set the errors if any
 * @returns {Promise} null if no validation error
 */
async function validate(data, schema, setErrors) {
  try {
    setErrors({}); // clear all errors

    const options = { presence: required };
    await schema.validateAsync(data, options);
  } catch (err) {
    const errField = err.details[0].context.key;
    const errMsg = err.details[0].context.label;
    setErrors({ [errField]: errMsg });
    return "";
  }

  return null;
}

export { validateProperty, validate };
