import { useEffect, useMemo, useState } from "react";
import TagDirectoryService from "../../../services/TagDirectoryService";
import type { TagSuggestion } from "../../../types/ServiceTag";
import "./TagChipSelector.css";

interface Props {
    label: string;
    values: string[];
    onChange: (values: string[]) => void;
    mode: "CATEGORY" | "LOCATION";
    parentCategory?: string;
}

export default function TagChipSelector({
    label,
    values,
    onChange,
    mode,
    parentCategory = ""
}: Props) {
    const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let alive = true;

        const loadSuggestions = async () => {
            setLoading(true);
            try {
                if (mode === "CATEGORY") {
                    const data = await TagDirectoryService.categories(parentCategory);
                    if (alive) setSuggestions(data);
                } else {
                    const data = await TagDirectoryService.districts();
                    if (alive) {
                        setDistricts(data);
                        setSuggestions([]);
                        setSelectedDistrict("");
                    }
                }
            } catch (error) {
                console.error("Unable to load tag suggestions", error);
            } finally {
                if (alive) setLoading(false);
            }
        };

        void loadSuggestions();
        return () => { alive = false; };
    }, [mode, parentCategory]);

    useEffect(() => {
        if (mode !== "LOCATION" || !selectedDistrict) return;
        let alive = true;
        setLoading(true);
        TagDirectoryService.locations("Kerala", selectedDistrict)
            .then(data => { if (alive) setSuggestions(data); })
            .catch(error => console.error("Unable to load district localities", error))
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [mode, selectedDistrict]);

    const filtered = useMemo(() => {
        const query = text.trim().toLowerCase();
        return suggestions.filter(suggestion =>
            suggestion.name.toLowerCase().includes(query) &&
            !values.some(value => value.toLowerCase() === suggestion.name.toLowerCase())
        );
    }, [suggestions, text, values]);

    const add = (value: string) => {
        const clean = value.trim().replace(/\s+/g, " ");
        if (!clean || values.some(item => item.toLowerCase() === clean.toLowerCase())) return;
        onChange([...values, clean]);
        setText("");
    };

    const addCustom = async () => {
        const clean = text.trim().replace(/\s+/g, " ");
        if (!clean) return;
        add(clean);
        try {
            if (mode === "CATEGORY") {
                await TagDirectoryService.addCategory(parentCategory, clean);
            } else if (selectedDistrict) {
                await TagDirectoryService.addLocation(clean, selectedDistrict);
            }
        } catch (error) {
            console.warn("Custom tag retained for this service; directory submission failed", error);
        }
    };

    const isCustomValue = text.trim() && !suggestions.some(
        suggestion => suggestion.name.toLowerCase() === text.trim().toLowerCase()
    );

    return (
        <div className={`tag-selector ${mode === "LOCATION" ? "location-tag-selector" : ""}`}>
            <label>{label}</label>

            <div className="tag-selected">
                {values.map(value => (
                    <button
                        type="button"
                        key={value}
                        className="tag-pill selected"
                        onClick={() => onChange(values.filter(item => item !== value))}
                        aria-label={`Remove ${value}`}
                    >
                        {value}<span aria-hidden="true"> ×</span>
                    </button>
                ))}
            </div>

            {mode === "LOCATION" && (
                <>
                    <p className="tag-selector-hint" title="Select a district first. Once selected, choose the specific areas or localities within that district.">
                        <span className="tag-selector-hint-icon" aria-hidden="true">ⓘ</span>
                        Select a district first; then choose specific areas within it.
                    </p>
                    <div className="tag-district-list" aria-label="Kerala districts">
                        {districts.map(district => (
                            <button
                                type="button"
                                key={district}
                                className={`tag-pill district-pill ${selectedDistrict === district ? "selected" : ""}`}
                                onClick={() => {
                                    setSelectedDistrict(district);
                                    setText("");
                                }}
                                aria-pressed={selectedDistrict === district}
                            >
                                {district}
                            </button>
                        ))}
                    </div>
                    {selectedDistrict && (
                        <div className="tag-selected-district">
                            <strong>{selectedDistrict}</strong>
                            <span> — Select specific areas</span>
                            <button type="button" onClick={() => { setSelectedDistrict(""); setSuggestions([]); setText(""); }}>
                                Change district
                            </button>
                        </div>
                    )}
                </>
            )}

            {(mode === "CATEGORY" || selectedDistrict) && (
                <>
                    <input
                        value={text}
                        onChange={event => setText(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void addCustom();
                            }
                        }}
                        placeholder={mode === "LOCATION" ? `Search or add areas in ${selectedDistrict}` : `Search or add ${label.toLowerCase()}`}
                        title={mode === "LOCATION" ? "Select a district first, then search or add a specific area." : undefined}
                    />
                    {loading && <div className="tag-selector-status">Loading suggestions...</div>}
                    <div className="tag-suggestions">
                        {filtered.map(suggestion => (
                            <button type="button" key={suggestion.id} className="tag-pill" onClick={() => add(suggestion.name)}>
                                {suggestion.name} +
                            </button>
                        ))}
                        {isCustomValue && (
                            <button type="button" className="tag-pill custom" onClick={() => void addCustom()}>
                                Add “{text.trim()}”
                            </button>
                        )}
                        {!loading && selectedDistrict && filtered.length === 0 && !text.trim() && (
                            <span className="tag-selector-status">No areas are listed for this district yet. You can add one using the search box.</span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
