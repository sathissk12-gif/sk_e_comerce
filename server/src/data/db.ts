import * as fs from 'fs';
import * as path from 'path';

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  capacity?: string;
  colors: string[];
  imageUrl?: string;
  mrp: number;
  offerPrice: number;
  discountPct: number;
  casePackQty?: number;
  packingType?: string;
  stockQty: number;
  rackLocation: string; // Godown inventory bin/rack
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: 'casseroles' | 'combos' | 'containers' | 'household' | 'bottles' | 'tiffins' | 'coolers' | 'organizers' | string;
  description: string;
  badge: string;
  imageUrl: string;
  isCombo: boolean;
  comboIncludes?: string[];
  variants: ProductVariant[];
}

export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g., 10 for 10%, 500 for ₹500
  minOrder: number;
  expiresAt: string;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'APPROVED_TO_GODOWN'
  | 'PACKED_READY_FOR_DISPATCH'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  color: string;
  capacity?: string;
  quantity: number;
  mrp: number;
  offerPrice: number;
  totalPrice: number;
  imageUrl: string;
  rackLocation: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotalMrp: number;
  savingsTotal: number;
  couponCode?: string;
  couponDiscount: number;
  finalPayable: number;
  paymentMode: 'RAZORPAY' | 'COD' | 'TEST_PAY';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note: string;
  }>;
  godownDetails?: {
    packedBy: string;
    packedAt: string;
    rackLocations: string[];
  };
  dispatchDetails?: {
    courierPartner: string;
    trackingNumber: string;
    dispatchedAt: string;
    expectedDelivery: string;
    trackingUrl?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
  createdAt: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-master-casserole",
    "slug": "master-insulated-casserole",
    "name": "Master Insulated Casserole",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Double-walled insulated casserole with stainless steel inner liner, elegant ribbed body and rich gold-finish handles.",
    "badge": "PREMIUM STAINLESS INNER",
    "imageUrl": "/products/cat_master_casserole.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-mst-1500",
        "sku": "ASIAN-MST-1500",
        "name": "1500 ml",
        "capacity": "1500ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach"
        ],
        "mrp": 664,
        "offerPrice": 664,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A1"
      },
      {
        "id": "var-mst-2500",
        "sku": "ASIAN-MST-2500",
        "name": "2500 ml",
        "capacity": "2500ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach"
        ],
        "mrp": 1059,
        "offerPrice": 1059,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A1"
      },
      {
        "id": "var-mst-3500",
        "sku": "ASIAN-MST-3500",
        "name": "3500 ml",
        "capacity": "3500ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach"
        ],
        "mrp": 1221,
        "offerPrice": 1221,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A1"
      }
    ]
  },
  {
    "id": "prod-fancy-casserole",
    "slug": "fancy-insulated-casserole",
    "name": "Fancy Insulated Casserole",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Aesthetic fluted exterior with stainless steel inner pot and gold accent lid. Perfect for dining table elegance.",
    "badge": "BESTSELLER CASSEROLE",
    "imageUrl": "/products/cat_fancy_casserole.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-fnc-1500",
        "sku": "ASIAN-FNC-1500",
        "name": "1500 ml",
        "capacity": "1500ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach",
          "Mint Green"
        ],
        "mrp": 506,
        "offerPrice": 506,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-A2"
      },
      {
        "id": "var-fnc-2500",
        "sku": "ASIAN-FNC-2500",
        "name": "2500 ml",
        "capacity": "2500ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach",
          "Mint Green"
        ],
        "mrp": 759,
        "offerPrice": 759,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-A2"
      },
      {
        "id": "var-fnc-3500",
        "sku": "ASIAN-FNC-3500",
        "name": "3500 ml",
        "capacity": "3500ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach",
          "Mint Green"
        ],
        "mrp": 893,
        "offerPrice": 893,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A2"
      },
      {
        "id": "var-fnc-5000",
        "sku": "ASIAN-FNC-5000",
        "name": "5000 ml",
        "capacity": "5000ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach",
          "Mint Green"
        ],
        "mrp": 1666,
        "offerPrice": 1666,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 30,
        "rackLocation": "RACK-A2"
      },
      {
        "id": "var-fnc-set1",
        "sku": "ASIAN-FNC-SET1",
        "name": "Set of 3 (600+1000+1500)",
        "capacity": "600ml + 1000ml + 1500ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach"
        ],
        "mrp": 1050,
        "offerPrice": 1050,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-A2"
      },
      {
        "id": "var-fnc-set2",
        "sku": "ASIAN-FNC-SET2",
        "name": "Set of 3 (1500+2500+3500)",
        "capacity": "1500ml + 2500ml + 3500ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach"
        ],
        "mrp": 2124,
        "offerPrice": 2124,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 35,
        "rackLocation": "RACK-A2"
      },
      {
        "id": "var-fnc-set3",
        "sku": "ASIAN-FNC-SET3",
        "name": "Set of 3 (2500+3500+5000)",
        "capacity": "2500ml + 3500ml + 5000ml",
        "colors": [
          "Royal Blue",
          "Ivory Cream",
          "Rose Peach"
        ],
        "mrp": 3565,
        "offerPrice": 3565,
        "discountPct": 0,
        "casePackQty": 4,
        "packingType": "Box",
        "stockQty": 25,
        "rackLocation": "RACK-A2"
      }
    ]
  },
  {
    "id": "prod-golden-crest",
    "slug": "golden-crest-insulated-casserole",
    "name": "Golden Crest Insulated Casserole",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Double-wall insulated casserole with royal gold crown lid ornamentation and stainless steel inner pot.",
    "badge": "ROYAL GOLD COLLECTION",
    "imageUrl": "/products/cat_golden_crest.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-gc-1600",
        "sku": "ASIAN-GC-1600",
        "name": "1600 ml",
        "capacity": "1600ml",
        "colors": [
          "Cream Ivory Gold",
          "White Silver Gold"
        ],
        "mrp": 791,
        "offerPrice": 791,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A3"
      },
      {
        "id": "var-gc-2300",
        "sku": "ASIAN-GC-2300",
        "name": "2300 ml",
        "capacity": "2300ml",
        "colors": [
          "Cream Ivory Gold",
          "White Silver Gold"
        ],
        "mrp": 1014,
        "offerPrice": 1014,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 45,
        "rackLocation": "RACK-A3"
      },
      {
        "id": "var-gc-3500",
        "sku": "ASIAN-GC-3500",
        "name": "3500 ml",
        "capacity": "3500ml",
        "colors": [
          "Cream Ivory Gold",
          "White Silver Gold"
        ],
        "mrp": 1323,
        "offerPrice": 1323,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-A3"
      },
      {
        "id": "var-gc-set3",
        "sku": "ASIAN-GC-SET3",
        "name": "Set/3 NOBLE (1000+1300+2300)",
        "capacity": "1000ml + 1300ml + 2300ml",
        "colors": [
          "Cream Ivory Gold"
        ],
        "mrp": 2381,
        "offerPrice": 2381,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 30,
        "rackLocation": "RACK-A3"
      }
    ]
  },
  {
    "id": "prod-globus-deluxe",
    "slug": "globus-casserole-deluxe",
    "name": "Globus Casserole Deluxe",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Premium round casserole with stainless steel inner in the lid and container for maximum heat retention.",
    "badge": "S.S. INNER IN LID",
    "imageUrl": "/products/cat_globus_casserole.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-glb-1600",
        "sku": "ASIAN-GLB-1600",
        "name": "1600 ml",
        "capacity": "1600ml",
        "colors": [
          "Royal Blue",
          "Sandalwood Cream",
          "Mocha Brown"
        ],
        "mrp": 863,
        "offerPrice": 863,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A4"
      },
      {
        "id": "var-glb-2500",
        "sku": "ASIAN-GLB-2500",
        "name": "2500 ml",
        "capacity": "2500ml",
        "colors": [
          "Royal Blue",
          "Sandalwood Cream",
          "Mocha Brown"
        ],
        "mrp": 1220,
        "offerPrice": 1220,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 45,
        "rackLocation": "RACK-A4"
      },
      {
        "id": "var-glb-3500",
        "sku": "ASIAN-GLB-3500",
        "name": "3500 ml",
        "capacity": "3500ml",
        "colors": [
          "Royal Blue",
          "Sandalwood Cream",
          "Mocha Brown"
        ],
        "mrp": 1369,
        "offerPrice": 1369,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-A4"
      }
    ]
  },
  {
    "id": "prod-dignity-casserole",
    "slug": "dignity-casserole-non-deluxe",
    "name": "Dignity Casserole",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Double wall insulated casserole with stainless steel inner in lid and pot. Gold leaf crest embellishment on lid.",
    "badge": "DOUBLE WALL INSULATED",
    "imageUrl": "/products/cat_dignity_casserole.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-dgn-1600",
        "sku": "ASIAN-DGN-1600",
        "name": "1600 ml",
        "capacity": "1600ml",
        "colors": [
          "Gold Cream",
          "Burgundy Wine",
          "Mocha Copper"
        ],
        "mrp": 583,
        "offerPrice": 583,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A5"
      },
      {
        "id": "var-dgn-2500",
        "sku": "ASIAN-DGN-2500",
        "name": "2500 ml",
        "capacity": "2500ml",
        "colors": [
          "Gold Cream",
          "Burgundy Wine",
          "Mocha Copper"
        ],
        "mrp": 888,
        "offerPrice": 888,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 45,
        "rackLocation": "RACK-A5"
      },
      {
        "id": "var-dgn-3500",
        "sku": "ASIAN-DGN-3500",
        "name": "3500 ml",
        "capacity": "3500ml",
        "colors": [
          "Gold Cream",
          "Burgundy Wine",
          "Mocha Copper"
        ],
        "mrp": 1033,
        "offerPrice": 1033,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-A5"
      }
    ]
  },
  {
    "id": "prod-majestic-gold-casserole",
    "slug": "majestic-gold-casserole",
    "name": "Majestic Gold Casserole",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Textured diamond mesh exterior with gleaming gold rim and handles. Keeps rotis, biryani and curries steaming hot.",
    "badge": "FESTIVE GOLD EDITION",
    "imageUrl": "/products/cat_majestic_gold.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-mjg-1500",
        "sku": "ASIAN-MJG-1500",
        "name": "1500 ml",
        "capacity": "1500ml",
        "colors": [
          "Gold Pearl",
          "Peach Copper"
        ],
        "mrp": 675,
        "offerPrice": 675,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A6"
      },
      {
        "id": "var-mjg-2500",
        "sku": "ASIAN-MJG-2500",
        "name": "2500 ml",
        "capacity": "2500ml",
        "colors": [
          "Gold Pearl",
          "Peach Copper"
        ],
        "mrp": 1032,
        "offerPrice": 1032,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 45,
        "rackLocation": "RACK-A6"
      },
      {
        "id": "var-mjg-3500",
        "sku": "ASIAN-MJG-3500",
        "name": "3500 ml",
        "capacity": "3500ml",
        "colors": [
          "Gold Pearl",
          "Peach Copper"
        ],
        "mrp": 1263,
        "offerPrice": 1263,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-A6"
      },
      {
        "id": "var-mjg-set1",
        "sku": "ASIAN-MJG-SET1",
        "name": "Set/3 (600+1000+1500)",
        "capacity": "600ml + 1000ml + 1500ml",
        "colors": [
          "Gold Pearl"
        ],
        "mrp": 1491,
        "offerPrice": 1491,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 30,
        "rackLocation": "RACK-A6"
      },
      {
        "id": "var-mjg-set2",
        "sku": "ASIAN-MJG-SET2",
        "name": "Set/3 (1500+2500+3500)",
        "capacity": "1500ml + 2500ml + 3500ml",
        "colors": [
          "Gold Pearl"
        ],
        "mrp": 2919,
        "offerPrice": 2919,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 25,
        "rackLocation": "RACK-A6"
      },
      {
        "id": "var-mjg-set3",
        "sku": "ASIAN-MJG-SET3",
        "name": "DLX Set/3 (2500+3500+5000)",
        "capacity": "2500ml + 3500ml + 5000ml",
        "colors": [
          "Gold Pearl"
        ],
        "mrp": 4346,
        "offerPrice": 4346,
        "discountPct": 0,
        "casePackQty": 4,
        "packingType": "Box",
        "stockQty": 20,
        "rackLocation": "RACK-A6"
      }
    ]
  },
  {
    "id": "prod-nova-casserole",
    "slug": "nova-jumbo-casserole",
    "name": "Nova Jumbo Catering Casserole",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Extra large catering capacity insulated hot pot with heavy duty twist-lock lid and stainless steel inner pot.",
    "badge": "JUMBO CATERING CAPACITY",
    "imageUrl": "/products/cat_nova_casserole.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-nov-5500",
        "sku": "ASIAN-NOV-5500",
        "name": "5500 ml DLX",
        "capacity": "5.5 Litres",
        "colors": [
          "Maroon Red",
          "Slate Grey",
          "Midnight Blue"
        ],
        "mrp": 1690,
        "offerPrice": 1690,
        "discountPct": 0,
        "casePackQty": 8,
        "packingType": "Box",
        "stockQty": 30,
        "rackLocation": "RACK-A7"
      },
      {
        "id": "var-nov-7500",
        "sku": "ASIAN-NOV-7500",
        "name": "7500 ml DLX",
        "capacity": "7.5 Litres",
        "colors": [
          "Maroon Red",
          "Slate Grey",
          "Midnight Blue"
        ],
        "mrp": 1968,
        "offerPrice": 1968,
        "discountPct": 0,
        "casePackQty": 8,
        "packingType": "Box",
        "stockQty": 25,
        "rackLocation": "RACK-A7"
      },
      {
        "id": "var-nov-12000",
        "sku": "ASIAN-NOV-12000",
        "name": "12000 ml DLX",
        "capacity": "12.0 Litres",
        "colors": [
          "Maroon Red",
          "Slate Grey",
          "Midnight Blue"
        ],
        "mrp": 2883,
        "offerPrice": 2883,
        "discountPct": 0,
        "casePackQty": 4,
        "packingType": "Box",
        "stockQty": 20,
        "rackLocation": "RACK-A7"
      }
    ]
  },
  {
    "id": "prod-diamond-casserole",
    "slug": "diamond-insulated-casserole",
    "name": "Diamond Insulated Casserole",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Geometric multifaceted diamond surface finish with polished inner steel liner.",
    "badge": "MODERN GEOMETRIC",
    "imageUrl": "/products/cat_diamond_casserole.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-dmd-1500",
        "sku": "ASIAN-DMD-1500",
        "name": "1500 ml",
        "capacity": "1500ml",
        "colors": [
          "Sapphire Blue",
          "Charcoal Grey",
          "Ivory Cream"
        ],
        "mrp": 542,
        "offerPrice": 542,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A8"
      },
      {
        "id": "var-dmd-2500",
        "sku": "ASIAN-DMD-2500",
        "name": "2500 ml",
        "capacity": "2500ml",
        "colors": [
          "Sapphire Blue",
          "Charcoal Grey",
          "Ivory Cream"
        ],
        "mrp": 787,
        "offerPrice": 787,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 45,
        "rackLocation": "RACK-A8"
      },
      {
        "id": "var-dmd-3500",
        "sku": "ASIAN-DMD-3500",
        "name": "3500 ml",
        "capacity": "3500ml",
        "colors": [
          "Sapphire Blue",
          "Charcoal Grey",
          "Ivory Cream"
        ],
        "mrp": 967,
        "offerPrice": 967,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-A8"
      },
      {
        "id": "var-dmd-5000",
        "sku": "ASIAN-DMD-5000",
        "name": "5000 ml DLX",
        "capacity": "5000ml",
        "colors": [
          "Sapphire Blue",
          "Charcoal Grey",
          "Ivory Cream"
        ],
        "mrp": 1690,
        "offerPrice": 1690,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 30,
        "rackLocation": "RACK-A8"
      }
    ]
  },
  {
    "id": "prod-carry-pack-hot-pot",
    "slug": "carry-pack-insulated-hot-pot",
    "name": "Carry Pack Insulated Hot Pot",
    "brand": "Asian Plastowares",
    "category": "casseroles",
    "description": "Convenient carry-handle insulated food carrier with stainless steel interior. Ideal for picnics and potlucks.",
    "badge": "EASY CARRY HANDLE",
    "imageUrl": "/products/cat_carry_pack.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-crp-2000",
        "sku": "ASIAN-CRP-2000",
        "name": "2000 ml",
        "capacity": "2000ml",
        "colors": [
          "Olive Green",
          "Cool Blue",
          "Mocha Beige"
        ],
        "mrp": 566,
        "offerPrice": 566,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-A9"
      },
      {
        "id": "var-crp-3000",
        "sku": "ASIAN-CRP-3000",
        "name": "3000 ml",
        "capacity": "3000ml",
        "colors": [
          "Olive Green",
          "Cool Blue",
          "Mocha Beige"
        ],
        "mrp": 863,
        "offerPrice": 863,
        "discountPct": 0,
        "casePackQty": 18,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-A9"
      }
    ]
  },
  {
    "id": "prod-elite-trio-set",
    "slug": "elite-trio-gift-set",
    "name": "Elite Trio Gift Set",
    "brand": "Asian Plastowares",
    "category": "combos",
    "description": "Grand festive combo set including Fancy Casserole 1500ml, Floating Water Jug 7L, and Jewel Flask 750ml.",
    "badge": "FESTIVE GIFT PACK",
    "imageUrl": "/products/cat_elite_trio.png",
    "isCombo": true,
    "comboIncludes": [
      "Fancy Casserole 1500ml",
      "Floating Water Jug 7 Litre",
      "Jewel Flask 750ml"
    ],
    "variants": [
      {
        "id": "var-elt-set",
        "sku": "ASIAN-CMB-ELT",
        "name": "Complete 3-Piece Gift Set",
        "capacity": "1500ml + 7L + 750ml",
        "colors": [
          "Navy Blue & Gold",
          "Maroon Wine",
          "Teal Green"
        ],
        "mrp": 1775,
        "offerPrice": 1775,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 30,
        "rackLocation": "RACK-B1"
      }
    ]
  },
  {
    "id": "prod-jewel-serving-set",
    "slug": "jewel-serving-gift-set",
    "name": "Jewel Flask & Cup Serving Set",
    "brand": "Asian Plastowares",
    "category": "combos",
    "description": "Jewel Vacuum Flask 750ml accompanied by 4 pieces stainless steel Pretty Cups in an exquisite presentation gift box.",
    "badge": "CORPORATE & FESTIVE GIFT",
    "imageUrl": "/products/cat_jewel_serving.png",
    "isCombo": true,
    "comboIncludes": [
      "Jewel Flask 750ml",
      "4x Stainless Steel Pretty Cups"
    ],
    "variants": [
      {
        "id": "var-jwl-set",
        "sku": "ASIAN-CMB-JWL",
        "name": "Jewel Flask 750 + 4 Cups",
        "capacity": "750ml + 4x 180ml",
        "colors": [
          "Rose Blush",
          "Navy Blue",
          "Champagne Gold"
        ],
        "mrp": 1299,
        "offerPrice": 1299,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-B2"
      }
    ]
  },
  {
    "id": "prod-fancy-combo",
    "slug": "fancy-combo-casserole-tiffin",
    "name": "Fancy Combo (Casserole + Tiffin)",
    "brand": "Asian Plastowares",
    "category": "combos",
    "description": "Fancy Insulated Casserole 1500ml paired with Diet Meal Insulated Tiffin (3 Steel Containers).",
    "badge": "VALUE COMBO PACK",
    "imageUrl": "/products/cat_fancy_combo.png",
    "isCombo": true,
    "comboIncludes": [
      "Fancy Casserole 1500ml",
      "Diet Meal 3 Steel Container Tiffin"
    ],
    "variants": [
      {
        "id": "var-fnc-cmb",
        "sku": "ASIAN-CMB-FNC",
        "name": "Casserole 1500 + Diet Tiffin 3",
        "capacity": "1500ml + 3 Containers",
        "colors": [
          "Royal Blue",
          "Rose Peach",
          "Ivory Cream"
        ],
        "mrp": 975,
        "offerPrice": 975,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 45,
        "rackLocation": "RACK-B3"
      }
    ]
  },
  {
    "id": "prod-serve-store-combo",
    "slug": "serve-store-combo",
    "name": "Serve & Store Combo",
    "brand": "Asian Plastowares",
    "category": "combos",
    "description": "Carry Cool Insulated Water Jug 7L paired with Marco Gold Insulated Casserole 1200ml.",
    "badge": "FAMILY PICNIC SPECIAL",
    "imageUrl": "/products/cat_serve_store.png",
    "isCombo": true,
    "comboIncludes": [
      "Carry Cool Water Jug 7L",
      "Marco Gold Casserole 1200ml"
    ],
    "variants": [
      {
        "id": "var-srv-str",
        "sku": "ASIAN-CMB-SRV",
        "name": "Carry Cool 7L + Marco 1200",
        "capacity": "7 Litres + 1200ml",
        "colors": [
          "Burgundy Wine",
          "Emerald Green",
          "Navy Blue"
        ],
        "mrp": 1100,
        "offerPrice": 1100,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 35,
        "rackLocation": "RACK-B4"
      }
    ]
  },
  {
    "id": "prod-aqua-pro-combo",
    "slug": "aqua-pro-combo",
    "name": "Aqua Pro Water Dispenser Combo",
    "brand": "Asian Plastowares",
    "category": "combos",
    "description": "Floating Water Jug 7 Litre dispenser paired with Sterling Insulated Water Jug 750ml.",
    "badge": "HYDRATION PACK",
    "imageUrl": "/products/cat_aqua_pro.png",
    "isCombo": true,
    "comboIncludes": [
      "Floating Water Jug 7L",
      "Sterling Water Jug 750ml"
    ],
    "variants": [
      {
        "id": "var-aqp-cmb",
        "sku": "ASIAN-CMB-AQP",
        "name": "Floating Jug 7L + Sterling 750",
        "capacity": "7 Litres + 750ml",
        "colors": [
          "Sky Cyan",
          "Sage Green",
          "Coffee Brown"
        ],
        "mrp": 1333,
        "offerPrice": 1333,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-B5"
      }
    ]
  },
  {
    "id": "prod-wonder-meal-jr",
    "slug": "wonder-meal-tiffin-jr",
    "name": "Wonder Meal Tiffin Jr.",
    "brand": "Asian Plastowares",
    "category": "tiffins",
    "description": "Insulated round lunch box with stainless steel inner liner and 1 stainless steel sabzi container.",
    "badge": "S.S. INNER & CONTAINER",
    "imageUrl": "/products/cat_wonder_meal_jr.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-wm-jr",
        "sku": "ASIAN-WM-JR",
        "name": "500ml + 200ml Sabzi Container",
        "capacity": "700ml Total",
        "colors": [
          "Pastel Green",
          "Slate Grey",
          "Blush Pink"
        ],
        "mrp": 362,
        "offerPrice": 362,
        "discountPct": 0,
        "casePackQty": 80,
        "packingType": "Box",
        "stockQty": 80,
        "rackLocation": "RACK-C1"
      }
    ]
  },
  {
    "id": "prod-wonder-meal-executive",
    "slug": "wonder-meal-executive-tiffin",
    "name": "Wonder Meal Executive Tiffin",
    "brand": "Asian Plastowares",
    "category": "tiffins",
    "description": "Insulated vertical lunch carrier with 3 leak-proof stainless steel containers (300ml each) and carry handle.",
    "badge": "3 S.S. CONTAINERS",
    "imageUrl": "/products/cat_wonder_meal_exec.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-wm-exec",
        "sku": "ASIAN-WM-EXEC",
        "name": "3 S.S. Containers (3x 300ml)",
        "capacity": "900ml Total",
        "colors": [
          "Peach Rose",
          "Pistachio Green",
          "Steel Blue"
        ],
        "mrp": 625,
        "offerPrice": 625,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-C2"
      }
    ]
  },
  {
    "id": "prod-urban-pack-tiffin",
    "slug": "urban-pack-insulated-tiffin",
    "name": "Urban Pack Insulated Tiffin",
    "brand": "Asian Plastowares",
    "category": "tiffins",
    "description": "Modern urban insulated lunch bag with wide-mouth stainless steel containers and adjustable shoulder strap.",
    "badge": "SHOULDER STRAP CARRIER",
    "imageUrl": "/products/cat_urban_pack.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-ubp-2",
        "sku": "ASIAN-UBP-2",
        "name": "Urban Pack 2 (2x 400ml)",
        "capacity": "800ml Total",
        "colors": [
          "Slate Grey",
          "Army Olive",
          "Mocha Brown"
        ],
        "mrp": 683,
        "offerPrice": 683,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-C3"
      },
      {
        "id": "var-ubp-3",
        "sku": "ASIAN-UBP-3",
        "name": "Urban Pack 3 (3x 400ml)",
        "capacity": "1200ml Total",
        "colors": [
          "Slate Grey",
          "Army Olive",
          "Mocha Brown"
        ],
        "mrp": 873,
        "offerPrice": 873,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-C3"
      }
    ]
  },
  {
    "id": "prod-hot-meal-locker-sr",
    "slug": "hot-meal-locker-executive-sr",
    "name": "Hot Meal Locker Executive Sr.",
    "brand": "Asian Plastowares",
    "category": "tiffins",
    "description": "Rectangular insulated lunch box with 4-side snap locks, stainless steel food tray and separate steel curry container.",
    "badge": "AIRTIGHT 4-SIDE LOCK",
    "imageUrl": "/products/cat_hot_meal_locker.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-hml-sr",
        "sku": "ASIAN-HML-600",
        "name": "Model 600 (600ml + 150ml)",
        "capacity": "750ml Total",
        "colors": [
          "Deep Pine Green",
          "Mint Teal",
          "Coffee Copper"
        ],
        "mrp": 773,
        "offerPrice": 773,
        "discountPct": 0,
        "casePackQty": 72,
        "packingType": "Box",
        "stockQty": 70,
        "rackLocation": "RACK-C4"
      }
    ]
  },
  {
    "id": "prod-big-bite-sr",
    "slug": "big-bite-executive-sr",
    "name": "Big Bite Executive Sr. Lunch Box",
    "brand": "Asian Plastowares",
    "category": "tiffins",
    "description": "Double-layer insulated bento lunch box with stainless steel compartments, utensil set, and snap-tight lid.",
    "badge": "EXECUTIVE BENTO",
    "imageUrl": "/products/cat_big_bite_sr.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-bb-sr",
        "sku": "ASIAN-BB-600",
        "name": "Model 600 (600ml + 150ml)",
        "capacity": "750ml",
        "colors": [
          "Midnight Blue",
          "Crimson Red",
          "Nordic Grey"
        ],
        "mrp": 904,
        "offerPrice": 904,
        "discountPct": 0,
        "casePackQty": 72,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-C5"
      }
    ]
  },
  {
    "id": "prod-fun-meal-lunch-box",
    "slug": "fun-meal-insulated-lunch-box",
    "name": "Fun Meal Insulated Lunch Box",
    "brand": "Asian Plastowares",
    "category": "tiffins",
    "description": "Fruit-themed insulated lunch box with stainless steel inner liner and removable stainless steel inner container.",
    "badge": "KIDS & OFFICE FAVORITE",
    "imageUrl": "/products/cat_fun_meal.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-fm-250",
        "sku": "ASIAN-FM-250",
        "name": "250 ml (Orange)",
        "capacity": "250ml",
        "colors": [
          "Citrus Orange"
        ],
        "mrp": 291,
        "offerPrice": 291,
        "discountPct": 0,
        "casePackQty": 96,
        "packingType": "Box",
        "stockQty": 80,
        "rackLocation": "RACK-C6"
      },
      {
        "id": "var-fm-300",
        "sku": "ASIAN-FM-300",
        "name": "300 ml (Kiwi)",
        "capacity": "300ml",
        "colors": [
          "Kiwi Green"
        ],
        "mrp": 319,
        "offerPrice": 319,
        "discountPct": 0,
        "casePackQty": 72,
        "packingType": "Box",
        "stockQty": 80,
        "rackLocation": "RACK-C6"
      },
      {
        "id": "var-fm-350",
        "sku": "ASIAN-FM-350",
        "name": "350 ml (Pomegranate)",
        "capacity": "350ml",
        "colors": [
          "Ruby Red"
        ],
        "mrp": 368,
        "offerPrice": 368,
        "discountPct": 0,
        "casePackQty": 72,
        "packingType": "Box",
        "stockQty": 80,
        "rackLocation": "RACK-C6"
      }
    ]
  },
  {
    "id": "prod-thumb-grip-bottle",
    "slug": "thumb-grip-steel-water-bottle",
    "name": "Thumb Grip Steel Water Bottle",
    "brand": "Asian Plastowares",
    "category": "bottles",
    "description": "Ergonomic thumb grip contoured bottle with premium food-grade stainless steel inner liner and flip sip lid.",
    "badge": "STAINLESS STEEL INNER",
    "imageUrl": "/products/cat_thumb_grip_bottle.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-tg-900",
        "sku": "ASIAN-TG-900",
        "name": "900 ml",
        "capacity": "900ml",
        "colors": [
          "Teal Cyan",
          "Lavender Purple",
          "Powder Pink"
        ],
        "mrp": 557,
        "offerPrice": 557,
        "discountPct": 0,
        "casePackQty": 48,
        "packingType": "Box",
        "stockQty": 75,
        "rackLocation": "RACK-D1"
      }
    ]
  },
  {
    "id": "prod-vibrant-flip-bottle",
    "slug": "vibrant-flip-steel-water-bottle",
    "name": "Vibrant Flip Steel Water Bottle",
    "brand": "Asian Plastowares",
    "category": "bottles",
    "description": "Sleek dual-tone insulated steel bottle with one-touch flip push-button lid.",
    "badge": "ONE-TOUCH FLIP CAP",
    "imageUrl": "/products/cat_vibrant_flip_bottle.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-vf-900",
        "sku": "ASIAN-VF-900",
        "name": "900 ml",
        "capacity": "900ml",
        "colors": [
          "Blush Pink",
          "Sage Mint",
          "Steel Black"
        ],
        "mrp": 464,
        "offerPrice": 464,
        "discountPct": 0,
        "casePackQty": 48,
        "packingType": "Box",
        "stockQty": 75,
        "rackLocation": "RACK-D2"
      }
    ]
  },
  {
    "id": "prod-sip-star-bottle",
    "slug": "sip-star-insulated-water-bottle",
    "name": "Sip Star Insulated Water Bottle",
    "brand": "Asian Plastowares",
    "category": "bottles",
    "description": "Double-wall insulated bottle with carry belt, flip straw spout and cup lid. Ideal for school, gym & cycling.",
    "badge": "WITH CARRY STRAP",
    "imageUrl": "/products/cat_sip_star.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-sps-500",
        "sku": "ASIAN-SPS-500",
        "name": "500 ml",
        "capacity": "500ml",
        "colors": [
          "Cyan Blue",
          "Grape Purple",
          "Lime Green"
        ],
        "mrp": 217,
        "offerPrice": 217,
        "discountPct": 0,
        "casePackQty": 72,
        "packingType": "Box",
        "stockQty": 90,
        "rackLocation": "RACK-D3"
      },
      {
        "id": "var-sps-700",
        "sku": "ASIAN-SPS-700",
        "name": "700 ml",
        "capacity": "700ml",
        "colors": [
          "Cyan Blue",
          "Grape Purple",
          "Lime Green"
        ],
        "mrp": 242,
        "offerPrice": 242,
        "discountPct": 0,
        "casePackQty": 48,
        "packingType": "Box",
        "stockQty": 90,
        "rackLocation": "RACK-D3"
      }
    ]
  },
  {
    "id": "prod-jewel-flask",
    "slug": "jewel-insulated-flask",
    "name": "Jewel Insulated Stainless Steel Flask",
    "brand": "Asian Plastowares",
    "category": "bottles",
    "description": "Vacuum insulated stainless steel hot & cold thermos flask. Keeps tea, coffee or water piping hot for 24 hours.",
    "badge": "24 HRS HOT & COLD",
    "imageUrl": "/products/cat_jewel_flask.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-jfl-500",
        "sku": "ASIAN-JFL-500",
        "name": "500 ml",
        "capacity": "500ml",
        "colors": [
          "Matte Black",
          "Silver Steel",
          "Rose Gold"
        ],
        "mrp": 620,
        "offerPrice": 620,
        "discountPct": 0,
        "casePackQty": 48,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-D4"
      },
      {
        "id": "var-jfl-750",
        "sku": "ASIAN-JFL-750",
        "name": "750 ml",
        "capacity": "750ml",
        "colors": [
          "Matte Black",
          "Silver Steel",
          "Rose Gold"
        ],
        "mrp": 745,
        "offerPrice": 745,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-D4"
      },
      {
        "id": "var-jfl-1000",
        "sku": "ASIAN-JFL-1000",
        "name": "1000 ml",
        "capacity": "1000ml",
        "colors": [
          "Matte Black",
          "Silver Steel",
          "Rose Gold"
        ],
        "mrp": 875,
        "offerPrice": 875,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-D4"
      }
    ]
  },
  {
    "id": "prod-floating-water-jug",
    "slug": "floating-insulated-water-jug",
    "name": "Floating Insulated Water Jug Dispenser",
    "brand": "Asian Plastowares",
    "category": "bottles",
    "description": "Heavy-duty PUF insulated water jug with wide mouth, easy-pour tap dispenser and sturdy carry handle.",
    "badge": "EASY DISPENSER TAP",
    "imageUrl": "/products/cat_floating_jug.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-flj-5",
        "sku": "ASIAN-FLJ-5",
        "name": "5 Litre",
        "capacity": "5 Litres",
        "colors": [
          "Sky Blue",
          "Mint Green",
          "Mocha Brown"
        ],
        "mrp": 685,
        "offerPrice": 685,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-D5"
      },
      {
        "id": "var-flj-7",
        "sku": "ASIAN-FLJ-7",
        "name": "7 Litre",
        "capacity": "7 Litres",
        "colors": [
          "Sky Blue",
          "Mint Green",
          "Mocha Brown"
        ],
        "mrp": 830,
        "offerPrice": 830,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-D5"
      },
      {
        "id": "var-flj-10",
        "sku": "ASIAN-FLJ-10",
        "name": "10 Litre",
        "capacity": "10 Litres",
        "colors": [
          "Sky Blue",
          "Mint Green",
          "Mocha Brown"
        ],
        "mrp": 995,
        "offerPrice": 995,
        "discountPct": 0,
        "casePackQty": 8,
        "packingType": "Box",
        "stockQty": 30,
        "rackLocation": "RACK-D5"
      }
    ]
  },
  {
    "id": "prod-glimpse-fridge-bottle",
    "slug": "glimpse-pet-fridge-bottle",
    "name": "Glimpse PET Fridge Water Bottle (Set)",
    "brand": "Asian Plastowares",
    "category": "bottles",
    "description": "BPA-free crystal clear fridge bottle with diamond geometric texture and airtight leak-proof screw cap.",
    "badge": "100% BPA FREE PET",
    "imageUrl": "/products/cat_pet_bottles.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-glp-3",
        "sku": "ASIAN-GLP-SET3",
        "name": "Set of 3 (1000ml x 3)",
        "capacity": "1000ml x 3",
        "colors": [
          "Assorted Sapphire, Jade, Berry"
        ],
        "mrp": 270,
        "offerPrice": 270,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Shrink",
        "stockQty": 80,
        "rackLocation": "RACK-D6"
      },
      {
        "id": "var-glp-6",
        "sku": "ASIAN-GLP-SET6",
        "name": "Set of 6 (1000ml x 6)",
        "capacity": "1000ml x 6",
        "colors": [
          "Assorted Rainbow"
        ],
        "mrp": 530,
        "offerPrice": 530,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Shrink",
        "stockQty": 60,
        "rackLocation": "RACK-D6"
      }
    ]
  },
  {
    "id": "prod-thermo-wagon-cooler",
    "slug": "thermo-wagon-ice-cooler",
    "name": "Thermo Wagon Insulated Ice Cooler Box",
    "brand": "Asian Plastowares",
    "category": "coolers",
    "description": "Commercial grade PUF ice cooler chest engineered to retain ice and keep beverages chilled for up to 24 hours.",
    "badge": "KEEPS COOL 24 HOURS",
    "imageUrl": "/products/cat_thermo_wagon_cooler.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-tw-45",
        "sku": "ASIAN-TW-45L",
        "name": "45 Litre Heavy Duty",
        "capacity": "45 Litres",
        "colors": [
          "Fiery Red",
          "Ocean Blue"
        ],
        "mrp": 5806,
        "offerPrice": 5806,
        "discountPct": 0,
        "casePackQty": 2,
        "packingType": "Poly",
        "stockQty": 25,
        "rackLocation": "RACK-E1"
      },
      {
        "id": "var-tw-110",
        "sku": "ASIAN-TW-110",
        "name": "110 Litre Without Wheels",
        "capacity": "110 Litres",
        "colors": [
          "Fiery Red",
          "Ocean Blue"
        ],
        "mrp": 8622,
        "offerPrice": 8622,
        "discountPct": 0,
        "casePackQty": 1,
        "packingType": "Poly",
        "stockQty": 15,
        "rackLocation": "RACK-E1"
      },
      {
        "id": "var-tw-110w",
        "sku": "ASIAN-TW-110W",
        "name": "110 Litre With Heavy Wheels",
        "capacity": "110 Litres",
        "colors": [
          "Fiery Red",
          "Ocean Blue"
        ],
        "mrp": 9183,
        "offerPrice": 9183,
        "discountPct": 0,
        "casePackQty": 1,
        "packingType": "Poly",
        "stockQty": 15,
        "rackLocation": "RACK-E1"
      }
    ]
  },
  {
    "id": "prod-clear-stack-containers",
    "slug": "clear-stack-modular-containers",
    "name": "Clear Stack Modular Food Containers",
    "brand": "Asian Plastowares",
    "category": "containers",
    "description": "See-through food-grade airtight modular containers with stackable groove lids. Keeps dry provisions fresh and insect-free.",
    "badge": "AIRTIGHT MODULAR",
    "imageUrl": "/products/cat_clear_stack.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-cls-500x2",
        "sku": "ASIAN-CLS-500X2",
        "name": "Set of 2 (500ml x 2)",
        "capacity": "500ml x 2",
        "colors": [
          "Slate Grey Lid",
          "Dark Blue Lid"
        ],
        "mrp": 223,
        "offerPrice": 223,
        "discountPct": 0,
        "casePackQty": 108,
        "packingType": "Box",
        "stockQty": 100,
        "rackLocation": "RACK-F1"
      },
      {
        "id": "var-cls-750x2",
        "sku": "ASIAN-CLS-750X2",
        "name": "Set of 2 (750ml x 2)",
        "capacity": "750ml x 2",
        "colors": [
          "Slate Grey Lid",
          "Dark Blue Lid"
        ],
        "mrp": 256,
        "offerPrice": 256,
        "discountPct": 0,
        "casePackQty": 72,
        "packingType": "Box",
        "stockQty": 100,
        "rackLocation": "RACK-F1"
      },
      {
        "id": "var-cls-1000x2",
        "sku": "ASIAN-CLS-1000X2",
        "name": "Set of 2 (1000ml x 2)",
        "capacity": "1000ml x 2",
        "colors": [
          "Slate Grey Lid",
          "Dark Blue Lid"
        ],
        "mrp": 295,
        "offerPrice": 295,
        "discountPct": 0,
        "casePackQty": 60,
        "packingType": "Box",
        "stockQty": 90,
        "rackLocation": "RACK-F1"
      },
      {
        "id": "var-cls-1800",
        "sku": "ASIAN-CLS-1800",
        "name": "Single 1800 ml",
        "capacity": "1800ml",
        "colors": [
          "Slate Grey Lid",
          "Dark Blue Lid"
        ],
        "mrp": 251,
        "offerPrice": 251,
        "discountPct": 0,
        "casePackQty": 60,
        "packingType": "Box",
        "stockQty": 80,
        "rackLocation": "RACK-F1"
      },
      {
        "id": "var-cls-2300",
        "sku": "ASIAN-CLS-2300",
        "name": "Single 2300 ml",
        "capacity": "2300ml",
        "colors": [
          "Slate Grey Lid",
          "Dark Blue Lid"
        ],
        "mrp": 274,
        "offerPrice": 274,
        "discountPct": 0,
        "casePackQty": 45,
        "packingType": "Box",
        "stockQty": 80,
        "rackLocation": "RACK-F1"
      }
    ]
  },
  {
    "id": "prod-clear-stack-executive",
    "slug": "clear-stack-executive-steel-lid",
    "name": "Clear Stack Executive (Stainless Steel Lid)",
    "brand": "Asian Plastowares",
    "category": "containers",
    "description": "Ultra-clear pantry jar fitted with premium mirror-polished Stainless Steel airtight lid.",
    "badge": "STAINLESS STEEL LID",
    "imageUrl": "/products/cat_clear_stack_exec.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-cse-500x2",
        "sku": "ASIAN-CSE-500X2",
        "name": "Set of 2 (500ml x 2)",
        "capacity": "500ml x 2",
        "colors": [
          "Stainless Steel Silver"
        ],
        "mrp": 310,
        "offerPrice": 310,
        "discountPct": 0,
        "casePackQty": 108,
        "packingType": "Box",
        "stockQty": 80,
        "rackLocation": "RACK-F2"
      },
      {
        "id": "var-cse-750x2",
        "sku": "ASIAN-CSE-750X2",
        "name": "Set of 2 (750ml x 2)",
        "capacity": "750ml x 2",
        "colors": [
          "Stainless Steel Silver"
        ],
        "mrp": 355,
        "offerPrice": 355,
        "discountPct": 0,
        "casePackQty": 72,
        "packingType": "Box",
        "stockQty": 80,
        "rackLocation": "RACK-F2"
      },
      {
        "id": "var-cse-1000x2",
        "sku": "ASIAN-CSE-1000X2",
        "name": "Set of 2 (1000ml x 2)",
        "capacity": "1000ml x 2",
        "colors": [
          "Stainless Steel Silver"
        ],
        "mrp": 395,
        "offerPrice": 395,
        "discountPct": 0,
        "casePackQty": 60,
        "packingType": "Box",
        "stockQty": 75,
        "rackLocation": "RACK-F2"
      },
      {
        "id": "var-cse-1800",
        "sku": "ASIAN-CSE-1800",
        "name": "Single 1800 ml",
        "capacity": "1800ml",
        "colors": [
          "Stainless Steel Silver"
        ],
        "mrp": 340,
        "offerPrice": 340,
        "discountPct": 0,
        "casePackQty": 60,
        "packingType": "Box",
        "stockQty": 70,
        "rackLocation": "RACK-F2"
      },
      {
        "id": "var-cse-2300",
        "sku": "ASIAN-CSE-2300",
        "name": "Single 2300 ml",
        "capacity": "2300ml",
        "colors": [
          "Stainless Steel Silver"
        ],
        "mrp": 380,
        "offerPrice": 380,
        "discountPct": 0,
        "casePackQty": 45,
        "packingType": "Box",
        "stockQty": 70,
        "rackLocation": "RACK-F2"
      }
    ]
  },
  {
    "id": "prod-royal-stylo-jar",
    "slug": "royal-stylo-airseal-jar",
    "name": "Royal Stylo Airseal Large Grain Jar",
    "brand": "Asian Plastowares",
    "category": "containers",
    "description": "Heavy-duty large grain and provision storage containers with airtight seal for rice, wheat, dal, and flour.",
    "badge": "HEAVY DUTY STORAGE",
    "imageUrl": "/products/cat_royal_stylo.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-rs-set3",
        "sku": "ASIAN-RS-SET3",
        "name": "Set of 3 (2.5L + 5L + 7.5L)",
        "capacity": "2.5L, 5L, 7.5L",
        "colors": [
          "Crystal Brown",
          "Milky White",
          "Translucent Blue"
        ],
        "mrp": 599,
        "offerPrice": 599,
        "discountPct": 0,
        "casePackQty": 18,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-F3"
      }
    ]
  },
  {
    "id": "prod-regal-roller-box",
    "slug": "regal-roller-storage-box",
    "name": "Regal Roller Storage Box with Wheels",
    "brand": "Asian Plastowares",
    "category": "organizers",
    "description": "Heavy duty transparent storage trunk with snap-lock latch handles and rolling wheels for effortless mobility.",
    "badge": "WITH ROLLER WHEELS",
    "imageUrl": "/products/cat_regal_roller.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-rr-16l",
        "sku": "ASIAN-RR-16L",
        "name": "A 16 Litre",
        "capacity": "16 Litres",
        "colors": [
          "Clear Red Latches"
        ],
        "mrp": 499,
        "offerPrice": 499,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-G1"
      },
      {
        "id": "var-rr-22l",
        "sku": "ASIAN-RR-22L",
        "name": "A 22 Litre",
        "capacity": "22 Litres",
        "colors": [
          "Clear Red Latches"
        ],
        "mrp": 625,
        "offerPrice": 625,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-G1"
      },
      {
        "id": "var-rr-35l",
        "sku": "ASIAN-RR-35L",
        "name": "C 35 Litre (With Wheels)",
        "capacity": "35 Litres",
        "colors": [
          "Clear Red Latches"
        ],
        "mrp": 895,
        "offerPrice": 895,
        "discountPct": 0,
        "casePackQty": 8,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-G1"
      },
      {
        "id": "var-rr-54l",
        "sku": "ASIAN-RR-54L",
        "name": "C 54 Litre (With Wheels)",
        "capacity": "54 Litres",
        "colors": [
          "Clear Red Latches"
        ],
        "mrp": 1240,
        "offerPrice": 1240,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-G1"
      },
      {
        "id": "var-rr-67l",
        "sku": "ASIAN-RR-67L",
        "name": "C 67 Litre (With Wheels)",
        "capacity": "67 Litres",
        "colors": [
          "Clear Red Latches"
        ],
        "mrp": 1490,
        "offerPrice": 1490,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 35,
        "rackLocation": "RACK-G1"
      }
    ]
  },
  {
    "id": "prod-desk-mate-drawer",
    "slug": "desk-mate-organiser-drawer-box",
    "name": "Desk Mate Multi-tier Drawer Organiser",
    "brand": "Asian Plastowares",
    "category": "organizers",
    "description": "Multi-tier desk and cosmetic organiser drawer box with top compartment tray for makeup, jewelry, and stationery.",
    "badge": "MULTI-TIER STORAGE",
    "imageUrl": "/products/cat_desk_mate_drawer.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-dm-3",
        "sku": "ASIAN-DM-3",
        "name": "Drawer Box - 3 Tier",
        "capacity": "3 Tier Organiser",
        "colors": [
          "Pastel Multicolour",
          "Nordic Grey"
        ],
        "mrp": 558,
        "offerPrice": 558,
        "discountPct": 0,
        "casePackQty": 16,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-G2"
      },
      {
        "id": "var-dm-4",
        "sku": "ASIAN-DM-4",
        "name": "Drawer Box - 4 Tier",
        "capacity": "4 Tier Organiser",
        "colors": [
          "Pastel Multicolour",
          "Nordic Grey"
        ],
        "mrp": 697,
        "offerPrice": 697,
        "discountPct": 0,
        "casePackQty": 16,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-G2"
      },
      {
        "id": "var-dm-exec3",
        "sku": "ASIAN-DME-3",
        "name": "Executive Drawer Box - 3 Tier",
        "capacity": "3 Tier Executive",
        "colors": [
          "Coral Multi",
          "Nordic Grey"
        ],
        "mrp": 700,
        "offerPrice": 700,
        "discountPct": 0,
        "casePackQty": 16,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-G2"
      },
      {
        "id": "var-dm-exec4",
        "sku": "ASIAN-DME-4",
        "name": "Executive Drawer Box - 4 Tier",
        "capacity": "4 Tier Executive",
        "colors": [
          "Coral Multi",
          "Nordic Grey"
        ],
        "mrp": 836,
        "offerPrice": 836,
        "discountPct": 0,
        "casePackQty": 16,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-G2"
      }
    ]
  },
  {
    "id": "prod-blend-bowl-set",
    "slug": "blend-mixing-bowl-set",
    "name": "Blend Nesting Mixing & Serving Bowl Set",
    "brand": "Asian Plastowares",
    "category": "organizers",
    "description": "5-piece graduated nesting bowls for festive sweet preparation, batter mixing, salads, and tabletop serving.",
    "badge": "NESTING SET OF 5",
    "imageUrl": "/products/cat_blend_bowls.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-bb-set5",
        "sku": "ASIAN-BB-SET5",
        "name": "Set of 5 (12cm to 24cm)",
        "capacity": "0.5L, 1L, 2L, 3L, 5L",
        "colors": [
          "Festive Crimson Red",
          "Nordic Navy Blue",
          "Forest Olive Green"
        ],
        "mrp": 497,
        "offerPrice": 497,
        "discountPct": 0,
        "casePackQty": 18,
        "packingType": "Box",
        "stockQty": 65,
        "rackLocation": "RACK-G3"
      }
    ]
  },
  {
    "id": "prod-handy-home-baskets",
    "slug": "handy-home-multipurpose-baskets",
    "name": "Handy Home Multipurpose Woven Baskets",
    "brand": "Asian Plastowares",
    "category": "household",
    "description": "Knit woven texture multipurpose storage baskets with side handles for wardrobe, bathroom, and kitchen.",
    "badge": "WOVEN TEXTURE",
    "imageUrl": "/products/cat_handy_baskets.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-hhb-jr",
        "sku": "ASIAN-HHB-JR",
        "name": "Junior Basket",
        "capacity": "Small",
        "colors": [
          "Pastel Cyan",
          "Mocha Brown",
          "Powder Pink"
        ],
        "mrp": 145,
        "offerPrice": 145,
        "discountPct": 0,
        "casePackQty": 48,
        "packingType": "Poly",
        "stockQty": 80,
        "rackLocation": "RACK-H1"
      },
      {
        "id": "var-hhb-med",
        "sku": "ASIAN-HHB-MED",
        "name": "Medium Basket",
        "capacity": "Medium",
        "colors": [
          "Pastel Cyan",
          "Mocha Brown",
          "Powder Pink"
        ],
        "mrp": 215,
        "offerPrice": 215,
        "discountPct": 0,
        "casePackQty": 36,
        "packingType": "Poly",
        "stockQty": 80,
        "rackLocation": "RACK-H1"
      },
      {
        "id": "var-hhb-set3",
        "sku": "ASIAN-HHB-SET3",
        "name": "Set of 3 (Jr + Med + Sr)",
        "capacity": "3-Piece Nesting Set",
        "colors": [
          "Pastel Cyan",
          "Mocha Brown"
        ],
        "mrp": 485,
        "offerPrice": 485,
        "discountPct": 0,
        "casePackQty": 18,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-H1"
      }
    ]
  },
  {
    "id": "prod-look-beautiful-dustbin",
    "slug": "look-beautiful-pedal-dustbin",
    "name": "Look Beautiful Floral Pedal Dustbin",
    "brand": "Asian Plastowares",
    "category": "household",
    "description": "Hands-free hygiene foot-pedal round dustbin with floral print, smooth closing lid and inner removable bucket with handle.",
    "badge": "HANDS-FREE FOOT PEDAL",
    "imageUrl": "/products/cat_look_beautiful_dustbin.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-lbd-7",
        "sku": "ASIAN-LBD-7L",
        "name": "7 Litre",
        "capacity": "7 Litres",
        "colors": [
          "Earth Mocha Grey",
          "Charcoal Slate",
          "Warm Ivory"
        ],
        "mrp": 406,
        "offerPrice": 406,
        "discountPct": 0,
        "casePackQty": 18,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-H2"
      },
      {
        "id": "var-lbd-8",
        "sku": "ASIAN-LBD-8L",
        "name": "Junior (8 Litre)",
        "capacity": "8 Litres",
        "colors": [
          "Earth Mocha Grey",
          "Charcoal Slate",
          "Warm Ivory"
        ],
        "mrp": 456,
        "offerPrice": 456,
        "discountPct": 0,
        "casePackQty": 16,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-H2"
      },
      {
        "id": "var-lbd-115",
        "sku": "ASIAN-LBD-115L",
        "name": "Senior (11.5 Litre)",
        "capacity": "11.5 Litres",
        "colors": [
          "Earth Mocha Grey",
          "Charcoal Slate",
          "Warm Ivory"
        ],
        "mrp": 659,
        "offerPrice": 659,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-H2"
      },
      {
        "id": "var-lbd-15",
        "sku": "ASIAN-LBD-15L",
        "name": "Super Senior (15 Litre)",
        "capacity": "15 Litres",
        "colors": [
          "Earth Mocha Grey",
          "Charcoal Slate",
          "Warm Ivory"
        ],
        "mrp": 797,
        "offerPrice": 797,
        "discountPct": 0,
        "casePackQty": 8,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-H2"
      }
    ]
  },
  {
    "id": "prod-home-shine-square-dustbin",
    "slug": "home-shine-square-pedal-dustbin",
    "name": "Home Shine Square Pedal Dustbin",
    "brand": "Asian Plastowares",
    "category": "household",
    "description": "Heavy-duty square pedal dustbin with wide-opening lid, easy carry handle and heavy duty foot pedal mechanism.",
    "badge": "WIDE OPENING SQUARE LID",
    "imageUrl": "/products/cat_home_shine_square.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-hsd-7",
        "sku": "ASIAN-HSD-7L",
        "name": "Junior (7 Litre)",
        "capacity": "7 Litres",
        "colors": [
          "Sky Blue",
          "Coffee Mocha",
          "Cool Grey"
        ],
        "mrp": 397,
        "offerPrice": 397,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-H3"
      },
      {
        "id": "var-hsd-12",
        "sku": "ASIAN-HSD-12L",
        "name": "Medium (12 Litre)",
        "capacity": "12 Litres",
        "colors": [
          "Sky Blue",
          "Coffee Mocha",
          "Cool Grey"
        ],
        "mrp": 510,
        "offerPrice": 510,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Box",
        "stockQty": 60,
        "rackLocation": "RACK-H3"
      },
      {
        "id": "var-hsd-15",
        "sku": "ASIAN-HSD-15L",
        "name": "Senior (15 Litre)",
        "capacity": "15 Litres",
        "colors": [
          "Sky Blue",
          "Coffee Mocha",
          "Cool Grey"
        ],
        "mrp": 683,
        "offerPrice": 683,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 50,
        "rackLocation": "RACK-H3"
      },
      {
        "id": "var-hsd-20",
        "sku": "ASIAN-HSD-20L",
        "name": "Jumbo (20 Litre)",
        "capacity": "20 Litres",
        "colors": [
          "Sky Blue",
          "Coffee Mocha",
          "Cool Grey"
        ],
        "mrp": 973,
        "offerPrice": 973,
        "discountPct": 0,
        "casePackQty": 12,
        "packingType": "Box",
        "stockQty": 40,
        "rackLocation": "RACK-H3"
      },
      {
        "id": "var-hsd-50",
        "sku": "ASIAN-HSD-50L",
        "name": "Mega Commercial (50 Litre)",
        "capacity": "50 Litres",
        "colors": [
          "Sky Blue",
          "Coffee Mocha",
          "Cool Grey"
        ],
        "mrp": 2019,
        "offerPrice": 2019,
        "discountPct": 0,
        "casePackQty": 6,
        "packingType": "Box",
        "stockQty": 30,
        "rackLocation": "RACK-H3"
      }
    ]
  },
  {
    "id": "prod-nesto-stool",
    "slug": "nesto-ergonomic-stool",
    "name": "Nesto Premium Heavy-Duty Stool",
    "brand": "Asian Plastowares",
    "category": "household",
    "description": "Ergonomic heavy-weight bathroom & kitchen stool with textured anti-skid surface and bottom rubber grips for safety.",
    "badge": "120 KG WEIGHT CAPACITY",
    "imageUrl": "/products/cat_nesto_stool.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-nst-std",
        "sku": "ASIAN-NST-STOOL",
        "name": "Standard (38.5 x 29.5 x 21.5cm)",
        "capacity": "120kg Capacity",
        "colors": [
          "Powder Sky Blue",
          "Earth Brown",
          "Cool Grey"
        ],
        "mrp": 467,
        "offerPrice": 467,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Poly",
        "stockQty": 70,
        "rackLocation": "RACK-H4"
      }
    ]
  },
  {
    "id": "prod-century-bucket",
    "slug": "century-heavy-duty-bucket",
    "name": "Century Heavy Duty Bucket",
    "brand": "Asian Plastowares",
    "category": "household",
    "description": "Durable crack-resistant bathroom bucket with sturdy steel handle grip and pouring spout.",
    "badge": "HEAVY DUTY UNBREAKABLE",
    "imageUrl": "/products/cat_century_bucket.png",
    "isCombo": false,
    "variants": [
      {
        "id": "var-cb-18",
        "sku": "ASIAN-CB-18L",
        "name": "18 Litre",
        "capacity": "18 Litres",
        "colors": [
          "Royal Blue",
          "Forest Green",
          "Ruby Red"
        ],
        "mrp": 385,
        "offerPrice": 385,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Poly",
        "stockQty": 80,
        "rackLocation": "RACK-H5"
      },
      {
        "id": "var-cb-25",
        "sku": "ASIAN-CB-25L",
        "name": "25 Litre",
        "capacity": "25 Litres",
        "colors": [
          "Royal Blue",
          "Forest Green",
          "Ruby Red"
        ],
        "mrp": 495,
        "offerPrice": 495,
        "discountPct": 0,
        "casePackQty": 24,
        "packingType": "Poly",
        "stockQty": 80,
        "rackLocation": "RACK-H5"
      }
    ]
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'DIWALI2026',
    description: '10% Extra Festive Discount on All Orders above ₹999',
    discountType: 'percentage',
    value: 10,
    minOrder: 999,
    expiresAt: '2026-11-30'
  },
  {
    code: 'FESTIVE500',
    description: 'Flat ₹500 Instant Discount on Mega Festive Hampers above ₹2,500',
    discountType: 'fixed',
    value: 500,
    minOrder: 2500,
    expiresAt: '2026-11-30'
  },
  {
    code: 'ONAMFREE',
    description: 'Flat ₹150 Festive Treat on orders above ₹799',
    discountType: 'fixed',
    value: 150,
    minOrder: 799,
    expiresAt: '2026-11-30'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Homely Admin',
    email: 'admin@homely.in',
    passwordHash: '$2b$10$jxSnlyweDrey3AwQwYEOXOx.G74/G1ml17h61Zj2DAkur1d6pip5.', // Admin@12345
    role: 'ADMIN',
    phone: '+91 98410 00001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-customer-1',
    name: 'Sathish Kumar',
    email: 'sathish@example.com',
    role: 'CUSTOMER',
    phone: '+91 98410 12345',
    createdAt: new Date().toISOString()
  }
];

