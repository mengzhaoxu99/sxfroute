"use client"

import { useState } from "react"
import { Calendar, Clock, Plane, Search, ArrowLeftRight, ChevronDown, ChevronUp, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CitySelector } from "./city-selector"
import { FlightStats } from "./flight-stats"
import { SearchResults } from "./search-results"
import { Disclaimer } from "./disclaimer"
import { Route, RoundtripRoute } from "@/lib/flight/types"

interface SearchParams {
  origin_city: string
  dest_city: string
  date: string
  windows: string[]
  max_stops: number
  version: "666" | "2666"
  trip_type: "oneway" | "roundtrip"  // 新增：行程类型
  return_date?: string               // 新增：返程日期
  return_windows?: string[]          // 新增：返程时间窗口
}

// 获取最早可用日期（不早于2025-09-01）
function getMinDate() {
  const flightStartDate = new Date('2025-09-01');
  const today = new Date();
  
  // 如果今天早于2025-09-01，返回2025-09-01
  if (today < flightStartDate) {
    return flightStartDate.toISOString().split("T")[0];
  }
  
  // 否则返回今天的日期
  return today.toISOString().split("T")[0];
}

export function FlightSearch() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin_city: "",
    dest_city: "",
    date: getMinDate(),
    windows: ["early", "late"],
    max_stops: 1,
    version: "666",
    trip_type: "oneway",
    return_date: "",
    return_windows: ["early", "late"],
  })
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState<Route[]>([])
  const [roundtripRoutes, setRoundtripRoutes] = useState<RoundtripRoute[]>([])
  const [searched, setSearched] = useState(false)
  const [restriction, setRestriction] = useState<string | undefined>(undefined)
  const [searchTripType, setSearchTripType] = useState<'oneway' | 'roundtrip'>('oneway')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const toggleWindowField = (field: 'windows' | 'return_windows', value: string) => {
    setSearchParams((prev) => {
      const current = field === 'windows' ? prev.windows : (prev.return_windows || [])
      const updated = current.includes(value)
        ? current.filter((w) => w !== value)
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  const toggleWindow = (window: string) => toggleWindowField('windows', window)

  const handleSearch = async () => {
    if (!searchParams.origin_city || !searchParams.dest_city || !searchParams.date) {
      return
    }
    
    // 往返模式需要返程日期
    if (searchParams.trip_type === 'roundtrip' && !searchParams.return_date) {
      alert('请选择返程日期')
      return
    }
    
    setLoading(true)
    setSearched(true)
    setSearchTripType(searchParams.trip_type)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      })

      if (!response.ok) {
        throw new Error('搜索失败')
      }

      const data = await response.json()
      
      // 根据响应类型设置数据
      if (data.meta?.trip_type === 'roundtrip') {
        setRoundtripRoutes(data.roundtrip_routes || [])
        setRoutes([])
      } else {
        setRoutes(data.routes || [])
        setRoundtripRoutes([])
      }
      
      setRestriction(data.meta?.restriction)
    } catch (error) {
      console.error('搜索出错:', error)
      setRoutes([])
      setRoundtripRoutes([])
      setRestriction(undefined)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapCities = () => {
    setSearchParams((prev) => ({
      ...prev,
      origin_city: prev.dest_city,
      dest_city: prev.origin_city
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* 搜索表单 */}
      <div className="lg:col-span-1">
        <Card className="shadow-md border-sky-100 bg-gradient-to-br from-white to-sky-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              航班搜索
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-6">
            {/* 行程类型选择 */}
            <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg">
              <Button
                type="button"
                variant="ghost"
                className={`flex-1 h-9 text-sm flex items-center justify-center transition-all duration-200 ${
                  searchParams.trip_type === "oneway" 
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:from-orange-600 hover:to-amber-600 font-medium" 
                    : "bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setSearchParams(prev => ({ 
                  ...prev, 
                  trip_type: "oneway",
                  max_stops: 1  // 单程默认恢复为最多1次中转
                }))}
              >
                <Plane className={`w-4 h-4 mr-1.5 flex-shrink-0 transition-transform duration-200 ${
                  searchParams.trip_type === "oneway" ? "scale-110" : ""
                }`} />
                <span>单程</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={`flex-1 h-9 text-sm flex items-center justify-center transition-all duration-200 ${
                  searchParams.trip_type === "roundtrip" 
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:from-orange-600 hover:to-amber-600 font-medium" 
                    : "bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setSearchParams(prev => ({ 
                  ...prev, 
                  trip_type: "roundtrip",
                  return_date: prev.return_date || prev.date,
                  max_stops: 0  // 往返默认设置为直飞
                }))}
              >
                <ArrowLeftRight className={`w-4 h-4 mr-1.5 flex-shrink-0 transition-transform duration-200 ${
                  searchParams.trip_type === "roundtrip" ? "scale-110" : ""
                }`} />
                <span>往返</span>
              </Button>
            </div>
            {/* 移动端水平布局 */}
            <div className="block sm:hidden">
              <Label className="text-xs mb-2 block">选择城市</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <CitySelector
                    value={searchParams.origin_city}
                    onChange={(value) => setSearchParams((prev) => ({ ...prev, origin_city: value }))}
                    placeholder="出发城市"
                  />
                </div>
                
                <Button
                  type="button"
                  onClick={handleSwapCities}
                  disabled={!searchParams.origin_city || !searchParams.dest_city}
                  className="p-1.5 h-8 w-8 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-all"
                  variant="ghost"
                >
                  <ArrowLeftRight className="h-4 w-4 text-sky-500" />
                </Button>

                <div className="flex-1">
                  <CitySelector
                    value={searchParams.dest_city}
                    onChange={(value) => setSearchParams((prev) => ({ ...prev, dest_city: value }))}
                    placeholder="到达城市"
                  />
                </div>
              </div>
            </div>

            {/* 桌面端水平布局 */}
            <div className="hidden sm:block">
              <Label className="text-xs sm:text-sm mb-2 block">选择城市</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <CitySelector
                    value={searchParams.origin_city}
                    onChange={(value) => setSearchParams((prev) => ({ ...prev, origin_city: value }))}
                    placeholder="出发城市"
                  />
                </div>
                
                <Button
                  type="button"
                  onClick={handleSwapCities}
                  disabled={!searchParams.origin_city || !searchParams.dest_city}
                  className="p-2 h-10 w-10 rounded-full bg-white border border-gray-200 hover:border-sky-400 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200 group flex-shrink-0"
                >
                  <ArrowLeftRight className="h-5 w-5 text-gray-500 group-hover:text-sky-600 transition-colors duration-200" />
                </Button>

                <div className="flex-1">
                  <CitySelector
                    value={searchParams.dest_city}
                    onChange={(value) => setSearchParams((prev) => ({ ...prev, dest_city: value }))}
                    placeholder="到达城市"
                  />
                </div>
              </div>
            </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="date" className="text-xs sm:text-sm">
                  {searchParams.trip_type === "roundtrip" ? "去程日期" : "出发日期"}
                </Label>
              <div className="relative w-full max-w-full overflow-hidden rounded-lg border border-transparent">
                <Calendar className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="date"
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams((prev) => ({ 
                    ...prev, 
                    date: e.target.value,
                    // 如果返程日期早于去程日期，自动更新返程日期
                    return_date: prev.return_date && prev.return_date < e.target.value 
                      ? e.target.value 
                      : prev.return_date
                  }))}
                  className="w-full max-w-full min-w-0 pl-10 text-sm h-9 sm:h-10 cursor-pointer text-left appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  min={getMinDate()}
                />
              </div>
            </div>

            {/* 返程日期选择器 - 仅在往返模式下显示 */}
            {searchParams.trip_type === "roundtrip" && (
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="return_date" className="text-xs sm:text-sm">返程日期</Label>
                <div className="relative w-full max-w-full overflow-hidden rounded-lg border border-transparent">
                  <Calendar className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="return_date"
                    type="date"
                    value={searchParams.return_date}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, return_date: e.target.value }))}
                    className="w-full max-w-full min-w-0 pl-10 text-sm h-9 sm:h-10 cursor-pointer text-left appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    min={searchParams.date || getMinDate()}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">会员版本</Label>
              <Select
                value={searchParams.version}
                onValueChange={(value: "666" | "2666") =>
                  setSearchParams((prev) => ({ ...prev, version: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="666">666版本 (20:00-08:00)</SelectItem>
                  <SelectItem value="2666">2666版本 (19:00-09:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 最大中转次数 - 移到外面 */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">最大中转次数</Label>
              <Select
                value={searchParams.max_stops.toString()}
                onValueChange={(value) =>
                  setSearchParams((prev) => ({ ...prev, max_stops: Number.parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">直飞</SelectItem>
                  <SelectItem value="1">最多1次中转</SelectItem>
                  <SelectItem value="2">最多2次中转</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 高级选项折叠区域 */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-xs sm:text-sm font-normal hover:bg-gray-50"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>高级选项</span>
                  {/* 显示当前选中的选项数量 */}
                  {(searchParams.windows.length < 2 || 
                    (searchParams.trip_type === "roundtrip" && searchParams.return_windows && searchParams.return_windows.length < 2)) && (
                    <Badge variant="secondary" className="text-xs">
                      已筛选
                    </Badge>
                  )}
                </span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              
              {showAdvanced && (
                <div className="space-y-3 pl-4 ml-2 border-l-2 border-gray-200 animate-in slide-in-from-top-2 duration-200">
                  {/* 去程时间窗口 */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">
                      {searchParams.trip_type === "roundtrip" ? "去程时间窗口" : "时间窗口"}
                    </Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="early"
                          checked={searchParams.windows.includes("early")}
                          onChange={() => toggleWindow("early")}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="early" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sm:hidden">凌晨</span>
                          <span className="hidden sm:inline">
                            凌晨窗 ({searchParams.version === "666" ? "00:00-08:00" : "00:00-09:00"})
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="late"
                          checked={searchParams.windows.includes("late")}
                          onChange={() => toggleWindow("late")}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="late" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sm:hidden">夜晚</span>
                          <span className="hidden sm:inline">
                            夜晚窗 ({searchParams.version === "666" ? "20:00-23:59" : "19:00-23:59"})
                          </span>
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* 返程时间窗口 - 仅在往返模式下显示 */}
                  {searchParams.trip_type === "roundtrip" && (
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm">返程时间窗口</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="return_early"
                            checked={searchParams.return_windows?.includes("early")}
                            onChange={() => toggleWindowField('return_windows', 'early')}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="return_early" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="sm:hidden">凌晨</span>
                            <span className="hidden sm:inline">
                              凌晨窗 ({searchParams.version === "666" ? "00:00-08:00" : "00:00-09:00"})
                            </span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="return_late"
                            checked={searchParams.return_windows?.includes("late")}
                            onChange={() => toggleWindowField('return_windows', 'late')}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="return_late" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="sm:hidden">夜晚</span>
                            <span className="hidden sm:inline">
                              夜晚窗 ({searchParams.version === "666" ? "20:00-23:59" : "19:00-23:59"})
                            </span>
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all"
              type="submit"
              disabled={loading || !searchParams.origin_city || !searchParams.dest_city || !searchParams.date}
            >
              {loading ? "搜索中..." : "搜索航班"}
            </Button>
          </CardContent>
        </Card>
        
        {/* 移动端如何使用 - 只在移动端未搜索时显示 */}
        {!searched && (
          <Card className="shadow-md mt-4 block sm:hidden bg-gradient-to-br from-sky-50/30 to-blue-50/20 border-sky-100">
            <CardContent className="p-4">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                快速上手指南
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                    1
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-gray-800">选择出发和到达城市</p>
                    <p className="text-xs text-gray-500 mt-0.5">支持全国主要城市</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-400 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                    2
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-gray-800">选择日期和时间窗口</p>
                    <p className="text-xs text-gray-500 mt-0.5">凌晨窗或夜晚窗</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                    3
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-gray-800">点击搜索查看结果</p>
                    <p className="text-xs text-gray-500 mt-0.5">智能规划最优航线</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>

      {/* 搜索结果或欢迎界面 */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {!searched && <FlightStats />}
          <SearchResults 
            routes={routes} 
            loading={loading} 
            searched={searched}
            restriction={restriction}
            roundtripRoutes={roundtripRoutes}
            tripType={searchTripType}
          />
          {/* PC端免责声明保持原位置 */}
          {!searched && <div className="hidden sm:block"><Disclaimer /></div>}
        </div>
      </div>
    </div>
  )
}
