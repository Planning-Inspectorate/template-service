# Template Service

A template repository for creating new services. This repository includes a basic structure and configuration files covering the common aspects of a service. This includes setup such as:

- ESlint
- Commitlint
- Prettier
- Husky
- Docker
- Prisma

Generally this repo can be copied/cloned for a new project, and a few find+replace runs will get things started:

* Replace 'service-name' with the new service name in the codebase.
* Replace `app-1` with the app name, e.g. `api`
* Replace `app-2` with the app name, e.g. `web`

App 1 is given in the PINS/Public style, App 2 is given in the back office/internal style, with Entra Auth.

## Architecture Diagrams

The following Mermaid diagrams describe the moving parts of a service produced from this template. Replace `service-name`, `app-1` and `app-2` with the real names once the template has been instantiated.

> Note: the database schema (see [packages/database/src/schema.prisma](packages/database/src/schema.prisma)) is intentionally empty in the template, and there is no Azure Service Bus integration in the codebase today. The ER and Service Bus diagrams below show the recommended/expected shape for new services and should be tailored once domain models and event flows are added.

### Resource / Deployment Diagram

High-level Azure topology that a service built from this template is expected to deploy into. The Terraform in [infrastructure/](infrastructure/) currently only provisions the resource groups ([infrastructure/main.tf](infrastructure/main.tf)) — additional resources are layered in per environment.

```mermaid
flowchart LR
	User([End User])
	Internal([Internal User])

	subgraph Edge[Azure Front Door / WAF]
		FD[Front Door]
	end

	subgraph Primary[Resource Group: pins-rg-service-name-ENV uk-south]
		direction TB
		ASP1[App Service: app-1 public]
		ASP2[App Service: app-2 internal]
		REDIS[(Azure Cache for Redis)]
		SQL[(Azure SQL Database)]
		KV[[Key Vault]]
		LAW[(Log Analytics / App Insights)]
	end

	subgraph Secondary[Resource Group: pins-rg-service-name-secondary-ENV uk-west]
		direction TB
		SQLGEO[(SQL Geo-Replica)]
	end

	subgraph Tooling[Tooling Subscription]
		ACR[(Container Registry)]
		VNET[Shared VNet]
	end

	Entra[(Microsoft Entra ID)]

	User --> FD --> ASP1
	Internal --> FD --> ASP2
	ASP1 --> REDIS
	ASP2 --> REDIS
	ASP1 --> SQL
	ASP2 --> SQL
	ASP2 -. OIDC .-> Entra
	ASP1 --> KV
	ASP2 --> KV
	ASP1 --> LAW
	ASP2 --> LAW
	SQL -. geo-replication .-> SQLGEO
	ACR -. image pull .-> ASP1
	ACR -. image pull .-> ASP2
```

### Networking Diagram

Network/trust boundaries and inbound/outbound traffic.

```mermaid
flowchart TB
	subgraph Internet
		PU([Public User])
		IU([Internal User])
	end

	subgraph AFD[Azure Front Door + WAF]
		WAF[WAF Policy]
	end

	subgraph VNet[Service VNet private]
		direction TB
		subgraph SubnetApps[Subnet: app integration]
			A1[app-1 public site]
			A2[app-2 internal site]
		end
		subgraph SubnetData[Subnet: private endpoints]
			PE_SQL[PE - Azure SQL]
			PE_REDIS[PE - Redis]
			PE_KV[PE - Key Vault]
		end
	end

	SQL[(Azure SQL)]
	REDIS[(Redis)]
	KV[[Key Vault]]
	ENTRA[(Entra ID)]

	PU -- HTTPS 443 --> WAF --> A1
	IU -- HTTPS 443 --> WAF --> A2
	A1 -- TDS 1433 --> PE_SQL --> SQL
	A2 -- TDS 1433 --> PE_SQL
	A1 -- TLS 6380 --> PE_REDIS --> REDIS
	A2 -- TLS 6380 --> PE_REDIS
	A1 -- HTTPS --> PE_KV --> KV
	A2 -- HTTPS --> PE_KV
	A2 -- HTTPS OIDC --> ENTRA
```

### Component / Service UML

Class-style view of the runtime composition shared by both apps via [packages/lib](packages/lib/). `BaseService` ([packages/lib/app/base-service.js](packages/lib/app/base-service.js)) owns the cross-cutting clients; each app extends it.

```mermaid
classDiagram
	class BaseService {
		+logger: Logger
		+dbClient: PrismaClient
		+redisClient: RedisClient~null
		+staticDir: string
		+gitSha: string
		+secureSession: boolean
		+sessionSecret: string
	}

	class App1Service {
		+constructor(config)
	}

	class App2Service {
		+authConfig
		+constructor(config)
	}

	class AuthService {
		-config
		-logger
		-redisClient
		-msalClient: ConfidentialClientApplication
		+acquireTokenByCode(opts)
		+acquireTokenSilent(account, sessionId, scopes)
		+getAuthCodeUrl(opts, sessionId)
		+clearCacheForAccount(account, sessionId)
	}

	class RedisClient {
		+makeCachePlugin(sessionId)
	}

	class PrismaClient

	class ExpressApp {
		+use(middleware)
		+listen(port)
	}

	BaseService <|-- App1Service
	BaseService <|-- App2Service
	BaseService o-- RedisClient
	BaseService o-- PrismaClient
	App2Service o-- AuthService
	AuthService o-- RedisClient : MSAL cache
	ExpressApp ..> BaseService : createBaseApp(service)
```

### Request / Auth Sequence (App 2)

End-to-end flow for an authenticated request through `app-2`, exercising session, MSAL and the data layer. See [apps/app-2/src/app/auth/router.js](apps/app-2/src/app/auth/router.js) and [apps/app-2/src/app/auth/auth-service.js](apps/app-2/src/app/auth/auth-service.js).

