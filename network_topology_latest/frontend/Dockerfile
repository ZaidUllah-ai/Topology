FROM node:latest
RUN mkdir /frontend
WORKDIR /frontend
COPY . /frontend/
# COPY package.json /frontend/package.json
RUN rm -rf node_modules package-lock.json && npm install
CMD ["npm", "start"]