"use client"

import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { getLocationSuggestionsAction } from '@/data/third-party-actions/map/map.actions';
import type { Place } from "@/data/third-party-actions/map/map.types";
import { SearchControlProps, DEBOUNCED_TIME } from "./types";

export function SearchControl({ onLocationFound }: SearchControlProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchLocation = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getLocationSuggestionsAction({searchQuery})
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    }
    setIsLoading(false);
  }, DEBOUNCED_TIME);
  
  // Debounce search
  useEffect(() => {
    if (query.length > 2) {
      searchLocation(query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSelectLocation = (suggestion: Place) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    onLocationFound(lat, lng, suggestion.display_name);
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="absolute top-4 right-12 z-[1000] w-80 bg-white flex items-center gap-2 p-2 rounded-lg shadow-lg border border-gray-200">
      <button
        className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        type="button"
      >
        Buscar
      </button>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a location..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {isLoading && (
        <div className="ml-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectLocation(suggestion)}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-sm">{suggestion.display_name}</div>
              <div className="text-xs text-gray-500">
                {suggestion.type} • {suggestion.lat}, {suggestion.lon}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}