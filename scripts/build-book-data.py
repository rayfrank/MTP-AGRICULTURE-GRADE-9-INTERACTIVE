"""Rebuild scripts/book-data.js and media/book-figures/ from assets/book.pdf.

The reader used to show raw pdf.js text: words joined at line breaks, page
headers inside sentences, figure labels such as "ab ca bc", the "Let us learn"
logo as "et us Lean Lr" and Windows-1252 control characters that render as
boxes. This script reads the PDF layout with PyMuPDF instead and writes
structured pages (headings, paragraphs, numbered lists, activities, tables and
figures) plus the editorial corrections listed in scripts/book-corrections.json.

Usage (from the project root):
    python scripts/build-book-data.py

Requires PyMuPDF and Pillow.
"""

import html
import io
import json
import os
import re
import sys

import fitz  # PyMuPDF
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(ROOT, "assets", "book.pdf")
OUT_JS = os.path.join(ROOT, "scripts", "book-data.js")
FIG_LIST_JS = os.path.join(ROOT, "pwa", "book-figures.js")
FIG_DIR = os.path.join(ROOT, "media", "book-figures")
CORRECTIONS_PATH = os.path.join(ROOT, "scripts", "book-corrections.json")
DOCS_TEXT = os.path.join(ROOT, "docs", "extracted-text.txt")
DOCS_PAGES = os.path.join(ROOT, "docs", "extracted-pages.json")

PAGE_OFFSET = 3          # book page N is PDF page index N + 3
FIRST_PAGE, LAST_PAGE = 1, 79
FIGURE_ZOOM = 2.0        # 144 dpi
FIGURE_MAX_WIDTH = 900
TABLE_PAGES = {35, 37, 38}
# vector-only diagrams that have no picture to anchor automatic detection
MANUAL_FIGURES = {20: [fitz.Rect(76, 246, 465, 344)]}
CORRECTIONS = {"replace": []}

STRANDS = [
    ("1.0", "Conservation of Resources", [
        ("1.1", "Conserving Animal Feed: Hay", 1, 8),
        ("1.2", "Conserving Leftover Foods", 9, 17),
        ("1.3", "Integrated Farming", 18, 22),
    ]),
    ("2.0", "Food Production Processes", [
        ("2.1", "Organic Gardening", 23, 41),
        ("2.2", "Storage of Crop Produce", 42, 46),
        ("2.3", "Cooking: Using Flour Mixtures", 47, 54),
    ]),
    ("3.0", "Hygiene Practices", [
        ("3.1", "Cleaning Waste Disposal Facilities", 55, 62),
        ("3.2", "Disinfecting Clothing and Household Articles", 63, 71),
    ]),
    ("4.0", "Production Techniques", [
        ("4.1", "Grafting in Plants", 72, 75),
        ("4.2", "Homemade Sun Dryer", 76, 79),
    ]),
]

# Windows-1252 bytes that were decoded as Latin-1 showed as boxes on some PCs,
# so quotes and apostrophes are written as plain ASCII.
C1_MAP = {
    "\u0091": "'", "\u0092": "'", "\u0093": '"', "\u0094": '"',
    "‘": "'", "’": "'", "“": '"', "”": '"',
    "\u0095": "•", "\u0096": "–", "\u0097": "—", "\u0085": "…",
    "�": "•", "": "•", " ": " ",
}

LIST_MARKER = re.compile(r"^\s*(?:(\d{1,2})\.(?=\s|[A-Z])|([a-z])\)|((?:i|ii|iii|iv|v|vi|vii|viii|ix|x))\)|([a-z])\.(?=\s)|([•\-–])(?=\s|$))\s*")


def substrand_for(page_no):
    for strand_code, strand_title, subs in STRANDS:
        for code, title, start, end in subs:
            if start <= page_no <= end:
                return strand_code, strand_title, code, title
    raise ValueError(page_no)


def clean_chars(text):
    for bad, good in C1_MAP.items():
        text = text.replace(bad, good)
    return text.replace("\t", " ")


def rect_gap(a, b):
    dx = max(0, max(a.x0, b.x0) - min(a.x1, b.x1))
    dy = max(0, max(a.y0, b.y0) - min(a.y1, b.y1))
    return max(dx, dy)


