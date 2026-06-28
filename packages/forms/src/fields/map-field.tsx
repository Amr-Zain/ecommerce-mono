"use client"

import * as React from "react"
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form"
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polygon,
} from "@react-google-maps/api"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@ecommerce/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ecommerce/ui/components/popover"
import { ScrollArea } from "@ecommerce/ui/components/scroll-area"
import { Input } from "@ecommerce/ui/components/input"
import { MapsLocation01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@ecommerce/ui/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Position {
  lat: number
  lng: number
}

export interface MapFieldProps<T extends FieldValues = FieldValues> {
  /** Google Maps API key */
  apiKey: string
  field?: ControllerRenderProps<T, Path<T>>
  onMarkerPositionChange?: (position: Position) => void
  defaultMarkerPosition?: Position
  className?: string
  height?: number
  locations?: Position[]
  zoom?: number
  mapContainerStyle?: React.CSSProperties
  disabled?: boolean
  /** Search placeholder (no i18n — just pass whatever text you want) */
  searchPlaceholder?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_CENTER: Position = { lat: 31.0276005, lng: 31.3755931 }

function coercePos(val: unknown): Position | null {
  if (!val || typeof val !== "object") return null
  const v = val as any
  if (typeof v.lat === "number" && typeof v.lng === "number") {
    return { lat: v.lat, lng: v.lng }
  }
  return null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function MapField<T extends FieldValues>({
  apiKey,
  field,
  onMarkerPositionChange,
  defaultMarkerPosition,
  className,
  height = 420,
  locations,
  zoom = 12,
  mapContainerStyle,
  disabled = false,
  searchPlaceholder = "Search...",
}: MapFieldProps<T>) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: ["places"] as any,
  })

  const [map, setMap] = React.useState<google.maps.Map | null>(null)
  const [marker, setMarker] = React.useState<Position | null>(
    coercePos(field?.value) ?? defaultMarkerPosition ?? null,
  )
  const [geoCenter, setGeoCenter] = React.useState<Position | null>(null)

  // Places services
  const acServiceRef = React.useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = React.useRef<google.maps.places.PlacesService | null>(null)

  React.useEffect(() => {
    if (isLoaded && !acServiceRef.current) {
      acServiceRef.current = new google.maps.places.AutocompleteService()
    }
  }, [isLoaded])

  React.useEffect(() => {
    if (map && !placesServiceRef.current) {
      placesServiceRef.current = new google.maps.places.PlacesService(map)
    }
  }, [map])

  // Search state
  const [query, setQuery] = React.useState("")
  const [predictions, setPredictions] = React.useState<google.maps.places.AutocompletePrediction[]>([])
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [loadingPred, setLoadingPred] = React.useState(false)

  // Geolocate once
  React.useEffect(() => {
    let cancelled = false
    if (!geoCenter && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return
          setGeoCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          if (cancelled) return
          setGeoCenter(DEFAULT_CENTER)
        },
        { enableHighAccuracy: false, maximumAge: 60_000 },
      )
    } else if (!geoCenter) {
      setGeoCenter(DEFAULT_CENTER)
    }
    return () => { cancelled = true }
  }, [geoCenter])

  // Sync external form value → local marker
  React.useEffect(() => {
    const v = coercePos(field?.value)
    if (v && (v.lat !== marker?.lat || v.lng !== marker?.lng)) {
      setMarker(v)
    }
  }, [field?.value]) // eslint-disable-line react-hooks/exhaustive-deps

  const center: Position =
    marker ??
    (locations && locations.length > 0 ? locations[0] : undefined) ??
    geoCenter ??
    DEFAULT_CENTER

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height,
    borderRadius: 8,
    ...mapContainerStyle,
  }

  const updateMarkerAndForm = (pos: Position) => {
    setMarker(pos)
    onMarkerPositionChange?.(pos)
    field?.onChange?.(pos)
  }

  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (disabled || !e.latLng) return
    updateMarkerAndForm({ lat: e.latLng.lat(), lng: e.latLng.lng() })
  }

  const handleDragEnd = (e: google.maps.MapMouseEvent) => {
    if (disabled || !e.latLng) return
    updateMarkerAndForm({ lat: e.latLng.lat(), lng: e.latLng.lng() })
  }

  // Debounced predictions
  const debounceRef = React.useRef<number | null>(null)
  const requestPredictions = React.useCallback((text: string) => {
    if (!acServiceRef.current) return
    setLoadingPred(true)
    acServiceRef.current.getPlacePredictions({ input: text }, (preds) => {
      setPredictions(preds ?? [])
      setLoadingPred(false)
    })
  }, [])

  const onQueryChange = (val: string) => {
    setQuery(val)
    if (!val) {
      setPredictions([])
      setSearchOpen(false)
      return
    }
    setSearchOpen(true)
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => requestPredictions(val), 300)
  }

  const fetchPlaceDetails = React.useCallback(
    (placeId: string) =>
      new Promise<google.maps.places.PlaceResult | null>((resolve) => {
        if (!placesServiceRef.current) return resolve(null)
        placesServiceRef.current.getDetails(
          { placeId, fields: ["geometry", "formatted_address", "name"] },
          (res, status) => {
            resolve(status === google.maps.places.PlacesServiceStatus.OK && res ? res : null)
          },
        )
      }),
    [],
  )

  const selectPrediction = async (p: google.maps.places.AutocompletePrediction) => {
    setSearchOpen(false)
    setQuery(p.description)
    const place = await fetchPlaceDetails(p.place_id)
    const loc = place?.geometry?.location
    if (loc && map) {
      const pos: Position = { lat: loc.lat(), lng: loc.lng() }
      updateMarkerAndForm(pos)
      const viewport = place?.geometry?.viewport
      if (viewport) {
        map.fitBounds(viewport)
      } else {
        map.panTo(pos)
        map.setZoom(16)
      }
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      {isLoaded && center ? (
        <>
          {/* Search */}
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger>
              <div className="relative mb-2">
                <Input
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  onFocus={() => {
                    if (query && predictions.length > 0) setSearchOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); e.stopPropagation() }
                  }}
                  disabled={disabled}
                  className="ps-10"
                />
                <HugeiconsIcon
                  icon={MapsLocation01Icon}
                  strokeWidth={2}
                  className="absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[min(520px,calc(100vw-32px))]" align="start" side="bottom">
              <Command shouldFilter={false}>
                <CommandList>
                  {loadingPred ? (
                    <CommandEmpty>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mx-auto" />
                    </CommandEmpty>
                  ) : predictions.length === 0 ? (
                    <CommandEmpty><span className="text-muted-foreground">—</span></CommandEmpty>
                  ) : (
                    <CommandGroup>
                      <ScrollArea className="max-h-72">
                        {predictions.map((p) => (
                          <CommandItem
                            key={p.place_id}
                            value={p.description}
                            onSelect={() => selectPrediction(p)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <HugeiconsIcon
                                icon={MapsLocation01Icon}
                                strokeWidth={2}
                                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                              />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-medium truncate">
                                  {p.structured_formatting.main_text}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {p.structured_formatting.secondary_text}
                                </span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Map */}
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={(m) => setMap(m)}
            onUnmount={() => setMap(null)}
            onClick={handleClick}
            options={{
              disableDefaultUI: disabled,
              draggable: !disabled,
              clickableIcons: !disabled,
              keyboardShortcuts: !disabled,
            }}
          >
            {marker && (
              <Marker position={marker} draggable={!disabled} onDragEnd={handleDragEnd} />
            )}
            {Array.isArray(locations) &&
              locations.map((p, i) => <Marker key={`loc_${i}`} position={p} />)}
            {Array.isArray(locations) && locations.length > 2 && (
              <Polygon
                paths={locations}
                options={{
                  fillColor: "#FF0000",
                  fillOpacity: 0.2,
                  strokeColor: "#FF0000",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: false,
                }}
              />
            )}
          </GoogleMap>
        </>
      ) : (
        <div className="w-full animate-pulse rounded-md bg-muted" style={{ height }} />
      )}
    </div>
  )
}

export { MapField }
