#!/usr/bin/env python3
"""Genera íconos instalables a partir del colibrí ORIGINAL del logotipo Gaby's.

Uso: python herramientas/generar_iconos.py _site
No altera la imagen original del encabezado.
"""
from __future__ import annotations

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT
ASSETS = OUT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

# En el logo oficial, el colibrí está en la parte superior izquierda.
# Se usa ESTA ilustración de alta resolución, no se redibuja ni se sustituye
# por una mascota diferente. Los puntos de la máscara recorren el contorno
# y evitan que las letras de "Moldes" entren en el ícono.
logo = Image.open(ROOT / "assets" / "gabys-logo-oficial.webp").convert("RGBA")
w, h = logo.size
sx, sy = w / 680.0, h / 528.0
points = [
    (24, 0), (184, 0), (215, 48), (248, 65), (285, 59),
    (317, 73), (336, 103), (344, 127), (420, 138), (423, 160),
    (335, 165), (326, 186), (316, 207), (296, 226),
    (278, 232), (249, 224), (220, 225), (200, 234),
    (183, 256), (174, 278), (164, 311), (133, 320),
    (98, 302), (54, 287), (27, 285), (4, 261),
    (0, 231), (22, 202), (37, 165), (25, 129), (29, 88)
]
mask = Image.new("L", (w, h), 0)
draw = ImageDraw.Draw(mask)
draw.polygon([(round(x * sx), round(y * sy)) for x, y in points], fill=255)
# Un borde suave impide recortes artificiales sobre las puntadas del fieltro.
mask = mask.filter(ImageFilter.GaussianBlur(max(0.7, w / 850)))
alpha = ImageChops.multiply(logo.getchannel("A"), mask)
logo.putalpha(alpha)
bbox = alpha.getbbox()
if not bbox:
    raise RuntimeError("No se pudo aislar el colibrí del logotipo")
bird = logo.crop(bbox)
# La ilustración original conserva su ojo negro, reflejo blanco y las pestañas.
# Solo mejoramos nitidez por reescalado, sin modificar ni inventar rasgos.
def make_icon(size: int, filename: str, proportion: float = 0.90):
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    target_w = round(size * proportion)
    target_h = round(size * proportion)
    bw, bh = bird.size
    ratio = min(target_w / bw, target_h / bh)
    target = bird.resize((max(1, round(bw * ratio)), max(1, round(bh * ratio))), Image.Resampling.LANCZOS)
    if size <= 192:
        target = ImageEnhance.Sharpness(target).enhance(1.12)
    xy = ((size - target.width) // 2, (size - target.height) // 2)
    icon.alpha_composite(target, xy)
    icon.convert("RGB").save(ASSETS / filename, format="PNG", optimize=True)
    print(filename, size, "x", size, "bird:", bird.size, "source:", logo.size)

make_icon(192, "gabys-app-192.png", .90)
make_icon(512, "gabys-app-512.png", .90)
make_icon(512, "gabys-app-maskable-512.png", .76)
make_icon(180, "gabys-app-180.png", .89)
make_icon(48, "gabys-app-48.png", .90)
