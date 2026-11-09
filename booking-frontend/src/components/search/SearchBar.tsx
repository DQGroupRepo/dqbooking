import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TagDirectoryService from "../../services/TagDirectoryService";
import type { TagSuggestion } from "../../types/ServiceTag";
import "./SearchBar.css";

const SearchBar = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [categoryTag, setCategoryTag] = useState("");
  const [locations, setLocations] = useState<TagSuggestion[]>([]);

  useEffect(() => {
    let active = true;
    TagDirectoryService.locations("Kerala")
      .then(items => { if (active) setLocations(items); })
      .catch(error => console.error("Unable to load Kerala location directory", error));
    return () => { active = false; };
  }, []);

  const search = () => {
    const params = new URLSearchParams();
    if (categoryTag.trim()) params.set("categoryTag", categoryTag.trim());
    if (location) params.set("location", location);
    navigate(`/categories?${params.toString()}`);
  };

  return (
    <section className="search-strip">
      <div className="container">
        <div className="search-results-box">
          <select aria-label="Location" value={location} onChange={e => setLocation(e.target.value)}>
            <option value="">All Kerala locations</option>
            {locations.map(item => <option key={item.id} value={item.name}>{item.name}{item.district ? `, ${item.district}` : ""}</option>)}
          </select>
          <select aria-label="Category tag" value={categoryTag} onChange={e => setCategoryTag(e.target.value)}>
            <option value="">All categories</option>
            <option value="Hall">Hall</option>
            <option value="Photography">Photography</option>
            <option value="Videography">Videography</option>
            <option value="Makeup">Makeup</option>
            <option value="Catering">Catering</option>
          </select>
          <button type="button" onClick={search}>Search</button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