class Line:
    def __init__(self, raw):
        self.rect = fitz.Rect(raw["bbox"])
        self.spans = [s for s in raw["spans"]]
        visible = [s for s in self.spans if s["text"].strip()]
        self.text = clean_chars("".join(s["text"] for s in self.spans))
        self.size = max((s["size"] for s in visible), default=0)
        self.white = bool(visible) and all(s["color"] == 0xFFFFFF for s in visible)
        self.bold = bool(visible) and all("Bold" in s["font"] or s["flags"] & 16 for s in visible)
        self.logo = any("Arial-Black" in s["font"] for s in visible)
        self.italic = bool(visible) and all("Italic" in s["font"] or s["flags"] & 2 for s in visible)

    @property
    def stripped(self):
        return re.sub(r"\s+", " ", self.text).strip()

    def html(self):
        out = []
        for span in self.spans:
            text = clean_chars(span["text"])
            if not text:
                continue
            safe = html.escape(text, quote=False)
            if not text.strip():
                out.append(" ")
                continue
            bold = "Bold" in span["font"] or span["flags"] & 16
            italic = "Italic" in span["font"] or span["flags"] & 2
            lead = re.match(r"^\s*", safe).group(0)
            trail = re.search(r"\s*$", safe).group(0)
            core = safe.strip()
            if bold:
                core = f"<strong>{core}</strong>"
            if italic:
                core = f"<em>{core}</em>"
            out.append(f"{lead and ' '}{core}{trail and ' '}")
        joined = "".join(out)
        joined = re.sub(r"</strong>\s*<strong>", " ", joined)
        joined = re.sub(r"</em>\s*<em>", " ", joined)
        return re.sub(r"\s+", " ", joined).strip()


def page_lines(page):
    data = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE | fitz.TEXT_MEDIABOX_CLIP)
    lines = []
    for block in data["blocks"]:
        if block["type"] != 0:
            continue
        for raw in block["lines"]:
            line = Line(raw)
            if line.stripped:
                lines.append(line)
    return lines


def banner_lines(lines):
    """White text on coloured bars: strand, sub-strand, section and activity bars."""
    return [l for l in lines if l.white and (l.size >= 11.5)]


def content_images(page, banners):
    rects = []
    for info in page.get_image_info():
        r = fitz.Rect(info["bbox"]) & page.rect
        if r.width < 45 or r.height < 45:
            continue
        decorative = False
        for b in banners:
            band = fitz.Rect(b.rect.x0 - 6, b.rect.y0 - 10, page.rect.x1, b.rect.y1 + 10)
            if r.intersects(band) and r.height < 90:
                decorative = True
            # round photo icons sit just left of strand and sub-strand titles
            if b.size >= 16 and r.y0 < b.rect.y1 + 30 and r.y1 > b.rect.y0 - 30 and r.x1 <= b.rect.x0 + 45 and r.width < 170:
                decorative = True
        if not decorative:
            rects.append(r)
    return rects


def cluster(rects, gap=14):
    groups = [fitz.Rect(r) for r in rects]
    merged = True
    while merged:
        merged = False
        for i in range(len(groups)):
            for j in range(i + 1, len(groups)):
                if rect_gap(groups[i], groups[j]) <= gap:
                    groups[i] |= groups[j]
                    groups.pop(j)
                    merged = True
                    break
            if merged:
                break
    return groups


def figure_drawings(page, tables=()):
    """Small vector shapes that belong to pictures: frames, speech bubbles, leader lines."""
    shapes = []
    for d in page.get_drawings():
        r = fitz.Rect(d["rect"])
        if r.width == 0 and r.height == 0:
            continue
        if r.width > 300 or r.height > 260:
            continue
        if any(fitz.Rect(t.x0 - 2, t.y0 - 2, t.x1 + 2, t.y1 + 2).contains(r) for t in tables):
            continue
        thin = min(r.width, r.height) < 1
        if thin:
            # leader lines are short; long rules are box and table borders
            if max(r.width, r.height) > 120:
                continue
            r = fitz.Rect(r.x0 - 0.5, r.y0 - 0.5, r.x1 + 0.5, r.y1 + 0.5)
        shapes.append(r)
    return shapes


