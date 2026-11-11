"""Genera etiquetas visuales sugeridas con CLIP abierto, sin APIs pagadas.

Advertencia: clasificación aproximada, no sustituye revisión humana. Cada modelo
conserva su código original. El índice sólo incluye archivos con imágenes locales.
"""
import json
from pathlib import Path
from PIL import Image

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / 'etiquetas-visuales.js'
ITEMS = json.loads((BASE / 'catalogo.json').read_text(encoding='utf-8'))
ITEMS += json.loads((BASE / 'navidad.json').read_text(encoding='utf-8'))

# CLIP se entrena principalmente con inglés; usamos descripciones visuales en inglés
# y devolvemos las etiquetas españolas para interpretar solicitudes del catálogo.
LABELS = [
 ('muñeco de nieve', 'a cute handmade felt snowman Christmas decoration with a carrot nose'),
 ('santa claus', 'a handmade felt Santa Claus Christmas craft with a white beard and red hat'),
 ('reno', 'a handmade felt reindeer Christmas decoration with antlers'),
 ('duende', 'a handmade felt Christmas elf in a green and red hat'),
 ('galleta de jengibre', 'a handmade gingerbread man felt Christmas craft'),
 ('pingüino', 'a cute handmade felt penguin Christmas decoration'),
 ('grinch', 'a handmade felt green Grinch Christmas character'),
 ('cascanueces', 'a handmade felt nutcracker toy soldier Christmas decoration'),
 ('angel', 'a handmade felt angel doll with wings and halo'),
 ('oso', 'a cute handmade felt teddy bear toy'),
 ('arbol de navidad', 'a handmade felt Christmas tree with ornaments'),
 ('corona', 'a handmade felt Christmas wreath decoration'),
 ('bota navideña', 'a handmade felt Christmas stocking decoration'),
 ('esfera navideña', 'a handmade felt round Christmas bauble ornament'),
 ('trineo', 'a handmade felt Christmas sleigh decoration'),
 ('muñeca', 'a handmade felt doll with a dress and face'),
 ('bruja', 'a handmade felt Halloween witch with a pointy hat'),
 ('catrina', 'a Mexican Catrina skeleton lady Día de Muertos felt craft'),
 ('calavera', 'a handmade felt sugar skull skeleton decoration'),
 ('fantasma', 'a handmade felt Halloween ghost decoration'),
 ('murciélago', 'a handmade felt black bat Halloween decoration'),
 ('calabaza', 'a handmade felt pumpkin Halloween decoration'),
 ('vampiro', 'a handmade felt vampire Dracula Halloween decoration'),
 ('frankenstein', 'a handmade felt Frankenstein monster Halloween decoration'),
 ('juego de baño', 'a decorative handmade felt toilet seat bathroom set'),
 ('cortinero', 'a handmade felt curtain tieback ornament'),
 ('cojín', 'a handmade felt pillow cushion decoration'),
 ('cocina', 'a handmade felt kitchen apron or towel decoration'),
]


def from_filename():
    """Usa sólo palabras que aparecen realmente en el nombre."""
    labels = {}
    common = {
        'nieve': 'muñeco de nieve', 'snowman': 'muñeco de nieve',
        'santa': 'santa claus', 'noel': 'santa claus',
        'reno': 'reno', 'duende': 'duende', 'elfo': 'duende',
        'grinch': 'grinch', 'jengibre': 'galleta de jengibre',
        'pinguino': 'pingüino', 'pingüino': 'pingüino',
        'cascanueces': 'cascanueces', 'angel': 'angel', 'ángel': 'angel',
        'catrina': 'catrina', 'catrin': 'catrina',
        'bruja': 'bruja', 'calavera': 'calavera',
        'fantasma': 'fantasma', 'franky': 'frankenstein',
        'frankie': 'frankenstein', 'cojin': 'cojín', 'cojín': 'cojín',
        'bano': 'juego de baño', 'baño': 'juego de baño',
        'cortinero': 'cortinero', 'cocina': 'cocina',
    }
    for item in ITEMS:
        name = item['archivo'].lower()
        found = sorted({v for k, v in common.items() if k in name})
        if found:
            labels[item['codigo']] = found
    return labels


def classify():
    import torch
    import torch.nn.functional as F
    from transformers import CLIPModel, CLIPProcessor
    torch.set_num_threads(2)
    model_id = 'openai/clip-vit-base-patch32'
    processor = CLIPProcessor.from_pretrained(model_id)
    model = CLIPModel.from_pretrained(model_id)
    model.eval()
    prompts = [x[1] for x in LABELS]
    with torch.inference_mode():
        toks = processor(text=prompts, padding=True, return_tensors='pt')
        texts = F.normalize(model.get_text_features(**toks), dim=-1)
    tags = from_filename()
    ready = [(item['codigo'], BASE / 'images' / (item['codigo'] + '.webp')) for item in ITEMS]
    ready = [(code, path) for code, path in ready if path.is_file()]
    total = len(ready)
    print(f'Etiquetando {total} imágenes de {len(ITEMS)} registros', flush=True)
    with torch.inference_mode():
        for i in range(0, total, 12):
            batch = ready[i:i+12]
            images = []
            codes = []
            for code, path in batch:
                try:
                    with Image.open(path) as im:
                        images.append(im.convert('RGB'))
                        codes.append(code)
                except (OSError, ValueError):
                    continue
            if not images:
                continue
            pixel = processor(images=images, return_tensors='pt')['pixel_values']
            features = F.normalize(model.get_image_features(pixel_values=pixel), dim=-1)
            scores = features @ texts.T
            for code, score_row in zip(codes, scores):
                best = float(score_row.max())
                top = torch.topk(score_row, k=min(4, len(LABELS)))
                found = [LABELS[int(idx)][0] for sc, idx in zip(top.values, top.indices)
                         if float(sc) >= 0.18 and float(sc) >= best - 0.045]
                if found:
                    tags[code] = sorted(set(tags.get(code, [])).union(found))
            if i % 120 == 0:
                print(f'Procesadas {min(i+len(batch), total)}/{total}', flush=True)
    return tags


def main():
    try:
        tags = classify()
    except Exception as e:
        print('El índice visual no se completó:', repr(e), 'se conserva búsqueda por nombres', flush=True)
        tags = from_filename()
    OUT.write_text('window.GABYS_ETIQUETAS=' + json.dumps(tags, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(f'Etiquetas guardadas para {len(tags)} modelos en {OUT.name}', flush=True)


if __name__ == '__main__':
    main()