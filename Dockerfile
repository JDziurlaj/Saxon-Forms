FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run fetch:w3c
RUN if [ ! -e test-app/w3c-suite ]; then ln -s /app/public-test/w3c-suite /app/test-app/w3c-suite; fi
RUN npm run build:sef

ENV CI=1

CMD ["npm", "run", "test:e2e"]
