FROM node:18-alpine AS builder
WORKDIR /app

COPY . .
RUN yarn

RUN yarn build

FROM nginx:stable-alpine

COPY --from=builder /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
