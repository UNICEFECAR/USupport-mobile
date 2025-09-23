import { create } from "zustand";

export const useDropdownOptions = create((set) => ({
  isOpen: false,
  options: [],
  heading: "",
  selectedOption: "",
  selectedValues: [],
  dropdownId: null,
  emptyMessage: "",
  handleOptionSelect: () => {},
  shouldShowNavigationOnClose: true,

  openDropdown: () => set(() => ({ isOpen: true })),
  closeDropdown: () => set(() => ({ isOpen: false })),

  setDropdownOptions: (options) => set(() => ({ ...options })),
  loading: false,
  multiSelect: false,
  //   setHandleOptionsSelect: (fn: (params: any) => void) =>
  //     set(() => ({ handleOptionSelect: fn })),
}));

export default useDropdownOptions;
