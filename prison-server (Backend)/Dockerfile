# Node.js base image (lightweight version)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json files first (to cache dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other files
COPY . .

# Port on which the backend runs
EXPOSE 5000

# Command to run when the container starts
CMD ["node", "server.js"]