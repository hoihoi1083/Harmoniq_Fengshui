const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "..", "src", "components", "home", "TestimonialSection.jsx");
let s = fs.readFileSync(filePath, "utf8");

const oldBlock = `const TestimonialSection = () => {
	const t = useTranslations("home.testimonials");
	const scrollRef = useRef(null);
	const startXRef = useRef(0);
	const scrollLeftRef = useRef(0);
	const isDraggingRef = useRef(false);
	const [isDragging, setIsDragging] = useState(false);

	const handlePointerDown = (e) => {
		if (!scrollRef.current || e.button !== 0) return;
		e.preventDefault();
		scrollRef.current.setPointerCapture(e.pointerId);
		startXRef.current = e.clientX;
		scrollLeftRef.current = scrollRef.current.scrollLeft;
		scrollRef.current.style.scrollBehavior = "auto";
		scrollRef.current.style.touchAction = "none";
		isDraggingRef.current = true;
		setIsDragging(true);
	};

	const handlePointerMove = (e) => {
		if (!scrollRef.current || !isDraggingRef.current) return;
		e.preventDefault();
		const walk = e.clientX - startXRef.current;
		scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
		startXRef.current = e.clientX;
		scrollLeftRef.current = scrollRef.current.scrollLeft;
	};

	const handlePointerUp = (e) => {
		if (!scrollRef.current) return;
		scrollRef.current.releasePointerCapture(e.pointerId);
		scrollRef.current.style.scrollBehavior = "";
		scrollRef.current.style.touchAction = "";
		isDraggingRef.current = false;
		setIsDragging(false);
	};

	const handlePointerLeave = (e) => {
		if (e.buttons === 0 && scrollRef.current) {
			scrollRef.current.style.scrollBehavior = "";
			setIsDragging(false);
		}
	};
`;

const newBlock = `const TestimonialSection = () => {
	const t = useTranslations("home.testimonials");
	const scrollRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const dragStartRef = useRef({ x: 0, scrollLeft: 0 });

	const handleMouseDown = (e) => {
		if (!scrollRef.current || e.button !== 0) return;
		scrollRef.current.style.scrollBehavior = "auto";
		dragStartRef.current = {
			x: e.pageX - scrollRef.current.offsetLeft,
			scrollLeft: scrollRef.current.scrollLeft,
		};
		setIsDragging(true);

		const onDocMouseMove = (e) => {
			if (!scrollRef.current) return;
			e.preventDefault();
			const x = e.pageX - scrollRef.current.offsetLeft;
			const walk = x - dragStartRef.current.x;
			scrollRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk;
		};

		const onDocMouseUp = () => {
			document.removeEventListener("mousemove", onDocMouseMove);
			document.removeEventListener("mouseup", onDocMouseUp);
			if (scrollRef.current) scrollRef.current.style.scrollBehavior = "";
			setIsDragging(false);
		};

		document.addEventListener("mousemove", onDocMouseMove);
		document.addEventListener("mouseup", onDocMouseUp);
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleMouseLeave = () => {
		if (isDragging) handleMouseUp();
	};
`;

if (!s.includes("dragStartRef")) {
	s = s.replace(oldBlock, newBlock);
	s = s.replace(
		/onPointerDownCapture=\{handlePointerDown\}\s*onPointerMove=\{handlePointerMove\}\s*onPointerUp=\{handlePointerUp\}\s*onPointerLeave=\{handlePointerLeave\}\s*onPointerCancel=\{handlePointerUp\}/,
		"onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}"
	);
	s = s.replace(
		/style=\{\{\s*WebkitOverflowScrolling: "touch",\s*scrollBehavior: isDragging \? "auto" : "smooth",\s*touchAction: "pan-y",\s*\}\}/,
		'style={{ WebkitOverflowScrolling: "touch", scrollBehavior: isDragging ? "auto" : "smooth", cursor: isDragging ? "grabbing" : "grab" }}'
	);
	fs.writeFileSync(filePath, s);
	console.log("Patched TestimonialSection to use mouse drag like ServiceDemoTags");
} else {
	console.log("Already patched");
}
process.exit(0);
