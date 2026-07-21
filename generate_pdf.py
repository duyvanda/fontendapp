import os
import subprocess
import re

md_path = r"d:\django_apps\rest\fontendapp\app_transfer.md"
html_path = r"d:\django_apps\rest\fontendapp\app_transfer.html"
pdf_path = r"d:\django_apps\rest\fontendapp\app_transfer.pdf"

with open(md_path, "r", encoding="utf-8") as f:
    lines = [line.rstrip('\n') for line in f]

html_lines = []
in_table = False
table_header_parsed = False

for line in lines:
    if line.startswith("# "):
        if in_table:
            html_lines.append("</table>")
            in_table = False
        html_lines.append(f"<h1>{line[2:]}</h1>")
    elif line.startswith("### "):
        if in_table:
            html_lines.append("</table>")
            in_table = False
        html_lines.append(f"<h3>{line[4:]}</h3>")
    elif line.startswith("|") and line.endswith("|"):
        # Table row
        cells = [c.strip() for c in line.strip('|').split('|')]
        if all(re.match(r'^:?-+:?$', c) for c in cells):
            # Alignment row, skip
            continue
        
        if not in_table:
            html_lines.append("<table>")
            in_table = True
            table_header_parsed = False
        
        if not table_header_parsed:
            html_lines.append("<thead><tr>" + "".join(f"<th>{c}</th>" for c in cells) + "</tr></thead><tbody>")
            table_header_parsed = True
        else:
            row_html = "<tr>"
            for c in cells:
                # Format bold
                c_formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', c)
                c_formatted = re.sub(r'\*(.*?)\*', r'<em>\1</em>', c_formatted)
                c_formatted = c_formatted.replace('<br>', '<br/>')
                row_html += f"<td>{c_formatted}</td>"
            row_html += "</tr>"
            html_lines.append(row_html)
    elif line == "---":
        if in_table:
            html_lines.append("</tbody></table>")
            in_table = False
        html_lines.append("<hr/>")
    elif line.strip() == "":
        if in_table and not table_header_parsed:
            pass
        elif in_table:
            html_lines.append("</tbody></table>")
            in_table = False
        continue
    else:
        if in_table:
            html_lines.append("</tbody></table>")
            in_table = False
        
        # Format text
        line_formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', line)
        line_formatted = re.sub(r'\*(.*?)\*', r'<em>\1</em>', line_formatted)
        
        # Check list item
        if line_formatted.startswith("1. ") or line_formatted.startswith("2. ") or line_formatted.startswith("3. "):
            html_lines.append(f"<p style='margin-left: 15px;'><strong>{line_formatted[:3]}</strong>{line_formatted[3:]}</p>")
        elif line_formatted.startswith("   - "):
            html_lines.append(f"<p style='margin-left: 35px;'>• {line_formatted[5:]}</p>")
        elif line_formatted.startswith("- "):
            html_lines.append(f"<p style='margin-left: 20px;'>• {line_formatted[2:]}</p>")
        else:
            html_lines.append(f"<p>{line_formatted}</p>")

if in_table:
    html_lines.append("</tbody></table>")

body_content = "\n".join(html_lines)

html_full = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Hướng dẫn & Điều kiện Transfer App BI PORTAL</title>
    <style>
        @page {{
            size: A4;
            margin: 18mm;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }}
        h1 {{
            color: #1a365d;
            font-size: 18pt;
            border-bottom: 2px solid #3182ce;
            padding-bottom: 8px;
            margin-top: 0;
            margin-bottom: 18px;
        }}
        h3 {{
            color: #2b6cb0;
            font-size: 13pt;
            margin-top: 20px;
            margin-bottom: 10px;
        }}
        p {{
            font-size: 10.5pt;
            margin-bottom: 8px;
            margin-top: 4px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 18px;
            font-size: 9.5pt;
        }}
        th {{
            background-color: #2b6cb0;
            color: #ffffff;
            font-weight: bold;
            padding: 8px 10px;
            text-align: left;
            border: 1px solid #2b6cb0;
        }}
        td {{
            padding: 8px 10px;
            border: 1px solid #cbd5e0;
            vertical-align: top;
        }}
        tr:nth-child(even) {{
            background-color: #f7fafc;
        }}
        hr {{
            border: 0;
            height: 1px;
            background: #e2e8f0;
            margin: 18px 0;
        }}
        strong {{
            color: #1a202c;
        }}
    </style>
</head>
<body>
    {body_content}
</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_full)

print("HTML created successfully.")

edge_paths = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
]

browser_exe = None
for p in edge_paths:
    if os.path.exists(p):
        browser_exe = p
        break

if browser_exe:
    cmd = [
        browser_exe,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print("PDF created successfully at:", pdf_path)
    else:
        print("Error generating PDF:", res.stderr)
else:
    print("Browser executable not found.")
