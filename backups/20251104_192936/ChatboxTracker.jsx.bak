"use client";
import { useEffect } from "react";
import FengShuiMixpanel from "@/lib/mixpanel";

export default function ChatboxTracker() {
	useEffect(() => {
		let chatSessionId = null;
		let messageCount = 0;
		let sessionStartTime = null;

		// 生成聊天會話 ID
		const generateSessionId = () => {
			return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		};

		// 追蹤聊天會話開始
		const trackChatSessionStart = () => {
			chatSessionId = generateSessionId();
			sessionStartTime = new Date();
			messageCount = 0;

			FengShuiMixpanel.track("聊天會話開始", {
				會話ID: chatSessionId,
				開始時間: sessionStartTime.toISOString(),
				聊天頁面: window.location.pathname,
				用戶類型: "已登入", // 可根據實際登入狀態調整
			});

			console.log(`💬 聊天會話開始: ${chatSessionId}`);
		};

		// 追蹤文字輸入行為
		const trackTextInput = () => {
			const textareas = document.querySelectorAll("textarea");

			textareas.forEach((textarea) => {
				let typingTimer = null;
				let isTyping = false;
				let inputStartTime = null;

				// 開始輸入
				const handleInputStart = () => {
					if (!isTyping) {
						isTyping = true;
						inputStartTime = new Date();

						FengShuiMixpanel.track("開始輸入訊息", {
							會話ID: chatSessionId,
							輸入開始時間: inputStartTime.toISOString(),
							當前訊息數: messageCount,
						});
					}
				};

				// 停止輸入
				const handleInputStop = () => {
					if (isTyping && inputStartTime) {
						const inputDuration = new Date() - inputStartTime;
						isTyping = false;

						FengShuiMixpanel.track("停止輸入訊息", {
							會話ID: chatSessionId,
							輸入時長: inputDuration,
							訊息長度: textarea.value.length,
							包含中文: /[\u4e00-\u9fa5]/.test(textarea.value),
						});
					}
				};

				// 監聽輸入事件
				textarea.addEventListener("input", () => {
					handleInputStart();

					// 清除之前的計時器
					clearTimeout(typingTimer);

					// 設置新的計時器，2秒後認為停止輸入
					typingTimer = setTimeout(handleInputStop, 2000);
				});

				textarea.addEventListener("focus", () => {
					FengShuiMixpanel.track("聚焦輸入框", {
						會話ID: chatSessionId,
						聚焦時間: new Date().toISOString(),
					});
				});

				textarea.addEventListener("blur", handleInputStop);
			});
		};

		// 追蹤發送按鈕點擊
		const trackSendButton = () => {
			const sendButtons = document.querySelectorAll("button");

			sendButtons.forEach((button) => {
				// 尋找包含 Send 圖標或相關類名的按鈕
				const hasSendIcon =
					button.querySelector("svg") ||
					button.innerHTML.includes("Send") ||
					button.className.includes("send");

				if (hasSendIcon) {
					button.addEventListener("click", (e) => {
						const textarea = document.querySelector("textarea");
						const messageText = textarea?.value || "";

						if (messageText.trim()) {
							messageCount++;

							FengShuiMixpanel.track("發送聊天訊息", {
								會話ID: chatSessionId,
								訊息編號: messageCount,
								訊息長度: messageText.length,
								訊息類型: "用戶訊息",
								包含中文: /[\u4e00-\u9fa5]/.test(messageText),
								包含英文: /[a-zA-Z]/.test(messageText),
								包含數字: /\d/.test(messageText),
								發送方式: "點擊按鈕",
								發送時間: new Date().toISOString(),
							});

							console.log(
								`📤 發送訊息 #${messageCount}: ${messageText.substring(0, 50)}...`
							);
						}
					});
				}
			});
		};

		// 追蹤鍵盤發送 (Enter 鍵)
		const trackKeyboardSend = () => {
			document.addEventListener("keydown", (e) => {
				if (e.key === "Enter" && !e.shiftKey) {
					const textarea = e.target;
					if (textarea.tagName === "TEXTAREA") {
						const messageText = textarea.value || "";

						if (messageText.trim()) {
							messageCount++;

							FengShuiMixpanel.track("發送聊天訊息", {
								會話ID: chatSessionId,
								訊息編號: messageCount,
								訊息長度: messageText.length,
								訊息類型: "用戶訊息",
								包含中文: /[\u4e00-\u9fa5]/.test(messageText),
								發送方式: "Enter鍵",
								發送時間: new Date().toISOString(),
							});

							console.log(
								`⌨️ Enter發送訊息 #${messageCount}: ${messageText.substring(0, 50)}...`
							);
						}
					}
				}
			});
		};

		// 追蹤 AI 回應
		const trackAIResponses = () => {
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							// 檢測 AI 回應 (包含風鈴、AI等關鍵字)
							const isAIResponse =
								node.textContent &&
								(node.textContent.includes("風鈴") ||
									node.textContent.includes("AI") ||
									node.querySelector('img[alt*="風鈴"]') ||
									node.className?.includes("assistant"));

							if (isAIResponse) {
								FengShuiMixpanel.track("收到AI回應", {
									會話ID: chatSessionId,
									AI回應長度: node.textContent?.length || 0,
									包含圖片: !!node.querySelector("img"),
									回應類型: node.textContent?.includes("分析")
										? "分析回應"
										: "一般回應",
									回應時間: new Date().toISOString(),
								});

								console.log(
									`🤖 收到AI回應: ${node.textContent?.substring(0, 50)}...`
								);
							}
						}
					});
				});
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});

			return () => observer.disconnect();
		};

		// 追蹤聊天會話結束 (頁面離開)
		const trackChatSessionEnd = () => {
			const handleBeforeUnload = () => {
				if (chatSessionId && sessionStartTime) {
					const sessionDuration = new Date() - sessionStartTime;

					FengShuiMixpanel.track("聊天會話結束", {
						會話ID: chatSessionId,
						會話時長: sessionDuration,
						總訊息數: messageCount,
						結束時間: new Date().toISOString(),
						結束原因: "頁面離開",
					});
				}
			};

			window.addEventListener("beforeunload", handleBeforeUnload);
			return () =>
				window.removeEventListener("beforeunload", handleBeforeUnload);
		};

		// 初始化所有追蹤
		const initializeTracking = () => {
			// 延遲初始化，確保頁面元素已載入
			setTimeout(() => {
				trackChatSessionStart();
				trackTextInput();
				trackSendButton();
				trackKeyboardSend();

				const aiObserverCleanup = trackAIResponses();
				const sessionEndCleanup = trackChatSessionEnd();

				// 返回清理函數
				return () => {
					aiObserverCleanup();
					sessionEndCleanup();
				};
			}, 1000);
		};

		const cleanup = initializeTracking();

		return cleanup;
	}, []);

	return null;
}
