# Chat App

Chat App built on top of React/WebSocket/Docker(Kubernetes)

### TODO

- add member button
- notify user when he/she gets added to a new chanel
- test code
- delete channel button
- delete message button

The following secrets are necessary to trigger GitHub actions

- DOCKER_USERNAME (credentials to fetch docker image from repository)
- DOCKER_PASSWORD
- KUBE_CONFIG_DATA (YAML based data to deploy imaget to Kubernetes cluster)
- DOCKER_IMAGE_TAG_NAME (used to create image for API service)
- DOCKER_FRONTEND_IMAGE_TAG_NAME (used to crate image for frontend service)
- DEPLOYMENT_NAME (used to deploy API service to Kubernetes cluster)
- DEPLOYMENT_NAME_FRONTEND (used to deploy frontend service)

---

### Unit testing

Go to each folder and run tests

```bash
# let's say if you want to test api service...
cd api
npm test
```
