// Mixpanel 風水分析追蹤配置
import mixpanel from "mixpanel-browser";

// 從環境變數獲取您的Mixpanel項目token
const MIXPANEL_TOKEN =
	process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ||
	"76e5dc296286899f487845b19ee919e0";

// 初始化Mixpanel
if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
	mixpanel.init(MIXPANEL_TOKEN, {
		debug: process.env.NODE_ENV === "development",
		track_pageview: true,
		persistence: "localStorage",
		// 啟用自動捕獲（如您的配置）
		autocapture: true,
		// 會話記錄（如您的配置）
		record_sessions_percent: 100,
		// 隱私設置
		opt_out_tracking_by_default: false,
		ignore_dnt: false,
		// 增加 batch 請求來減少並發
		batch_requests: true,
		batch_size: 50,
		batch_flush_interval_ms: 2000,
		// 增加鎖定超時時間
		property_blacklist: [],
		// 自定義配置
		loaded: function (mixpanel) {
			console.log(
				"🎯 Mixpanel 已成功初始化 - Token:",
				MIXPANEL_TOKEN.substring(0, 8) + "..."
			);
		},
	});
}

// 防抖隊列來避免並發問題
let trackingQueue = [];
let isProcessing = false;

const processQueue = async () => {
	if (isProcessing || trackingQueue.length === 0) return;

	isProcessing = true;
	const event = trackingQueue.shift();

	try {
		await new Promise((resolve) => {
			mixpanel.track(event.name, event.properties);
			// 添加小延遲以避免鎖定衝突
			setTimeout(resolve, 50);
		});
	} catch (error) {
		console.warn("⚠️ Mixpanel tracking error:", error);
	}

	isProcessing = false;
	if (trackingQueue.length > 0) {
		processQueue();
	}
};

// 風水分析事件追蹤類
class FengShuiMixpanel {
	// 檢查是否為測試環境
	static isTestEnvironment() {
		if (typeof window === "undefined") return false;

		// 檢查多種測試環境標識
		const testIndicators = [
			window.location.pathname.includes("/mixpanel-test"),
			window.location.pathname.includes("/test"),
			window.location.hostname === "localhost",
			window.location.hostname.includes("test"),
			window.location.hostname.includes("dev"),
			localStorage.getItem("mixpanel_test_mode") === "true",
			sessionStorage.getItem("testing_mode") === "true",
		];

		return testIndicators.some((indicator) => indicator);
	}

	// 檢查是否為測試用戶
	static isTestUser(userId) {
		if (!userId) return false;

		const testUserPatterns = [
			/test.*user/i,
			/user.*test/i,
			/test.*\d+/i,
			/demo.*user/i,
			/admin.*test/i,
			/test@/i,
			/.*test\.com$/i,
		];

		return testUserPatterns.some((pattern) => pattern.test(userId));
	}

	// 用戶識別（帶測試過濾）
	static identify(userId, userProperties = {}) {
		if (typeof window === "undefined") return;

		// 測試環境標記
		const isTest = this.isTestEnvironment() || this.isTestUser(userId);

		if (isTest) {
			console.log("🧪 測試環境檢測到，添加測試標記:", userId);
		}

		mixpanel.identify(userId);
		mixpanel.people.set({
			$name: userProperties.name || userId,
			$email: userProperties.email,
			註冊時間: new Date(),
			首選語言: userProperties.language || "zh-TW",
			設備類型: this.getDeviceType(),
			// 測試環境標記
			是否測試用戶: isTest,
			環境類型: isTest ? "測試環境" : "正式環境",
			主機名稱: window.location.hostname,
			...userProperties,
		});

		console.log(isTest ? "🧪 測試用戶識別:" : "👤 正式用戶識別:", userId);
	}

	// 追蹤風水分析開始
	static trackAnalysisStarted(properties = {}) {
		this.track("風水分析開始", {
			分析類型: properties.analysisType || "未知",
			房間類型: properties.roomType,
			上傳照片數量: properties.photoCount || 0,
			用戶語言: properties.language || "zh-TW",
			頁面來源: properties.source || window.location.pathname,
			時間戳: new Date().toISOString(),
			...properties,
		});
	}

	// 追蹤聊天互動
	static trackChatInteraction(properties = {}) {
		this.track("聊天互動", {
			訊息類型: properties.messageType || "文字",
			訊息長度: properties.messageLength || 0,
			回應時間: properties.responseTime,
			聊天會話ID: properties.sessionId,
			是否包含照片: properties.hasPhoto || false,
			...properties,
		});
	}

	// 追蹤報告生成
	static trackReportGenerated(properties = {}) {
		this.track("報告生成", {
			報告類型: properties.reportType || "基礎",
			分析結果: properties.analysisResult,
			建議數量: properties.suggestionsCount || 0,
			生成時間: properties.generationTime,
			是否付費: properties.isPaid || false,
			滿意度評分: properties.satisfactionScore,
			...properties,
		});
	}

