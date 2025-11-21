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
* If required, replace `portal` with another app name, or remove it if not required
* If required, replace `manage` with another app name, or remove it if not required
* If not required, then remove the `apps/function` code

'Portal' app is given in the PINS/Public style. 'Manage' app is given in the back office/internal style, with Entra Auth.

## Getting started

* install latest LTS Node
* install Docker
* `npm i`
* `docker compose up` (to start a database)
* copy `packages/database/.env.example` to `.env`
* copy `apps/manage/.env.example` to `.env`
* copy `apps/portal/.env.example` to `.env`
* Get the `AUTH_*` env vars from a dev and add to `apps/manage/.env` (or set `AUTH_DISABLED=false`)
* run `npm run db-migrate-dev` to setup the database
* run `apps/manage>npm run dev` to start the manage app
* run `apps/portal>npm run dev` to start the portal app

## WebStorm Run Configurations

Run configurations are included for most of the npm scripts. Node and npm must be configured for the project for them to work.
Go to Settings > Languages and Frameworks > Node.js and set the Node interpreter and package manager.
