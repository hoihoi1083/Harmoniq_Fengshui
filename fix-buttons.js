const fs = require('fs');
const path = './src/app/[locale]/shop/page.jsx';

let content = fs.readFileSync(path, 'utf8');

// Fix first broken button around line 505
content = content.replace(
  /<div className="text-center">\s+<Button\s+<\/Button>\s+<\/div>/,
  `<div className="text-center">
\t\t\t\t\t<Link href={\`/\${locale}/shop/all\`}>
\t\t\t\t\t\t<Button
\t\t\t\t\t\t\tsize="lg"
\t\t\t\t\t\t\tclassName="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
\t\t\t\t\t\t>
\t\t\t\t\t\t\t{locale === "zh-CN" ? "浏览更多" : "瀏覽更多"}
\t\t\t\t\t\t</Button>
\t\t\t\t\t</Link>
\t\t\t\t</div>`
);

// Fix second button - remove onClick and add Link wrapper
content = content.replace(
  /<Button\s+size="lg"\s+className="bg-\[#2C2C2C\][^"]+"\s+onClick=\{[^}]+\.getElementById\("all-products"\)[^}]+\}\s+>\s+\{locale === "zh-CN" \? "浏览更多" : "瀏覽更多"\}\s+<\/Button>/g,
  `<Link href={\`/\${locale}/shop/all\`}>
\t\t\t\t\t\t<Button
\t\t\t\t\t\t\tsize="lg"
\t\t\t\t\t\t\tclassName="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
\t\t\t\t\t\t>
\t\t\t\t\t\t\t{locale === "zh-CN" ? "浏览更多" : "瀏覽更多"}
\t\t\t\t\t\t</Button>
\t\t\t\t\t</Link>`
);

fs.writeFileSync(path, content);
console.log('Fixed both Browse More buttons!');
