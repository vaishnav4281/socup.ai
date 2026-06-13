FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Apollo GraphQL Gateway default port
EXPOSE 4000 
CMD ["npm", "run", "dev"]
