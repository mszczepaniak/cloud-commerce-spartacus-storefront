#!/usr/bin/env bash
set -e

function usage() {
    echo "Usage: `basename $0` -v [major | minor | patch | premajor | preminor | prepatch | prerelease] --preid [prerelease-id]"
}

if [ $# == 0 ]; then
    usage
    exit
fi

while [[ $# -gt 0 ]]
do
    case $1 in
        -v | --version )
            shift
            BUMP=$1
        ;;
        --preid )
            shift
            preid=$1
        ;;
        -h | --help )
            usage
            exit 0
        ;;
        * )
            usage
            exit 1
    esac
    shift
done

PROJECT="styles"
PROJECT_DIR="projects/storefrontstyles"

BUMP_COMMAND="npm version $BUMP"
PUBLISH_CMD="npm publish ."

if [[ $BUMP =~ pre* ]]; then
    PUBLISH_CMD="$PUBLISH_CMD --tag next"

    if [[ -z $preid ]]; then
        echo "WARNING: No prerelease id was specified"
    else
        BUMP_COMMAND="$BUMP_COMMAND --preid=$preid"
    fi
fi

pushd $PROJECT_DIR

echo "Bumping $PROJECT version to $BUMP"
echo "Bump command: $BUMP_COMMAND"

PROJECT_NEW_VERSION=`$BUMP_COMMAND`

echo "New version: $PROJECT_NEW_VERSION"

echo "publishing version $PROJECT_NEW_VERSION"
echo "Publishing command: $PUBLISH_CMD"
# published=${PUBLISH_CMD}
published=''

popd

if [[ -z "$published" ]]; then
    NEW_VERSION=${PROJECT_NEW_VERSION:1}
    TAG="$PROJECT-$NEW_VERSION"
    RELEASE_BRANCH="release/$TAG"

    git checkout -b $RELEASE_BRANCH

    git commit -am"Bumping $PROJECT version to $PROJECT_NEW_VERSION"
    echo "Tagging new version $TAG"
    git tag $TAG
    echo "Pushing release branch from $PWD"
    # git push -u origin $RELEASE_BRANCH --tags
else
    echo 'Error publishing package to npm. Reverting package bump and aborting. Please rebuild your library'
    (cd $PROJECT_DIR && git checkout package.json)
    exit 1
fi

echo "Deployment of styles lib successful"
