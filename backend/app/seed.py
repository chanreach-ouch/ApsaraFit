import sys
import os
import uuid
from datetime import datetime, timedelta

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine, Base, SessionLocal
from app.models.garment import Garment
from app.models.order import Order
from app.models.measurement import Measurement
from app.services.anthropometry import anthropometry_engine
from app.services.ease_calculator import apply_garment_ease

def seed_database():
    print("🌱 Initializing ApsaraFit database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if garments already seeded
        existing_garments = db.query(Garment).count()
        if existing_garments == 0:
            print("🧵 Seeding 6 Traditional Khmer Showcase Garments...")
            garments_data = [
                {
                    "name_en": "Av Pak (Traditional Khmer Lace/Silk Blouse)",
                    "name_km": "អាវប៉ាក់ (អាវប៉ាក់សូត្របុរាណខ្មែរ)",
                    "slug": "av-pak-blouse",
                    "category": "blouse",
                    "description_en": "Iconic Cambodian high-collared lace and pure raw silk blouse. Tailored with a snug, contoured bodice, hand-embroidered floral motifs, and gold button fastenings. Non-stretch silk demands precision cut ease.",
                    "description_km": "អាវកប៉ាក់សូត្រខ្មែរបុរាណកកម្ពស់ ប៉ាក់ក្បាច់ផ្កាភ្ញីដោយដៃដ៏ប្រណិត និងប៊ូតុងពណ៌មាស។ សាច់សូត្រធម្មជាតិរឹងមាំ ទាមទារការវាស់កាត់យ៉ាងហ្មត់ចត់បំផុត។",
                    "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
                    "fabric_type": "Pure Cambodian Raw Silk / Organza Lace",
                    "price_usd": 120.0,
                    "ease_rules": {
                        "chest_bust_circumference": 30.0,   # +3.0 cm
                        "under_bust_circumference": 20.0,   # +2.0 cm
                        "waist_circumference": 20.0,        # +2.0 cm
                        "shoulder_width": 5.0,              # +0.5 cm
                        "bicep_circumference": 15.0,        # +1.5 cm
                        "armhole_depth": 10.0,              # +1.0 cm
                        "neck_circumference": 10.0,         # +1.0 cm
                        "sleeve_length": 5.0,               # +0.5 cm
                        "back_neck_to_waist": 0.0           # exact length
                    },
                    "required_measurements": [
                        "chest_bust_circumference",
                        "under_bust_circumference",
                        "waist_circumference",
                        "shoulder_width",
                        "bicep_circumference",
                        "armhole_depth",
                        "neck_circumference",
                        "sleeve_length",
                        "back_neck_to_waist"
                    ]
                },
                {
                    "name_en": "Sampot Hol / Sampot Chang Kben",
                    "name_km": "សំពត់ហូល / សំពត់ចងក្បិន",
                    "slug": "sampot-hol-chang-kben",
                    "category": "wrap",
                    "description_en": "Traditional lower wrap garment handcrafted from multi-colored ikat silk. Can be tailored as an elegant fitted tube skirt (Sampot Hol) or wrapped and pleated through the legs as Chang Kben.",
                    "description_km": "សំពត់ហូលចងក្បិនខ្មែរ ត្បាញពីសូត្រគោមខ្មែរប្រពៃណី។ អាចកាត់ជាសំពត់បំពង់រឹបរាង ឬជាក្បិនសម្រាប់ពិធីមង្គលការ និងបុណ្យទានប្រពៃណី។",
                    "image_url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
                    "fabric_type": "Chong Kiet Hand-Woven Khmer Ikat Silk",
                    "price_usd": 140.0,
                    "ease_rules": {
                        "waist_circumference": 15.0,        # +1.5 cm
                        "high_hip_circumference": 25.0,     # +2.5 cm
                        "low_hip_circumference": 35.0,      # +3.5 cm
                        "waist_to_ankle_outseam": 10.0      # +1.0 cm
                    },
                    "required_measurements": [
                        "waist_circumference",
                        "high_hip_circumference",
                        "low_hip_circumference",
                        "waist_to_ankle_outseam"
                    ]
                },
                {
                    "name_en": "Full Traditional Bridal / Ceremony Ensemble",
                    "name_km": "ឈុតមង្គលការប្រពៃណីខ្មែរពេញលេញ",
                    "slug": "traditional-bridal-ceremony-ensemble",
                    "category": "set",
                    "description_en": "The pinnacle of Khmer haute couture. Includes an embroidered Sbong silk sash, tailored Av Pak bodice, draped gold-threaded Sampot Phamuong, and custom jewel belt fastenings.",
                    "description_km": "ឈុតកូនក្រមុំប្រពៃណីខ្មែរដ៏ឧត្តុង្គឧត្តម រួមមានស្បៃប៉ាក់ផ្កាភ្ញី អាវប៉ាក់សូត្រមាស និងសំពត់ផាមួងចងក្បិនពណ៌លឿងទុំភ្លឺចិញ្ចាច។",
                    "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
                    "fabric_type": "Golden Thread Organza & Heavy Brocade Silk",
                    "price_usd": 380.0,
                    "ease_rules": {
                        "chest_bust_circumference": 25.0,
                        "under_bust_circumference": 15.0,
                        "waist_circumference": 15.0,
                        "high_hip_circumference": 25.0,
                        "low_hip_circumference": 30.0,
                        "shoulder_width": 5.0,
                        "armhole_depth": 10.0,
                        "waist_to_ankle_outseam": 10.0
                    },
                    "required_measurements": [
                        "neck_circumference",
                        "shoulder_width",
                        "chest_bust_circumference",
                        "under_bust_circumference",
                        "waist_circumference",
                        "high_hip_circumference",
                        "low_hip_circumference",
                        "bicep_circumference",
                        "armhole_depth",
                        "sleeve_length",
                        "back_neck_to_waist",
                        "waist_to_ankle_outseam"
                    ]
                },
                {
                    "name_en": "Bespoke Silk Evening Dress",
                    "name_km": "រ៉ូបរាត្រីសមោសរសូត្រខ្មែរទំនើប",
                    "slug": "bespoke-silk-evening-dress",
                    "category": "dress",
                    "description_en": "Modern contemporary gala gown integrating traditional Takeo province woven silk. Features an asymmetrical off-the-shoulder silhouette with structured boning and sweeping slit.",
                    "description_km": "រ៉ូបរាត្រីសមោសរសូត្រខ្មែរតាកែវ បែបទំនើបស៊ីវិល័យ រចនាម៉ូដស្មាម្ខាង និងមានឆែកជើងយ៉ាងស្រស់សង្ហារ។",
                    "image_url": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
                    "fabric_type": "Takeo Two-Ply Hand-Dyed Silk",
                    "price_usd": 210.0,
                    "ease_rules": {
                        "chest_bust_circumference": 20.0,
                        "under_bust_circumference": 10.0,
                        "waist_circumference": 10.0,
                        "high_hip_circumference": 20.0,
                        "low_hip_circumference": 25.0,
                        "waist_to_ankle_outseam": 15.0
                    },
                    "required_measurements": [
                        "shoulder_width",
                        "chest_bust_circumference",
                        "under_bust_circumference",
                        "waist_circumference",
                        "high_hip_circumference",
                        "low_hip_circumference",
                        "back_neck_to_waist",
                        "waist_to_ankle_outseam"
                    ]
                },
                {
                    "name_en": "Men's Mandarin Collar Silk Jacket (Av Koko)",
                    "name_km": "អាវកក កាត់សូត្របុរស (អាវកុក)",
                    "slug": "mens-mandarin-collar-silk-jacket",
                    "category": "jacket",
                    "description_en": "Distinguished Cambodian gentlemen's ceremonial jacket. Structured canvas chest interlining, upright Mandarin collar, tailored shoulder roping, and bespoke woven silk covered buttons.",
                    "description_km": "អាវកុកកាត់សូត្រប្រណិតសម្រាប់សុភាពបុរស សម្រាប់ពិធីបុណ្យជាតិ និងមង្គលការ។ កកម្ពស់រឹងមាំ ស្មាមុតស្រួច និងឡេវសូត្ររុំដោយដៃ។",
                    "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
                    "fabric_type": "Structured Heavy Silk Brocade",
                    "price_usd": 175.0,
                    "ease_rules": {
                        "neck_circumference": 15.0,         # +1.5 cm
                        "shoulder_width": 10.0,             # +1.0 cm
                        "chest_bust_circumference": 40.0,   # +4.0 cm ease for suit jacket over shirt
                        "waist_circumference": 30.0,        # +3.0 cm
                        "bicep_circumference": 20.0,        # +2.0 cm
                        "armhole_depth": 15.0,              # +1.5 cm
                        "sleeve_length": 10.0,              # +1.0 cm
                        "back_neck_to_waist": 5.0
                    },
                    "required_measurements": [
                        "neck_circumference",
                        "shoulder_width",
                        "chest_bust_circumference",
                        "waist_circumference",
                        "bicep_circumference",
                        "wrist_circumference",
                        "armhole_depth",
                        "sleeve_length",
                        "back_neck_to_waist"
                    ]
                },
                {
                    "name_en": "Custom Tailored Trousers / Formal Slacks",
                    "name_km": "ខោសាច់ក្រណាត់កាត់ប្រណិត (ខោសម្លៀកបំពាក់ផ្លូវការ)",
                    "slug": "custom-tailored-trousers",
                    "category": "pants",
                    "description_en": "Crisply pressed formal dress trousers. Cut with high-rise waistband, French side pockets, curtained waistband, and customizable tapered or straight leg break.",
                    "description_km": "ខោសាច់ក្រណាត់បុរសកាត់តាមទំហំចង្កេះនិងប្រវែងជើងជាក់ស្តែង រឹបរាងស្អាត មិនធ្លាក់កែង និងស្រួលអង្គុយ។",
                    "image_url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
                    "fabric_type": "Silk-Wool Blend / High-Twist Tropical Worsted",
                    "price_usd": 85.0,
                    "ease_rules": {
                        "waist_circumference": 10.0,        # +1.0 cm
                        "high_hip_circumference": 20.0,     # +2.0 cm
                        "low_hip_circumference": 30.0,      # +3.0 cm
                        "waist_to_ankle_outseam": 10.0,     # +1.0 cm
                        "inseam": 5.0                       # +0.5 cm
                    },
                    "required_measurements": [
                        "waist_circumference",
                        "high_hip_circumference",
                        "low_hip_circumference",
                        "waist_to_ankle_outseam",
                        "inseam"
                    ]
                }
            ]

            for g_data in garments_data:
                g = Garment(**g_data)
                db.add(g)
            db.commit()
            print("✅ 6 Traditional Garments seeded successfully.")

        # Check if sample orders already exist
        existing_orders = db.query(Order).count()
        if existing_orders == 0:
            print("📋 Seeding 2 Sample Completed Customer Orders for Admin Dashboard...")
            
            # Garment 1: Av Pak Blouse
            g_avpak = db.query(Garment).filter(Garment.slug == "av-pak-blouse").first()
            # Garment 5: Men's Mandarin Collar Jacket
            g_koko = db.query(Garment).filter(Garment.slug == "mens-mandarin-collar-silk-jacket").first()

            # Generate synthetic 3D scan for Order 1 (Female, 1630 mm, 52 kg)
            scan1 = anthropometry_engine.generate_demo_scan(height_mm=1630.0, weight_kg=52.0, gender="female")
            # Generate synthetic 3D scan for Order 2 (Male, 1750 mm, 70 kg)
            scan2 = anthropometry_engine.generate_demo_scan(height_mm=1750.0, weight_kg=70.0, gender="male")

            # Order 1: Sreypov Meas
            order1 = Order(
                ticket_number="AF-2026-0108",
                customer_name="Sreypov Meas (ស្រីពៅ មាស)",
                customer_phone="+855 12 345 678",
                customer_telegram="@sreypov_meas",
                customer_email="sreypov.meas@gmail.com",
                customer_notes="For upcoming Khmer New Year blessing ceremony. Needs extra gold lace trim along collar.",
                height_mm=1630.0,
                weight_kg=52.0,
                gender="female",
                garment_id=g_avpak.id,
                status="IN_CUTTING",
                mesh_data=scan1.mesh_data.model_dump(),
                created_at=datetime.utcnow() - timedelta(hours=3, minutes=20)
            )
            db.add(order1)
            db.flush()

            # Apply Av Pak ease rules to Order 1 measurements
            meas_payload1 = apply_garment_ease(
                [m.model_dump() for m in scan1.measurements],
                g_avpak.ease_rules
            )
            for m in meas_payload1:
                db_m = Measurement(
                    order_id=order1.id,
                    measurement_key=m["measurement_key"],
                    name_en=m["name_en"],
                    name_km=m["name_km"],
                    skin_value_mm=m["skin_value_mm"],
                    skin_value_cm=m["skin_value_cm"],
                    skin_value_in=m["skin_value_in"],
                    ease_mm=m["ease_mm"],
                    ease_cm=m["ease_cm"],
                    pattern_cut_cm=m["pattern_cut_cm"],
                    pattern_cut_in=m["pattern_cut_in"],
                    notes=m["notes"]
                )
                db.add(db_m)

            # Order 2: Vanna Sok
            order2 = Order(
                ticket_number="AF-2026-0219",
                customer_name="Vanna Sok (វណ្ណា សុខ)",
                customer_phone="+855 17 890 123",
                customer_telegram="@vanna_koko",
                customer_email="vanna.sok@outlook.com",
                customer_notes="Wedding guest outfit. Royal deep navy silk with engraved bronze buttons.",
                height_mm=1750.0,
                weight_kg=70.0,
                gender="male",
                garment_id=g_koko.id,
                status="PENDING_REVIEW",
                mesh_data=scan2.mesh_data.model_dump(),
                created_at=datetime.utcnow() - timedelta(hours=1, minutes=15)
            )
            db.add(order2)
            db.flush()

            meas_payload2 = apply_garment_ease(
                [m.model_dump() for m in scan2.measurements],
                g_koko.ease_rules
            )
            for m in meas_payload2:
                db_m = Measurement(
                    order_id=order2.id,
                    measurement_key=m["measurement_key"],
                    name_en=m["name_en"],
                    name_km=m["name_km"],
                    skin_value_mm=m["skin_value_mm"],
                    skin_value_cm=m["skin_value_cm"],
                    skin_value_in=m["skin_value_in"],
                    ease_mm=m["ease_mm"],
                    ease_cm=m["ease_cm"],
                    pattern_cut_cm=m["pattern_cut_cm"],
                    pattern_cut_in=m["pattern_cut_in"],
                    notes=m["notes"]
                )
                db.add(db_m)

            db.commit()
            print("✅ 2 Sample Customer Orders (with 3D meshes & 14 measurements) seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
