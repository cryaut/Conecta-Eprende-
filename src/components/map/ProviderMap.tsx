import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, ArrowRight, ShieldCheck, Zap, Palette, Wrench, Hammer, Camera, Code, ShoppingBag, Search as SearchIcon, Navigation } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

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

const CATEGORY_THEMES: Record<string, { color: string, icon: any }> = {
  "Diseño Gráfico": { color: "#4f46e5", icon: Palette },
  "Plomería": { color: "#0891b2", icon: Wrench },
  "Carpintería": { color: "#b45309", icon: Hammer },
  "Fotografía": { color: "#db2777", icon: Camera },
  "Programación": { color: "#059669", icon: Code },
  "Ventas": { color: "#7c3aed", icon: ShoppingBag },
  "Default": { color: "#475569", icon: MapPin }
};

function createCustomIcon(category: string, isHovered: boolean) {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Default"];
  const iconHtml = renderToStaticMarkup(
    <div style={{
      backgroundColor: isHovered ? '#1e293b' : theme.color,
      color: 'white',
      padding: '8px',
      borderRadius: '50%',
      border: `3px solid white`,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease-in-out',
      transform: isHovered ? 'scale(1.2)' : 'scale(1)',
      zIndex: isHovered ? 1000 : 1
    }}>
      <theme.icon size={isHovered ? 20 : 16} strokeWidth={2.5} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function MapEvents({ onBoundsChange, setIsMapMoved }: {
  onBoundsChange?: (bounds: L.LatLngBounds) => void,
  setIsMapMoved: (moved: boolean) => void
}) {
  const map = useMapEvents({
    moveend: () => {
      // We don't automatically trigger onBoundsChange here to avoid infinite loops or unwanted fetches
      // instead we show the "Search in this area" button
      setIsMapMoved(true);
    },
    zoomend: () => {
      setIsMapMoved(true);
    }
  });
  return null;
}

function CityFocuser({ city, setIsMapMoved }: { city: string | null, setIsMapMoved: (moved: boolean) => void }) {
  const map = useMap();
  useEffect(() => {
    if (city && CITY_COORDS[city]) {
      map.flyTo(CITY_COORDS[city], 13, { duration: 1.5, easeLinearity: 0.25 });
      setTimeout(() => setIsMapMoved(false), 1600); // Reset moved state after flyTo
    } else {
      map.flyTo(NICARAGUA_CENTER, 7, { duration: 1.5, easeLinearity: 0.25 });
      setTimeout(() => setIsMapMoved(false), 1600);
    }
  }, [city, map, setIsMapMoved]);
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

export default function ProviderMap({
  providers,
  focusCity,
  hoveredProviderId,
  onBoundsChange
}: {
  providers: Provider[],
  focusCity: string | null,
  hoveredProviderId?: string | null,
  onBoundsChange?: (bounds: L.LatLngBounds) => void
}) {
  const [isMapMoved, setIsMapMoved] = useState(false);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);

  const handleSearchInArea = () => {
    if (mapRef && onBoundsChange) {
      onBoundsChange(mapRef.getBounds());
      setIsMapMoved(false);
    }
  };

  const handleLocateMe = () => {
    if (mapRef) {
      mapRef.locate({ setView: true, maxZoom: 14 });
    }
  };

  return (
    <div className="w-full h-full relative z-0 bg-slate-100">
      <MapContainer 
        center={NICARAGUA_CENTER} 
        zoom={7} 
        ref={setMapRef}
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
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createCustomIcon(p.category, hoveredProviderId === p.id)}
          >
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

        <CityFocuser city={focusCity} setIsMapMoved={setIsMapMoved} />
        <MapEvents setIsMapMoved={setIsMapMoved} />
      </MapContainer>

      {/* Floating UI Controls */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-3 w-full px-4 pointer-events-none">
        {isMapMoved && (
          <button
            onClick={handleSearchInArea}
            className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-full shadow-2xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 animate-in fade-in slide-in-from-top-4"
          >
            <SearchIcon className="w-4 h-4 text-blue-600" />
            Buscar en esta área
          </button>
        )}
      </div>
      
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-[1000] opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-[1000] opacity-50" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-[1000] opacity-30 block md:hidden" />

      {/* Locate button */}
      <div className="absolute bottom-10 right-6 z-[1000]">
        <button
          onClick={handleLocateMe}
          title="Mi ubicación"
          className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-700 hover:text-blue-600 transition-all border border-slate-200 active:scale-90"
        >
          <Navigation className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
