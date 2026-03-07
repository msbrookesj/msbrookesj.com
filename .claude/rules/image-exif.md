---
paths:
  - "website/assets/**"
  - "website/license.html"
---

# Image Licensing and EXIF Policy

All images must have EXIF metadata set correctly before being committed. Use `piexif` (Python) to manage EXIF data.

**Original images by Brooke Ryan** — set the following EXIF fields:
- `Copyright` → `© 2026 Brooke Ryan`
- `Artist` → `Brooke Ryan`

**Third-party images** — preserve any existing `Copyright` and `Artist` fields exactly as provided by the original photographer. Do **not** overwrite third-party copyright with Brooke's name. Third-party images must be credited in `website/license.html` under "Photography Credits".

Currently, `website/assets/athlete/slideshow/2024-02-21-{1–10}.jpg` are © KrPhotogs Photography LLC and are credited accordingly in `license.html`.

**Location and device info** — strip the following EXIF fields from all images before committing:
- `GPS` IFD (coordinates)
- `HostComputer` (device name)
- `ImageDescription` (may contain venue/event names)

Example script to apply to a new image `path.jpg` owned by Brooke:

```python
import piexif

exif = piexif.load("path.jpg")
exif["GPS"] = {}
exif["0th"].pop(piexif.ImageIFD.HostComputer, None)
exif["0th"].pop(piexif.ImageIFD.ImageDescription, None)
exif["0th"][piexif.ImageIFD.Copyright] = "© 2026 Brooke Ryan".encode()
exif["0th"][piexif.ImageIFD.Artist] = "Brooke Ryan".encode()
piexif.insert(piexif.dump(exif), "path.jpg")
```
