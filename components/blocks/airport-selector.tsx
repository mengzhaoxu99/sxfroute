"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, Search, MapPin, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AirportSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  airports: string[]
  hotCities?: string[]
  provinces?: string[]
  hotProvinces?: string[]
}

export function AirportSelector({ value, onChange, placeholder = "请选择", airports, hotCities, provinces = [], hotProvinces = [] }: AirportSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [displayValue, setDisplayValue] = useState(value === "all" ? "" : value)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [locationType, setLocationType] = useState<'city' | 'province'>('city')
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'center' | 'right'>('center')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 默认热门城市列表
  const defaultHotCities = [
    '北京', '上海', '广州', '深圳', '成都', '重庆', '西安', '昆明',
    '杭州', '南京', '武汉', '天津', '青岛', '厦门', '三亚', '大连',
    '哈尔滨', '长沙', '郑州', '济南'
  ]

  // 默认热门省份列表
  const defaultHotProvinces = [
    '北京市', '上海市', '广东省', '四川省', '云南省', '海南省',
    '新疆维吾尔自治区', '西藏自治区', '浙江省', '江苏省'
  ]

  // 获取热门项目
  const hotCityItems = (hotCities || defaultHotCities).filter(city => airports.includes(city))
  const hotProvinceItems = (hotProvinces || defaultHotProvinces).filter(province => provinces.includes(province))
  const hotItems = locationType === 'city' ? hotCityItems : hotProvinceItems

  // 检测是否为移动端
  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (value === "all") {
      setDisplayValue("")
    } else if (value.startsWith('province:')) {
      setDisplayValue(value.replace('province:', ''))
      setLocationType('province')
    } else {
      setDisplayValue(value)
      setLocationType('city')
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchValue("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 过滤列表
  const items = locationType === 'city' ? airports : provinces
  const filteredItems = searchValue 
    ? items.filter((item) => item.toLowerCase().includes(searchValue.toLowerCase()))
    : []

  const handleItemSelect = (item: string) => {
    // 如果选择的是省份，在值前加上标识
    const finalValue = locationType === 'province' ? `province:${item}` : item
    onChange(finalValue)
    setDisplayValue(item)
    setSearchValue("")
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    // 检测输入框在视口中的位置
    if (mounted && isMobile && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const center = rect.left + rect.width / 2
      
      // 如果输入框在屏幕左半部分，左对齐
      if (center < viewportWidth * 0.5) {
        setDropdownPosition('left')
      } 
      // 如果输入框在屏幕右半部分，右对齐
      else {
        setDropdownPosition('right')
      }
    }
  }

  const handleClear = () => {
    onChange("all")
    setDisplayValue("")
    setSearchValue("")
    setIsOpen(false)
  }

  // 处理失焦时的行为
  const handleInputBlur = () => {
    // 延迟处理，避免与点击事件冲突
    setTimeout(() => {
      if (searchValue && !isOpen) {
        setSearchValue("")
      }
    }, 200)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={displayValue || placeholder}
          className="pr-8"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2"
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) {
              setSearchValue("")
              // 检测输入框在视口中的位置
              if (mounted && isMobile && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                const viewportWidth = window.innerWidth
                const center = rect.left + rect.width / 2
                
                // 如果输入框在屏幕左半部分，左对齐
                if (center < viewportWidth * 0.5) {
                  setDropdownPosition('left')
                } 
                // 如果输入框在屏幕右半部分，右对齐
                else {
                  setDropdownPosition('right')
                }
              }
            }
          }}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </div>

      {isOpen && (
        <div className={cn(
          "absolute top-full z-50 mt-1 bg-white border rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200",
          mounted && isMobile ? 
            dropdownPosition === 'left' ? "left-0 w-[80vw] max-w-[320px]" :
            dropdownPosition === 'right' ? "right-0 w-[80vw] max-w-[320px]" :
            "left-[50%] -translate-x-1/2 w-[80vw] max-w-[320px]"
          : "left-0 w-[520px]"
        )}>
          {/* 城市/省份切换标签 */}
          <div className={cn("flex border-b", mounted && isMobile ? "bg-gray-50" : "bg-gradient-to-r from-gray-50 to-white")}>
            <button
              type="button"
              onClick={() => setLocationType('city')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 font-medium transition-all",
                mounted && isMobile ? "py-1.5 text-xs" : "py-3 text-sm",
                locationType === 'city' 
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm" 
                  : "text-gray-500 border-b-2 border-transparent hover:text-gray-700"
              )}
            >
              <Building2 className="w-4 h-4" />
              城市
            </button>
            <button
              type="button"
              onClick={() => setLocationType('province')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 font-medium transition-all",
                mounted && isMobile ? "py-1.5 text-xs" : "py-3 text-sm",
                locationType === 'province' 
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm" 
                  : "text-gray-500 border-b-2 border-transparent hover:text-gray-700"
              )}
            >
              <MapPin className="w-4 h-4" />
              省份
            </button>
          </div>

          {/* 搜索结果 */}
          {searchValue && filteredItems.length > 0 ? (
            <div className={cn("bg-gradient-to-b from-blue-50/50 to-white", mounted && isMobile ? "px-3 py-2" : "p-4")}>
              <div className="flex items-center gap-2 text-gray-700 mb-3 font-medium">
                <Search className={cn("text-blue-500", mounted && isMobile ? "w-4 h-4" : "w-5 h-5")} />
                <span className={cn(mounted && isMobile ? "text-sm" : "text-base")}>
                  搜索结果
                  <span className="text-blue-600 ml-1">({filteredItems.length})</span>
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleItemSelect(item)}
                      className={cn(
                        "w-full text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 hover:text-blue-600 rounded-lg transition-all border border-transparent hover:border-blue-200",
                        mounted && isMobile ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm hover:shadow-sm",
                        (value === item || value === `province:${item}`) && "bg-gradient-to-r from-blue-50 to-sky-50 text-blue-600 border-blue-200"
                      )}
                    >
                      {item}
                      {(value === item || value === `province:${item}`) && <Check className="w-3 h-3 inline ml-1 float-right" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : searchValue && filteredItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              没有找到匹配的{locationType === 'city' ? '城市' : '省份'}
            </div>
          ) : (
            <div className={cn("overflow-y-auto", mounted && isMobile ? "max-h-64 px-3 py-2" : "max-h-96 p-5")}>
              {/* 如果是省份模式，显示所有省份 */}
              {locationType === 'province' && provinces.length > 0 ? (
                <>
                  <div className={cn("text-muted-foreground mb-2", mounted && isMobile ? "text-xs" : "text-sm")}>
                    所有省份
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className={cn("grid", mounted && isMobile ? "grid-cols-2 gap-1" : "grid-cols-3 gap-2")}>
                      {provinces.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleItemSelect(item)}
                          className={cn(
                            "rounded hover:bg-accent text-left transition-colors truncate px-2 py-1.5",
                            mounted && isMobile ? "text-xs" : "text-sm",
                            value === `province:${item}` && "bg-accent text-accent-foreground"
                          )}
                          title={item}
                        >
                          {item}
                          {value === `province:${item}` && <Check className="w-3 h-3 inline ml-1 float-right" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={cn("text-muted-foreground mb-2", mounted && isMobile ? "text-xs" : "text-sm")}>
                    热门{locationType === 'city' ? '城市' : '省份'}
                  </div>
                  <div className={cn("grid", mounted && isMobile ? "grid-cols-3 gap-1" : "grid-cols-5 gap-2")}>
                    {hotItems.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleItemSelect(item)}
                        className={cn(
                          "rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 hover:text-blue-600 text-center transition-all truncate flex items-center justify-center border border-transparent hover:border-blue-200",
                          mounted && isMobile ? "px-1 py-2 text-xs" : "px-3 py-2.5 text-sm hover:shadow-sm",
                          (value === item || value === `province:${item}`) && "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-600 font-semibold border-blue-200 shadow-sm"
                        )}
                        title={item}
                      >
                        <span className="truncate">{item}</span>
                        {(value === item || value === `province:${item}`) && <Check className="w-3 h-3 ml-0.5 flex-shrink-0 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {displayValue && (
                <div className="mt-3 pt-3 border-t">
                  <button
                    onClick={handleClear}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded transition-colors text-muted-foreground"
                  >
                    清除筛选
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}