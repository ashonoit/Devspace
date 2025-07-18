# Use Node.js 20 as the base image
FROM node:20

# Set our working directory
WORKDIR /code

# Install the native build tools for node-pty
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
 && rm -rf /var/lib/apt/lists/*

# Install AWS CLI separately so we can call `aws s3 cp`
RUN apt-get update && apt-get install -y awscli \
 && rm -rf /var/lib/apt/lists/*

# Copy only the package files first, so npm install can be cached
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Create the workspace directory (initContainer will mount here)
RUN mkdir /workspace

# Tell Docker which ports the app listens on
EXPOSE 3000
EXPOSE 3001

# Finally, run the compiled server
CMD ["node", "dist/index.js"]
