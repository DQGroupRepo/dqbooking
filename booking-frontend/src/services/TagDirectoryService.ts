import api from "../api/axiosConfig";
import type { TagSuggestion } from "../types/ServiceTag";
class TagDirectoryService {
 async categories(parentCategory: string): Promise<TagSuggestion[]> { const r=await api.get<TagSuggestion[]>("/tag-directory/categories",{params:{parentCategory}}); return r.data; }
 async categorySuggestions(query: string): Promise<TagSuggestion[]> { const r=await api.get<TagSuggestion[]>("/tag-directory/category-suggestions",{params:{q:query}}); return r.data; }
 async locations(state="Kerala"): Promise<TagSuggestion[]> { const r=await api.get<TagSuggestion[]>("/tag-directory/locations",{params:{state}}); return r.data; }
 async addCategory(parentCategory:string,name:string):Promise<TagSuggestion>{const r=await api.post<TagSuggestion>("/tag-directory/categories",{parentCategory,name});return r.data;}
 async addLocation(name:string,district="") :Promise<TagSuggestion>{const r=await api.post<TagSuggestion>("/tag-directory/locations",{state:"Kerala",district,name});return r.data;}
}
export default new TagDirectoryService();
