#!/usr/bin/env bash
# Update server env file from local file (manual, explicit env sync).
#
# Why this script:
# - Deploy should not silently overwrite server secrets.
# - When you intentionally change env, run this script once.
#
# Features:
# - Upload local env file to server
# - Backup existing target env file with timestamp
# - Handle immutable flag (chattr +i / -i) if present
# - Set 600 permissions on env file
# - Optional PM2 restart with --update-env + pm2 save
#
# Usage examples:
#   ./scripts/update-server-env.sh
#   ./scripts/update-server-env.sh --source .env.production --target .env
#   ./scripts/update-server-env.sh --host fs --remote-path /home/ec2-user/fengshui-layout
#   ./scripts/update-server-env.sh --no-restart

set -euo pipefail

HOST="fs"
REMOTE_PATH="/home/ec2-user/fengshui-layout"
SOURCE_FILE=".env.production"
TARGET_FILE=".env"
RESTART_PM2=1

print_usage() {
	cat <<'EOF'
Usage: scripts/update-server-env.sh [options]

Options:
  --host <ssh-host>            SSH host alias (default: fs)
  --remote-path <path>         Remote project path (default: /home/ec2-user/fengshui-layout)
  --source <local-file>        Local env file to upload (default: .env.production)
  --target <remote-file>       Remote env file name (default: .env)
  --no-restart                 Do not restart PM2 after upload
  -h, --help                   Show this help
EOF
}

while [[ $# -gt 0 ]]; do
	case "$1" in
	--host)
		HOST="${2:-}"
		shift 2
		;;
	--remote-path)
		REMOTE_PATH="${2:-}"
		shift 2
		;;
	--source)
		SOURCE_FILE="${2:-}"
		shift 2
		;;
	--target)
		TARGET_FILE="${2:-}"
		shift 2
		;;
	--no-restart)
		RESTART_PM2=0
		shift
		;;
	-h | --help)
		print_usage
		exit 0
		;;
	*)
		echo "Unknown argument: $1" >&2
		print_usage
		exit 1
		;;
	esac
done

if [[ ! -f "$SOURCE_FILE" ]]; then
	echo "ERROR: source file not found: $SOURCE_FILE" >&2
	exit 1
fi

if [[ ! -s "$SOURCE_FILE" ]]; then
	echo "ERROR: source file is empty: $SOURCE_FILE" >&2
	exit 1
fi

echo "Target host: $HOST"
echo "Remote path: $REMOTE_PATH"
echo "Source file: $SOURCE_FILE"
echo "Target file: $TARGET_FILE"
echo "Restart PM2 : $RESTART_PM2"

ssh -o BatchMode=yes -o ConnectTimeout=10 "$HOST" "echo 'SSH connection ok' >/dev/null"

REMOTE_TMP="/tmp/env-sync-$(date +%s)-$$.tmp"
REMOTE_TARGET="$REMOTE_PATH/$TARGET_FILE"

echo "Uploading env to temporary path on server..."
if scp "$SOURCE_FILE" "$HOST:$REMOTE_TMP"; then
	echo "Upload via scp succeeded."
else
	echo "scp failed; retrying with SSH stream upload..."
	ssh "$HOST" "cat > \"$REMOTE_TMP\"" <"$SOURCE_FILE"
	echo "Upload via SSH stream succeeded."
fi

echo "Applying env on server (with backup + immutable handling)..."
ssh "$HOST" "bash -s" <<EOF
set -euo pipefail

REMOTE_PATH="$REMOTE_PATH"
REMOTE_TMP="$REMOTE_TMP"
REMOTE_TARGET="$REMOTE_TARGET"
RESTART_PM2="$RESTART_PM2"

mkdir -p "\$REMOTE_PATH"
cd "\$REMOTE_PATH"

HAS_IMMUTABLE=0
if [ -f "\$REMOTE_TARGET" ] && command -v lsattr >/dev/null 2>&1; then
  if lsattr "\$REMOTE_TARGET" 2>/dev/null | awk '{print \$1}' | grep -q 'i'; then
    HAS_IMMUTABLE=1
  fi
fi

if [ "\$HAS_IMMUTABLE" -eq 1 ]; then
  sudo chattr -i "\$REMOTE_TARGET" || true
fi

if [ -f "\$REMOTE_TARGET" ]; then
  cp "\$REMOTE_TARGET" "\$REMOTE_TARGET.bak.\$(date +%F-%H%M%S)"
fi

mv "\$REMOTE_TMP" "\$REMOTE_TARGET"
chmod 600 "\$REMOTE_TARGET" || true

if [ "\$HAS_IMMUTABLE" -eq 1 ]; then
  sudo chattr +i "\$REMOTE_TARGET" || true
fi

if [ "\$RESTART_PM2" -eq 1 ]; then
  pm2 restart 0 --update-env
  pm2 save
fi

echo "Done on server."
EOF

echo "Environment update completed."
