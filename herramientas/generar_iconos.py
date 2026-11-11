#!/usr/bin/env python3
"""Íconos PNG para instalar Moldes Gaby´s: logo aprobado completo y fondo negro.

Genera archivos PNG reales en assets/, versionados para evitar cachés antiguas.
Es seguro ejecutarlo varias veces y no modifica el logotipo dentro de la página.
"""
from pathlib import Path
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT
ASSETS = DEST / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / "assets" / "gabys-install-source.avif"

with Image.open(SOURCE) as raw:
    approved = raw.convert("RGB")

def write(size, filename, margin=0.0):
    image = Image.new("RGB", (size, size), "black")
    side = round(size * (1 - 2 * margin))
    resized = approved.resize((side, side), Image.Resampling.LANCZOS)
    at = ((size - side) // 2, (size - side) // 2)
    image.paste(resized, at)
    output = ASSETS / filename
    image.save(output, format="PNG", optimize=True)
    with Image.open(output) as check:
        assert check.size == (size, size) and check.format == "PNG"
    print(f"OK {output}: PNG {size}x{size}, {output.stat().st_size} bytes")

# Archivo con nombre NUEVO: los navegadores actualizan los íconos que guardaron.
write(48, "gabys-instalar-48-v3.png")
write(180, "gabys-instalar-ios-180-v3.png")
write(192, "gabys-instalar-192-v3.png")
write(512, "gabys-instalar-512-v3.png")
write(512, "gabys-instalar-maskable-512-v3.png", margin=0.14)
