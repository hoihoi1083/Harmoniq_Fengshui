"use client";
import { useDroppable } from "@dnd-kit/core";
import _ from "lodash";
import {
	useState,
	useCallback,
	useRef,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from "react";
import {
	ITEM_TYPES,
	ROOM_COLORS,
	FURNITURE_TYPES_LABEL_CN,
	FURNITURE_TYPES_LABEL_TW,
	FURNITURE_TYPES,
} from "@/types/room";

import {
	Trash2,
	Save,
	Minus,
	Plus,
	RotateCcwSquare,
	Undo2,
	Redo2,
	Copy,
	Hand,
	Move,
	Crosshair,
	Target,
} from "lucide-react";
import Image from "next/image";
import Undo from "./canvasComp/Undo";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import useMobile from "@/app/hooks/useMobile";
import { ToastContainer, toast } from "react-toastify";
import { debounce } from "lodash";

const MAX_SCALE = 120;
const MIN_SCALE = 20; // changed from 50 to 20
let containerRect;
export const Canvas = forwardRef(
	(
		{
			items,
			onShowTab,
			showTab,
			history,
			historyIndex,
			setHistory,
			setHistoryIndex,
			handleUndo,
			handleRedo,
			onGenReport,
			locale,
			onDemoAction = () => {}, // ADD THIS PROP
			onItemsChange = () => {},
		},
		ref
	) => {
		const FURNITURE_TYPES_LABEL =
			locale === "zh-TW"
				? FURNITURE_TYPES_LABEL_TW
				: FURNITURE_TYPES_LABEL_CN;
		const t = useTranslations("design");
		const isMobile = useMobile();
		const canvasRef = useRef(null); // Add canvas ref
		const [position, setPosition] = useState({ x: 0, y: 0 });
		const [isDragging, setIsDragging] = useState(false);
		const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
		const [activeRoom, setActiveRoom] = useState(null);
		const [canvasSize, setCanvasSize] = useState(() => {
			if (typeof window !== "undefined" && window.innerWidth < 768) {
				// Mobile: make canvas much larger - 3x viewport size instead of 1.5x
				return {
					width: window.innerWidth * 3,
					height: window.innerHeight * 3,
				};
			}
			// Desktop: keep large canvas
			return { width: 2000, height: 2000 };
		});
		const [isRoomDragging, setIsRoomDragging] = useState(false);
		const [roomDragStart, setRoomDragStart] = useState({ x: 0, y: 0 });
		const [draggedRoom, setDraggedRoom] = useState(null);
		const [localItems, setLocalItems] = useState([]);
		const [isResizing, setIsResizing] = useState(false);
		const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
		const [resizeCorner, setResizeCorner] = useState(null);
		const [scale, setScale] = useState(isMobile ? 35 : 60); // Changed from 30 to 35 for mobile
		const [touchStore, setTouchStore] = useState({
			originScale: 100,
			isMoving: false,
			pageX: 0,
			pageY: 0,
			pageX2: 0,
			pageY2: 0,
			initialDistance: 0,
		});
		const [compassRotation, setCompassRotation] = useState(0);
		const [selectedItems, setSelectedItems] = useState([]);
		const [multiSelectHintShown, setMultiSelectHintShown] = useState(false);

		// --- NEW: Mobile selection state for tap-to-select behavior ---
		const [mobileSelectedItem, setMobileSelectedItem] = useState(null);
		const longPressTimeout = useRef();
		const tapTimeout = useRef();

		// New state variables (around line 99)
		const [dragState, setDragState] = useState({
			mode: "none", // "none", "preparing", "dragging", "selecting"
			startTime: 0,
			startPosition: { x: 0, y: 0 },
			currentPosition: { x: 0, y: 0 },
			item: null,
		});

		const [mobileHints, setMobileHints] = useState({
			showDragHint: true,
			showZoomHint: true,
			showRotateHint: true,
		});
		const [mobileMode, setMobileMode] = useState("move"); // move | select | pan
		const panRafRef = useRef(null);
		const pendingPanRef = useRef(null);

		// Debug position changes and test transforms
		useEffect(() => {const canvas = document.getElementById("canvas");
			if (canvas) {
				const computedStyle = window.getComputedStyle(canvas);// Test if we can set a simple transform
				canvas.style.setProperty(
					"transform",
					`translate(${position.x}px, ${position.y}px) scale(${scale / 100})`,
					"important"
				);// Check if it actually applied
				setTimeout(() => {
					const newComputedStyle = window.getComputedStyle(canvas);}, 100);
			}
		}, [position, scale]);

		// Debug scale changes
		useEffect(() => {}, [scale]);

		// Enhanced mobile touch handling - REPLACE your handleItemTouchStart
		const handleItemTouchStart = (e, item) => {
			if (!isMobile) return;
			if (mobileMode === "pan") return;
			if (mobileMode === "select") {
				setMobileSelectedItem(item);
				onHandleActiveRoom(item);
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			// Clear any existing tap timeout
			if (tapTimeout.current) {
				clearTimeout(tapTimeout.current);
				tapTimeout.current = null;
			}

			// If item is already selected for mobile, allow dragging
			if (mobileSelectedItem?.id === item.id) {
				// Start dragging immediately
				handleRoomMouseDown(e, item);
				return;
			}

			// Set up long press for multi-select
			longPressTimeout.current = setTimeout(() => {
				setSelectedItems((prev) => {
					if (prev.includes(item.id)) {
						return prev.filter((id) => id !== item.id);
					} else {
						return [...prev, item.id];
					}
				});
			}, 500);

			// Prevent the immediate drag behavior on mobile
			e.preventDefault();
			e.stopPropagation();
		};

		// Enhanced touch move with drag preview
		const handleItemTouchMove = (e, item) => {
			if (!isMobile || dragState.mode === "none") return;

			const touch = e.touches[0];
			const deltaX = touch.clientX - dragState.startPosition.x;
			const deltaY = touch.clientY - dragState.startPosition.y;
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			// Update current position for drag preview
			setDragState((prev) => ({
				...prev,
				currentPosition: { x: touch.clientX, y: touch.clientY },
			}));

			// Auto-start drag if user moves finger significantly
			if (dragState.mode === "preparing" && distance > 10) {
				setDragState((prev) => ({ ...prev, mode: "dragging" }));
				handleRoomMouseDown(e, item);
			}
		};

		// REPLACE your handleItemTouchEnd
		const handleItemTouchEnd = (e, item) => {
			if (!isMobile) return;

			// Clear long press timeout
			if (longPressTimeout.current) {
				clearTimeout(longPressTimeout.current);
				longPressTimeout.current = null;
			}

			// If this was a quick tap (not a long press), select the item
			tapTimeout.current = setTimeout(() => {
				if (mobileSelectedItem?.id !== item.id) {
					setMobileSelectedItem(item);
					onHandleActiveRoom(item);
				}
				tapTimeout.current = null;
			}, 50);
		};

		const handleCanvasTouch = (e) => {
			if (!isMobile) return;
			if (e.target.id === "canvas") {
				setMobileSelectedItem(null);
				setSelectedItems([]); // Also clear multi-selection
				setActiveRoom(null); // Clear active room
			}
		};

		useImperativeHandle(
			ref,
			() => ({
				getLocalItems: () => localItems,
				setLocalItems,
				setActiveRoom,
				getActiveRoom: () => activeRoom,
				getSelectedItems: () => selectedItems,
				setIsRoomDragging,
				setDraggedRoom,
				setRoomDragStart,
				setPosition,
				setCompassRotation,
				getPosition: () => position,
				getCompassRotation: () => compassRotation,
				getScale: () => scale,
				setScale,
				// Add mobile selection methods
				getMobileSelectedItem: () => mobileSelectedItem,
				setMobileSelectedItem,
			}),
			[
				localItems,
				position,
				compassRotation,
				scale,
				activeRoom,
				selectedItems,
				mobileSelectedItem,
			]
		);

		const containerRef = useRef(null);
		const { setNodeRef } = useDroppable({
			id: "canvas",
			data: {
				accepts: [ITEM_TYPES.ROOM, ITEM_TYPES.FURNITURE],
			},
		});
		useEffect(() => {
			containerRect = document
				.getElementById("canvas-drop-area")
				?.getBoundingClientRect();
		}, []);

		const getDistance = (x1, y1, x2, y2) => {
			return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		};

		// Enhanced Sizehandler with responsive sizing
		const Sizehandler = (room) => {
			// Responsive sizing for resize handles
			const handleSize = isMobile ? 32 : 24; // Smaller handles for mobile
			const handleOffset = isMobile ? -16 : -12;
			const borderWidth = isMobile ? 3 : 2;

			// Get the rotation of the item - only apply to furniture
			const rotation =
				room.type === ITEM_TYPES.FURNITURE && room.rotation
					? room.rotation
					: 0;

			const handleStyle = {
				width: handleSize,
				height: handleSize,
				zIndex: 10,
				border: `${borderWidth}px solid #ef4444`,
				boxShadow: isMobile
					? "0 2px 8px rgba(0,0,0,0.2)"
					: "0 1px 3px rgba(0,0,0,0.12)",
				// Apply rotation only if the item is furniture and has rotation
				...(rotation !== 0 && {
					transform: `rotate(${rotation}deg)`,
					transformOrigin: "center",
				}),
			};

			return (
				<>
					{/* Top-left handle */}
					<div
						className="absolute bg-white rounded-full cursor-nw-resize"
						style={{
							top: handleOffset,
							left: handleOffset,
							...handleStyle,
						}}
						onMouseDown={(e) =>
							handleResizeStart(e, room, "top-left")
						}
						onTouchStart={(e) =>
							handleResizeStart(e, room, "top-left")
						}
					>
						{isMobile && (
							<div className="absolute bg-gray-100 rounded-full opacity-50 inset-1" />
						)}
					</div>

					{/* Top-right handle */}
					<div
						className="absolute bg-white rounded-full cursor-ne-resize"
						style={{
							top: handleOffset,
							right: handleOffset,
							...handleStyle,
						}}
						onMouseDown={(e) =>
							handleResizeStart(e, room, "top-right")
						}
						onTouchStart={(e) =>
							handleResizeStart(e, room, "top-right")
						}
					>
						{isMobile && (
							<div className="absolute bg-gray-100 rounded-full opacity-50 inset-1" />
						)}
					</div>

					{/* Bottom-left handle */}
					<div
						className="absolute bg-white rounded-full cursor-sw-resize"
						style={{
							bottom: handleOffset,
							left: handleOffset,
							...handleStyle,
						}}
						onMouseDown={(e) =>
							handleResizeStart(e, room, "bottom-left")
						}
						onTouchStart={(e) =>
							handleResizeStart(e, room, "bottom-left")
						}
					>
						{isMobile && (
							<div className="absolute bg-gray-100 rounded-full opacity-50 inset-1" />
						)}
					</div>

					{/* Bottom-right handle */}
					<div
						className="absolute bg-white rounded-full cursor-se-resize"
						style={{
							bottom: handleOffset,
							right: handleOffset,
							...handleStyle,
						}}
						onMouseDown={(e) =>
							handleResizeStart(e, room, "bottom-right")
						}
						onTouchStart={(e) =>
							handleResizeStart(e, room, "bottom-right")
						}
					>
						{isMobile && (
							<div className="absolute bg-gray-100 rounded-full opacity-50 inset-1" />
						)}
					</div>

					{/* Mobile: Add center move handle for easier dragging */}
					{isMobile && (
						<div
							className="absolute bg-white border-2 border-blue-500 rounded-full shadow-lg"
							style={{
								top: "50%",
								left: "50%",
								transform:
									rotation !== 0
										? `translate(-50%, -50%) rotate(${rotation}deg)`
										: "translate(-50%, -50%)",
								width: 24,
								height: 24,
								zIndex: 15,
								cursor: "move",
								transformOrigin: "center",
							}}
							onTouchStart={(e) => handleRoomMouseDown(e, room)}
						>
							<div className="absolute bg-blue-100 rounded-full inset-1 opacity-60" />
							<div className="absolute bg-blue-300 rounded-full inset-2" />
						</div>
					)}
				</>
			);
		};

		// Enhanced touch/gesture handling for mobile
		const [isPinching, setIsPinching] = useState(false);
		const [lastPinchDistance, setLastPinchDistance] = useState(0);

		// Improved canvas mouse/touch down with better mobile support
		const handleCanvasMouseDown = useCallback(
			(e) => {
				// Allow events on the canvas element or its container (for panning)
				const isCanvasElement =
					e.target.id === "canvas" ||
					e.target.closest("#canvas") ||
					e.target === containerRef.current;

				// Skip if clicking on room elements or UI controls
				if (
					e.target.closest('[data-room-element="true"]') ||
					e.target.closest(".compass-btn") ||
					e.target.closest("button")
				) {
					return;
				}

				// Only handle left mouse button or touch
				if (e.button !== 0 && !e.touches) return;// Clear mobile selection when touching canvas
				if (isMobile) {
					setMobileSelectedItem(null);
				}

				// Enhanced pinch-to-zoom for mobile
				if (e.touches?.length === 2) {
					const touch1 = e.touches[0];
					const touch2 = e.touches[1];
					const initialDistance = getDistance(
						touch1.pageX,
						touch1.pageY,
						touch2.pageX,
						touch2.pageY
					);

					setIsPinching(true);
					setLastPinchDistance(initialDistance);
					setTouchStore((prev) => ({
						...prev,
						isMoving: true,
						pageX: touch1.pageX,
						pageY: touch1.pageY,
						pageX2: touch2.pageX,
						pageY2: touch2.pageY,
						initialDistance,
						originScale: scale,
					}));
					return;
				}

				// Start canvas panning
				if (isMobile && mobileMode !== "pan") {
					return;
				}
				setActiveRoom(null);
				setIsDragging(true);
				if (e.touches?.length === 1) {
					setDragStart({
						x: e.touches[0].clientX - position.x,
						y: e.touches[0].clientY - position.y,
					});
				} else {
					setDragStart({
						x: e.clientX - position.x,
						y: e.clientY - position.y,
					});
				}},
			[position, scale, isMobile, mobileMode]
		);

		const furnitureInroom = (furniture, parentRoom) => {
			if (!furniture.position || !parentRoom.position) return false;
			let t = 20;
			if (furniture.rotation === -90 || furniture.rotation === -270) {
				t =
					Math.abs(furniture.size.width - furniture.size.height) / 2 +
					t;
			}
			return (
				furniture.position.x + t >= parentRoom.position.x &&
				furniture.position.x <=
					parentRoom.position.x + parentRoom.size.width &&
				furniture.position.x - t + furniture.size.width <=
					parentRoom.position.x + parentRoom.size.width &&
				furniture.position.y + t >= parentRoom.position.y &&
				furniture.position.y <=
					parentRoom.position.y + parentRoom.size.height &&
				furniture.position.y - t + furniture.size.height <=
					parentRoom.position.y + parentRoom.size.height
			);
		};

		const handleRoomMouseDown = useCallback(
			(e, room) => {
				e.stopPropagation();

				// Check if this is part of a multi-selection (works for both desktop and mobile)
				if (
					selectedItems.length > 0 &&
					selectedItems.includes(room.id)
				) {
					// Start multi-item drag
					setIsRoomDragging(true);
					setDraggedRoom(room); // Use as reference for multi-drag

					if (e.touches?.length == 1) {
						setRoomDragStart({
							x: e.touches[0].clientX,
							y: e.touches[0].clientY,
						});
					} else {
						setRoomDragStart({
							x: e.clientX,
							y: e.clientY,
						});
					}
					return;
				}

				// Mobile individual selection check (only if NOT in multi-selection)
				if (
					isMobile &&
					mobileSelectedItem?.id !== room.id &&
					selectedItems.length === 0
				) {
					return;
				}

				setIsRoomDragging(true);
				setDraggedRoom(room);
				if (e.touches?.length == 1) {
					setRoomDragStart({
						x: e.touches[0].clientX - room.position.x,
						y: e.touches[0].clientY - room.position.y,
					});
				} else {
					setRoomDragStart({
						x: e.clientX - room.position.x,
						y: e.clientY - room.position.y,
					});
				}
				if (room.type === ITEM_TYPES.ROOM) {
					const furnitureList = localItems.map((item) => {
						if (
							item.type === ITEM_TYPES.FURNITURE &&
							furnitureInroom(item, room)
						) {
							// Only assign parentId if the furniture doesn't already belong to another room
							// or if it already belongs to this room
							if (
								item.parentId === null ||
								item.parentId === room.id
							) {
								return {
									...item,
									parentId: room.id,
									offset: {
										x: item.position.x - room.position.x,
										y: item.position.y - room.position.y,
									},
								};
							}
						}
						// Don't modify items that belong to other rooms or items not in this room
						return item;
					});
					let updatedItems = localItems.map((item) => {
						let target = furnitureList.find(
							(furniture) => furniture.id === item.id
						);
						return target || item;
					});
					setLocalItems(updatedItems);
				}
			},
			[localItems, isMobile, mobileSelectedItem, selectedItems] // Add selectedItems dependency
		);

		const handleResizeStart = useCallback((e, room, corner) => {
			e.stopPropagation();
			setIsResizing(true);
			setResizeCorner(corner);
			if (e.touches?.length == 1) {
				setResizeStart({
					x: e.touches[0].clientX,
					y: e.touches[0].clientY,
				});
			} else {
				setResizeStart({
					x: e.clientX,
					y: e.clientY,
				});
			}
		}, []);

		const debounceToastInfo = _.throttle(toast.info, 3000);

		const handleMouseMove = (e) => {
			e.preventDefault();

			// Update containerRect for accurate calculations
			if (containerRef.current) {
				containerRect = containerRef.current.getBoundingClientRect();
			}

			// Improved pinch-to-zoom (continuous)
			if (e.touches?.length === 2 && isPinching) {
				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				const currentDistance = getDistance(
					touch1.pageX,
					touch1.pageY,
					touch2.pageX,
					touch2.pageY
				);

				if (touchStore.initialDistance > 0) {
					const ratio = currentDistance / touchStore.initialDistance;
					const nextScale = Math.max(
						MIN_SCALE,
						Math.min(MAX_SCALE, touchStore.originScale * ratio)
					);
					setScale(nextScale);
					setLastPinchDistance(currentDistance);
				}
				return;
			}

			if (isResizing && activeRoom && resizeCorner) {
				let deltaX, deltaY;
				if (e.touches?.length == 1) {
					deltaX = e.touches[0].clientX - resizeStart.x;
					deltaY = e.touches[0].clientY - resizeStart.y;
				} else {
					deltaX = e.clientX - resizeStart.x;
					deltaY = e.clientY - resizeStart.y;
				}
				let ratio = activeRoom.size.width / activeRoom.size.height;
				const updatedItems = localItems.map((item) => {
					if (item.id === activeRoom.id) {
						const newSize = { ...item.size };
						const newPosition = { ...item.position };

						switch (resizeCorner) {
							case "top-left":
								newSize.width = item.size.width - deltaX;
								if (activeRoom.type === ITEM_TYPES.ROOM) {
									newSize.height = item.size.height - deltaY;
								} else {
									newSize.height = newSize.width / ratio;
								}
								newPosition.x = item.position.x + deltaX;
								newPosition.y = item.position.y + deltaY;
								break;
							case "top-right":
								newSize.width = item.size.width + deltaX;
								if (activeRoom.type === ITEM_TYPES.ROOM) {
									newSize.height = item.size.height - deltaY;
								} else {
									newSize.height = newSize.width / ratio;
								}
								newPosition.y = item.position.y + deltaY;
								break;
							case "bottom-left":
								newSize.width = item.size.width - deltaX;
								if (activeRoom.type === ITEM_TYPES.ROOM) {
									newSize.height = item.size.height + deltaY;
								} else {
									newSize.height = newSize.width / ratio;
								}
								newPosition.x = item.position.x + deltaX;
								break;
							case "bottom-right":
								newSize.width = item.size.width + deltaX;
								if (activeRoom.type === ITEM_TYPES.ROOM) {
									newSize.height = item.size.height + deltaY;
								} else {
									newSize.height = newSize.width / ratio;
								}
								break;
						}

						let condition;
						if (item.type === ITEM_TYPES.ROOM) {
							condition =
								newSize.width >= 100 && newSize.height >= 100;
						} else if (item.data.type === FURNITURE_TYPES.WINDOW) {
							condition =
								newSize.width >= 8 && newSize.height >= 8;
						} else
							condition =
								newSize.width >= 20 && newSize.height >= 20;

						if (condition) {
							return {
								...item,
								size: newSize,
								position: newPosition,
							};
						}
						return item;
					}
					return item;
				});
				setLocalItems(updatedItems);
				if (e.touches?.length == 1) {
					setResizeStart({
						x: e.touches[0].clientX,
						y: e.touches[0].clientY,
					});
				} else {
					setResizeStart({
						x: e.clientX,
						y: e.clientY,
					});
				}
			} else if (isRoomDragging && draggedRoom) {
				let newX, newY;
				if (e.touches?.length == 1) {
					newX = e.touches[0].clientX;
					newY = e.touches[0].clientY;
				} else {
					newX = e.clientX;
					newY = e.clientY;
				}

				// Calculate delta for multi-selection
				const deltaX = newX - roomDragStart.x;
				const deltaY = newY - roomDragStart.y;

				// Check if this is a multi-selection drag
				if (
					selectedItems.length > 0 &&
					selectedItems.includes(draggedRoom.id)
				) {
					// Move all selected items
					const updatedItems = localItems.map((item) => {
						if (selectedItems.includes(item.id)) {
							return {
								...item,
								position: {
									x: Math.max(
										0,
										item.position.x + deltaX / (scale / 100)
									),
									y: Math.max(
										0,
										item.position.y + deltaY / (scale / 100)
									),
								},
							};
						}
						return item;
					});
					setLocalItems(updatedItems);

					// Update drag start for next frame
					setRoomDragStart({ x: newX, y: newY });
					return;
				}

				newX = newX - roomDragStart.x;
				newY = newY - roomDragStart.y;
				newX = Math.max(0, newX);
				newY = Math.max(0, newY);
				let updatedItems = [];
				if (draggedRoom.type === ITEM_TYPES.ROOM) {
					const furnitureIdList = localItems
						.filter((item) => {
							return (
								item.type === ITEM_TYPES.FURNITURE &&
								item.parentId === draggedRoom.id
							);
						})
						.map((item) => item.id);

					updatedItems = localItems.map((item) => {
						if (item.id === draggedRoom.id) {
							return {
								...item,
								position: {
									x: newX,
									y: newY,
								},
							};
						} else if (furnitureIdList.includes(item.id)) {
							return {
								...item,
								position: {
									x: newX + item.offset?.x || 0,
									y: newY + item.offset?.y || 0,
								},
							};
						}
						return item;
					});
				} else {
					updatedItems = localItems.map((item) => {
						if (item.id === draggedRoom.id) {
							return {
								...item,
								position: {
									x: newX,
									y: newY,
								},
							};
						}
						return item;
					});
				}
				setLocalItems(updatedItems);
			} else if (isDragging) {
				let newX, newY;
				if (e.touches?.length === 1) {
					newX = e.touches[0].clientX - dragStart.x;
					newY = e.touches[0].clientY - dragStart.y;
				} else {
					newX = e.clientX - dragStart.x;
					newY = e.clientY - dragStart.y;
				}
				if (newX > 0) newX = 0;
				if (newY > 0) newY = 0;
				if (newX < -1000) newX = -1000;
				if (newY < -1000) newY = -1000;let canvasWidth, canvasHeight;
				if (2000 + newX < containerRect.width / (scale / 100)) {
					canvasWidth = (2000 - newX) / (scale / 100);
				}
				if (2000 + newY < containerRect.height / (scale / 100)) {
					canvasHeight = (2000 - newY) / (scale / 100);
				}

				pendingPanRef.current = { x: newX, y: newY };
				if (!panRafRef.current) {
					panRafRef.current = requestAnimationFrame(() => {
						if (pendingPanRef.current) {
							setPosition(pendingPanRef.current);
						}
						panRafRef.current = null;
					});
				}
				setCanvasSize({
					width: canvasWidth || canvasSize.width,
					height: canvasHeight || canvasSize.height,
				});
				// Notify demo of pan action
				onDemoAction("pan", { x: newX, y: newY });
			}
		};

		const handleMouseUp = useCallback(
			(e) => {
				if (e.touches?.length < 2) {
					setIsPinching(false);
					setLastPinchDistance(0);
					setTouchStore((prev) => ({
						...prev,
						isMoving: false,
						initialDistance: 0,
					}));
				}

				if (isRoomDragging || isResizing) {
					let newX, newY;
					if (e.changedTouches?.length == 1) {
						newX =
							e.changedTouches[0].clientX -
							roomDragStart.x -
							position.x;
						newY =
							e.changedTouches[0].clientY -
							roomDragStart.y -
							position.y;
					} else {
						newX = e.clientX - roomDragStart.x - position.x;
						newY = e.clientY - roomDragStart.y - position.y;
					}

					let newItems;
					if (
						draggedRoom &&
						!localItems.some((item) => item.id === draggedRoom.id)
					) {
						const newRoom = {
							...draggedRoom,
							position: {
								x: newX / (scale / 100),
								y: newY / (scale / 100),
							},
							data: {
								...draggedRoom.data,
								label: `${draggedRoom.data.label}`,
							},
						};
						newItems = [...localItems, newRoom];
						setLocalItems(newItems);
						onHandleActiveRoom(newRoom, newItems);
					} else {
						newItems = localItems;
					}

					const newHistory = history.slice(0, historyIndex + 1);
					newHistory.push(newItems);
					setHistory(newHistory);
					setHistoryIndex(newHistory.length - 1);
				}

				setIsDragging(false);
				setIsRoomDragging(false);
				setDraggedRoom(null);
				setIsResizing(false);
				setResizeCorner(null);
			},
			[
				isRoomDragging,
				isResizing,
				localItems,
				history,
				historyIndex,
				roomDragStart,
				draggedRoom,
				position,
				touchStore,
			]
		);

		const onHandleActiveRoom = (room, _localItems) => {
			if (room.type === ITEM_TYPES.FURNITURE) {
				const currentItems = _localItems || localItems;
				let parentRoom = currentItems.find((item) => {
					return (
						item.type === ITEM_TYPES.ROOM &&
						furnitureInroom(room, item)
					);
				});
				if (!parentRoom) {
					let newLocalItems = _.cloneDeep(currentItems);
					let target = newLocalItems.filter(
						(item) => item.id === room.id
					)[0];
					if (target) {
						target.data.label = `未分配-${
							FURNITURE_TYPES_LABEL[target.data.type]
						}`;
						target.data.parentRoom = null;
						room.data.label = `未分配-${
							FURNITURE_TYPES_LABEL[target.data.type]
						}`;
						room.data.parentRoom = null;
						setLocalItems(newLocalItems);
					}
				} else {
					const furnitureList = currentItems
						.filter(
							(item) =>
								item.type === ITEM_TYPES.FURNITURE &&
								item.data.type === room.data.type &&
								furnitureInroom(item, parentRoom)
						)
						.sort((a, b) => a.position.x - b.position.x)
						.map((item, index) => {
							let label = `${parentRoom.data.label}-${
								FURNITURE_TYPES_LABEL[room.data.type]
							}${index + 1}`;
							if (item.id === room.id) {
								room.data.label = label;
								room.data.parentRoom = parentRoom;
							}
							return {
								...item,
								data: {
									...item.data,
									label,
									parentRoom,
								},
							};
						});
					let newLocalItems = currentItems.map((item) => {
						let target = furnitureList.find(
							(furniture) => furniture.id === item.id
						);
						return target || item;
					});
					setLocalItems(newLocalItems);
				}
			}
			setTimeout(() => {
				setActiveRoom(room);
			});
		};

		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			container.addEventListener("mousedown", handleCanvasMouseDown);
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);

			container.addEventListener("touchstart", handleCanvasMouseDown);
			window.addEventListener("touchmove", handleMouseMove, {
				passive: false,
			});
			window.addEventListener("touchend", handleMouseUp);

			return () => {
				container.removeEventListener(
					"mousedown",
					handleCanvasMouseDown
				);
				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("mouseup", handleMouseUp);

				container.removeEventListener(
					"touchstart",
					handleCanvasMouseDown
				);
				window.removeEventListener("touchmove", handleMouseMove);
				window.removeEventListener("touchend", handleMouseUp);
			};
		}, [handleCanvasMouseDown, handleMouseMove, handleMouseUp]);

		useEffect(() => {
			if (!isMobile) return;
			const handleResize = () => {
				setCanvasSize({
					width: window.innerWidth * 3, // Changed from 1.5 to 3
					height: window.innerHeight * 3, // Changed from 1.5 to 3
				});
			};
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, [isMobile]);

		// Mobile-specific helper functions
		const handleMobileQuickActions = () => {
			if (!activeRoom) return null;

			return (
				<div className="fixed flex gap-2 px-3 py-2 transform -translate-x-1/2 bg-white rounded-full shadow-lg bottom-40 left-1/2 md:hidden">
					{activeRoom.type === ITEM_TYPES.FURNITURE && (
						<button
							className="p-2 rounded-full bg-blue-50"
							onClick={handleRotate}
							title={t("rotate")}
						>
							<RotateCcwSquare className="w-4 h-4 text-blue-600" />
						</button>
					)}
					<button
						className="p-2 rounded-full bg-red-50"
						onClick={() => {
							const itemToDelete = activeRoom;
							const newItems = localItems.filter(
								(item) => item.id !== activeRoom.id
							);
							setLocalItems(newItems);
							setActiveRoom(null);
							// Notify demo of delete action for BOTH room and furniture
							onDemoAction("delete", itemToDelete);
						}}
						title={t("delete")}
					>
						<Trash2 className="w-4 h-4 text-red-600" />
					</button>
				</div>
			);
		};

		// Grid snap function for mobile precision
		const snapToGrid = (value, gridSize = 10) => {
			return Math.round(value / gridSize) * gridSize;
		};

		// Mobile-optimized zoom function
		const handleZoom = useCallback(
			(type, step = 5) => {
				let newScale;
				const mobileStep = isMobile ? 10 : step; // Larger steps for mobile

				if (type === "in" && scale < MAX_SCALE) {
					newScale = Math.min(scale + mobileStep, MAX_SCALE);
				} else if (type === "out" && scale > MIN_SCALE) {
					newScale = Math.max(scale - mobileStep, MIN_SCALE);
				} else if (type === "reset") {
					newScale = isMobile ? 35 : 60; // Changed from 40 to 35 for mobile
				} else {
					return;
				}if (type === "out") {
					setCanvasSize({
						width:
							(canvasSize.width -
								(position.x < 0 ? position.x : 0)) *
							(1 + (scale - newScale) / 100),
						height:
							(canvasSize.height -
								(position.y < 0 ? position.y : 0)) *
							(1 + (scale - newScale) / 100),
					});
				}
				setScale(newScale);

				// Notify demo of zoom action
				onDemoAction("zoom", { type, scale: newScale });
			},
			[scale, isMobile, canvasSize, position.x, position.y, onDemoAction]
		);

		const fitToContent = useCallback(() => {
			if (!localItems.length || !containerRef.current) return;
			const bounds = localItems.reduce(
				(acc, item) => ({
					minX: Math.min(acc.minX, item.position.x),
					minY: Math.min(acc.minY, item.position.y),
					maxX: Math.max(acc.maxX, item.position.x + item.size.width),
					maxY: Math.max(acc.maxY, item.position.y + item.size.height),
				}),
				{ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
			);
			const c = containerRef.current.getBoundingClientRect();
			// Keep content away from mobile UI clusters (top-left tools, bottom actions)
			const mobileInset = isMobile
				? { left: 120, right: 24, top: 150, bottom: 190 }
				: { left: 16, right: 16, top: 16, bottom: 16 };
			const availableWidth = Math.max(
				120,
				c.width - mobileInset.left - mobileInset.right
			);
			const availableHeight = Math.max(
				120,
				c.height - mobileInset.top - mobileInset.bottom
			);
			const contentW = Math.max(1, bounds.maxX - bounds.minX);
			const contentH = Math.max(1, bounds.maxY - bounds.minY);
			const minFitScale = isMobile ? 30 : MIN_SCALE;
			const nextScale = Math.max(
				minFitScale,
				Math.min(
					MAX_SCALE,
					Math.floor(
						Math.min(
							(availableWidth * 0.8) / contentW,
							(availableHeight * 0.8) / contentH
						) * 100
					)
				)
			);
			const targetCenterX = mobileInset.left + availableWidth / 2;
			const targetCenterY = mobileInset.top + availableHeight / 2;
			const contentCenterX = bounds.minX + contentW / 2;
			const contentCenterY = bounds.minY + contentH / 2;
			setScale(nextScale);
			setPosition({
				x: targetCenterX - contentCenterX * (nextScale / 100),
				y: targetCenterY - contentCenterY * (nextScale / 100),
			});
		}, [localItems, isMobile]);

		const centerOnActiveRoom = useCallback(() => {
			const room = activeRoom || mobileSelectedItem;
			if (!room || !containerRef.current) return;
			const c = containerRef.current.getBoundingClientRect();
			const mobileInset = isMobile
				? { left: 120, right: 24, top: 150, bottom: 190 }
				: { left: 16, right: 16, top: 16, bottom: 16 };
			const availableWidth = Math.max(
				120,
				c.width - mobileInset.left - mobileInset.right
			);
			const availableHeight = Math.max(
				120,
				c.height - mobileInset.top - mobileInset.bottom
			);
			const targetCenterX = mobileInset.left + availableWidth / 2;
			const targetCenterY = mobileInset.top + availableHeight / 2;
			const cx = room.position.x + room.size.width / 2;
			const cy = room.position.y + room.size.height / 2;
			setPosition({
				x: targetCenterX - cx * (scale / 100),
				y: targetCenterY - cy * (scale / 100),
			});
		}, [activeRoom, mobileSelectedItem, scale, isMobile]);

		const resetView = useCallback(() => {
			setPosition({ x: 0, y: 0 });
			setScale(isMobile ? 35 : 60);
		}, [isMobile]);

		const handleRotate = useCallback(() => {
			if (!activeRoom) return;
			let rotatedRoom = null;
			const updatedItems = localItems.map((item) => {
				if (item.id === activeRoom.id) {
					const newRotation = ((item.rotation || 0) - 45) % 360;
					const updatedItem = {
						...item,
						rotation: newRotation,
					};
					rotatedRoom = updatedItem; // Store the rotated room
					return updatedItem;
				}
				return item;
			});
			setLocalItems(updatedItems);
			// Notify demo of rotation action with the correct rotated room
			onDemoAction("rotate", rotatedRoom);
		}, [activeRoom, localItems, onDemoAction]); // Also add onDemoAction to dependencies

		const onCompassClick = () => {
			let newRotation = compassRotation + 45;
			setCompassRotation(newRotation);
			// Notify demo of compass action
			onDemoAction("compass-clicked", { rotation: newRotation }); // CHANGE: from "compass" to "compass-clicked"
		};

		const directions = [
			t("north"), // 0°
			t("northeast"), // 45°
			t("east"), // 90°
			t("southeast"), // 135°
			t("south"), // 180°
			t("southwest"), // 225°
			t("west"), // 270°
			t("northwest"), // 315°
		];

		function getDirectionLabel(degree) {
			const normalized = ((degree % 360) + 360) % 360;
			const index = Math.round(normalized / 45) % 8;
			return directions[index];
		}

		// Double-click handler for multi-selection (desktop)
		const handleItemDoubleClick = (e, item) => {
			if (isMobile) return; // Prevent double-tap on mobile
			e.stopPropagation();
			setSelectedItems((prev) => {
				if (prev.includes(item.id)) {
					return prev.filter((id) => id !== item.id);
				} else {
					return [...prev, item.id];
				}
			});
		};

		// Clear selection when double-clicking canvas background
		const handleCanvasDoubleClick = (e) => {
			if (e.target.id === "canvas") {
				setSelectedItems([]);
			}
		};

		// Multi-rotate selected items
		const handleMultiRotate = () => {
			if (selectedItems.length === 0) return;

			// Store the rotated items for demo action
			const rotatedItems = [];

			const updatedItems = localItems.map((item) => {
				if (selectedItems.includes(item.id)) {
					const newRotation = ((item.rotation || 0) - 45) % 360;
					const rotatedItem = { ...item, rotation: newRotation };
					rotatedItems.push(rotatedItem); // Store rotated item
					return rotatedItem;
				}
				return item;
			});
			setLocalItems(updatedItems);

			// Notify demo of multi-rotation action
			onDemoAction("rotate", rotatedItems);
		};

		// Multi-delete selected items
		const handleMultiDelete = () => {
			if (selectedItems.length === 0) return;

			// Store deleted items for demo action
			const deletedItems = localItems.filter((item) =>
				selectedItems.includes(item.id)
			);

			const updatedItems = localItems.filter(
				(item) => !selectedItems.includes(item.id)
			);
			setLocalItems(updatedItems);
			setSelectedItems([]);
			if (activeRoom && selectedItems.includes(activeRoom.id)) {
				setActiveRoom(null);
			}

			// Notify demo of delete action
			onDemoAction("delete", deletedItems);
		};

		// New: Multi-move selected items
		const handleMultiMove = useCallback(
			(deltaX, deltaY) => {
				if (selectedItems.length === 0) return;

				const updatedItems = localItems.map((item) => {
					if (selectedItems.includes(item.id)) {
						return {
							...item,
							position: {
								x: Math.max(0, item.position.x + deltaX),
								y: Math.max(0, item.position.y + deltaY),
							},
						};
					}
					return item;
				});
				setLocalItems(updatedItems);
			},
			[selectedItems, localItems]
		);

		const debouncedHandleMouseMove = useRef(
			debounce(handleMouseMove, 16)
		).current;

		useEffect(() => {
			window.addEventListener("touchmove", debouncedHandleMouseMove, {
				passive: false,
			});
			return () => {
				window.removeEventListener(
					"touchmove",
					debouncedHandleMouseMove
				);
			};
		}, [debouncedHandleMouseMove]);

		// Enhanced drag feedback and precision
		const handleMobileDrag = (e, item) => {
			// Add visual feedback during drag
			const dragElement = e.target.closest('[data-room-element="true"]');
			if (dragElement) {
				dragElement.style.transform = "scale(1.05)";
				dragElement.style.zIndex = "1000";
				dragElement.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
			}

			// Snap to grid for better precision
			const snappedPosition = {
				x: snapToGrid(newX, 15), // 15px grid for mobile
				y: snapToGrid(newY, 15),
			};

			// Provide haptic feedback for snapping
			if (
				navigator.vibrate &&
				(Math.abs(snappedPosition.x - newX) < 5 ||
					Math.abs(snappedPosition.y - newY) < 5)
			) {
				navigator.vibrate(5);
			}
		};

		// Enhanced selection with selection rectangle
		const [selectionBox, setSelectionBox] = useState(null);

		const handleSelectionStart = (e) => {
			if (e.target.id === "canvas" && e.button === 0) {
				const startX = (e.clientX - position.x) / (scale / 100);
				const startY = (e.clientY - position.y) / (scale / 100);

				setSelectionBox({
					startX,
					startY,
					currentX: startX,
					currentY: startY,
					active: true,
				});
			}
		};

		const handleSelectionMove = (e) => {
			if (selectionBox?.active) {
				const currentX = (e.clientX - position.x) / (scale / 100);
				const currentY = (e.clientY - position.y) / (scale / 100);

				setSelectionBox((prev) => ({
					...prev,
					currentX,
					currentY,
				}));

				// Update selected items based on selection box
				const selectedIds = localItems
					.filter((item) => {
						return isItemInSelectionBox(item, selectionBox);
					})
					.map((item) => item.id);

				setSelectedItems(selectedIds);
			}
		};

		// Selection box visualization
		{
			selectionBox?.active && (
				<div
					className="absolute border-2 border-blue-500 pointer-events-none bg-blue-100/20"
					style={{
						left: Math.min(
							selectionBox.startX,
							selectionBox.currentX
						),
						top: Math.min(
							selectionBox.startY,
							selectionBox.currentY
						),
						width: Math.abs(
							selectionBox.currentX - selectionBox.startX
						),
						height: Math.abs(
							selectionBox.currentY - selectionBox.startY
						),
						zIndex: 1000,
					}}
				/>
			);
		}

		// Intelligent zoom system that adapts to content
		const SmartZoomSystem = () => {
			const [autoZoom, setAutoZoom] = useState(true);
			const [zoomPresets] = useState([
				{ label: t("overview"), value: 25 },
				{ label: t("design"), value: 35 },
				{ label: t("detail"), value: 50 },
				{ label: t("precise"), value: 75 },
			]);

			// Auto-zoom to fit content
			const fitToContent = useCallback(() => {
				if (localItems.length === 0) return;

				const bounds = calculateItemsBounds(localItems);
				const containerWidth = window.innerWidth;
				const containerHeight = window.innerHeight - 200; // Account for UI

				const scaleX = containerWidth / bounds.width;
				const scaleY = containerHeight / bounds.height;
				const optimalScale = Math.min(scaleX, scaleY, 0.8) * 100;

				setScale(
					Math.max(MIN_SCALE, Math.min(MAX_SCALE, optimalScale))
				);

				// Center the content
				const centerX = -(
					bounds.left +
					bounds.width / 2 -
					containerWidth / 2
				);
				const centerY = -(
					bounds.top +
					bounds.height / 2 -
					containerHeight / 2
				);
				setPosition({ x: centerX, y: centerY });
			}, [localItems]);

			return (
				<div className="fixed z-50 flex flex-col gap-2 top-20 right-4">
					{/* Zoom presets */}
					<div className="p-2 shadow-lg bg-white/95 backdrop-blur rounded-2xl">
						{zoomPresets.map((preset) => (
							<button
								key={preset.value}
								className={`w-full px-3 py-2 text-sm rounded-xl transition-colors ${
									Math.abs(scale - preset.value) < 5
										? "bg-blue-500 text-white"
										: "hover:bg-gray-100"
								}`}
								onClick={() => setScale(preset.value)}
							>
								{preset.label}
							</button>
						))}

						<button
							className="w-full px-3 py-2 mt-2 text-sm border-t border-gray-200 rounded-xl hover:bg-gray-100"
							onClick={fitToContent}
						>
							<Maximize className="inline w-4 h-4 mr-2" />
							{t("fitToContent")}
						</button>
					</div>
				</div>
			);
		};

		// Floating action button system
		const MobileFloatingControls = () => {
			const [expanded, setExpanded] = useState(false);
			const [showHints, setShowHints] = useState(true);

			return (
				<>
					{/* Main FAB */}
					<div className="fixed z-50 bottom-32 right-6">
						<button
							className="flex items-center justify-center text-white bg-blue-500 rounded-full shadow-xl w-14 h-14"
							onClick={() => setExpanded(!expanded)}
						>
							<Plus
								className={`w-6 h-6 transition-transform ${
									expanded ? "rotate-45" : ""
								}`}
							/>
						</button>

						{/* Expanded actions */}
						<div
							className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all ${
								expanded
									? "opacity-100 scale-100"
									: "opacity-0 scale-75 pointer-events-none"
							}`}
						>
							<ActionButton
								icon={<Undo2 className="w-5 h-5" />}
								label={t("undo")}
								onClick={handleUndo}
								disabled={historyIndex <= 0}
							/>
							<ActionButton
								icon={<Redo2 className="w-5 h-5" />}
								label={t("redo")}
								onClick={handleRedo}
								disabled={historyIndex >= history.length - 1}
							/>
							<ActionButton
								icon={<Copy className="w-5 h-5" />}
								label={t("duplicate")}
								onClick={handleDuplicate}
								disabled={!activeRoom}
							/>
							<ActionButton
								icon={<Trash2 className="w-5 h-5" />}
								label={t("delete")}
								onClick={handleDelete}
								disabled={!activeRoom}
								variant="danger"
							/>
						</div>
					</div>

					{/* Gesture hints */}
					{showHints && (
						<MobileGestureHints
							onDismiss={() => setShowHints(false)}
						/>
					)}
				</>
			);
		};

		const ActionButton = ({
			icon,
			label,
			onClick,
			disabled,
			variant = "default",
		}) => (
			<button
				className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
					variant === "danger"
						? "bg-red-500 text-white"
						: "bg-white text-gray-700"
				} ${disabled ? "opacity-50" : "active:scale-95"}`}
				onClick={onClick}
				disabled={disabled}
			>
				{icon}
			</button>
		);

		// Comprehensive gesture handling
		const MobileGestureHandler = () => {
			const [gestures] = useState({
				// Two-finger rotate for compass
				rotateCompass: {
					fingers: 2,
					type: "rotate",
					threshold: 15,
					action: (angle) =>
						setCompassRotation((prev) => prev + angle),
				},

				// Three-finger swipe for undo/redo
				swipeUndo: {
					fingers: 3,
					type: "swipe",
					direction: "left",
					action: handleUndo,
				},

				swipeRedo: {
					fingers: 3,
					type: "swipe",
					direction: "right",
					action: handleRedo,
				},

				// Long press for context menu
				contextMenu: {
					type: "longpress",
					duration: 600,
					action: (position) => showContextMenu(position),
				},
			});

			return null; // Gesture handler doesn't render UI
		};

		// Add wheel zoom functionality using useEffect for proper event listener
		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			const handleWheel = (e) => {
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					const delta = e.deltaY;
					if (delta < 0) {
						handleZoom("in", 5);
					} else {
						handleZoom("out", 5);
					}
				}
			};

			// Add wheel listener with passive: false to allow preventDefault
			container.addEventListener("wheel", handleWheel, {
				passive: false,
			});

			return () => {
				container.removeEventListener("wheel", handleWheel);
			};
		}, [handleZoom]);

		useEffect(() => {
			onItemsChange(localItems);
		}, [localItems, onItemsChange]);

		useEffect(() => {
			return () => {
				if (panRafRef.current) {
					cancelAnimationFrame(panRafRef.current);
				}
			};
		}, []);

		return (
			<div
				ref={(node) => {
					containerRef.current = node;
					setNodeRef(node);
				}}
				className="relative w-full min-h-[calc(100vh-64px)] overflow-hidden bg-background"
				onDoubleClick={handleCanvasDoubleClick}
				onTouchStart={handleCanvasTouch} // This should now work
			>
				{/* Enhanced Mobile Controls */}
				<div
					className={`fixed flex items-center gap-2 z-9
                    ${
						isMobile
							? "bottom-24 right-3 flex-col items-end"
							: "top-20 right-6 gap-4"
					}`}
				>
					{!isMobile && (
						<>
							{/* 撤销/重做 */}
							<Undo
								history={history}
								historyIndex={historyIndex}
								handleUndo={handleUndo}
								handleRedo={handleRedo}
								className={
									" bg-white rounded-full shadow-lg  px-3 py-2"
								}
							/>
						</>
					)}
					{/* Mobile: Enhanced zoom controls with better visibility */}
					{isMobile && (
						<div className="flex flex-col items-end gap-2">
							<div className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-full shadow bg-white/90">
								<button
									className={cn("p-1 rounded-full", mobileMode === "select" && "bg-gray-200")}
									onClick={() => setMobileMode("select")}
									title="選取"
								>
									<Hand className="w-4 h-4" />
								</button>
								<button
									className={cn("p-1 rounded-full", mobileMode === "move" && "bg-gray-200")}
									onClick={() => setMobileMode("move")}
									title="移動"
								>
									<Move className="w-4 h-4" />
								</button>
								<button
									className={cn("p-1 rounded-full", mobileMode === "pan" && "bg-gray-200")}
									onClick={() => setMobileMode("pan")}
									title="平移"
								>
									<Crosshair className="w-4 h-4" />
								</button>
							</div>
							<div className="flex items-center gap-2">
								{/* Enhanced zoom control for mobile */}
								<div className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-full shadow-lg bg-white/90 backdrop-blur-sm">
									<button
										className="p-2 text-gray-600 rounded-full hover:bg-gray-100 active:bg-gray-200"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();handleZoom("out");
										}}
										disabled={scale <= MIN_SCALE}
									>
										<Minus className="w-4 h-4" />
									</button>
									<span className="text-sm font-medium text-gray-700 min-w-[40px] text-center">
										{scale}%
									</span>
									<button
										className="p-2 text-gray-600 rounded-full hover:bg-gray-100 active:bg-gray-200"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();handleZoom("in");
										}}
										disabled={scale >= 120}
									>
										<Plus className="w-4 h-4" />
									</button>
								</div>

								{/* Enhanced compass for mobile */}
								<div className="flex flex-col items-center compass-btn">
									<div
										style={{
											width: 52,
											height: 52,
											borderRadius: "50%",
											background: "rgba(255,255,255,0.9)",
											backdropFilter: "blur(8px)",
											boxShadow:
												"0 4px 20px rgba(0,0,0,0.15)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											position: "relative",
											cursor: "pointer",
											border: "2px solid rgba(200,200,200,0.3)",
											userSelect: "none",
											zIndex: 20,
										}}
										onClick={onCompassClick}
										title={t("compassTooltip")}
									>
										<Image
											src="/images/compass.png"
											alt="方向"
											width={60}
											height={60}
											style={{
												pointerEvents: "none",
												transition:
													"transform 0.4s cubic-bezier(.4,2,.6,1)",
												transform: `rotate(${compassRotation}deg)`,
												filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2)) brightness(1.1)",
											}}
										/>
										<span
											style={{
												position: "absolute",
												left: "50%",
												top: "50%",
												transform: "translate(-50%, -50%)",
												fontSize: 9,
												fontWeight: 700,
												color: "#fff",
												textShadow:
													"0 1px 3px rgba(0,0,0,0.8)",
												WebkitTextStroke: "0.3px #222",
											}}
										>
											{getDirectionLabel(compassRotation)}
										</span>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{/* Clear button with better mobile styling */}
								<button
									className="px-3 py-2 text-white transition-all bg-red-500 rounded-full shadow-lg hover:bg-red-600 active:scale-95 clear-canvas-btn"
									onClick={() => {
										setLocalItems([]);
										setActiveRoom(null);
										setSelectedItems([]);
									}}
									title={t("clearTooltip")}
								>
									{t("clear")}
								</button>
								<button
									className="p-2 bg-white border border-gray-200 rounded-full shadow"
									onClick={fitToContent}
									title="Fit"
								>
									<Target className="w-4 h-4" />
								</button>
								<button
									className="p-2 bg-white border border-gray-200 rounded-full shadow"
									onClick={centerOnActiveRoom}
									title="Center"
								>
									<Crosshair className="w-4 h-4" />
								</button>
							</div>
						</div>
					)}

					{/* Rest of desktop controls remain the same... */}
					{!isMobile && (
						<div className="flex items-center gap-4">
							{/* Desktop zoom controls */}
							<div className="flex items-center gap-2">
								<button
									className="p-2 text-gray-600 rounded-full hover:bg-gray-100 active:bg-gray-200"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();handleZoom("out");
									}}
									disabled={scale <= MIN_SCALE}
								>
									<Minus className="w-4 h-4" />
								</button>
								<span className="text-sm font-medium text-gray-700">
									{scale}%
								</span>
								<button
									className="p-2 text-gray-600 rounded-full hover:bg-gray-100 active:bg-gray-200"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();handleZoom("in");
									}}
									disabled={scale >= 120}
								>
									<Plus className="w-4 h-4" />
								</button>
								{/* Desktop reset view button */}
								<button
									className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-200 rounded-full shadow-sm bg-white/90 backdrop-blur-sm hover:bg-gray-50"
									onClick={resetView}
									title={t("resetView")}
								>
									{t("resetView")}
								</button>
								<button
									className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-200 rounded-full shadow-sm bg-white/90 backdrop-blur-sm hover:bg-gray-50"
									onClick={fitToContent}
									title="Fit"
								>
									Fit
								</button>
								<button
									className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-200 rounded-full shadow-sm bg-white/90 backdrop-blur-sm hover:bg-gray-50"
									onClick={centerOnActiveRoom}
									title="Center"
								>
									Center
								</button>
							</div>

							{/* Desktop compass */}
							<div className="flex flex-col items-center compass-btn">
								<div
									style={{
										width: 72,
										height: 72,
										borderRadius: "50%",
										background: "rgba(255,255,255,0.55)",
										backdropFilter: "blur(6px)",
										boxShadow:
											"0 8px 32px 0 rgba(31,38,135,0.18)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										position: "relative",
										cursor: "pointer",
										border: "1.5px solid rgba(180,180,180,0.25)",
										userSelect: "none",
										zIndex: 20,
										transition:
											"box-shadow 0.3s, transform 0.3s",
									}}
									onClick={onCompassClick}
									title={t("compassTooltip")}
								>
									<Image
										src="/images/compass.png"
										alt="方向"
										width={60}
										height={60}
										style={{
											pointerEvents: "none",
											transition:
												"transform 0.4s cubic-bezier(.4,2,.6,1)",
											transform: `rotate(${compassRotation}deg)`,
											filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.18)) brightness(1.15)",
											opacity: 0.95,
										}}
									/>
									<span
										style={{
											position: "absolute",
											left: "50%",
											top: "50%",
											transform: "translate(-50%, -50%)",
											fontSize: 13,
											fontWeight: 700,
											color: "#fff",
											borderRadius: 6,
											padding: "2px 10px",
											pointerEvents: "none",
											letterSpacing: 2,
											background: "none",
											textShadow:
												"0 px 8px rgba(0,0,0,0.45)",
											WebkitTextStroke: "0.5px #222",
										}}
									>
										{getDirectionLabel(compassRotation)}
									</span>
								</div>
								<button
									className="px-2 py-1 mt-1 text-xs rounded shadow bg-white/80 hover:bg-gray-200"
									style={{
										minWidth: 44,
										minHeight: 32,
										fontWeight: 500,
										color: "#222",
									}}
									onClick={(e) => {
										e.stopPropagation();
										setCompassRotation(0);
									}}
								>
									{t("resetNorth")}
								</button>
							</div>

							<button
								className="px-3 py-2 text-white transition bg-red-500 rounded-full shadow-lg hover:bg-red-600 clear-canvas-btn"
								onClick={() => {
									setLocalItems([]);
									setActiveRoom(null);
									setSelectedItems([]);
								}}
								title={t("clearTooltip")}
							>
								{t("clearCanvas")}
							</button>
						</div>
					)}

					{/* Mobile: Multi-select controls in second row if active */}
					{isMobile && selectedItems.length > 0 && (
						<div className="fixed z-40 flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-lg left-3 bottom-28">
							<button onClick={handleMultiRotate}>
								<RotateCcwSquare className="w-4 h-4" />
							</button>
							<button onClick={handleMultiDelete}>
								<Trash2 className="w-4 h-4" />
							</button>
							<span className="text-xs text-gray-500">
								{selectedItems.length} {t("selected")}
							</span>
						</div>
					)}

					{/* Desktop: Multi-select controls in fixed position */}
					{!isMobile && selectedItems.length > 0 && (
						<div className="fixed z-50 flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-lg top-28 right-130">
							<button
								className="p-1 text-gray-600 rounded hover:bg-gray-100"
								onClick={handleMultiRotate}
								title={t("rotate")}
							>
								<RotateCcwSquare className="w-5 h-5" />
							</button>
							<button
								className="p-1 text-red-500 rounded hover:bg-gray-100"
								onClick={handleMultiDelete}
								title={t("delete")}
							>
								<Trash2 className="w-5 h-5" />
							</button>
							<span className="text-sm font-medium text-gray-700">
								{selectedItems.length} {t("selected")}
							</span>
						</div>
					)}
				</div>

				{/* Canvas with debugging */}
				<div
					ref={canvasRef}
					id="canvas"
					className="absolute cursor-move canvas-transform"
					style={{
						width: `${canvasSize.width}px`,
						height: `${canvasSize.height}px`,
						transform: `translate(${position.x}px, ${position.y}px) scale(${scale / 100})`,
						transformOrigin: "top left",
						backgroundImage:
							"radial-gradient(circle, #ddd 1px, transparent 1px)",
						backgroundSize: isMobile ? "20px 20px" : "10px 10px",
						touchAction: "none",
						willChange: "transform", // Force GPU acceleration
					}}
					onMouseDown={(e) => {}}
				>
					<div className="relative">
						{localItems.map((item) => {
							const isSelected = selectedItems.includes(item.id);
							const isMobileSelected =
								isMobile && mobileSelectedItem?.id === item.id;

							if (item.type === ITEM_TYPES.ROOM) {
								return (
									<div
										key={item.id}
										data-room-element="true"
										className={`absolute ${
											activeRoom?.id === item.id
												? "ring-2 ring-red-500"
												: ""
										} ${isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""} ${
											isMobileSelected
												? "ring-2 ring-green-500 shadow-lg"
												: ""
										} ${isDragging ? "shadow-2xl" : ""} cursor-move z-100`}
										style={{
											left: item.position.x,
											top: item.position.y,
											width: item.size.width,
											height: item.size.height,
											minWidth: isMobile
												? 60
												: item.size.width,
											minHeight: isMobile
												? 60
												: item.size.height,
										}}
										onClick={(e) => {
											e.stopPropagation();
											if (!isMobile) {
												onHandleActiveRoom(item);
											}
										}}
										onMouseDown={(e) => {
											if (!isMobile) {
												handleRoomMouseDown(e, item);
											}
										}}
										onTouchStart={(e) => {
											if (isMobile) {
												handleItemTouchStart(e, item);
											} else {
												handleRoomMouseDown(e, item);
											}
										}}
										onTouchMove={(e) => {
											if (isMobile) {
												handleItemTouchMove(e, item);
											}
										}}
										onTouchEnd={(e) => {
											if (isMobile) {
												handleItemTouchEnd(e, item);
											}
										}}
										onDoubleClick={(e) =>
											handleItemDoubleClick(e, item)
										}
									>
										{/* Show selection indicator on mobile */}
										{isMobileSelected && (
											<div className="absolute inset-0 border-2 border-green-500 rounded pointer-events-none bg-green-100/20">
												<div className="absolute px-2 py-1 text-xs font-bold text-white bg-green-500 rounded top-1 left-1">
													{t("tapToDrag")}
												</div>
											</div>
										)}

										{/* Enhanced mobile info panel */}
										{activeRoom &&
											activeRoom.id === item.id && (
												<div
													style={{
														left: "50%",
														top: isMobile
															? "-50px"
															: "-64px",
														transform:
															"translateX(-50%)",
													}}
													className={`min-w-fit whitespace-nowrap absolute z-1 rounded-lg bg-white shadow-lg items-center px-3 gap-2 md:flex hidden ${
														isMobile
															? "h-8 text-xs"
															: "h-10"
													}`}
												>
													<span className="text-gray-600">
														{t("chosed")}：
													</span>
													<div className="flex items-center flex-grow gap-1">
														<div
															style={{
																width: isMobile
																	? "10px"
																	: "12px",
																height: isMobile
																	? "10px"
																	: "12px",
																backgroundColor:
																	ROOM_COLORS[
																		activeRoom
																			.data
																			.type
																	],
																borderRadius:
																	"2px",
															}}
														/>
														<span className="font-bold text-gray-600">
															{
																activeRoom.data
																	.label
															}
														</span>
													</div>
													<button
														className="flex-shrink-0 text-red-500"
														onClick={(e) => {
															e.stopPropagation();
															const itemToDelete =
																activeRoom; // Store before deletion
															const newItems =
																localItems.filter(
																	(item) =>
																		item.id !==
																		activeRoom.id
																);
															setLocalItems(
																newItems
															);
															setActiveRoom(null);
															// ADD THIS LINE - Missing onDemoAction call for room deletion
															onDemoAction(
																"delete",
																itemToDelete
															);
														}}
													>
														<Trash2
															className={`text-red-500 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
														/>
													</button>
												</div>
											)}

										{/* Enhanced room content */}
										<div
											className="w-full h-full"
											style={{
												border:
													item.type ===
													ITEM_TYPES.ROOM
														? "8px solid"
														: "none",
												borderColor:
													item.type ===
													ITEM_TYPES.ROOM
														? ROOM_COLORS[
																item.data.type
															]
														: "transparent",
												borderRadius:
													item.type ===
													ITEM_TYPES.ROOM
														? "8px"
														: "0",
												backgroundColor:
													item.type ===
													ITEM_TYPES.ROOM
														? ROOM_COLORS[
																item.data.type
															] + "80"
														: "transparent",
											}}
										>
											<div
												className={`absolute top-2 left-2 text-[#888888] ${
													isMobile
														? "text-xs"
														: "text-sm"
												}`}
												style={{ zIndex: 1 }}
											>
												{item.data.label}
											</div>
										</div>
										{activeRoom?.id === item.id &&
											Sizehandler(item)}
									</div>
								);
							} else if (item.type === ITEM_TYPES.FURNITURE) {
								return (
									<div
										key={item.id}
										data-room-element="true"
										className={`absolute cursor-move z-200 ${
											isSelected
												? "ring-2 ring-blue-500"
												: ""
										} ${isMobileSelected ? "ring-2 ring-green-500 shadow-lg" : ""}`}
										style={{
											left: item.position.x,
											top: item.position.y,
											width: item.size.width,
											height: item.size.height,
											minWidth: isMobile
												? 40
												: item.size.width,
											minHeight: isMobile
												? 40
												: item.size.height,
										}}
										onClick={(e) => {
											e.stopPropagation();
											if (!isMobile) {
												onHandleActiveRoom(item);
											}
										}}
										onMouseDown={(e) => {
											e.stopPropagation();
											if (!isMobile) {
												handleRoomMouseDown(e, item);
											}
										}}
										onTouchStart={(e) => {
											e.stopPropagation();
											if (isMobile) {
												handleItemTouchStart(e, item);
											} else {
												handleRoomMouseDown(e, item);
											}
										}}
										onTouchEnd={(e) => {
											if (isMobile) {
												handleItemTouchEnd(e, item);
											}
										}}
										onDoubleClick={(e) =>
											handleItemDoubleClick(e, item)
										}
									>
										{/* Show selection indicator on mobile */}
										{isMobileSelected && (
											<div className="absolute inset-0 border-2 border-green-500 rounded pointer-events-none bg-green-100/20">
												<div className="absolute px-2 py-1 text-xs font-bold text-white bg-green-500 rounded top-1 left-1">
													{t("tapToDrag")}
												</div>
											</div>
										)}

										{/* Enhanced furniture info panel and resize handles */}
										{activeRoom &&
											activeRoom.id === item.id && (
												<div
													style={{
														left: "50%",
														top: isMobile
															? "-50px"
															: "-64px",
														transform:
															"translateX(-50%)",
													}}
													className={`min-w-fit whitespace-nowrap absolute z-1 rounded-lg bg-white shadow-lg items-center px-3 gap-2 md:flex hidden ${
														isMobile
															? "h-8 text-xs"
															: "h-10"
													}`}
												>
													<span className="text-gray-600">
														{t("chosed")}：
													</span>
													<div className="flex items-center flex-grow gap-1">
														{activeRoom.data
															.parentRoom && (
															<div
																style={{
																	width: "10px",
																	height: "10px",
																	backgroundColor:
																		ROOM_COLORS[
																			activeRoom
																				.data
																				.parentRoom
																				.data
																				.type
																		],
																	borderRadius:
																		"2px",
																}}
															/>
														)}
														<span className="font-bold text-gray-600">
															{
																activeRoom.data
																	.label
															}
														</span>
													</div>
													<button
														className="flex-shrink-0"
														onClick={(e) => {
															e.stopPropagation();
															handleRotate();
														}}
													>
														<RotateCcwSquare className="w-4 h-4" />
													</button>
													<button
														className="flex-shrink-0 text-red-500 transition-colors hover:text-red-600"
														onClick={(e) => {
															e.stopPropagation();
															const itemToDelete =
																activeRoom;
															const newItems =
																localItems.filter(
																	(item) =>
																		item.id !==
																		activeRoom.id
																);
															setLocalItems(
																newItems
															);
															setActiveRoom(null);
															// Ensure demo action is called for both furniture AND rooms
															onDemoAction(
																"delete",
																itemToDelete
															);
														}}
													>
														<Trash2 className="w-4 h-4 text-red-500" />
													</button>
												</div>
											)}
										{activeRoom?.id === item.id &&
											Sizehandler(item)}
										<Image
											draggable="false"
											className={
												activeRoom?.id === item.id
													? "ring-2 ring-red-500"
													: ""
											}
											style={{
												transform: item.rotation
													? `rotate(${item.rotation}deg)`
													: "none",
												transformOrigin: "center",
											}}
											src={item.activeIcon}
											alt="Furniture"
											width={item.size.width}
											height={item.size.height}
										/>
									</div>
								);
							}
						})}
					</div>
				</div>

				{/* 选中房间的图层面板，仅在移动端显示 */}
				{activeRoom && (
					<div
						className={cn(
							"min-w-fit whitespace-nowrap fixed left-3 h-10 rounded-4xl bg-white shadow-lg flex items-center px-3 gap-2 md:hidden",
							showTab ? "bottom-85" : "bottom-30 "
						)}
					>
						<span className="text-sm text-gray-600">
							{t("chosed")}：
						</span>
						<div className="flex items-center flex-grow gap-1">
							<div
								style={{
									width: "12px",
									height: "12px",
									backgroundColor:
										ROOM_COLORS[
											activeRoom.data.parentRoom
												? activeRoom.data.parentRoom
														.data.type
												: activeRoom.data.type
										],
									borderRadius: "2px",
								}}
							/>
							<span className="text-sm font-bold text-gray-600">
								{activeRoom.data.label}
							</span>
						</div>
						{activeRoom.type === ITEM_TYPES.FURNITURE && (
							<button
								className="flex-shrink-0"
								onClick={(e) => {
									e.stopPropagation();
									handleRotate();
								}}
							>
								<RotateCcwSquare className="w-4 h-4" />
							</button>
						)}
						<button
							className="flex-shrink-0 text-red-500"
							onClick={(e) => {
								e.stopPropagation();
								const itemToDelete = activeRoom;
								const newItems = localItems.filter(
									(item) => item.id !== activeRoom.id
								);
								setLocalItems(newItems);
								setActiveRoom(null);
								// Notify demo of delete action
								onDemoAction("delete", itemToDelete);
							}}
						>
							<Trash2 className="w-4 h-4 text-red-500" />
						</button>
					</div>
				)}
				{/* 移动端的操作按钮 控制显示drag tab */}
				<div className="fixed left-0 z-50 flex items-center justify-between w-full gap-4 px-2 bg-transparent bottom-6 md:hidden">
					{!showTab && (
						<button
							onClick={onShowTab}
							className="border-primary border-1 font-bold w-4/5 py-3 bg-white text-foreground rounded-[100px] text-sm"
						>
							{t("showTab")}
						</button>
					)}

					<AlertDialog>
						<AlertDialogTrigger
							className={cn(
								"inline-flex font-bold py-3 bg-button-gradient text-white rounded-[100px] text-sm items-center justify-center gap-0",
								showTab ? "w-full " : "w-4/5"
							)}
						>
							{t("cta")}
							<Image
								src="/images/hero/star.png"
								alt="arrow"
								width={15}
								height={16}
							/>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									{t("alert")}
								</AlertDialogTitle>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>
									{t("cancel")}
								</AlertDialogCancel>
								<AlertDialogAction onClick={onGenReport}>
									{t("ok")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>

				{/* Common context menu for both room and furniture */}
				<div
					id="context-menu"
					className="fixed z-50 hidden bg-white border border-gray-200 rounded-lg shadow-lg"
					style={{
						width: 200,
						// Positioning will be controlled by JavaScript
					}}
				>
					<div className="flex flex-col p-2">
						<button
							className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
							onClick={() => {
								handleRotate();
								hideContextMenu();
							}}
						>
							<RotateCcwSquare className="w-4 h-4 mr-2" />
							{t("rotate")}
						</button>
						<button
							className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
							onClick={() => {
								handleDelete();
								hideContextMenu();
							}}
						>
							<Trash2 className="w-4 h-4 mr-2" />
							{t("delete")}
						</button>
					</div>
				</div>
			</div>
		);
	}
);
Canvas.displayName = "Canvas";
