const fs = require("fs");
const path = "src/components/home/TestimonialSection.jsx";
let s = fs.readFileSync(path, "utf8");
s = s.replace(
  'className="object-cover"\n\t\t\t\t\t\t\t\t/>',
  'className="object-cover"\n\t\t\t\t\t\t\t\tdraggable={false}\n\t\t\t\t\t\t\t\t/>'
);
fs.writeFileSync(path, s);
console.log("Patched");
