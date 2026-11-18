import api from "../api/axiosConfig";
import type { Vendor } from "../types/Vendor";

export const getAllVendors = async (): Promise<Vendor[]> => {
  const response = await api.get<Vendor[]>("/vendors");
  return response.data;
};

export const getVendorById = async (id: number): Promise<Vendor> => {
  const response = await api.get<Vendor>(`/vendors/${id}`);
  return response.data;
};

export const searchVendors = async (
  category?: string,
  city?: string,
): Promise<Vendor[]> => {
  const response = await api.get<Vendor[]>("/vendors/search", {
    params: {
      category,
      city,
    },
  });

  return response.data;
};
