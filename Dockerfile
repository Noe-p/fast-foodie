FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration pour installer les dépendances
COPY package.json ./

# Installer toutes les dépendances (y compris devDependencies pour Prisma)
RUN npm install 

# Copier le reste du code source
COPY . .

# Générer le client Prisma et construire l'application Next.js
RUN npx prisma generate && npm run build

# Étape 2 : Préparer l'application pour la production
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires depuis l'étape de construction
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/next-i18next.config.js ./

# Copier et renommer le fichier .env.production en .env
COPY .env.production /app/.env

# Installer uniquement les dépendances de production
RUN npm install

# Exposer le port de l'application
EXPOSE 3000

# Copier le script d'entrée
COPY entrypoint.sh /app/entrypoint.sh

# Rendre le script exécutable
RUN chmod +x /app/entrypoint.sh

# Utiliser le script comme point d'entrée
CMD ["/app/entrypoint.sh"] 

