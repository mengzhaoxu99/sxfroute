"use client"

import React, { useEffect, useMemo, useState } from "react"
import { getAirportCoordinatesByCity, getAirportCoordinatesByIATA, getAirportCoordinatesByName } from "@/lib/flight/airport-coordinates"
import { FlightData } from "@/types/flight"
import { FlightDaysDisplay } from "@/components/blocks/flight-days-display"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { AMapCore, AMapAirport, AMapFlightPath } from "./amap-core"

interface SimpleFlightMapProps {
  flights: FlightData[]
  className?: string
}

export function SimpleFlightMap({ flights, className = "" }: SimpleFlightMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<{
    fromCity: string
    toCity: string
    flights: FlightData[]
  } | null>(null)

  // flights 变化时清空已选中的航线，避免残留旧数据
  useEffect(() => {
    setSelectedRoute(null)
  }, [flights])

  // 将 FlightData[] 转换为 AMapCore 的通用数据结构
  const { airports, flightPaths } = useMemo(() => {
    const airportCoords = new Map<string, AMapAirport & { count: number; iataCode: string; airportName: string }>()
    const routeList: Array<{
      from: [number, number]; to: [number, number];
      flights: FlightData[]; fromCity: string; toCity: string
    }> = []

    flights.forEach(flight => {
      const originCoords =
        getAirportCoordinatesByName(flight.origin_airport) ||
        (flight.origin_iata_code ? getAirportCoordinatesByIATA(flight.origin_iata_code) : undefined) ||
        getAirportCoordinatesByCity(flight.origin_city)

      const destCoords =
        getAirportCoordinatesByName(flight.dest_airport) ||
        (flight.dest_iata_code ? getAirportCoordinatesByIATA(flight.dest_iata_code) : undefined) ||
        getAirportCoordinatesByCity(flight.dest_city)

      if (originCoords && destCoords) {
        const originKey = flight.origin_iata_code || flight.origin_airport
        if (!airportCoords.has(originKey)) {
          airportCoords.set(originKey, {
            ...originCoords,
            city: flight.origin_city,
            iata: flight.origin_iata_code || '',
            iataCode: flight.origin_iata_code || '',
            airportName: flight.origin_airport,
            markerType: "default",
            count: 0
          })
        }

        const destKey = flight.dest_iata_code || flight.dest_airport
        if (!airportCoords.has(destKey)) {
          airportCoords.set(destKey, {
            ...destCoords,
            city: flight.dest_city,
            iata: flight.dest_iata_code || '',
            iataCode: flight.dest_iata_code || '',
            airportName: flight.dest_airport,
            markerType: "default",
            count: 0
          })
        }

        airportCoords.get(originKey)!.count++
        airportCoords.get(destKey)!.count++

        // 去重航线
        const routeExists = routeList.some(r => {
          return (
            (Math.abs(r.from[0] - originCoords.lng) < 0.01 &&
             Math.abs(r.from[1] - originCoords.lat) < 0.01 &&
             Math.abs(r.to[0] - destCoords.lng) < 0.01 &&
             Math.abs(r.to[1] - destCoords.lat) < 0.01) ||
            (Math.abs(r.from[0] - destCoords.lng) < 0.01 &&
             Math.abs(r.from[1] - destCoords.lat) < 0.01 &&
             Math.abs(r.to[0] - originCoords.lng) < 0.01 &&
             Math.abs(r.to[1] - originCoords.lat) < 0.01)
          )
        })

        if (!routeExists) {
          routeList.push({
            from: [originCoords.lng, originCoords.lat],
            to: [destCoords.lng, destCoords.lat],
            flights: [flight],
            fromCity: flight.origin_city,
            toCity: flight.dest_city
          })
        } else {
          const existing = routeList.find(r =>
            Math.abs(r.from[0] - originCoords.lng) < 0.01 &&
            Math.abs(r.from[1] - originCoords.lat) < 0.01 &&
            Math.abs(r.to[0] - destCoords.lng) < 0.01 &&
            Math.abs(r.to[1] - destCoords.lat) < 0.01
          )
          if (existing) existing.flights.push(flight)
        }
      }
    })

    // 转为 AMapFlightPath（注意这里是直线航线，用 [lat, lng] 格式给 AMapCore）
    const paths: AMapFlightPath[] = routeList.map(r => ({
      coordinates: [
        [r.to[1], r.to[0]],    // to: [lat, lng] — 注意 from 是 [lng, lat] 要反转
        [r.from[1], r.from[0]]  // from: [lat, lng]
      ].reverse() as Array<[number, number]>,
      color: '#10b981',
      strokeWeight: 3,
      dashed: false,
      extData: { fromCity: r.fromCity, toCity: r.toCity, flights: r.flights }
    }))

    return {
      airports: Array.from(airportCoords.values()),
      flightPaths: paths
    }
  }, [flights])

  // 机场信息窗口
  const getInfoContent = (airport: AMapAirport): string => {
    const a = airport as AMapAirport & { iataCode?: string; airportName?: string }
    const displayText = a.iata ? `${a.city}(${a.iata})` : a.city
    return `
      <div style="padding:8px;min-width:120px;">
        <h4 style="font-weight:600;margin:0 0 4px 0;font-size:13px;">${displayText}</h4>
        <p style="margin:0;font-size:11px;color:#666;">${a.name}</p>
      </div>
    `
  }

  return (
    <div>
      <div
        className={className}
        style={{ minHeight: '400px', width: '100%', position: 'relative', backgroundColor: '#f0f0f0' }}
      >
        {flights.length > 0 && !selectedRoute && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10
                          bg-white/95 dark:bg-gray-800/95 px-3 py-2 rounded-lg shadow-md
                          text-sm text-gray-700 dark:text-gray-300 backdrop-blur-sm
                          animate-in fade-in-0 slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>点击航线可查看航班详情</span>
            </div>
          </div>
        )}
        <AMapCore
          airports={airports}
          flightPaths={flightPaths}
          onPathClick={(extData) => {
            if (extData) {
              setSelectedRoute({
                fromCity: extData.fromCity,
                toCity: extData.toCity,
                flights: extData.flights
              })
            }
          }}
          getInfoContent={getInfoContent}
          className="h-full w-full"
        />
      </div>

      {/* 选中航线的航班列表（保留原 simple-flight-map 的 UI） */}
      {selectedRoute && (
        <div className="mt-4 rounded-lg border bg-white dark:bg-gray-900 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-b">
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-300">
                {selectedRoute.fromCity} → {selectedRoute.toCity}
              </h3>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs sm:text-sm px-2 py-0.5">
                {selectedRoute.flights.length} 个航班
              </Badge>
            </div>
            <button onClick={() => setSelectedRoute(null)} className="p-1 sm:p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="关闭">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* PC端表格 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">序号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">航班号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">航空公司</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">飞行日</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">起飞机场</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">到达机场</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">起飞时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">到达时间</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedRoute.flights.map((flight, index) => {
                  const isNightFlight = parseInt(flight.dep_time.substring(0, 2)) >= 19 || parseInt(flight.dep_time.substring(0, 2)) <= 9
                  return (
                    <tr key={`${flight.flight_no}-${index}`} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{flight.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{flight.flight_no}</span>
                          {flight.is_2666_exclusive && (
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" variant="secondary">2666特有</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{flight.carrier_name}</td>
                      <td className="px-4 py-3 text-sm"><FlightDaysDisplay days={flight.days} variant="dots" /></td>
                      <td className="px-4 py-3 text-sm">
                        <div><div className="font-medium">{flight.origin_airport}</div>{flight.origin_iata_code && <div className="text-xs text-muted-foreground">{flight.origin_iata_code}</div>}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div><div className="font-medium">{flight.dest_airport}</div>{flight.dest_iata_code && <div className="text-xs text-muted-foreground">{flight.dest_iata_code}</div>}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={isNightFlight ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>{flight.dep_time.substring(0, 2)}:{flight.dep_time.substring(2, 4)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{flight.arr_time.substring(0, 2)}:{flight.arr_time.substring(2, 4)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 移动端紧凑列表 */}
          <div className="block sm:hidden divide-y">
            {selectedRoute.flights.map((flight, index) => {
              const isNightFlight = parseInt(flight.dep_time.substring(0, 2)) >= 19 || parseInt(flight.dep_time.substring(0, 2)) <= 9
              return (
                <div key={`${flight.flight_no}-${index}`} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-semibold text-sm">{flight.flight_no}</span>
                      {flight.is_2666_exclusive && (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs px-1 py-0 h-4" variant="secondary">2666</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">· {flight.carrier_name}</span>
                    </div>
                    <FlightDaysDisplay days={flight.days} variant="dots" />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className={isNightFlight ? "text-blue-600 dark:text-blue-400 font-semibold" : "font-medium"}>
                        {flight.dep_time.substring(0, 2)}:{flight.dep_time.substring(2, 4)}
                      </span>
                      <span className="text-muted-foreground">{flight.origin_city}</span>
                    </div>
                    <svg className="w-3 h-3 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{flight.arr_time.substring(0, 2)}:{flight.arr_time.substring(2, 4)}</span>
                      <span className="text-muted-foreground">{flight.dest_city}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span className="truncate max-w-[45%]">{flight.origin_airport}</span>
                    <span className="truncate max-w-[45%] text-right">{flight.dest_airport}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
