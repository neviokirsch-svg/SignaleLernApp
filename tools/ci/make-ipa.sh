#!/bin/bash
# Builds an unsigned IPA. xtool or Sideloadly sign it with the real Apple account when installing.
set -euo pipefail

output_dir="${1:-build/ipa}"
mkdir -p "$output_dir"
archive="$output_dir/SignaleLernApp.xcarchive"
xcodebuild archive -project SignaleLernApp.xcodeproj -scheme SignaleLernApp \
    -configuration Release -destination 'generic/platform=iOS' \
    -archivePath "$archive" CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO

stage="$(mktemp -d "${TMPDIR:-/tmp}/signale-ipa.XXXXXX")"
trap 'rm -rf "$stage"' EXIT
mkdir -p "$stage/Payload"
ditto "$archive/Products/Applications/SignaleLernApp.app" "$stage/Payload/SignaleLernApp.app"
codesign --force --sign - "$stage/Payload/SignaleLernApp.app"
codesign --verify --deep --strict "$stage/Payload/SignaleLernApp.app"
ditto -c -k --keepParent "$stage/Payload" "$output_dir/SignaleLernApp.ipa"
ls -lh "$output_dir/SignaleLernApp.ipa"
