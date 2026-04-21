/**
 * HTML email template for weekly 五行／風水 advice (structure A + optional 7-day block).
 * Content is for cultural／self-reflection only — not professional advice.
 *
 * Images use absolute URLs (email clients require public URLs).
 */

const DEFAULT_ASSET_BASE = "https://www.harmoniqfengshui.com";

function escapeHtml(s) {
	if (s == null) return "";
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function normalizeAssetBase(url) {
	if (!url || typeof url !== "string") return DEFAULT_ASSET_BASE;
	return url.replace(/\/+$/, "");
}

/**
 * @param {object} opts
 * @param {string} [opts.assetBaseUrl] — origin for /images/... (no trailing slash). Default production site.
 * @param {string} opts.recipientName
 * @param {string} opts.weekLabel e.g. "2026年第16週（4/13–4/19）"
 * @param {string} opts.baziLine e.g. "四柱：甲子 丙寅 戊午 庚申｜日主：戊（土）"
 * @param {string[]} opts.mainSections — plain text paragraphs
 * @param {string[]} opts.dailyOneLiners — length 7, Mon–Sun
 * @param {string} [opts.weeklyConclusion] — closing paragraph after the 7-day list (plain text)
 * @param {string} [opts.preheader] — inbox preview line (hidden in body)
 *
 * Note: `public/images/report/bottom.png` is a tall seal (~1470×2782). The template displays it
 * at ~100px height so it reads as a signature mark, not a full-width banner.
 */
export function buildWeeklyAdviceEmailHtml({
	assetBaseUrl = DEFAULT_ASSET_BASE,
	recipientName = "朋友",
	weekLabel = "",
	baziLine = "",
	mainSections = [],
	dailyOneLiners = [],
	weeklyConclusion = "",
	preheader = "",
}) {
	const base = normalizeAssetBase(assetBaseUrl);
	const logoWhite = `${base}/images/logo/logo-white.png`;
	const reportBottom = `${base}/images/report/bottom.png`;

	const preview =
		preheader ||
		`${weekLabel ? weekLabel + " — " : ""}本週運勢與空間風水建議｜HarmoniqFengShui`;

	const sections =
		mainSections.length > 0
			? mainSections
			: [
					"本週能量節奏適合整理居住與工作空間的「動線」與採光，讓氣場更流通。可先從最常停留的角落開始，避免一次大改造成壓力。",
					"五行調和上，宜以柔和方式補足本週所需，例如用顏色、材質與植物做小幅調整，重在平衡而非極端。",
					"情緒與作息方面，建議維持固定睡眠時段，白天短暫離開螢幕、接觸自然光，有助穩定思緒。",
				];

	const daily =
		Array.isArray(dailyOneLiners) && dailyOneLiners.length === 7
			? dailyOneLiners
			: [
					"週一：開局宜穩，先處理瑣事再談大事。",
					"週二：溝通順暢，適合短會與對齊進度。",
					"週三：注意體力節奏，午後短休。",
					"週四：財務與資源配置可再檢視一遍。",
					"週五：收尾與整理，為下週留白。",
					"週六：適合居家小調整與陪伴。",
					"週日：靜心回顧，輕量規劃即可。",
				];

	const mainHtml = sections
		.map(
			(p) =>
				`<p style="margin:0 0 18px 0; color:#2a2f2d; font-size:16px; line-height:1.75; font-family:'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;">${escapeHtml(p)}</p>`,
		)
		.join("");

	const dailyListHtml = daily
		.map(
			(line) =>
				`<li style="margin:0 0 10px 0; color:#3d4542; font-size:14px; line-height:1.6; font-family:'Noto Sans TC', 'PingFang TC', sans-serif;">${escapeHtml(line)}</li>`,
		)
		.join("");

	/** Source asset ~1470×2782; cap height so the seal stays signature-sized in mail clients */
	const SEAL_DISPLAY_HEIGHT = 100;
	const sealAspect = 1470 / 2782;
	const sealDisplayWidth = Math.round(SEAL_DISPLAY_HEIGHT * sealAspect);

	const conclusionText =
		weeklyConclusion?.trim() ||
		"綜觀本週節奏：前半可偏重整理與溝通，中段留意體力與資源配置，後半適合收尾與留白。願您在空間與作息之間取得平衡，以一種從容、穩定的步調迎接下一週。";

	const siteUrl = `${base}/`;

	return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600&family=Noto+Serif+TC:wght@500;600&display=swap" rel="stylesheet"/>
  <title>HarmoniqFengShui 本週運勢</title>
</head>
<body style="margin:0; padding:0; background:#f0ebe3; font-family:'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif;">
  <!-- preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f0ebe3;">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0ebe3; padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background:#fffdf8; border-radius:14px; overflow:hidden; border:1px solid #e5dfd4; box-shadow:0 4px 24px rgba(28,49,46,0.07);">
          <!-- header -->
          <tr>
            <td style="background:linear-gradient(165deg,#1a2e2a 0%,#1C312E 42%,#152824 100%); padding:32px 24px 28px; text-align:center; border-bottom:3px solid #c4a85a;">
              <img src="${logoWhite}" alt="HarmoniqFengShui" width="200" height="48" style="display:block; margin:0 auto 20px; height:48px; width:auto; max-width:200px; border:0; outline:none;"/>
              <p style="margin:0 0 10px 0; font-family:'Noto Serif TC','Noto Sans TC',serif; color:#e8f0ed; font-size:11px; letter-spacing:0.35em; text-transform:uppercase; opacity:0.85;">五行 · 空間 · 節奏</p>
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600; font-family:'Noto Serif TC','Noto Sans TC',serif; line-height:1.35; letter-spacing:0.02em;">本週運勢與空間建議</h1>
              <p style="margin:14px 0 0 0; color:#b8d4c8; font-size:14px; font-family:'Noto Sans TC',sans-serif;">${escapeHtml(weekLabel)}</p>
            </td>
          </tr>
          <!-- body -->
          <tr>
            <td style="padding:32px 28px 8px;">
              <p style="margin:0 0 22px 0; color:#2a2f2d; font-size:17px; font-family:'Noto Serif TC','Noto Sans TC',serif;">${escapeHtml(recipientName)} 您好，</p>
              ${baziLine ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0; background:#f7f4ec; border-radius:10px; border:1px solid #e8e0d0; border-left:4px solid #b8973d;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 8px 0; font-size:12px; letter-spacing:0.12em; color:#5c6b66; font-weight:600;">八字摘要</p>
                    <p style="margin:0; color:#243d36; font-size:14px; line-height:1.65;">${escapeHtml(baziLine)}</p>
                  </td>
                </tr>
              </table>` : ""}
              ${mainHtml}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 0 0; background:#faf6ef; border:1px solid #e5ddd0; border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <details style="margin:0;">
                      <summary style="cursor:pointer; font-weight:600; color:#1C312E; font-size:15px; font-family:'Noto Serif TC',serif; list-style:none;">本週七日一句<span style="color:#8a7a62; font-size:13px; font-weight:400; font-family:'Noto Sans TC',sans-serif;">（點開展開）</span></summary>
                      <ol style="margin:16px 0 0 0; padding:0 0 0 22px;">${dailyListHtml}</ol>
                    </details>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 0 0; background:#f9f6f1; border:1px solid #e0d8cc; border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px 0; font-size:12px; letter-spacing:0.14em; color:#6b5c45; font-weight:600; font-family:'Noto Serif TC',serif;">本週小結</p>
                    <p style="margin:0; color:#2f3533; font-size:15px; line-height:1.75; font-family:'Noto Sans TC','PingFang TC',sans-serif;">${escapeHtml(conclusionText)}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0 0; padding-top:22px; border-top:1px solid #e8e2d6; font-size:12px; color:#6f7a76; line-height:1.65;">
                以上內容僅供文化與生活風水參考，非醫療、法律、投資或專業命理諮詢。請依個人狀況自行判斷。
              </p>
            </td>
          </tr>
          <!-- seal signature (tall asset scaled down) -->
          <tr>
            <td style="padding:16px 24px 8px; text-align:center; background:#fffdf8;">
              <a href="${siteUrl}" style="text-decoration:none; display:inline-block;">
                <img src="${reportBottom}" alt="HarmoniqFengShui 印" width="${sealDisplayWidth}" height="${SEAL_DISPLAY_HEIGHT}" style="display:block; margin:0 auto; width:${sealDisplayWidth}px; height:${SEAL_DISPLAY_HEIGHT}px; max-height:100px; border:0; outline:none;"/>
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0; font-size:11px; color:#9aa39f; text-align:center; font-family:'Noto Sans TC',sans-serif;">
          您收到此信是因為曾於 HarmoniqFengShui 留下聯絡方式並同意接收內容。
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Format BaZi object from calculateAccurateBaZi for email line.
 */
export function formatBaziSummaryLine(bazi) {
	if (!bazi || !bazi.year) return "";
	const pillars = `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`;
	const dm = bazi.dayMaster || bazi.dayStem || "";
	return `四柱：${pillars}｜日主：${dm}${bazi.dayElement ? `（${bazi.dayElement}）` : ""}`;
}
