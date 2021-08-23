# Frontend server

### Build Production image manually

```bash
# Production
IMAGE="PRODUCTION_IMAGE_NAME"
docker build -t $IMAGE .
# or, if you change the URL for WebSocket server...
REACT_APP_WS_URL="WEBSOCEKT_SERVER_URL"
docker build -t $IMAGE --build-arg REACT_APP_WS_URL=${REACT_APP_WS_URL} .

# or build image for multiple archtechtures
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
docker buildx build --push --platform linux/arm/v7,linux/amd64  -t $IMAGE .
```

### Build Development image manually

```bash

./make_image.sh
```
