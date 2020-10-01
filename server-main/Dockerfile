FROM node:14

WORKDIR /server

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY src/ .

RUN NODE_ENV=production npm ci
RUN npm run build
RUN rm -rf src/

CMD ["npm", "start"]
EXPOSE 4000
