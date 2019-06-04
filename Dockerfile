FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm i

CMD ["node", "app.js"]