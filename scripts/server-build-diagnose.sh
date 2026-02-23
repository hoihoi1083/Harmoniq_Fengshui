#!/bin/bash
# Run this ON THE SERVER (e.g. ssh fs 'bash -s' < scripts/server-build-diagnose.sh)
# to capture why "npm run build" exits with no error message.
set -e
cd /home/ec2-user/fengshui-layout || exit 1
export NODE_OPTIONS="--max-old-space-size=2048"
echo "=== Node ==="
node -v
echo "=== npm run build (output below) ==="
npm run build 2>&1
BUILD_EXIT=$?
echo "=== Build exit code: $BUILD_EXIT (0=ok, 1=error, 137=OOM killed) ==="
echo "=== Last 30 kernel messages (look for OOM or kill) ==="
dmesg 2>/dev/null | tail -30 || true
echo "=== Done ==="
exit $BUILD_EXIT
