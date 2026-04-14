"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 简化的拼音映射
const getPinyin = (char: string): string => {
  const pinyinMap: { [key: string]: string } = {
    阿: "A", 安: "A", 鞍: "A", 巴: "B", 白: "B", 包: "B", 宝: "B", 保: "B", 北: "B", 本: "B", 毕: "B", 滨: "B", 亳: "B",
    沧: "C", 昌: "C", 长: "C", 常: "C", 潮: "C", 朝: "C", 承: "C", 成: "C", 池: "C", 赤: "C", 崇: "C", 滁: "C",
    大: "D", 丹: "D", 德: "D", 迪: "D", 定: "D", 东: "D", 鄂: "E", 恩: "E", 防: "F", 佛: "F", 福: "F", 抚: "F", 阜: "F",
    甘: "G", 赣: "G", 固: "G", 广: "G", 贵: "G", 桂: "G", 哈: "H", 海: "H", 邯: "H", 汉: "H", 杭: "H", 合: "H", 和: "H",
    河: "H", 菏: "H", 贺: "H", 鹤: "H", 黑: "H", 衡: "H", 红: "H", 呼: "H", 湖: "H", 葫: "H", 怀: "H", 淮: "H", 黄: "H", 惠: "H",
    鸡: "J", 吉: "J", 济: "J", 佳: "J", 嘉: "J", 江: "J", 焦: "J", 揭: "J", 金: "J", 锦: "J", 晋: "J", 荆: "J", 景: "J", 九: "J", 酒: "J",
    喀: "K", 开: "K", 克: "K", 昆: "K", 拉: "L", 来: "L", 莱: "L", 兰: "L", 廊: "L", 乐: "L", 丽: "L", 连: "L", 辽: "L",
    聊: "L", 临: "L", 林: "L", 柳: "L", 六: "L", 龙: "L", 陇: "L", 娄: "L", 泸: "L", 吕: "L", 洛: "L", 漯: "L",
    马: "M", 茂: "M", 眉: "M", 梅: "M", 蒙: "M", 绵: "M", 牡: "M", 内: "N", 南: "N", 那: "N", 宁: "N", 怒: "N",
    攀: "P", 盘: "P", 平: "P", 萍: "P", 莆: "P", 濮: "P", 普: "P", 七: "Q", 齐: "Q", 钦: "Q", 秦: "Q", 青: "Q", 清: "Q", 庆: "Q", 曲: "Q", 衢: "Q", 泉: "Q",
    日: "R", 三: "S", 汕: "S", 商: "S", 上: "S", 韶: "S", 邵: "S", 绍: "S", 深: "S", 沈: "S", 十: "S", 石: "S", 双: "S", 朔: "S", 四: "S",
    松: "S", 苏: "S", 宿: "S", 绥: "S", 随: "S", 台: "T", 太: "T", 泰: "T", 唐: "T", 天: "T", 铁: "T", 通: "T", 铜: "T", 图: "T", 吐: "T",
    威: "W", 潍: "W", 渭: "W", 温: "W", 文: "W", 乌: "W", 无: "W", 吴: "W", 芜: "W", 武: "W", 西: "X", 锡: "X", 厦: "X", 仙: "X", 咸: "X",
    湘: "X", 襄: "X", 孝: "X", 忻: "X", 新: "X", 信: "X", 兴: "X", 邢: "X", 徐: "X", 许: "X", 宣: "X", 雅: "Y", 烟: "Y", 延: "Y", 盐: "Y",
    扬: "Y", 阳: "Y", 伊: "Y", 宜: "Y", 益: "Y", 银: "Y", 鹰: "Y", 营: "Y", 永: "Y", 榆: "Y", 玉: "Y", 岳: "Y", 云: "Y", 运: "Y",
    枣: "Z", 湛: "Z", 张: "Z", 漳: "Z", 昭: "Z", 肇: "Z", 镇: "Z", 郑: "Z", 中: "Z", 重: "Z", 舟: "Z", 周: "Z", 株: "Z", 珠: "Z", 驻: "Z", 资: "Z", 淄: "Z", 自: "Z", 遵: "Z"
  }
  return pinyinMap[char] || char
}

// 按首字母分组
const groupCitiesByLetter = (cities: string[]) => {
  const groups: { [key: string]: string[] } = {}

  cities.forEach((city) => {
    const firstChar = city.charAt(0)
    const pinyin = getPinyin(firstChar)
    const letter = pinyin.charAt(0).toUpperCase()

    if (!groups[letter]) {
      groups[letter] = []
    }
    groups[letter].push(city)
  })

  return groups
}

const LETTER_GROUPS = ["热门", "ABCDEF", "GHIJ", "KLMN", "PQRSTUVW", "XYZ"]

