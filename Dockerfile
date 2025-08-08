# Use a Node.js base image that has apt and can install Chromium
FROM node:20-slim

# Install Chromium and its necessary system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fontconfig \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libasound2 \
    libnss3 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy the rest of your application code
COPY . .

# Change to the subdirectory where your server.js is located
WORKDIR /app/scrapping

# Expose the port your Express app is listening on (using 10000 from your Dockerfile)
EXPOSE 10000

# Command to run your application when the container starts
CMD ["node", "server.js"]