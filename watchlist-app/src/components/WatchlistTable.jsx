import { useState } from 'react'

function formatPrice(price) {
  if (price == null) return '—'
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (price >= 1) {
    return '$' + price.toFixed(2)
  }
  if (price >= 0.01) {
    return '$' + price.toFixed(4)
  }
  return '$' + price.toFixed(8)
}

function formatTarget(target) {
  if (target == null) return '—'
  if (target >= 1000) {
    return '$' + (target / 1000).toFixed(0) + 'k'
  }
  return '$' + target.toLocaleString()
}

function formatMarketCap(cap) {
  if (cap == null) return '—'
  if (cap >= 1e12) return '$' + (cap / 1e12).toFixed(2) + 'T'
  if (cap >= 1e9) return '$' + (cap / 1e9).toFixed(2) + 'B'
  if (cap >= 1e6) return '$' + (cap / 1e6).toFixed(2) + 'M'
  return '$' + cap.toLocaleString()
}

function formatChange(change) {
  if (change == null) return '—'
  const sign = change >= 0 ? '+' : ''
  return sign + change.toFixed(2) + '%'
}

function getTargetStatus(price, target) {
  if (price == null || target == null) return null
  if (price > target) return 'over'
  if (price < target) return 'under'
  return 'at'
}

function getTargetDiff(price, target) {
  if (price == null || target == null) return null
  const diff = ((price - target) / target) * 100
  return diff
}

const ECOSYSTEM_COLORS = {
  Bitcoin: '#f7931a',
  Hyperliquid: '#00d4aa',
  Solana: '#9945ff',
  Ethereum: '#627eea',
  'Crypto Equity': '#ffd700',
  'Binance Smart Chain': '#f0b90b',
  Avalanche: '#e84142',
  SUI: '#4da2ff',
  Celestia: '#7b2bf9',
  Monad: '#836ef9',
  Bittensor: '#000000',
}

const FILTERS = ['All', 'Solana', 'Ethereum', 'Bitcoin', 'Crypto Equity', 'Other']

export default function WatchlistTable({ watchlist, prices, loading }) {
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('desc')
    }
  }

  const filtered = watchlist.filter((item) => {
    if (filter === 'All') return true
    if (filter === 'Other') {
      return !['Solana', 'Ethereum', 'Bitcoin', 'Crypto Equity'].includes(item.ecosystem)
    }
    return item.ecosystem === filter
  })

  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) return 0
    const priceA = prices[a.asset]
    const priceB = prices[b.asset]

    let valA, valB
    switch (sortBy) {
      case 'price':
        valA = priceA?.price ?? -Infinity
        valB = priceB?.price ?? -Infinity
        break
      case 'change':
        valA = priceA?.change24h ?? -Infinity
        valB = priceB?.change24h ?? -Infinity
        break
      case 'mcap':
        valA = priceA?.marketCap ?? -Infinity
        valB = priceB?.marketCap ?? -Infinity
        break
      case 'diff':
        valA = getTargetDiff(priceA?.price, a.fairValueTarget) ?? -Infinity
        valB = getTargetDiff(priceB?.price, b.fairValueTarget) ?? -Infinity
        break
      default:
        return 0
    }

    if (sortDir === 'asc') return valA - valB
    return valB - valA
  })

  return (
    <div className="watchlist-container">
      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="watchlist-table">
          <thead>
            <tr>
              <th className="th-rank">#</th>
              <th className="th-asset">Asset</th>
              <th className="th-ecosystem">Ecosystem</th>
              <th className="th-category">Category</th>
              <th className="th-price sortable" onClick={() => handleSort('price')}>
                Price {sortBy === 'price' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="th-change sortable" onClick={() => handleSort('change')}>
                24h {sortBy === 'change' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="th-mcap sortable" onClick={() => handleSort('mcap')}>
                Market Cap {sortBy === 'mcap' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="th-target">Fair Value Target</th>
              <th className="th-status sortable" onClick={() => handleSort('diff')}>
                vs Target {sortBy === 'diff' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, idx) => {
              const priceData = prices[item.asset]
              const status = getTargetStatus(priceData?.price, item.fairValueTarget)
              const diff = getTargetDiff(priceData?.price, item.fairValueTarget)
              const ecoColor = ECOSYSTEM_COLORS[item.ecosystem] || '#888'

              return (
                <tr key={item.asset} className={loading ? 'loading-row' : ''}>
                  <td className="td-rank">{idx + 1}</td>
                  <td className="td-asset">
                    <span className="asset-name">{item.asset}</span>
                    {item.type === 'equity' && <span className="equity-badge">EQUITY</span>}
                  </td>
                  <td className="td-ecosystem">
                    <span className="eco-dot" style={{ backgroundColor: ecoColor }}></span>
                    {item.ecosystem}
                  </td>
                  <td className="td-category">{item.category}</td>
                  <td className="td-price">
                    {priceData ? formatPrice(priceData.price) : item.coingeckoId ? (loading ? '...' : '—') : '—'}
                  </td>
                  <td className={`td-change ${priceData?.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {priceData ? formatChange(priceData.change24h) : '—'}
                  </td>
                  <td className="td-mcap">
                    {priceData ? formatMarketCap(priceData.marketCap) : '—'}
                  </td>
                  <td className="td-target">{formatTarget(item.fairValueTarget)}</td>
                  <td className="td-status">
                    {status ? (
                      <span className={`status-badge ${status}`}>
                        {status === 'over' ? '▲' : '▼'}{' '}
                        {status === 'over' ? 'OVER' : 'UNDER'}{' '}
                        <span className="diff-pct">
                          ({diff > 0 ? '+' : ''}{diff.toFixed(1)}%)
                        </span>
                      </span>
                    ) : (
                      <span className="status-na">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
