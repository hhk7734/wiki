FROM node:lts

WORKDIR /wiki
COPY packag*.json ./
RUN sed -i "s/deb http:\/\/security.debian.org\/debian-security.*//g" /etc/apt/sources.list
RUN apt update && apt install curl gnupg gnupg2 apt-transport-https ca-certificates -y
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install yarn -y
RUN yarn install
COPY . .

RUN wc -c node_modules/@docusaurus/mdx-loader/src/remark/rightToc/search.js | grep 1776 -q && mv search.js node_modules/@docusaurus/mdx-loader/src/remark/rightToc/search.js

RUN yarn build

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=0 /wiki/build/ .

CMD ["nginx", "-g", "daemon off;"]