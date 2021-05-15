# Chat App

### Build docker image

```bash
# Image for development
./make_image.sh
# Image for production (multi platform)
./make_image.sh # type "prod"
```

---

## Dtabase Design

### Users table

| key         | type              | Description     |
| ----------- | ----------------- | --------------- |
| id          | string(UUIDv4) PK | Conversation ID |
| username    | string unique     | Username        |
| displayName | string unique     |                 |
| fistName    | string            |                 |
| lastName    | string            |                 |
| createdAt   | datetime required | time created    |
| updatedAt   | datetime required | time updated    |
| deletedAt   | datetime          | time deleted    |

---

### Conversations table

| key       | type              | Description     |
| --------- | ----------------- | --------------- |
| id        | string(UUIDv4) PK | Conversation ID |
| createdAt | datetime required | time created    |
| deletedAt | datetime          | time deleted    |

---

### Conversations-Users table

| key            | type                        | Description |
| -------------- | --------------------------- | ----------- |
| conversationId | string (UUIDv4) FK required |
| user           | string (UUIDv4) FK required | user ID     |

---

### Messages table

| key            | type                        | Description                |
| -------------- | --------------------------- | -------------------------- |
| id             | string(UUIDv4) PK required  | Message ID                 |
| conversationId | string (UUIDv4) FK required | conversation it belongs to |
| sender         | string (UUIDv4) FK required | sender's user ID           |
| content        | string required             | message content itself     |
| createdAt      | datetime required           | time created               |
| updatedAt      | datetime required           | time updated               |
| deletedAt      | datetime                    | time deleted               |
