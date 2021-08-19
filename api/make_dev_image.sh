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
