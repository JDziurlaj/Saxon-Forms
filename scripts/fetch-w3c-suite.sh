#!/usr/bin/env bash
# Fetch the W3C XForms 1.1 Test Suite and extract into public-test/w3c-suite/
#
# Usage:
#   ./scripts/fetch-w3c-suite.sh           # skips if already present
#   ./scripts/fetch-w3c-suite.sh --force   # re-downloads and replaces

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$PROJECT_ROOT/public-test/w3c-suite"
ZIP_URL="https://www.w3.org/MarkUp/Forms/Test/XForms1.1/Edition1/zip/TestCases11.zip"
STRIP_PREFIX="Test/XForms1.1/Edition1/"

FORCE=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

# Skip if content already exists (unless --force)
if [[ -d "$TARGET_DIR/Chapt02" ]] && [[ "$FORCE" == "false" ]]; then
  echo "W3C test suite already present in $TARGET_DIR (use --force to refresh)"
  exit 0
fi

echo "Downloading W3C XForms 1.1 Test Suite..."
TMPZIP="$(mktemp /tmp/TestCases11.XXXXXX.zip)"
trap 'rm -f "$TMPZIP"' EXIT

curl -fsSL -o "$TMPZIP" "$ZIP_URL"

# Clean target directory
if [[ -d "$TARGET_DIR" ]]; then
  echo "Cleaning existing $TARGET_DIR..."
  rm -rf "$TARGET_DIR"
fi
mkdir -p "$TARGET_DIR"

echo "Extracting to $TARGET_DIR..."
# Extract and strip the 3-level prefix
unzip -q -o "$TMPZIP" -d "$TARGET_DIR"
# Move contents from nested prefix to target root
mv "$TARGET_DIR"/${STRIP_PREFIX}* "$TARGET_DIR/" 2>/dev/null || true
# Clean up the empty prefix directories
rm -rf "$TARGET_DIR/Test"

echo "W3C test suite extracted successfully ($(find "$TARGET_DIR" -name '*.xhtml' | wc -l) xhtml files)"
