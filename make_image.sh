echo -n "prod or dev? (dev): "
read $VAR

if [ "$VAR" == "prod" ]; then
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

elif [ "$VAR" == "dev" ] || [ -z $VAR ]; then
    echo "================"
    npm run prebuild
    if [ $? -ne 0 ]; then
        echo "================"
        echo "ERROR COMPILING TYPESCRIPT"
        exit 1
    fi
    echo "================"
    echo "COMPILE STEP SUCCEEDED."
    docker build -t myapp -f Dockerfile-dev .
    exit 0
fi

echo "unrecognized parameter passed - stop processing"