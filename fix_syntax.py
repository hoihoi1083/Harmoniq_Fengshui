#!/usr/bin/env python3
# Fix syntax error in page.jsx

with open('src/app/[locale]/admin/print-report/view/page.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# After line 830 (index 829), insert the missing structure
insert_lines = [
    '\t\t</div>\n',
    '\n',
    '\t\t{/* Print Styles */}\n',
    '\t\t<style jsx global>{`\n',
    '\t\t\t@media print {\n',
    '\t\t\t\t.no-print {\n',
    '\t\t\t\t\tdisplay: none !important;\n',
    '\t\t\t\t}\n',
    '\t\t\t\t.print-container {\n',
]

# Insert at position 830 (after index 829)
for i, line in enumerate(insert_lines):
    lines.insert(830 + i, line)

# Fix indentation of existing margin/padding lines
for i in range(830 + len(insert_lines), min(len(lines), 850)):
    if 'margin: 0 auto !important;' in lines[i]:
        lines[i] = '\t\t\t\t\tmargin: 0 auto !important;\n'
        if i + 1 < len(lines) and 'padding: 20mm 15mm' in lines[i + 1]:
            lines[i + 1] = '\t\t\t\t\tpadding: 20mm 15mm !important;\n'
        if i + 2 < len(lines) and lines[i + 2].strip() == '}':
            lines[i + 2] = '\t\t\t\t}\n'
        break

# Write back
with open('src/app/[locale]/admin/print-report/view/page.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"✅ Fixed! Total lines: {len(lines)}")
