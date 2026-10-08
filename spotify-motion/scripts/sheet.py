"""Tile PNG stills into a labeled contact sheet: python3 scripts/sheet.py out.png a.png b.png ..."""
import sys
from PIL import Image, ImageDraw

out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size
cols = 2
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w + (cols + 1) * 8, rows * h + (rows + 1) * 8), (60, 60, 60))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = 8 + (i % cols) * (w + 8), 8 + (i // cols) * (h + 8)
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + 90, y + 22], fill=(255, 0, 255))
    d.text((x + 4, y + 5), f.split('/')[-1], fill=(255, 255, 255))
sheet.save(out)
