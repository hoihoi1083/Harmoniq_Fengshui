const fs = require("fs");
const path = "src/components/home/TestimonialSection.jsx";
let s = fs.readFileSync(path, "utf8");
if (!s.includes("draggable={false}")) {
  s = s.replace(
    /className="object-cover"\s*\/>/,
    'className="object-cover" draggable={false} />'
  );
  fs.writeFileSync(path, s);
  console.log("Added draggable={false} to Image");
} else {
  console.log("Already present");
}
