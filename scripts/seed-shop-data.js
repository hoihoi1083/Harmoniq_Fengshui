// Seed script to create demo products for the Lucky Charms & Amulets shop
const mongoose = require("mongoose");
const Product = require("../src/models/Product");
require("dotenv").config({ path: ".env.local" });

const demoProducts = [
	{
		productId: "charm-001",
		name: {
			zh_TW: "五行平衡護身符",
			zh_CN: "五行平衡护身符",
			en: "Five Elements Balance Amulet",
		},
		description: {
			zh_TW:
				"根據五行相生相剋原理設計的護身符，平衡個人五行能量，增強運勢。精選天然水晶與銅製成，適合日常佩戴。",
			zh_CN:
				"根据五行相生相克原理设计的护身符，平衡个人五行能量，增强运势。精选天然水晶与铜制成，适合日常佩戴。",
			en: "Designed based on the Five Elements theory to balance personal energy and enhance fortune. Made with natural crystals and copper, perfect for daily wear.",
		},
		price: 488,
		category: "charm",
		element: "earth",
		images: [
			"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
			"https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800&q=80",
		],
		stock: 50,
		tags: ["五行", "護身符", "水晶", "開運"],
		benefits: {
			zh_TW: [
				"平衡五行能量",
				"增強個人氣場",
				"提升整體運勢",
				"天然水晶材質",
			],
			zh_CN: [
				"平衡五行能量",
				"增强个人气场",
				"提升整体运势",
				"天然水晶材质",
			],
			en: [
				"Balance Five Elements energy",
				"Enhance personal aura",
				"Boost overall fortune",
				"Natural crystal material",
			],
		},
		specifications: {
			material: { zh_TW: "天然水晶、紅銅", zh_CN: "天然水晶、红铜" },
			size: { zh_TW: "直徑3cm", zh_CN: "直径3cm" },
			weight: { zh_TW: "15克", zh_CN: "15克" },
		},
		isFeatured: true,
		isDigital: false,
		discount: {
			percentage: 20,
			validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
		},
	},
	{
		productId: "charm-002",
		name: {
			zh_TW: "招財貔貅玉墜",
			zh_CN: "招财貔貅玉坠",
			en: "Prosperity Pixiu Jade Pendant",
		},
		description: {
			zh_TW:
				"貔貅是中國傳統的招財瑞獸，配以上等和田玉雕刻而成。貔貅有口無肛，只進不出，象徵財源廣進。",
			zh_CN:
				"貔貅是中国传统的招财瑞兽，配以上等和田玉雕刻而成。貔貅有口无肛，只进不出，象征财源广进。",
			en: "Pixiu is a traditional Chinese prosperity creature, carved from premium Hetian jade. Symbolizes wealth accumulation and fortune.",
		},
		price: 888,
		category: "charm",
		element: "metal",
		images: [
			"https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80",
			"https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800&q=80",
		],
		stock: 30,
		tags: ["貔貅", "招財", "和田玉", "開運"],
		benefits: {
			zh_TW: [
				"招財進寶",
				"守護財富",
				"增強事業運",
				"上等和田玉材質",
			],
			zh_CN: [
				"招财进宝",
				"守护财富",
				"增强事业运",
				"上等和田玉材质",
			],
			en: [
				"Attract wealth",
				"Protect fortune",
				"Boost career luck",
				"Premium Hetian jade",
			],
		},
		specifications: {
			material: { zh_TW: "和田玉", zh_CN: "和田玉" },
			size: { zh_TW: "4cm x 2.5cm", zh_CN: "4cm x 2.5cm" },
			weight: { zh_TW: "25克", zh_CN: "25克" },
		},
		isFeatured: true,
		isDigital: false,
	},
	{
		productId: "deco-001",
		name: {
			zh_TW: "水晶球能量陣",
			zh_CN: "水晶球能量阵",
			en: "Crystal Ball Energy Array",
		},
		description: {
			zh_TW:
				"精選紫水晶、白水晶、黃水晶組成能量陣，放置家中或辦公室，可淨化磁場、提升空間能量，招來好運。",
			zh_CN:
				"精选紫水晶、白水晶、黄水晶组成能量阵，放置家中或办公室，可净化磁场、提升空间能量，招来好运。",
			en: "Energy array composed of amethyst, clear quartz, and citrine. Purifies space, enhances energy, and attracts good fortune.",
		},
		price: 1288,
		category: "decoration",
		element: "earth",
		images: [
			"https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
			"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
		],
		stock: 20,
		tags: ["水晶", "能量陣", "風水擺設", "淨化"],
		benefits: {
			zh_TW: [
				"淨化空間磁場",
				"提升正面能量",
				"增強財運與事業運",
				"天然水晶組合",
			],
			zh_CN: [
				"净化空间磁场",
				"提升正面能量",
				"增强财运与事业运",
				"天然水晶组合",
			],
			en: [
				"Purify space energy",
				"Boost positive energy",
				"Enhance wealth and career",
				"Natural crystal set",
			],
		},
		specifications: {
			material: {
				zh_TW: "紫水晶、白水晶、黃水晶",
				zh_CN: "紫水晶、白水晶、黄水晶",
			},
			size: { zh_TW: "底座15cm x 15cm", zh_CN: "底座15cm x 15cm" },
			weight: { zh_TW: "500克", zh_CN: "500克" },
		},
		isFeatured: true,
		isDigital: false,
		discount: {
			percentage: 15,
			validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
		},
	},
	{
		productId: "deco-002",
		name: {
			zh_TW: "銅製風水羅盤",
			zh_CN: "铜制风水罗盘",
			en: "Bronze Feng Shui Compass",
		},
		description: {
			zh_TW:
				"傳統風水師專用羅盤，採用精密刻度，可精確測量方位。既是風水工具，也是辦公室或家中的風水擺設。",
			zh_CN:
				"传统风水师专用罗盘，采用精密刻度，可精确测量方位。既是风水工具，也是办公室或家中的风水摆设。",
			en: "Traditional Feng Shui compass with precise measurements. Both a practical tool and decorative piece for office or home.",
		},
		price: 588,
		category: "decoration",
		element: "metal",
		images: [
			"https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&q=80",
			"https://images.unsplash.com/photo-1518495973542-4542c06a5543?w=800&q=80",
		],
		stock: 40,
		tags: ["羅盤", "風水工具", "銅製", "專業"],
		benefits: {
			zh_TW: [
				"精確測量方位",
				"專業風水工具",
				"提升空間能量",
				"精密銅製工藝",
			],
			zh_CN: [
				"精确测量方位",
				"专业风水工具",
				"提升空间能量",
				"精密铜制工艺",
			],
			en: [
				"Precise direction measurement",
				"Professional Feng Shui tool",
				"Enhance space energy",
				"Premium bronze craftsmanship",
			],
		},
		specifications: {
			material: { zh_TW: "精製紅銅", zh_CN: "精制红铜" },
			size: { zh_TW: "直徑12cm", zh_CN: "直径12cm" },
			weight: { zh_TW: "300克", zh_CN: "300克" },
		},
		isFeatured: false,
		isDigital: false,
	},
	{
		productId: "ebook-001",
		name: {
			zh_TW: "八字命理入門電子書",
			zh_CN: "八字命理入门电子书",
			en: "BaZi Astrology Beginner's Guide",
		},
		description: {
			zh_TW:
				"詳細講解八字命理基礎知識，包含天干地支、五行生剋、十神等核心概念。適合初學者系統化學習命理知識。",
			zh_CN:
				"详细讲解八字命理基础知识，包含天干地支、五行生克、十神等核心概念。适合初学者系统化学习命理知识。",
			en: "Comprehensive guide to BaZi astrology basics, including Heavenly Stems, Earthly Branches, Five Elements, and Ten Gods. Perfect for beginners.",
		},
		price: 188,
		category: "ebook",
		element: "wood",
		images: [
			"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
			"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
		],
		stock: 999,
		tags: ["電子書", "八字", "命理", "入門"],
		benefits: {
			zh_TW: [
				"系統化命理知識",
				"100頁精華內容",
				"圖文並茂解說",
				"永久下載權限",
			],
			zh_CN: [
				"系统化命理知识",
				"100页精华内容",
				"图文并茂解说",
				"永久下载权限",
			],
			en: [
				"Systematic knowledge",
				"100 pages of content",
				"Illustrated explanations",
				"Lifetime access",
			],
		},
		specifications: {
			material: { zh_TW: "PDF電子檔", zh_CN: "PDF电子档" },
			size: { zh_TW: "100頁 / 5MB", zh_CN: "100页 / 5MB" },
		},
		isFeatured: true,
		isDigital: true,
		discount: {
			percentage: 30,
			validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		},
	},
	{
		productId: "service-001",
		name: {
			zh_TW: "個人風水諮詢服務（30分鐘）",
			zh_CN: "个人风水咨询服务（30分钟）",
			en: "Personal Feng Shui Consultation (30 min)",
		},
		description: {
			zh_TW:
				"由資深風水師提供一對一線上諮詢服務，根據您的八字與居住環境，提供個性化的風水建議與改善方案。",
			zh_CN:
				"由资深风水师提供一对一线上咨询服务，根据您的八字与居住环境，提供个性化的风水建议与改善方案。",
			en: "One-on-one online consultation with experienced Feng Shui master. Personalized advice based on your BaZi chart and living environment.",
		},
		price: 888,
		category: "service",
		element: "fire",
		images: [
			"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
			"https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80",
		],
		stock: 10,
		tags: ["諮詢", "風水師", "線上服務", "一對一"],
		benefits: {
			zh_TW: [
				"資深風水師指導",
				"個性化建議方案",
				"線上視訊諮詢",
				"會後書面報告",
			],
			zh_CN: [
				"资深风水师指导",
				"个性化建议方案",
				"线上视讯咨询",
				"会后书面报告",
			],
			en: [
				"Expert guidance",
				"Personalized advice",
				"Online video consultation",
				"Written report included",
			],
		},
		specifications: {
			material: { zh_TW: "線上視訊服務", zh_CN: "线上视讯服务" },
			size: { zh_TW: "30分鐘諮詢", zh_CN: "30分钟咨询" },
		},
		isFeatured: true,
		isDigital: true,
	},
];

async function seedProducts() {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("✅ Connected to MongoDB");

		// Clear existing products (optional)
		// await Product.deleteMany({});
		// console.log("🗑️ Cleared existing products");

		// Insert demo products
		const insertedProducts = await Product.insertMany(demoProducts);
		console.log(
			`✅ Successfully inserted ${insertedProducts.length} demo products:`
		);
		insertedProducts.forEach((product) => {
			console.log(
				`   - ${product.name.zh_TW} (${product.productId}) - $${product.price}`
			);
		});

		console.log("\n🎉 Seed completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding products:", error);
		process.exit(1);
	}
}

seedProducts();
