import { useRef, useEffect, useMemo, useCallback, useState } from 'react'
import Globe, { GlobeMethods } from 'react-globe.gl'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { StatsCard } from '@/components/common/charts/StatsCard'
import { Users, ShoppingCart, DollarSign, Globe as GlobeIcon, Maximize, Minimize } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import { motion, Variants } from 'motion/react'
import { Link } from '@tanstack/react-router'

// Country code → [lat, lng] mapping
const COUNTRY_COORDS: Record<string, [number, number]> = {
    AF: [33.93, 67.71], AL: [41.15, 20.17], DZ: [28.03, 1.66],
    AD: [42.55, 1.6], AO: [-11.2, 17.87], AG: [17.06, -61.8],
    AR: [-38.42, -63.62], AM: [40.07, 45.04], AU: [-25.27, 133.78],
    AT: [47.52, 14.55], AZ: [40.14, 47.58], BS: [25.03, -77.4],
    BH: [26.07, 50.56], BD: [23.68, 90.36], BB: [13.19, -59.54],
    BY: [53.71, 27.95], BE: [50.5, 4.47], BZ: [17.19, -88.5],
    BJ: [9.31, 2.32], BT: [27.51, 90.43], BO: [-16.29, -63.59],
    BA: [43.92, 17.68], BW: [-22.33, 24.68], BR: [-14.24, -51.93],
    BN: [4.54, 114.73], BG: [42.73, 25.49], BF: [12.24, -1.56],
    BI: [-3.37, 29.92], KH: [12.57, 104.99], CM: [7.37, 12.35],
    CA: [56.13, -106.35], CV: [16.0, -24.01], CF: [6.61, 20.94],
    TD: [15.45, 18.73], CL: [-35.68, -71.54], CN: [35.86, 104.2],
    CO: [4.57, -74.3], KM: [-11.88, 43.87], CG: [-0.23, 15.83],
    CD: [-4.04, 21.76], CR: [9.75, -83.75], CI: [7.54, -5.55],
    HR: [45.1, 15.2], CU: [21.52, -77.78], CY: [35.13, 33.43],
    CZ: [49.82, 15.47], DK: [56.26, 9.5], DJ: [11.83, 42.59],
    DM: [15.41, -61.37], DO: [18.74, -70.16], EC: [-1.83, -78.18],
    EG: [26.82, 30.8], SV: [13.79, -88.9], GQ: [1.65, 10.27],
    ER: [15.18, 39.78], EE: [58.6, 25.01], SZ: [-26.52, 31.47],
    ET: [9.15, 40.49], FJ: [-17.71, 178.07], FI: [61.92, 25.75],
    FR: [46.23, 2.21], GA: [-0.8, 11.61], GM: [13.44, -15.31],
    GE: [42.32, 43.36], DE: [51.17, 10.45], GH: [7.95, -1.02],
    GR: [39.07, 21.82], GD: [12.12, -61.68], GT: [15.78, -90.23],
    GN: [9.95, -9.7], GW: [11.8, -15.18], GY: [4.86, -58.93],
    HT: [18.97, -72.29], HN: [15.2, -86.24], HU: [47.16, 19.5],
    IS: [64.96, -19.02], IN: [20.59, 78.96], ID: [-0.79, 113.92],
    IR: [32.43, 53.69], IQ: [33.22, 43.68], IE: [53.41, -8.24],
    IL: [31.05, 34.85], IT: [41.87, 12.57], JM: [18.11, -77.3],
    JP: [36.2, 138.25], JO: [30.59, 36.24], KZ: [48.02, 66.92],
    KE: [-0.02, 37.91], KI: [-3.37, -168.73], KP: [40.34, 127.51],
    KR: [35.91, 127.77], KW: [29.31, 47.48], KG: [41.2, 74.77],
    LA: [19.86, 102.5], LV: [56.88, 24.6], LB: [33.85, 35.86],
    LS: [-29.61, 28.23], LR: [6.43, -9.43], LY: [26.34, 17.23],
    LI: [47.17, 9.56], LT: [55.17, 23.88], LU: [49.82, 6.13],
    MG: [-18.77, 46.87], MW: [-13.25, 34.3], MY: [4.21, 101.98],
    MV: [3.2, 73.22], ML: [17.57, -4.0], MT: [35.94, 14.38],
    MH: [7.13, 171.18], MR: [21.01, -10.94], MU: [-20.35, 57.55],
    MX: [23.63, -102.55], FM: [7.43, 150.55], MD: [47.41, 28.37],
    MC: [43.75, 7.41], MN: [46.86, 103.85], ME: [42.71, 19.37],
    MA: [31.79, -7.09], MZ: [-18.67, 35.53], MM: [21.91, 95.96],
    NA: [-22.96, 18.49], NR: [-0.52, 166.93], NP: [28.39, 84.12],
    NL: [52.13, 5.29], NZ: [-40.9, 174.89], NI: [12.87, -85.21],
    NE: [17.61, 8.08], NG: [9.08, 8.68], NO: [60.47, 8.47],
    OM: [21.47, 55.98], PK: [30.38, 69.35], PW: [7.51, 134.58],
    PS: [31.95, 35.23], PA: [8.54, -80.78], PG: [-6.31, 143.96],
    PY: [-23.44, -58.44], PE: [-9.19, -75.02], PH: [12.88, 121.77],
    PL: [51.92, 19.15], PT: [39.4, -8.22], QA: [25.35, 51.18],
    RO: [45.94, 24.97], RU: [61.52, 105.32], RW: [-1.94, 29.87],
    KN: [17.36, -62.78], LC: [13.91, -60.98], VC: [12.98, -61.29],
    WS: [-13.76, -172.1], SM: [43.94, 12.46], ST: [0.19, 6.61],
    SA: [23.89, 45.08], SN: [14.5, -14.45], RS: [44.02, 21.01],
    SC: [-4.68, 55.49], SL: [8.46, -11.78], SG: [1.35, 103.82],
    SK: [48.67, 19.7], SI: [46.15, 14.99], SB: [-9.65, 160.16],
    SO: [5.15, 46.2], ZA: [-30.56, 22.94], SS: [7.86, 29.69],
    ES: [40.46, -3.75], LK: [7.87, 80.77], SD: [12.86, 30.22],
    SR: [3.92, -56.03], SE: [60.13, 18.64], CH: [46.82, 8.23],
    SY: [34.8, 38.99], TW: [23.7, 120.96], TJ: [38.86, 71.28],
    TZ: [-6.37, 34.89], TH: [15.87, 100.99], TL: [-8.87, 125.73],
    TG: [8.62, 1.21], TO: [-21.18, -175.2], TT: [10.69, -61.22],
    TN: [33.89, 9.54], TR: [38.96, 35.24], TM: [38.97, 59.56],
    TV: [-7.11, 177.65], UG: [1.37, 32.29], UA: [48.38, 31.17],
    AE: [23.42, 53.85], GB: [55.38, -3.44], US: [37.09, -95.71],
    UY: [-32.52, -55.77], UZ: [41.38, 64.59], VU: [-15.38, 166.96],
    VE: [6.42, -66.59], VN: [14.06, 108.28], YE: [15.55, 48.52],
    ZM: [-13.13, 27.85], ZW: [-19.02, 29.15],
}

