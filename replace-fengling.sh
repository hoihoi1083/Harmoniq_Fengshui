#!/bin/bash

# Script to replace 風鈴 (Wind Chime character) → 小鈴 (Little Bell)
# Context-aware: Only replaces character name, NOT feng shui objects

echo "🔄 Starting character name replacement: 風鈴 → 小鈴"
echo "================================================"

# Backup count
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "✅ Created backup directory: $BACKUP_DIR"

# Find all files
FILES=$(find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" \))

COUNT=0
for FILE in $FILES; do
    if grep -q "風鈴\|风铃" "$FILE"; then
        # Create backup
        cp "$FILE" "$BACKUP_DIR/$(basename $FILE).bak"
        
        # Traditional Chinese replacements (context-aware)
        sed -i '' \
            -e 's/風鈴說/小鈴說/g' \
            -e 's/風鈴覺得/小鈴覺得/g' \
            -e 's/風鈴來幫/小鈴來幫/g' \
            -e 's/風鈴為你/小鈴為你/g' \
            -e 's/風鈴的身份/小鈴的身份/g' \
            -e 's/風鈴的語氣/小鈴的語氣/g' \
            -e 's/風鈴的特色/小鈴的特色/g' \
            -e 's/讓風鈴/讓小鈴/g' \
            -e 's/告訴風鈴/告訴小鈴/g' \
            -e 's/我是風鈴/我是小鈴/g' \
            -e 's/你是風鈴/你是小鈴/g' \
            -e 's/專業且親切的風鈴/專業且親切的小鈴/g' \
            -e 's/風鈴親切專業/小鈴親切專業/g' \
            -e 's/風鈴給你/小鈴給你/g' \
            -e 's/風鈴來/小鈴來/g' \
            -e 's/風鈴幫你/小鈴幫你/g' \
            -e 's/風鈴會/小鈴會/g' \
            -e 's/風鈴可/小鈴可/g' \
            -e 's/風鈴發現/小鈴發現/g' \
            -e 's/風鈴看了/小鈴看了/g' \
            -e 's/風鈴用/小鈴用/g' \
            -e 's/風鈴為/小鈴為/g' \
            -e 's/風鈴溫馨提醒/小鈴溫馨提醒/g' \
            -e 's/風鈴正在/小鈴正在/g' \
            -e 's/風鈴已經/小鈴已經/g' \
            -e 's/風鈴聊天室/風鈴聊天室/g' \
            -e 's/咦～風鈴/咦～小鈴/g' \
            -e 's/哇～風鈴/哇～小鈴/g' \
            -e 's/alt="風鈴/alt="小鈴/g' \
            -e 's/風鈴 Character/小鈴 Character/g' \
            -e 's/includes("風鈴")/includes("小鈴")/g' \
            -e "s/includes('風鈴')/includes('小鈴')/g" \
            -e 's/風鈴\[/小鈴[/g' \
            -e 's/Remove 風鈴/Remove 小鈴/g' \
            "$FILE"
        
        # Simplified Chinese replacements
        sed -i '' \
            -e 's/风铃说/小铃说/g' \
            -e 's/风铃觉得/小铃觉得/g' \
            -e 's/风铃来帮/小铃来帮/g' \
            -e 's/风铃为你/小铃为你/g' \
            -e 's/风铃的身份/小铃的身份/g' \
            -e 's/风铃的语气/小铃的语气/g' \
            -e 's/风铃的特色/小铃的特色/g' \
            -e 's/让风铃/让小铃/g' \
            -e 's/告诉风铃/告诉小铃/g' \
            -e 's/我是风铃/我是小铃/g' \
            -e 's/你是风铃/你是小铃/g' \
            -e 's/专业且亲切的风铃/专业且亲切的小铃/g' \
            -e 's/风铃亲切专业/小铃亲切专业/g' \
            -e 's/风铃给你/小铃给你/g' \
            -e 's/风铃来/小铃来/g' \
            -e 's/风铃帮你/小铃帮你/g' \
            -e 's/风铃会/小铃会/g' \
            -e 's/风铃可/小铃可/g' \
            -e 's/风铃发现/小铃发现/g' \
            -e 's/风铃看了/小铃看了/g' \
            -e 's/风铃用/小铃用/g' \
            -e 's/风铃为/小铃为/g' \
            -e 's/风铃温馨提醒/小铃温馨提醒/g' \
            -e 's/风铃正在/小铃正在/g' \
            -e 's/风铃已经/小铃已经/g' \
            -e 's/风铃聊天室/小铃聊天室/g' \
            -e 's/咦～风铃/咦～小铃/g' \
            -e 's/哇～风铃/哇～小铃/g' \
            -e 's/alt="风铃/alt="小铃/g' \
            -e 's/风铃 Character/小铃 Character/g' \
            -e 's/includes("风铃")/includes("小铃")/g' \
            -e "s/includes('风铃')/includes('小铃')/g" \
            -e 's/风铃\[/小铃[/g' \
            -e 's/Remove 风铃/Remove 小铃/g' \
            "$FILE"
        
        COUNT=$((COUNT + 1))
        echo "✓ Updated: $FILE"
    fi
done

echo ""
echo "================================================"
echo "✅ Replacement complete!"
echo "📊 Files updated: $COUNT"
echo "💾 Backups saved to: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT: Review the changes before committing:"
echo "   git diff src/"
echo ""
echo "🔍 Verify no feng shui objects were changed:"
echo "   grep -r '小鈴\|小铃' src/ | grep -E '金屬|擺放|放置'"
