#!/bin/sh

set -e

realpath2() (
    WORKINGDIR=$PWD

    cd "$(dirname "$1")"
    FILENAME=$(basename "$1")
    LINK=$(readlink "$FILENAME" || true)
    while [ "$LINK" ]; do
        cd "$(dirname "$LINK")"
        FILENAME=$(basename "$LINK")
        LINK=$(readlink "$FILENAME" || true)
    done

    REALPATH="$PWD/$FILENAME"

    cd "$WORKINGDIR"
    echo "$REALPATH"
)

BASEDIR=$(dirname "$(realpath2 "$0")")
