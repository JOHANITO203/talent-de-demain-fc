# Talent de Demain FC — site

Site vitrine du club (académie de football, Abidjan — U-12, U-15, U-19).

**Ce dépôt contient uniquement les fichiers publiés.** Les fichiers
sources (photos et vidéos d'origine, plusieurs centaines de Mo) et les
scripts de fabrication restent hors dépôt, dans le dossier de travail.

## Contenu

| | |
|---|---|
| `index.html` … `community.html` | Les 5 pages |
| `css/` | `styles.css` (commun + accueil), `pages.css` (pages intérieures) |
| `js/` | `i18n.js` (FR/EN), `nav.js` (menu), `main.js` (héro animé), `hero-sequence.js` (héro tactile), `pages.js` |
| `assets/` | Images WebP, vidéos MP4, `frames/` (héro tactile), polices auto-hébergées |
| `robots.txt`, `sitemap.xml` | Référencement |

## Points à connaître

- **Le site est en français.** L'anglais est appliqué par `js/i18n.js`
  à la demande. La table de traduction est unique : le sens inverse est
  calculé automatiquement.
- **Le maillot du héro a deux sources d'images.** Sur souris, `main.js`
  scrubbe la vidéo (`assets/video/jersey-scrub.mp4`). Sur écran tactile,
  `hero-sequence.js` sert 193 images (`assets/frames/`) : les navigateurs
  mobiles refusent de réveiller le décodeur vidéo sans geste utilisateur,
  ce qui figeait la rotation. Le reste du moteur — lissage, légendes,
  compteur, détourage WebGL — est commun aux deux, donc le rendu est
  identique. Si les images manquent, le héro rebascule seul sur la vidéo.
  Ré-encodage : `ffmpeg -i assets/video/jersey-scrub.mp4 -vf scale=900:1080
  -vsync 0 -c:v libwebp -quality 88 assets/frames/f_%03d.webp`, puis
  incrémenter le `?v=` de `hero-sequence.js` **et** la constante `VER`.
- **Cache** : les liens CSS/JS/images portent un `?v=N`. L'incrémenter
  à chaque modification, sinon les navigateurs servent l'ancienne version.
- **Le formulaire n'est pas encore branché.** Renseigner `data-endpoint`
  dans `community.html` (voir DEPLOIEMENT.md du dossier de travail).
- Aucune dépendance, aucun build : le dossier se publie tel quel.

## Publication

Cloudflare Pages — dossier de sortie : la racine du dépôt.
