FROM node:alpine

WORKDIR /discord-star-flute

COPY package.json yarn.lock ./

RUN apk add --no-cache git ffmpeg opus && yarn --prod

COPY . .

CMD ["yarn", "start"]
