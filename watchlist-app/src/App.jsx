import WatchlistTable from './components/WatchlistTable'
import watchlist from './data/watchlist'
import { usePrices } from './hooks/usePrices'
import './App.css'

function App() {
  const { prices, loading, error, lastUpdated, refetch } = usePrices(watchlist)

  const cryptoCount = watchlist.filter((w) => w.type === 'crypto').length
  const equityCount = watchlist.filter((w) => w.type === 'equity').length

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="logo">
              <span className="logo-accent">The</span> Watch List
            </h1>
            <p className="subtitle">
              Tracking {watchlist.length} assets ({cryptoCount} crypto, {equityCount} equities)
            </p>
          </div>
          <div className="header-right">
            {lastUpdated && (
              <span className="last-updated">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button className="refresh-btn" onClick={refetch} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <main className="main">
        <WatchlistTable watchlist={watchlist} prices={prices} loading={loading} />
      </main>

      <footer className="footer">
        <p>
          Data sourced from The DeFi Report. Prices via CoinGecko API.
          Equities (COIN, HOOD, GLXY) require a stock data provider.
        </p>
        <p className="footer-note">
          Fair value targets shown where available. Auto-refreshes every 60s.
        </p>
      </footer>
    </div>
  )
}

export default App
