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

## Database Design

### Users table

| key         | type              | Description     |
| ----------- | ----------------- | --------------- |
| id          | string(UUIDv4) PK | conversation ID |
| username    | string unique     | username        |
| displayName | string unique     | display name    |
| fistName    | string            | fist name       |
| lastName    | string            | last name       |
| createdAt   | datetime required | time created    |
| updatedAt   | datetime required | time updated    |
| deletedAt   | datetime          | time deleted    |

---

### Channel table

| key       | type              | Description  |
| --------- | ----------------- | ------------ |
| id        | string(UUIDv4) PK |              |
| name      | string required   | channel name |
| createdAt | datetime required | time created |
| updatedAt | datetime required | time updated |
| deletedAt | datetime          | time deleted |

---

### Roster table

| key       | type                        | Description  |
| --------- | --------------------------- | ------------ |
| channelId | string (UUIDv4) FK required | channel ID   |
| userId    | string (UUIDv4) FK required | user ID      |
| joinedAt  | datetime required           | time joined  |
| removedAt | datetime                    | time removed |

---

### Messages table

| key       | type                        | Description              |
| --------- | --------------------------- | ------------------------ |
| id        | string(UUIDv4) PK required  | Message ID               |
| channelId | string (UUIDv4) FK required | channel ID it belongs to |
| senderId  | string (UUIDv4) FK required | sender's user ID         |
| content   | string required             | message content itself   |
| createdAt | datetime required           | time created             |
| updatedAt | datetime required           | time updated             |
| deletedAt | datetime                    | time deleted             |
