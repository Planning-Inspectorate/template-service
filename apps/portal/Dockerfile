# Stage 1/2 - Builder
FROM node:24-alpine AS base

#RUN apk update

ARG GIT_SHA

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

COPY packages ./packages
COPY apps/portal ./apps/portal

RUN npm ci --loglevel notice --workspace=service-name-portal --ignore-scripts

ENV NODE_ENV=production
ENV GIT_SHA=$GIT_SHA

RUN npm run build --workspace=service-name-portal
RUN npm run db-generate

# remove dev dependencies now build is done
RUN npm prune --omit=dev --workspace=service-name-portal

# --------------------------------

# Stage 2/2 - App run
FROM node:24-alpine

ARG GIT_SHA

WORKDIR /usr/src/app

COPY --from=base /usr/src/app ./

WORKDIR /usr/src/app/apps/portal

ENV NODE_ENV=production
ENV GIT_SHA=$GIT_SHA

EXPOSE 8080

ENTRYPOINT npm run start
