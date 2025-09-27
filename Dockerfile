# ===========================
# Etapa 1: Build de la app
# ===========================
FROM node:22-alpine AS builder

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Instalar dependencias necesarias para compilar (si usas bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo dev para compilar)
RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar el proyecto
RUN npm run build


# ===========================
# Etapa 2: Imagen para producción
# ===========================
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Copiar solo lo necesario desde la etapa anterior
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar la build de la etapa anterior
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto
EXPOSE 3004

# Comando de inicio
CMD ["node", "dist/main.js"]
