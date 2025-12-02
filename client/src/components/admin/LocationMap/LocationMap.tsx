import { useEffect } from "react";
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

const MapBounds = ({ locations }: { locations: Location[] }) => {
  const map = useMap();

  useEffect(() => {
    const validMarkers = locations.filter((m) => m.latitude && m.longitude);

    if (validMarkers.length > 0) {
      const bounds = L.latLngBounds(
        validMarkers.map((m) => [m.latitude!, m.longitude!]),
      );

      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

const LocationMap = ({ locations, onSelect }: LocationMapProps) => {
  const defaultPosition: [number, number] = [10.7769, 106.7009];

  return (
    <div className="relative h-full w-full rounded-md overflow-hidden border shadow-sm">
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
          if (!loc.latitude || !loc.longitude) return null;

          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
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

        <MapBounds locations={locations} />
      </MapContainer>
    </div>
  );
};

export default LocationMap;
