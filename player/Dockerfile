FROM node:alpine

WORKDIR ./player

COPY package.json yarn.lock ./

RUN apk add --no-cache git ffmpeg opus && yarn --prod

COPY ./src ./src

CMD ["yarn", "start"]
