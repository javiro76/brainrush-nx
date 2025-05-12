# Etapa de construcción
FROM node:22-alpine AS builder

WORKDIR /app

# Actualizar paquetes del sistema para mitigar vulnerabilidades
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copiar package.json y package-lock.json y archivos de configuración nx
COPY package*.json ./ 
COPY nx.json ./ 
COPY tsconfig.base.json ./ 

# Copiar las definiciones de proyectos para NX
COPY apps/api-gateway/project.json ./apps/api-gateway/ 
COPY libs/ ./libs/ 

# Copiar configuración de ESLint
COPY apps/api-gateway/eslint.config.mjs ./apps/api-gateway/ 
COPY libs/shared/eslint.config.mjs ./libs/shared/ 

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . . 

# Construir la aplicación
RUN npx nx build api-gateway --prod

# Etapa de producción
FROM node:22-alpine

WORKDIR /app

# Actualizar paquetes del sistema para mitigar vulnerabilidades
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copiar los archivos generados de la etapa de construcción
COPY --from=builder /app/dist/apps/api-gateway ./ 
COPY --from=builder /app/node_modules ./node_modules 

# Configurar variables de entorno
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 3333

# Usar dumb-init como punto de entrada para manejar señales correctamente
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Comando para ejecutar la aplicación
CMD ["node", "main.js"]
