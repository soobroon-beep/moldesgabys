#!/usr/bin/env python3
"""Iconos PWA hechos del diseño aprobado: logo completo con fondo negro.

La imagen aprobada se conserva íntegra. Únicamente se redimensiona para
los tamaños que requieren Android, iPhone, accesos directos y favicons.
"""
from pathlib import Path
import sys

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT
ASSETS = OUTPUT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / "assets" / "gabys-install-source.avif"

def generate(size: int, name: str, safe_margin: float = 0.0) -> None:
    with Image.open(SOURCE) as loaded:
        src = loaded.convert("RGB")
    canvas = Image.new("RGB", (size, size), (0, 0, 0))
    side = round(size * (1.0 - 2.0 * safe_margin))
    resized = src.resize((side, side), Image.Resampling.LANCZOS)
    offset = ((size - side) // 2, (size - side) // 2)
    canvas.paste(resized, offset)
    destination = ASSETS / name
    canvas.save(destination, format="PNG", optimize=True)
    print(f"{name}: {size}x{size}, source={SOURCE.name}, margin={safe_margin:.2f}")

generate(48, "gabys-app-48.png")
generate(180, "gabys-app-180.png")
generate(192, "gabys-app-192.png")
generate(512, "gabys-app-512.png")
# El icono adaptable necesita márgenes de seguridad dentro de la silueta.
generate(512, "gabys-app-maskable-512.png", safe_margin=0.10)
