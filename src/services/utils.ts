import { AddressDto, UserDto } from '@/types';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: AddressDto): string {
  return `${address?.street}, ${address?.city}, ${address?.zipCode}`;
}
