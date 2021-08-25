# Chat App

### TODO

- xxxx

### Build a docker image

```bash
# Image for development
./make_dev_image.sh

# Image for production (multi platform)
docker build -t "<image name>" .
```

---

### Unit testing

Go to each folder and run tests

```bash
npm test
```

### Environment Variables

These environment variables are required for the image to run

- SECRETKEY
- OAUTH_CLIENTID
- OAUTH_CLIENTSECRET
- HOSTNAME
- PORT
- ISSUER
- FRONTEND_URL
- CALLBACK_URL
- DATABASE_URI
- NODE_ENV
- REDIS_URL
- KAFKA_CLIENT_ID
- KAFKA_BROKERS (kafka1:9092,kafka2:9092)
- KAFKA_GROUP_ID
- KAFKA_TOPIC_NAME
- REACT_APP_WS_URL
