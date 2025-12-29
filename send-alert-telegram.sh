#!/bin/bash
# Telegram Bot Alert System
# More reliable than email on AWS EC2

ALERT_EMAIL="hoihoi1083@gmail.com"  # For logging purposes
SUBJECT="$1"
MESSAGE="$2"
SERVER_NAME=$(hostname)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S UTC')

# Telegram Bot Configuration (you'll need to set these up)
# Instructions: Message @BotFather on Telegram to create a bot
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN_HERE"  # Get from @BotFather
TELEGRAM_CHAT_ID="YOUR_CHAT_ID_HERE"      # Get from @userinfobot

ALERT_TEXT="🚨 *FENG SHUI LAYOUT ALERT*

*Server:* \`$SERVER_NAME\`
*Time:* $TIMESTAMP
*Alert:* $SUBJECT

$MESSAGE

_Check logs: ssh fs 'tail -100 ~/fengshui-layout/logs/health-check.log'_"

# Send to Telegram
if [ "$TELEGRAM_BOT_TOKEN" != "YOUR_BOT_TOKEN_HERE" ]; then
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID" \
        -d "text=$ALERT_TEXT" \
        -d "parse_mode=Markdown" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo "✓ Alert sent via Telegram"
    else
        echo "⚠️  Telegram delivery failed"
    fi
else
    echo "⚠️  Telegram not configured"
    echo "   1. Message @BotFather on Telegram"
    echo "   2. Create new bot with /newbot"
    echo "   3. Get your chat ID from @userinfobot"
    echo "   4. Update this script with your bot token and chat ID"
fi

# Always log to file as backup
LOG_FILE=~/fengshui-layout/logs/critical-alerts.log
mkdir -p ~/fengshui-layout/logs
{
    echo "========================================"
    echo "[$TIMESTAMP] $SUBJECT"
    echo "Server: $SERVER_NAME"
    echo ""
    echo "$MESSAGE"
    echo ""
} >> "$LOG_FILE"

echo "✓ Alert logged to: $LOG_FILE"
echo ""
echo "💡 Recommended: Set up Telegram bot for instant alerts!"
echo "   AWS EC2 blocks email SMTP, but Telegram works perfectly."
