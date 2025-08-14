# 1. Base image
FROM node:20

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy rest of the project
COPY . .

# 6. Exposing port
###[CHANGE PORT HERE]
EXPOSE 6969

# 7. Starting our server
CMD ["node", "server.js"]
