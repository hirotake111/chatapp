IMAGE=video_chat_frontend-dev
echo "Building a new development image $IMAGE ..."
docker build -t $IMAGE -f Dockerfile-dev .
exit 0
