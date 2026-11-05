export type Language = 'en' | 'km';

export interface Garment {
  id: number;
  name_en: string;
  name_km: string;
  slug: string;
  category: string;
  description_en: string;
  description_km: string;
  image_url: string;
  fabric_type: string;
  price_usd: number;
  ease_rules: Record<string, number>;
  required_measurements: string[];
}

export interface MeasurementItem {
  key: string;
  name_en: string;
  name_km: string;
  skin_mm: number;
  skin_cm: number;
  skin_in: number;
  confidence: number;
}

export interface MeshRing {
  name: string;
  name_km: string;
  y_norm: number;
  y_mm: number;
  radius_a_mm: number;
  radius_b_mm: number;
  circumference_mm: number;
  circumference_cm: number;
  slice_index: number;
}

export interface MeshSlice {
  y_norm: number;
  y_mm: number;
  radius_a_mm: number;
  radius_b_mm: number;
}

export interface MeshData {
  height_mm: number;
  gender: string;
  slices: MeshSlice[];
  rings: MeshRing[];
  vertices: [number, number, number][];
  faces: [number, number, number][];
}

export interface ScanResponse {
  success: boolean;
  engine_used: string;
  calibration: {
    mm_per_pixel_front: number;
    mm_per_pixel_side: number;
    card_calibrated: boolean;
    front_height_px: number;
    side_height_px: number;
    demo_mode?: boolean;
  };
  measurements: MeasurementItem[];
  mesh_data: MeshData;
  privacy_verified: boolean;
  photos_purged: boolean;
  message: string;
}

export interface OrderMeasurement {
  id: number;
  order_id: number;
  measurement_key: string;
  name_en: string;
  name_km: string;
  skin_value_mm: number;
  skin_value_cm: number;
  skin_value_in: number;
  ease_mm: number;
  ease_cm: number;
  pattern_cut_cm: number;
  pattern_cut_in: number;
  notes?: string;
}

export interface Order {
  id: number;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  customer_telegram?: string;
  customer_email?: string;
  customer_notes?: string;
  height_mm: number;
  weight_kg?: number;
  gender: string;
  garment_id: number;
  status: 'PENDING_REVIEW' | 'IN_CUTTING' | 'SEWING' | 'COMPLETED' | 'DELIVERED';
  mesh_data?: MeshData;
  created_at: string;
  updated_at: string;
  garment?: Garment;
  measurements: OrderMeasurement[];
}
