FROM node:22.8-bullseye

RUN yarn install
RUN npm run build

COPY . /build

WORKDIR /

CMD ["node", "main.js"]