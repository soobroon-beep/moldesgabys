"""Etiquetado visual aproximado de figuras de fieltro usando CLIP open source.
No requiere API ni tokens de pago. Los números originales nunca se modifican.
"""
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parent.parent
PRODUCTS=json.loads((ROOT/'catalogo.json').read_text(encoding='utf-8'))
PRODUCTS+=json.loads((ROOT/'navidad.json').read_text(encoding='utf-8'))
LABELS=[
 ('muñeco de nieve','a cute handmade felt snowman Christmas decoration with a carrot nose'),
 ('santa claus','a handmade felt Santa Claus Christmas figure with a white beard'),
 ('reno','a handmade felt reindeer Christmas decoration with antlers'),
 ('duende','a handmade felt Christmas elf decoration with a pointy hat'),
 ('galleta de jengibre','a handmade felt gingerbread man Christmas cookie decoration'),
 ('pingüino','a cute handmade felt penguin Christmas decoration'),
 ('grinch','a handmade felt green Grinch Christmas character'),
 ('cascanueces','a handmade felt nutcracker toy soldier Christmas decoration'),
 ('angel','a handmade felt angel decoration with wings and halo'),
 ('oso','a cute handmade felt teddy bear decoration'),
 ('arbol de navidad','a handmade felt Christmas tree decoration'),
 ('corona','a handmade felt Christmas wreath decoration'),
 ('bota navideña','a handmade felt Christmas stocking decoration'),
 ('esfera navideña','a handmade felt Christmas ornament bauble'),
 ('trineo','a handmade felt Santa sleigh decoration'),
 ('muñeca','a handmade felt doll in a colorful dress'),
 ('bruja','a handmade felt Halloween witch with a black pointy hat'),
 ('catrina','a handmade felt Mexican Catrina skeleton lady day of the dead decoration'),
 ('calavera','a handmade felt sugar skull skeleton decoration'),
 ('fantasma','a handmade felt cute Halloween ghost decoration'),
 ('murciélago','a handmade felt bat Halloween decoration'),
 ('calabaza','a handmade felt orange pumpkin Halloween decoration'),
 ('vampiro','a handmade felt Dracula vampire Halloween decoration'),
 ('frankenstein','a handmade felt Frankenstein monster Halloween decoration'),
 ('juego de baño','a handmade felt decorative bathroom toilet set'),
 ('cortinero','a handmade felt curtain tieback decoration'),
 ('cojín','a handmade felt cushion pillow decoration'),
 ('cocina','a handmade felt kitchen decoration'),
]

def filename_labels():
    aliases={'nieve':'muñeco de nieve','snowman':'muñeco de nieve','reno':'reno','santa':'santa claus','noel':'santa claus','grinch':'grinch','duende':'duende','pinguino':'pingüino','pingüino':'pingüino','cascanueces':'cascanueces','catrina':'catrina','catrin':'catrina','bruja':'bruja','fantasma':'fantasma','calavera':'calavera','frankie':'frankenstein','franky':'frankenstein','cocina':'cocina','jengibre':'galleta de jengibre'}
    result={}
    for product in PRODUCTS:
        name=product['archivo'].lower()
        arr=sorted({label for word,label in aliases.items() if word in name})
        if arr:result[product['codigo']]=arr
    return result

def main():
    result=filename_labels()
    try:
        import torch
        import torch.nn.functional as F
        from transformers import CLIPModel,CLIPProcessor
        torch.set_num_threads(2)
        processor=CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32')
        model=CLIPModel.from_pretrained('openai/clip-vit-base-patch32').eval()
        with torch.inference_mode():
            tokens=processor(text=[x[1] for x in LABELS],padding=True,return_tensors='pt')
            txt=F.normalize(model.get_text_features(**tokens),dim=-1)
        files=[(p['codigo'], ROOT/'images'/ (p['codigo']+'.webp')) for p in PRODUCTS]
        files=[(code,path) for code,path in files if path.is_file()]
        print(f'Analizando {len(files)} imágenes con CLIP',flush=True)
        with torch.inference_mode():
            for start in range(0,len(files),12):
                batch=files[start:start+12];imgs=[];codes=[]
                for code,path in batch:
                    try:
                        with Image.open(path) as image:
                            imgs.append(image.convert('RGB'));codes.append(code)
                    except (OSError,ValueError):continue
                if not imgs:continue
                pix=processor(images=imgs,return_tensors='pt')['pixel_values']
                embeddings=F.normalize(model.get_image_features(pixel_values=pix),dim=-1)
                scores=embeddings @ txt.T
                for code,row in zip(codes,scores):
                    top=row.topk(k=min(4,len(LABELS)))
                    best=float(top.values[0])
                    suggested=[LABELS[int(i)][0] for value,i in zip(top.values,top.indices) if float(value)>=0.18 and float(value)>=best-0.045]
                    if suggested:result[code]=sorted(set(result.get(code,[])+suggested))
                if start%120==0:print(f'{min(start+12,len(files))}/{len(files)}',flush=True)
    except Exception as exc:
        print('CLIP no disponible; se conservarán etiquetas de nombres:',repr(exc),flush=True)
    (ROOT/'etiquetas-visuales.js').write_text('window.GABYS_ETIQUETAS='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print(f'Índice: {len(result)} modelos etiquetados',flush=True)

if __name__=='__main__':main()
