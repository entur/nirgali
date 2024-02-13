import { Dropdown, SearchableDropdown } from '@entur/dropdown';
import React from 'react';
import { VariantType } from '@entur/form';

type TypedDropdownItem<T> = {
  value: T;
  label: string;
};

type AsyncTypedDropdownItemType<T> = (
  inputType: string,
  abortControllerRef: React.MutableRefObject<AbortController>,
) => Promise<TypedDropdownItem<T>[]>;
type SyncTypedDropdownItemType<T> = (
  inputType: string,
  abortControllerRef: React.MutableRefObject<AbortController>,
) => TypedDropdownItem<T>[];
export type PotentiallyAsyncDropdownItemType<T> =
  | TypedDropdownItem<T>[]
  | SyncTypedDropdownItemType<T>
  | AsyncTypedDropdownItemType<T>;

export function TypedDropDown<T>(props: {
  label: string;
  items: PotentiallyAsyncDropdownItemType<T>;
  selectedItem: TypedDropdownItem<T> | null;
  onChange: (value?: T) => void;
  variant?: VariantType;
  feedback?: string;
}) {
  return (
    <Dropdown
      label={props.label}
      // @ts-expect-error
      items={props.items}
      // @ts-expect-error
      selectedItem={props.selectedItem}
      // @ts-expect-error
      onChange={(item) => props.onChange(item?.value)}
      feedback={props.feedback}
      variant={props.variant}
    />
  );
}

export function TypedSearchableDropdown<T>(props: {
  label: string;
  items: PotentiallyAsyncDropdownItemType<T>;
  selectedItem: TypedDropdownItem<T> | null;
  onChange: (value?: T) => void;
  variant?: VariantType;
  feedback?: string;
}) {
  return (
    <SearchableDropdown
      label={props.label}
      // @ts-expect-error
      items={props.items}
      // @ts-expect-error
      selectedItem={props.value}
      // @ts-expect-error
      onChange={(item) => props.onChange(item?.value)}
      feedback={props.feedback}
      variant={props.variant}
    />
  );
}
