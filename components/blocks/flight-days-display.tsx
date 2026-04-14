"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FlightDaysDisplayProps {
  days: string
  variant?: 'dots' | 'badges' | 'compact' | 'text'
}

export function FlightDaysDisplay({ days, variant = 'dots' }: FlightDaysDisplayProps) {
  const dayArray = days.split("").map(d => parseInt(d)).filter(d => !isNaN(d))
  
  // 检查特殊情况
  if (dayArray.length === 7) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        每天
      </Badge>
    )
  }
  
  // 检查是否只有工作日（1-5）
  const isWeekdaysOnly = dayArray.every(d => d >= 1 && d <= 5) && dayArray.length === 5
  if (isWeekdaysOnly) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        工作日
      </Badge>
    )
  }
  
  // 检查是否只有周末（6-7）
  const isWeekendsOnly = dayArray.every(d => d >= 6 && d <= 7) && dayArray.length === 2
  if (isWeekendsOnly) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
        周末
      </Badge>
    )
  }

  // 根据变体选择不同的显示方式
  switch (variant) {
    case 'dots':
      return <DotsDisplay dayArray={dayArray} />
    case 'badges':
      return <BadgesDisplay dayArray={dayArray} />
    case 'compact':
      return <CompactDisplay dayArray={dayArray} />
    default:
      return <DotsDisplay dayArray={dayArray} />
  }
}

// 圆点显示方式
function DotsDisplay({ dayArray }: { dayArray: number[] }) {
  const dayLabels = ['一', '二', '三', '四', '五', '六', '日']
  
  return (
    <div className="flex items-center gap-0.5">
      {dayLabels.map((label, index) => {
        const dayNum = index === 6 ? 7 : index + 1
        const isActive = dayArray.includes(dayNum)
        return (
          <div
            key={dayNum}
            className={cn(
              "w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-medium transition-colors",
              isActive
                ? dayNum >= 6
                  ? "bg-orange-500 text-white" // 周末用橙色
                  : "bg-blue-500 text-white"   // 工作日用蓝色
                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            )}
            title={`周${label}`}
          >
            {label}
          </div>
        )
      })}
    </div>
  )
}

// 标签显示方式
function BadgesDisplay({ dayArray }: { dayArray: number[] }) {
  const dayMap: { [key: number]: string } = {
    1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五", 6: "周六", 7: "周日"
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {dayArray.map(day => (
        <Badge 
          key={day} 
          variant="outline" 
          className={cn(
            "text-xs px-1.5 py-0",
            day >= 6 
              ? "border-orange-500 text-orange-600 dark:border-orange-400 dark:text-orange-400"
              : "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
          )}
        >
          {dayMap[day]}
        </Badge>
      ))}
    </div>
  )
}

// 紧凑显示方式
function CompactDisplay({ dayArray }: { dayArray: number[] }) {
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] // Mon, Tue, Wed, Thu, Fri, Sat, Sun
  
  return (
    <div className="flex items-center gap-px font-mono text-xs">
      {dayLetters.map((letter, index) => {
        const dayNum = index === 6 ? 7 : index + 1
        const isActive = dayArray.includes(dayNum)
        return (
          <span
            key={dayNum}
            className={cn(
              "w-4 h-4 flex items-center justify-center rounded",
              isActive
                ? dayNum >= 6
                  ? "bg-orange-500 text-white font-bold"
                  : "bg-blue-500 text-white font-bold"
                : "text-gray-300 dark:text-gray-700"
            )}
            title={`${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}`}
          >
            {letter}
          </span>
        )
      })}
    </div>
  )
}
