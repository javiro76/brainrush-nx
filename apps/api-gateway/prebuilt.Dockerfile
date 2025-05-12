# Dockerfile para usar con builds pre-construidos (optimizado para despliegue)
FROM node:20-alpine

WORKDIR /app

# Actualizar paquetes del sistema para mitigar vulnerabilidades
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copiar solo los archivos necesarios para la producción
COPY dist/apps/api-gateway ./
COPY node_modules ./node_modules

# Configurar variables de entorno
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 3333

# Usar dumb-init como punto de entrada para manejar señales correctamente
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Comando para ejecutar la aplicación
CMD ["node", "main.js"]
