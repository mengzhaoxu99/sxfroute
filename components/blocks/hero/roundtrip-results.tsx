"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, Plane, Clock, CheckCircle2, AlertCircle, ChevronUp, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoundtripRoute } from "@/lib/flight/types"
import { cn } from "@/lib/utils"

interface RoundtripResultsProps {
  roundtripRoutes: RoundtripRoute[]
  loading: boolean
}

export function RoundtripResults({ roundtripRoutes, loading }: RoundtripResultsProps) {
  const [expandedRoutes, setExpandedRoutes] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<"combined" | "separate">("combined")
  const [selectedOutbound, setSelectedOutbound] = useState<typeof roundtripRoutes[0]['outbound'] | null>(null)
  const [selectedReturn, setSelectedReturn] = useState<typeof roundtripRoutes[0]['return'] | null>(null)
  const [mobileActiveTab, setMobileActiveTab] = useState<"outbound" | "return">("outbound")
  const [pcActiveTab, setPcActiveTab] = useState<"outbound" | "return">("outbound")

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ""}`
  }

  const formatGapTime = (hours: number) => {
    if (hours < 0) return "时间冲突"
    
    const totalMinutes = Math.round(hours * 60)
    const days = Math.floor(totalMinutes / (24 * 60))
    const remainingMinutes = totalMinutes % (24 * 60)
    const displayHours = Math.floor(remainingMinutes / 60)
    const displayMinutes = remainingMinutes % 60
    
    if (days > 0) {
      if (displayHours > 0) {
        return `${days}天${displayHours}小时`
      }
      return `${days}天`
    }
    
    if (displayHours > 0) {
      if (displayMinutes > 0) {
        return `${displayHours}小时${displayMinutes}分`
      }
      return `${displayHours}小时`
    }
    
    return `${displayMinutes}分钟`
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

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardContent className="py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          <p className="text-gray-600">正在搜索往返航班...</p>
        </CardContent>
      </Card>
    )
  }

  if (roundtripRoutes.length === 0) {
    return (
      <Card className="shadow-md">
        <CardContent className="py-12 text-center">
          <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">未找到符合条件的往返航班</p>
          <p className="text-sm text-gray-500 mt-2">请尝试调整搜索条件</p>
        </CardContent>
      </Card>
    )
  }

  const RoundtripCard = ({ route, index }: { route: RoundtripRoute; index: number }) => {
    const isExpanded = expandedRoutes.has(index)
    const outboundFirst = route.outbound.segments[0]
    const outboundLast = route.outbound.segments[route.outbound.segments.length - 1]
    const returnFirst = route.return.segments[0]
    const returnLast = route.return.segments[route.return.segments.length - 1]

    return (
      <Card className="sm:border-l-4 sm:border-l-orange-500 hover:shadow-lg transition-shadow overflow-hidden">
        <CardContent className="p-0">
          <div
            className="cursor-pointer"
            onClick={() => toggleExpanded(index)}
          >
            {/* 移动端极简布局 */}
            <div className="sm:hidden">
              <div className="p-4 border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-gray-500">找到3个往返组合</div>
                  <Button variant="ghost" size="sm" className="h-6 px-2 -mr-2">
                    <span className="text-xs text-gray-500">{isExpanded ? "收起" : "详情"}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                  </Button>
                </div>
                
                {/* 去程 */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1.5 h-12 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">去程</span>
                        <span className="text-xs font-medium">{outboundFirst.origin_city}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="text-xs font-medium">{outboundLast.dest_city}</span>
                      </div>
                      <Badge variant={route.outbound.stops === 0 ? "default" : "secondary"} className="text-[10px] h-4 px-1.5">
                        {route.outbound.stops === 0 ? "直飞" : route.outbound.stops + "转"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600">{outboundFirst.dep_time.split(' ')[0]}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">{outboundFirst.dep_time.split(' ')[1]}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-blue-600">{route.outbound.arrive_time}</span>
                        </div>
                      </div>
                      <span className="text-xs text-orange-500 font-medium">{formatDuration(route.outbound.total_duration_mins).replace('小时', 'h').replace('分钟', 'm')}</span>
                    </div>
                  </div>
                </div>
                
                {/* 返程 */}
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-12 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">返程</span>
                        <span className="text-xs font-medium">{returnFirst.origin_city}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="text-xs font-medium">{returnLast.dest_city}</span>
                      </div>
                      <Badge variant={route.return.stops === 0 ? "default" : "secondary"} className="text-[10px] h-4 px-1.5">
                        {route.return.stops === 0 ? "直飞" : route.return.stops + "转"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600">{returnFirst.dep_time.split(' ')[0]}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">{returnFirst.dep_time.split(' ')[1]}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-green-600">{route.return.arrive_time}</span>
                        </div>
                      </div>
                      <span className="text-xs text-orange-500 font-medium">{formatDuration(route.return.total_duration_mins).replace('小时', 'h').replace('分钟', 'm')}</span>
                    </div>
                  </div>
                </div>
                
                {/* 底部汇总信息 */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <Badge variant="outline" className="text-[10px] h-5 bg-gray-50">
                    总飞行: {formatDuration(route.total_duration_mins).replace('小时', 'h').replace('分钟', 'm')}
                  </Badge>
                  {route.gap_hours !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] h-5",
                        route.gap_hours < 4 ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"
                      )}
                    >
                      停留: {route.gap_hours < 24 ? formatGapTime(route.gap_hours).replace('小时', 'h').replace('分钟', 'm') : `${Math.floor(route.gap_hours/24)}天${Math.floor(route.gap_hours%24)}h`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* PC端保持原样 */}
            <div className="hidden sm:block py-2 px-4">
              <div className="space-y-2">
                {/* 去程信息 */}
                <div className="border-l-2 border-l-blue-400 pl-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-xs px-1.5 py-0.5">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        去程
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{outboundFirst.origin_city}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-semibold">{outboundLast.dest_city}</span>
                      </div>
                      <Badge variant={route.outbound.stops === 0 ? "default" : "secondary"} className="text-xs">
                        {route.outbound.stops === 0 ? "直飞" : `${route.outbound.stops}次中转`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">{formatDuration(route.outbound.total_duration_mins)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                    <span>{outboundFirst.dep_time.split(' ')[0]}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{outboundFirst.dep_time.split(' ')[1]}</span>
                      <span>→</span>
                      <span className="font-medium text-blue-600">{route.outbound.arrive_time}</span>
                    </div>
                    {route.outbound.stops > 0 && (
                      <span className="text-gray-500">经{route.outbound.connect_cities?.join("、") || "中转"}</span>
                    )}
                  </div>
                </div>
                
                {/* 返程信息 */}
                <div className="border-l-2 border-l-green-400 pl-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-xs px-1.5 py-0.5">
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        返程
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{returnFirst.origin_city}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-semibold">{returnLast.dest_city}</span>
                      </div>
                      <Badge variant={route.return.stops === 0 ? "default" : "secondary"} className="text-xs">
                        {route.return.stops === 0 ? "直飞" : `${route.return.stops}次中转`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">{formatDuration(route.return.total_duration_mins)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                    <span>{returnFirst.dep_time.split(' ')[0]}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{returnFirst.dep_time.split(' ')[1]}</span>
                      <span>→</span>
                      <span className="font-medium text-green-600">{route.return.arrive_time}</span>
                    </div>
                    {route.return.stops > 0 && (
                      <span className="text-gray-500">经{route.return.connect_cities?.join("、") || "中转"}</span>
                    )}
                  </div>
                </div>

                {/* 汇总信息和展开按钮 */}
                <div className="flex items-center justify-between pt-1 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-gray-50">
                      总飞行: {formatDuration(route.total_duration_mins)}
                    </Badge>
                    {route.gap_hours !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          route.gap_hours < 0 ? "bg-red-50 text-red-700" :
                          route.gap_hours < 4 ? "bg-orange-50 text-orange-700" : 
                          "bg-green-50 text-green-700"
                        )}
                      >
                        停留: {formatGapTime(route.gap_hours)}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-3">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="ml-1">{isExpanded ? "收起" : "详情"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 展开的详细信息 */}
          {isExpanded && (
            <div className="sm:mt-3 sm:pt-3 sm:border-t sm:space-y-3 sm:px-4 sm:pb-2">
              {/* 移动端极简详情 */}
              <div className="sm:hidden bg-gray-50 px-4 py-3 space-y-3">
                {/* 去程详情 */}
                {route.outbound.segments.map((segment, segIdx) => (
                  <div key={`outbound-${segIdx}`} className="flex items-center gap-3">
                    <div className="w-1 h-full bg-blue-200 rounded-full"></div>
                    <div className="flex-1">
                      {segIdx === 0 && (
                        <div className="text-[10px] text-gray-500 mb-1 font-medium">去程航段</div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {segment.carrier_name} {segment.flight_no}
                          </Badge>
                          <span className="text-xs">
                            {segment.origin_city}
                            <span className="text-gray-400 mx-1">→</span>
                            {segment.dest_city}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {(() => {
                            const duration = (
                              new Date(segment.arr_time).getTime() - 
                              new Date(segment.dep_time).getTime()
                            ) / (1000 * 60)
                            const hours = Math.floor(duration / 60)
                            const mins = Math.floor(duration % 60)
                            return hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`
                          })()}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {segment.origin_airport} ({segment.origin_iata_code || 'N/A'}) → {segment.dest_airport} ({segment.dest_iata_code || 'N/A'})
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {segment.dep_time.split(' ')[1]} - {segment.arr_time.split(' ')[1]}
                      </div>
                      {segIdx < route.outbound.segments.length - 1 && (
                        <div className="text-[10px] text-orange-500 mt-1">
                          ↓ 中转{route.outbound.connect_cities?.[segIdx] || ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* 返程详情 */}
                {route.return.segments.map((segment, segIdx) => (
                  <div key={`return-${segIdx}`} className="flex items-center gap-3">
                    <div className="w-1 h-full bg-green-200 rounded-full"></div>
                    <div className="flex-1">
                      {segIdx === 0 && (
                        <div className="text-[10px] text-gray-500 mb-1 font-medium">返程航段</div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {segment.carrier_name} {segment.flight_no}
                          </Badge>
                          <span className="text-xs">
                            {segment.origin_city}
                            <span className="text-gray-400 mx-1">→</span>
                            {segment.dest_city}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {(() => {
                            const duration = (
                              new Date(segment.arr_time).getTime() - 
                              new Date(segment.dep_time).getTime()
                            ) / (1000 * 60)
                            const hours = Math.floor(duration / 60)
                            const mins = Math.floor(duration % 60)
                            return hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`
                          })()}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {segment.origin_airport} ({segment.origin_iata_code || 'N/A'}) → {segment.dest_airport} ({segment.dest_iata_code || 'N/A'})
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {segment.dep_time.split(' ')[1]} - {segment.arr_time.split(' ')[1]}
                      </div>
                      {segIdx < route.return.segments.length - 1 && (
                        <div className="text-[10px] text-orange-500 mt-1">
                          ↓ 中转{route.return.connect_cities?.[segIdx] || ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* PC端详情保持原样 */}
              <div className="hidden sm:block">
                {/* 去程详情 */}
                <div>
                  <h4 className="font-medium mb-1.5 flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                    去程航段详情
                  </h4>
                  <div className="space-y-1 pl-6">
                    {route.outbound.segments.map((segment, segIdx) => (
                      <div key={segIdx} className="text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {segment.carrier_name} {segment.flight_no}
                          </Badge>
                          <span>
                            {segment.origin_city} ({segment.origin_iata_code})
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span>
                            {segment.dest_city} ({segment.dest_iata_code})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {segment.dep_time} → {segment.arr_time}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {segment.origin_airport} → {segment.dest_airport}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 返程详情 */}
                <div>
                  <h4 className="font-medium mb-1.5 flex items-center gap-2 text-sm">
                    <ArrowLeft className="w-4 h-4 text-green-500" />
                    返程航段详情
                  </h4>
                  <div className="space-y-1 pl-6">
                    {route.return.segments.map((segment, segIdx) => (
                      <div key={segIdx} className="text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {segment.carrier_name} {segment.flight_no}
                          </Badge>
                          <span>
                            {segment.origin_city} ({segment.origin_iata_code})
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span>
                            {segment.dest_city} ({segment.dest_iata_code})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {segment.dep_time} → {segment.arr_time}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {segment.origin_airport} → {segment.dest_airport}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="sm:block hidden">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            找到 {roundtripRoutes.length} 个往返组合
          </span>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "combined" | "separate")}>
            <TabsList className="grid w-[200px] grid-cols-2 p-0.5 bg-gray-100">
              <TabsTrigger 
                value="combined" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                组合显示
              </TabsTrigger>
              <TabsTrigger 
                value="separate"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                分别显示
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      
      {/* 移动端极简标题 */}
      <div className="sm:hidden">
        <div className="p-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">找到 {roundtripRoutes.length} 个往返组合</span>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "combined" | "separate")}>
              <TabsList className="h-7 p-0.5 bg-gray-100">
                <TabsTrigger 
                  value="combined" 
                  className="text-xs h-6 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  组合
                </TabsTrigger>
                <TabsTrigger 
                  value="separate" 
                  className="text-xs h-6 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  分别
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      
      <CardContent className="sm:px-6 sm:pb-6 sm:pt-3 p-0">
        {viewMode === "combined" ? (
          // 组合显示模式 - 固定高度可滚动区域
          <div className="relative">
            {/* 移动端420px高度（约占屏幕60%），PC端500px高度 */}
            <div className="max-h-[420px] sm:max-h-[500px] overflow-y-auto space-y-0 sm:space-y-2 pr-1 sm:pr-2 
                        scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                        [&::-webkit-scrollbar]:w-1 sm:[&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-gray-100">
              {roundtripRoutes.map((route, index) => (
                <div key={index} className="sm:mb-0 border-b sm:border-b-0 last:border-b-0">
                  <RoundtripCard route={route} index={index} />
                </div>
              ))}
              {/* 底部padding，避免最后一个卡片被滚动提示遮挡 */}
              <div className="h-4 sm:h-6" />
            </div>
            {/* 滚动提示 - 超过2个就显示 */}
            {roundtripRoutes.length > 2 && (
              <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 
                          bg-gradient-to-t from-white via-white/90 to-transparent 
                          pointer-events-none flex items-end justify-center pb-1">
                <div className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 sm:hidden">
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                  <span>向下滑动查看更多</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 分别显示模式 - 并排布局
          <div className="space-y-2 sm:space-y-3">
            {/* 移动端选中航班汇总 - 更紧凑 */}
            {selectedOutbound && selectedReturn && (
              <Card className="sm:bg-gradient-to-r sm:from-blue-50 sm:to-green-50 border-2 border-blue-200">
                <CardContent className="sm:py-3 sm:px-4 p-3">
                  <div className="sm:hidden">
                    {/* 移动端紧凑布局 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">已选择往返</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedOutbound(null)
                          setSelectedReturn(null)
                          // 重置到去程Tab
                          setMobileActiveTab("outbound")
                        }}
                        className="text-xs h-6 px-2"
                      >
                        重选
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-4 px-1">去</Badge>
                          <span>{selectedOutbound.segments[0].origin_city} → {selectedOutbound.segments[selectedOutbound.segments.length - 1].dest_city}</span>
                          <span className="text-gray-500">{selectedOutbound.segments[0].dep_time.split(' ')[0]}</span>
                        </div>
                        <div className="text-gray-500 pl-8 text-[10px]">
                          {selectedOutbound.segments[0].origin_airport} → {selectedOutbound.segments[selectedOutbound.segments.length - 1].dest_airport}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-4 px-1">返</Badge>
                          <span>{selectedReturn.segments[0].origin_city} → {selectedReturn.segments[selectedReturn.segments.length - 1].dest_city}</span>
                          <span className="text-gray-500">{selectedReturn.segments[0].dep_time.split(' ')[0]}</span>
                        </div>
                        <div className="text-gray-500 pl-8 text-[10px]">
                          {selectedReturn.segments[0].origin_airport} → {selectedReturn.segments[selectedReturn.segments.length - 1].dest_airport}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* PC端保持原样 */}
                  <div className="hidden sm:block">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        已选择的往返组合
                      </h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOutbound(null)
                            setSelectedReturn(null)
                          }}
                          className="text-xs"
                        >
                          重新选择
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 去程汇总 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50">
                            <ArrowRight className="w-3 h-3 mr-1" />
                            去程
                          </Badge>
                          <span className="text-sm font-medium">
                            {selectedOutbound.segments[0].origin_city} → {selectedOutbound.segments[selectedOutbound.segments.length - 1].dest_city}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>日期：{selectedOutbound.segments[0].dep_time.split(' ')[0]}</div>
                          <div>时间：{selectedOutbound.segments[0].dep_time.split(' ')[1]} - {selectedOutbound.arrive_time}</div>
                          <div>航班：{selectedOutbound.segments.map(s => s.flight_no).join(' / ')}</div>
                          <div>机场：{selectedOutbound.segments[0].origin_airport} → {selectedOutbound.segments[selectedOutbound.segments.length - 1].dest_airport}</div>
                          <div>时长：{formatDuration(selectedOutbound.total_duration_mins)}</div>
                        </div>
                      </div>
                      
                      {/* 返程汇总 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50">
                            <ArrowLeft className="w-3 h-3 mr-1" />
                            返程
                          </Badge>
                          <span className="text-sm font-medium">
                            {selectedReturn.segments[0].origin_city} → {selectedReturn.segments[selectedReturn.segments.length - 1].dest_city}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>日期：{selectedReturn.segments[0].dep_time.split(' ')[0]}</div>
                          <div>时间：{selectedReturn.segments[0].dep_time.split(' ')[1]} - {selectedReturn.arrive_time}</div>
                          <div>航班：{selectedReturn.segments.map(s => s.flight_no).join(' / ')}</div>
                          <div>机场：{selectedReturn.segments[0].origin_airport} → {selectedReturn.segments[selectedReturn.segments.length - 1].dest_airport}</div>
                          <div>时长：{formatDuration(selectedReturn.total_duration_mins)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 总体信息 */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            总飞行时长：{formatDuration(selectedOutbound.total_duration_mins + selectedReturn.total_duration_mins)}
                          </Badge>
                          {(() => {
                            const outboundArrival = new Date(selectedOutbound.segments[selectedOutbound.segments.length - 1].arr_time)
                            const returnDeparture = new Date(selectedReturn.segments[0].dep_time)
                            const gapHours = (returnDeparture.getTime() - outboundArrival.getTime()) / (1000 * 60 * 60)
                            return (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  gapHours < 4 ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"
                                )}
                              >
                                停留时间：{formatGapTime(gapHours)}
                              </Badge>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 移动端使用Tab切换，PC端保持并排 */}
            <div className="sm:hidden">
              {/* 移动端Tab切换 */}
              <Tabs value={mobileActiveTab} onValueChange={(v) => setMobileActiveTab(v as "outbound" | "return")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sticky top-0 z-20 bg-white">
                  <TabsTrigger value="outbound" className="text-sm">
                    <div className="flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      去程航班
                      {selectedOutbound && <CheckCircle2 className="w-3 h-3 ml-1 text-blue-600" />}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="return" className="text-sm">
                    <div className="flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" />
                      返程航班
                      {selectedReturn && <CheckCircle2 className="w-3 h-3 ml-1 text-green-600" />}
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="outbound" className="mt-2">
                  {/* 去程航班列表 - 添加滚动容器 */}
                  <div className="relative">
                    <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1
                                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                                [&::-webkit-scrollbar]:w-1
                                [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full
                                [&::-webkit-scrollbar-track]:bg-gray-100">
                      {Array.from(new Map(roundtripRoutes.map(route => 
                        [JSON.stringify(route.outbound), route.outbound]
                      )).values()).map((outbound, index) => {
                      const firstSegment = outbound.segments[0]
                      const lastSegment = outbound.segments[outbound.segments.length - 1]
                      const isSelected = selectedOutbound && JSON.stringify(selectedOutbound) === JSON.stringify(outbound)
                      
                      return (
                        <Card 
                          key={index} 
                          className={cn(
                            "border-l-2 cursor-pointer",
                            isSelected 
                              ? "border-l-blue-600 bg-blue-50 ring-1 ring-blue-200" 
                              : "border-l-blue-400"
                          )}
                          onClick={() => {
                            setSelectedOutbound(outbound)
                            // 自动切换到返程Tab
                            setMobileActiveTab("return")
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{firstSegment.origin_city}</span>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                <span className="font-medium">{lastSegment.dest_city}</span>
                                <Badge variant={outbound.stops === 0 ? "default" : "secondary"} className="text-[10px] h-4 px-1">
                                  {outbound.stops === 0 ? "直飞" : `${outbound.stops}转`}
                                </Badge>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">{firstSegment.dep_time.split(' ')[0]}</span>
                                <span>{firstSegment.dep_time.split(' ')[1]}</span>
                                <span className="text-gray-400">→</span>
                                <span>{outbound.arrive_time}</span>
                              </div>
                              <span className="text-xs text-orange-500 font-medium">
                                {formatDuration(outbound.total_duration_mins).replace('小时', 'h').replace('分钟', 'm')}
                              </span>
                            </div>
                            {/* 航段详情 */}
                            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                              {outbound.segments.map((segment, segIdx) => (
                                <div key={segIdx} className="flex items-center gap-2 text-xs text-gray-500">
                                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                                    {segment.flight_no}
                                  </Badge>
                                  <span>{segment.origin_city} → {segment.dest_city}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                      {/* 底部padding */}
                      <div className="h-4" />
                    </div>
                    {/* 滚动提示 */}
                    {Array.from(new Map(roundtripRoutes.map(route => 
                      [JSON.stringify(route.outbound), route.outbound]
                    )).values()).length > 2 && (
                      <div className="absolute bottom-0 left-0 right-0 h-10 
                                  bg-gradient-to-t from-white via-white/90 to-transparent 
                                  pointer-events-none flex items-end justify-center pb-1">
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <ChevronDown className="w-3 h-3 animate-bounce" />
                          <span>向下滑动查看更多</span>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="return" className="mt-2">
                  {/* 返程航班列表 - 添加滚动容器 */}
                  {!selectedOutbound ? (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">请先选择去程航班</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="relative">
                      <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1
                                  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                                  [&::-webkit-scrollbar]:w-1
                                  [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full
                                  [&::-webkit-scrollbar-track]:bg-gray-100">
                      {(() => {
                        const uniqueReturns = Array.from(new Map(roundtripRoutes.map(route => 
                          [JSON.stringify(route.return), route.return]
                        )).values())
                        
                        const filteredReturns = uniqueReturns.filter(returnFlight => {
                          const outboundArrival = new Date(selectedOutbound.segments[selectedOutbound.segments.length - 1].arr_time)
                          const returnDeparture = new Date(returnFlight.segments[0].dep_time)
                          const gapHours = (returnDeparture.getTime() - outboundArrival.getTime()) / (1000 * 60 * 60)
                          return gapHours >= 2
                        })
                        
                        if (filteredReturns.length === 0) {
                          return (
                            <Card className="border-dashed">
                              <CardContent className="py-8 text-center">
                                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">没有符合条件的返程航班</p>
                                <p className="text-xs text-gray-500 mt-1">需要至少2小时转机时间</p>
                              </CardContent>
                            </Card>
                          )
                        }
                        
                        return filteredReturns.map((returnFlight, index) => {
                          const firstSegment = returnFlight.segments[0]
                          const lastSegment = returnFlight.segments[returnFlight.segments.length - 1]
                          const isSelected = selectedReturn && JSON.stringify(selectedReturn) === JSON.stringify(returnFlight)
                          
                          const outboundArrival = new Date(selectedOutbound.segments[selectedOutbound.segments.length - 1].arr_time)
                          const returnDeparture = new Date(firstSegment.dep_time)
                          const gapHours = (returnDeparture.getTime() - outboundArrival.getTime()) / (1000 * 60 * 60)
                          
                          return (
                            <Card 
                              key={index} 
                              className={cn(
                                "border-l-2 cursor-pointer",
                                isSelected 
                                  ? "border-l-green-600 bg-green-50 ring-1 ring-green-200" 
                                  : "border-l-green-400"
                              )}
                              onClick={() => setSelectedReturn(returnFlight)}
                            >
                              <CardContent className="p-3">
                                <div className="mb-1">
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-[10px] h-4",
                                      gapHours < 4 ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"
                                    )}
                                  >
                                    距去程到达: {formatGapTime(gapHours).replace('小时', 'h').replace('分钟', 'm')}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{firstSegment.origin_city}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span className="font-medium">{lastSegment.dest_city}</span>
                                    <Badge variant={returnFlight.stops === 0 ? "default" : "secondary"} className="text-[10px] h-4 px-1">
                                      {returnFlight.stops === 0 ? "直飞" : `${returnFlight.stops}转`}
                                    </Badge>
                                  </div>
                                  {isSelected && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">{firstSegment.dep_time.split(' ')[0]}</span>
                                    <span>{firstSegment.dep_time.split(' ')[1]}</span>
                                    <span className="text-gray-400">→</span>
                                    <span>{returnFlight.arrive_time}</span>
                                  </div>
                                  <span className="text-xs text-orange-500 font-medium">
                                    {formatDuration(returnFlight.total_duration_mins).replace('小时', 'h').replace('分钟', 'm')}
                                  </span>
                                </div>
                                {/* 航段详情 */}
                                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                                  {returnFlight.segments.map((segment, segIdx) => (
                                    <div key={segIdx} className="flex items-center gap-2 text-xs text-gray-500">
                                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                                        {segment.flight_no}
                                      </Badge>
                                      <span>{segment.origin_city} → {segment.dest_city}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
                      })()}
                    </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* PC端简洁高效的设计 */}
            <div className="hidden sm:block">
              {/* 快速选择区 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-gray-800">快速选择往返航班</h3>
                  {(selectedOutbound || selectedReturn) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedOutbound(null)
                        setSelectedReturn(null)
                        // 重置到去程Tab
                        setPcActiveTab("outbound")
                      }}
                      className="text-xs"
                    >
                      清除所有
                    </Button>
                  )}
                </div>
                
                {/* 选择步骤指示器 - 精致的层次设计 */}
                <div className="relative mb-4">
                  {/* 背景连接线 */}
                  <div className="absolute top-1/2 left-[200px] right-[200px] h-[2px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 -translate-y-1/2" />
                  
                  {/* 步骤容器 */}
                  <div className="relative flex items-center justify-center gap-8 bg-white">
                    {/* 步骤1 - 选择去程 */}
                    <div className={cn(
                      "relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 bg-white",
                      selectedOutbound 
                        ? "border-orange-400 shadow-md shadow-orange-100" 
                        : "border-gray-200"
                    )}>
                      <div className="relative">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                          selectedOutbound 
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md" 
                            : "bg-gray-100 text-gray-400 border border-gray-300"
                        )}>
                          1
                        </div>
                        {selectedOutbound && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[11px] font-medium uppercase tracking-wider transition-colors",
                          selectedOutbound ? "text-orange-600" : "text-gray-400"
                        )}>
                          STEP 1
                        </span>
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          selectedOutbound ? "text-gray-800" : "text-gray-500"
                        )}>
                          选择去程
                        </span>
                      </div>
                      {selectedOutbound && (
                        <CheckCircle2 className="w-5 h-5 text-orange-500 ml-1" />
                      )}
                    </div>

                    {/* 中间箭头 */}
                    <div className="z-10">
                      <div className={cn(
                        "bg-white px-3 py-1.5 rounded-full border-2 transition-all duration-300",
                        selectedOutbound && !selectedReturn 
                          ? "border-amber-300 shadow-md" 
                          : selectedOutbound && selectedReturn 
                          ? "border-emerald-300" 
                          : "border-gray-200"
                      )}>
                        <ArrowRight className={cn(
                          "w-4 h-4 transition-colors",
                          selectedOutbound && !selectedReturn 
                            ? "text-amber-500 animate-pulse" 
                            : selectedOutbound && selectedReturn 
                            ? "text-emerald-500" 
                            : "text-gray-400"
                        )} />
                      </div>
                    </div>

                    {/* 步骤2 - 选择返程 */}
                    <div className={cn(
                      "relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 bg-white",
                      selectedReturn 
                        ? "border-emerald-400 shadow-md shadow-emerald-100" 
                        : selectedOutbound 
                        ? "border-gray-300" 
                        : "border-gray-200"
                    )}>
                      <div className="relative">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                          selectedReturn 
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md" 
                            : selectedOutbound
                            ? "bg-gray-100 text-gray-500 border border-gray-300"
                            : "bg-gray-50 text-gray-400 border border-gray-200"
                        )}>
                          2
                        </div>
                        {selectedReturn && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[11px] font-medium uppercase tracking-wider transition-colors",
                          selectedReturn ? "text-emerald-600" : "text-gray-400"
                        )}>
                          STEP 2
                        </span>
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          selectedReturn ? "text-gray-800" : "text-gray-500"
                        )}>
                          选择返程
                        </span>
                      </div>
                      {selectedReturn && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 统一的航班选择区 */}
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <Tabs value={pcActiveTab} onValueChange={(v) => setPcActiveTab(v as "outbound" | "return")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 p-0.5 bg-gray-100">
                    <TabsTrigger value="outbound" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      去程航班 ({Array.from(new Map(roundtripRoutes.map(route => 
                        [JSON.stringify(route.outbound), route.outbound]
                      )).values()).length})
                    </TabsTrigger>
                    <TabsTrigger value="return" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      返程航班 ({Array.from(new Map(roundtripRoutes.map(route => 
                        [JSON.stringify(route.return), route.return]
                      )).values()).length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="outbound" className="mt-0">
                    <div className="max-h-[600px] overflow-y-auto space-y-2">
                      {Array.from(new Map(roundtripRoutes.map(route => 
                        [JSON.stringify(route.outbound), route.outbound]
                      )).values()).map((outbound, index) => {
                        const firstSegment = outbound.segments[0]
                        const lastSegment = outbound.segments[outbound.segments.length - 1]
                        const isSelected = selectedOutbound && JSON.stringify(selectedOutbound) === JSON.stringify(outbound)
                        
                        return (
                          <div
                            key={index}
                            className={cn(
                              "group relative bg-white rounded-lg cursor-pointer transition-all border",
                              isSelected 
                                ? "border-blue-400 bg-gradient-to-r from-blue-50/50 via-white to-blue-50/30 shadow-sm" 
                                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            )}
                            onClick={() => {
                              setSelectedOutbound(outbound)
                              // 自动切换到返程Tab
                              setPcActiveTab("return")
                            }}
                          >
                            {isSelected && (
                              <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-tr-lg">
                                <div className="absolute -top-6 -right-6 w-12 h-12 bg-blue-500 transform rotate-45"></div>
                                <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className="p-2">
                              <div className="flex items-center justify-between">
                                {/* 左侧信息 */}
                                <div className="flex items-center gap-4 flex-1">
                                  {/* 城市路线 - 更紧凑的设计 */}
                                  <div className="flex items-center gap-2">
                                    <div className="text-center min-w-[50px]">
                                      <div className="text-sm font-semibold text-gray-800">{firstSegment.origin_city}</div>
                                      <div className="text-[10px] text-gray-500">{firstSegment.origin_iata_code || firstSegment.origin_airport.substring(0,3)}</div>
                                      <div className="text-xs text-gray-600 font-medium">{firstSegment.dep_time.split(' ')[1]}</div>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <div className="relative flex items-center">
                                        <div className="h-[1px] w-6 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                                        <div className="relative px-1">
                                          <Plane className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                          {outbound.stops > 0 && (
                                            <Badge variant="outline" className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] h-3 px-1 whitespace-nowrap">
                                              {outbound.stops}转
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="h-[1px] w-6 bg-gradient-to-r from-gray-300 to-gray-200"></div>
                                      </div>
                                    </div>
                                    <div className="text-center min-w-[50px]">
                                      <div className="text-sm font-semibold text-gray-800">{lastSegment.dest_city}</div>
                                      <div className="text-[10px] text-gray-500">{lastSegment.dest_iata_code || lastSegment.dest_airport.substring(0,3)}</div>
                                      <div className="text-xs font-medium">
                                        <span className={cn(
                                          isSelected ? "text-blue-600" : "text-gray-600"
                                        )}>{outbound.arrive_time}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* 分隔线 */}
                                  <div className="h-8 w-px bg-gray-200"></div>
                                  
                                  {/* 航班详情 - 更紧凑的布局 */}
                                  <div className="flex-1 grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                      <div className="text-[9px] text-gray-400 uppercase tracking-wider">日期</div>
                                      <div className="text-xs font-medium text-gray-700">{firstSegment.dep_time.split(' ')[0]}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-[9px] text-gray-400 uppercase tracking-wider">时长</div>
                                      <div className="text-xs font-semibold text-orange-600">{formatDuration(outbound.total_duration_mins)}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-[9px] text-gray-400 uppercase tracking-wider">航班</div>
                                      <div className="text-xs font-medium text-gray-700 leading-tight">
                                        {outbound.segments.length === 1 
                                          ? outbound.segments[0].flight_no
                                          : `${outbound.segments.length}段`
                                        }
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="return" className="mt-0">
                    {!selectedOutbound ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>请先选择去程航班</p>
                      </div>
                    ) : (
                      <div className="relative">
                      <div className="max-h-[600px] overflow-y-auto space-y-2">
                        {(() => {
                          const uniqueReturns = Array.from(new Map(roundtripRoutes.map(route => 
                            [JSON.stringify(route.return), route.return]
                          )).values())
                          
                          const filteredReturns = uniqueReturns.filter(returnFlight => {
                            const outboundArrival = new Date(selectedOutbound.segments[selectedOutbound.segments.length - 1].arr_time)
                            const returnDeparture = new Date(returnFlight.segments[0].dep_time)
                            const gapHours = (returnDeparture.getTime() - outboundArrival.getTime()) / (1000 * 60 * 60)
                            return gapHours >= 2
                          })
                          
                          if (filteredReturns.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p>没有符合条件的返程航班</p>
                                <p className="text-sm mt-1">需要至少2小时转机时间</p>
                              </div>
                            )
                          }
                          
                          return filteredReturns.map((returnFlight, index) => {
                            const firstSegment = returnFlight.segments[0]
                            const lastSegment = returnFlight.segments[returnFlight.segments.length - 1]
                            const isSelected = selectedReturn && JSON.stringify(selectedReturn) === JSON.stringify(returnFlight)
                            
                            const outboundArrival = new Date(selectedOutbound.segments[selectedOutbound.segments.length - 1].arr_time)
                            const returnDeparture = new Date(firstSegment.dep_time)
                            const gapHours = (returnDeparture.getTime() - outboundArrival.getTime()) / (1000 * 60 * 60)
                            
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "group relative bg-white rounded-lg cursor-pointer transition-all border",
                                  isSelected 
                                    ? "border-green-400 bg-gradient-to-r from-green-50/50 via-white to-green-50/30 shadow-sm" 
                                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                )}
                                onClick={() => setSelectedReturn(returnFlight)}
                              >
                                {isSelected && (
                                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-tr-lg">
                                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-green-500 transform rotate-45"></div>
                                    <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className="p-2">
                                  {/* 停留时间提示条 - 更紧凑的设计 */}
                                  <div className="mb-1">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-[10px] px-1.5 py-0.5",
                                        gapHours < 4 
                                          ? "bg-orange-50 border-orange-200 text-orange-700" 
                                          : "bg-green-50 border-green-200 text-green-700"
                                      )}
                                    >
                                      <Clock className="w-2.5 h-2.5 mr-1" />
                                      停留 {formatGapTime(gapHours)}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    {/* 左侧信息 */}
                                    <div className="flex items-center gap-4 flex-1">
                                      {/* 城市路线 - 更紧凑的设计 */}
                                      <div className="flex items-center gap-2">
                                        <div className="text-center min-w-[50px]">
                                          <div className="text-sm font-semibold text-gray-800">{firstSegment.origin_city}</div>
                                          <div className="text-[10px] text-gray-500">{firstSegment.origin_iata_code || firstSegment.origin_airport.substring(0,3)}</div>
                                          <div className="text-xs text-gray-600 font-medium">{firstSegment.dep_time.split(' ')[1]}</div>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center px-1">
                                          <div className="relative flex items-center">
                                            <div className="h-[1px] w-6 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                                            <div className="relative px-1">
                                              <Plane className="w-3 h-3 text-gray-400 group-hover:text-green-500 transition-colors" />
                                              {returnFlight.stops > 0 && (
                                                <Badge variant="outline" className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] h-3 px-1 whitespace-nowrap">
                                                  {returnFlight.stops}转
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="h-[1px] w-6 bg-gradient-to-r from-gray-300 to-gray-200"></div>
                                          </div>
                                        </div>
                                        <div className="text-center min-w-[50px]">
                                          <div className="text-sm font-semibold text-gray-800">{lastSegment.dest_city}</div>
                                          <div className="text-[10px] text-gray-500">{lastSegment.dest_iata_code || lastSegment.dest_airport.substring(0,3)}</div>
                                          <div className="text-xs font-medium">
                                            <span className={cn(
                                              isSelected ? "text-green-600" : "text-gray-600"
                                            )}>{returnFlight.arrive_time}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* 分隔线 */}
                                      <div className="h-8 w-px bg-gray-200"></div>
                                      
                                      {/* 航班详情 - 更紧凑的布局 */}
                                      <div className="flex-1 grid grid-cols-3 gap-2">
                                        <div className="text-center">
                                          <div className="text-[9px] text-gray-400 uppercase tracking-wider">日期</div>
                                          <div className="text-xs font-medium text-gray-700">{firstSegment.dep_time.split(' ')[0]}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-[9px] text-gray-400 uppercase tracking-wider">时长</div>
                                          <div className="text-xs font-semibold text-orange-600">{formatDuration(returnFlight.total_duration_mins)}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-[9px] text-gray-400 uppercase tracking-wider">航班</div>
                                          <div className="text-xs font-medium text-gray-700 leading-tight">
                                            {returnFlight.segments.length === 1 
                                              ? returnFlight.segments[0].flight_no
                                              : `${returnFlight.segments.length}段`
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        })()}
                        {/* 底部padding */}
                        <div className="h-4" />
                      </div>
                      {/* 滚动提示 */}
                      {(() => {
                        const uniqueReturns = Array.from(new Map(roundtripRoutes.map(route => 
                          [JSON.stringify(route.return), route.return]
                        )).values())
                        const filteredReturns = uniqueReturns.filter(returnFlight => {
                          const outboundArrival = new Date(selectedOutbound.segments[selectedOutbound.segments.length - 1].arr_time)
                          const returnDeparture = new Date(returnFlight.segments[0].dep_time)
                          const gapHours = (returnDeparture.getTime() - outboundArrival.getTime()) / (1000 * 60 * 60)
                          return gapHours >= 2
                        })
                        return filteredReturns.length > 2
                      })() && (
                        <div className="absolute bottom-0 left-0 right-0 h-10 
                                    bg-gradient-to-t from-white via-white/90 to-transparent 
                                    pointer-events-none flex items-end justify-center pb-1">
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <ChevronDown className="w-3 h-3 animate-bounce" />
                            <span>向下滑动查看更多</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}