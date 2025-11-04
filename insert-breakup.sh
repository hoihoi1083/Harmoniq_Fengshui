#!/bin/bash

# Insert after line 6306 (after enhancedResult = await enhancedAnalyzer.analyzeMessage(message);)

sed -i '.backup3' '6306 a\
\
// 🔧 優先檢查分手選擇 - 在處理enhancedResult之前\
if (isBreakupChoice && userIntent?.primaryConcern === "感情") {\
console.log("💔 檢測到分手選擇，檢查是否有分手菜單:", message);\
const chatHistory = await ChatHistory.findOne({\
$or: [{ conversationId: sessionId }, { sessionId: sessionId }],\
});\
const hasBreakupMenu = chatHistory?.messages?.some(\
(msg) =>\
msg.role === "assistant" &&\
(msg.content.includes("A. 剛分手") || msg.content.includes("A. 刚分手"))\
);\
if (hasBreakupMenu) {\
console.log("✅ 發現分手菜單，使用line 3993的handler");\
// 設置enhancedResult為null，讓代碼跳過enhanced處理\
// 繼續執行到line 3953的breakup handler\
enhancedResult = { isEnhanced: false };\
}\
}
' src/app/api/smart-chat2/route.js

echo "✅ Breakup check inserted"
