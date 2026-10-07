# --- Stage 1: Build the application ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the React application for production (generates static files)
RUN npm run build

# --- Stage 2: Serve the application using Nginx ---
FROM nginx:alpine

# Copy the generated static files from the build stage to the Nginx web directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]