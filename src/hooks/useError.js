export default function useError(error) {
  return error.response.data.error;
}

export { useError };
