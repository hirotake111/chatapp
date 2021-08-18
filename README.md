# Chat App

Chat App built on top of Ract/WebSocket/Docker(Kubernetes)

### TODO

- add member button
- notify user when he/she gets added to a new chanel
- test code
- delete channel button
- delete message button

### Build docker image

```bash
# Image for development
./make_image.sh
# Image for production (multi platform)
./make_image.sh # type "prod"
```

---

### Unit testing

Go to each folder and run tests

```bash
# let's say if you want to test api service...
cd api
npm test
```

## Dtabase Design

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