def grow_by_drawings(region, shapes):
    rect = fitz.Rect(region)
    for _ in range(4):
        grown = False
        probe = fitz.Rect(rect.x0 - 6, rect.y0 - 6, rect.x1 + 6, rect.y1 + 6)
        for s in shapes:
            if probe.intersects(s) or probe.contains(s):
                if not rect.contains(s):
                    rect |= s
                    grown = True
        if not grown:
            break
    return rect


def overlap_ratio(line_rect, rect):
    inter = line_rect & rect
    if inter.is_empty:
        return 0
    return inter.get_area() / max(line_rect.get_area(), 1)


def grow_figure(region, lines, used):
    """Attach labels inside the picture and captions directly below it."""
    labels, captions = [], []
    rect = fitz.Rect(region)
    for idx, line in enumerate(lines):
        if idx in used or line.logo:
            continue
        if line.white and line.bold and line.stripped.startswith("Activity"):
            continue
        centre_y = (line.rect.y0 + line.rect.y1) / 2
        beside = (rect.y0 + 6 <= centre_y <= rect.y1 - 6 and len(line.stripped) <= 30
                  and fitz.Rect(rect.x0 - 6, rect.y0, rect.x1 + 6, rect.y1).intersects(line.rect))
        if overlap_ratio(line.rect, rect) >= 0.6 or beside:
            used.add(idx)
            labels.append(line)
    for line in labels:
        rect |= line.rect
    # captions: up to three short lines just below the figure
    bottom = rect.y1
    for _ in range(3):
        below = [
            (idx, l) for idx, l in enumerate(lines)
            if idx not in used and not l.logo and not l.white
            and bottom - 3 <= l.rect.y0 <= bottom + 16
            and rect.x0 <= (l.rect.x0 + l.rect.x1) / 2 <= rect.x1
            and not l.stripped.endswith(":")
            and l.rect.width <= max(rect.width, 160) + 10
            and not LIST_MARKER.match(l.text)
            and len(l.stripped) <= 70
        ]
        if not below:
            break
        new_bottom = bottom
        for idx, l in below:
            used.add(idx)
            captions.append(l)
            rect |= l.rect
            new_bottom = max(new_bottom, l.rect.y1)
        bottom = new_bottom
    return rect, labels, captions


def trim_clip(rect, flow_lines, page):
    """Pad the figure but stop short of body text lines that touch its edges."""
    clip = fitz.Rect(rect.x0 - 4, rect.y0 - 4, rect.x1 + 4, rect.y1 + 4) & page.rect
    for line in flow_lines:
        inter = line.rect & clip
        if inter.is_empty or inter.height > 9:
            continue
        if (line.rect.y0 + line.rect.y1) / 2 < (clip.y0 + clip.y1) / 2:
            clip.y0 = max(clip.y0, line.rect.y1 + 0.5)
        else:
            clip.y1 = min(clip.y1, line.rect.y0 - 0.5)
    return clip


def corrected_text(page_no, text):
    fixed = text
    for c in CORRECTIONS["replace"]:
        if c.get("page") not in (None, page_no):
            continue
        fixed = re.sub(c["find"], c["with"], fixed) if c.get("regex") else fixed.replace(c["find"], c["with"])
    return fixed


def embedded_font(page, font_name):
    for xref, _, _, basefont, *_ in page.get_fonts(full=True):
        if basefont.split("+")[-1] == font_name or font_name in basefont:
            return page.parent.extract_font(xref)[3]
    return None


