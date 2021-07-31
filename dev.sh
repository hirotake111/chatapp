# remove kafka containers
docker rm kafka1 kafka2 zookeeper1 zookeeper2

# run all containers
docker-compose up -d
