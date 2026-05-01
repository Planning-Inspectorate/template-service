infra

# Infrastructure

This folder contains the infrastructure-as-code (using Terraform) for this project.

## Pipelines

There are two pipelines, one for static checks during PR, and one to plan and apply the infrastructure. These are based on common-pipeline-templates.

## Environments

Differences between environments are managed with simple tfvars files, found in the `environments` folder.

## Common Variables

Variables with common values across environments are set in the `terraform.tfvars` file, which Terraform looks for automatically.

<https://developer.hashicorp.com/terraform/language/values/variables#variable-definitions-tfvars-files>

---

## Diagrams

The following diagrams describe what is currently wired up in this folder. The Terraform here is intentionally minimal — it provisions a primary and secondary resource group ([main.tf](main.tf)), reads a shared tooling VNet via a `data` source ([data.tf](data.tf)), and resolves region metadata via the `claranet/regions/azurerm` module ([regions.tf](regions.tf)). Per-service resources (App Services, SQL, Redis, Key Vault, etc.) are expected to be added on top.

### File / Module Layout

How the `.tf` files in this folder relate to each other and to the inputs Terraform consumes at plan time.

```mermaid
flowchart LR
	subgraph Inputs[Variable inputs]
		TFV[terraform.tfvars<br>tooling_config]
		ENVDIR[environments/*.tfvars<br>environment = dev,test,training,prod]
	end

	VARS[variables.tf<br>- environment<br>- tooling_config]
	LOCALS[locals.tf<br>org, service_name,<br>resource_suffix, tags]
	PROV[providers.tf<br>azurerm + azurerm.tooling<br>backend azurerm]
	DATA[data.tf<br>client_config<br>tooling VNet]
	REG[regions.tf<br>primary_region<br>secondary_region]
	MAIN[main.tf<br>azurerm_resource_group.primary<br>azurerm_resource_group.secondary]

	TFV --> VARS
	ENVDIR --> VARS
	VARS --> LOCALS
	VARS --> PROV
	VARS --> DATA
	LOCALS --> REG
	LOCALS --> MAIN
	REG --> MAIN
	PROV --> DATA
	PROV --> MAIN
```

### Resource Graph (what gets created)

What `terraform apply` actually produces today, and what it reads from the tooling subscription.

```mermaid
flowchart TB
	subgraph Tooling[Tooling subscription read-only]
		TVNET[(data: pins-vnet-shared-tooling-uks)]
		ACR[(Container Registry<br>pinscrsharedtoolinguks)]
	end

	subgraph Service[Service subscription per environment]
		direction TB
		RG1[azurerm_resource_group.primary<br>pins-rg-service-name-ENV<br>uk-south]
		RG2[azurerm_resource_group.secondary<br>pins-rg-service-name-secondary-ENV<br>uk-west]
	end

	REG1[[module.primary_region<br>claranet/regions uk-south]]
	REG2[[module.secondary_region<br>claranet/regions uk-west]]

	REG1 -- location --> RG1
	REG2 -- location --> RG2
	TVNET -. referenced via data .-> Service
	ACR -. image source for app deploys .-> Service
```

### State Backend

Terraform state for this folder is stored in a shared storage account in the tooling subscription. The container/key are supplied per environment at `terraform init` time by the CD pipeline.

```mermaid
flowchart LR
	DEV[Developer / Pipeline] -- terraform init --> INIT{{backend azurerm}}
	INIT --> SA[(Storage Account<br>pinssttfstateuksservice-name<br>RG: pins-rg-shared-terraform-uks)]
	SA --> CDEV[[container: terraform-state-service-name-dev]]
	SA --> CTEST[[container: terraform-state-service-name-test]]
	SA --> CTRAIN[[container: terraform-state-service-name-training]]
	SA --> CPROD[[container: terraform-state-service-name-prod]]
	CDEV --> KDEV[(key: dev.tfstate)]
	CTEST --> KTEST[(key: test.tfstate)]
	CTRAIN --> KTRAIN[(key: training.tfstate)]
	CPROD --> KPROD[(key: prod.tfstate)]
```

### Environments & Variable Resolution

How a single Terraform configuration produces four distinct environments.

