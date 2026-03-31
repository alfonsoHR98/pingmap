# 🗺️ PingMap

> Monitor de uptime en tiempo real con visualización geográfica mundial

[![Demo](https://img.shields.io/badge/Demo-Live-green?style=for-the-badge)](http://vps23896.cubepath.net)
[![CubePath](https://img.shields.io/badge/Desplegado%20en-CubePath-00C853?style=for-the-badge&logo=cloud&logoColor=white)](https://cubepath.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?style=for-the-badge&logo=bun)](https://bun.sh)

## 🔗 Demo en vivo

**[http://vps23896.cubepath.net](http://vps23896.cubepath.net)**

## ¿Qué es PingMap?

PingMap es una herramienta open source de monitoreo de uptime que permite agregar cualquier URL o servicio y visualizar su estado en tiempo real sobre un mapa mundial. Cada monitor se verifica automáticamente cada 60 segundos y registra latencia, historial de checks y porcentaje de uptime.

## ✨ Features

- 🌍 **Mapa mundial en tiempo real** — visualiza tus servicios geolocalizados con puntos de colores
- 📊 **Dashboard con historial** — barra de uptime de los últimos 90 checks por monitor
- ⚡ **Métricas en vivo** — latencia promedio, % uptime global y total de checks
- 🔔 **Worker de pings** — proceso independiente que verifica cada servicio cada 60 segundos
- 🌐 **Stats globales** — total de monitores activos, checks realizados y uptime agregado

## 🛠️ Stack técnico

| Tecnología | Uso |
|-----------|-----|
| Next.js 16 + Bun | Frontend y API routes |
| PostgreSQL | Base de datos de monitores y checks |
| Leaflet + React Leaflet | Mapa mundial interactivo |
| PM2 | Gestión de procesos en producción |
| CubePath VPS | Infraestructura de deploy |

## 🚀 Cómo usar CubePath

PingMap está desplegado en un **VPS gp.nano de CubePath** (Houston, Texas) con las siguientes características:

- 1 vCPU / 2GB RAM / 40GB SSD
- Protección AntiDDoS incluida
- Ubuntu 24.04 LTS
- Dominio gratuito: `vps23896.cubepath.net`

El proyecto corre dos procesos via PM2:
1. `pingmap` — servidor Next.js en puerto 3000 (proxied por Nginx)
2. `pingmap-worker` — worker de pings cada 60 segundos

## 🏃 Correr localmente
```bash
# Requisitos: Bun + Docker

git clone https://github.com/alfonsoHR98/pingmap.git
cd pingmap

# Instalar dependencias
bun install

# Levantar base de datos
docker compose up -d

# Variables de entorno
cp .env.example .env.local
# Edita DATABASE_URL en .env.local

# Correr app y worker (terminales separadas)
bun run dev
bun run worker
```

## 📁 Estructura del proyecto
```
pingmap/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← Landing con stats globales
│   │   ├── dashboard/        ← Dashboard de monitores
│   │   ├── map/              ← Mapa mundial
│   │   └── api/              ← API routes (monitors, checks, stats)
│   ├── components/
│   │   ├── MapView.tsx       ← Mapa Leaflet
│   │   └── UptimeBar.tsx     ← Barra de historial
│   └── lib/
│       ├── db.ts             ← Conexión PostgreSQL
│       ├── pinger.ts         ← Lógica de pings
│       └── schema.sql        ← Schema de la DB
├── worker.ts                 ← Worker de pings independiente
└── docker-compose.yml        ← PostgreSQL local
```

## 👤 Autor

**Alfonso Rojas** — [@alfonsoHR98](https://github.com/alfonsoHR98)

Proyecto creado para la [Hackatón CubePath 2026](https://github.com/midudev/hackaton-cubepath-2026) organizada por [midudev](https://midu.dev).