	// 追蹤付費轉換
	static trackPayment(properties = {}) {
		this.track("付費轉換", {
			付費金額: properties.amount,
			付費方式: properties.paymentMethod,
			服務類型: properties.serviceType,
			折扣碼: properties.discountCode,
			轉換來源: properties.conversionSource,
			...properties,
		});

		// 增加收入追蹤
		mixpanel.people.track_charge(properties.amount, {
			服務類型: properties.serviceType,
			付費時間: new Date(),
		});
	}

	// 追蹤頁面瀏覽
	static trackPageView(pageName, properties = {}) {
		this.track("頁面瀏覽", {
			頁面名稱: pageName,
			頁面路徑: window.location.pathname,
			頁面標題: document.title,
			來源頁面: document.referrer,
			停留時間: properties.timeOnPage,
			滾動深度: properties.scrollDepth,
			...properties,
		});
	}

	// 追蹤按鈕點擊
	static trackButtonClick(buttonName, properties = {}) {
		this.track("按鈕點擊", {
			按鈕名稱: buttonName,
			按鈕位置: properties.position,
			按鈕類型: properties.buttonType,
			頁面上下文: properties.pageContext || window.location.pathname,
			點擊時間: new Date().toISOString(),
			...properties,
		});
	}

	// 追蹤表單提交
	static trackFormSubmission(formName, properties = {}) {
		this.track("表單提交", {
			表單名稱: formName,
			表單類型: properties.formType,
			提交狀態: properties.status || "成功",
			錯誤信息: properties.error,
			填寫時間: properties.fillTime,
			...properties,
		});
	}

	// 追蹤用戶旅程里程碑
	static trackMilestone(milestone, properties = {}) {
		this.track("用戶里程碑", {
			里程碑: milestone,
			達成時間: new Date().toISOString(),
			累積使用天數: properties.daysSinceSignup,
			累積分析次數: properties.totalAnalysis,
			...properties,
		});
	}

	// 基礎追蹤方法（使用隊列避免並發）
	static track(eventName, properties = {}) {
		if (typeof window === "undefined") return;

		// 檢測測試環境
		const isTest = this.isTestEnvironment();
		const currentUser = mixpanel.get_distinct_id();
		const isTestUser = this.isTestUser(currentUser);

		const enhancedProperties = {
			...properties,
			追蹤時間: new Date().toISOString(),
			頁面URL: window.location.href,
			用戶代理: navigator.userAgent,
			螢幕解析度: `${screen.width}x${screen.height}`,
			瀏覽器語言: navigator.language,
			時區: Intl.DateTimeFormat().resolvedOptions().timeZone,
			// 測試環境標記
			是否測試環境: isTest,
			是否測試用戶: isTestUser,
			環境類型: isTest || isTestUser ? "測試環境" : "正式環境",
			主機名稱: window.location.hostname,
		};

		// 添加到隊列而不是直接發送
		trackingQueue.push({
			name: eventName,
			properties: enhancedProperties,
		});

		// 啟動隊列處理
		processQueue();

		const logPrefix =
			isTest || isTestUser ? "🧪 測試事件:" : "🎯 正式事件:";
		console.log(logPrefix, eventName, enhancedProperties);
	}

	// 設置用戶屬性
	static setUserProperties(properties) {
		if (typeof window === "undefined") return;

		mixpanel.people.set(properties);
		console.log("👤 Mixpanel 用戶屬性更新:", properties);
	}

	// 增加用戶屬性計數
	static incrementUserProperty(property, value = 1) {
		if (typeof window === "undefined") return;

		mixpanel.people.increment(property, value);
	}

	// 獲取設備類型
	static getDeviceType() {
		const userAgent = navigator.userAgent;
		if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
			return "平板";
		}
		if (
			/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
				userAgent
			)
		) {
			return "手機";
		}
		return "桌面";
	}

	// 創建用戶漏斗
	static createFunnel(funnelName, step, properties = {}) {
		this.track(`${funnelName}_${step}`, {
			漏斗名稱: funnelName,
			漏斗步驟: step,
			步驟順序: properties.stepOrder || 1,
			...properties,
		});
	}

	// A/B測試追蹤
	static trackExperiment(experimentName, variant, properties = {}) {
		this.track("A/B測試", {
			實驗名稱: experimentName,
			測試變體: variant,
			實驗開始時間: new Date().toISOString(),
			...properties,
		});

		// 設置用戶屬性以便分析
		this.setUserProperties({
			[`實驗_${experimentName}`]: variant,
		});
	}

	// 錯誤追蹤
	static trackError(error, properties = {}) {
		this.track("錯誤發生", {
			錯誤信息: error.message,
			錯誤堆疊: error.stack,
			錯誤類型: error.name,
			發生頁面: window.location.pathname,
			用戶代理: navigator.userAgent,
			...properties,
		});
	}

	// 登出時重置
	static reset() {
		if (typeof window === "undefined") return;

		mixpanel.reset();
		console.log("🔄 Mixpanel 已重置");
	}
}

export default FengShuiMixpanel;