def render_figure(page, clip, path, hide=(), own=(), page_no=0):
    """Render the clip without overlapping body text, fixing typos printed in the picture."""
    hide = [l.rect for l in hide if l.rect.intersects(clip)]
    patches = []
    for line in own:
        fixed = corrected_text(page_no, line.stripped)
        if fixed != line.stripped:
            span = next(s for s in line.spans if s["text"].strip())
            patches.append((line, fixed, span, embedded_font(page, span["font"])))
    if hide or patches:
        scratch = fitz.open()
        scratch.insert_pdf(page.parent, from_page=page.number, to_page=page.number)
        copy = scratch[0]
        for r in hide + [p[0].rect for p in patches]:
            copy.add_redact_annot(r, fill=None)
        copy.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
        for n, (line, fixed, span, buf) in enumerate(patches):
            color = tuple(((span["color"] >> s) & 255) / 255 for s in (16, 8, 0))
            if buf:
                copy.insert_font(fontname=f"Fix{n}", fontbuffer=buf)
                width = fitz.Font(fontbuffer=buf).text_length(fixed, fontsize=span["size"])
                fontname = f"Fix{n}"
            else:
                width = fitz.get_text_length(fixed, fontname="helv", fontsize=span["size"])
                fontname = "helv"
            x = (line.rect.x0 + line.rect.x1 - width) / 2
            copy.insert_text((x, span["origin"][1]), fixed, fontname=fontname, fontsize=span["size"], color=color)
        page = copy
    pix = page.get_pixmap(matrix=fitz.Matrix(FIGURE_ZOOM, FIGURE_ZOOM), clip=clip, alpha=False)
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    if img.width > FIGURE_MAX_WIDTH:
        img = img.resize((FIGURE_MAX_WIDTH, round(img.height * FIGURE_MAX_WIDTH / img.width)), Image.LANCZOS)
    img.save(path, "JPEG", quality=80, optimize=True, progressive=True)
    return img.width, img.height


def label_paragraphs(labels):
    """Text printed inside a picture, grouped so each speech bubble reads as one sentence."""
    words = [l for l in labels if len(l.stripped) > 1]
    groups = []
    for line in sorted(words, key=lambda l: (l.rect.y0, l.rect.x0)):
        for g in groups:
            last = g[-1]
            if 0 <= line.rect.y0 - last.rect.y0 <= 18 and min(line.rect.x1, last.rect.x1) - max(line.rect.x0, last.rect.x0) > 10:
                g.append(line)
                break
        else:
            groups.append([line])
    groups.sort(key=lambda g: (round(g[0].rect.y0 / 20), g[0].rect.x0))
    return " ".join(" ".join(l.stripped for l in g) for g in groups)


def caption_text(captions):
    rows = {}
    for c in captions:
        rows.setdefault(round(c.rect.y0 / 6), []).append(c)
    parts = []
    for key in sorted(rows):
        row = sorted(rows[key], key=lambda l: l.rect.x0)
        parts.append("; ".join(l.stripped for l in row))
    return " ".join(parts)


def extract_table(page, bbox):
    for table in page.find_tables().tables:
        if fitz.Rect(table.bbox).intersects(bbox) or bbox is None:
            rows = []
            for row in table.extract():
                cells = []
                for cell in row:
                    text = clean_chars(cell or "")
                    items = [re.sub(r"\s+", " ", t).strip() for t in re.split(r"•", text)]
                    items = [t for t in items if t]
                    cells.append(items if "•" in text else [" ".join(items)])
                rows.append(cells)
            return fitz.Rect(table.bbox), rows
    return None, None


def classify_heading(line):
    s = line.size
    if line.white and s >= 19:
        return "strand"
    if line.white and s >= 17:
        return "substrand"
    if line.white and s >= 13.5:
        return "h3"
    if line.bold and not line.white and s >= 12.6:
        return "h4"
    return None


