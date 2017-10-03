#!/usr/bin/env sh
PASSWORD="nodesinek"
CN_HOST="localhost"
SERVER_KEYSTORE_JKS="docker.kafka.server.keystore.jks"
SERVER_KEYSTORE_P12="docker.kafka.server.keystore.p12"
SERVER_KEYSTORE_PEM="docker.kafka.server.keystore.pem"
SERVER_TRUSTSTORE_JKS="docker.kafka.server.truststore.jks"
CLIENT_TRUSTSTORE_JKS="docker.kafka.client.truststore.jks"
echo "Clearing existing Kafka SSL certs..."

BASEDIR=$(git rev-parse --show-toplevel)

rm -rf ${BASEDIR}/certs
mkdir ${BASEDIR}/certs
(
echo "Generating new Kafka SSL certs in \"${BASEDIR}/certs\" folder..."
cd ${BASEDIR}/certs
keytool -keystore $SERVER_KEYSTORE_JKS -alias localhost -validity 730 -genkey -storepass $PASSWORD -keypass $PASSWORD \
  -dname "CN=${CN_HOST}, OU=None, O=None, L=Cologne, S=Cologne, C=DE"
openssl req -new -x509 -keyout ca-key -out ca-cert -days 730 -passout pass:$PASSWORD \
   -subj "/C=DE/S=Cologne/L=Cologne/O=None/OU=None/CN=${CN_HOST}"
keytool -keystore $SERVER_TRUSTSTORE_JKS -alias CARoot -import -file ca-cert -storepass $PASSWORD -noprompt
keytool -keystore $CLIENT_TRUSTSTORE_JKS -alias CARoot -import -file ca-cert -storepass $PASSWORD -noprompt
keytool -keystore $SERVER_KEYSTORE_JKS -alias localhost -certreq -file cert-file -storepass $PASSWORD -noprompt
openssl x509 -req -CA ca-cert -CAkey ca-key -in cert-file -out cert-signed -days 730 -CAcreateserial -passin pass:$PASSWORD
keytool -keystore $SERVER_KEYSTORE_JKS -alias CARoot -import -file ca-cert -storepass $PASSWORD -noprompt
keytool -keystore $SERVER_KEYSTORE_JKS -alias localhost -import -file cert-signed -storepass $PASSWORD -noprompt
keytool -importkeystore -srckeystore $SERVER_KEYSTORE_JKS -destkeystore $SERVER_KEYSTORE_P12 -srcstoretype JKS -deststoretype PKCS12 -srcstorepass $PASSWORD -deststorepass $PASSWORD -noprompt
# PEM for KafkaCat
openssl pkcs12 -in $SERVER_KEYSTORE_P12 -out $SERVER_KEYSTORE_PEM -nodes -passin pass:$PASSWORD
chmod +rx *
)
