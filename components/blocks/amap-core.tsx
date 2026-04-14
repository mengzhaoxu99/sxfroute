"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
// AMap JS API 是 untyped 的全局对象，类型为 any 是必然结果
import React, { useEffect, useRef, useState } from "react"
import AMapLoader from "@amap/amap-jsapi-loader"
import { useRuntimeConfig } from "@/providers/runtime-config"

// 通用机场标记数据
export interface AMapAirport {
  lat: number
  lng: number
  name: string
  city: string
  iata?: string
  markerType: "origin" | "destination" | "transfer" | "default"
}

// 通用航线数据
export interface AMapFlightPath {
  coordinates: Array<[number, number]>  // [lat, lng] pairs
  color: string
  strokeWeight?: number
  dashed?: boolean
  label?: string
  extData?: any
}

// 通用信息窗口内容
export interface AMapInfoContent {
  title: string
  subtitle?: string
  badgeText?: string
  badgeColor?: string
  details?: Array<{
    label: string
    value: string
    highlight?: boolean
  }>
}

interface AMapCoreProps {
  airports: AMapAirport[]
  flightPaths: AMapFlightPath[]
  mapCenter?: [number, number]  // [lat, lng]
  mapZoom?: number
  onPathClick?: (extData: any) => void
  onAirportClick?: (airport: AMapAirport) => void
  getInfoContent?: (airport: AMapAirport) => string
  className?: string
}

