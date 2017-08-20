#!/usr/bin/env sh
BASEDIR=$(git rev-parse --show-toplevel)
docker-compose --file ${BASEDIR}/kafka-setup/docker-compose.yml down