interface GlobeCountryData {
    country: {
        id: number
        code: string
        name: string
    }
    orders_summary: {
        total: number
        paid: number
        revenue: number
    }
    users_summary: {
        total: number
        active: number
        banned: number
    }
}

interface GlobeTabProps {
    countries: GlobeCountryData[]
    containerVariants: Variants
    itemVariants: Variants
    isActive: boolean
}

interface PointData {
    lat: number
    lng: number
    code: string
    name: string
    totalOrders: number
    paidOrders: number
    revenue: number
    totalUsers: number
    activeUsers: number
    bannedUsers: number
    size: number
    text: string
    color: string
}

export function GlobeTab({ countries, containerVariants, itemVariants, isActive }: GlobeTabProps) {
    const { t } = useTranslation()
    const globeRef = useRef<GlobeMethods | undefined>(undefined)
    const globeCardRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(900)
    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 700)
    const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(null)
    const [polygonsData, setPolygonsData] = useState<any[]>([])
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [isReady, setIsReady] = useState(false)

    // Wait for transition to finish for a smoother experience
    useEffect(() => {
        if (isActive && !isReady) {
            const timer = setTimeout(() => {
                setIsReady(true)
            }, 500) // 500ms delay to allow tab animation to finish
            return () => clearTimeout(timer)
        }
    }, [isActive, isReady])

    // Fetch polygons only when ready
    useEffect(() => {
        if (isReady && polygonsData.length === 0) {
            fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
                .then(res => res.json())
                .then(data => setPolygonsData(data.features))
                .catch(err => console.error('Failed to load polygons:', err))
        }
    }, [isReady, polygonsData.length])

    // Set of country codes that have data (for subtle highlight)
    const dataCountryCodes = useMemo(() => {
        return new Set(countries.map(c => c.country.code))
    }, [countries])

    // Track container size for globe
    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight)
            if (globeCardRef.current) {
                setContainerWidth(globeCardRef.current.clientWidth)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        const el = globeCardRef.current
        if (el) {
            const obs = new ResizeObserver(entries => {
                for (const entry of entries) {
                    setContainerWidth(entry.contentRect.width)
                }
            })
            obs.observe(el)
        }

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    // Prepare points data
    const pointsData = useMemo<PointData[]>(() => {
        return countries
            .map((c) => {
                const coords = COUNTRY_COORDS[c.country.code]
                if (!coords) return null
                const activity = c.users_summary.total + c.orders_summary.total
                return {
                    lat: coords[0],
                    lng: coords[1],
                    code: c.country.code,
                    name: c.country.name,
                    totalOrders: c.orders_summary.total,
                    paidOrders: c.orders_summary.paid,
                    revenue: c.orders_summary.revenue,
                    totalUsers: c.users_summary.total,
                    activeUsers: c.users_summary.active,
                    bannedUsers: c.users_summary.banned,
                    size: Math.max(2, Math.min(6, activity * 0.25 + 1)),
                    text: `${getFlagEmoji(c.country.code)} ${c.country.code}`,
                    color:
                        c.orders_summary.total > 0
                            ? '#22c55e'
                            : c.users_summary.total > 0
                                ? '#6366f1'
                                : '#64748b',
                }
            })
            .filter((item): item is PointData => item !== null)
    }, [countries])


    // Built-in label tooltip for hover (supports HTML)
    const labelTooltipFn = useCallback((d: object) => {
        const p = d as PointData
        const revenueHtml = p.revenue > 0 ? `
          <div style="margin-top:8px;background:rgba(6,182,212,0.12);border-radius:8px;padding:8px 10px;display:flex;align-items:center;gap:8px;">
            <span style="font-size:16px;">💰</span>
            <div>
              <div style="font-size:9px;font-weight:700;color:#22d3ee;text-transform:uppercase;letter-spacing:1px;">${t('dashboard.globe.tooltip.revenue')}</div>
              <div style="font-size:14px;font-weight:600;color:#fff;">$${p.revenue.toLocaleString()}</div>
            </div>
          </div>` : ''

        return `
          <div style="
            background:rgba(15,23,42,0.95);
            backdrop-filter:blur(16px);
            border:1px solid rgba(99,102,241,0.3);
            border-radius:12px;
            padding:14px 16px;
            min-width:260px;
            max-width:340px;
            font-family:'Inter',system-ui,sans-serif;
            box-shadow:0 8px 32px rgba(0,0,0,0.5);
          ">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="font-size:28px;">${getFlagEmoji(p.code)}</span>
              <div>
                <div style="font-size:14px;font-weight:900;color:#f1f5f9;">${p.name}</div>
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;">${p.code}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div style="background:rgba(99,102,241,0.12);border-radius:8px;padding:8px 10px;">
                <div style="font-size:9px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">${t('dashboard.globe.tooltip.users')}</div>
                <div style="font-size:18px;font-weight:900;color:#e2e8f0;">${p.totalUsers}</div>
                <div style="font-size:9px;color:#94a3b8;">${p.activeUsers} ${t('dashboard.globe.tooltip.active')}</div>
              </div>
              <div style="background:rgba(34,197,94,0.12);border-radius:8px;padding:8px 10px;">
                <div style="font-size:9px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">${t('dashboard.globe.tooltip.orders')}</div>
                <div style="font-size:18px;font-weight:900;color:#e2e8f0;">${p.totalOrders}</div>
                <div style="font-size:9px;color:#94a3b8;">${p.paidOrders} ${t('dashboard.globe.tooltip.paid')}</div>
              </div>
            </div>
            ${revenueHtml}
          </div>
        `
    }, [t])

    // Rings data – pulsing ring around every marker for bounce effect
    const ringsData = useMemo(() => {
        return pointsData.map((d) => ({
            lat: d.lat,
            lng: d.lng,
            color: d.color,
            maxR: 3,
            propagationSpeed: 2,
            repeatPeriod: 1000,
        }))
    }, [pointsData])

    // SVG map pin marker (from official react-globe.gl example)
    const markerSvg = `<svg viewBox="-4 0 36 36">
        <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
        <circle fill="white" cx="14" cy="14" r="7"></circle>
    </svg>`

    const createMarkerPin = useCallback(
        (d: object) => {
            const el = document.createElement('div')
            el.innerHTML = markerSvg
            el.style.color = '#ef4444'
            el.style.width = '30px'
            el.style.transition = 'opacity 250ms'
            el.style.pointerEvents = 'auto'
            el.style.cursor = 'pointer'
            el.onclick = () => {
                const data = d as PointData
                if (globeRef.current) {
                    globeRef.current.pointOfView(
                        { lat: data.lat, lng: data.lng, altitude: 1.8 },
                        800,
                    )
                }
            }
            return el
        },
        [],
    )

    // Hover on a point → highlight country polygon + fly to it
    const handlePointHover = useCallback(
        (point: object | null) => {
            if (!point) {
                setHoveredCountryCode(null)
                return
            }
            const data = point as PointData
            setHoveredCountryCode(data.code)
        },
        [],
    )

    // Map of country code → PointData for polygon tooltip lookup
    const pointsDataMap = useMemo(() => {
        const map = new Map<string, PointData>()
        pointsData.forEach(p => map.set(p.code, p))
        return map
    }, [pointsData])

    // Hover on a polygon → highlight it (if it has data)
    const handlePolygonHover = useCallback(
        (polygon: object | null) => {
            if (!polygon) {
                setHoveredCountryCode(null)
                return
            }
            const f = polygon as { properties: { ISO_A2: string } }
            const code = f.properties.ISO_A2
            if (dataCountryCodes.has(code)) {
                setHoveredCountryCode(code)
            } else {
                setHoveredCountryCode(null)
            }
        },
        [dataCountryCodes],
    )

    // Polygon tooltip → show same tooltip as point if country has data
    const polygonLabelFn = useCallback(
        (feat: object) => {
            const f = feat as { properties: { ISO_A2: string; NAME: string } }
            const code = f.properties.ISO_A2
            const p = pointsDataMap.get(code)
            if (!p) return ''
            return labelTooltipFn(p)
        },
        [pointsDataMap, labelTooltipFn],
    )

    // Polygon colors based on hover state
    const polygonCapColor = useCallback(
        (feat: object) => {
            const f = feat as { properties: { ISO_A2: string } }
            const code = f.properties.ISO_A2
            if (code === hoveredCountryCode) return 'rgba(6, 182, 212, 0.45)'
            if (dataCountryCodes.has(code)) return 'rgba(6, 182, 212, 0.06)'
            return 'rgba(0, 0, 0, 0)'
        },
        [hoveredCountryCode, dataCountryCodes],
    )

    const polygonSideColor = useCallback(
        (feat: object) => {
            const f = feat as { properties: { ISO_A2: string } }
            const code = f.properties.ISO_A2
            if (code === hoveredCountryCode) return 'rgba(6, 182, 212, 0.3)'
            return 'rgba(0, 0, 0, 0)'
        },
        [hoveredCountryCode],
    )

    const polygonStrokeColor = useCallback(
        (feat: object) => {
            const f = feat as { properties: { ISO_A2: string } }
            const code = f.properties.ISO_A2
            if (code === hoveredCountryCode) return 'rgba(34, 211, 238, 0.8)'
            if (dataCountryCodes.has(code)) return 'rgba(6, 182, 212, 0.15)'
            return 'rgba(255, 255, 255, 0.04)'
        },
        [hoveredCountryCode, dataCountryCodes],
    )

    const polygonAltitude = useCallback(
        (feat: object) => {
            const f = feat as { properties: { ISO_A2: string } }
            return f.properties.ISO_A2 === hoveredCountryCode ? 0.02 : 0.005
        },
        [hoveredCountryCode],
    )

    // Pause auto-rotate when mouse is over the globe container
    const handleMouseEnter = useCallback(() => {
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = false
        }
    }, [])
    const handleMouseLeave = useCallback(() => {
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = true
        }
    }, [])

    // Auto-rotate and initial position
    useEffect(() => {
        if (globeRef.current && isReady) {
            const controls = globeRef.current.controls()
            controls.autoRotate = isActive // Only rotate if visible
            controls.autoRotateSpeed = 0.4
            controls.enableZoom = true

            if (isActive) {
                const firstCountry = pointsData[0]
                if (firstCountry) {
                    globeRef.current.pointOfView(
                        { lat: firstCountry.lat, lng: firstCountry.lng, altitude: 2.2 },
                        1000,
                    )
                } else {
                    globeRef.current.pointOfView({ lat: 25, lng: 45, altitude: 2.2 }, 1000)
                }
            }
        }
    }, [pointsData, isActive, isReady])

    // Handle Full Screen
    const toggleFullScreen = useCallback(() => {
        if (!globeCardRef.current) return

        if (!document.fullscreenElement) {
            globeCardRef.current.requestFullscreen().then(() => {
                setIsFullScreen(true)
            }).catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`)
            })
        } else {
            document.exitFullscreen().then(() => {
                setIsFullScreen(false)
            })
        }
    }, [])

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullScreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFsChange)
        return () => document.removeEventListener('fullscreenchange', handleFsChange)
    }, [])

    // Summary stats
    const totalUsers = countries.reduce((sum, c) => sum + c.users_summary.total, 0)
    const totalOrders = countries.reduce((sum, c) => sum + c.orders_summary.total, 0)

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Summary Cards */}
            <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
                <Link to="/settings/countries">
                    <StatsCard
                        title={t('dashboard.globe.countriesCount')}
                        value={countries.length}
                        icon={GlobeIcon}
                        iconColor="text-violet-600 bg-violet-500/10"
                    />
                </Link>
                <Link to={"/users" as any}>
                    <StatsCard
                        title={t('dashboard.globe.totalGeoUsers')}
                        value={totalUsers}
                        icon={Users}
                        iconColor="text-blue-600 bg-blue-500/10"
                    />
                </Link>
                <Link to={"/orders" as any}>
                    <StatsCard
                        title={t('dashboard.globe.totalGeoOrders')}
                        value={totalOrders}
                        icon={ShoppingCart}
                        iconColor="text-emerald-600 bg-emerald-500/10"
                    />
                </Link>
            </motion.div>

            {/* Globe */}
            <motion.div variants={itemVariants} ref={globeCardRef} className={isFullScreen ? 'fixed inset-0 z-[100] bg-[#040d21]' : 'relative'}>
                <Card
                    className={`shadow-sm border-muted/60 overflow-hidden transition-all duration-300 h-full ${isFullScreen ? 'rounded-none border-none flex flex-col p-0 pb-0 gap-0 shadow-none bg-transparent' : 'relative'}`}
                >
                    {!isFullScreen && (
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <GlobeIcon className="size-5 text-primary" />
                                        {t('dashboard.globe.title')}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t('dashboard.globe.description')}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleFullScreen}
                                    className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                                    title={t('common.fullScreen')}
                                >
                                    <Maximize className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                    )}
                    <CardContent className={`p-0 flex-1 overflow-hidden h-full ${isFullScreen ? 'px-0' : ''}`}>
                        <div
                            className="relative w-full h-full bg-[#040d21]"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {isFullScreen && (
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={toggleFullScreen}
                                    className="absolute top-6 right-6 z-[60] rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-black/60 hover:scale-110 transition-all shadow-2xl"
                                    title={t('common.exitFullScreen')}
                                >
                                    <Minimize className="h-5 w-5 text-white" />
                                </Button>
                            )}
                            {isReady ? (
                                <Globe
                                    ref={globeRef}
                                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                                    showAtmosphere={true}
                                    atmosphereColor="rgba(99, 102, 241, 0.3)"
                                    atmosphereAltitude={0.18}
                                    // Fixed-size map pin markers (HTML layer)
                                    htmlElementsData={pointsData}
                                    htmlLat="lat"
                                    htmlLng="lng"
                                    htmlAltitude={0.01}
                                    htmlElement={createMarkerPin as any}
                                    htmlTransitionDuration={500}
                                    // Invisible points for tooltip + hover interaction
                                    pointsData={pointsData}
                                    pointLat="lat"
                                    pointLng="lng"
                                    pointColor={() => 'rgba(0, 0, 0, 0)'}
                                    pointAltitude={0}
                                    pointRadius={0.5}
                                    pointsMerge={false}
                                    pointLabel={labelTooltipFn as any}
                                    onPointHover={handlePointHover}
                                    polygonsData={polygonsData}
                                    polygonLabel={polygonLabelFn as any}
                                    polygonCapColor={polygonCapColor as any}
                                    polygonSideColor={polygonSideColor as any}
                                    polygonStrokeColor={polygonStrokeColor as any}
                                    polygonAltitude={polygonAltitude as any}
                                    polygonsTransitionDuration={300}
                                    onPolygonHover={handlePolygonHover as any}
                                    // Pulsing rings around each marker
                                    ringsData={ringsData}
                                    ringColor={() => 'rgba(239, 68, 68, 0.5)'}
                                    ringMaxRadius="maxR"
                                    ringPropagationSpeed="propagationSpeed"
                                    ringRepeatPeriod="repeatPeriod"
                                    // Sizing – fills entire container width
                                    width={isActive ? containerWidth : 1}
                                    height={isActive ? (isFullScreen ? windowHeight : 700) : 1}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-[700px] bg-[#040d21] text-white/50">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
                                    <p className="text-sm font-medium animate-pulse uppercase tracking-widest">{t('common.loading')}</p>
                                </div>
                            )}

                        </div>
                    </CardContent>
                </Card>
            </motion.div>


        </motion.div>
    )
}

// Helper to convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}
