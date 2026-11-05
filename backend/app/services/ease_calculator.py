from typing import Dict, Any, List

MEASUREMENT_TRANSLATIONS = {
    "neck_circumference": {
        "en": "Neck Circumference",
        "km": "រង្វង់ក",
        "default_ease_mm": 10.0
    },
    "shoulder_width": {
        "en": "Shoulder Width",
        "km": "ទទឹងស្មា",
        "default_ease_mm": 5.0
    },
    "chest_bust_circumference": {
        "en": "Bust/Chest Circumference",
        "km": "រង្វង់ដើមទ្រូង",
        "default_ease_mm": 30.0
    },
    "under_bust_circumference": {
        "en": "Under-bust Circumference",
        "km": "រង្វង់ក្រោមទ្រូង",
        "default_ease_mm": 20.0
    },
    "waist_circumference": {
        "en": "Waist Circumference",
        "km": "រង្វង់ចង្កេះ",
        "default_ease_mm": 20.0
    },
    "high_hip_circumference": {
        "en": "High Hip Circumference",
        "km": "រង្វង់ត្រគាកលើ",
        "default_ease_mm": 25.0
    },
    "low_hip_circumference": {
        "en": "Low Hip Circumference",
        "km": "រង្វង់ត្រគាកក្រោម",
        "default_ease_mm": 35.0
    },
    "bicep_circumference": {
        "en": "Bicep Circumference",
        "km": "រង្វង់ដើមដៃ",
        "default_ease_mm": 15.0
    },
    "wrist_circumference": {
        "en": "Wrist Circumference",
        "km": "រង្វង់កដៃ",
        "default_ease_mm": 10.0
    },
    "armhole_depth": {
        "en": "Armhole Depth",
        "km": "ជម្រៅក្លៀក",
        "default_ease_mm": 10.0
    },
    "sleeve_length": {
        "en": "Sleeve Length",
        "km": "ប្រវែងដៃអាវ",
        "default_ease_mm": 10.0
    },
    "back_neck_to_waist": {
        "en": "Back Neck to Waist",
        "km": "ប្រវែងខ្នងដល់ចង្កេះ",
        "default_ease_mm": 0.0
    },
    "waist_to_ankle_outseam": {
        "en": "Waist to Ankle Outseam",
        "km": "ប្រវែងជើងក្រៅ",
        "default_ease_mm": 15.0
    },
    "inseam": {
        "en": "Inseam Length",
        "km": "ប្រវែងជើងក្នុង",
        "default_ease_mm": 10.0
    }
}

def apply_garment_ease(
    measurements: List[Dict[str, Any]],
    garment_ease_rules: Dict[str, float]
) -> List[Dict[str, Any]]:
    """
    Applies garment ease rules (in mm) to skin measurements to compute final
    tailor pattern cut values in both cm and inches.
    """
    processed = []
    for item in measurements:
        key = item.get("key") or item.get("measurement_key")
        skin_mm = float(item.get("skin_mm", item.get("skin_value_mm", 0.0)))
        
        # Check garment ease rules, else use standard default
        ease_mm = float(garment_ease_rules.get(key, MEASUREMENT_TRANSLATIONS.get(key, {}).get("default_ease_mm", 0.0)))
        
        skin_cm = round(skin_mm / 10.0, 1)
        skin_in = round(skin_mm / 25.4, 2)
        ease_cm = round(ease_mm / 10.0, 1)
        
        cut_mm = skin_mm + ease_mm
        cut_cm = round(cut_mm / 10.0, 1)
        cut_in = round(cut_mm / 25.4, 2)
        
        trans = MEASUREMENT_TRANSLATIONS.get(key, {
            "en": key.replace("_", " ").title(),
            "km": key
        })

        processed.append({
            "measurement_key": key,
            "name_en": trans["en"],
            "name_km": trans["km"],
            "skin_value_mm": skin_mm,
            "skin_value_cm": skin_cm,
            "skin_value_in": skin_in,
            "ease_mm": ease_mm,
            "ease_cm": ease_cm,
            "pattern_cut_cm": cut_cm,
            "pattern_cut_in": cut_in,
            "notes": f"Ease +{ease_cm} cm applied" if ease_cm > 0 else "Direct skin fit"
        })
    return processed