def build_page(doc, page_no, fig_index):
    page = doc[page_no + PAGE_OFFSET]
    lines = page_lines(page)
    # drop the printed page number
    lines = [l for l in lines if not (l.rect.y0 > page.rect.height - 60 and re.fullmatch(r"\d{1,2}", l.stripped))]
    banners = banner_lines(lines)
    used = set()
    elements = []  # (y, x, kind, payload)

    # tables
    table_rects = []
    if page_no in TABLE_PAGES:
        for table in page.find_tables().tables:
            rect = fitz.Rect(table.bbox)
            if rect.width < 300 or rect.height < 80:
                continue
            _, rows = extract_table(page, rect)
            for idx, l in enumerate(lines):
                if rect.contains(l.rect) or (rect & l.rect).get_area() > 0.6 * l.rect.get_area():
                    used.add(idx)
            table_rects.append(rect)
            elements.append((rect.y0, rect.x0, "table", rows))

    # figures: pictures plus the frames, bubbles and leader lines drawn around them
    shapes = figure_drawings(page, table_rects)
    regions = [grow_by_drawings(r, shapes) for r in cluster(content_images(page, banners))]
    regions = cluster(regions + MANUAL_FIGURES.get(page_no, []), gap=4)
    figures = []
    for region in sorted(regions, key=lambda r: (r.y0, r.x0)):
        rect, labels, captions = grow_figure(region, lines, used)
        figures.append((rect, labels, captions))
    flow_lines = [l for i, l in enumerate(lines) if i not in used and not l.logo]
    for n, (rect, labels, captions) in enumerate(figures):
        neighbours = flow_lines + [l for m, f in enumerate(figures) if m != n for l in f[1] + f[2]]
        fig_index[page_no] = fig_index.get(page_no, 0) + 1
        name = f"p{page_no:02d}-{fig_index[page_no]}.jpg"
        table_lines = [l for i, l in enumerate(lines) if any(t.intersects(l.rect) for t in table_rects)]
        w, h = render_figure(page, trim_clip(rect, neighbours, page), os.path.join(FIG_DIR, name),
                             neighbours + table_lines, labels + captions, page_no)
        cap = caption_text(captions)
        label_text = label_paragraphs(labels)
        figure = {"src": f"media/book-figures/{name}", "w": w, "h": h, "caption": cap, "labels": label_text}
        description = CORRECTIONS.get("figureDescriptions", {}).get(name)
        if description:
            figure["alt"] = description
        elements.append((rect.y0, rect.x0, "figure", figure))

    # "Let us learn" logo -> one marker
    logo_lines = [l for i, l in enumerate(lines) if l.logo and i not in used]
    if logo_lines:
        groups = cluster([l.rect for l in logo_lines], gap=20)
        for g in groups:
            elements.append((g.y0, g.x0, "learn", None))
    for i, l in enumerate(lines):
        if l.logo:
            used.add(i)

    # activity bars: white bold lines that share a baseline
    remaining = [(i, l) for i, l in enumerate(lines) if i not in used]
    activity_rows = {}
    for i, l in remaining:
        if l.white and l.bold and 11.5 <= l.size < 13.5:
            activity_rows.setdefault(round(l.rect.y0 / 4), []).append((i, l))
    for key, row in activity_rows.items():
        row.sort(key=lambda t: t[1].rect.x0)
        texts = [t[1].stripped for t in row if t[1].stripped]
        for i, _ in row:
            used.add(i)
        if not texts:
            continue
        first = texts[0]
        m = re.match(r"(Activity\s+\d+|Project|Assess yourself)\s*(.*)", " ".join(texts))
        if m:
            elements.append((row[0][1].rect.y0, row[0][1].rect.x0, "activity", {"num": m.group(1), "label": m.group(2).strip()}))
        else:
            elements.append((row[0][1].rect.y0, row[0][1].rect.x0, "h3", first if len(texts) == 1 else " ".join(texts)))

    # strand number digit on strand openers
    for i, l in enumerate(lines):
        if i not in used and l.white and l.size >= 25 and re.fullmatch(r"\d", l.stripped):
            used.add(i)

    for i, l in enumerate(lines):
        if i in used:
            continue
        kind = classify_heading(l)
        if kind:
            elements.append((l.rect.y0, l.rect.x0, kind, l.stripped))
        else:
            elements.append((l.rect.y0, l.rect.x0, "line", l))

    elements.sort(key=lambda e: (round(e[0]), e[1]))
    return group_blocks(elements, page)


