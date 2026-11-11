"""Copia miniaturas públicas de Drive a WebP locales para el catálogo de GitHub Pages.
No altera los archivos originales de Google Drive.
"""
import io
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import quote

import requests
from PIL import Image, ImageOps, UnidentifiedImageError

BASE=Path(__file__).resolve().parent.parent
DEST=BASE/'images'
DEST.mkdir(parents=True,exist_ok=True)
products=json.loads((BASE/'catalogo.json').read_text(encoding='utf-8'))
products+=json.loads((BASE/'navidad.json').read_text(encoding='utf-8'))


def download_one(p):
    if not p.get('id') or not p.get('codigo'):
        return False, p.get('codigo','?'), 'sin ID'
    relative=Path(p.get('imagenLocal') or ('images/'+p['codigo']+'.webp'))
    if relative.is_absolute() or '..' in relative.parts:
        return False,p['codigo'],'ruta inválida'
    path=BASE/relative
    path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists() and path.stat().st_size>2000:
        return True,p['codigo'],'existente'
    fid=quote(p['id'],safe='')
    urls=[
      f'https://drive.google.com/thumbnail?id={fid}&sz=w1200',
      f'https://lh3.googleusercontent.com/d/{fid}=w1200',
      f'https://drive.google.com/uc?export=download&id={fid}',
    ]
    for source in urls:
      try:
        response=requests.get(source,headers={'User-Agent':'Mozilla/5.0 (compatible; GabysCatalog/1.0)'},timeout=(12,28),allow_redirects=True)
        response.raise_for_status()
        if len(response.content)>12_000_000:
            continue
        if 'image/' not in response.headers.get('Content-Type','').lower() and not (response.content.startswith(b'\xff\xd8') or response.content.startswith(b'\x89PNG') or response.content.startswith(b'RIFF')):
            continue
        with Image.open(io.BytesIO(response.content)) as im:
            im=ImageOps.exif_transpose(im).convert('RGB')
            im.thumbnail((1000,1200),Image.Resampling.LANCZOS)
            if im.width<50 or im.height<50:
                continue
            tmp=path.with_suffix('.webp.tmp')
            im.save(tmp,format='WEBP',quality=78,method=5)
            os.replace(tmp,path)
        return True,p['codigo'],'guardada'
      except (requests.RequestException,OSError,UnidentifiedImageError,ValueError):
        continue
    return False,p['codigo'],'Drive no permitió la miniatura'


def main():
    success=0
    failed=[]
    with ThreadPoolExecutor(max_workers=6) as pool:
        future_map={pool.submit(download_one,p):p for p in products}
        for future in as_completed(future_map):
            ok,code,reason=future.result()
            if ok:success+=1
            else:failed.append((code,reason))
    print(f'Imágenes disponibles: {success}/{len(products)}')
    if failed:
        print('No disponibles temporalmente:',', '.join(x[0] for x in failed[:50]))
    # Exit 0 even if some Drive files are rate-limited; existing photos remain untouched.
    return 0

if __name__=='__main__':
    sys.exit(main())