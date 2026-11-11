"""Describe cada fotografía del catálogo con una IA de visión GRATUITA (Pollinations).

- Lee las miniaturas locales (images/actualizacion-nov26/*.webp).
- Guarda el avance en descripciones-ia.json (se puede cortar y retomar).
- Genera descripciones-ia.js (para el asistente Colibrí) y etiquetas-visuales.js
  (para el buscador normal de la página).
- Solo describe lo que se ve; si la IA no responde, la foto se reintenta en la siguiente corrida.
"""
import base64
import io
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from PIL import Image

BASE = Path(__file__).resolve().parent.parent
OUT_JSON = BASE / 'descripciones-ia.json'
OUT_JS = BASE / 'descripciones-ia.js'
OUT_TAGS = BASE / 'etiquetas-visuales.js'
URL = 'https://gen.pollinations.ai/v1/chat/completions'
KEY = os.environ.get('POLLINATIONS_KEY') or 'sk_1XvEYtOmiFixsgMve0FAqQz5ghhy7FFT'
MODELS = [m for m in os.environ.get('MODELOS_VISION', 'openai,gemini,openai-fast,openai-large').split(',') if m]
LIMITE_MIN = float(os.environ.get('LIMITE_MINUTOS', '320'))
GUARDAR_CADA = int(os.environ.get('GUARDAR_CADA', '120'))
HILOS = int(os.environ.get('HILOS', '3'))
INICIO = time.time()

PROMPT = """Eres catalogador de "Moldes y Diseños Gaby's", tienda de moldes para figuras de FIELTRO.
Mira la fotografía de la figura terminada y responde SOLO con JSON válido, sin texto extra:
{"figuras":[...],"tipo":"...","colores":[...],"descripcion":"..."}
- figuras: personajes u objetos principales que se VEN, en español, singular y minúsculas.
  Usa nombres comunes: "santa claus", "mamá noel", "muñeco de nieve", "reno", "duende", "pingüino", "oso",
  "ángel", "árbol de navidad", "galleta de jengibre", "esfera", "estrella", "campana", "regalo", "trineo",
  "nacimiento", "virgen", "niño dios", "cascanueces", "grinch", "bruja", "calabaza", "fantasma", "catrina",
  "calavera", "murciélago", "gato", "vampiro", "corazón", "cupido", "bebé", "cigüeña", "charro", "china poblana",
  "bandera", "flor", "mariposa", "búho", "perro", "conejo", "muñeca", "payaso", etc. Máximo 6.
- tipo: para qué sirve (ej. "letrero de bienvenida", "colgante de puerta", "corona de puerta", "centro de mesa",
  "bota navideña", "pie de árbol", "cojín", "juego de baño", "porta servilletas", "adorno", "dulcero", "tapete").
- colores: 2 a 4 colores dominantes en español.
- descripcion: UNA frase corta y natural (máx. 18 palabras) de lo que muestra la figura.
Ignora marcas de agua, teléfonos, correos, direcciones y números de modelo impresos en la foto."""


def norm(s):
    return unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode().lower().strip()


def cargar_items():
    items = json.loads((BASE / 'catalogo.json').read_text(encoding='utf-8'))
    items += json.loads((BASE / 'navidad.json').read_text(encoding='utf-8'))
    vistos, salida = set(), []
    for it in items:
        if it['codigo'] in vistos:
            continue
        vistos.add(it['codigo'])
        salida.append(it)
    return salida


def ruta_imagen(it):
    for cand in (it.get('imagenLocal'), f"images/{it['codigo']}.webp"):
        if cand and (BASE / cand).exists():
            return BASE / cand
    return None


def data_url(path):
    im = Image.open(path).convert('RGB')
    im.thumbnail((640, 640))
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=82)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


modelo_bueno = {'m': None}


def preguntar(path):
    url = data_url(path)
    orden = ([modelo_bueno['m']] if modelo_bueno['m'] else []) + [m for m in MODELS if m != modelo_bueno['m']]
    ultimo = None
    for modelo in orden:
        for intento in range(2):
            try:
                r = requests.post(URL, timeout=90, headers={'authorization': 'Bearer ' + KEY, 'content-type': 'application/json'}, json={
                    'model': modelo, 'temperature': 0.2, 'max_tokens': 400,
                    'messages': [{'role': 'user', 'content': [
                        {'type': 'text', 'text': PROMPT},
                        {'type': 'image_url', 'image_url': {'url': url}}]}]})
                if r.status_code == 429:
                    time.sleep(8 + intento * 10)
                    continue
                r.raise_for_status()
                txt = r.json()['choices'][0]['message']['content'] or ''
                m = re.search(r'\{[\s\S]*\}', txt)
                j = json.loads(m.group(0)) if m else None
                if not j or not isinstance(j.get('figuras'), list):
                    raise ValueError('respuesta sin JSON')
                modelo_bueno['m'] = modelo
                return limpiar(j, modelo)
            except Exception as e:  # probamos otro intento/modelo
                ultimo = e
                time.sleep(2)
    raise RuntimeError(f'sin respuesta: {ultimo}')


