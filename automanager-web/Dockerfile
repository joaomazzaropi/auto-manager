# ─── Build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependências
COPY package*.json .
RUN npm ci

# Copia e compila o projeto
COPY . .
RUN npm run build

# ─── Runtime com Nginx ────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Remove config padrão e copia a customizada
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# Copia o build do Angular
COPY --from=build /app/dist/automanager-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
