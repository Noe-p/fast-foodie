#!/bin/sh
set -e

# Exécuter les migrations Prisma
npx prisma migrate deploy

# Démarrer l'application avec le fichier standalone
npm run start
