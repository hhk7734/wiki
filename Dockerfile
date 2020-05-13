FROM node:lts

WORKDIR /wiki
COPY packag*.json ./
RUN sed -i "s/deb http:\/\/security.debian.org\/debian-security.*//g" /etc/apt/sources.list
RUN apt-get update && apt-get install curl gnupg gnupg2 apt-transport-https ca-certificates -y
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn -y
RUN yarn install
COPY . .

RUN echo $(wc -c node_modules/@docusaurus/mdx-loader/src/remark/rightToc/search.js)

RUN wc -c node_modules/@docusaurus/mdx-loader/src/remark/rightToc/search.js | grep 1776 -q && mv custom_node_modules/search.js node_modules/@docusaurus/mdx-loader/src/remark/rightToc/search.js || echo "\n\nUpdate custom_node_modules/search.js\n\n"

RUN echo $(wc -c node_modules/@docusaurus/mdx-loader/src/index.js)

RUN wc -c node_modules/@docusaurus/mdx-loader/src/index.js | grep 1930 -q && mv custom_node_modules/index.js node_modules/@docusaurus/mdx-loader/src/index.js || echo "\n\nUpdate custom_node_modules/index.js\n\n"

RUN yarn build

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=0 /wiki/build/ .

CMD ["nginx", "-g", "daemon off;"]