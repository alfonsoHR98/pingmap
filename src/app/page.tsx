import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Ping<span className="text-green-400">Map</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-md">
          Monitorea tus servicios en tiempo real y visualízalos en un mapa mundial
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Ir al Dashboard
        </Link>
        <Link
          href="/map"
          className="border border-zinc-700 hover:border-zinc-500 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Ver Mapa
        </Link>
      </div>

      <div className="text-zinc-600 text-sm">
        Desplegado en{' '}
        <a href="https://cubepath.com" target="_blank" className="text-green-600 hover:text-green-400">
          CubePath
        </a>
      </div>
    </main>
  )
}