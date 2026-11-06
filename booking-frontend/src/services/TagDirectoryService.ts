import api from "../api/axiosConfig";
import type { TagSuggestion } from "../types/ServiceTag";

class TagDirectoryService {
    async categories(parentCategory: string): Promise<TagSuggestion[]> {
        const response = await api.get<TagSuggestion[]>("/tag-directory/categories", {
            params: { parentCategory }
        });
        return response.data;
    }

    // Used by Header.tsx for customer-facing category autocomplete.
    async categorySuggestions(query: string): Promise<TagSuggestion[]> {
        const response = await api.get<TagSuggestion[]>("/tag-directory/category-suggestions", {
            params: { q: query }
        });
        return response.data;
    }

    // Used by the vendor location selector to populate the district list.
    async districts(state = "Kerala"): Promise<string[]> {
        const response = await api.get<string[]>("/tag-directory/locations/districts", {
            params: { state }
        });
        return response.data;
    }

    async locations(state = "Kerala", district?: string): Promise<TagSuggestion[]> {
        const response = await api.get<TagSuggestion[]>("/tag-directory/locations", {
            params: {
                state,
                ...(district ? { district } : {})
            }
        });
        return response.data;
    }

    async addCategory(parentCategory: string, name: string): Promise<TagSuggestion> {
        const response = await api.post<TagSuggestion>("/tag-directory/categories", {
            parentCategory,
            name
        });
        return response.data;
    }

    async addLocation(name: string, district = ""): Promise<TagSuggestion> {
        const response = await api.post<TagSuggestion>("/tag-directory/locations", {
            state: "Kerala",
            district,
            name
        });
        return response.data;
    }
}

export default new TagDirectoryService();
