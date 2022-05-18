FROM node:16.15.0

WORKDIR /wiki
RUN sed -i "s/deb http:\/\/security.debian.org\/debian-security.*//g" /etc/apt/sources.list
RUN apt-get update && apt-get install curl gnupg gnupg2 apt-transport-https ca-certificates -y
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn -y

COPY . .
RUN yarn install

RUN yarn build

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=0 /wiki/build/ .

CMD ["nginx", "-g", "daemon off;"]
