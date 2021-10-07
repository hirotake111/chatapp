# Chat App

Portofolio chat app built on top of

client side:

- React / Redux (TypeScript)
- Rest API / WebSocket

server side:

- NodeJS (TypeScript)
- Docker(Kubernetes)
- Kafka
- Redis
- Open ID Connect ([repo](https://github.com/hirotake111/oidc-provider-typescript))
- Rest API / WebSocket
- and Raspberry PI

Currently mobile device is not supported.

### TODO

- unread message notification
- pagenation
- disable [add user] button if user belongs no channels
- Redis for WebScoket backend
- test code
- delete channel button
- delete message button

The following secrets are necessary to trigger GitHub actions

- DOCKER_USERNAME (credentials to fetch docker image from repository)
- DOCKER_PASSWORD
- KUBE_CONFIG_DATA (YAML based data to deploy imaget to Kubernetes cluster)
- DOCKER_IMAGE_TAG_NAME_API (used to create image for API service)
- DOCKER_IMAGE_TAG_NAME_FRONTEND (used to crate image for frontend service)
- DEPLOYMENT_NAME_API (used to deploy API service to Kubernetes cluster)
- DEPLOYMENT_NAME_FRONTEND
- DEPLOYMENT_NAME_API (deployment/name_of_deployment)
- DEPLOYMENT_NAME_FRONTEND
- REACT_APP_WS_URL (URL pointing WebSocket server)
- KUBE_CONTAINER_NAME_API (container name)
- KUBE_CONTAINER_NAME_FRONTEND

---

### Unit testing

Go to each folder and run tests

```bash
# let's say if you want to test api service...
cd api
npm test
```
