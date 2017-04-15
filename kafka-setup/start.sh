#!/usr/bin/env bash
sudo rm -rf /tmp/kafka-data/data/*
sudo rm -rf /tmp/kafka-data/logs/*
sudo chmod -R 777 /tmp/kafka-data
docker-compose up -d