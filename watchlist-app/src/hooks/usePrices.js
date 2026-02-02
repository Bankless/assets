import { useState, useEffect, useCallback } from 'react'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

export function usePrices(watchlist) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all valid coingecko IDs
      const ids = watchlist
        .filter((item) => item.coingeckoId)
        .map((item) => item.coingeckoId)
        .join(',')

      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
      )

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limited by CoinGecko. Please wait a moment and refresh.')
        }
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Map coingecko IDs back to asset symbols
      const priceMap = {}
      watchlist.forEach((item) => {
        if (item.coingeckoId && data[item.coingeckoId]) {
          priceMap[item.asset] = {
            price: data[item.coingeckoId].usd,
            change24h: data[item.coingeckoId].usd_24h_change,
            marketCap: data[item.coingeckoId].usd_market_cap,
          }
        }
      })

      setPrices(priceMap)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [watchlist])

  useEffect(() => {
    fetchPrices()

    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [fetchPrices])

  return { prices, loading, error, lastUpdated, refetch: fetchPrices }
}
