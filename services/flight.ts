import type { FlightData } from '@/types/flight'
import { loadFlightData } from '@/lib/flight/flight-loader'

export class FlightService {
  static async getAllFlights(): Promise<FlightData[]> {
    return loadFlightData()
  }

  static async searchFlights(origin?: string, destination?: string): Promise<FlightData[]> {
    const allFlights = await this.getAllFlights()
    let filteredFlights = allFlights

    if (origin && origin !== 'all') {
      filteredFlights = filteredFlights.filter(flight =>
        flight.origin_city === origin ||
        flight.origin_airport === origin ||
        flight.origin_iata_code === origin
      )
    }

    if (destination && destination !== 'all') {
      filteredFlights = filteredFlights.filter(flight =>
        flight.dest_city === destination ||
        flight.dest_airport === destination ||
        flight.dest_iata_code === destination
      )
    }

    return filteredFlights
  }

  static async getFlightStats() {
    const allFlights = await this.getAllFlights()
    const cities = new Set<string>()
    const routes = new Set<string>()
    for (const flight of allFlights) {
      cities.add(flight.origin_city)
      cities.add(flight.dest_city)
      routes.add(`${flight.origin_city}-${flight.dest_city}`)
    }
    return {
      totalFlights: allFlights.length,
      totalCities: cities.size,
      totalRoutes: routes.size,
    }
  }
}
