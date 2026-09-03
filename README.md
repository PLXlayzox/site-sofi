# site-sofi

Site vitrine de **Sofi — artiste du vivant**.

Site statique (HTML/CSS/JS vanilla, zéro build) hébergé sur **GitHub Pages**.

## Structure

```
site-sofi/
├── index.html              # accueil + 4 sections (single-page)
├── assets/
│   ├── style.css
│   ├── main.js
│   └── portrait-sofi.jpg
└── textes/
    ├── _texte.css
    ├── peindre.html
    ├── les-cadres.html
    └── le-monde-a-besoin-de-toi.html
```

## Développement local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Déploiement

Push sur `main` → GitHub Pages sert automatiquement depuis la racine.
