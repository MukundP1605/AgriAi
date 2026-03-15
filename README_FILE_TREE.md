# Project file tree & concise analysis

A compact snapshot of the repository layout and a short analysis to help new contributors quickly understand the project's structure and how to run it.

## File tree

Top-level:

```
index.html
manifest.json
package.json
README.md
README_FILE_TREE.md
requirements.txt
robots.txt
assets/
backend/
data/
datasets/
frontend/
public/
src/
```

Key subtrees (condensed):

```
assets/
  (bundled JS/CSS chunks for the web UI)

backend/
  app/
    __init__.py
    create_db.py
    database.py
    main.py
    setup_db.py
    setup_marketplace.py
    update_crop_history_schema.py
    app/
      secure_images/
      temp/
    models/
      chatbot_llm.py
      crop_management.py
      crop_model.py
      disease_model.pth
      disease_model.py
      fertilizer.py
      history.py
      ...
    routes/
    schemas/
    secure_images/
    static/
    temp/
    utils/

data/
  preprocessing.py
  plantvillage/

datasets/
  Crop_recommendation.csv

frontend/
  package.json
  vite.config.js
  tailwind.config.js
  input.css
  output.css
  set-classic-theme.js
  tailwind.classic.config.js
  tailwind.futuristic.config.js
  AgriAI/ (example app variant)
  src/
    main.jsx
    assets/
    components/
    context/
    services/
    themes/

public/
  index.html
  manifest.json
  robots.txt
  images/
```

## Concise analysis

- **Purpose:** Full-stack agricultural AI platform — crop recommendation, disease detection, farmer dashboard and history.
- **Backend:** Python service under `backend/app` with machine learning models in `backend/app/models` (includes `disease_model.pth`). Check `backend/app/main.py` for the app entrypoint. Dependencies are declared in `requirements.txt`.
- **Frontend:** React/Vite + Tailwind project in `frontend/` (and a packaged `AgriAI/` variant). UI bundles live in `assets/`. Theme toggles and theme configs are included (`tailwind.*.config.js`). There is a workspace task `Start Frontend with Themes` that runs `npm run dev-with-themes`.
- **Data & models:** `datasets/Crop_recommendation.csv` and `data/plantvillage/` indicate training and inference datasets. Presence of `.pth` suggests PyTorch models.
- **Notable files:** `backend/app/models/disease_model.pth`, `datasets/Crop_recommendation.csv`, `frontend/src/main.jsx`, `frontend/package.json`, `requirements.txt`.

## Quick start (generic)

Backend (Windows example):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # or use activation for your shell
pip install -r requirements.txt
python backend/app/main.py        # or follow the project's documented start command
```

Frontend:

```bash
cd frontend
npm install
npm run dev-with-themes   # or `npm run dev` if available
```

## Suggested next steps

- Add a short top-level `README.md` runbook linking to this file with clear run & deploy steps.
- Document required environment variables, expected API endpoints, and any DB migrations (scripts under `backend/app/` suggest DB setup utilities).
- Add CONTRIBUTING.md and a minimal tests checklist for CI.

If you want, I can update the top-level `README.md` to reference this file and include exact run commands after I inspect `backend/app/main.py` and `frontend/package.json`.
