import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Location } from "@/store/type/locationsType";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapProps {
  locations: Location[];
  selectedId?: string;
  onSelect: (location: Location) => void;
}

interface GeocodedLocation extends Location {
  lat?: number;
  lng?: number;
}

const locationCoords: Record<string, [number, number]> = {
  "LOC-001": [10.8068, 106.6956],
  "LOC-002": [11.9456, 108.4583],
  "LOC-003": [16.0511, 108.2068],
};

const MapBounds = ({ markers }: { markers: GeocodedLocation[] }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat!, m.lng!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  return null;
};

const LocationMap = ({ locations, selectedId, onSelect }: LocationMapProps) => {
  const [geocodedLocations, setGeocodedLocations] = useState<
    GeocodedLocation[]
  >([]);
  const [loading, setLoading] = useState(false);

  const defaultPosition: [number, number] = [10.7769, 106.7009];

  useEffect(() => {
    const fetchCoordinates = async () => {
      setLoading(true);
      const results: GeocodedLocation[] = [];

      for (const location of locations) {
        try {
          const query = encodeURIComponent(location.address || location.name);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            results.push({
              ...location,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          }

          await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
          console.error("Geocode failed", err);
        }
      }

      setGeocodedLocations(results);
      setLoading(false);
    };

    if (locations.length > 0) {
      fetchCoordinates();
    }
  }, [locations]);

  return (
    <div className="relative h-full w-full rounded-md overflow-hidden border shadow-sm">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <span className="text-primary font-medium">Loading map...</span>
        </div>
      )}

      <MapContainer
        center={defaultPosition}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {locations.map((loc) => {
          const coords = locationCoords[loc.id];
          if (!coords) return null;

          return (
            <Marker
              key={loc.id}
              position={coords}
              icon={defaultIcon}
              eventHandlers={{
                click: () => onSelect(loc),
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm">{loc.name}</h3>
                  <p className="text-xs text-gray-500">{loc.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapBounds markers={geocodedLocations} />
      </MapContainer>
    </div>
  );
};

export default LocationMap;
