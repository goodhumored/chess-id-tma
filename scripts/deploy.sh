#!/bin/bash

set -a
source .env.production
set +a

docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
  --build-arg NEXT_PUBLIC_API_SECRET=$NEXT_PUBLIC_API_SECRET \
  -t $DOCKER_IMAGE_NAME . && \
docker push $DOCKER_IMAGE_NAME