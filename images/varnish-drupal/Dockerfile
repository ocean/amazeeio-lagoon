ARG IMAGE_REPO
ARG LAGOON_VERSION
FROM ${IMAGE_REPO:-lagoon}/lagoon-varnish:${LAGOON_VERSION}

COPY drupal.vcl /etc/varnish/default.vcl

RUN fix-permissions /etc/varnish/default.vcl
