# remove kafka containers
docker rm kafka1 kafka2 zookeeper1 zookeeper2

# run all containers
docker-compose up -d

echo "waiting for all containers to be ready..."
sleep 3m

echo "restarting app container"
docker restart app
