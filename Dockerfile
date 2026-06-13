# Stage 1 — build do Vue/Vite
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# Stage 2 — servir com nginx
FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

# curl é necessário para o HEALTHCHECK HTTP
RUN apk add --no-cache curl

RUN rm -rf ./*

COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fs http://localhost/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
