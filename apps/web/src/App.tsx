import { useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { JoinForm } from './components/JoinForm'
import './App.css'

function App() {
  const [username, setUsername] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!username ? (
        <JoinForm onJoin={(name) => setUsername(name)} />
      ) : (
        <GameCanvas username={username} />
      )}
    </div>
  )
}

export default App
