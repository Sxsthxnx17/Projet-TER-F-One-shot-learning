# CELLULE 5 — Calcul des 8 métriques sur les références CFP
import cv2
import numpy as np
import pandas as pd
from scipy.stats import kurtosis as scipy_kurtosis

def blur_index_BI(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(float)
    filtre = np.array([[1,2,1],[2,4,2],[1,2,1]], dtype=float) / 16
    img_floue = cv2.filter2D(gray, -1, filtre)
    E_orig  = np.abs(np.fft.fftshift(np.fft.fft2(gray)))
    E_floue = np.abs(np.fft.fftshift(np.fft.fft2(img_floue)))
    h, w    = gray.shape
    cy, cx  = h//2, w//2
    Y, X    = np.ogrid[:h, :w]
    dist    = np.sqrt((X-cx)**2 + (Y-cy)**2).astype(int)
    omega_max = min(h, w) // 2
    ER_orig  = np.zeros(omega_max)
    ER_floue = np.zeros(omega_max)
    for omega in range(omega_max):
        masque = dist == omega
        if masque.sum() > 0:
            ER_orig[omega]  = E_orig[masque].mean()
            ER_floue[omega] = E_floue[masque].mean()
    BI = np.log(np.mean(np.abs(ER_orig - ER_floue)) + 1e-6)
    return round(float(BI), 4)

def mesure_nettete_article(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(float)
    gx   = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy   = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad = np.sqrt(gx**2 + gy**2)
    return round(float(np.log(grad.mean() + 1e-6)), 4)

def mesure_contraste_article(img):
    gray    = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(float)
    std_val = gray.std()
    kurt    = scipy_kurtosis(gray.flatten(), fisher=False)
    kurt    = max(kurt, 1e-6)
    return round(float(std_val / (kurt ** 0.25)), 4)

def mesure_luminosite(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return round(float(gray.mean()), 4)

def mesure_effet_blocs(img):
    gray  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(float)
    h, w  = gray.shape
    diff_h, diff_v, count = 0.0, 0.0, 0
    for i in range(8, h, 8):
        diff_h += np.abs(gray[i,:] - gray[i-1,:]).mean()
        count  += 1
    for j in range(8, w, 8):
        diff_v += np.abs(gray[:,j] - gray[:,j-1]).mean()
        count  += 1
    return round(float((diff_h+diff_v)/count), 4) if count > 0 else 0.0

def get_angle_deepface(img_path):
    """Angle via DeepFace landmarks"""
    try:
        result = DeepFace.extract_faces(
            img_path,
            detector_backend  = 'retinaface',
            enforce_detection = False
        )
        fa = result[0]['facial_area']
        if 'left_eye' in fa and 'right_eye' in fa:
            le = fa['left_eye']
            re = fa['right_eye']
            cx = (le[0] + re[0]) / 2
            return round(abs(le[0] - cx) / (abs(le[0] - re[0]) + 1e-6), 4)
    except:
        pass
    return 0.0

def get_det_score(img_path):
    """Score de confiance détection via DeepFace"""
    try:
        result = DeepFace.extract_faces(
            img_path,
            detector_backend  = 'retinaface',
            enforce_detection = False
        )
        return round(float(result[0]['confidence']), 4)
    except:
        return 0.0


# ── Calcul sur toutes les références ──
print('📸 Calcul des métriques sur les références CFP...\n')
donnees_cfp = []

for pid in personnes_ok:
    img_path = os.path.join(CFP_DIR, pid, 'frontal', '01.jpg')
    img      = cv2.imread(img_path)
    if img is None:
        continue

    # Taille du visage
    h, w = img.shape[:2]

    m = {
        'photo'        : pid,
        'det_score'    : get_det_score(img_path),
        'BI_these'     : blur_index_BI(img),
        'nettete'      : mesure_nettete_article(img),
        'contraste'    : mesure_contraste_article(img),
        'luminosite'   : mesure_luminosite(img),
        'effet_blocs'  : mesure_effet_blocs(img),
        'taille_visage': int(min(h, w)),
        'angle'        : get_angle_deepface(img_path),
    }

    # Score similarité max avec les autres
    emb    = gallery_cfp[pid]
    scores = [torch.dot(emb, v).item()
              for k, v in gallery_cfp.items() if k != pid]
    m['score_sim_max'] = round(max(scores), 4) if scores else 0.0

    donnees_cfp.append(m)
    print(f'  ✅ {pid} | det:{m["det_score"]:.2f} | '
          f'BI:{m["BI_these"]:.2f} | '
          f'nettete:{m["nettete"]:.2f} | '
          f'angle:{m["angle"]:.2f}')

df_cfp = pd.DataFrame(donnees_cfp)
print(f'\n✅ {len(df_cfp)} photos analysées')
print('\n📊 Aperçu :')
print(df_cfp[['photo','det_score','BI_these','nettete',
              'contraste','luminosite','effet_blocs',
              'taille_visage','angle']].to_string(index=False))