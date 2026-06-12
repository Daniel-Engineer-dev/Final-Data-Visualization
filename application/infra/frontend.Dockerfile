FROM node:22-alpine
WORKDIR /workspace/application/frontend
COPY application/frontend/package*.json ./
RUN npm install
COPY application/frontend .
CMD ["npm", "run", "dev"]
