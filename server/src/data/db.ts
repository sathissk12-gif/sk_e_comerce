import * as fs from 'fs';
import * as path from 'path';

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  capacity?: string;
  colors: string[];
  mrp: number;
  offerPrice: number;
  discountPct: number;
  stockQty: number;
  rackLocation: string; // Godown inventory bin/rack
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: 'casseroles' | 'combos' | 'containers' | 'household';
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

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'master-insulated-casserole',
    name: 'Master Insulated Casserole Set',
    brand: 'Asian Plastowares',
    category: 'casseroles',
    description: 'Double-walled insulated casserole set with premium metallic gold accents and stainless steel inner container.',
    badge: 'GRAND FESTIVE OFFER 32% OFF',
    imageUrl: '/products/master_casserole.png',
    isCombo: false,
    variants: [
      {
        id: 'var-1-1',
        sku: 'ASIAN-MST-1500-3500',
        name: 'Set of 2 (1500ml + 3500ml)',
        capacity: '1500ml + 3500ml',
        colors: ['Rose Gold Peach', 'Sapphire Navy Blue', 'Ivory Cream Gold'],
        mrp: 1885,
        offerPrice: 1287,
        discountPct: 32,
        stockQty: 45,
        rackLocation: 'RACK-A1-CASSEROLE'
      }
    ]
  },
  {
    id: 'prod-2',
    slug: 'fancy-insulated-casserole',
    name: 'Fancy Insulated Casserole Set',
    brand: 'Asian Plastowares',
    category: 'casseroles',
    description: 'Modern ribbed exterior with mirror-finish stainless steel inner liner, preserving food aroma and warmth for hours.',
    badge: 'GRAND FESTIVE OFFER 32% OFF',
    imageUrl: '/products/fancy_casserole.png',
    isCombo: false,
    variants: [
      {
        id: 'var-2-1',
        sku: 'ASIAN-FNC-1500-2500',
        name: 'Set of 2 (1500ml + 2500ml)',
        capacity: '1500ml + 2500ml',
        colors: ['Royal Blue', 'Ivory Cream', 'Mint Green', 'Rose Peach'],
        mrp: 1265,
        offerPrice: 864,
        discountPct: 32,
        stockQty: 60,
        rackLocation: 'RACK-A2-CASSEROLE'
      }
    ]
  },
  {
    id: 'prod-3',
    slug: 'olympic-elite-gold-casserole',
    name: 'Olympic Elite Gold Casserole Set',
    brand: 'Asian Plastowares',
    category: 'casseroles',
    description: 'Festive gold-finish lid pattern with ergonomic side handles. Ideal for festive family feasts and pujas.',
    badge: 'GRAND FESTIVE OFFER 32% OFF',
    imageUrl: '/products/olympic_gold.png',
    isCombo: false,
    variants: [
      {
        id: 'var-3-1',
        sku: 'ASIAN-OLY-1200-1600',
        name: 'Set of 2 (1200ml + 1600ml)',
        capacity: '1200ml + 1600ml',
        colors: ['Gold Cream Ivory', 'Sandalwood Gold'],
        mrp: 1127,
        offerPrice: 769,
        discountPct: 32,
        stockQty: 38,
        rackLocation: 'RACK-A3-CASSEROLE'
      }
    ]
  },
  {
    id: 'prod-4',
    slug: 'carry-pack-2000-hot-carrier',
    name: 'Carry Pack 2000 Hot Carrier',
    brand: 'Asian Plastowares',
    category: 'casseroles',
    description: 'Convenient carry-handle insulated food carrier with stainless steel interior. Perfect for office, travel, and festive potlucks.',
    badge: 'FESTIVE SPECIAL 32% OFF',
    imageUrl: '/products/carry_pack.png',
    isCombo: false,
    variants: [
      {
        id: 'var-4-1',
        sku: 'ASIAN-CRY-2000',
        name: 'Single 2000ml Carrier',
        capacity: '2000ml',
        colors: ['Sage Green', 'Charcoal Grey', 'Warm Beige'],
        mrp: 566,
        offerPrice: 386,
        discountPct: 32,
        stockQty: 85,
        rackLocation: 'RACK-A4-CARRIER'
      }
    ]
  },
  {
    id: 'prod-5',
    slug: 'hot-and-ready-combo',
    name: 'Hot & Ready Combo (Flask + Casserole)',
    brand: 'Asian Plastowares',
    category: 'combos',
    description: 'Exclusive festive bundle featuring Jewel Flask 750ml paired with Master Casserole 1500ml.',
    badge: 'BESTSELLER COMBO 32% OFF',
    imageUrl: '/products/hot_ready_combo.png',
    isCombo: true,
    comboIncludes: ['Jewel Flask 750ml', 'Master Casserole 1500ml'],
    variants: [
      {
        id: 'var-5-1',
        sku: 'ASIAN-CMB-HTRDY',
        name: 'Jewel Flask 750 + Master 1500',
        capacity: '750ml + 1500ml',
        colors: ['Champagne Cream Gold', 'Midnight Navy', 'Rose Blush'],
        mrp: 1245,
        offerPrice: 850,
        discountPct: 32,
        stockQty: 50,
        rackLocation: 'RACK-B1-COMBOS'
      }
    ]
  },
  {
    id: 'prod-6',
    slug: 'sip-joy-combo',
    name: 'Sip Joy Combo (Tiffin & Bottle)',
    brand: 'Asian Plastowares',
    category: 'combos',
    description: 'Joy Kit Insulated Lunch Box with dual compartments (550ml + 350ml) plus Ultra Sip 700ml Bottle.',
    badge: 'HOT DEAL 32% OFF',
    imageUrl: '/products/sip_joy_combo.png',
    isCombo: true,
    comboIncludes: ['Joy Kit Lunch Box (550+350ml)', 'Ultra Sip 700ml Bottle'],
    variants: [
      {
        id: 'var-6-1',
        sku: 'ASIAN-CMB-SPJY',
        name: 'Lunch Box (550+350) + Bottle 700',
        capacity: '900ml + 700ml',
        colors: ['Lilac Lavender', 'Mocha Beige', 'Cobalt Blue'],
        mrp: 1167,
        offerPrice: 797,
        discountPct: 32,
        stockQty: 42,
        rackLocation: 'RACK-B2-COMBOS'
      }
    ]
  },
  {
    id: 'prod-7',
    slug: 'fit-fuel-combo',
    name: 'Fit Fuel Combo (Shaker & Mug)',
    brand: 'Asian Plastowares',
    category: 'combos',
    description: 'Power Max Shaker 750ml with blending mesh plus Java Mug 350ml insulated coffee travel tumbler.',
    badge: 'ACTIVE LIFESTYLE 32% OFF',
    imageUrl: '/products/fit_fuel_combo.png',
    isCombo: true,
    comboIncludes: ['Power Max Shaker 750ml', 'Java Mug 350ml'],
    variants: [
      {
        id: 'var-7-1',
        sku: 'ASIAN-CMB-FTFL',
        name: 'Power Shaker 750 + Java Mug 350',
        capacity: '750ml + 350ml',
        colors: ['Onyx Black', 'Deep Navy Blue', 'Mint Aqua'],
        mrp: 657,
        offerPrice: 449,
        discountPct: 32,
        stockQty: 70,
        rackLocation: 'RACK-B3-COMBOS'
      }
    ]
  },
  {
    id: 'prod-8',
    slug: 'orion-combo-set',
    name: 'Orion Combo Set (Flask & Cups)',
    brand: 'Asian Plastowares',
    category: 'combos',
    description: 'Geometric diamond embossed Orion Flask 500ml with 2 Stainless Steel Pretty Cups 200ml.',
    badge: 'GIFT PACK 32% OFF',
    imageUrl: '/products/orion_combo.png',
    isCombo: true,
    comboIncludes: ['Orion Flask 500ml', '2x Pretty Cups 200ml'],
    variants: [
      {
        id: 'var-8-1',
        sku: 'ASIAN-CMB-ORN',
        name: 'Orion Flask 500 + 2 Cups',
        capacity: '500ml + 400ml',
        colors: ['Soft Pink Blush', 'Matte Black', 'Baby Blue', 'Pistachio Green'],
        mrp: 685,
        offerPrice: 468,
        discountPct: 32,
        stockQty: 55,
        rackLocation: 'RACK-B4-COMBOS'
      }
    ]
  },
  {
    id: 'prod-9',
    slug: 'meal-star-combo',
    name: 'Meal Star Combo (Tiffin & Bottle)',
    brand: 'Asian Plastowares',
    category: 'combos',
    description: 'Wonder Meal Junior 700ml insulated tiffin container paired with Lucky Executive 500ml bottle.',
    badge: 'SUPER SAVER 32% OFF',
    imageUrl: '/products/meal_star_combo.png',
    isCombo: true,
    comboIncludes: ['Wonder Meal Junior 700ml', 'Lucky Executive 500ml'],
    variants: [
      {
        id: 'var-9-1',
        sku: 'ASIAN-CMB-MLSTR',
        name: 'Wonder Meal 700 + Bottle 500',
        capacity: '700ml + 500ml',
        colors: ['Mint Jade', 'Ocean Cyan', 'Pastel Pink'],
        mrp: 541,
        offerPrice: 369,
        discountPct: 32,
        stockQty: 65,
        rackLocation: 'RACK-B5-COMBOS'
      }
    ]
  },
  {
    id: 'prod-10',
    slug: 'clear-stack-storage-containers',
    name: 'Clear Stack Modular Food Containers',
    brand: 'Asian Plastowares',
    category: 'containers',
    description: 'Crystal-clear food storage containers with airtight fluted lids. Modular stackable design keeps pantry organized.',
    badge: 'AIR-TIGHT MODULAR',
    imageUrl: '/products/clear_stack_containers.png',
    isCombo: false,
    variants: [
      {
        id: 'var-10-1',
        sku: 'ASIAN-CLR-500X2',
        name: 'Set of 2 (500ml x 2)',
        capacity: '500ml x 2',
        colors: ['Slate Grey Lid', 'Blue Lid'],
        mrp: 223,
        offerPrice: 152,
        discountPct: 32,
        stockQty: 90,
        rackLocation: 'RACK-C1-STORAGE'
      },
      {
        id: 'var-10-2',
        sku: 'ASIAN-CLR-750X2',
        name: 'Set of 2 (750ml x 2)',
        capacity: '750ml x 2',
        colors: ['Slate Grey Lid', 'Blue Lid'],
        mrp: 256,
        offerPrice: 175,
        discountPct: 32,
        stockQty: 80,
        rackLocation: 'RACK-C2-STORAGE'
      },
      {
        id: 'var-10-3',
        sku: 'ASIAN-CLR-1000X2',
        name: 'Set of 2 (1000ml x 2)',
        capacity: '1000ml x 2',
        colors: ['Slate Grey Lid', 'Blue Lid'],
        mrp: 295,
        offerPrice: 201,
        discountPct: 32,
        stockQty: 75,
        rackLocation: 'RACK-C3-STORAGE'
      },
      {
        id: 'var-10-4',
        sku: 'ASIAN-CLR-1800',
        name: 'Single 1800ml Container',
        capacity: '1800ml',
        colors: ['Powder Blue Lid', 'Charcoal Lid'],
        mrp: 251,
        offerPrice: 171,
        discountPct: 32,
        stockQty: 60,
        rackLocation: 'RACK-C4-STORAGE'
      },
      {
        id: 'var-10-5',
        sku: 'ASIAN-CLR-2300',
        name: 'Single 2300ml Container',
        capacity: '2300ml',
        colors: ['Powder Blue Lid', 'Charcoal Lid'],
        mrp: 274,
        offerPrice: 187,
        discountPct: 32,
        stockQty: 55,
        rackLocation: 'RACK-C5-STORAGE'
      }
    ]
  },
  {
    id: 'prod-11',
    slug: 'bloom-container-set-of-4',
    name: 'Bloom Container Set of 4',
    brand: 'Asian Plastowares',
    category: 'containers',
    description: 'Rectangular nested food containers with textured seal lids. BPA-free, microwave-safe without lid, refrigerator-safe.',
    badge: 'FESTIVE SPECIAL 32% OFF',
    imageUrl: '/products/bloom_container.png',
    isCombo: false,
    variants: [
      {
        id: 'var-11-1',
        sku: 'ASIAN-BLM-SET4',
        name: 'Set of 4 (300+600+1200+2000ml)',
        capacity: '300ml, 600ml, 1200ml, 2000ml',
        colors: ['Sky Blue', 'Espresso Brown', 'Milky White'],
        mrp: 257,
        offerPrice: 175,
        discountPct: 32,
        stockQty: 100,
        rackLocation: 'RACK-C6-STORAGE'
      }
    ]
  },
  {
    id: 'prod-12',
    slug: 'blend-bowl-set-of-5',
    name: 'Blend Mixing & Serving Bowl Set of 5',
    brand: 'Asian Plastowares',
    category: 'household',
    description: 'Deep nesting bowls for festive sweet preparation, batter mixing, salads, and tabletop serving.',
    badge: 'GRAND FESTIVE OFFER 32% OFF',
    imageUrl: '/products/blend_bowl_set.png',
    isCombo: false,
    variants: [
      {
        id: 'var-12-1',
        sku: 'ASIAN-BLND-SET5',
        name: 'Set of 5 (500+1000+2000+3000+5000ml)',
        capacity: '0.5L, 1L, 2L, 3L, 5L',
        colors: ['Festive Crimson Red', 'Nordic Navy Blue', 'Forest Olive Green'],
        mrp: 497,
        offerPrice: 339,
        discountPct: 32,
        stockQty: 48,
        rackLocation: 'RACK-D1-BOWLS'
      }
    ]
  },
  {
    id: 'prod-13',
    slug: 'royal-stylo-container-set-of-3',
    name: 'Royal Stylo Large Grain Containers (Set of 3)',
    brand: 'Asian Plastowares',
    category: 'containers',
    description: 'Heavy duty round containers for rice, flour, pulses, and festival provisions with airtight snowflake lid design.',
    badge: 'HEAVY DUTY 32% OFF',
    imageUrl: '/products/royal_stylo.png',
    isCombo: false,
    variants: [
      {
        id: 'var-13-1',
        sku: 'ASIAN-STYLO-SET3',
        name: 'Set of 3 (5000ml + 7000ml + 10000ml)',
        capacity: '5L + 7L + 10L',
        colors: ['Crystal Ocean Blue', 'Berry Pink', 'Lime Green'],
        mrp: 560,
        offerPrice: 382,
        discountPct: 32,
        stockQty: 35,
        rackLocation: 'RACK-C7-LARGE-STORAGE'
      }
    ]
  },
  {
    id: 'prod-14',
    slug: 'century-clear-bucket-and-mug-set',
    name: 'Century Clear Bucket & Mug Set of 4',
    brand: 'Asian Plastowares',
    category: 'household',
    description: 'Durable translucent virgin-grade polymer bathroom utility set: 2 Buckets (16L + 20L) and 2 Mugs (1L + 1.5L).',
    badge: 'MEGA SAVINGS 35% OFF',
    imageUrl: '/products/century_bucket.png',
    isCombo: false,
    variants: [
      {
        id: 'var-14-1',
        sku: 'ASIAN-CNT-SET4',
        name: 'Set of 4 (16L+20L Buckets, 1L+1.5L Mugs)',
        capacity: '16L + 20L + 1L + 1.5L',
        colors: ['Aqua Blue', 'Amber Gold', 'Frost Clear'],
        mrp: 672,
        offerPrice: 439,
        discountPct: 35,
        stockQty: 30,
        rackLocation: 'RACK-D2-UTILITY'
      }
    ]
  },
  {
    id: 'prod-15',
    slug: 'nesto-stool',
    name: 'Nesto Premium Bathroom / Kitchen Stool',
    brand: 'Asian Plastowares',
    category: 'household',
    description: 'Ergonomic heavy-weight stool with anti-skid textured top and bottom rubber grips for safety.',
    badge: 'DURABLE 32% OFF',
    imageUrl: '/products/nesto_stool.png',
    isCombo: false,
    variants: [
      {
        id: 'var-15-1',
        sku: 'ASIAN-NST-STOOL',
        name: '38.5cm x 29.5cm x 21.5cm',
        capacity: 'Standard Weight Capacity 120kg',
        colors: ['Powder Sky Blue', 'Earth Brown', 'Cool Grey'],
        mrp: 467,
        offerPrice: 319,
        discountPct: 32,
        stockQty: 50,
        rackLocation: 'RACK-D3-FURNITURE'
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

export class DatabaseStore {
  private static instance: DatabaseStore;
  private dataFile: string;

  public products: Product[] = [];
  public coupons: Coupon[] = [];
  public orders: Order[] = [];

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
        return;
      } catch (err) {
        console.error('Error reading store.json, resetting to initial data:', err);
      }
    }

    this.products = INITIAL_PRODUCTS;
    this.coupons = INITIAL_COUPONS;
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
            orders: this.orders
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
