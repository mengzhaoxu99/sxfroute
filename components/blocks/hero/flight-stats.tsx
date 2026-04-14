"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface FlightStatsData {
  totalFlights: number
  totalCities: number
  totalRoutes: number
}

export function FlightStats() {
  const [stats, setStats] = useState<FlightStatsData>({
    totalFlights: 0,
    totalCities: 0,
    totalRoutes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/flight-stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch flight stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-md border-t-4 border-t-sky-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-sky-50/20">
          <CardContent className="pt-5 pb-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                {loading ? "..." : stats.totalFlights}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">航班总数</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50/20">
          <CardContent className="pt-5 pb-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                {loading ? "..." : stats.totalCities}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">覆盖城市</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-t-4 border-t-sky-400 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-sky-50/20">
          <CardContent className="pt-5 pb-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                {loading ? "..." : stats.totalRoutes}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">直飞航线</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}