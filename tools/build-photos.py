#!/usr/bin/env python3
"""Download one openly licensed (CC0 / CC BY / CC BY-SA) photo per species from iNaturalist,
resize to 480 px, and write data/photos.js with credits. Usage: python3 tools/build-photos.py"""
import json, os, re, time, urllib.request, urllib.parse, io
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..')
# key used in the guide -> iNaturalist search name
Q = {
 'Taraxacum officinale': 'Taraxacum officinale', 'Stellaria media': 'Stellaria media', 'Allium canadense, A. vineale': 'Allium canadense',
 'Plantago major, P. lanceolata': 'Plantago major', 'Portulaca oleracea': 'Portulaca oleracea', 'Amaranthus spp.': 'Amaranthus retroflexus',
 'Cichorium intybus': 'Cichorium intybus', 'Viola spp.': 'Viola sororia', 'Oxalis spp.': 'Oxalis stricta', 'Trifolium spp.': 'Trifolium repens',
 'Lamium amplexicaule, L. purpureum': 'Lamium amplexicaule', 'Galium aparine': 'Galium aparine', 'Tradescantia spp.': 'Tradescantia ohiensis',
 'Sonchus, Lactuca spp.': 'Sonchus oleraceus', 'Rubus spp.': 'Rubus argutus', 'Vitis rotundifolia': 'Vitis rotundifolia', 'Asimina triloba': 'Asimina triloba',
 'Diospyros virginiana': 'Diospyros virginiana', 'Morus rubra (and white mulberry M. alba)': 'Morus rubra', 'Sambucus canadensis': 'Sambucus canadensis',
 'Prunus angustifolia, P. americana': 'Prunus angustifolia', 'Vaccinium, Gaylussacia spp.': 'Vaccinium virgatum', 'Passiflora incarnata': 'Passiflora incarnata',
 'Fragaria virginiana': 'Fragaria virginiana', 'Amelanchier spp.': 'Amelanchier arborea', 'Opuntia humifusa': 'Opuntia humifusa', 'Serenoa repens': 'Serenoa repens',
 'Rhus typhina, R. glabra, R. copallinum': 'Rhus glabra', 'Celtis spp.': 'Celtis laevigata', 'Callicarpa americana': 'Callicarpa americana', 'Quercus spp.': 'Quercus alba',
 'Carya spp. (shagbark, mockernut, pignut)': 'Carya ovata', 'Carya illinoinensis': 'Carya illinoinensis', 'Juglans nigra': 'Juglans nigra',
 'Castanea pumila, C. dentata': 'Castanea pumila', 'Fagus grandifolia': 'Fagus grandifolia', 'Pinus spp.': 'Pinus taeda', 'Typha spp.': 'Typha latifolia',
 'Apios americana': 'Apios americana', 'Pueraria montana': 'Pueraria montana', 'Smilax spp.': 'Smilax rotundifolia', 'Helianthus tuberosus': 'Helianthus tuberosus',
 'Sagittaria spp.': 'Sagittaria latifolia', 'Hemerocallis fulva': 'Hemerocallis fulva', 'Phytolacca americana': 'Phytolacca americana',
 'Laetiporus spp.': 'Laetiporus sulphureus', 'Cantharellus spp.': 'Cantharellus cibarius', 'Morchella spp.': 'Morchella americana', 'Calvatia spp.': 'Calvatia gigantea',
 'Pleurotus ostreatus': 'Pleurotus ostreatus', 'Cicuta maculata': 'Cicuta maculata', 'Conium maculatum': 'Conium maculatum', 'Datura stramonium': 'Datura stramonium',
 'Solanum spp.': 'Solanum carolinense', 'Toxicoscordion, Ornithogalum': 'Toxicoscordion venenosum', 'Taxus spp.': 'Taxus baccata', 'Nerium oleander': 'Nerium oleander',
 'Ricinus communis, Abrus precatorius': 'Ricinus communis', 'Hippomane mancinella': 'Hippomane mancinella', 'Aesculus spp.': 'Aesculus pavia',
 'Kalmia, Rhododendron spp.': 'Kalmia latifolia', 'Gelsemium sempervirens': 'Gelsemium sempervirens', 'Lantana camara': 'Lantana camara',
 # lookalikes & hazards shown elsewhere in the guide
 'Menispermum canadense': 'Menispermum canadense', 'Omphalotus illudens': 'Omphalotus illudens', 'Amanita bisporigera': 'Amanita bisporigera',
 'Gyromitra esculenta': 'Gyromitra', 'Toxicodendron radicans': 'Toxicodendron radicans', 'Toxicodendron vernix': 'Toxicodendron vernix',
 'Agkistrodon contortrix': 'Agkistrodon contortrix', 'Agkistrodon piscivorus': 'Agkistrodon piscivorus', 'Crotalus adamanteus': 'Crotalus adamanteus',
 'Crotalus horridus': 'Crotalus horridus', 'Sistrurus miliarius': 'Sistrurus miliarius', 'Micrurus fulvius': 'Micrurus fulvius',
 'Lampropeltis elapsoides': 'Lampropeltis elapsoides', 'Nerodia sipedon': 'Nerodia sipedon',
 'Latrodectus mactans': 'Latrodectus mactans', 'Loxosceles reclusa': 'Loxosceles reclusa', 'Amblyomma americanum': 'Amblyomma americanum',
 'Rhinella marina': 'Rhinella marina', 'Cycas revoluta': 'Cycas revoluta', 'Alligator mississippiensis': 'Alligator mississippiensis',
 # fish & shellfish
 'Lepomis macrochirus': 'Lepomis macrochirus', 'Lepomis microlophus': 'Lepomis microlophus', 'Micropterus salmoides': 'Micropterus salmoides', 'Pomoxis nigromaculatus': 'Pomoxis nigromaculatus', 'Ictalurus punctatus': 'Ictalurus punctatus', 'Ictalurus furcatus': 'Ictalurus furcatus', 'Pylodictis olivaris': 'Pylodictis olivaris', 'Ameiurus natalis': 'Ameiurus natalis', 'Morone saxatilis': 'Morone saxatilis', 'Esox niger': 'Esox niger', 'Oncorhynchus mykiss': 'Oncorhynchus mykiss', 'Salvelinus fontinalis': 'Salvelinus fontinalis', 'Atractosteus spatula': 'Atractosteus spatula', 'Amia calva': 'Amia calva', 'Sciaenops ocellatus': 'Sciaenops ocellatus', 'Cynoscion nebulosus': 'Cynoscion nebulosus', 'Micropogonias undulatus': 'Micropogonias undulatus', 'Paralichthys lethostigma': 'Paralichthys lethostigma', 'Archosargus probatocephalus': 'Archosargus probatocephalus', 'Mugil cephalus': 'Mugil cephalus', 'Pomatomus saltatrix': 'Pomatomus saltatrix', 'Sphoeroides nephelus': 'Sphoeroides nephelus', 'Pterois volitans': 'Pterois volitans', 'Hypanus sabinus': 'Hypanus sabinus', 'Callinectes sapidus': 'Callinectes sapidus', 'Procambarus clarkii': 'Procambarus clarkii', 'Litopenaeus setiferus': 'Litopenaeus setiferus', 'Crassostrea virginica': 'Crassostrea virginica',
}
OK = {'cc0', 'cc-by', 'cc-by-sa'}
UA = {'User-Agent': 'FieldGuideOfflineApp/1.0 (build script; one-time download of a few photos)'}
def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r: return r.read()
        except Exception as e:
            time.sleep(3 * (i + 1)); last = e
    raise last