export class DatabaseStore {
  private static instance: DatabaseStore;
  private dataFile: string;

  public products: Product[] = [];
  public coupons: Coupon[] = [];
  public orders: Order[] = [];
  public users: User[] = [];

  private constructor() {
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dataFile = path.join(dataDir, 'store.json');
    this.load();
  }

  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }

  private load() {
    if (fs.existsSync(this.dataFile)) {
      try {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        const parsed = JSON.parse(raw);
        this.products = parsed.products || INITIAL_PRODUCTS;
        this.coupons = parsed.coupons || INITIAL_COUPONS;
        this.orders = parsed.orders || [];
        this.users = parsed.users && parsed.users.length > 0 ? parsed.users : INITIAL_USERS;
        return;
      } catch (err) {
        console.error('Error reading store.json, resetting to initial data:', err);
      }
    }

    this.products = INITIAL_PRODUCTS;
    this.coupons = INITIAL_COUPONS;
    this.users = INITIAL_USERS;
    this.orders = [
      {
        id: 'ord-101',
        orderNumber: 'ORD-2026-8801',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        customerName: 'Ananthakrishnan Iyer',
        customerPhone: '+91 98401 23456',
        customerEmail: 'ananth@example.com',
        shippingAddress: {
          street: '14, Temple Gate Road, Mylapore',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600004'
        },
        items: [
          {
            productId: 'prod-1',
            productName: 'Master Insulated Casserole Set',
            variantId: 'var-1-1',
            sku: 'ASIAN-MST-1500-3500',
            color: 'Rose Gold Peach',
            capacity: '1500ml + 3500ml',
            quantity: 1,
            mrp: 1885,
            offerPrice: 1287,
            totalPrice: 1287,
            imageUrl: '/products/master_casserole.png',
            rackLocation: 'RACK-A1-CASSEROLE'
          }
        ],
        subtotalMrp: 1885,
        savingsTotal: 598,
        couponCode: 'DIWALI2026',
        couponDiscount: 129,
        finalPayable: 1158,
        paymentMode: 'RAZORPAY',
        paymentStatus: 'PAID',
        razorpayOrderId: 'order_test_908123',
        razorpayPaymentId: 'pay_test_908123',
        status: 'APPROVED_TO_GODOWN',
        statusHistory: [
          {
            status: 'ORDER_PLACED',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            note: 'Order placed via Next.js Festive Storefront with Razorpay payment.'
          },
          {
            status: 'APPROVED_TO_GODOWN',
            timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
            note: 'Payment verified and approved by Admin to Godown inventory bay.'
          }
        ]
      },
      {
        id: 'ord-102',
        orderNumber: 'ORD-2026-8802',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        customerName: 'Lakshmi Priya',
        customerPhone: '+91 94432 99881',
        customerEmail: 'lakshmi@example.com',
        shippingAddress: {
          street: '45, West Cross Road, RS Puram',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641002'
        },
        items: [
          {
            productId: 'prod-5',
            productName: 'Hot & Ready Combo (Flask + Casserole)',
            variantId: 'var-5-1',
            sku: 'ASIAN-CMB-HTRDY',
            color: 'Midnight Navy',
            capacity: '750ml + 1500ml',
            quantity: 2,
            mrp: 2490,
            offerPrice: 1700,
            totalPrice: 1700,
            imageUrl: '/products/hot_ready_combo.png',
            rackLocation: 'RACK-B1-COMBOS'
          }
        ],
        subtotalMrp: 2490,
        savingsTotal: 790,
        couponCode: 'DIWALI2026',
        couponDiscount: 170,
        finalPayable: 1530,
        paymentMode: 'RAZORPAY',
        paymentStatus: 'PAID',
        razorpayOrderId: 'order_test_776123',
        razorpayPaymentId: 'pay_test_776123',
        status: 'PACKED_READY_FOR_DISPATCH',
        statusHistory: [
          {
            status: 'ORDER_PLACED',
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            note: 'Order placed via Next.js website.'
          },
          {
            status: 'APPROVED_TO_GODOWN',
            timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
            note: 'Approved by Admin.'
          },
          {
            status: 'PACKED_READY_FOR_DISPATCH',
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
            note: 'Packed at Godown (Bin RACK-B1-COMBOS) by Saravanan.'
          }
        ],
        godownDetails: {
          packedBy: 'Saravanan (Godown Manager)',
          packedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          rackLocations: ['RACK-B1-COMBOS']
        }
      }
    ];
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(
        this.dataFile,
        JSON.stringify(
          {
            products: this.products,
            coupons: this.coupons,
            orders: this.orders,
            users: this.users
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch (err) {
      console.error('Error saving store.json:', err);
    }
  }
}
