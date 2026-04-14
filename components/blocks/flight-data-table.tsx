"use client"

import { useState, useMemo, useEffect } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { ChevronUp, ChevronDown, ChevronsUpDown, ArrowLeftRight, Map, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AirportSelector } from "@/components/blocks/airport-selector"
import { FlightDaysDisplay } from "@/components/blocks/flight-days-display"
import { FlightData } from "@/types/flight"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { useRuntimeConfig } from "@/providers/runtime-config"

const SimpleFlightMap = dynamic(
  () => import("@/components/blocks/simple-flight-map-amap").then(mod => mod.SimpleFlightMap),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg" />
  }
)

const columnHelper = createColumnHelper<FlightData>()

export function FlightDataTable() {
  const [data, setData] = useState<FlightData[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [originFilter, setOriginFilter] = useState<string>("all")
  const [destFilter, setDestFilter] = useState<string>("all")
  const [hotCities, setHotCities] = useState<string[]>([])
  const [hotProvinces, setHotProvinces] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const { amapKey } = useRuntimeConfig()
  const hasAmapKey = !!amapKey

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 加载航班数据、城市和省份
  useEffect(() => {
    const loadData = async () => {
      try {
        // 并行加载航班数据、城市和省份列表
        const [flightsResponse, citiesResponse, provincesResponse] = await Promise.all([
          fetch("/api/flight-data"),
          fetch("/api/flight-cities"),
          fetch("/api/flight-provinces")
        ])
        
        const flights = await flightsResponse.json()
        const citiesData = await citiesResponse.json()
        const provincesData = await provincesResponse.json()
        
        setData(flights)
        setHotCities(citiesData.hotCities || [])
        setHotProvinces(provincesData.hotProvinces || [])
      } catch (error) {
        console.error("加载数据失败:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 根据城市或省份筛选过滤数据
  const filteredData = useMemo(() => {
    let filtered = data
    if (originFilter !== "all") {
      // 判断是否是省份筛选
      if (originFilter.startsWith('province:')) {
        const province = originFilter.replace('province:', '')
        filtered = filtered.filter(flight => flight.origin_province === province)
      } else {
        filtered = filtered.filter(flight => flight.origin_city === originFilter)
      }
    }
    if (destFilter !== "all") {
      // 判断是否是省份筛选
      if (destFilter.startsWith('province:')) {
        const province = destFilter.replace('province:', '')
        filtered = filtered.filter(flight => flight.dest_province === province)
      } else {
        filtered = filtered.filter(flight => flight.dest_city === destFilter)
      }
    }
    return filtered
  }, [data, originFilter, destFilter])

  
  // 获取所有唯一的城市和省份列表
  const uniqueCities = useMemo(() => {
    const originCities = new Set(data.map(flight => flight.origin_city))
    const destCities = new Set(data.map(flight => flight.dest_city))
    const allCities = new Set([...originCities, ...destCities])
    return Array.from(allCities).sort()
  }, [data])

  const uniqueProvinces = useMemo(() => {
    const originProvinces = new Set(data.map(flight => flight.origin_province).filter(Boolean))
    const destProvinces = new Set(data.map(flight => flight.dest_province).filter(Boolean))
    const allProvinces = new Set([...originProvinces, ...destProvinces])
    return Array.from(allProvinces).sort()
  }, [data])

  // 定义表格列
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "序号",
        cell: info => info.getValue(),
        size: 60,
      }),
      columnHelper.accessor("flight_no", {
        header: "航班号",
        cell: info => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{info.getValue()}</span>
            {info.row.original.is_2666_exclusive && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs px-1.5 py-0 h-5" variant="secondary">
                2666
              </Badge>
            )}
            {info.row.original.hasReturn && (
              <Badge variant="outline" className="border-green-500 text-green-600 text-xs px-1.5 py-0 h-5">
                可往返
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("carrier_name", {
        header: "航空公司",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor("days", {
        header: "飞行日",
        cell: info => {
          const days = info.getValue()
          return <FlightDaysDisplay days={days} variant="dots" />
        },
      }),
      columnHelper.accessor("origin_airport", {
        header: () => <span className="whitespace-nowrap">起飞机场</span>,
        cell: info => (
          <div className="min-w-[150px]">
            <div className="font-medium">{info.getValue()}</div>
            {info.row.original.origin_iata_code && (
              <div className="text-xs text-muted-foreground">{info.row.original.origin_iata_code}</div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("dest_airport", {
        header: () => <span className="whitespace-nowrap">到达机场</span>,
        cell: info => (
          <div className="min-w-[150px]">
            <div className="font-medium">{info.getValue()}</div>
            {info.row.original.dest_iata_code && (
              <div className="text-xs text-muted-foreground">{info.row.original.dest_iata_code}</div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("dep_time", {
        header: () => <span className="whitespace-nowrap">起飞时间</span>,
        cell: info => {
          const time = info.getValue()
          const hour = parseInt(time.substring(0, 2))
          const isNightFlight = hour >= 19 || hour <= 9
          return (
            <span className={isNightFlight ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>
              {time.substring(0, 2)}:{time.substring(2, 4)}
            </span>
          )
        },
      }),
      columnHelper.accessor("arr_time", {
        header: () => <span className="whitespace-nowrap">到达时间</span>,
        cell: info => {
          const time = info.getValue()
          return `${time.substring(0, 2)}:${time.substring(2, 4)}`
        },
      }),
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  // 动态调整分页大小
  useEffect(() => {
    table.setPageSize(isMobile ? 5 : 20)
  }, [isMobile, table])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选栏 */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* 移动端保持两行布局，PC端一行布局 */}
        <div className="flex gap-2 items-center flex-1">
          {/* 起飞地选择器 */}
          <AirportSelector
            value={originFilter}
            onChange={setOriginFilter}
            placeholder="起飞地"
            airports={uniqueCities}
            hotCities={hotCities}
            provinces={uniqueProvinces}
            hotProvinces={hotProvinces}
          />
          
          {/* 交换按钮 */}
          {originFilter !== "all" && destFilter !== "all" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const temp = originFilter
                setOriginFilter(destFilter)
                setDestFilter(temp)
              }}
              className="h-10 w-10 flex-shrink-0"
              title="交换起飞和到达城市"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          )}
          
          {/* 到达地选择器 */}
          <AirportSelector
            value={destFilter}
            onChange={setDestFilter}
            placeholder="到达地"
            airports={uniqueCities}
            hotCities={hotCities}
            provinces={uniqueProvinces}
            hotProvinces={hotProvinces}
          />
        </div>
        
        {/* 操作按钮组 - PC端显示在同一行右侧 */}
        {(originFilter !== "all" || destFilter !== "all") && (
          <div className="flex gap-2 items-center sm:flex-shrink-0">
            {/* 清除筛选按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOriginFilter("all")
                setDestFilter("all")
              }}
              className="sm:w-auto"
            >
              清除筛选
            </Button>
            
            {/* 视图切换按钮组 - 仅在有筛选结果且配置了高德key时显示 */}
            {filteredData.length > 0 && hasAmapKey && (
              <div className="flex rounded-lg border bg-muted/20 p-0.5">
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-md"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">列表</span>
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('map')}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-md"
                >
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">地图</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 数据统计 */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>共 {filteredData.length} 条航班</span>
        {(originFilter !== "all" || destFilter !== "all") && (
          <span>
            {originFilter !== "all" && (
              originFilter.startsWith('province:') 
                ? `起飞省份: ${originFilter.replace('province:', '')}`
                : `起飞城市: ${originFilter}`
            )}
            {originFilter !== "all" && destFilter !== "all" && " | "}
            {destFilter !== "all" && (
              destFilter.startsWith('province:') 
                ? `到达省份: ${destFilter.replace('province:', '')}`
                : `到达城市: ${destFilter}`
            )}
          </span>
        )}
      </div>

      {/* 航线地图 - 根据视图模式显示 */}
      {viewMode === 'map' && (
        <div className="rounded-lg border overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {filteredData.length > 0 ? (
            <SimpleFlightMap 
              flights={filteredData}
              className="h-[400px] sm:h-[500px] w-full"
            />
          ) : (
            <div className="h-[400px] sm:h-[500px] flex items-center justify-center bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无航线数据</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PC端表格 - 根据视图模式显示 */}
      {viewMode === 'list' && (
        <div className="hidden sm:block rounded-lg border overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <div className="overflow-x-auto relative">
          <table className="w-full">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-left text-sm font-medium ${
                        header.id === 'actions' ? 'sticky right-0 bg-muted/50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] text-center' : ''
                      }`}
                    >
                      {header.isPlaceholder ? null : header.id === 'actions' ? (
                        <div className="text-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      ) : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-1"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <ChevronUp className="w-4 h-4" />,
                            desc: <ChevronDown className="w-4 h-4" />,
                          }[header.column.getIsSorted() as string] ?? (
                            header.column.getCanSort() && (
                              <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
                            )
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-sm whitespace-nowrap ${
                        cell.column.id === 'actions' 
                          ? 'sticky right-0 bg-background shadow-[-2px_0_4px_rgba(0,0,0,0.05)] text-center' 
                          : ''
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* 移动端紧凑式展示 - 根据视图模式显示 */}
      {viewMode === 'list' && (
        <div className="block sm:hidden space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {table.getRowModel().rows.map(row => {
          const flight = row.original
          const isNightFlight = parseInt(flight.dep_time.substring(0, 2)) >= 19 || parseInt(flight.dep_time.substring(0, 2)) <= 9
          
          return (
            <div key={row.id} className="bg-white dark:bg-gray-900 rounded-lg border p-3">
              {/* 第一行：航班号、航线、飞行日 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{flight.flight_no}</span>
                  {flight.is_2666_exclusive && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-[10px] px-1 py-0 h-4" variant="secondary">
                      2666
                    </Badge>
                  )}
                  {flight.hasReturn && (
                    <Badge variant="outline" className="border-green-500 text-green-600 text-[10px] px-1 py-0 h-4">
                      可往返
                    </Badge>
                  )}
                </div>
                <FlightDaysDisplay days={flight.days} variant="dots" />
              </div>
              
              {/* 第二行：航线和时间 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium">{flight.origin_city}</span>
                  <span className={cn(
                    "text-xs",
                    isNightFlight && "text-blue-600 dark:text-blue-400 font-medium"
                  )}>
                    {flight.dep_time.substring(0, 2)}:{flight.dep_time.substring(2, 4)}
                  </span>
                </div>
                
                <svg className="w-4 h-4 text-muted-foreground mx-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                </svg>
                
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="font-medium">{flight.dest_city}</span>
                  <span className="text-xs text-muted-foreground">
                    {flight.arr_time.substring(0, 2)}:{flight.arr_time.substring(2, 4)}
                  </span>
                </div>
              </div>
              
              {/* 第三行：机场信息 */}
              <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                <span className="truncate max-w-[30%]">
                  {flight.origin_airport}
                  {flight.origin_iata_code && ` (${flight.origin_iata_code})`}
                </span>
                <span className="px-2">{flight.carrier_name}</span>
                <span className="truncate max-w-[30%] text-right">
                  {flight.dest_airport}
                  {flight.dest_iata_code && ` (${flight.dest_iata_code})`}
                </span>
              </div>
            </div>
          )
        })}
        </div>
      )}

      {/* 分页 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="hidden sm:inline">
            第 {table.getState().pagination.pageIndex + 1} 页，共{" "}
            {table.getPageCount()} 页
          </span>
          <span className="sm:hidden">
            {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="hidden sm:inline">上一页</span>
            <span className="sm:hidden">上页</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="hidden sm:inline">下一页</span>
            <span className="sm:hidden">下页</span>
          </Button>
        </div>
      </div>
    </div>
  )
}