export function AMapCore({
  airports,
  flightPaths,
  mapCenter = [30.6595, 104.0657],  // 成都，中国中心
  mapZoom = 4,
  onPathClick,
  onAirportClick,
  getInfoContent,
  className = "h-full w-full"
}: AMapCoreProps) {
  const { amapKey, amapSecurityCode } = useRuntimeConfig()
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const polylinesRef = useRef<any[]>([])
  const currentInfoWindowRef = useRef<any>(null)
  const [AMap, setAMap] = useState<any>(null)

  // 添加全局样式
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .amap-info-content .info-scroll-container::-webkit-scrollbar {
        width: 6px !important;
        height: 6px !important;
      }
      .amap-info-content .info-scroll-container::-webkit-scrollbar-track {
        background: #f1f1f1 !important;
        border-radius: 3px !important;
      }
      .amap-info-content .info-scroll-container::-webkit-scrollbar-thumb {
        background: #888 !important;
        border-radius: 3px !important;
      }
      .amap-info-content .info-scroll-container::-webkit-scrollbar-thumb:hover {
        background: #555 !important;
      }
      .amap-info-content {
        overflow: visible !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    if (!amapKey) return

    // AMap SDK requires this global before load()
    ;(window as any)._AMapSecurityConfig = { securityJsCode: amapSecurityCode }

    AMapLoader.load({
      key: amapKey,
      version: "2.0",
      plugins: []
    }).then((amap) => {
      setAMap(amap)
      if (!mapContainerRef.current || mapRef.current) return
      mapRef.current = new amap.Map(mapContainerRef.current, {
        viewMode: "2D",
        zoom: mapZoom,
        center: [mapCenter[1], mapCenter[0]],  // 高德地图是 [lng, lat]
        mapStyle: "amap://styles/normal"
      })
    }).catch((e) => {
      console.error("高德地图加载失败", e)
    })

    return () => {
      mapRef.current?.destroy()
      mapRef.current = null
    }
    // mapCenter / mapZoom 仅作为初始化参数使用，更新它们应通过外部 props 重新渲染地图
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amapKey, amapSecurityCode])

  // 绘制航线和标记
  useEffect(() => {
    if (!AMap || !mapRef.current) return

    // 清除现有的标记和线条
    markersRef.current.forEach(marker => mapRef.current.remove(marker))
    polylinesRef.current.forEach(polyline => mapRef.current.remove(polyline))
    markersRef.current = []
    polylinesRef.current = []

    // 绘制航线
    flightPaths.forEach((path) => {
      const coordinates = path.coordinates
      if (coordinates.length < 2) return

      for (let i = 0; i < coordinates.length - 1; i++) {
        const start = coordinates[i]
        const end = coordinates[i + 1]

        // 生成曲线点模拟飞行轨迹
        const curvePoints: Array<[number, number]> = []
        const steps = 30
        for (let j = 0; j <= steps; j++) {
          const t = j / steps
          const distance = Math.sqrt(
            Math.pow(end[0] - start[0], 2) +
            Math.pow(end[1] - start[1], 2)
          )
          const height = Math.min(distance * 0.15, 5)
          const arcHeight = Math.sin(t * Math.PI) * height
          const lat = start[0] + (end[0] - start[0]) * t + arcHeight
          const lng = start[1] + (end[1] - start[1]) * t
          curvePoints.push([lng, lat])
        }

        const polyline = new AMap.Polyline({
          path: curvePoints,
          strokeColor: path.color,
          strokeWeight: path.strokeWeight || 2.5,
          strokeOpacity: 0.7,
          strokeStyle: path.dashed ? "dashed" : "solid",
          strokeDashArray: path.dashed ? [8, 4] : undefined,
          lineJoin: 'round',
          lineCap: 'round',
          cursor: 'pointer',
          extData: path.extData
        })

        if (onPathClick) {
          polyline.on('click', () => {
            onPathClick(path.extData)
          })
        }

        polyline.on('mouseover', function() {
          polyline.setOptions({ strokeWeight: 5, strokeOpacity: 1 })
        })
        polyline.on('mouseout', function() {
          polyline.setOptions({
            strokeWeight: path.strokeWeight || 2.5,
            strokeOpacity: 0.7
          })
        })

        mapRef.current.add(polyline)
        polylinesRef.current.push(polyline)
      }
    })

    // 绘制机场标记
    const markerConfigs = {
      origin: { color: "#10B981", icon: "✈️", size: 32 },
      destination: { color: "#EF4444", icon: "📍", size: 32 },
      transfer: { color: "#F59E0B", icon: "🔄", size: 28 },
      default: { color: "#3b82f6", icon: "✈️", size: 24 }
    }

    airports.forEach((airport) => {
      const config = markerConfigs[airport.markerType]
      const marker = new AMap.Marker({
        position: [airport.lng, airport.lat],
        content: `
          <div style="position:relative;width:${config.size}px;height:${config.size}px;">
            <div style="position:absolute;background:${config.color};width:100%;height:100%;border-radius:50%;border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.4);opacity:0.9;"></div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:${config.size*0.5}px;z-index:1;">${config.icon}</div>
          </div>
        `,
        offset: new AMap.Pixel(-config.size/2, -config.size/2),
        extData: airport
      })

      marker.on('click', () => {
        if (currentInfoWindowRef.current) {
          currentInfoWindowRef.current.close()
        }

        if (onAirportClick) {
          onAirportClick(airport)
        }

        const content = getInfoContent ? getInfoContent(airport) : `
          <div style="padding:10px;min-width:150px;">
            <h4 style="font-weight:600;margin:0 0 4px 0;font-size:14px;">${airport.city}</h4>
            <p style="margin:0;font-size:12px;color:#666;">${airport.name}${airport.iata ? ` (${airport.iata})` : ''}</p>
          </div>
        `

        const infoWindow = new AMap.InfoWindow({
          content,
          offset: new AMap.Pixel(0, -config.size/2),
          closeWhenClickMap: true,
          isCustom: false,
          autoMove: true,
          anchor: 'bottom-center'
        })
        infoWindow.open(mapRef.current, marker.getPosition())
        currentInfoWindowRef.current = infoWindow
        ;(window as any).__currentInfoWindow = infoWindow

        // 确保滚动容器能正确工作
        setTimeout(() => {
          const scrollContainers = document.querySelectorAll('.info-scroll-container')
          scrollContainers.forEach(container => {
            container.addEventListener('wheel', (e) => {
              e.stopPropagation()
            }, { passive: true })
          })
        }, 100)
      })

      mapRef.current.add(marker)
      markersRef.current.push(marker)
    })

    // 调整视图以适应所有标记
    if (airports.length > 0) {
      mapRef.current.setFitView(markersRef.current, false, [50, 50, 50, 50])
    }

    // 点击地图关闭信息窗口
    mapRef.current.on('click', () => {
      if (currentInfoWindowRef.current) {
        currentInfoWindowRef.current.close()
        currentInfoWindowRef.current = null
        ;(window as any).__currentInfoWindow = null
      }
    })
  }, [AMap, airports, flightPaths, onPathClick, onAirportClick, getInfoContent])

  return <div ref={mapContainerRef} className={className} />
}
