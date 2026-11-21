#!/usr/bin/env bash
# Validate block markup with both package sets: the target WordPress (7.0) and the latest Gutenberg.
# Usage: bash check.sh [--data <dir>] <file> [file...]
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
status=0
node "$HERE/validate.mjs" --set wp-7.0 "$@" || status=1
node "$HERE/validate.mjs" --set latest "$@" || status=1
exit $status
