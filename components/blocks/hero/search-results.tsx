"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plane, Map, ArrowRight, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Route, RoundtripRoute } from "@/lib/flight/types"
import { FlightMap } from "@/components/blocks/flight-map-amap"
import { RoundtripResults } from "./roundtrip-results"
import { useRuntimeConfig } from "@/providers/runtime-config"

interface SearchResultsProps {
  routes: Route[]
  loading: boolean
  searched: boolean
  restriction?: string
  roundtripRoutes?: RoundtripRoute[]
  tripType?: 'oneway' | 'roundtrip'
}

export function SearchResults({ routes, loading, searched, restriction, roundtripRoutes, tripType }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<"arrive" | "duration" | "stops">("stops")
  const [expandedRoutes, setExpandedRoutes] = useState<Set<number>>(new Set())
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const { amapKey } = useRuntimeConfig()
  const hasAmapKey = !!amapKey

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ""}`
  }

  // 格式化停留时长
  const formatStayDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? `${mins}分` : ""}`
    }
    return `${mins}分钟`
  }

  // 计算航段飞行时间
  const calculateSegmentDuration = (segment: typeof routes[0]['segments'][0]) => {
    const depDateTime = new Date(segment.dep_time)
    const arrDateTime = new Date(segment.arr_time)
    const durationMs = arrDateTime.getTime() - depDateTime.getTime()
    return Math.floor(durationMs / (1000 * 60)) // 转换为分钟
  }

  // 计算中转停留时间
  const calculateStayDuration = (prevSegment: typeof routes[0]['segments'][0], nextSegment: typeof routes[0]['segments'][0]) => {
    const prevArrTime = new Date(prevSegment.arr_time)
    const nextDepTime = new Date(nextSegment.dep_time)
    const stayMs = nextDepTime.getTime() - prevArrTime.getTime()
    return Math.floor(stayMs / (1000 * 60)) // 转换为分钟
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedRoutes)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRoutes(newExpanded)
  }

  // 解析到达时间用于排序（处理 +1、+2 等跨天情况）
  const parseArrivalTime = (arriveTime: string): number => {
    const match = arriveTime.match(/(\d{2}):(\d{2})(?:\s*\(\+(\d+)\))?/)
    if (!match) return 0
    
    const hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const plusDays = match[3] ? parseInt(match[3]) : 0
    
    return plusDays * 1440 + hours * 60 + minutes
  }

  const sortedRoutes = [...routes].sort((a, b) => {
    switch (sortBy) {
      case "arrive":
        return parseArrivalTime(a.arrive_time) - parseArrivalTime(b.arrive_time)
      case "duration":
        return a.total_duration_mins - b.total_duration_mins
      case "stops":
        return a.stops - b.stops
      default:
        return 0
    }
  })

  const RouteCard = ({ route, index }: { route: Route; index: number }) => {
    const isExpanded = expandedRoutes.has(index)
    const firstSegment = route.segments[0]
    const lastSegment = route.segments[route.segments.length - 1]
    
    return (
      <Card 
        className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow"
        onClick={(e) => {
          // 如果点击的是卡片背景区域且已展开，则折叠
          if (isExpanded && e.target === e.currentTarget) {
            toggleExpanded(index)
          }
        }}
      >
        <CardContent className="py-2 px-3">
          {/* 折叠时显示的摘要信息 */}
          <div 
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              toggleExpanded(index)
            }}
          >
            {/* 移动端优化布局 - 更紧凑的设计 */}
            <div className="sm:hidden">
              {/* 第一行：直飞/中转徽章、时长、到达时间 */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant={route.stops === 0 ? "default" : "secondary"} className="text-[10px] px-1 py-0 h-4">
                    {route.stops === 0 ? "直飞" : `${route.stops}次中转`}
                  </Badge>
                  {route.hasReturn && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-500 text-green-600">
                      可往返
                    </Badge>
                  )}
                  <span className="text-[10px] text-gray-500">
                    {formatDuration(route.total_duration_mins)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-sm font-semibold text-blue-600">
                    {route.arrive_time.includes("(+") ? (
                      <>
                        {route.arrive_time.split(" (")[0]}
                        <span className="text-orange-500 text-[10px] ml-0.5">({route.arrive_time.split(" (")[1]}</span>
                      </>
                    ) : (
                      route.arrive_time
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* 第二行：航线信息 - 更紧凑 */}
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs">{firstSegment.dep_time.split(" ")[1]}</span>
                    <span className="font-medium text-xs">{firstSegment.origin_city}</span>
                  </div>
                  <div className="text-[9px] text-gray-500">
                    {firstSegment.origin_iata_code || firstSegment.origin_airport.substring(0, 6)}
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-[1px] bg-gray-300"></div>
                    <Plane className="w-3 h-3 text-blue-500 transform rotate-90" />
                    <div className="w-6 h-[1px] bg-gray-300"></div>
                  </div>
                </div>
                
                <div className="flex-1 text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-xs">{lastSegment.arr_time.split(" ")[1]}</span>
                    <span className="font-medium text-xs">{lastSegment.dest_city}</span>
                  </div>
                  <div className="text-[9px] text-gray-500">
                    {lastSegment.dest_iata_code || lastSegment.dest_airport.substring(0, 6)}
                  </div>
                </div>
              </div>
              
              {/* 中转信息 - 单行显示 */}
              {route.stops > 0 && (
                <div className="mt-0.5 text-center text-[10px] text-gray-500">
                  经{route.connect_cities.join("、")}中转
                  {route.connect_cities.length === 1 && (
                    <span className="ml-1">
                      (停留{formatStayDuration(calculateStayDuration(route.segments[0], route.segments[1]))})
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* PC端优化布局 - 两行展示更多信息 */}
            <div className="hidden sm:block">
              {/* 第一行：航线主信息 */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <Badge variant={route.stops === 0 ? "default" : "secondary"} className="text-xs px-1.5 py-0.5">
                    {route.stops === 0 ? "直飞" : `${route.stops}次中转`}
                  </Badge>
                  {route.hasReturn && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-500 text-green-600">
                      可往返
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="font-semibold text-base">{firstSegment.origin_city}</span>
                      <span className="text-xs text-gray-500 ml-1">({firstSegment.origin_iata_code || firstSegment.origin_airport.substring(0, 3)})</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="font-semibold text-base">{lastSegment.dest_city}</span>
                      <span className="text-xs text-gray-500 ml-1">({lastSegment.dest_iata_code || lastSegment.dest_airport.substring(0, 3)})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    总时长 {formatDuration(route.total_duration_mins)}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="ml-1">{isExpanded ? "收起" : "详情"}</span>
                  </Button>
                </div>
              </div>
              
              {/* 第二行：时间和航班信息 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium">{firstSegment.dep_time.split(" ")[1]}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-blue-600">
                      {route.arrive_time.includes("(+") ? (
                        <>
                          {route.arrive_time.split(" (")[0]}
                          <span className="text-orange-500 text-xs ml-0.5">({route.arrive_time.split(" (")[1]}</span>
                        </>
                      ) : (
                        route.arrive_time
                      )}
                    </span>
                  </div>
                  {route.stops === 0 ? (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Plane className="w-3 h-3" />
                      <span>{firstSegment.carrier_name} {firstSegment.flight_no}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>经{route.connect_cities.join("、")}中转</span>
                      {route.connect_cities.length === 1 && (
                        <span className="text-gray-400">
                          (停留{formatStayDuration(calculateStayDuration(route.segments[0], route.segments[1]))})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 展开时显示的详细信息 */}
          {isExpanded && (
            <div 
              className="mt-2 pt-2 border-t space-y-1 animate-in fade-in slide-in-from-top-2 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {route.segments.map((segment, segIndex) => (
                <div key={segIndex}>
                  {/* 移动端详细信息布局 - 更紧凑 */}
                  <div className="sm:hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-1.5">
                      <div className="flex justify-between items-center mb-0.5">
                        <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                          {segment.carrier_name} {segment.flight_no}
                        </div>
                        <div className="text-[9px] text-gray-500">
                          {(() => {
                            const duration = calculateSegmentDuration(segment)
                            const hours = Math.floor(duration / 60)
                            const mins = duration % 60
                            return hours > 0 ? `${hours}h${mins > 0 ? `${mins}m` : ''}` : `${mins}m`
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-[10px]">
                          <span className="font-medium">{segment.dep_time.split(" ")[1]}</span>
                          <span className="ml-1">{segment.origin_city}</span>
                          <span className="text-gray-500 ml-0.5">({segment.origin_iata_code || segment.origin_airport.substring(0, 3)})</span>
                        </div>
                        <Plane className="w-2.5 h-2.5 text-blue-500 transform rotate-90" />
                        <div className="flex-1 text-right text-[10px]">
                          <span className="font-medium">{segment.arr_time.split(" ")[1]}</span>
                          <span className="ml-1">{segment.dest_city}</span>
                          <span className="text-gray-500 ml-0.5">({segment.dest_iata_code || segment.dest_airport.substring(0, 3)})</span>
                        </div>
                      </div>
                    </div>
                    {segIndex < route.segments.length - 1 && (
                      <div className="text-center py-0.5">
                        <span className="text-[9px] text-orange-600 dark:text-orange-400">
                          ↓ {route.connect_cities[segIndex]} 停留{formatStayDuration(calculateStayDuration(segment, route.segments[segIndex + 1]))}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* PC端详细信息布局 */}
                  <div className="hidden sm:block">
                    <div className="flex items-start gap-6">
                      <div className="flex-1 flex items-center gap-4">
                        <div className="text-center min-w-[120px]">
                          <div className="font-semibold">{segment.origin_city}</div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {segment.origin_airport}
                            {segment.origin_iata_code && (
                              <span className="ml-1 font-medium">({segment.origin_iata_code})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {segment.dep_time.split(" ")[1]}
                            {segment.plus_day > 0 && (
                              <span className="text-orange-500 ml-1">(+{segment.plus_day})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <Plane className="w-4 h-4 mx-2 text-blue-500" />
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        <div className="text-center min-w-[120px]">
                          <div className="font-semibold">{segment.dest_city}</div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {segment.dest_airport}
                            {segment.dest_iata_code && (
                              <span className="ml-1 font-medium">({segment.dest_iata_code})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {segment.arr_time.split(" ")[1]}
                            {segment.plus_day > 0 && (
                              <span className="text-orange-500 ml-1">(+{segment.plus_day})</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="text-sm font-medium">{segment.carrier_name}</div>
                        <div className="text-sm text-gray-500">{segment.flight_no}</div>
                      </div>
                    </div>
                    
                    {segIndex < route.segments.length - 1 && (
                      <div className="py-1">
                        <div className="flex items-center justify-center">
                          <Separator className="flex-1" />
                          <div className="px-2 text-center">
                            <div className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">
                              中转: {route.connect_cities[segIndex]}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              停留 {formatStayDuration(calculateStayDuration(segment, route.segments[segIndex + 1]))}
                            </div>
                          </div>
                          <Separator className="flex-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 未搜索时只显示提示内容，不显示Card
  if (!searched) {
    return (
      <div className="space-y-4">
        {/* PC端使用步骤 */}
        <div className="hidden sm:block bg-gradient-to-br from-sky-50/30 via-white to-blue-50/20 border border-sky-100 rounded-xl p-8 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 justify-center">
            <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            快速上手指南
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="group">
              <div className="text-center transition-transform duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg">
                  1
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">选择出发和到达城市</h4>
                <p className="text-sm text-gray-500">支持全国主要城市</p>
              </div>
            </div>
            <div className="group">
              <div className="text-center transition-transform duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg">
                  2
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">选择日期和时间窗口</h4>
                <p className="text-sm text-gray-500">凌晨窗或夜晚窗</p>
              </div>
            </div>
            <div className="group">
              <div className="text-center transition-transform duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg">
                  3
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">点击搜索查看结果</h4>
                <p className="text-sm text-gray-500">智能规划最优航线</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 搜索后显示结果
  // 如果是往返搜索，显示往返结果组件
  if (tripType === 'roundtrip' && roundtripRoutes) {
    return <RoundtripResults roundtripRoutes={roundtripRoutes} loading={loading} />
  }
  
  // 单程搜索结果
  return (
    <div className="space-y-4">
      {routes.length > 0 && (
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "map")} className="w-full">
          {hasAmapKey && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">
                <Plane className="w-4 h-4 mr-2" />
                列表视图
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="w-4 h-4 mr-2" />
                地图视图
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="list" className={hasAmapKey ? "mt-4" : "mt-0"}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>搜索结果</CardTitle>
                    <CardDescription>
                      找到 {routes.length} 条航线
                    </CardDescription>
                  </div>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as "arrive" | "duration" | "stops")}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arrive">最早到达</SelectItem>
                      <SelectItem value="duration">总时长最短</SelectItem>
                      <SelectItem value="stops">中转最少</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent
                onClick={() => {
                  // \u70b9\u51fb\u7a7a\u767d\u533a\u57df\u65f6\u6298\u53e0\u6240\u6709\u5c55\u5f00\u7684\u5361\u7247
                  if (expandedRoutes.size > 0) {
                    setExpandedRoutes(new Set())
                  }
                }}
              >
                <div className="relative">
                  <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {sortedRoutes.map((route, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRoute(route)
                      }}
                      className="cursor-pointer"
                    >
                      <RouteCard route={route} index={index} />
                    </div>
                  ))}
                  </div>
                  {/* 滚动提示 */}
                  {sortedRoutes.length > 5 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="map" className="mt-4">
            <FlightMap 
              routes={routes} 
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {searched && !loading && routes.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {restriction ? "666版本在限制期间无法预订" : "未找到符合条件的航班"}
              </h3>
              {restriction ? (
                <div className="text-gray-600 mt-4">
                  <p className="mb-4">您选择的日期在666版本限制期间内（2025年9月30日-10月9日）</p>
                  <div className="space-y-2 text-sm">
                    <p>• 选择2025年9月30日之前或10月10日之后的日期</p>
                    <p>• 升级到2666版本可以直接预订</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-500 mb-4">请尝试以下建议：</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 增加最大中转次数</p>
                    <p>• 选择其他时间窗口</p>
                    <p>• 更换出发日期</p>
                    <p>• 检查城市名称是否正确</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}