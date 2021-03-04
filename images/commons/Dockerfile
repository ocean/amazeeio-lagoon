ARG ALPINE_VERSION
FROM alpine:${ALPINE_VERSION}

LABEL maintainer="amazee.io"

ENV LAGOON=commons

COPY lagoon/ /lagoon/
RUN mkdir -p /lagoon/bin
COPY fix-permissions docker-sleep /bin/
COPY .bashrc /home/.bashrc

RUN apk update \
    && apk upgrade \
    && apk add --no-cache curl tini \
    && rm -rf /var/cache/apk/* \
    && curl -sLo /bin/ep https://github.com/ocean/envplate/releases/download/1.0.0-rc2/ep-linux-arm64 \
    && echo "e8e7a5b2617f7edb3c0aadc78637a52e75a7a0db75976d97f9fa617c79e3982b0672753bd3c8b2165684735265d9549e81250cfe62124d61d455c4fbdb670a83  /bin/ep" | sha512sum -c \
    && chmod +x /bin/ep \
    && curl -sLo /lagoon/bin/cron https://github.com/webdevops/go-crond/releases/download/20.7.0/go-crond-arm64-linux \
    && echo "18716e7164fc302305fb495aa342e1ad162a82b48f4c190a5d967ff4e5b50cdd980b1d9fb55caca4ea1b94dcaf085d8c7076453c5287aeea5953fc93b81bb21a  /lagoon/bin/cron" | sha512sum -c \
    && chmod +x /lagoon/bin/cron \
    && mkdir -p /lagoon/crontabs && fix-permissions /lagoon/crontabs \
    && ln -s /home/.bashrc /home/.profile

RUN chmod g+w /etc/passwd

ARG LAGOON_VERSION
RUN echo $LAGOON_VERSION > /lagoon/version
ENV LAGOON_VERSION=$LAGOON_VERSION

ENV TMPDIR=/tmp \
    TMP=/tmp \
    HOME=/home \
    # When Bash is invoked via `sh` it behaves like the old Bourne Shell and sources a file that is given in `ENV`
    ENV=/home/.bashrc \
    # When Bash is invoked as non-interactive (like `bash -c command`) it sources a file that is given in `BASH_ENV`
    BASH_ENV=/home/.bashrc

ENTRYPOINT ["/sbin/tini", "--", "/lagoon/entrypoints.sh"]
CMD ["/bin/docker-sleep"]