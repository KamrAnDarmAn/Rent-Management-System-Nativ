"""Build review sheets from original mockups and captured app screens.

This is a visual review aid, not a claim of pixel equivalence. The phone hardware,
status bars, and decorative presentation backgrounds are excluded from reference crops.
Run `node scripts/capture-screens.mjs` first. Requires Pillow.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import json

root = Path(__file__).resolve().parent.parent
output = root / 'artifacts' / 'visual'
records = json.loads((output / 'results.json').read_text())
special = {
    'shop-card-screen.png': (274, 106, 850, 1365),
    'shops-screen.png': (88, 137, 855, 1590),
    'reports-screen.png': (70, 116, 873, 1610),
    'settings-screen.png': (133, 161, 806, 1584),
    'shop-details-screen.png': (95, 130, 844, 1620),
    'get-started-screen.png': (251, 128, 871, 1315),
    'splash-screen.png': (253, 126, 869, 1324),
}
thumbs = []
for record in records:
    actual_path = output / f'{record["id"]}.png'
    if not actual_path.exists() or record['errors']:
        continue
    reference = Image.open(root / 'design' / record['file']).convert('RGB')
    actual = Image.open(actual_path).convert('RGB')
    if record['id'] == 'design-system':
        crop = (0, 0, reference.width, reference.height)
    else:
        crop = special.get(record['file'], (265, 117, 855, 1340) if reference.width == 1122 else (133, 127, 809, 1604))
    reference = reference.crop(crop)
    reference = reference.resize((390, round(reference.height * 390 / reference.width)))
    sheet = Image.new('RGB', (800, max(844, reference.height) + 42), '#e9f0f2')
    draw = ImageDraw.Draw(sheet)
    draw.text((8, 10), f'{record["title"]} — REFERENCE (cropped)', fill='#173431')
    draw.text((410, 10), 'IMPLEMENTED — 390 x 844', fill='#173431')
    sheet.paste(reference, (5, 35))
    sheet.paste(actual, (405, 35))
    sheet.save(output / f'compare-{record["id"]}.jpg')
    thumb = ImageOps.contain(actual, (190, 411))
    thumbs.append((record['id'], thumb))

for start in range(0, len(thumbs), 8):
    canvas = Image.new('RGB', (800, 890), '#e1ebee')
    draw = ImageDraw.Draw(canvas)
    for index, (label, thumb) in enumerate(thumbs[start:start + 8]):
        x, y = (index % 4) * 200 + 5, (index // 4) * 445
        draw.text((x, y + 3), label, fill='#173431')
        canvas.paste(thumb, (x, y + 23))
    canvas.save(output / f'contact-sheet-{start // 8 + 1}.jpg')
print(f'Created {len(thumbs)} comparison sheets and {(len(thumbs) + 7) // 8} contact sheets in {output}')
