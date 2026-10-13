# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# Public values are embedded during next build; never pass secrets as build args.
ARG NEXT_PUBLIC_SITE_URL=https://ibanscan.com
ARG NEXT_PUBLIC_CONTACT_EMAIL=""
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_CONTACT_EMAIL=${NEXT_PUBLIC_CONTACT_EMAIL}
ARG NEXT_PUBLIC_OPERATOR_NAME=""
ENV NEXT_PUBLIC_OPERATOR_NAME=${NEXT_PUBLIC_OPERATOR_NAME}
ARG NEXT_PUBLIC_OPERATOR_ADDRESS=""
ENV NEXT_PUBLIC_OPERATOR_ADDRESS=${NEXT_PUBLIC_OPERATOR_ADDRESS}
ARG NEXT_PUBLIC_OPERATOR_VAT_ID=""
ENV NEXT_PUBLIC_OPERATOR_VAT_ID=${NEXT_PUBLIC_OPERATOR_VAT_ID}
ARG NEXT_PUBLIC_OPERATOR_PEC=""
ENV NEXT_PUBLIC_OPERATOR_PEC=${NEXT_PUBLIC_OPERATOR_PEC}
ARG NEXT_PUBLIC_HOSTING_PROVIDER=""
ENV NEXT_PUBLIC_HOSTING_PROVIDER=${NEXT_PUBLIC_HOSTING_PROVIDER}
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=6s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health',{signal:AbortSignal.timeout(5000)}).then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]

