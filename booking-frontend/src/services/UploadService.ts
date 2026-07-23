import api from "../api/axiosConfig";

class UploadService {

    async uploadImages(files: File[]): Promise<string[]> {

        const formData = new FormData();

        files.forEach(file => {
            formData.append("files", file);
        });

        const response = await api.post<string[]>(
            "/uploads/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;
    }

}

export default new UploadService();