ARG IMAGE_REPO
ARG LAGOON_VERSION
FROM ${IMAGE_REPO:-lagoon}/lagoon-varnish:${LAGOON_VERSION}

VOLUME /var/cache/varnish

ENV CACHE_TYPE=file,/var/cache/varnish/file \
    CACHE_SIZE=950M
