# Use uma imagem leve do Node.js
FROM node:18-alpine

# Cria a pasta de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências primeiro (para aproveitar o cache do Docker)
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia o restante do código do projeto para dentro do container
COPY . .

# Gera o cliente do Prisma (necessário para o banco funcionar)
RUN npx prisma generate

# Expõe a porta que a API usa
EXPOSE 3000

# O comando de inicialização (será sobrescrito pelo docker-compose, mas é bom ter)
CMD ["npm", "run", "dev"]