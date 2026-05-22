"""
services/quality_service.py — Évaluation de la qualité des images par GraFIQs

Score GraFIQs normalisé de 0 à 100 :
  - Score = 100  : qualité idéale  (raw ≤ GRAFIQS_MAX_THEORIQUE = 0.00085)
  - Score =   0  : image rejetée   (raw ≥ τ* = GRAFIQS_SEUIL_REJET = 0.00174)

Seuil décisionnel calibré via protocole EvR (3 identités, 9 probes annotés) :
  GRAFIQS_SEUIL_DECISION = 50   → en dessous : "a_remplacer"
                                   au-dessus  : "bonne"

Résultats de calibration :
  - Erreur avant filtrage : 71.0 %
  - Erreur après filtrage : 68.2 %  (gain +2.8 pts)
  - τ* (knee EvR)         : 1.74e-3
  - Corrélation Pearson   : r = 0.178
"""

import sys
from pathlib import Path

import torch
import torch.autograd as autograd
from PIL import Image
from torchvision import transforms

# ============================================================
# CONFIG
# ============================================================
GRAFIQS_DIR  = Path("models/grafiqs")
WEIGHTS_PATH = Path("models/weights/resnet50_webface_arcface.pth")

# Seuils calibrés via protocole EvR (3 identités, 9 probes annotés)
# τ_match (seuil cosinus adaptatif) = 0.471
# τ*      (knee detection courbe EvR) = 1.74e-3
GRAFIQS_MAX_THEORIQUE  = 0.00085   # score brut idéal    → 100/100
GRAFIQS_SEUIL_REJET    = 0.00174   # τ* calibré EvR      →   0/100

# Seuil décisionnel sur le score normalisé (0-100)
GRAFIQS_SEUIL_DECISION = 50        # en dessous → "a_remplacer"

# Transform GraFIQs
GRAFIQS_TRANSFORM = transforms.Compose([
    transforms.Resize((112, 112)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])


# ============================================================
# CHARGEMENT GraFIQs
# ============================================================
def load_quality_model():
    """
    Charge le backbone iResNet50 GraFIQs.
    Appelé une seule fois au démarrage via lifespan dans main.py.
    """
    if not WEIGHTS_PATH.exists():
        raise FileNotFoundError(
            f"Poids GraFIQs introuvables : {WEIGHTS_PATH}\n"
            f"Place resnet50_webface_arcface.pth dans models/weights/"
        )

    sys.path.insert(0, str(GRAFIQS_DIR))
    from backbones.iresnet import iresnet50
    from backbones.bn import BN_Model

    device   = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    backbone = iresnet50(num_features=512, dropout=0.4, use_se=False).to(device)
    backbone.load_state_dict(torch.load(WEIGHTS_PATH, map_location=device))
    backbone.return_intermediate = True
    backbone.eval()

    model = BN_Model(backbone, device)
    return model, device


# ============================================================
# SCORE GraFIQs
# ============================================================
def compute_grafiqs_raw(
    face_pil: Image.Image,
    grafiqs_model,
    device: torch.device,
) -> float:
    """
    Calcule le score brut GraFIQs (somme des gradient magnitudes).
    Score brut faible = bonne qualité.
    Score brut élevé  = mauvaise qualité.
    """
    img_tensor = GRAFIQS_TRANSFORM(face_pil).unsqueeze(0).to(device)
    img_tensor.requires_grad_(True)

    bn_score, (emb, block1, block2, block3, block4, bn) = grafiqs_model.get_BN(img_tensor)

    grads = autograd.grad(
        outputs=bn_score,
        inputs=[img_tensor, block1, block2, block3, block4],
        allow_unused=True,
    )

    grad_block4 = grads[4]
    if grad_block4 is not None:
        raw = float(torch.abs(grad_block4[0].cpu()).sum())
    else:
        raw = float(torch.abs(grads[0][0].cpu()).sum())

    return raw


def normalize_grafiqs(raw_score: float) -> float:
    """
    Normalisation absolue basée sur les seuils calibrés.

    Principe :
      raw <= GRAFIQS_MAX_THEORIQUE → score = 100  (meilleure qualité possible)
      raw >= GRAFIQS_SEUIL_REJET  → score =   0  (image rejetée, raw >= τ*)
      entre les deux              → interpolation linéaire inversée

    Seuils calibrés via courbe EvR sur 3 identités / 9 probes annotés.
    τ* = 1.74e-3 déterminé par knee detection (gain mesuré : +2.8 pts d'erreur).
    """
    if raw_score <= GRAFIQS_MAX_THEORIQUE:
        return 100.0

    if raw_score >= GRAFIQS_SEUIL_REJET:
        return 0.0

    ratio = (raw_score - GRAFIQS_MAX_THEORIQUE) / \
            (GRAFIQS_SEUIL_REJET - GRAFIQS_MAX_THEORIQUE)
    return round((1.0 - ratio) * 100.0, 2)


def get_recommendation(grafiqs_score: float) -> str:
    return "bonne" if grafiqs_score >= GRAFIQS_SEUIL_DECISION else "a_remplacer"


# ============================================================
# PIPELINE PRINCIPAL
# ============================================================
def assess_image_quality(
    face_pil: Image.Image,
    box: tuple[int, int, int, int] | None,
    image_size: tuple[int, int],
    grafiqs_model,
    device: torch.device,
) -> dict:
    """
    Évaluation de qualité basée uniquement sur GraFIQs.

    Returns:
        {
            "grafiqs_score"  : float (0-100),
            "grafiqs_raw"    : float,
            "recommendation" : "bonne" | "a_remplacer",
            "face_detected"  : bool,
        }
    """
    face_detected = box is not None

    grafiqs_raw    = compute_grafiqs_raw(face_pil, grafiqs_model, device)
    grafiqs_score  = normalize_grafiqs(grafiqs_raw)
    recommendation = get_recommendation(grafiqs_score)

    return {
        "grafiqs_score":  grafiqs_score,
        "grafiqs_raw":    grafiqs_raw,
        "recommendation": recommendation,
        "face_detected":  face_detected,
    }
