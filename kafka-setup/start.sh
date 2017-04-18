#!/usr/bin/env bash
sudo rm -rf /tmp/kafka-data
sudo mkdir /tmp/kafka-data
sudo mkdir /tmp/kafka-data/data
sudo mkdir /tmp/kafka-data/logs
sudo chmod -R 777 /tmp/kafka-data
docker-compose rm
docker-compose up -d
