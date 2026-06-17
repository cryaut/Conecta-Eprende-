import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, ArrowRight, ShieldCheck } from "lucide-react";

// Fix missing default icon paths in leaflet for bundlers
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const NICARAGUA_CENTER: [number, number] = [12.8654, -85.2072];

// City bounding coordinates mapping
const CITY_COORDS: Record<string, [number, number]> = {
  "Managua": [12.1328, -86.2504],
  "León": [12.4346, -86.8796],
  "Granada": [11.9344, -85.9560],
  "Estelí": [13.0886, -86.3538]
};

function CityFocuser({ city }: { city: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (city && CITY_COORDS[city]) {
      map.flyTo(CITY_COORDS[city], 13, { duration: 1.5, easeLinearity: 0.25 });
    } else {
      map.flyTo(NICARAGUA_CENTER, 7, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [city, map]);
  return null;
}

interface Provider {
  id: string;
  displayName: string;
  category: string;
  city: string;
  lat: number;
  lng: number;
  score?: number;
}

export default function ProviderMap({ providers, focusCity }: { providers: Provider[], focusCity: string | null }) {
  return (
    <div className="w-full h-full relative z-0 bg-slate-100">
      <MapContainer 
        center={NICARAGUA_CENTER} 
        zoom={7} 
        minZoom={6}
        maxBounds={[
          [10.5, -88.0], // SW
          [15.5, -82.0]  // NE
        ]}
        maxBoundsViscosity={1.0}
        className="w-full h-full outline-none z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          noWrap={true}
        />
        
        {providers.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup className="custom-popup" closeButton={false} autoPanPadding={[50, 50]}>
              <div className="font-sans min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-extrabold text-[15px] text-slate-900 leading-tight">{p.displayName}</div>
                  {p.score && (
                    <div className="flex items-center justify-center shrink-0 w-7 h-7 bg-green-50 rounded-full border border-green-100 ml-2 shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                    {p.category}
                  </div>
                </div>
                <a 
                  href={`/proveedor/${p.id}`} 
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Ver perfil <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        <CityFocuser city={focusCity} />
      </MapContainer>
      
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-[1000] opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-[1000] opacity-50" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-[1000] opacity-30 block md:hidden" />
    </div>
  );
}
