FROM node:lts

WORKDIR /wiki
COPY packag*.json ./
RUN apt update && apt install curl gnupg gnupg2 apt-transport-https ca-certificates -y
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install yarn -y
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=0 /wiki/build/ .

CMD ["nginx", "-g", "daemon off;"]