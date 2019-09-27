FROM node:8-slim

WORKDIR /starter
ENV NODE_ENV development

COPY package.json /starter/package.json

RUN npm install --production

COPY .env.example /starter/.env.example
COPY . /starter

RUN npm install -g nodemon

EXPOSE 8080
