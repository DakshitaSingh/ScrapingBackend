# Use a standard Node.js 18 image based on Debian Buster
FROM node:18-buster

# Set the working directory
WORKDIR /usr/src/app

# [FIX] Install necessary tools and add Google Chrome's official repository
RUN apt-get update && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

# [FIX] Install the official stable version of Google Chrome and required fonts
RUN apt-get update && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of your application code
COPY . .

# Expose the port your app will run on
EXPOSE 3001

# Define the command to run your app
CMD [ "npm", "start" ]