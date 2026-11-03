FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm install

COPY . .

RUN npx prisma generate

FROM base AS dev

ENV NODE_ENV=development

EXPOSE 3333

CMD ["npm", "run", "dev"]

FROM base AS build

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts tsconfig.json ./

RUN npm install

COPY --from=build /usr/src/app/dist ./dist

RUN npx prisma generate

EXPOSE 3333

CMD ["npm", "start"]
