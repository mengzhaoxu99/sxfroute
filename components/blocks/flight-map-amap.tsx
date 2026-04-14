"use client"

import { useEffect, useMemo, useState } from "react"
import React from "react"
import dynamic from "next/dynamic"
import { Route } from "@/lib/flight/types"
import { getAirportCoordinatesByCity, getAirportCoordinatesByIATA, getAirportCoordinatesByName } from "@/lib/flight/airport-coordinates"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plane, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { AMapAirport, AMapFlightPath } from "./amap-core"

const DynamicAMapCore = dynamic(
  () => import('./amap-core').then((mod) => mod.AMapCore),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] sm:h-[650px] md:h-[700px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">加载地图中...</p>
        </div>
      </div>
    )
  }
)

interface FlightMapProps {
  routes: Route[]
  selectedRoute?: Route
  onRouteSelect?: (route: Route) => void
  className?: string
}

export function FlightMap({ routes, selectedRoute, onRouteSelect, className }: FlightMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 将 Route[] 转换为 AMapCore 的通用数据结构
  const { airports, flightPaths, mapCenter, mapZoom } = useMemo(() => {
    const airportSet = new Map<string, AMapAirport>()
    const paths: AMapFlightPath[] = []

    routes.forEach((route) => {
      const routeCoordinates: Array<[number, number]> = []

      route.segments.forEach((segment, segIndex) => {
        const originCoords =
          getAirportCoordinatesByName(segment.origin_airport) ||
          (segment.origin_iata_code ? getAirportCoordinatesByIATA(segment.origin_iata_code) : undefined) ||
          getAirportCoordinatesByCity(segment.origin_city)

        const originKey = segment.origin_iata_code || segment.origin_airport || segment.origin_city
        if (originCoords && !airportSet.has(originKey)) {
          // 判断 markerType
          let markerType: "origin" | "destination" | "transfer" = "transfer"
          const firstSeg = route.segments[0]
          if (segment.origin_city === firstSeg.origin_city) markerType = "origin"

          airportSet.set(originKey, {
            lat: originCoords.lat,
            lng: originCoords.lng,
            name: originCoords.name,
            city: segment.origin_city,
            iata: segment.origin_iata_code || originCoords.iata,
            markerType
          })
        }

        if (originCoords && (segIndex === 0 || routeCoordinates.length === 0)) {
          routeCoordinates.push([originCoords.lat, originCoords.lng])
        }

        const destCoords =
          getAirportCoordinatesByName(segment.dest_airport) ||
          (segment.dest_iata_code ? getAirportCoordinatesByIATA(segment.dest_iata_code) : undefined) ||
          getAirportCoordinatesByCity(segment.dest_city)

        const destKey = segment.dest_iata_code || segment.dest_airport || segment.dest_city
        if (destCoords && !airportSet.has(destKey)) {
          let markerType: "origin" | "destination" | "transfer" = "transfer"
          const lastSeg = route.segments[route.segments.length - 1]
          if (segment.dest_city === lastSeg.dest_city) markerType = "destination"

          airportSet.set(destKey, {
            lat: destCoords.lat,
            lng: destCoords.lng,
            name: destCoords.name,
            city: segment.dest_city,
            iata: segment.dest_iata_code || destCoords.iata,
            markerType
          })
        }

        if (destCoords) {
          routeCoordinates.push([destCoords.lat, destCoords.lng])
        }
      })

      if (routeCoordinates.length >= 2) {
        // 按中转数着色，与图例一致：绿色=直飞，橙色=1次中转，红色=2次中转
        const colorByStops: Record<number, string> = {
          0: "#10b981",  // green - 直飞
          1: "#f59e0b",  // amber - 1次中转
          2: "#ef4444",  // red - 2次中转
        }
        const routeColor = selectedRoute === route
          ? "#8b5cf6"  // purple - 当前选中
          : (colorByStops[route.stops] || "#3b82f6")
        paths.push({
          coordinates: routeCoordinates,
          color: routeColor,
          strokeWeight: selectedRoute === route ? 4 : 2.5,
          dashed: route.stops > 0,
          extData: route
        })
      }
    })

    // 计算中心点
    const allAirports = Array.from(airportSet.values())
    let center: [number, number] = [35, 105]  // 中国中心
    const zoom = 4
    if (allAirports.length > 0) {
      const avgLat = allAirports.reduce((s, a) => s + a.lat, 0) / allAirports.length
      const avgLng = allAirports.reduce((s, a) => s + a.lng, 0) / allAirports.length
      center = [avgLat, avgLng]
    }

    return {
      airports: allAirports,
      flightPaths: paths,
      mapCenter: center,
      mapZoom: zoom
    }
  }, [routes, selectedRoute])

  // 构建信息窗口内容
  const getInfoContent = (airport: AMapAirport): string => {
    // 查找经过该机场的航班
    const passingFlights: Array<{
      flightNo: string; carrier: string;
      from: string; to: string;
      depTime: string; arrTime: string;
      type: "departure" | "arrival"
    }> = []

    routes.forEach((route) => {
      route.segments.forEach((segment) => {
        if (segment.origin_city === airport.city) {
          passingFlights.push({
            from: segment.origin_city, to: segment.dest_city,
            flightNo: segment.flight_no, carrier: segment.carrier_name,
            depTime: segment.dep_time.split(" ")[1],
            arrTime: segment.arr_time.split(" ")[1],
            type: "departure"
          })
        }
        if (segment.dest_city === airport.city && airport.markerType === "transfer") {
          passingFlights.push({
            from: segment.origin_city, to: segment.dest_city,
            flightNo: segment.flight_no, carrier: segment.carrier_name,
            depTime: segment.dep_time.split(" ")[1],
            arrTime: segment.arr_time.split(" ")[1],
            type: "arrival"
          })
        }
      })
    })

    const uniqueFlights = passingFlights.reduce((acc, f) => {
      const key = `${f.flightNo}-${f.type}`
      if (!acc.find(x => `${x.flightNo}-${x.type}` === key)) acc.push(f)
      return acc
    }, [] as typeof passingFlights)

    const typeLabels = {
      origin: { text: "✈️ 始发站", bg: "#10B981" },
      destination: { text: "📍 终点站", bg: "#EF4444" },
      transfer: { text: "🔄 中转站", bg: "#F59E0B" }
    }
    const label = typeLabels[airport.markerType as keyof typeof typeLabels]

    return `
      <div style="padding:10px;min-width:200px;max-width:320px;">
        <h4 style="font-weight:600;margin:0 0 6px 0;font-size:14px;color:#1a1a1a;border-bottom:1px solid ${label?.bg || '#ccc'};padding-bottom:4px;">${airport.city}</h4>
        <p style="margin:0 0 4px 0;font-size:11px;color:#4a5568;"><strong>机场：</strong>${airport.name}</p>
        ${airport.iata ? `<p style="margin:0 0 4px 0;font-size:11px;color:#718096;"><strong>IATA：</strong>${airport.iata}</p>` : ''}
        ${label ? `<div style="margin:6px 0;"><span style="background:${label.bg};color:white;padding:2px 6px;border-radius:8px;font-size:10px;font-weight:500;">${label.text}</span></div>` : ''}
        ${uniqueFlights.length > 0 ? `
          <div style="border-top:1px solid #e2e8f0;padding-top:6px;margin-top:6px;">
            <p style="font-size:11px;font-weight:600;color:#2d3748;margin-bottom:4px;">航班信息：</p>
            <div class="info-scroll-container" style="max-height:150px;overflow-y:auto;padding-right:4px;">
              ${uniqueFlights.map(f => `
                <div style="background:${f.type === 'departure' ? '#f0fdf4' : '#fef3c7'};border-left:2px solid ${f.type === 'departure' ? '#10b981' : '#f59e0b'};padding:4px 6px;margin-bottom:3px;border-radius:0 3px 3px 0;">
                  <div style="display:flex;justify-content:space-between;font-size:10px;">
                    <span style="font-weight:600;">${f.carrier} ${f.flightNo}</span>
                    <span style="color:${f.type === 'departure' ? '#059669' : '#d97706'};font-weight:500;">${f.type === 'departure' ? '出发' : '到达'}</span>
                  </div>
                  <div style="font-size:9px;color:#4a5568;">${f.from} → ${f.to}</div>
                  <div style="font-size:9px;color:#718096;margin-top:1px;">${f.type === 'departure' ? `起飞: ${f.depTime}` : `到达: ${f.arrTime}`}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }

  if (!isClient) return null

  return (
    <div className={className}>
      <div className="space-y-4">
        <Card className="relative overflow-hidden">
          <div className="h-[500px] sm:h-[650px] md:h-[700px] w-full">
            <DynamicAMapCore
              airports={airports}
              flightPaths={flightPaths}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              onPathClick={(extData) => {
                if (onRouteSelect && extData) {
                  onRouteSelect(extData as Route)
                }
              }}
              getInfoContent={getInfoContent}
              className="h-full w-full"
            />
          </div>

          {/* 图例 */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 sm:p-3 z-[1000] max-w-[140px] sm:max-w-none">
            <h4 className="text-[11px] sm:text-sm font-semibold mb-1.5 sm:mb-2">航线图例</h4>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
                <span className="text-[10px] sm:text-xs">直飞航线</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-500 rounded-full"></div>
                <span className="text-[10px] sm:text-xs">1次中转</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
                <span className="text-[10px] sm:text-xs">2次中转</span>
              </div>
              {selectedRoute && (
                <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 border-t">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-[10px] sm:text-xs">当前选中</span>
                </div>
              )}
            </div>
          </div>

          {/* 地图提示信息 */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-md px-2 py-1.5 sm:px-3 sm:py-2 z-[1000] text-[10px] sm:text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="hidden sm:inline">点击航线可查看详情</span>
              <span className="sm:hidden">点击查看</span>
            </div>
          </div>
        </Card>

        {/* 选中航线的详情卡片 */}
        {selectedRoute && (
          <Card className="overflow-hidden transition-all duration-300 animate-in slide-in-from-top-2">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Badge
                      variant={selectedRoute.stops === 0 ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5",
                        selectedRoute.stops === 0 ? "bg-blue-500 hover:bg-blue-600" : ""
                      )}
                    >
                      {selectedRoute.stops === 0 ? "直飞" : `${selectedRoute.stops}次中转`}
                    </Badge>
                    <span className="text-sm font-medium hidden sm:inline">
                      {selectedRoute.segments[0].origin_city} → {selectedRoute.segments[selectedRoute.segments.length - 1].dest_city}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {Math.floor(selectedRoute.total_duration_mins / 60)}h{selectedRoute.total_duration_mins % 60 > 0 ? `${selectedRoute.total_duration_mins % 60}m` : ''}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-blue-600">
                      到达 {selectedRoute.arrive_time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2">
                {/* 航段详情（移动端和PC端布局复用原 flight-map.tsx 的实现） */}
                <div className="hidden sm:flex items-center gap-3">
                  {selectedRoute.segments.map((segment, index) => (
                    <React.Fragment key={index}>
                      <div className="flex-1 text-center">
                        <div className="text-sm font-semibold">{segment.origin_city}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{segment.dep_time.split(" ")[1]}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{segment.carrier_name} {segment.flight_no}</div>
                      </div>
                      <div className="flex-1 max-w-[180px] relative">
                        <div className={`h-0.5 ${selectedRoute.stops === 0 ? 'bg-blue-400' : 'bg-gray-300'} rounded-full`}></div>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                          <Plane className={`w-4 h-4 ${selectedRoute.stops === 0 ? 'text-blue-500' : 'text-gray-500'}`} />
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-sm font-semibold">{segment.dest_city}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{segment.arr_time.split(" ")[1]}</div>
                        {index < selectedRoute.segments.length - 1 && (
                          <div className="text-[11px] text-orange-500 mt-0.5">中转</div>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                {/* 移动端简化布局 */}
                <div className="sm:hidden">
                  {selectedRoute.segments.map((segment, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-semibold">{segment.origin_city}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{segment.dep_time.split(" ")[1]}</div>
                        </div>
                        <div className="px-2"><Plane className="w-3.5 h-3.5 text-blue-500" /></div>
                        <div className="flex-1 text-right">
                          <div className="text-xs font-semibold">{segment.dest_city}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{segment.arr_time.split(" ")[1]}</div>
                        </div>
                      </div>
                      <div className="text-center text-[10px] text-gray-400 mt-1">{segment.carrier_name} {segment.flight_no}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
