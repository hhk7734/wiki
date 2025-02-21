FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . .
RUN yarn build

FROM nginx:stable-alpine

COPY --from=builder /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]
