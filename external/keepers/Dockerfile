FROM node:12.20-buster

# Install AWS CLI
RUN apt-get update \
    && apt-get -y install python3 curl unzip \
    && cd /tmp \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip -q awscliv2.zip \
    && ./aws/install \
    && rm awscliv2.zip \
    && rm -rf aws

# Install entrypoint script
COPY docker-entrypoint.sh /opt/keepers/bin/docker-entrypoint.sh

RUN chmod +x /opt/keepers/bin/docker-entrypoint.sh

# Add sources
COPY package.json /opt/keepers/package.json
COPY package-lock.json /opt/keepers/package-lock.json
COPY src /opt/keepers/dist/src

# Install dependencies
RUN cd /opt/keepers \
    && npm install \
    && cd -

# Run docker-entrypoint.sh start script by default
ENTRYPOINT ["/opt/keepers/bin/docker-entrypoint.sh"]
