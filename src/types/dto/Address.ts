import { BaseDto } from './BaseDto';

export interface AddressDto extends BaseDto {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}
