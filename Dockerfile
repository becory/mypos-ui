FROM node
RUN npm install -g http-server
WORKDIR /app/ui
COPY package.json /app/ui

RUN npm install --production
COPY . /app/ui
RUN npm run build:prod

EXPOSE 80
CMD [ "http-server", "dist" ]