def limpiar(j, modelo):
    figs = []
    for f in j.get('figuras', [])[:6]:
        f = str(f).strip().lower()
        if f and len(f) < 40 and f not in figs:
            figs.append(f)
    colores = [str(c).strip().lower() for c in (j.get('colores') or [])[:4] if str(c).strip()]
    return {
        'f': figs,
        't': str(j.get('tipo') or '').strip().lower()[:60],
        'c': colores,
        'd': re.sub(r'\s+', ' ', str(j.get('descripcion') or '')).strip()[:180],
        'm': modelo,
    }


def escribir(datos, items):
    OUT_JSON.write_text(json.dumps(datos, ensure_ascii=False, indent=0, sort_keys=True), encoding='utf-8')
    compacto = {k: {kk: v[kk] for kk in ('f', 't', 'c', 'd') if v.get(kk)} for k, v in sorted(datos.items())}
    OUT_JS.write_text('/* Generado por scripts/describir_fotos_ia.py (IA de visión gratuita). No editar a mano. */\n'
                      'window.GABYS_DESCRIPCIONES=' + json.dumps(compacto, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    etiquetas = {k: v['f'] + ([v['t']] if v.get('t') else []) for k, v in sorted(datos.items()) if v.get('f')}
    OUT_TAGS.write_text('window.GABYS_ETIQUETAS=' + json.dumps(etiquetas, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(f'Guardadas {len(datos)} de {len(items)} descripciones', flush=True)


def publicar(mensaje):
    if os.environ.get('GITHUB_ACTIONS') != 'true':
        return
    cmds = [
        ['git', 'add', OUT_JSON.name, OUT_JS.name, OUT_TAGS.name],
        ['git', 'commit', '-m', mensaje + ' [skip ci]'],
        ['git', 'pull', '--rebase', '-X', 'theirs', 'origin', 'main'],
        ['git', 'push', 'origin', 'HEAD:main'],
    ]
    for c in cmds:
        r = subprocess.run(c, cwd=BASE, capture_output=True, text=True)
        if r.returncode and c[1] not in ('commit',):
            print('git:', ' '.join(c), r.stderr[-400:], flush=True)


def main():
    items = cargar_items()
    datos = json.loads(OUT_JSON.read_text(encoding='utf-8')) if OUT_JSON.exists() else {}
    validos = {it['codigo'] for it in items}
    datos = {k: v for k, v in datos.items() if k in validos}
    pendientes = [it for it in items if it['codigo'] not in datos and ruta_imagen(it)]
    print(f'Catálogo: {len(items)} · ya descritas: {len(datos)} · pendientes: {len(pendientes)}', flush=True)
    if not pendientes:
        escribir(datos, items)
        return
    hechos, fallos = 0, 0
    with ThreadPoolExecutor(max_workers=HILOS) as ex:
        it_iter = iter(pendientes)
        en_curso = {}
        def lanzar():
            if (time.time() - INICIO) / 60 > LIMITE_MIN:
                return False
            try:
                it = next(it_iter)
            except StopIteration:
                return False
            en_curso[ex.submit(preguntar, ruta_imagen(it))] = it
            return True
        for _ in range(HILOS * 2):
            lanzar()
        while en_curso:
            fut = next(as_completed(list(en_curso)))
            it = en_curso.pop(fut)
            try:
                datos[it['codigo']] = fut.result()
                hechos += 1
            except Exception as e:
                fallos += 1
                print('Falló', it['codigo'], e, flush=True)
                if fallos > 60 and hechos == 0:
                    print('La IA de visión no responde; se reintentará después.', flush=True)
                    break
            if hechos and hechos % GUARDAR_CADA == 0:
                escribir(datos, items)
                publicar(f'IA: describir fotos del catálogo ({len(datos)}/{len(items)})')
            lanzar()
    escribir(datos, items)
    publicar(f'IA: describir fotos del catálogo ({len(datos)}/{len(items)})')
    print(f'Listo: {hechos} nuevas, {fallos} fallidas', flush=True)
    if hechos == 0 and pendientes:
        sys.exit(1)


if __name__ == '__main__':
    main()
