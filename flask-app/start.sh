#!/bin/bash
app="docker.test"
docker build -t ${app} .
docker run -d -p 5600:80 \
  --name=${app} \
  ${app}
