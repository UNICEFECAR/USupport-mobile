import * as SecureStore from "expo-secure-store";

const setItem = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    console.log(err);
  }
};

const getItem = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    console.log(err);
  }
};

const removeItem = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.log(err);
  }
};

export default { setItem, getItem, removeItem };