def group_blocks(elements, page):
    blocks = []
    para = None       # {"t": "p", "html": ..., "last": Line}
    lst = None        # {"t": "ol", "items": [...]}
    col_right = 0
    for _, _, kind, payload in elements:
        if kind == "line":
            col_right = max(col_right, payload.rect.x1)
    col_right = col_right or page.rect.width - 40

    def close_para():
        nonlocal para
        if para:
            blocks.append({"t": "p", "html": para["html"], "indent": para["indent"]})
        para = None

    def close_list():
        nonlocal lst
        if lst:
            blocks.append({"t": "list", "items": lst["items"]})
        lst = None

    def join(a, b):
        if a.endswith("-") and b[:1].islower() and not re.search(r"\b(?:well|self|non|re|co|semi|long|short)-$", a):
            return a[:-1] + b
        return f"{a} {b}"

    for y, x, kind, payload in elements:
        if kind != "line":
            close_para()
            if kind in ("figure", "table", "learn"):
                # a figure inside a list keeps the list open
                if kind == "figure" and lst:
                    lst["items"][-1].setdefault("figures", []).append(payload)
                    continue
                close_list()
                if kind == "figure":
                    blocks.append({"t": "figure", **payload})
                elif kind == "table":
                    blocks.append({"t": "table", "rows": payload})
                else:
                    blocks.append({"t": "learn"})
                continue
            close_list()
            prev = blocks[-1] if blocks else None
            if kind == "activity":
                blocks.append({"t": "activity", **payload})
            elif prev and prev["t"] == "activity" and kind == "h3" and payload[:1].islower():
                prev["label"] = f"{prev['label']} {payload}"   # activity title wrapped onto a second bar line
            elif prev and prev["t"] == kind and (payload[:1].islower() or not re.search(r"[.:?!]$", prev["text"])) and kind != "h5":
                prev["text"] = f"{prev['text']} {payload}"     # heading wrapped onto a second line
            else:
                blocks.append({"t": kind, "text": payload})
            continue

        line = payload
        text_html = line.html()
        m = LIST_MARKER.match(line.text)
        if lst is not None and not m:
            last = lst["items"][-1]
            unfinished = not re.search(r"[.?!:]\s*(?:</\w+>)*\s*$", last["html"])
            if line.rect.x0 >= last["x"] + 8 or (unfinished and line.rect.x0 >= last["x"] - 2 and re.match(r"[a-z\[(]", line.stripped)):
                last["html"] = join(last["html"], text_html)
                continue
        # minor heading: short, all-bold dark line (Requirements, Steps to follow, Note ...)
        if not m and line.bold and not line.white and len(line.stripped) <= 60 and line.rect.x1 < col_right - 60 and not line.stripped.endswith((".", ",")):
            close_para()
            close_list()
            blocks.append({"t": "h5", "text": line.stripped})
            continue
        if m:
            close_para()
            marker = m.group(0).strip()
            body_html = re.sub(r"^\s*(?:<(?:strong|em)>)?\s*" + re.escape(marker) + r"\s*", "", text_html, count=1)
            if body_html == text_html:  # marker was split across tags
                body_html = text_html.replace(marker, "", 1).strip()
            level = 1 if m.group(1) else 3 if m.group(3) else 0 if m.group(5) else 2
            if lst is None:
                lst = {"items": []}
            item = {"n": marker, "level": level, "html": body_html.strip(), "x": line.rect.x0}
            # "1.  a) text" -> item 1 with first sub-item a)
            inner = LIST_MARKER.match(re.sub(r"<[^>]+>", "", item["html"]))
            if inner and inner.group(2) and level == 1:
                sub_marker = inner.group(0).strip()
                lst["items"].append({"n": marker, "level": 1, "html": "", "x": line.rect.x0})
                item = {"n": sub_marker, "level": 2, "html": item["html"].replace(sub_marker, "", 1).strip(), "x": line.rect.x0}
            lst["items"].append(item)
            continue
        if lst is not None:
            close_list()
        if para:
            prev = para["last"]
            gap = line.rect.y0 - prev.rect.y1
            prev_short = prev.rect.x1 < col_right - 40
            if gap > 6 or (prev_short and re.search(r"[.:?!]\s*$", prev.stripped)) or abs(line.rect.x0 - para["x"]) > 14:
                close_para()
        if para is None:
            para = {"html": text_html, "last": line, "x": line.rect.x0, "indent": line.rect.x0 > 64}
        else:
            para["html"] = join(para["html"], text_html)
            para["last"] = line
    close_para()
    close_list()
    for b in blocks:
        if b["t"] == "list":
            for it in b["items"]:
                it.pop("x", None)
                it["html"] = it["html"].strip()
    return blocks


