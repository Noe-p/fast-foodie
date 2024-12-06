export interface Option {
  label: string;
  value: string;
}

export interface OptionDescriptor extends Option {
  selected?: boolean;
  disabled?: boolean;
}
