FROM node:12.20-buster

# Install AWS CLI
RUN apt-get update \
    && apt-get -y install python3 curl unzip \
    && cd /tmp \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm awscliv2.zip \
    && rm -rf aws

# Install entrypoint script
COPY docker-entrypoint.sh /opt/reference-backend/bin/docker-entrypoint.sh

RUN chmod +x /opt/reference-backend/bin/docker-entrypoint.sh

# Add sources
COPY config/secrets/keys.json /opt/reference-backend/keys.json
COPY package.json /opt/reference-backend/package.json
COPY package-lock.json /opt/reference-backend/package-lock.json
COPY app.js /opt/reference-backend/dist/app.js
COPY src /opt/reference-backend/dist/src

# Install dependencies
RUN cd /opt/reference-backend \
    && npm install \
    && cd -

# Add metadata
ADD VERSION /VERSION
ADD TAG /TAG

# Run docker-entrypoint.sh start script by default
ENTRYPOINT ["/opt/reference-backend/bin/docker-entrypoint.sh"]
