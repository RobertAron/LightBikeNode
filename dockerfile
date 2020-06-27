FROM node:14
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 80
EXPOSE 443
ENTRYPOINT [ "npm", "start" ]