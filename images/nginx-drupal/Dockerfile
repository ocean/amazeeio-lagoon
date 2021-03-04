ARG IMAGE_REPO
ARG LAGOON_VERSION
FROM ${IMAGE_REPO:-lagoon}/lagoon-nginx:${LAGOON_VERSION}

LABEL maintainer="amazee.io"
ENV LAGOON=nginx

RUN mkdir -p /etc/nginx/conf.d/drupal

COPY drupal /etc/nginx/conf.d/drupal/
COPY drupal.conf /etc/nginx/conf.d/app.conf

RUN fix-permissions /etc/nginx
