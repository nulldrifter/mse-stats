import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function App() {
  const [allCards, setAllCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadCardData()
  }, [])

  const loadCardData = async () => {
    try {
      const response = await fetch('/test.xml')
      const xmlText = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      
      const cards = xmlDoc.getElementsByTagName('card')
      const cardData = []
      
      for (let card of cards) {
        const colors = card.querySelector('colors')?.textContent || ''
        const maintype = card.querySelector('maintype')?.textContent || ''
        const name = card.querySelector('name')?.textContent || ''
        
        let colorCategory = 'C'
        if (colors.length === 0) {
          colorCategory = 'C'
        } else if (colors.length === 1) {
          colorCategory = colors
        } else if (colors.length > 1) {
          colorCategory = 'Gold'
        }
        
        cardData.push({
          name: name,
          colors: colors,
          colorCategory: colorCategory,
          maintype: maintype
        })
      }
      
      setAllCards(cardData)
      setFilteredCards(cardData)
      
    } catch (error) {
      console.error('Error loading card data:', error)
    }
  }

  const filterByColor = (colorFilter) => {
    if (!colorFilter) return
    
    setActiveFilter(colorFilter)
    
    if (colorFilter === 'all') {
      setFilteredCards(allCards)
    } else {
      setFilteredCards(allCards.filter(card => card.colorCategory === colorFilter))
    }
  }

  const getChartData = () => {
    const supertypeCounts = {}
    
    filteredCards.forEach(card => {
      const supertype = card.maintype || 'Unknown'
      supertypeCounts[supertype] = (supertypeCounts[supertype] || 0) + 1
    })
    
    const labels = Object.keys(supertypeCounts).sort()
    const data = labels.map(label => supertypeCounts[label])
    
    return {
      labels: labels,
      datasets: [{
        label: 'Number of Cards',
        data: data,
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
          '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
        ],
        borderColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
          '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
        ],
        borderWidth: 1
      }]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Cards by Supertype'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const colorOptions = [
    { id: 'all', label: 'All', icon: '🎯' },
    { id: 'W', label: 'W', icon: '⚪', color: 'text-yellow-600' },
    { id: 'U', label: 'U', icon: '🔵', color: 'text-blue-600' },
    { id: 'B', label: 'B', icon: '⚫', color: 'text-gray-900' },
    { id: 'R', label: 'R', icon: '🔴', color: 'text-red-600' },
    { id: 'G', label: 'G', icon: '🟢', color: 'text-green-600' },
    { id: 'C', label: 'C', icon: '⚙️', color: 'text-gray-500' },
    { id: 'Gold', label: 'Gold', icon: '✨', color: 'text-yellow-500' }
  ]

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">MTG Card Statistics</h1>
        
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Filter by Color</h2>
          <ToggleGroup 
            type="single" 
            value={activeFilter} 
            onValueChange={filterByColor}
            variant="outline"
            className="flex-wrap justify-start gap-1"
          >
            {colorOptions.map(option => (
              <ToggleGroupItem 
                key={option.id} 
                value={option.id}
                className={`flex items-center gap-2 px-3 py-2 ${option.color || ''} data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900 data-[state=on]:border-blue-300`}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-96">
            <Bar data={getChartData()} options={chartOptions} />
          </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <span className="text-lg font-semibold text-gray-700">Total Cards: </span>
            <span className="text-lg font-bold text-blue-600">{filteredCards.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
