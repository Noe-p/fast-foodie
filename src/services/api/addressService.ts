import { CreateAddressApi, UpdateAddressApi, UserDto } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';
import { AddressDto } from '@/types/dto/Address';
import axios from 'axios';

const searchAutoComplete = async (search: string): Promise<AddressDto[]> => {
  const api = 'https://api.geoapify.com/v1/geocode/autocomplete';
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

  const config = {
    method: 'get',
    url: `${api}?text=${search}&apiKey=${apiKey}`,
    headers: {},
  };

  try {
    const response = await axios(config);
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return response.data.features.map((f: any) => {
      return {
        street: f.properties.address_line1,
        city: f.properties.city,
        country: f.properties.country,
        zipCode: f.properties.postcode,
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

const create = async (data: CreateAddressApi): Promise<AddressDto> => {
  return (await HttpService.post(API_ROUTES.address.create, data)).data;
};

const update = async (id: string, data: UpdateAddressApi): Promise<UserDto> => {
  return (await HttpService.patch(API_ROUTES.address.updateById(id), data))
    .data;
};

const getById = async (id: string): Promise<AddressDto> => {
  return (await HttpService.get(API_ROUTES.address.getById(id))).data;
};

const deleteById = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.address.deleteById(id));
};

export const AddressApiService = {
  create,
  update,
  getById,
  deleteById,
  searchAutoComplete,
};