def plain(html_text):
    return html.unescape(re.sub(r"<[^>]+>", "", html_text))


def block_text(b):
    t = b["t"]
    if t in ("p",):
        return plain(b["html"])
    if t in ("strand", "substrand", "h3", "h4", "h5"):
        return b["text"]
    if t == "activity":
        return f"{b['num']} {b['label']}".strip()
    if t == "learn":
        return "Let us learn"
    if t == "list":
        rows = []
        for it in b["items"]:
            rows.append(f"{it['n']} {plain(it['html'])}".strip())
            rows += [block_text({"t": "figure", **f}) for f in it.get("figures", [])]
        return "\n".join(r for r in rows if r)
    if t == "figure":
        return " ".join(x for x in (b.get("caption"), b.get("labels"), b.get("alt")) if x)
    if t == "table":
        return "\n".join(" | ".join(" ".join(c) for c in row) for row in b["rows"])
    return ""


def apply_corrections(pages, corrections):
    by_page = {p["page"]: p for p in pages}
    applied, missing = 0, []

    def sub_in(obj, find, repl, regex):
        count = 0
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k in ("src", "t", "w", "h", "level"):
                    continue
                if isinstance(v, str):
                    new = re.sub(find, repl, v) if regex else v.replace(find, repl)
                    if new != v:
                        obj[k] = new
                        count += 1
                else:
                    count += sub_in(v, find, repl, regex)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                if isinstance(v, str):
                    new = re.sub(find, repl, v) if regex else v.replace(find, repl)
                    if new != v:
                        obj[i] = new
                        count += 1
                else:
                    count += sub_in(v, find, repl, regex)
        return count

    for c in corrections["replace"]:
        targets = [by_page[c["page"]]] if c.get("page") else pages
        n = sum(sub_in(p["blocks"], c["find"], c["with"], c.get("regex", False)) for p in targets)
        if n:
            applied += 1
        else:
            missing.append(c)
    return applied, missing


def merge_page_breaks(pages):
    """Join a sentence that the printed page split across two pages."""
    for prev, nxt in zip(pages, pages[1:]):
        if not prev["blocks"] or not nxt["blocks"]:
            continue
        last, first = prev["blocks"][-1], nxt["blocks"][0]
        if first["t"] != "p":
            continue
        first_plain = plain(first["html"]).lstrip()
        if not first_plain[:1].islower():
            continue
        if last["t"] == "p" and not re.search(r"[.:?!]\s*$", plain(last["html"])):
            last["html"] = f"{last['html']} {first['html']}"
            last["continues"] = True
            nxt["blocks"].pop(0)
            nxt["continuedFrom"] = prev["page"]
        elif last["t"] == "list":
            item = last["items"][-1]
            item["html"] = f"{item['html']} {first['html']}"
            nxt["blocks"].pop(0)
            nxt["continuedFrom"] = prev["page"]


def renumber_activities(pages, corrections):
    for p in pages:
        for b in p["blocks"]:
            if b["t"] == "activity":
                b["label"] = re.sub(r"^Lets\b", "Let us", b["label"])
                b["label"] = re.sub(r"do\(\s*in", "do (in", b["label"])
    for fix in corrections.get("activityNumbers", []):
        for p in pages:
            if p["page"] != fix["page"]:
                continue
            for b in p["blocks"]:
                if b["t"] == "activity" and b["num"] == fix["from"] and b["label"].startswith(fix.get("label", "")):
                    b["num"] = fix["to"]


def check_activity_sequence(pages):
    warnings = []
    for strand_code, _, subs in STRANDS:
        for code, title, start, end in subs:
            nums = []
            for p in pages:
                if start <= p["page"] <= end:
                    nums += [(p["page"], int(b["num"].split()[-1])) for b in p["blocks"] if b["t"] == "activity" and b["num"].startswith("Activity")]
            for (pa, a), (pb, b) in zip(nums, nums[1:]):
                if b != a + 1:
                    warnings.append(f"{code} {title}: Activity {a} (p{pa}) then Activity {b} (p{pb})")
    return warnings


