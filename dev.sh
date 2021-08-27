# remove kafka containers
docker rm kafka1 kafka2 zookeeper1 zookeeper2

# run all containers
docker-compose up -d

echo "waiting for all containers to be ready..."
sleep 1m

# create kafka topics
# Create topics
docker-compose exec -T kafka1 kafka-topics --create --bootstrap-server localhost:29092 --partitions 1 --topic chat
docker-compose exec -T kafka1 kafka-topics --create --bootstrap-server localhost:29092 --partitions 1 --topic identity

echo "restarting app container"
docker restart app
