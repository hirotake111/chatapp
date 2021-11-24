FROM node:14.17.0 AS builder

#
# Build stage
#
WORKDIR /app
# Copy files
COPY *.json /app/
# Install dev modules
RUN npm install --no-optional
# Copy and compile files
COPY public /app/public
COPY src /app/src
# Build production static files
RUN npm run build

#
# Production stage
#
FROM nginx:1.19.1-alpine 
# Copy files
COPY --from=builder /app/build /usr/share/nginx/html/