```mermaid
flowchart LR
	COMMON[terraform.tfvars<br>auto-loaded<br>tooling_config = ...]

	subgraph Envs[environments/]
		E1[dev.tfvars<br>environment = dev]
		E2[test.tfvars]
		E3[training.tfvars]
		E4[prod.tfvars]
	end

	TF[Terraform plan/apply<br>-var-file env file]

	COMMON --> TF
	E1 --> TF
	E2 --> TF
	E3 --> TF
	E4 --> TF

	TF --> OUT1[pins-rg-service-name-dev]
	TF --> OUT2[pins-rg-service-name-test]
	TF --> OUT3[pins-rg-service-name-training]
	TF --> OUT4[pins-rg-service-name-prod]
```

### Providers

Two `azurerm` providers are configured: a default one targeting the service subscription (taken from the pipeline's service connection) and an aliased one for read-only access to tooling resources.

```mermaid
flowchart LR
	subgraph Config[providers.tf]
		P1[provider azurerm<br>default]
		P2[provider azurerm<br>alias = tooling]
	end

	SC[Service subscription<br>service connection]
	TC[Tooling subscription<br>var.tooling_config.subscription_id]

	P1 --> SC
	P2 --> TC

	SC --> RG[Resource groups,<br>future service resources]
	TC --> VNET[(data.azurerm_virtual_network.tooling)]
```

### Pipelines

The three pipeline definitions in [pipelines/](pipelines/) and how they relate to commits, PRs and environments.

```mermaid
flowchart LR
	DEV[Developer] -- PR --> GH[(GitHub PR)]
	DEV -- merge to main --> MAIN[(main branch)]

	subgraph PR_Stage[On PR / merge queue]
		COMMIT[terraform-ci-commit.yaml<br>commitlint]
		CI[terraform-ci.yaml<br>fmt / validate / tflint<br>common-pipeline-templates<br>terraform_checks.yml]
	end

	subgraph CD_Stage[On main, sequential]
		direction TB
		CD[terraform-cd.yaml<br>terraform_plan_apply.yml]
		D[Dev]
		T[Test]
		TR[Training]
		P[Prod]
		CD --> D --> T --> TR --> P
	end

	GH --> COMMIT
	GH --> CI
	MAIN -- pipeline trigger<br>source: Infrastructure PR --> CD
```

### Plan/Apply Flow per Environment

What happens inside the CD pipeline for a single environment stage.

```mermaid
sequenceDiagram
	autonumber
	participant ADO as Azure DevOps
	participant SC as Service Connection<br>(per env)
	participant TF as Terraform CLI
	participant SA as TF State Storage<br>(tooling sub)
	participant AZ as Azure (service sub)
	participant TOOL as Azure (tooling sub)

	ADO->>TF: terraform init<br>-backend-config container/key for ENV
	TF->>SA: lock + read ENV.tfstate
	ADO->>TF: terraform plan -var-file=environments/ENV.tfvars
	TF->>AZ: read existing resources (default provider)
	TF->>TOOL: read VNet via azurerm.tooling
	TF-->>ADO: plan output (artifact)
	ADO->>ADO: approval gate (Test/Training/Prod)
	ADO->>TF: terraform apply saved plan
	TF->>AZ: create/update resource groups
	TF->>SA: write updated ENV.tfstate, release lock
	TF-->>ADO: apply summary
```

### Naming Convention

How `locals.tf` composes resource names so every environment is consistent.

```mermaid
flowchart LR
	ORG[org = pins]
	SVC[service_name = service-name]
	ENV[var.environment]
	SUFFIX[resource_suffix<br>= service-name-ENV]
	SUFFIX2[secondary_resource_suffix<br>= service-name-secondary-ENV]

	ORG --> NAME1[pins-rg-service-name-ENV<br>primary RG, uk-south]
	SVC --> SUFFIX --> NAME1
	ENV --> SUFFIX
	ENV --> SUFFIX2
	SVC --> SUFFIX2 --> NAME2[pins-rg-service-name-secondary-ENV<br>secondary RG, uk-west]
	ORG --> NAME2

	TAGS[tags:<br>CreatedBy = terraform<br>Environment = ENV<br>ServiceName = service-name<br>location = uk-south]
	ENV --> TAGS
	SVC --> TAGS
	NAME1 --> TAGS
	NAME2 --> TAGS
```
