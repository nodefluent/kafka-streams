#!/usr/bin/env sh
rm -rf /tmp/kafka-data
mkdir /tmp/kafka-data
mkdir /tmp/kafka-data/data
mkdir /tmp/kafka-data/logs
chmod -R 777 /tmp/kafka-data

BASEDIR=$(git rev-parse --show-toplevel)

if [ -z "$(docker-compose --file ${BASEDIR}/kafka-setup/docker-compose.yml ps -q)" ]; then
	${BASEDIR}/kafka-setup/generate-certs.sh
fi

docker-compose --file ${BASEDIR}/kafka-setup/docker-compose.yml rm
docker-compose --file ${BASEDIR}/kafka-setup/docker-compose.yml up -d
