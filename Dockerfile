FROM node:22-alpine

# Define a imagem oficial de Node.js 22 sobre Alpine como base do contêiner.
# Cria o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os manifestos para instalar as dependências antes de copiar a aplicação.
COPY package*.json ./
# Inclui o schema e as migrações necessários durante a preparação do Prisma.
COPY prisma ./prisma/

# Instala as dependências declaradas, incluindo ferramentas usadas no modo de desenvolvimento.
RUN npm install

# Copia o restante do projeto para o diretório de trabalho da imagem.
COPY . .

# Gera o cliente tipado conforme o schema do Prisma incluído na imagem.
RUN npx prisma generate

# Documenta a porta HTTP publicada pela API (a publicação efetiva é feita pelo Compose).
EXPOSE 3333

# Inicia o script de desenvolvimento definido no package.json.
CMD ["npm", "run", "dev"]
