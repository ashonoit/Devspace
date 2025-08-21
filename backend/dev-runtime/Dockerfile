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

# Copy the .env in so the awscli step can read your credentials
COPY .env .env

# Copy the rest of your application
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Create the workspace directory (initContainer will mount here)
RUN mkdir /workspace

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

# Use the credentials from .env to pull user code from your B2 bucket
RUN aws s3 cp s3://codespace777/spaces/InstantCrush/ /workspace/ \
      --recursive \
      --endpoint-url https://s3.eu-central-003.backblazeb2.com \
      --region eu-central-003

# Tell Docker which ports the app listens on
EXPOSE 3000
EXPOSE 3001

# Finally, run the compiled server
CMD ["node", "dist/index.js"]
