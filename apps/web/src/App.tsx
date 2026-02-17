import { useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import './App.css'

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {!started ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h1>BarrilitoSpace</h1>
          <button onClick={() => setStarted(true)}>Enter World</button>
        </div>
      ) : (
        <GameCanvas />
      )}
    </div>
  )
}

export default App
