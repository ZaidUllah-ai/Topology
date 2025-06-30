FROM node:latest

ENV http_proxy http://10.73.211.145:8080/
ENV https_proxy http://10.73.211.145:8080/

RUN mkdir /frontend
WORKDIR /frontend
COPY . /frontend/
# COPY package.json /frontend/package.json
RUN rm -rf node_modules package-lock.json && npm install
CMD ["npm", "start"]