interface CitySelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// 机场选项类型
interface AirportOption {
  label: string      // 显示文本（城市或机场名称）
  value: string      // 实际值（城市或机场名称）
  type: 'city' | 'airport'  // 类型标识
  city?: string      // 所属城市（对于机场选项）
  airports?: string[] // 包含的机场（对于城市选项）
}

export function CitySelector({ value, onChange, placeholder = "请选择城市" }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(value)
  const [activeTab, setActiveTab] = useState("热门")
  const [allCities, setAllCities] = useState<string[]>([])
  const [hotCities, setHotCities] = useState<string[]>([])
  const [cityGroups, setCityGroups] = useState<{ [key: string]: string[] }>({})
  const [cityAirports, setCityAirports] = useState<{ [key: string]: string[] }>({}) // 城市到机场的映射
  const [airportCity, setAirportCity] = useState<{ [key: string]: string }>({})    // 机场到城市的映射
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'center' | 'right'>('center')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // 从API加载城市列表
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch('/api/flight-cities')
        if (response.ok) {
          const data = await response.json()
          setAllCities(data.cities)
          setHotCities(data.hotCities)
          setCityGroups(groupCitiesByLetter(data.cities))
          setCityAirports(data.cityAirports || {})
          setAirportCity(data.airportCity || {})
        }
      } catch (error) {
        console.error('加载城市列表失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCities()
  }, [])

  useEffect(() => {
    setSearchValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 改进的搜索逻辑，同时搜索城市和机场
  const getFilteredOptions = (): AirportOption[] => {
    if (!searchValue) return []
    
    const options: AirportOption[] = []
    const searchLower = searchValue.toLowerCase()
    
    // 搜索匹配的城市
    const matchedCities = allCities.filter(city => 
      city.includes(searchValue) || city.toLowerCase().includes(searchLower)
    )
    
    // 对于每个匹配的城市，检查是否有多个机场
    matchedCities.forEach(city => {
      const airports = cityAirports[city] || []
      
      if (airports.length > 1) {
        // 如果输入是完整的城市名（如"北京"），显示所有机场
        if (searchValue === city) {
          airports.forEach(airport => {
            options.push({
              label: airport,
              value: airport,
              type: 'airport',
              city: city
            })
          })
        } else {
          // 如果是部分匹配，检查是否有机场名称包含搜索词
          const matchedAirports = airports.filter(airport => 
            airport.includes(searchValue) || airport.toLowerCase().includes(searchLower)
          )
          
          if (matchedAirports.length > 0) {
            // 如果有匹配的机场，只显示匹配的机场
            matchedAirports.forEach(airport => {
              options.push({
                label: airport,
                value: airport,
                type: 'airport',
                city: city
              })
            })
          } else {
            // 如果没有匹配的机场，显示所有机场
            airports.forEach(airport => {
              options.push({
                label: airport,
                value: airport,
                type: 'airport',
                city: city
              })
            })
          }
        }
      } else {
        // 只有一个机场的城市，显示城市名
        options.push({
          label: city,
          value: city,
          type: 'city',
          airports: airports
        })
      }
    })
    
    // 搜索直接匹配机场名称的结果
    Object.entries(airportCity).forEach(([airport, city]) => {
      if ((airport.includes(searchValue) || airport.toLowerCase().includes(searchLower)) &&
          !options.some(opt => opt.value === airport)) {
        options.push({
          label: airport,
          value: airport,
          type: 'airport',
          city: city
        })
      }
    })
    
    // 去重并排序
    const uniqueOptions = options.filter((opt, index, self) => 
      index === self.findIndex(o => o.value === opt.value)
    )
    
    return uniqueOptions
  }
  
  const filteredOptions = getFilteredOptions()

  const handleOptionSelect = (option: AirportOption | string) => {
    let selectedValue: string
    
    if (typeof option === 'string') {
      selectedValue = option
    } else {
      selectedValue = option.value
    }
    
    onChange(selectedValue)
    setSearchValue(selectedValue)
    setIsOpen(false)
  }
  
  const handleCitySelect = (city: string) => {
    handleOptionSelect(city)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const getCitiesForTab = (tab: string) => {
    if (tab === "热门") return hotCities

    const letters = tab.split("")
    const cities: string[] = []
    letters.forEach((letter) => {
      if (cityGroups[letter]) {
        cities.push(...cityGroups[letter])
      }
    })
    return cities.sort()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative group">
        <Input
          ref={inputRef}
          value={searchValue}
          onChange={handleInputChange}
          autoComplete="off"
          onFocus={() => {
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
          }}
          placeholder={placeholder}
          className={cn(
            "pr-8 transition-all",
            !mounted ? "" : isMobile ? "" : "focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          )}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false)
              inputRef.current?.blur()
            } else if (e.key === 'Enter' && filteredOptions.length > 0) {
              const optionToSelect = focusedIndex >= 0 ? filteredOptions[focusedIndex] : filteredOptions[0]
              handleOptionSelect(optionToSelect)
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              setFocusedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setFocusedIndex(prev => Math.max(prev - 1, -1))
            }
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute right-0 top-0 h-full px-2 transition-all",
            !mounted ? "" : isMobile ? "" : "hover:bg-blue-50 group-focus-within:text-blue-600"
          )}
          onClick={() => {
            setIsOpen(!isOpen)
            // 检测输入框在视口中的位置
            if (mounted && isMobile && containerRef.current && !isOpen) {
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
          }}
          disabled={loading}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </div>

      {isOpen && !loading && (
        <div className={cn(
          "absolute top-full z-50 mt-1 bg-white border rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200",
          mounted && isMobile ? 
            dropdownPosition === 'left' ? "left-0 w-[80vw] max-w-[320px]" :
            dropdownPosition === 'right' ? "right-0 w-[80vw] max-w-[320px]" :
            "left-[50%] -translate-x-1/2 w-[80vw] max-w-[320px]"
          : "left-0 w-[520px]"
        )}>
          {/* 搜索结果 */}
          {searchValue && (
            filteredOptions.length > 0 ? (
              <div className={cn("border-b bg-gradient-to-b from-blue-50/50 to-white", mounted && isMobile ? "px-3 py-2" : "p-4")}>
                <div className="flex items-center gap-2 text-gray-700 mb-3 font-medium">
                  <Search className={cn("text-blue-500", mounted && isMobile ? "w-4 h-4" : "w-5 h-5")} />
                  <span className={cn(mounted && isMobile ? "text-sm" : "text-base")}>
                    搜索结果 
                    <span className="text-blue-600 ml-1">({filteredOptions.length})</span>
                  </span>
                </div>
                <div className={cn("grid", mounted && isMobile ? "grid-cols-2 gap-1" : "grid-cols-3 gap-2")}>
                  {filteredOptions.slice(0, mounted && isMobile ? 10 : 15).map((option, index) => (
                    <button
                      key={`${option.type}-${option.value}`}
                      onClick={() => handleOptionSelect(option)}
                      className={cn(
                        "hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 hover:text-blue-600 rounded-lg text-left px-2 py-2 transition-all border border-transparent hover:border-blue-200",
                        mounted && isMobile ? "text-xs" : "text-sm hover:shadow-sm",
                        focusedIndex === index && "bg-gradient-to-r from-blue-50 to-sky-50 text-blue-600 border-blue-200"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="truncate font-medium">
                          {option.type === 'airport' ? (
                            <>
                              {option.city && (
                                <span className="text-gray-500 mr-1">{option.city}</span>
                              )}
                              <span className="text-blue-600">{option.label.replace(option.city || '', '').trim()}</span>
                            </>
                          ) : (
                            option.label
                          )}
                        </span>
                        {option.type === 'airport' && (
                          <span className="text-xs text-gray-400">机场</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={cn("p-4 text-center text-gray-500", mounted && isMobile ? "text-sm" : "text-base")}>
                <p>未找到匹配的城市或机场</p>
              </div>
            )
          )}

          {/* 标签栏 */}
          <div className={cn("flex border-b overflow-x-auto scrollbar-hide", mounted && isMobile ? "text-xs bg-gray-50" : "text-sm bg-gradient-to-r from-gray-50 to-white")}>
            {LETTER_GROUPS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0",
                  mounted && isMobile ? "px-2 py-1.5 text-xs" : "px-5 py-3 hover:bg-white/50 min-w-max",
                  activeTab === tab
                    ? "text-blue-600 border-blue-600 bg-white shadow-sm"
                    : "text-gray-500 border-transparent hover:text-gray-700",
                )}
              >
                {tab === "热门" ? (
                  <span className="flex items-center gap-1">
                    <span className="text-orange-500">🔥</span>
                    <span>{tab}</span>
                  </span>
                ) : tab}
              </button>
            ))}
          </div>

          {/* 城市网格 */}
          <div className={cn("overflow-y-auto", mounted && isMobile ? "max-h-64 px-3 py-2" : "max-h-96 p-5")}>
            <div className={cn("grid", mounted && isMobile ? "grid-cols-3 gap-1" : "grid-cols-5 gap-2")}>
              {getCitiesForTab(activeTab).map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    "rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 hover:text-blue-600 text-center transition-all truncate flex items-center justify-center group border border-transparent hover:border-blue-200",
                    mounted && isMobile ? "px-1 py-2 text-xs" : "px-3 py-2.5 text-sm hover:scale-105 hover:shadow-sm",
                    value === city && "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-600 font-semibold border-blue-200 shadow-sm",
                  )}
                >
                  <span className="truncate">{city}</span>
                  {value === city && <Check className="w-3 h-3 ml-0.5 flex-shrink-0 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}