```mermaid
sequenceDiagram
	autonumber
	actor U as Internal User
	participant FD as Front Door / WAF
	participant APP as app-2 (Express)
	participant SESS as Session Middleware
	participant REDIS as Redis
	participant MSAL as AuthService (MSAL)
	participant ENTRA as Entra ID
	participant DB as Prisma / SQL

	U->>FD: GET /protected
	FD->>APP: forward request
	APP->>SESS: load session
	SESS->>REDIS: GET session:<id>
	REDIS-->>SESS: session blob (or empty)
	alt Not authenticated
		APP->>MSAL: getAuthCodeUrl(nonce, sessionId)
		MSAL-->>APP: redirect URL
		APP-->>U: 302 -> Entra login
		U->>ENTRA: sign in
		ENTRA-->>U: 302 /auth/redirect?code=...
		U->>APP: GET /auth/redirect?code=...
		APP->>MSAL: acquireTokenByCode(code, sessionId)
		MSAL->>ENTRA: token exchange
		ENTRA-->>MSAL: tokens
		MSAL->>REDIS: cache tokens (per session)
		MSAL-->>APP: AuthenticationResult
	end
	APP->>DB: query via PrismaClient
	DB-->>APP: rows
	APP-->>U: rendered Nunjucks page
```

### Data Flow Diagram (DFD)

Logical data movement, classification and trust boundaries.

```mermaid
flowchart LR
	classDef ext fill:#eef,stroke:#447
	classDef store fill:#efe,stroke:#474
	classDef proc fill:#ffe,stroke:#774

	U([Public User]):::ext
	IU([Internal User]):::ext
	ENTRA[(Entra ID)]:::ext

	A1[[app-1: public web]]:::proc
	A2[[app-2: internal web]]:::proc
	LIB[[lib: shared middleware, auth, db, redis]]:::proc

	SESS[(Redis - session + MSAL cache)]:::store
	SQL[(SQL - domain data)]:::store
	LOGS[(App Insights - logs/metrics)]:::store

	U -- form submissions, cookies --> A1
	IU -- form submissions, cookies --> A2
	A1 --> LIB
	A2 --> LIB
	LIB -- session r/w --> SESS
	LIB -- Prisma queries --> SQL
	A2 -- OIDC code/token --> ENTRA
	ENTRA -- id/access tokens --> A2
	A1 -- pino logs --> LOGS
	A2 -- pino logs --> LOGS

	subgraph Trust_Public[Trust boundary: public]
		U
		A1
	end
	subgraph Trust_Internal[Trust boundary: internal/Entra]
		IU
		A2
	end
	subgraph Trust_Data[Trust boundary: data plane]
		SESS
		SQL
		LOGS
	end
```

### Entity Relationship Diagram (template)

The Prisma schema in [packages/database/src/schema.prisma](packages/database/src/schema.prisma) is currently empty. The diagram below is an illustrative starting point — replace with the real domain when models are added.

```mermaid
erDiagram
	USER ||--o{ SESSION : has
	USER {
		uniqueidentifier id PK
		string entraOid
		string email
		datetime createdAt
	}
	SESSION {
		uniqueidentifier id PK
		uniqueidentifier userId FK
		datetime expiresAt
	}
	USER ||--o{ AUDIT_LOG : performs
	AUDIT_LOG {
		uniqueidentifier id PK
		uniqueidentifier userId FK
		string action
		string entityType
		string entityId
		datetime occurredAt
	}
```

### Service Bus Event Flow (recommended pattern)

Not implemented in the template today. Shown here as the recommended pattern when asynchronous integrations are added (e.g. via `@azure/service-bus`).

```mermaid
flowchart LR
	subgraph Producers
		A2[app-2: internal web]
		WORKER1[domain worker / function]
	end

	subgraph SB[Azure Service Bus Namespace]
		direction TB
		T1{{topic: service-name.events}}
		Q1[[queue: service-name.commands]]
		DLQ[[Dead-letter queue]]
	end

	subgraph Consumers
		SUB_AUDIT[[sub: audit]]
		SUB_PROJ[[sub: projections]]
		SUB_EXT[[sub: external-integration]]
	end

	A2 -- publish DomainEvent --> T1
	A2 -- send Command --> Q1
	Q1 --> WORKER1
	T1 --> SUB_AUDIT --> LOGS[(Audit store)]
	T1 --> SUB_PROJ --> SQL[(Read model / SQL)]
	T1 --> SUB_EXT --> EXT[(External system)]
	SUB_EXT -. on failure .-> DLQ
	WORKER1 -. on failure .-> DLQ
```

### CI/CD Pipeline Flow

Mirrors the pipelines under [infrastructure/pipelines/](infrastructure/pipelines/) and the application Dockerfiles ([apps/app-1/Dockerfile](apps/app-1/Dockerfile), [apps/app-2/Dockerfile](apps/app-2/Dockerfile)).

```mermaid
flowchart LR
	DEV[Developer] -- push / PR --> REPO[(GitHub repo)]

	subgraph PR_Checks[PR pipeline]
		LINT[lint + format-check]
		TEST[node --test]
		TFCI[terraform-ci-commit]
	end

	subgraph Main_Build[main pipeline]
		BUILD[build images]
		PUSH[push to ACR]
		TFPLAN[terraform plan]
		TFAPPLY[terraform apply]
		DEPLOY[deploy app-1 / app-2]
	end

	REPO --> LINT --> TEST --> TFCI
	REPO -- merge to main --> BUILD --> PUSH
	PUSH --> TFPLAN --> TFAPPLY --> DEPLOY
	DEPLOY --> ENV[(dev / test / training / prod)]
```
