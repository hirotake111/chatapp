
if [ "$1" == "prod" ]; then
    echo "Building production image"
    if [ ! $IMAGE ]; then
        echo "You need to set IMAGE environment variable before kicking this off"
        exit 1
    fi
    # Need to register qemu interpreters with binfmt_misc by hand.
    echo "================"
    docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
    echo "================"
    docker buildx build --push --platform linux/arm/v7,linux/amd64  -t $IMAGE .
    exit 0

else
    echo "Building development image"
    echo "================"
    npm run prebuild
    if [ $? -ne 0 ]; then
        echo "================"
        echo "ERROR COMPILING TYPESCRIPT"
        exit 1
    fi
    echo "================"
    echo "COMPILE STEP SUCCEEDED."
    IMAGE=video_chat_api-dev
    docker build -t $IMAGE -f Dockerfile-dev .
    exit 0
fi

echo "unrecognized parameter passed - stop processing"