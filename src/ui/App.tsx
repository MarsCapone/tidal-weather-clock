import { APITester } from './APITester'

import logo from '@/ui/assets/logo.svg'
import reactLogo from '@/ui/assets/react.svg'

export function App() {
  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <div className="flex justify-center items-center gap-8 mb-8">
        <img
          alt="Bun Logo"
          className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
          src={logo}
        />
        <img
          alt="React Logo"
          className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[spin_20s_linear_infinite]"
          src={reactLogo}
        />
      </div>

      <h1 className="text-5xl font-bold my-4 leading-tight">Bun + React</h1>
      <p>
        Edit{' '}
        <code className="dark:bg-[#1a1a1a] px-2 py-1 rounded font-mono">
          src/App.tsx
        </code>{' '}
        and save to test HMR
      </p>
      <APITester />
    </div>
  )
}

export default App
