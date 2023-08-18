#!/bin/sh

realpath2() (
    OURPWD=$PWD
    cd "$(dirname "$1")"
    LINK=$(readlink "$(basename "$1")")
    while [ "$LINK" ]; do
        cd "$(dirname "$LINK")"
        LINK=$(readlink "$(basename "$1")")
    done
    REALPATH="$PWD/$(basename "$1")"
    cd "$OURPWD"
    echo "$REALPATH"
)

BASEDIR=$(dirname $(realpath2 "$0"))

set -e

skopeo login docker.io
buildah bud --tag wiki-loliot-net:1.0 -f $BASEDIR/../deploy/Dockerfile $BASEDIR/../
skopeo copy containers-storage:localhost/wiki-loliot-net:1.0 docker://hhk7734/wiki-loliot-net:1.0
