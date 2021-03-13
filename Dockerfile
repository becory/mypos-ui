FROM node

WORKDIR /app/ui
COPY package.json /app/ui

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]