def main():
    with open(CORRECTIONS_PATH, encoding="utf-8") as fh:
        corrections = json.load(fh)
    CORRECTIONS.update(corrections)
    os.makedirs(FIG_DIR, exist_ok=True)
    for name in os.listdir(FIG_DIR):
        if name.endswith(".jpg"):
            os.remove(os.path.join(FIG_DIR, name))

    doc = fitz.open(PDF_PATH)
    fig_index = {}
    pages = []
    for page_no in range(FIRST_PAGE, LAST_PAGE + 1):
        strand_code, strand_title, code, title = substrand_for(page_no)
        blocks = build_page(doc, page_no, fig_index)
        pages.append({
            "page": page_no, "pdfPage": page_no + PAGE_OFFSET + 1,
            "strand": strand_code, "strandTitle": strand_title,
            "substrand": code, "substrandTitle": title,
            "blocks": blocks,
        })

    renumber_activities(pages, corrections)
    applied, missing = apply_corrections(pages, corrections)
    merge_page_breaks(pages)
    for p in pages:
        for b in p["blocks"]:
            if b["t"] == "strand":
                b["code"] = p["strand"]
                b["text"] = p["strandTitle"]
            if b["t"] == "substrand":
                b["code"] = p["substrand"]
                b["text"] = p["substrandTitle"]
        p["text"] = "\n".join(t for t in (block_text(b) for b in p["blocks"]) if t)

    intro = ["Agriculture", "Grade 9", "Learner's Book", "Table of Contents"]
    for strand_code, strand_title, subs in STRANDS:
        intro.append(f"{strand_code} {strand_title} ........ {subs[0][2]}")
        for code, title, start, _ in subs:
            intro.append(f"{code} {title} ........ {start}")

    data = {"title": "Agriculture Grade 9 Learner's Book", "intro": intro,
            "strands": [{"code": s, "title": t, "substrands": [{"code": c, "title": n, "pages": [a, b]} for c, n, a, b in subs]} for s, t, subs in STRANDS],
            "pages": pages}
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    with open(OUT_JS, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("/* Generated by scripts/build-book-data.py from assets/book.pdf. Do not edit by hand. */\n")
        fh.write(f"window.BOOK_DATA = {payload};\n")

    figures = sorted(f"media/book-figures/{n}" for n in os.listdir(FIG_DIR) if n.endswith(".jpg"))
    with open(FIG_LIST_JS, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("/* Generated by scripts/build-book-data.py: textbook figures cached for offline use. */\n")
        fh.write("self.BOOK_FIGURES = " + json.dumps(figures, indent=0) + ";\n")

    with open(DOCS_TEXT, "w", encoding="utf-8", newline="\n") as fh:
        for p in pages:
            fh.write(f"===== Page {p['page']} ({p['substrand']} {p['substrandTitle']}) =====\n{p['text']}\n\n")
    with open(DOCS_PAGES, "w", encoding="utf-8", newline="\n") as fh:
        json.dump([{"page": p["page"], "text": p["text"]} for p in pages], fh, ensure_ascii=False, indent=1)

    size = sum(os.path.getsize(os.path.join(ROOT, f)) for f in figures)
    print(f"pages: {len(pages)}  figures: {len(figures)} ({size / 1048576:.1f} MiB)  corrections applied: {applied}/{len(corrections['replace'])}")
    for c in missing:
        print("  correction not found:", c)
    for w in check_activity_sequence(pages):
        print("  activity numbering:", w)
    figure_names = {os.path.basename(f) for f in figures}
    for name in corrections.get("figureDescriptions", {}):
        if name not in figure_names:
            print("  description for a figure that no longer exists:", name)
    undescribed = []
    for p in pages:
        for b in p["blocks"]:
            figs = [b] if b["t"] == "figure" else [f for it in b.get("items", []) for f in it.get("figures", [])] if b["t"] == "list" else []
            undescribed += [f["src"] for f in figs if not (f.get("alt") or f.get("caption") or f.get("labels"))]
    for src in undescribed:
        print("  figure without a description:", src)


if __name__ == "__main__":
    sys.exit(main())
