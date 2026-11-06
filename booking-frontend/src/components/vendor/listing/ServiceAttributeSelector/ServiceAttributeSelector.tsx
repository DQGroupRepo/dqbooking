import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ServiceAttributeDirectoryService from "../../../../services/ServiceAttributeDirectoryService";
import type {
  ServiceAttributeSuggestion,
  ServiceAttributeType
} from "../../../../types/ServiceAttributeSuggestion";
import "./ServiceAttributeSelector.css";

interface Props {
  category: string;
  type: ServiceAttributeType;
  title: string;
  subtitle: string;
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function ServiceAttributeSelector({
  category,
  type,
  title,
  subtitle,
  selected,
  onChange
}: Props) {
  const [suggestions, setSuggestions] = useState<ServiceAttributeSuggestion[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ServiceAttributeDirectoryService.getSuggestions(category, type)
      .then(items => { if (mounted) setSuggestions(items); })
      .catch(() => { if (mounted) toast.error(`Unable to load ${title.toLowerCase()} suggestions.`); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [category, type, title]);

  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();

  const filtered = useMemo(() => {
    const q = normalize(query);
    return suggestions.filter(item =>
      !selected.some(value => normalize(value) === normalize(item.name)) &&
      (!q || normalize(item.name).includes(q))
    ).slice(0, 30);
  }, [suggestions, selected, query]);

  const add = (name: string) => {
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean || selected.some(value => normalize(value) === normalize(clean))) return;
    onChange([...selected, clean]);
    setQuery("");
  };

  const addCustom = async () => {
    const clean = query.trim().replace(/\s+/g, " ");
    if (!clean) return;
    if (selected.some(value => normalize(value) === normalize(clean))) {
      setQuery("");
      return;
    }
    setAdding(true);
    try {
      const saved = await ServiceAttributeDirectoryService.addCustom(category, type, clean);
      add(saved.name || clean);
      toast.success(`Added ${clean}.`);
    } catch (error) {
      // Do not block the service listing if the directory request fails.
      // The custom value is still saved with the service itself.
      add(clean);
      toast("Added to this service. It can be suggested globally after review.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="service-attribute-selector">
      <div className="service-attribute-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span>{selected.length} selected</span>
      </div>

      <div className="service-attribute-selected">
        {selected.length ? selected.map(value => (
          <button
            type="button"
            className="service-attribute-chip selected"
            key={normalize(value)}
            onClick={() => onChange(selected.filter(item => normalize(item) !== normalize(value)))}
            aria-label={`Remove ${value}`}
          >
            {value}<span aria-hidden="true"> ×</span>
          </button>
        )) : <span className="service-attribute-empty">No {title.toLowerCase()} selected yet.</span>}
      </div>

      <div className="service-attribute-search">
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (filtered.length === 1 && normalize(filtered[0].name) === normalize(query)) add(filtered[0].name);
              else addCustom();
            }
          }}
          placeholder={`Search or add a ${type === "FACILITY" ? "facility" : "amenity"}...`}
          maxLength={80}
        />
        {query.trim() && (
          <button type="button" onClick={addCustom} disabled={adding}>
            {adding ? "Adding..." : `+ Add "${query.trim()}"`}
          </button>
        )}
      </div>

      <div className="service-attribute-suggestions">
        {loading ? <span className="service-attribute-empty">Loading suggestions...</span> :
          filtered.length ? filtered.map(item => (
            <button
              type="button"
              className="service-attribute-chip"
              key={item.id || item.name}
              onClick={() => add(item.name)}
            >
              + {item.name}
            </button>
          )) : (
            <span className="service-attribute-empty">
              {query.trim() ? "No matching suggestions. Add your own above." : "No suggestions available."}
            </span>
          )}
      </div>
    </section>
  );
}
