import api from "../api/axios";

export interface VendorPermissionsResponse {
  viewPages: string[];
  editPages: string[];
}

const VendorPermissionService = {

  async getCurrentPermissions(): Promise<VendorPermissionsResponse> {

    const response =
      await api.get<VendorPermissionsResponse>(
        "/vendor/permissions"
      );

    return response.data;
  }

};

export default VendorPermissionService;