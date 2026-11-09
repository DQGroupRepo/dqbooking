FROM node:14-alpine as frontend-builder
WORKDIR /app/frontend
COPY booking-frontend/booking-frontend/package*.json ./
RUN npm install
RUN npm run build # or the appropriate build command for your frontend