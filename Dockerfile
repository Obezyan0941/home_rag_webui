FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY ./package*.json .
RUN npm install

COPY ./tsconfig*.json .
COPY ./vite*.ts .
COPY ./eslint*.js .

COPY ./index.html .
COPY ./src/ ./src/
COPY ./public/ ./public/

RUN npm run build


FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install curl -y \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend_app/ ./backend_app/
COPY ./main.py .

COPY --from=frontend-build /frontend/dist ./dist

VOLUME ["/app/data"]

EXPOSE 1024

CMD ["python", "main.py"]