out = {}
try:
    prev = open(os.path.join(ROOT, 'data/photos.js')).read(); out = json.loads(prev[prev.index('window.FG_PHOTOS=') + 17: prev.index(';\nwindow.FG_PH')])
except Exception: pass
for key, q in Q.items():
    if key in out: continue
    try:
        res = json.loads(get('https://api.inaturalist.org/v1/taxa?' + urllib.parse.urlencode({'q': q, 'per_page': 1})))['results']
        if not res: print('no taxon', q); continue
        tid = res[0]['id']; time.sleep(1.1)
        taxon = json.loads(get(f'https://api.inaturalist.org/v1/taxa/{tid}'))['results'][0]; time.sleep(1.1)
        ph = next((tp['photo'] for tp in taxon.get('taxon_photos', []) if (tp['photo'].get('license_code') or '') in OK), None)
        if not ph:  # fall back to the most-faved research-grade observation photo with an open licence
            obs = json.loads(get('https://api.inaturalist.org/v1/observations?' + urllib.parse.urlencode({'taxon_id': tid, 'photo_license': 'cc0,cc-by,cc-by-sa', 'quality_grade': 'research', 'order_by': 'votes', 'per_page': 5, 'photos': 'true'})))['results']; time.sleep(1.1)
            for o in obs:
                ph = next((x for x in o.get('photos', []) if (x.get('license_code') or '') in OK), None)
                if ph: ph = dict(ph, medium_url=ph['url'].replace('square', 'medium')); break
        if not ph: print('no open photo', q); continue
        url = ph['medium_url'] if 'medium_url' in ph else ph['url'].replace('square', 'medium')
        img = Image.open(io.BytesIO(get(url))).convert('RGB'); img.thumbnail((480, 480))
        slug = re.sub(r'[^a-z]+', '-', q.lower()).strip('-'); fn = f'img/photos/{slug}.jpg'
        img.save(os.path.join(ROOT, fn), 'JPEG', quality=72, optimize=True, progressive=True)
        out[key] = {'f': fn, 'c': ph.get('attribution', ''), 'l': ph.get('license_code', ''), 'n': taxon.get('name'), 'cn': taxon.get('preferred_common_name', '')}
        print('ok', q, ph.get('license_code'), os.path.getsize(os.path.join(ROOT, fn)) // 1024, 'KB', flush=True)
    except Exception as e: print('fail', q, e)
open(os.path.join(ROOT, 'data/photos.js'), 'w').write(
  '/* Species photos from iNaturalist (CC0 / CC BY / CC BY-SA). Generated by tools/build-photos.py */\n'
  'window.FG_PHOTOS=' + json.dumps(out, ensure_ascii=False) + ';\n'
  "window.FG_PH=function(k,cap){var p=window.FG_PHOTOS[k];if(!p)return '';var e=function(s){return String(s).replace(/[&<>\"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})};"
  "return '<figure class=\"photo\"><img src=\"'+p.f+'\" alt=\"'+e(cap||p.cn||p.n)+'\" loading=\"lazy\"><figcaption>'+(cap?e(cap)+' · ':'')+'<i>'+e(p.n)+'</i> · '+e(p.c)+'</figcaption></figure>'};\n")
json.dump(sorted({v['f'] for v in out.values()}), open(os.path.join(ROOT, 'data/photo-files.json'), 'w'))
print('done', len(out), 'of', len(Q))
