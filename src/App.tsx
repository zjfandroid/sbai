import { useState, useCallback } from 'react'
import { IntroScreen } from './components/IntroScreen'
import { TestScreen } from './components/TestScreen'
import { ResultScreen } from './components/ResultScreen'
import type { ComputeResult } from './lib/compute'

export type Screen = 'intro' | 'test' | 'result'

function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [result, setResult] = useState<ComputeResult | null>(null)

  const handleStart = useCallback(() => {
    setResult(null)
    setScreen('test')
  }, [])

  const handleSubmit = useCallback((computeResult: ComputeResult) => {
    setResult(computeResult)
    setScreen('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleBackToHome = useCallback(() => {
    setScreen('intro')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="shell">
      {screen === 'intro' && <IntroScreen onStart={handleStart} />}
      {screen === 'test' && <TestScreen onSubmit={handleSubmit} onBackHome={handleBackToHome} />}
      {screen === 'result' && result && (
        <ResultScreen result={result} onRestart={handleStart} onBackHome={handleBackToHome} />
      )}
    </div>
  )
}

export default App
