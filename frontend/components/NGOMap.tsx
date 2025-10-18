"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import type { MapNGO } from "@/lib/api";

interface NGOMapProps {
  ngos: MapNGO[];
}

export default function NGOMap({ ngos }: NGOMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "requesting" | "granted" | "denied"
  >("requesting");

  const goToMyLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13, {
        animate: true,
        duration: 1,
      });
    }
  };

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus("granted");
        },
        (error) => {
          console.log("Location access denied");
          setLocationStatus("denied");
        }
      );
    } else {
      setLocationStatus("denied");
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;

      // Check if map already exists and remove it
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const centerLat = userLocation?.lat || 20.5937;
      const centerLng = userLocation?.lng || 78.9629;
      const zoomLevel = userLocation ? 10 : 5;

      const newMap = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: zoomLevel,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(newMap);

      // Add user location marker
      if (userLocation) {
        const userMarkerHtml = `
          <div style="
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `;

        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: userMarkerHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
        }).addTo(newMap).bindPopup(`
            <div style="padding: 12px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">📍</div>
              <div style="font-weight: bold; color: #1f2937; font-size: 16px;">Your Location</div>
              <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">
                ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}
              </div>
            </div>
          `);

        // Add circle around user location
        L.circle([userLocation.lat, userLocation.lng], {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          radius: 5000,
        }).addTo(newMap);
      }

      // Add NGO markers
      ngos.forEach((ngo) => {
        const markerColor = ngo.verified ? "#10b981" : "#f59e0b";
        const markerIcon = ngo.verified ? "✓" : "❤";

        const iconHtml = `
          <div style="
            background: ${markerColor};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 3px solid white;
            cursor: pointer;
            transition: all 0.2s;
          ">${markerIcon}</div>
        `;

        const icon = L.divIcon({
          className: "ngo-marker",
          html: iconHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([ngo.lat, ngo.lng], { icon })
          .addTo(newMap)
          .bindPopup(
            `
            <div style="padding: 16px; min-width: 250px; font-family: system-ui;">
              <div style="font-weight: 700; font-size: 18px; margin-bottom: 12px; color: #111827; line-height: 1.3;">
                ${ngo.name}
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
                <svg style="width: 16px; height: 16px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                <span>${ngo.city}, ${ngo.state}</span>
              </div>
              
              ${
                ngo.verified
                  ? `
                <div style="display: inline-flex; align-items: center; gap: 6px; background: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-bottom: 12px;">
                  <svg style="width: 14px; height: 14px;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  Verified NGO
                </div>
              `
                  : ""
              }
              
              ${
                ngo.categories && ngo.categories.length > 0
                  ? `
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
                  ${ngo.categories
                    .slice(0, 3)
                    .map(
                      (cat) => `
                    <span style="background: #ede9fe; color: #5b21b6; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;">
                      ${cat}
                    </span>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
              
              <a href="/ngos/${ngo.id}" style="
                display: block;
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 12px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
                transition: all 0.2s;
              " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(79, 70, 229, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(79, 70, 229, 0.3)';">
                View Full Details →
              </a>
            </div>
          `,
            {
              maxWidth: 300,
              className: "custom-popup",
            }
          );

        // Add hover effect
        marker.on("mouseover", function () {
          this.openPopup();
        });
      });

      mapInstanceRef.current = newMap;
    };

    // Load Leaflet
    if (!(window as any).L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        setTimeout(initMap, 100);
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [ngos, userLocation]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[600px] rounded-2xl border-4 border-gray-200 relative"
        style={{ zIndex: 0 }}
      ></div>

      {/* Legend */}
      <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 z-[1000] border border-gray-200">
        <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Map Legend
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg">
              ✓
            </div>
            <span className="text-gray-700 font-medium">Verified NGO</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-lg">
              ❤
            </div>
            <span className="text-gray-700 font-medium">Active NGO</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-white shadow-lg relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-gray-700 font-medium">Your Location</span>
          </div>
        </div>
      </div>

      {/* Location Status */}
      <div className="absolute top-6 left-14 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl px-4 py-3 z-[1000] border border-gray-200">
        {locationStatus === "requesting" && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Getting location...</span>
          </div>
        )}
        {locationStatus === "granted" && userLocation && (
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="w-4 h-4 text-green-600" />
            <span className="text-gray-700 font-medium">Location found</span>
          </div>
        )}
        {locationStatus === "denied" && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span className="text-gray-700">Showing all India</span>
          </div>
        )}
      </div>

      {/* Go to My Location Button */}
      {userLocation && (
        <button
          onClick={goToMyLocation}
          className="absolute top-24 left-6 bg-white hover:bg-indigo-50 rounded-xl shadow-2xl p-3 z-[1000] border border-gray-200 transition-all duration-200 hover:scale-105 group"
          title="Go to my location"
        >
          <Navigation className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" />
        </button>
      )}

      {/* NGO Count */}
      <div className="absolute bottom-6 left-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-5 z-[1000]">
        <div className="text-3xl font-bold">{ngos.length}</div>
        <div className="text-sm text-indigo-100 mt-1">NGOs on Map</div>
      </div>
    </div>
  );
}
