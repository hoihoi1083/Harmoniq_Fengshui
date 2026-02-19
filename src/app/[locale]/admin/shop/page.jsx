"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import ShopNavbar from "@/components/ShopNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, Image as ImageIcon, Upload, Edit, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminShopPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const locale = useLocale();
	const [products, setProducts] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [editingProductId, setEditingProductId] = useState(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [formData, setFormData] = useState({
		name: { zh_TW: "", zh_CN: "", en: "" },
		description: { zh_TW: "", zh_CN: "", en: "" },
		category: "charm",
		price: "",
		currency: "HKD",
		priceCNY: "",
		priceHKD: "",
		priceTWD: "",
		stock: "",
		sold: 0,
		isDigital: false,
		isFeatured: false,
		elementType: "none",
		tags: [],
		benefits: [""],
		specifications: {
			material: "",
			size: "",
			weight: "",
		},
		giftReportTypes: [], // ["wealth","love","career","health"] - which report types user can choose as gift
		rating: {
			average: 0,
			count: 0,
		},
		discount: {
			percentage: 0,
			validUntil: "",
		},
		images: [""],
	});

	useEffect(() => {
		// Wait for session to load
		if (status === "loading") return;
		
		// If not authenticated, redirect to login
		if (status === "unauthenticated" || !session?.user) {
			toast.error("請先登入以訪問管理頁面");
			router.push(`/${locale}/auth/login`);
			return;
		}
		
		// Check if user is the admin account
		if (status === "authenticated" && session?.user) {
			const isAdmin = session.user.userId === "harmoniqadmin" || 
			                session.user.email === "harmoniqadmin@harmoniq.com";
			
			if (!isAdmin) {
				toast.error("您沒有權限訪問此頁面");
				router.push(`/${locale}/shop`);
				return;
			}
			fetchProducts();
		}
	}, [status, session, locale, router]);

	const fetchProducts = async () => {
		try {
			const res = await fetch("/api/shop/products?limit=100");
			const data = await res.json();
			if (data.success) {
				setProducts(data.data.products);
			}
		} catch (error) {
			console.error("Failed to fetch products:", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Clean up empty strings
			const priceHKD = formData.priceHKD !== "" ? parseFloat(formData.priceHKD) : undefined;
			const priceCNY = formData.priceCNY !== "" ? parseFloat(formData.priceCNY) : undefined;
			const priceTWD = formData.priceTWD !== "" ? parseFloat(formData.priceTWD) : undefined;
			const cleanedData = {
				...formData,
				price: priceHKD ?? priceCNY ?? priceTWD ?? parseFloat(formData.price) ?? 0,
				priceCNY: priceCNY ?? undefined,
				priceHKD: priceHKD ?? undefined,
				priceTWD: priceTWD ?? undefined,
				stock: parseInt(formData.stock) || 0,
				sold: parseInt(formData.sold) || 0,
				images: formData.images.filter((img) => img.trim() !== ""),
				benefits: formData.benefits.filter(
					(benefit) => benefit.trim() !== ""
				),
				tags: formData.tags,
			};

			console.log("🔍 Submitting product data:", cleanedData);
			console.log("📊 Sold count being sent:", cleanedData.sold);

			const url = isEditMode
				? `/api/shop/products/${editingProductId}`
				: "/api/shop/products";
			const method = isEditMode ? "PUT" : "POST";

			console.log("🌐 Request URL:", url);
			console.log("🌐 Request method:", method);

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cleanedData),
			});

			const data = await res.json();

			console.log("✅ Server response:", data);

			if (data.success) {
				toast.success(isEditMode ? "商品更新成功！" : "商品創建成功！");
				setShowForm(false);
				setIsEditMode(false);
				setEditingProductId(null);
				fetchProducts();
				// Reset form
				setFormData({
					name: { zh_TW: "", zh_CN: "", en: "" },
					description: { zh_TW: "", zh_CN: "", en: "" },
					category: "charm",
					price: "",
					originalPrice: "",
					currency: "HKD",
					priceCNY: "",
					priceHKD: "",
					priceTWD: "",
					stock: "",
					isDigital: false,
					isFeatured: false,
					elementType: "none",
					tags: [],
					benefits: [""],
					specifications: {
						material: "",
						size: "",
						weight: "",
					},
					giftReportTypes: [],
					discount: {
						percentage: 0,
						validUntil: "",
					},
					images: [""],
				});
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error((isEditMode ? "更新失敗：" : "創建失敗：") + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (product) => {
		setIsEditMode(true);
		setEditingProductId(product._id);
		setShowForm(true);
		setFormData({
			name: product.name || { zh_TW: "", zh_CN: "", en: "" },
			description: product.description || { zh_TW: "", zh_CN: "", en: "" },
			category: product.category || "charm",
			price: product.price ? product.price.toString() : "",
			currency: product.currency || "HKD",
			priceCNY: product.priceCNY != null ? product.priceCNY.toString() : "",
			priceHKD: product.priceHKD != null ? product.priceHKD.toString() : "",
			priceTWD: product.priceTWD != null ? product.priceTWD.toString() : "",
			stock: product.stock ? product.stock.toString() : "",
			sold: product.soldCount || product.sold || 0,
			isDigital: product.isDigital || false,
			isFeatured: product.isFeatured || false,
			elementType: product.elementType || "none",
			tags: product.tags || [],
			benefits: product.benefits && product.benefits.length > 0 ? product.benefits : [""],
			specifications: {
				material: product.specifications?.material || "",
				size: product.specifications?.size || "",
				weight: product.specifications?.weight || "",
			},
			giftReportTypes: product.giftReportTypes && product.giftReportTypes.length > 0 ? [...product.giftReportTypes] : [],
			rating: {
				average: product.rating?.average || 0,
				count: product.rating?.count || 0,
			},
			discount: {
				percentage: product.discount?.percentage || 0,
				validUntil: product.discount?.validUntil || "",
			},
			images: product.images && product.images.length > 0 ? product.images : [""],
		});
		// Scroll to top
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = async (productId) => {
		if (!confirm("確定要刪除這個商品嗎？此操作無法復原。")) {
			return;
		}

		try {
			const res = await fetch(`/api/shop/products/${productId}`, {
				method: "DELETE",
			});

			const data = await res.json();

			if (data.success) {
				toast.success("商品已刪除");
				fetchProducts();
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error("刪除失敗：" + error.message);
		}
	};

	const handleCancelEdit = () => {
		setIsEditMode(false);
		setEditingProductId(null);
		setShowForm(false);
		setFormData({
			name: { zh_TW: "", zh_CN: "", en: "" },
			description: { zh_TW: "", zh_CN: "", en: "" },
			category: "charm",
			price: "",
			currency: "HKD",
			priceCNY: "",
			priceHKD: "",
			priceTWD: "",
			stock: "",
			sold: 0,
			isDigital: false,
			isFeatured: false,
			elementType: "none",
			tags: [],
			benefits: [""],
				specifications: {
					material: "",
					size: "",
					weight: "",
				},
				giftReportTypes: [],
				rating: {
					average: 0,
					count: 0,
				},
				discount: {
					percentage: 0,
					validUntil: "",
				},
				images: [""],
			});
		};

	const handleImageUpload = async (e, index) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("圖片大小不能超過 5MB");
			return;
		}

		// Check file type
		if (!file.type.startsWith("image/")) {
			toast.error("請上傳圖片檔案");
			return;
		}

		setUploadingImage(true);
		try {
			const uploadFormData = new FormData();
			uploadFormData.append("file", file);

			const res = await fetch("/api/shop/upload", {
				method: "POST",
				body: uploadFormData,
			});

			const data = await res.json();

			if (data.success) {
				// Update the image URL at the specific index
				const newImages = [...formData.images];
				newImages[index] = data.url;
				setFormData({ ...formData, images: newImages });
				toast.success("圖片上傳成功！");
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error("上傳失敗：" + error.message);
		} finally {
			setUploadingImage(false);
		}
	};

	const addImageField = () => {
		setFormData({
			...formData,
			images: [...formData.images, ""],
		});
	};

	const updateImage = (index, value) => {
		const newImages = [...formData.images];
		newImages[index] = value;
		setFormData({ ...formData, images: newImages });
	};

	const removeImage = (index) => {
		const newImages = formData.images.filter((_, i) => i !== index);
		setFormData({ ...formData, images: newImages });
	};

	const addBenefit = () => {
		setFormData({
			...formData,
			benefits: [...formData.benefits, ""],
		});
	};

	const updateBenefit = (index, value) => {
		const newBenefits = [...formData.benefits];
		newBenefits[index] = value;
		setFormData({ ...formData, benefits: newBenefits });
	};

	const removeBenefit = (index) => {
		const newBenefits = formData.benefits.filter((_, i) => i !== index);
		setFormData({ ...formData, benefits: newBenefits });
	};

	const toggleTag = (tag) => {
		const newTags = formData.tags.includes(tag)
			? formData.tags.filter((t) => t !== tag)
			: [...formData.tags, tag];
		setFormData({ ...formData, tags: newTags });
	};

	const availableTags = [
		"財運",
		"愛情",
		"事業",
		"健康",
		"平安",
		"學業",
		"人緣",
		"化煞",
		"招財",
		"桃花",
	];

	// Show loading while checking authentication
	if (status === "loading") {
		return (
			<div className="min-h-screen bg-[#EFEFEF]">
				<ShopNavbar />
				<div className="px-4 py-8 pt-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
					<div className="flex items-center justify-center h-64">
						<div className="text-center">
							<div className="w-12 h-12 border-4 border-[#1C312E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-gray-600">加載中...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Don't render admin page if not authenticated or not admin account
	const isAdmin = session?.user?.userId === "harmoniqadmin" || 
	                session?.user?.email === "harmoniqadmin@harmoniq.com";
	
	if (status === "unauthenticated" || !session?.user || !isAdmin) {
		return null;
	}

	return (
		<div className="min-h-screen bg-[#EFEFEF]">
			<ShopNavbar />

			<div className="px-4 py-8 pt-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							商品管理
						</h1>
						<p className="mt-2 text-gray-600">
							管理您的開運商城商品
						</p>
					</div>
					<Button
						size="lg"
						className="bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E]"
						onClick={() => {
							if (showForm && isEditMode) {
								handleCancelEdit();
							} else {
								setShowForm(!showForm);
							}
						}}
					>
						{showForm ? (
							<>
								<X className="w-5 h-5 mr-2" />
								{isEditMode ? "取消編輯" : "關閉表單"}
							</>
						) : (
							<>
								<Plus className="w-5 h-5 mr-2" />
								新增商品
							</>
						)}
					</Button>
				</div>

				{/* Add/Edit Product Form */}
				{showForm && (
					<div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-[#73897F]/30">
						<h2 className="mb-6 text-2xl font-bold">
							{isEditMode ? "編輯商品" : "新增商品"}
						</h2>

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Product Names */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="name_zh_TW">
										商品名稱 (繁體) *
									</Label>
									<Input
										id="name_zh_TW"
										required
										value={formData.name.zh_TW}
										onChange={(e) =>
											setFormData({
												...formData,
												name: {
													...formData.name,
													zh_TW: e.target.value,
												},
											})
										}
										placeholder="例如：招財金蟾"
									/>
								</div>
								<div>
									<Label htmlFor="name_zh_CN">
										商品名称 (简体) *
									</Label>
									<Input
										id="name_zh_CN"
										required
										value={formData.name.zh_CN}
										onChange={(e) =>
											setFormData({
												...formData,
												name: {
													...formData.name,
													zh_CN: e.target.value,
												},
											})
										}
										placeholder="例如：招财金蟾"
									/>
								</div>
							</div>

							{/* Descriptions */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="desc_zh_TW">
										商品描述 (繁體) *
									</Label>
									<Textarea
										id="desc_zh_TW"
										required
										rows={4}
										value={formData.description.zh_TW}
										onChange={(e) =>
											setFormData({
												...formData,
												description: {
													...formData.description,
													zh_TW: e.target.value,
												},
											})
										}
										placeholder="詳細描述商品的特點和功效..."
									/>
								</div>
								<div>
									<Label htmlFor="desc_zh_CN">
										商品描述 (简体) *
									</Label>
									<Textarea
										id="desc_zh_CN"
										required
										rows={4}
										value={formData.description.zh_CN}
										onChange={(e) =>
											setFormData({
												...formData,
												description: {
													...formData.description,
													zh_CN: e.target.value,
												},
											})
										}
										placeholder="详细描述商品的特点和功效..."
									/>
								</div>
							</div>

							{/* Category, Element, Currency */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div>
									<Label htmlFor="category">類別 *</Label>
									<Select
										value={formData.category}
										onValueChange={(value) =>
											setFormData({
												...formData,
												category: value,
											})
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="charm">
												開運物品
											</SelectItem>
											<SelectItem value="decoration">
												風水擺設
											</SelectItem>
											<SelectItem value="ebook">
												電子書
											</SelectItem>
											<SelectItem value="service">
												服務套餐
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="elementType">
										五行屬性
									</Label>
									<Select
										value={formData.elementType}
										onValueChange={(value) =>
											setFormData({
												...formData,
												elementType: value,
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="選擇五行" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">
												無
											</SelectItem>
											<SelectItem value="wood">
												🌳 木
											</SelectItem>
											<SelectItem value="fire">
												🔥 火
											</SelectItem>
											<SelectItem value="earth">
												🏔️ 土
											</SelectItem>
											<SelectItem value="metal">
												⚔️ 金
											</SelectItem>
											<SelectItem value="water">
												💧 水
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								</div>

							{/* Prices: 中(CNY) · 港(HKD) · 台(TWD) */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div>
									<Label htmlFor="priceCNY">價格 (中 ¥ CNY)</Label>
									<Input
										id="priceCNY"
										type="number"
										min="0"
										step="any"
										value={formData.priceCNY}
										onChange={(e) =>
											setFormData({
												...formData,
												priceCNY: e.target.value,
											})
										}
										placeholder="188"
									/>
								</div>
								<div>
									<Label htmlFor="priceHKD">價格 (港 HK$ HKD)</Label>
									<Input
										id="priceHKD"
										type="number"
										min="0"
										step="any"
										value={formData.priceHKD}
										onChange={(e) =>
											setFormData({
												...formData,
												priceHKD: e.target.value,
											})
										}
										placeholder="188"
									/>
								</div>
								<div>
									<Label htmlFor="priceTWD">價格 (台 NT$ TWD)</Label>
									<Input
										id="priceTWD"
										type="number"
										min="0"
										step="any"
										value={formData.priceTWD}
										onChange={(e) =>
											setFormData({
												...formData,
												priceTWD: e.target.value,
											})
										}
										placeholder="688"
									/>
								</div>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								至少填寫一種價格；前台將依用戶選擇的 中/港/台 顯示對應價格
							</p>

							{/* Stock */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="stock">庫存 *</Label>
							<Input
								id="stock"
								type="number"
								required
								value={formData.stock}
								onChange={(e) =>
									setFormData({
										...formData,
										stock: e.target.value,
									})
								}
								placeholder="100"
							/>
						</div>
					</div>

				{/* Sold Count */}
				<div>
					<Label htmlFor="sold">銷售數量（用於熱銷產品排序）</Label>
					<Input
						id="sold"
						type="number"
						min="0"
						value={formData.sold}
						onChange={(e) =>
							setFormData({
								...formData,
								sold: parseInt(e.target.value) || 0,
							})
						}
						placeholder="0"
					/>
					<p className="mt-1 text-xs text-gray-500">
						設定大於 0 的數值，商品會顯示在「熱銷產品」區域
					</p>
				</div>

			{/* Discount */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<Label htmlFor="discount">
						折扣百分比 (%)
					</Label>
					<Input
						id="discount"
						type="number"
						min="0"
						max="100"
						value={formData.discount.percentage}
						onChange={(e) =>
							setFormData({
								...formData,
								discount: {
									...formData.discount,
									percentage: parseInt(
										e.target.value
									),
								},
							})
						}
						placeholder="20"
					/>
				</div>

				<div>
					<Label htmlFor="discountValidUntil">
						折扣有效期
					</Label>
					<Input
						id="discountValidUntil"
						type="date"
						value={
							formData.discount.validUntil
								?.split("T")[0] || ""
						}
						onChange={(e) =>
							setFormData({
								...formData,
								discount: {
									...formData.discount,
									validUntil: e.target.value
										? new Date(
												e.target.value
											).toISOString()
										: "",
								},
							})
						}
					/>
				</div>
			</div>

			{/* Rating */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="ratingAverage">
										評分 (0-5)
									</Label>
									<Input
										id="ratingAverage"
										type="number"
										min="0"
										max="5"
										step="0.1"
										value={formData.rating.average}
										onChange={(e) =>
											setFormData({
												...formData,
												rating: {
													...formData.rating,
													average: parseFloat(
														e.target.value
													) || 0,
												},
											})
										}
										placeholder="4.5"
									/>
								</div>

								<div>
									<Label htmlFor="ratingCount">
										評分人數
									</Label>
									<Input
										id="ratingCount"
										type="number"
										min="0"
										value={formData.rating.count}
										onChange={(e) =>
											setFormData({
												...formData,
												rating: {
													...formData.rating,
													count: parseInt(
														e.target.value
													) || 0,
												},
											})
										}
										placeholder="128"
									/>
								</div>
							</div>

							{/* Tags */}
							<div>
								<Label>標籤（多選）</Label>
								<div className="flex flex-wrap gap-2 mt-2">
									{availableTags.map((tag) => (
										<Badge
											key={tag}
											variant={
												formData.tags.includes(tag)
													? "default"
													: "outline"
											}
											className={`cursor-pointer ${
												formData.tags.includes(tag)
													? "bg-purple-600"
													: ""
											}`}
											onClick={() => toggleTag(tag)}
										>
											{tag}
										</Badge>
									))}
								</div>
							</div>

							{/* Images */}
							<div>
								<Label>商品圖片</Label>
								<div className="mt-2 space-y-3">
									{formData.images.map((image, index) => (
										<div
											key={index}
											className="p-4 space-y-2 border rounded-lg bg-gray-50"
										>
											<div className="flex gap-2">
												<div className="flex-1">
													<Label className="mb-1 text-xs text-gray-600">
														圖片 URL（或上傳圖片）
													</Label>
													<Input
														value={image}
														onChange={(e) =>
															updateImage(
																index,
																e.target.value
															)
														}
														placeholder="https://example.com/image.jpg 或上傳圖片"
													/>
												</div>
												{formData.images.length > 1 && (
													<Button
														type="button"
														variant="outline"
														onClick={() =>
															removeImage(index)
														}
														className="mt-6"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												)}
											</div>
											
											<div className="flex items-center gap-2">
												<div className="flex-1">
													<Label
														htmlFor={`upload-${index}`}
														className="cursor-pointer"
													>
														<div className="flex items-center gap-2 px-4 py-2 transition-colors border border-purple-300 border-dashed rounded-lg hover:border-purple-500 hover:bg-purple-50">
															<Upload className="w-4 h-4 text-purple-600" />
															<span className="text-sm text-purple-600">
																{uploadingImage
																	? "上傳中..."
																	: "點擊上傳圖片"}
															</span>
														</div>
													</Label>
													<input
														id={`upload-${index}`}
														type="file"
														accept="image/*"
														onChange={(e) =>
															handleImageUpload(e, index)
														}
														className="hidden"
														disabled={uploadingImage}
													/>
												</div>
												{image && (
													<div className="w-20 h-20 overflow-hidden border rounded-lg">
														<img
															src={image}
															alt={`Preview ${index + 1}`}
															className="object-cover w-full h-full"
															onError={(e) => {
																e.target.style.display = "none";
															}}
														/>
													</div>
												)}
											</div>
										</div>
									))}
									<Button
										type="button"
										variant="outline"
										onClick={addImageField}
										className="w-full"
									>
										<ImageIcon className="w-4 h-4 mr-2" />
										新增圖片欄位
									</Button>
								</div>
								<p className="mt-2 text-sm text-gray-500">
									💡 提示：可直接上傳圖片（最大 5MB）或貼上圖片網址
								</p>
							</div>

							{/* Benefits */}
							<div>
								<Label>功效作用</Label>
								<div className="mt-2 space-y-2">
									{formData.benefits.map((benefit, index) => (
										<div
											key={index}
											className="flex gap-2"
										>
											<Input
												value={benefit}
												onChange={(e) =>
													updateBenefit(
														index,
														e.target.value
													)
												}
												placeholder="例如：招財進寶、增強財運"
											/>
											{formData.benefits.length > 1 && (
												<Button
													type="button"
													variant="outline"
													onClick={() =>
														removeBenefit(index)
													}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											)}
										</div>
									))}
									<Button
										type="button"
										variant="outline"
										onClick={addBenefit}
										className="w-full"
									>
										<Plus className="w-4 h-4 mr-2" />
										新增功效
									</Button>
								</div>
							</div>

							{/* Specifications */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div>
									<Label htmlFor="material">材質</Label>
									<Input
										id="material"
										value={
											formData.specifications.material
										}
										onChange={(e) =>
											setFormData({
												...formData,
												specifications: {
													...formData.specifications,
													material: e.target.value,
												},
											})
										}
										placeholder="例如：天然水晶"
									/>
								</div>
								<div>
									<Label htmlFor="size">尺寸</Label>
									<Input
										id="size"
										value={formData.specifications.size}
										onChange={(e) =>
											setFormData({
												...formData,
												specifications: {
													...formData.specifications,
													size: e.target.value,
												},
											})
										}
										placeholder="例如：10cm x 5cm"
									/>
								</div>
								<div>
									<Label htmlFor="weight">重量</Label>
									<Input
										id="weight"
										value={formData.specifications.weight}
										onChange={(e) =>
											setFormData({
												...formData,
												specifications: {
													...formData.specifications,
													weight: e.target.value,
												},
											})
										}
										placeholder="例如：200g"
									/>
								</div>
							</div>

							{/* Gift report types (which reports customer can choose as gift) */}
							<div className="space-y-2">
								<Label>贈送報告類型（顧客購買時可選一種）</Label>
								<div className="flex flex-wrap gap-3">
									{[
										{ value: "wealth", label: "財運" },
										{ value: "love", label: "感情" },
										{ value: "career", label: "事業" },
										{ value: "health", label: "健康" },
									].map(({ value, label }) => (
										<label key={value} className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={formData.giftReportTypes?.includes(value)}
												onChange={(e) => {
													const current = formData.giftReportTypes || [];
													const next = e.target.checked
														? [...current, value]
														: current.filter((t) => t !== value);
													setFormData({ ...formData, giftReportTypes: next });
												}}
												className="w-4 h-4"
											/>
											<span>{label}</span>
										</label>
									))}
								</div>
							</div>

							{/* Checkboxes */}
							<div className="flex gap-6">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.isDigital}
										onChange={(e) =>
											setFormData({
												...formData,
												isDigital: e.target.checked,
											})
										}
										className="w-4 h-4"
									/>
									<span>數位商品（無需物流）</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.isFeatured}
										onChange={(e) =>
											setFormData({
												...formData,
												isFeatured: e.target.checked,
											})
										}
										className="w-4 h-4"
									/>
									<span>精選商品</span>
								</label>
							</div>

							{/* Submit Button */}
							<Button
								type="submit"
								size="lg"
								className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
								disabled={loading}
							>
								{loading ? (
									<>
										<div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
										{isEditMode ? "更新中..." : "創建中..."}
									</>
								) : (
									<>
										<Save className="w-5 h-5 mr-2" />
										{isEditMode ? "更新商品" : "創建商品"}
									</>
								)}
							</Button>
						</form>
					</div>
				)}

				{/* Products List */}
				<div className="p-8 bg-white shadow-lg rounded-2xl">
					<h2 className="mb-6 text-2xl font-bold">
						現有商品 ({products.length})
					</h2>

					{products.length === 0 ? (
						<div className="py-12 text-center text-gray-500">
							<p>尚未有任何商品</p>
							<p className="mt-2 text-sm">
								點擊上方「新增商品」按鈕開始添加
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{products.map((product) => (
								<div
									key={product._id}
									className="overflow-hidden transition-shadow border rounded-lg hover:shadow-lg"
								>
									{/* Product Image */}
									{product.images && product.images.length > 0 && (
										<div className="relative h-48 bg-gray-100">
											<img
												src={product.images[0]}
												alt={product.name.zh_TW}
												className="object-cover w-full h-full"
											/>
											{product.isFeatured && (
												<Badge className="absolute bg-yellow-500 top-2 right-2">
													⭐ 精選
												</Badge>
											)}
										</div>
									)}
									
									{/* Product Info */}
									<div className="p-4">
										<h3 className="mb-2 text-lg font-semibold">
											{product.name.zh_TW}
										</h3>
										<p className="mb-3 text-sm text-gray-600 line-clamp-2">
											{product.description.zh_TW}
										</p>
										
										{/* Category & Element */}
										<div className="flex gap-2 mb-3">
											<Badge variant="outline">
												{product.category}
											</Badge>
											{product.elementType && product.elementType !== "none" && (
												<Badge 
													variant="outline"
													className="bg-gradient-to-r from-purple-50 to-pink-50"
												>
													{product.elementType}
												</Badge>
											)}
										</div>
										
										{/* Price & Stock */}
										<div className="flex items-center justify-between mb-4">
											<div>
												{product.originalPrice && product.originalPrice > product.price && (
													<span className="mr-2 text-sm text-gray-400 line-through">
														{product.currency === "HKD" && "HK$"}
														{product.currency === "CNY" && "¥"}
														{product.originalPrice}
													</span>
												)}
												<span className="text-lg font-bold text-purple-600">
													{product.currency === "HKD" && "HK$"}
													{product.currency === "CNY" && "¥"}
													{product.price}
												</span>
											</div>
											<span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
												庫存: {product.stock}
											</span>
										</div>
										
										{/* Sold Count & Rating */}
										<div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
											<span>
												已售: <strong className="text-blue-600">{product.soldCount || product.sold || 0}</strong>
											</span>
											{product.rating && product.rating.count > 0 && (
												<>
													<span className="text-gray-300">|</span>
													<span>
														評分: <strong className="text-yellow-600">{product.rating.average.toFixed(1)}</strong> ({product.rating.count})
													</span>
												</>
											)}
										</div>
										
										{/* Action Buttons */}
										<div className="flex gap-2">
											<Button
												onClick={() => handleEdit(product)}
												className="flex-1 bg-blue-500 hover:bg-blue-600"
												size="sm"
											>
												<Edit className="w-4 h-4 mr-1" />
												編輯
											</Button>
											<Button
												onClick={() => handleDelete(product._id)}
												variant="destructive"
												size="sm"
												className="flex-1"
											>
												<Trash2 className="w-4 h-4 mr-1" />
												刪除
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
