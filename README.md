# Demo Domain App - Local Development

## Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose

### Run Locally

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/info
- **Backend Health**: http://localhost:3001/api/health

### Test Internal Networking

```bash
# Exec into frontend container
docker exec -it demo-frontend sh

# Test backend connection from frontend
wget -qO- http://backend:3001/api/info
# Should return JSON response

exit
```

### Verify Network

```bash
# Check network
docker network ls | grep demo-network

# Inspect network
docker network inspect demo-network

# Should see both containers connected
```

### Clean Up

```bash
# Stop and remove containers, networks
docker-compose down

# Also remove images
docker-compose down --rmi all

# Remove volumes (if any)
docker-compose down -v
```

## Architecture

```
┌─────────────────────────────────────┐
│       demo-network (bridge)         │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Frontend   │  │   Backend   │ │
│  │  :3000       │→ │   :3001     │ │
│  └──────────────┘  └─────────────┘ │
│         ↑               ↑           │
└─────────┼───────────────┼───────────┘
          │               │
    localhost:3000   localhost:3001
```

**Key Points:**
- Frontend calls backend via `http://backend:3001` (service name)
- Same as Kubernetes: `http://backend.demo-domain.svc.cluster.local`
- Both containers in same network → Internal communication
- External access via localhost ports

## Development Workflow

### Code Changes

**Backend changes:**
```bash
# Rebuild only backend
docker-compose up --build backend

# Or
docker-compose restart backend
```

**Frontend changes:**
```bash
# Rebuild only frontend
docker-compose up --build frontend
```

### Debug

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

## Differences from Kubernetes

| Aspect | Docker Compose | Kubernetes |
|--------|---------------|------------|
| Network | `backend:3001` | `backend.demo-domain.svc.cluster.local` |
| Replicas | 1 container each | 2 pods each |
| Load Balancer | None | Service (ClusterIP) |
| Auto-restart | `restart: always` | `restartPolicy: Always` |
| Health checks | Docker healthcheck | Liveness/Readiness probes |

## Troubleshooting

### Frontend can't connect to backend

```bash
# Check backend is healthy
docker-compose ps

# Test backend directly
curl http://localhost:3001/api/health

# Check network
docker network inspect demo-network

# Check backend logs
docker-compose logs backend
```

### Port already in use

```bash
# Stop conflicting services
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill

# Or change ports in docker-compose.yml
ports:
  - "3002:3000"  # Different host port
```

### Rebuild from scratch

```bash
# Remove everything
docker-compose down --rmi all -v

# Rebuild
docker-compose up --build
```
