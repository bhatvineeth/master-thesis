FROM openjdk:8-jdk-alpine
VOLUME /tmp
COPY target/gts.jar gts.jar
EXPOSE 8080
ENTRYPOINT exec java -jar gts.jar --guacd-host 172.17.0.2 --guacd-port 4822 --port 8080
# For Spring-Boot project, use the entrypoint below to reduce Tomcat startup time.
#ENTRYPOINT exec java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar thesis.jar
