import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
// Static imports for production compatibility
import zhCN from "../../messages/zh-CN.json";
import zhTW from "../../messages/zh-TW.json";

const messages = {
	"zh-CN": zhCN,
	"zh-TW": zhTW,
};

export default getRequestConfig(async ({ requestLocale }) => {
	// Typically corresponds to the `[locale]` segment
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;

	return {
		locale,
		messages: messages[locale as keyof typeof messages],
	};
});
