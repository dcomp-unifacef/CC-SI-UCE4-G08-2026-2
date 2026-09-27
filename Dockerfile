FROM node:20-alpine

# Cria o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências de desenvolvimento e produção
RUN npm install

# Copia o restante do código do projeto
COPY . .

# Gera o Prisma Client com as tipagens corretas
RUN npx prisma generate

# Expõe a porta que a aplicação escuta
EXPOSE 3333

# Comando para rodar a aplicação em modo de desenvolvimento
CMD ["npm", "run", "dev"]
