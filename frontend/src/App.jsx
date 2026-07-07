import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [podName, setPodName] = useState('nginx-bf68ddf7d-b2fc8')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPrediction = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict/memory/${podName}`)
      const data = await response.json()
      if (response.ok) {
        setPrediction(data)
      } else {
        setError(data.error || 'Unknown error')
      }
    } catch (err) {
      setError('Failed to connect to backend. Is Flask running?')
    }
    setLoading(false)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchPrediction()
    const interval = setInterval(fetchPrediction, 30000)
    return () => clearInterval(interval)
  }, [podName])

  const getRiskColor = (level) => {
    if (level === 'HIGH') return '#ff4444'
    if (level === 'MEDIUM') return '#ffaa00'
    return '#00cc66'
  }

  const getTrendIcon = (trend) => {
    return trend === 'increasing' ? '📈' : '➡️'
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      color: '#e2e8f0'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        marginBottom: '10px',
        background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🔮 Predictive SRE
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
        AI-powered incident prediction for Kubernetes
      </p>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        backgroundColor: '#1e293b',
        padding: '20px',
        borderRadius: '12px'
      }}>
        <input
          type="text"
          value={podName}
          onChange={(e) => setPodName(e.target.value)}
          placeholder="Enter pod name"
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #334155',
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            fontSize: '1rem'
          }}
        />
        <button
          onClick={fetchPrediction}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#7f1d1d',
          color: '#fecaca',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {prediction && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Risk Card */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '24px',
            borderRadius: '12px',
            borderLeft: `4px solid ${getRiskColor(prediction.risk_level)}`
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Risk Assessment</h2>
              <span style={{
                backgroundColor: getRiskColor(prediction.risk_level),
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                {prediction.risk_level}
              </span>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px',
              fontSize: '0.9rem',
              color: '#94a3b8'
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', color: '#e2e8f0', fontWeight: 'bold' }}>
                  {prediction.predicted_percent_of_limit}%
                </div>
                <div>Predicted Memory Usage</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', color: '#e2e8f0', fontWeight: 'bold' }}>
                  {getTrendIcon(prediction.trend)} {prediction.trend}
                </div>
                <div>Trend Direction</div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px' 
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '8px' }}>
                Current Memory
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {(prediction.current_memory_bytes / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>

            <div style={{
              backgroundColor: '#1e293b',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '8px' }}>
                Predicted (30m)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {(prediction.predicted_memory_bytes_30m / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>

          {/* Pod Info */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            color: '#94a3b8'
          }}>
            Monitoring pod: <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{prediction.pod}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
