'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

// Mock stock data - In production, you'd fetch this from an API
const mockStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple', price: 175.43, change: 2.15, changePercent: 1.24 },
  { symbol: 'MSFT', name: 'Microsoft', price: 378.85, change: -1.23, changePercent: -0.32 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 142.56, change: 3.45, changePercent: 2.48 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 875.23, change: 12.34, changePercent: 1.43 },
  { symbol: 'META', name: 'Meta', price: 485.67, change: -2.89, changePercent: -0.59 },
  { symbol: 'TSLA', name: 'Tesla', price: 248.42, change: 5.67, changePercent: 2.34 },
  { symbol: 'AMZN', name: 'Amazon', price: 178.23, change: 1.45, changePercent: 0.82 },
  { symbol: 'AMD', name: 'AMD', price: 156.78, change: -0.89, changePercent: -0.56 },
  { symbol: 'INTC', name: 'Intel', price: 42.15, change: 0.67, changePercent: 1.62 },
  { symbol: 'ORCL', name: 'Oracle', price: 125.34, change: 2.12, changePercent: 1.72 },
  { symbol: 'CRM', name: 'Salesforce', price: 298.45, change: -1.23, changePercent: -0.41 },
  { symbol: 'UBER', name: 'Uber', price: 68.92, change: 1.34, changePercent: 1.98 },
  { symbol: 'LYFT', name: 'Lyft', price: 15.67, change: -0.23, changePercent: -1.45 },
  { symbol: 'SNAP', name: 'Snap', price: 12.45, change: 0.34, changePercent: 2.81 },
  { symbol: 'PLTR', name: 'Palantir', price: 24.56, change: 0.89, changePercent: 3.77 },
  { symbol: 'OPENAI', name: 'OpenAI', price: 0, change: 0, changePercent: 0 }, // Private company placeholder
]

export function StocksTicker() {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Simulate real-time updates (in production, use WebSocket or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          // Simulate small price movements
          const randomChange = (Math.random() - 0.5) * 0.5
          const newPrice = Math.max(0.01, stock.price + randomChange)
          const change = newPrice - stock.price
          const changePercent = (change / stock.price) * 100
          return {
            ...stock,
            price: Number(newPrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
          }
        })
      )
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('stocks-ticker-container')
    if (!container) return

    const scrollAmount = 300
    const newPosition =
      direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount

    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  return (
    <div className="bg-white border-b border-[var(--wsj-border-light)]">
      <div className="flex items-center">
        {/* Scroll left button */}
        <button
          onClick={() => handleScroll('left')}
          className="flex items-center justify-center p-2 hover:bg-[var(--wsj-bg-light-gray)] transition-colors border-r border-[var(--wsj-border-light)]"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--wsj-text-medium-gray)]" />
        </button>

        {/* Stocks ticker */}
        <div
          id="stocks-ticker-container"
          className="flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          <div className="flex items-center gap-6 px-4 py-2" style={{ minWidth: 'max-content' }}>
            {stocks.map((stock, index) => {
              const isPositive = stock.change >= 0
              const displayPrice = stock.price > 0 ? stock.price.toFixed(2) : 'N/A'
              const displayChange = stock.price > 0 ? (isPositive ? '+' : '') + stock.change.toFixed(2) : 'N/A'
              const displayChangePercent =
                stock.price > 0 ? (isPositive ? '+' : '') + stock.changePercent.toFixed(2) + '%' : 'N/A'

              return (
                <div
                  key={`${stock.symbol}-${index}`}
                  className="flex items-center gap-2 whitespace-nowrap font-semibold"
                  style={{
                    fontSize: 'var(--wsj-font-size-ticker)',
                    fontFamily: 'var(--wsj-font-sans)',
                  }}
                >
                  <span className="text-[var(--wsj-text-black)]">{stock.symbol}</span>
                  <span className="text-[var(--wsj-text-dark-gray)]">{displayPrice}</span>
                  <span
                    className={`font-medium ${isPositive ? 'text-[var(--wsj-green-positive)]' : 'text-[var(--wsj-red-negative)]'}`}
                  >
                    {displayChange} ({displayChangePercent})
                  </span>
                  {isPositive ? (
                    <span className="text-[var(--wsj-green-positive)]">▲</span>
                  ) : (
                    <span className="text-[var(--wsj-red-negative)]">▼</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Scroll right button */}
        <button
          onClick={() => handleScroll('right')}
          className="flex items-center justify-center p-2 hover:bg-[var(--wsj-bg-light-gray)] transition-colors border-l border-[var(--wsj-border-light)]"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-[var(--wsj-text-medium-gray)]" />
        </button>
      </div>
    </div>
  )
}

