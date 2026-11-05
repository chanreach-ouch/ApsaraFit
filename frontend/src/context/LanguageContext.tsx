'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Navigation
    'brand.name': "Mom's Traditional Tailor Shop",
    'brand.subtitle': "AI 3D Bespoke Fitting Studio",
    'brand.tagline': "Master Khmer Silk Craftsmanship Meets Precision 3D Computer Vision",
    'nav.storefront': "Garments",
    'nav.measure': "AI 3D Scan",
    'nav.admin': "Tailor Dashboard",
    'nav.contact': "Direct Atelier: +855 12 345 678",

    // Hero
    'hero.badge': "Bespoke Khmer Haute Couture",
    'hero.title_pre': "Traditional Elegance,",
    'hero.title_highlight': "Sculpted in 3D.",
    'hero.description': "No tape measure needed. Get precision-tailored traditional silk garments from anywhere in the world using your smartphone or laptop camera. Millimeter accuracy guaranteed.",
    'hero.cta_measure': "Start 3D Fitting Scan",
    'hero.cta_catalog': "Explore Heritage Garments",
    'hero.stat1_val': "14 Slices",
    'hero.stat1_lbl': "Precision Measurements",
    'hero.stat2_val': "±1.5 mm",
    'hero.stat2_lbl': "Computer Vision Accuracy",
    'hero.stat3_val': "100% Private",
    'hero.stat3_lbl': "Photos Purged Immediately",

    // How It Works
    'how.title': "3 Steps to Master-Tailored Traditional Silk",
    'how.step1_title': "1. Height & Body Profile",
    'how.step1_desc': "Enter your stature in centimeters and select your desired traditional silhouette for custom ease calculation.",
    'how.step2_title': "2. Guided Camera Scan",
    'how.step2_desc': "Our AI pose gatekeeper guides you into a standard A-Pose and automatically triggers high-resolution front and side captures.",
    'how.step3_title': "3. Tailor Cutting Card",
    'how.step3_desc': "Mom receives your millimeter-precise 3D mannequin and cutting pattern ticket with fabric ease applied.",

    // Garments Catalog
    'catalog.title': "Traditional Garments & Bespoke Ensembles",
    'catalog.subtitle': "Hand-selected Cambodian raw silks, brocades, and ceremonial laces tailored strictly to your individual contours.",
    'garment.fabric': "Fabric",
    'garment.price': "Bespoke Cut & Sew",
    'garment.ease_rules': "Tailor Ease Rules",
    'garment.select': "Select for AI Fitting",
    'garment.selected': "Selected for Fitting",

    // Measurement Terms
    'meas.neck_circumference': "Neck Circumference",
    'meas.shoulder_width': "Shoulder Width",
    'meas.chest_bust_circumference': "Bust/Chest Circumference",
    'meas.under_bust_circumference': "Under-bust Circumference",
    'meas.waist_circumference': "Waist Circumference",
    'meas.high_hip_circumference': "High Hip Circumference",
    'meas.low_hip_circumference': "Low Hip Circumference",
    'meas.bicep_circumference': "Bicep Circumference",
    'meas.wrist_circumference': "Wrist Circumference",
    'meas.armhole_depth': "Armhole Depth",
    'meas.sleeve_length': "Sleeve Length",
    'meas.back_neck_to_waist': "Back Neck to Waist",
    'meas.waist_to_ankle_outseam': "Waist to Ankle Outseam",
    'meas.inseam': "Inseam Length",

    // Camera Gatekeeper Wizard
    'wizard.step1': "1. Calibration",
    'wizard.step2': "2. Camera Scan",
    'wizard.step3': "3. 3D Body Model",
    'wizard.height_label': "Your Exact Height (cm)",
    'wizard.weight_label': "Weight (kg, optional)",
    'wizard.gender_label': "Body Profile / Silhouette",
    'wizard.female': "Feminine Contour",
    'wizard.male': "Masculine Contour",
    'wizard.card_toggle': "Use Bank/ID Card for Calibration (85.6 mm)",
    'wizard.card_desc': "Holding a standard card flat on your chest enables sub-millimeter scale verification.",
    'wizard.btn_continue': "Proceed to Camera Guide",
    'wizard.gatekeeper_title': "Real-Time AI Posture Gatekeeper",
    'wizard.front_prompt': "Step 1/2: Front View in A-Pose",
    'wizard.side_prompt': "Step 2/2: Side View (Turn 90°)",
    'wizard.check_body': "Full Body in Frame (Head to Heels)",
    'wizard.check_pitch': "Camera Upright & Level",
    'wizard.check_posture': "Posture Locked (Arms 35°-50° in A-Pose)",
    'wizard.auto_shutter': "Hold still! Auto-capturing in",
    'wizard.btn_demo': "Run 1-Click Demo Scan (Instant Test)",
    'wizard.btn_upload': "Or Upload Front & Side Photos",
    'wizard.analyzing': "Reconstructing 3D Mannequin & Slicing Contours...",
    'wizard.privacy_badge': "Privacy Verified: Raw Photos Deleted",

    // Dashboard & Cutting Ticket
    'admin.title': "Mom's Tailor Atelier Dashboard",
    'admin.subtitle': "Incoming Bespoke Orders & Digital Cutting Pattern Cards",
    'admin.orders_queue': "Customer Orders Queue",
    'admin.cutting_ticket': "Dual-Column Tailor Cutting Ticket",
    'admin.print_ticket': "Print Tailor Cutting Ticket",
    'admin.col_meas': "Measurement (Khmer / EN)",
    'admin.col_skin': "Skin Body Size",
    'admin.col_ease': "Fabric Ease Rule",
    'admin.col_cut': "Final Pattern Cut",
    'admin.customer_info': "Customer Contact & Atelier Notes",
    'admin.status_pending': "Pending Review",
    'admin.status_cutting': "In Cutting Room",
    'admin.status_sewing': "Sewing in Progress",
    'admin.status_completed': "Completed & Ready",
    'admin.interactive_mannequin': "3D Client Mannequin Inspector",
    'admin.click_hint': "Click any measurement row to illuminate its ring on the 3D mannequin.",
  },
  km: {
    // Brand & Navigation
    'brand.name': "ហាងកាត់ដេរបុរាណម៉ាក់",
    'brand.subtitle': "ស្ទូឌីយោវាស់កាត់ 3D AI បែបប្រណិត",
    'brand.tagline': "សិល្បៈកាត់ដេរសូត្រខ្មែរប្រពៃណី រួមបញ្ចូលបច្ចេកវិទ្យាកុំព្យូទ័រ 3D ដ៏ជាក់លាក់",
    'nav.storefront': "ម៉ូដសម្លៀកបំពាក់",
    'nav.measure': "វាស់រាង 3D AI",
    'nav.admin': "ផ្ទាំងគ្រប់គ្រងជាងកាត់",
    'nav.contact': "ទូរស័ព្ទជាងផ្ទាល់: +855 12 345 678",

    // Hero
    'hero.badge': "សម្លៀកបំពាក់សូត្របុរាណខ្មែរកាត់តាមរាង",
    'hero.title_pre': "ភាពស្រស់ស្អាតប្រពៃណីខ្មែរ,",
    'hero.title_highlight': "វាស់កាត់ដោយ 3D AI។",
    'hero.description': "មិនចាំបាច់មានម៉ែត្រវាស់ផ្ទាល់ខ្លួនទេ។ អ្នកអាចកាត់សម្លៀកបំពាក់សូត្របុរាណពីគ្រប់ទីកន្លែងលើពិភពលោក ដោយប្រើតែកាមេរ៉ាទូរស័ព្ទដៃ ឬកុំព្យូទ័រ។ ភាពជាក់លាក់កម្រិតមីលីម៉ែត្រ។",
    'hero.cta_measure': "ចាប់ផ្តើមវាស់រាង 3D ឥឡូវនេះ",
    'hero.cta_catalog': "ទស្សនាម៉ូដសម្លៀកបំពាក់ប្រពៃណី",
    'hero.stat1_val': "១៤ ចំណុច",
    'hero.stat1_lbl': "រង្វាស់កាត់ដេរលម្អិត",
    'hero.stat2_val': "±១.៥ ម.ម",
    'hero.stat2_lbl': "កម្រិតជាក់លាក់ខ្ពស់",
    'hero.stat3_val': "សុវត្ថិភាព ១០០%",
    'hero.stat3_lbl': "លុបរូបភាពដើមចោលភ្លាមៗ",

    // How It Works
    'how.title': "៣ ជំហានងាយៗដើម្បីទទួលបានសម្លៀកបំពាក់សូត្រកាត់យ៉ាងសមសួន",
    'how.step1_title': "១. បញ្ចូលកម្ពស់ & រូបរាង",
    'how.step1_desc': "បញ្ចូលកម្ពស់គិតជាសង់ទីម៉ែត្រ និងជ្រើសរើសម៉ូដសម្លៀកបំពាក់ប្រពៃណីដែលអ្នកចង់បាន។",
    'how.step2_title': "២. ឈរតាមការណែនាំរបស់កាមេរ៉ា",
    'how.step2_desc': "ប្រព័ន្ធ AI នឹងណែនាំអ្នកឱ្យឈររាងអក្សរ A (A-Pose) និងថតរូបខាងមុខនិងចំហៀងដោយស្វ័យប្រវត្តិ។",
    'how.step3_title': "៣. សន្លឹកកាត់ដេរផ្ញើទៅជាង",
    'how.step3_desc': "ម៉ាក់នឹងទទួលបានតុក្កតា 3D និងសន្លឹករង្វាស់កាត់ដេរដែលមានគិតបញ្ចូលកម្រិតធូរ (Ease) រួចជាស្រេច។",

    // Garments Catalog
    'catalog.title': "កាតាឡុកសម្លៀកបំពាក់ប្រពៃណីខ្មែរ",
    'catalog.subtitle': "សូត្រខ្មែរធម្មជាតិ ហូល ផាមួង អាវប៉ាក់ និងឈុតមង្គលការកាត់ដេរយ៉ាងផ្ចិតផ្ចង់បំផុត។",
    'garment.fabric': "ប្រភេទក្រណាត់",
    'garment.price': "តម្លៃកាត់ & សាច់ក្រណាត់",
    'garment.ease_rules': "កម្រិតធូរនៃសាច់ក្រណាត់ (Ease)",
    'garment.select': "ជ្រើសរើសដើម្បីវាស់កាត់",
    'garment.selected': "បានជ្រើសរើសរួច",

    // Measurement Terms
    'meas.neck_circumference': "រង្វង់ក",
    'meas.shoulder_width': "ទទឹងស្មា",
    'meas.chest_bust_circumference': "រង្វង់ដើមទ្រូង",
    'meas.under_bust_circumference': "រង្វង់ក្រោមទ្រូង",
    'meas.waist_circumference': "រង្វង់ចង្កេះ",
    'meas.high_hip_circumference': "រង្វង់ត្រគាកលើ",
    'meas.low_hip_circumference': "រង្វង់ត្រគាកក្រោម",
    'meas.bicep_circumference': "រង្វង់ដើមដៃ",
    'meas.wrist_circumference': "រង្វង់កដៃ",
    'meas.armhole_depth': "ជម្រៅក្លៀក",
    'meas.sleeve_length': "ប្រវែងដៃអាវ",
    'meas.back_neck_to_waist': "ប្រវែងខ្នងដល់ចង្កេះ",
    'meas.waist_to_ankle_outseam': "ប្រវែងជើងក្រៅ",
    'meas.inseam': "ប្រវែងជើងក្នុង",

    // Camera Gatekeeper Wizard
    'wizard.step1': "១. កំណត់រង្វាស់គោល",
    'wizard.step2': "២. ស្កេនកាមេរ៉ា",
    'wizard.step3': "៣. គំរូ 3D & រង្វាស់",
    'wizard.height_label': "កម្ពស់ពិតប្រាកដរបស់អ្នក (ស.ម)",
    'wizard.weight_label': "ទម្ងន់ (គ.ក្រ, មិនបង្ខំ)",
    'wizard.gender_label': "ទម្រង់រូបរាង",
    'wizard.female': "រាងនារី (ស្រី)",
    'wizard.male': "រាងបុរស (ប្រុស)",
    'wizard.card_toggle': "ប្រើកាតធនាគារ/អត្តសញ្ញាណប័ណ្ណជាគោល (៨៥.៦ ម.ម)",
    'wizard.card_desc': "ការកាន់កាតនៅដើមទ្រូង ជួយឱ្យកុំព្យូទ័រគណនាទំហំបានកាន់តែជាក់លាក់កម្រិតមីលីម៉ែត្រ។",
    'wizard.btn_continue': "បន្តទៅបើកកាមេរ៉ា",
    'wizard.gatekeeper_title': "ប្រព័ន្ធ AI ពិនិត្យជំហរឈរផ្ទាល់",
    'wizard.front_prompt': "ជំហាន ១/២: ថតផ្ទៃមុខត្រង់ (A-Pose)",
    'wizard.side_prompt': "ជំហាន ២/២: ថតចំហៀង (បត់ ៩០ ដឺក្រេ)",
    'wizard.check_body': "ឃើញរាងកាយទាំងមូល (ពីក្បាលដល់កែងជើង)",
    'wizard.check_pitch': "កាមេរ៉ាបញ្ឈរត្រង់ល្អ",
    'wizard.check_posture': "ជំហរត្រឹមត្រូវ (ដៃបែក ៣៥°-៥០° រាងអក្សរ A)",
    'wizard.auto_shutter': "សូមឈរឱ្យស្ងៀម! កំពុងថតស្វ័យប្រវត្តិក្នងពេល",
    'wizard.btn_demo': "សាកល្បងស្កេនគំរូភ្លាមៗ (១ ចុច)",
    'wizard.btn_upload': "ឬ បញ្ចូលរូបថតខាងមុខ & ចំហៀង",
    'wizard.analyzing': "កំពុងបង្កើតគំរូរាង 3D និងវាស់ទំហំ...",
    'wizard.privacy_badge': "សុវត្ថិភាពខ្ពស់: រូបថតត្រូវបានលុបចោលភ្លាមៗ",

    // Dashboard & Cutting Ticket
    'admin.title': "ផ្ទាំងគ្រប់គ្រងជាងកាត់ដេរម៉ាក់",
    'admin.subtitle': "បញ្ជីការកុម្ម៉ង់កាត់តាមអនឡាញ & សន្លឹកកាត់ក្រណាត់ឌីជីថល",
    'admin.orders_queue': "បញ្ជីការកុម្ម៉ង់របស់អតិថិជន",
    'admin.cutting_ticket': "សន្លឹកកាត់ដេរពីរជួរ (ខ្មែរ / អង់គ្លេស)",
    'admin.print_ticket': "បោះពុម្ពសន្លឹកកាត់ក្រណាត់ (Print)",
    'admin.col_meas': "ឈ្មោះរង្វាស់ (ខ្មែរ / EN)",
    'admin.col_skin': "ទំហំសាច់ជាក់ស្តែង",
    'admin.col_ease': "កម្រិតបន្ថែមធូរ (Ease)",
    'admin.col_cut': "ទំហំកាត់ក្រណាត់ចុងក្រោយ",
    'admin.customer_info': "ព័ត៌មានអតិថិជន & កំណត់ចំណាំ",
    'admin.status_pending': "រង់ចាំពិនិត្យ",
    'admin.status_cutting': "កំពុងកាត់ក្រណាត់",
    'admin.status_sewing': "កំពុងដេរ",
    'admin.status_completed': "ដេររួចរាល់",
    'admin.interactive_mannequin': "តុក្កតា 3D ពិនិត្យរាងអតិថិជន",
    'admin.click_hint': "ចុចលើជួររង្វាស់ណាមួយ ដើម្បីបំភ្លឺរង្វង់នោះនៅលើតុក្កតា 3D។",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('km'); // Default to Khmer

  useEffect(() => {
    const saved = localStorage.getItem('apsarafit_lang') as Language;
    if (saved && (saved === 'en' || saved === 'km')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('apsarafit_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
