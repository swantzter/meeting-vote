ARG BASE_IMAGE="node:14.11.0-buster-slim"

FROM ${BASE_IMAGE} as base

FROM base as runtime_deps
WORKDIR /src
COPY package.json .
COPY package-lock.json .
RUN npm install --production

FROM runtime_deps as dev_deps
RUN npm install

FROM dev_deps as builder
COPY . .
RUN npm run build

FROM base as runner
WORKDIR /app
COPY --from=runtime_deps /src/node_modules /app/node_modules
COPY --from=builder /src/dist /app/dist
CMD ["node", "dist/index.js"]
