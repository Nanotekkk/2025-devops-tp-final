# Reverse Proxy Architecture

This document explains how the reverse proxy works in different deployment scenarios for the Christmas Gift List application.

## Overview

The frontend is a static React application that needs to communicate with the backend API. Since they are deployed separately, we need reverse proxies to route API requests from the frontend to the backend.

## Reverse Proxy Flow

### Platform-Level Proxy (Production Deployment)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Proxy as Platform Proxy
    participant API as API Server<br/>(Backend)
    participant DB as Database

    User->>Browser: Visit application
    Browser->>Proxy: GET /
    Proxy->>Browser: Return index.html + React app

    Browser->>Browser: User adds a person
    Browser->>Proxy: POST /api/people

    Note over Proxy: Platform redirect rule triggers
    Proxy->>API: POST https://backend-url/api/people
    API->>DB: INSERT INTO people
    DB->>API: Success
    API->>Proxy: 201 Created
    Proxy->>Browser: 201 Created
    Browser->>User: Show success message
```

## Architecture Diagrams

### Platform-Level Proxy (Managed Hosting)

```mermaid
graph TB
    subgraph "Client"
        Browser[Web Browser]
    end

    subgraph "Static Hosting Platform"
        Static[Static Files<br/>HTML, JS, CSS]
        Redirect[Proxy/Redirect Rules<br/>Configuration File]
    end

    subgraph "Backend Host"
        API[API Server<br/>:8080]
        DB[(Database)]
    end

    Browser -->|"GET /"| Static
    Browser -->|"POST /api/people"| Redirect
    Redirect -->|"Proxy to backend URL"| API
    API --> DB

    style Redirect fill:#f9f,stroke:#333,stroke-width:4px
```

## Request Routing Matrix

| Scenario             | Request Path  | Proxy Configuration     | Backend URL                        | How It Works                         |
| -------------------- | ------------- | ----------------------- | ---------------------------------- | ------------------------------------ |
| **Platform Hosting** | `/api/people` | Platform redirect rules | `https://backend-url/api/people`   | Platform CDN intercepts and forwards |
| **Docker Compose**   | `/api/people` | Web server config file  | `http://backend:8080/api/people`   | Reverse proxy within Docker network  |
| **Local Dev Server** | `/api/people` | Dev server proxy config | `http://localhost:8080/api/people` | Dev server built-in proxy            |

## Implementation Details

### Platform-Level Proxy Configuration

**Configuration file location:** Root of project or platform-specific location

**Example configuration:**

```
# Redirect/proxy rule
from = "/api/*"
to = "https://your-backend-url/api/:splat"
status = 200      # Return backend response (not redirect)
force = true      # Override other rules
```

**How it works:**

1. User visits the application
2. React app loads in browser
3. App makes request to `/api/people`
4. Platform CDN intercepts the request
5. Rewrites URL to backend URL
6. Forwards request to backend
7. Returns backend response to browser
8. Browser thinks it came from same origin
