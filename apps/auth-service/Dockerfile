# Etapa de construcción
FROM node:22-alpine AS builder

WORKDIR /app

# Actualizar paquetes del sistema para mitigar vulnerabilidades
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copiar package.json y package-lock.json
COPY package*.json ./
COPY nx.json .
COPY tsconfig.base.json .

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npx nx build auth-service --prod

# Generar el cliente de Prisma para producción
RUN cd apps/auth-service && npx prisma generate

# Etapa de producción
FROM node:22-alpine

WORKDIR /app

# Actualizar paquetes del sistema para mitigar vulnerabilidades
RUN apk update && apk upgrade && apk add --no-cache dumb-init python3 make g++

# Copiar los archivos generados de la etapa de construcción
COPY --from=builder /app/dist/apps/auth-service ./
COPY --from=builder /app/apps/auth-service/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar package.json y package-lock.json para reinstalar dependencias
COPY --from=builder /app/package.json /app/package-lock.json ./

# Instalar solo las dependencias de producción
RUN npm ci --only=production

# Generar el cliente de Prisma en el contenedor de producción
RUN npx prisma generate

# Instalar Prisma CLI para migraciones
RUN npm install -g prisma

# Configurar variables de entorno
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 3334

# Usar dumb-init como punto de entrada para manejar señales correctamente
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Comando para ejecutar la aplicación
CMD ["/bin/sh", "-c", "prisma migrate deploy && node main.js"]
