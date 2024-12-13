FROM node:20-alpine

RUN mkdir -p home/app
WORKDIR /home/app

COPY package*.json ./ 

# RUN npm install pm2 -g && pm2 install typescript

RUN --mount=type=cache,target=/home/app/.npm \
  npm set cache /home/app/.npm && \
  npm ci

COPY ./src . 

# CMD ["pm2-dev", "./server-dev.config.js", "--only", "APP"]

CMD npx tsc && npm run dev