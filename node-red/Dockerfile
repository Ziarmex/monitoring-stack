FROM nodered/node-red:latest

USER root
COPY nodered_flows.json /data/flows.json
RUN chown -R node-red:node-red /data
USER node-red
