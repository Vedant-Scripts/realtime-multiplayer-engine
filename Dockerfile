# STAGE 1 : BUILDER STAGE
FROM node:24-slim AS builder

# Enable Corepack (built into Node)  for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files for caching
COPY backend/nakama/package.json backend/nakama/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy rest of the files
COPY backend/nakama .

# Build
RUN pnpm build


# ---------- Stage 2: Nakama ----------
FROM heroiclabs/nakama:3.37.0

# Copy built files from builder
COPY --from=builder /app/build /nakama/data/modules

EXPOSE 7350

# Start Nakama
CMD ["/bin/sh", "-ecx", "\
    until /nakama/nakama migrate up --database.address $DATABASE_ADDRESS; do \
    echo 'Waiting for Postgres...'; \
    sleep 2; \
    done; \
    exec /nakama/nakama \
    --name nakama1 \
    --database.address $DATABASE_ADDRESS \
    --logger.level DEBUG \
    --session.token_expiry_sec 7200 \
    --runtime.path /nakama/data/modules \
    --runtime.js_entrypoint index.js \
    "]