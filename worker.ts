import { pingAllMonitors } from './src/lib/pinger'

console.log('🟢 Worker de pings iniciado')

async function run() {
  console.log(`[${new Date().toISOString()}] Ejecutando pings...`)
  await pingAllMonitors()
}

// Corre inmediatamente y luego cada 60 segundos
run()
setInterval(run, 60_000)