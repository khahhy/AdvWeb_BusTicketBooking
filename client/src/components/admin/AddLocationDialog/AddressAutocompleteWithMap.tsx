import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  apiKey: string;
  onSelect: (data: { address?: string; lat: number; lng: number }) => void;
  defaultLat?: number;
  defaultLng?: number;
  defaultValue?: string;
}

interface GeoapifySuggestion {
  properties: {
    place_id: string;
    formatted: string;
    lat: number;
    lon: number;
  };
}

const AddressAutocompleteWithMap = ({
  apiKey,
  onSelect,
  defaultLat = 10.762622,
  defaultLng = 106.660172,
  defaultValue = "",
}: Props) => {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
  const [lat, setLat] = useState(defaultLat);
  const [lng, setLng] = useState(defaultLng);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (!query || !showSuggestions) return;

    const fetchData = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${apiKey}`,
        );
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(fetchData);
  }, [query, showSuggestions, apiKey]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("mapContainer").setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(mapRef.current);
    }

    if (markerRef.current) markerRef.current.remove();

    markerRef.current = L.marker([lat, lng], { draggable: true })
      .addTo(mapRef.current)
      .on("dragend", function (event) {
        const marker = event.target;
        const position = marker.getLatLng();
        setLat(position.lat);
        setLng(position.lng);
        onSelect({ address: query, lat: position.lat, lng: position.lng });
      });

    mapRef.current.setView([lat, lng], 15);
  }, [lat, lng]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(e) => {
            const newText = e.target.value;
            setQuery(newText);
            setShowSuggestions(true);
            onSelect({ address: newText, lat, lng });
          }}
          placeholder="Address"
          onFocus={() => setShowSuggestions(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-[999] mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {suggestions.map((s) => (
            <li
              key={s.properties.place_id}
              className="cursor-pointer rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                const { lat, lon, formatted } = s.properties;
                setLat(lat);
                setLng(lon);
                setQuery(formatted);
                setSuggestions([]);
                setShowSuggestions(false);
                onSelect({ address: formatted, lat, lng: lon });
              }}
            >
              {s.properties.formatted}
            </li>
          ))}
        </ul>
      )}

      <div
        id="mapContainer"
        className="mt-4 rounded-lg border shadow-sm"
        style={{ width: "100%", height: "250px", zIndex: 0 }}
      ></div>
    </div>
  );
};

export default AddressAutocompleteWithMap;
