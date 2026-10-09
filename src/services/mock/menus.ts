import type {
  Chain,
  ChainDetail,
  ChainId,
  Merchant,
  MerchantDetail,
  MerchantId,
  MenuSection,
  Offer,
  OptionGroupId,
  OptionId,
  Product,
  ProductId,
  ProductOptionGroup,
  SectionId,
} from '../../types';
import { MOCK_MERCHANTS, img } from './data';

/* ------------------------------- templates ------------------------------ */

type ProductTemplate = {
  key: string;
  name: string;
  description: string;
  photo: string;
  price: number;
  originalPrice?: number;
  unitPrice?: number;
  unitLabel?: string;
  isPopular?: boolean;
  /** Attaches the shared "build your own" option groups. */
  configurable?: boolean;
};

type MenuTemplate = {
  sections: { name: string; keys: string[] }[];
  products: ProductTemplate[];
};

/** The one section name that is lifted out of the tabs. */
const POPULAR_SECTION = 'Most ordered';

/**
 * Menus are generated from a handful of templates rather than written out per
 * merchant. Every store in the app then has a real, browsable menu — which is
 * what makes the whole UI reachable — without thousands of lines of fixtures.
 * When the backend lands, this file is the only thing that disappears.
 */
const BURGER_MENU: MenuTemplate = {
  sections: [
    { name: 'Most ordered', keys: ['signature_burger', 'chicago_bacon', 'crispy_wrap', 'smash_double'] },
    {
      name: 'Burgers',
      keys: ['signature_burger', 'chicago_bacon', 'veggie_stack', 'smash_double', 'buttermilk_chicken', 'blue_cheese_burger'],
    },
    { name: 'Chicken', keys: ['crispy_wrap', 'buttermilk_chicken', 'wings_six', 'chicken_tenders'] },
    { name: 'Sides', keys: ['fries', 'onion_rings', 'loaded_fries', 'slaw', 'mac_bites'] },
    { name: 'Desserts', keys: ['brownie', 'shake_vanilla'] },
    { name: 'Drinks', keys: ['cola', 'lemonade', 'iced_tea_peach', 'water_still'] },
  ],
  products: [
    {
      key: 'signature_burger',
      name: 'Signature Burger',
      description:
        'The big, the mighty, our own exclusive burger! Brioche bun, 2 beef patties, American cheese slices, onions, sliced pickles.',
      photo: '1568901346375-23c9450c58cd',
      price: 1050,
      isPopular: true,
      configurable: true,
    },
    {
      key: 'chicago_bacon',
      name: 'Chicago Bacon',
      description: 'Brioche bun, 2 beef patties, extra crispy bacon, smoked barbecue sauce.',
      photo: '1550317138-10000687a72b',
      price: 1450,
      isPopular: true,
      configurable: true,
    },
    {
      key: 'veggie_stack',
      name: 'Veggie Stack',
      description: 'Grilled halloumi, roasted peppers, rocket and garlic mayo.',
      photo: '1520072959219-c595dc870360',
      price: 990,
    },
    {
      key: 'crispy_wrap',
      name: 'Crispy Chicken Wrap',
      description: 'Crispy chicken, lettuce, tomato and garlic mayo in a warm tortilla.',
      photo: '1626700051175-6818013e1d4f',
      price: 890,
    },
    {
      key: 'fries',
      name: 'Fries',
      description: 'Skin-on fries, lightly salted.',
      photo: '1573080496219-bb080dd4f877',
      price: 350,
    },
    {
      key: 'onion_rings',
      name: 'Onion Rings',
      description: 'Beer-battered, six to a portion.',
      photo: '1639024471283-03518883512d',
      price: 420,
    },
    {
      key: 'cola',
      name: 'Cola, 330ml',
      description: 'Served chilled.',
      photo: '1554866585-cd94860890b7',
      price: 250,
    },
    {
      key: 'lemonade',
      name: 'Cloudy Lemonade',
      description: 'Pressed lemons, lightly sparkling.',
      photo: '1621263764928-df1444c5e859',
      price: 320,
    },
    {
      key: 'smash_double',
      name: 'Double Smash',
      description: 'Two thin-pressed patties, American cheese, burger sauce, pickles.',
      photo: '1572802419224-296b0aeee0d9',
      price: 1250,
      isPopular: true,
      configurable: true,
    },
    {
      key: 'buttermilk_chicken',
      name: 'Buttermilk Chicken Burger',
      description: 'Buttermilk-brined thigh, slaw and chipotle mayo in a toasted bun.',
      photo: '1606755962773-d324e0a13086',
      price: 1190,
      configurable: true,
    },
    {
      key: 'blue_cheese_burger',
      name: 'Blue Cheese & Onion',
      description: 'Beef patty, melted blue cheese, slow-cooked onions, peppery rocket.',
      photo: '1550547660-d9450f859349',
      price: 1320,
    },
    {
      key: 'wings_six',
      name: 'Buffalo Wings, 6 pieces',
      description: 'Tossed in hot sauce, with a blue cheese dip.',
      photo: '1608039755401-742074f0548d',
      price: 790,
    },
    {
      key: 'chicken_tenders',
      name: 'Chicken Tenders',
      description: 'Five breaded strips with honey mustard.',
      photo: '1562967914-608f82629710',
      price: 850,
    },
    {
      key: 'loaded_fries',
      name: 'Loaded Fries',
      description: 'Fries under melted cheese, bacon and spring onion.',
      photo: '1585109649139-366815a0d713',
      price: 650,
      isPopular: true,
    },
    {
      key: 'slaw',
      name: 'House Slaw',
      description: 'Crisp cabbage and carrot in a light buttermilk dressing.',
      photo: '1625944230945-1b7dd3b949ab',
      price: 320,
    },
    {
      key: 'mac_bites',
      name: 'Mac & Cheese Bites',
      description: 'Six crumbed bites with a smoked ketchup dip.',
      photo: '1543339494-b4cd4f7ba686',
      price: 590,
    },
    {
      key: 'brownie',
      name: 'Fudge Brownie',
      description: 'Warm, dense and properly chocolatey.',
      photo: '1606313564200-e75d5e30476c',
      price: 480,
    },
    {
      key: 'shake_vanilla',
      name: 'Vanilla Shake',
      description: 'Thick, made with real vanilla ice cream.',
      photo: '1572490122747-3968b75cc699',
      price: 540,
    },
    {
      key: 'iced_tea_peach',
      name: 'Peach Iced Tea',
      description: 'Brewed, chilled and lightly sweetened.',
      photo: '1499638673689-79a0b5115d87',
      price: 330,
    },
    {
      key: 'water_still',
      name: 'Still Water, 500ml',
      description: 'Maltese spring water.',
      photo: '1560023907-5f339617ea30',
      price: 180,
    },
  ],
};

const ASIAN_MENU: MenuTemplate = {
  sections: [
    { name: 'Most ordered', keys: ['pho_bo', 'banh_mi', 'spring_rolls', 'pad_thai'] },
    { name: 'Noodles', keys: ['pho_bo', 'pad_thai', 'bun_cha', 'drunken_noodles', 'ramen_shoyu'] },
    { name: 'Rice', keys: ['nasi_goreng', 'chicken_katsu_curry', 'crispy_tofu_rice'] },
    { name: 'Small plates', keys: ['spring_rolls', 'gyoza', 'edamame', 'prawn_crackers', 'satay_skewers'] },
    { name: 'Drinks', keys: ['iced_tea', 'coconut_water', 'jasmine_tea'] },
  ],
  products: [
    {
      key: 'pho_bo',
      name: 'Pho Bo',
      description: 'Slow-simmered beef broth, rice noodles, brisket, herbs and lime.',
      photo: '1559314809-0d155014e29e',
      price: 1200,
      isPopular: true,
      configurable: true,
    },
    {
      key: 'pad_thai',
      name: 'Pad Thai',
      description: 'Wok-fried rice noodles, egg, peanuts and tamarind.',
      photo: '1551183053-bf91a1d81141',
      price: 1350,
      isPopular: true,
    },
    {
      key: 'banh_mi',
      name: 'Banh Mi',
      description: 'Crackly baguette, pork belly, pickled carrot and coriander.',
      photo: '1626700051175-6818013e1d4f',
      price: 950,
      isPopular: true,
    },
    {
      key: 'spring_rolls',
      name: 'Spring Rolls',
      description: 'Four rolls with a sweet chilli dip.',
      photo: '1476224203421-9ac39bcb3327',
      price: 600,
    },
    {
      key: 'gyoza',
      name: 'Chicken Gyoza',
      description: 'Pan-fried dumplings, six to a portion.',
      photo: '1546069901-ba9599a7e63c',
      price: 1000,
    },
    {
      key: 'iced_tea',
      name: 'Vietnamese Iced Tea',
      description: 'Strong, sweet and very cold.',
      photo: '1621263764928-df1444c5e859',
      price: 380,
    },
    {
      key: 'bun_cha',
      name: 'Bun Cha',
      description: 'Grilled pork, rice noodles, herbs and a dipping broth.',
      photo: '1582878826629-29b7ad1cdc43',
      price: 1290,
      configurable: true,
    },
    {
      key: 'drunken_noodles',
      name: 'Drunken Noodles',
      description: 'Wide rice noodles, chilli, basil and a hot wok.',
      photo: '1626804475297-41608ea09aeb',
      price: 1190,
    },
    {
      key: 'ramen_shoyu',
      name: 'Shoyu Ramen',
      description: 'Soy-based broth, chashu pork, soft egg and spring onion.',
      photo: '1591814468924-caf88d1232e1',
      price: 1390,
      isPopular: true,
    },
    {
      key: 'nasi_goreng',
      name: 'Nasi Goreng',
      description: 'Fried rice with prawns, chicken and a fried egg on top.',
      photo: '1603133872878-684f208fb84b',
      price: 1150,
    },
    {
      key: 'chicken_katsu_curry',
      name: 'Chicken Katsu Curry',
      description: 'Panko chicken, mild curry sauce and steamed rice.',
      photo: '1569718212165-3a8278d5f624',
      price: 1250,
      isPopular: true,
    },
    {
      key: 'crispy_tofu_rice',
      name: 'Crispy Tofu Rice Bowl',
      description: 'Glazed tofu, pickled vegetables and sesame rice.',
      photo: '1540189549336-e6e99c3679fe',
      price: 1050,
    },
    {
      key: 'edamame',
      name: 'Edamame',
      description: 'Steamed and salted.',
      photo: '1564834724105-918b73d1b9e0',
      price: 420,
    },
    {
      key: 'prawn_crackers',
      name: 'Prawn Crackers',
      description: 'With a sweet chilli dip.',
      photo: '1626200419199-391ae4be7a41',
      price: 350,
    },
    {
      key: 'satay_skewers',
      name: 'Chicken Satay Skewers',
      description: 'Four skewers with peanut sauce.',
      photo: '1529563021893-cc83c992d75d',
      price: 790,
    },
    {
      key: 'coconut_water',
      name: 'Fresh Orange Juice',
      description: 'Squeezed to order, served over ice.',
      photo: '1600271886742-f049cd451bba',
      price: 390,
    },
    {
      key: 'jasmine_tea',
      name: 'Jasmine Tea',
      description: 'Served hot in a small pot.',
      photo: '1556881286-fc6915169721',
      price: 300,
    },
  ],
};

const PIZZA_MENU: MenuTemplate = {
  sections: [
    { name: 'Most ordered', keys: ['margherita', 'diavola', 'garlic_bread', 'prosciutto_funghi'] },
    {
      name: 'Pizza',
      keys: ['margherita', 'diavola', 'quattro_formaggi', 'prosciutto_funghi', 'vegetariana', 'calzone_classico'],
    },
    { name: 'Pasta', keys: ['carbonara', 'penne_arrabbiata'] },
    { name: 'Sides', keys: ['garlic_bread', 'rocket_salad', 'olives_marinated'] },
    { name: 'Desserts', keys: ['tiramisu', 'panna_cotta'] },
  ],
  products: [
    {
      key: 'margherita',
      name: 'Margherita',
      description: 'San Marzano tomato, fior di latte and basil.',
      photo: '1574071318508-1cdbab80d002',
      price: 900,
      isPopular: true,
      configurable: true,
    },
    {
      key: 'diavola',
      name: 'Diavola',
      description: 'Spicy salami, tomato, mozzarella and chilli oil.',
      photo: '1513104890138-7c749659a591',
      price: 1150,
      isPopular: true,
      configurable: true,
    },
    {
      key: 'quattro_formaggi',
      name: 'Quattro Formaggi',
      description: 'Mozzarella, gorgonzola, parmesan and pecorino.',
      photo: '1565299624946-b28f40a0ae38',
      price: 1250,
    },
    {
      key: 'garlic_bread',
      name: 'Garlic Bread',
      description: 'Wood-fired, with garlic butter and parsley.',
      photo: '1573080496219-bb080dd4f877',
      price: 450,
      isPopular: true,
    },
    {
      key: 'rocket_salad',
      name: 'Rocket & Parmesan Salad',
      description: 'Peppery leaves, shaved parmesan, lemon dressing.',
      photo: '1546069901-ba9599a7e63c',
      price: 620,
    },
    {
      key: 'prosciutto_funghi',
      name: 'Prosciutto e Funghi',
      description: 'Tomato, mozzarella, cooked ham and mushrooms.',
      photo: '1571407970349-bc81e7e96d47',
      price: 1290,
      isPopular: true,
      configurable: true,
    },
    {
      key: 'vegetariana',
      name: 'Vegetariana',
      description: 'Courgette, peppers, red onion and olives.',
      photo: '1511689660979-10d2b1aada49',
      price: 1190,
    },
    {
      key: 'calzone_classico',
      name: 'Calzone Classico',
      description: 'Folded and baked, with ham, ricotta and mozzarella.',
      photo: '1536964549204-cce9eab227bd',
      price: 1350,
    },
    {
      key: 'carbonara',
      name: 'Spaghetti Carbonara',
      description: 'Guanciale, egg yolk, pecorino and black pepper.',
      photo: '1612874742237-6526221588e3',
      price: 1250,
      isPopular: true,
    },
    {
      key: 'penne_arrabbiata',
      name: 'Penne Arrabbiata',
      description: 'Tomato, garlic and a proper amount of chilli.',
      photo: '1563379926898-05f4575a45d8',
      price: 1090,
    },
    {
      key: 'olives_marinated',
      name: 'Marinated Olives',
      description: 'With orange peel and rosemary.',
      photo: '1611171711912-e3f6b536f532',
      price: 420,
    },
    {
      key: 'tiramisu',
      name: 'Tiramisu',
      description: 'Made in-house, properly soaked.',
      photo: '1571877227200-a0d98ea607e9',
      price: 590,
    },
    {
      key: 'panna_cotta',
      name: 'Panna Cotta',
      description: 'Vanilla set cream with a berry compote.',
      photo: '1488477181946-6428a0291777',
      price: 550,
    },
  ],
};

const CAFE_MENU: MenuTemplate = {
  sections: [
    { name: 'Most ordered', keys: ['breakfast_sandwich', 'raspberry_cake', 'flat_white'] },
    { name: 'Breakfast', keys: ['breakfast_sandwich', 'porridge'] },
    { name: 'Bakery', keys: ['raspberry_cake', 'croissant'] },
    { name: 'Coffee', keys: ['flat_white', 'filter_coffee'] },
  ],
  products: [
    {
      key: 'breakfast_sandwich',
      name: 'Breakfast Sandwich',
      description: 'Free-range egg, smoked bacon and tomato relish in a soft roll.',
      photo: '1559054663-e8d23213f55c',
      price: 949,
      isPopular: true,
      configurable: true,
    },
    {
      key: 'porridge',
      name: 'Malted Oat Porridge',
      description: 'Rolled oats, toasted seeds and honey.',
      photo: '1484723091739-30a097e8f929',
      price: 650,
    },
    {
      key: 'raspberry_cake',
      name: 'Raspberry Pistachio Cake',
      description: 'Three layers, cut generously.',
      photo: '1565958011703-44f9829ba187',
      price: 580,
      isPopular: true,
    },
    {
      key: 'croissant',
      name: 'Butter Croissant',
      description: 'Baked this morning.',
      photo: '1573080496219-bb080dd4f877',
      price: 320,
    },
    {
      key: 'flat_white',
      name: 'Flat White',
      description: 'Double ristretto, steamed milk.',
      photo: '1621263764928-df1444c5e859',
      price: 340,
      isPopular: true,
    },
    {
      key: 'filter_coffee',
      name: 'Filter Coffee',
      description: 'Rotating single origin.',
      photo: '1521302080334-4bebac2763a6',
      price: 280,
    },
  ],
};

const MARKET_MENU: MenuTemplate = {
  sections: [
    { name: 'Most ordered', keys: ['toilet_paper', 'coke_can', 'bananas', 'coke_6pack'] },
    { name: 'New', keys: ['toilet_paper', 'coke_can'] },
    { name: 'Fresh produce', keys: ['bananas', 'avocado', 'tomatoes'] },
    { name: 'Everyday essentials', keys: ['milk', 'bread', 'coffee'] },
  ],
  products: [
    {
      key: 'toilet_paper',
      name: 'Tana Toilet Paper, 10+2 Free · 12 pcs',
      description: '3-ply, soft and strong.',
      photo: '1584556812952-905ffd0c611a',
      price: 355,
      originalPrice: 425,
      unitPrice: 30,
      unitLabel: 'pc',
      isPopular: true,
    },
    {
      key: 'coke_can',
      name: 'Coca-Cola Original Taste, 330ml',
      description: 'Chilled and ready to drink.',
      photo: '1554866585-cd94860890b7',
      price: 95,
      unitPrice: 288,
      unitLabel: 'l',
      isPopular: true,
    },
    {
      key: 'bananas',
      name: 'Fresh Bananas, 1kg',
      description: 'Go fresh',
      photo: '1571771894821-ce9b6c11b08e',
      price: 189,
      originalPrice: 229,
      unitPrice: 189,
      unitLabel: 'kg',
      isPopular: true,
    },
    {
      key: 'coke_6pack',
      name: 'Coca-Cola Cans, 6 × 330ml',
      description: 'Multipack.',
      photo: '1622483767028-3f66f32aef97',
      price: 540,
      originalPrice: 570,
      unitPrice: 273,
      unitLabel: 'l',
      isPopular: true,
    },
    {
      key: 'avocado',
      name: 'Ripe Avocados, 2 pcs',
      description: 'Ready to eat.',
      photo: '1584680226833-0d680d0a0794',
      price: 249,
      unitPrice: 125,
      unitLabel: 'pc',
    },
    {
      key: 'tomatoes',
      name: 'Vine Tomatoes, 500g',
      description: 'Grown in Malta.',
      photo: '1466637574441-749b8f19452f',
      price: 179,
      unitPrice: 358,
      unitLabel: 'kg',
    },
    {
      key: 'milk',
      name: 'Fresh Whole Milk, 1L',
      description: 'Pasteurised.',
      photo: '1550583724-b2692b85b150',
      price: 129,
      unitPrice: 129,
      unitLabel: 'l',
    },
    {
      key: 'bread',
      name: 'Maltese Sourdough Loaf',
      description: 'Baked daily.',
      photo: '1573080496219-bb080dd4f877',
      price: 220,
    },
    {
      key: 'coffee',
      name: 'Lavazza Ground Coffee, 250g',
      description: 'Medium roast.',
      photo: '1621263764928-df1444c5e859',
      price: 449,
      originalPrice: 529,
      unitPrice: 1796,
      unitLabel: 'kg',
    },
  ],
};

/** Picks a menu from the merchant's tags, falling back per kind. */
function templateFor(merchant: Merchant): MenuTemplate {
  if (merchant.kind === 'market') {
    return MARKET_MENU;
  }
  const tags = merchant.tags.map(tag => tag.toLowerCase());
  if (tags.some(tag => ['pizza', 'italian'].includes(tag))) {
    return PIZZA_MENU;
  }
  if (tags.some(tag => ['vietnamese', 'noodles', 'asian'].includes(tag))) {
    return ASIAN_MENU;
  }
  if (tags.some(tag => ['breakfast', 'bakery', 'coffee'].includes(tag))) {
    return CAFE_MENU;
  }
  return BURGER_MENU;
}

/* ------------------------------- options -------------------------------- */

/**
 * Shared "build your own" groups, attached to any configurable item. Ids are
 * namespaced per product so two products' selections never collide.
 */
function buildOptionGroups(productId: ProductId): readonly ProductOptionGroup[] {
  const group = (suffix: string) => `${productId}__${suffix}` as OptionGroupId;
  const option = (suffix: string) => `${productId}__${suffix}` as OptionId;

  return [
    {
      id: group('size'),
      name: 'Size',
      minSelections: 1,
      maxSelections: 1,
      options: [
        { id: option('regular'), name: 'Regular', priceDelta: 0, isAvailable: true },
        { id: option('large'), name: 'Large', priceDelta: 250, isAvailable: true },
      ],
    },
    {
      id: group('extras'),
      name: 'Extra Toppings',
      minSelections: 0,
      maxSelections: 5,
      options: [
        { id: option('cheese'), name: 'Extra Cheese', priceDelta: 150, isAvailable: true },
        { id: option('onions'), name: 'Crispy Onions', priceDelta: 100, isAvailable: true },
        { id: option('pickles'), name: 'Sliced Pickles', priceDelta: 75, isAvailable: true },
        { id: option('protein'), name: 'Extra Protein', priceDelta: 400, isAvailable: true },
        { id: option('salad'), name: 'Extra Salad', priceDelta: 50, isAvailable: true },
      ],
    },
    {
      id: group('remove'),
      name: 'Remove Toppings',
      minSelections: 0,
      maxSelections: 3,
      options: [
        { id: option('no_onions'), name: 'No onions', priceDelta: 0, isAvailable: true },
        { id: option('no_pickles'), name: 'No pickles', priceDelta: 0, isAvailable: true },
        { id: option('no_sauce'), name: 'No sauce', priceDelta: 0, isAvailable: true },
      ],
    },
  ];
}

const OFFERS_BY_KIND: Record<Merchant['kind'], readonly Offer[]> = {
  restaurant: [
    { id: 'of_40', kind: 'discount', title: '40% discount on selected items', detail: 'Show details' },
    { id: 'of_box', kind: 'gift', title: 'Claim €5 Box for 2', detail: 'Show details' },
  ],
  market: [
    { id: 'of_b3', kind: 'discount', title: 'Buy 3 and save 30%', detail: 'Back to School' },
    { id: 'of_lavazza', kind: 'discount', title: '3+1 on coffee', detail: 'Lavazza' },
  ],
};

/* ------------------------------ chain data ------------------------------ */

type LocationSeed = {
  id: string;
  name: string;
  address: string;
  rating: number;
  min: number;
  max: number;
  offerLabel?: string;
  isOpen?: boolean;
};

const location =
  (photoId: string, tagline: string, tag: string) =>
  (seed: LocationSeed): { merchant: Merchant; address: string } => ({
    merchant: {
      id: seed.id as MerchantId,
      kind: 'restaurant',
      name: seed.name,
      tagline,
      imageUrl: img(photoId, 600),
      logoUrl: img(photoId, 200),
      rating: seed.rating,
      deliveryFee: 0,
      deliveryMinMinutes: seed.min,
      deliveryMaxMinutes: seed.max,
      minOrder: 800,
      isOpen: seed.isOpen ?? true,
      closesAt: (seed.isOpen ?? true) ? '23:00' : undefined,
      offerLabel: seed.offerLabel,
      tags: [tag],
    },
    address: seed.address,
  });

const kfcLocation = location('1626082927389-6cd097cdc6ec', 'Finger lickin good.', 'Chicken');
const mcdLocation = location('1552526881-721ce8509abb', "I'm lovin it.", 'Burgers');
const burgerLocation = location('1568901346375-23c9450c58cd', 'Burgers, done properly.', 'Burgers');

export const MOCK_CHAIN_DETAILS: Record<string, ChainDetail> = {
  ch_kfc: {
    chain: {
      id: 'ch_kfc' as ChainId,
      name: 'KFC',
      logoUrl: img('1626082927389-6cd097cdc6ec', 200),
      locationCount: 4,
    },
    heroImageUrl: img('1626082927389-6cd097cdc6ec', 900),
    description: 'Compare delivery times and find the closest spot for your next order.',
    locations: [
      kfcLocation({ id: 'm_kfc_valletta', name: 'KFC Valletta', address: '12 Triq Hal Taxien, Valletta', rating: 8.5, min: 15, max: 25, offerLabel: '2x5 off' }),
      kfcLocation({ id: 'm_kfc_sliema', name: 'KFC Sliema', address: '13 Triq Hal Taxien, Sliema', rating: 8.7, min: 25, max: 35, offerLabel: 'Free delivery' }),
      kfcLocation({ id: 'm_kfc_gzira', name: 'KFC Gzira', address: '14 Triq Hal Taxien, Gzira', rating: 8.9, min: 35, max: 45, offerLabel: '€10 off' }),
      kfcLocation({ id: 'm_kfc_birkirkara', name: 'KFC Birkirkara', address: '16 Triq Hal Taxien, Birkirkara', rating: 8.4, min: 40, max: 55, isOpen: false }),
    ],
  },

  ch_mcdonalds: {
    chain: {
      id: 'ch_mcdonalds' as ChainId,
      name: 'McDonalds',
      logoUrl: img('1552526881-721ce8509abb', 200),
      locationCount: 3,
    },
    heroImageUrl: img('1552526881-721ce8509abb', 900),
    description: 'Compare delivery times and find the closest spot for your next order.',
    locations: [
      mcdLocation({ id: 'm_mcd_valletta', name: 'McDonalds Valletta', address: '4 Republic Street, Valletta', rating: 8.2, min: 15, max: 25, offerLabel: 'Free delivery' }),
      mcdLocation({ id: 'm_mcd_sliema', name: 'McDonalds Sliema', address: '9 Tower Road, Sliema', rating: 8.6, min: 20, max: 30, offerLabel: '20% off' }),
      mcdLocation({ id: 'm_mcd_mosta', name: 'McDonalds Mosta', address: '21 Constitution Street, Mosta', rating: 8.1, min: 35, max: 50, isOpen: false }),
    ],
  },

  ch_burger_oclock: {
    chain: {
      id: 'ch_burger_oclock' as ChainId,
      name: "Burger O'Clock",
      logoUrl: img('1568901346375-23c9450c58cd', 200),
      locationCount: 3,
    },
    heroImageUrl: img('1568901346375-23c9450c58cd', 900),
    description: 'Compare delivery times and find the closest spot for your next order.',
    locations: [
      burgerLocation({ id: 'm_burger_oclock', name: "Burger O'Clock Valletta", address: '12 Triq Hal Taxien, Valletta', rating: 9.1, min: 20, max: 30, offerLabel: '40% off' }),
      burgerLocation({ id: 'm_burger_gzira', name: "Burger O'Clock Gzira", address: '7 The Strand, Gzira', rating: 8.8, min: 30, max: 40 }),
      burgerLocation({ id: 'm_burger_rabat', name: "Burger O'Clock Rabat", address: '3 Saqqajja Square, Rabat', rating: 8.5, min: 45, max: 60, isOpen: false }),
    ],
  },
};

export const MOCK_CHAINS: readonly Chain[] = Object.values(MOCK_CHAIN_DETAILS).map(d => d.chain);

/* ----------------------------- the registry ----------------------------- */

/** Every merchant the app can reach: the feed's own plus every chain branch. */
const ALL_MERCHANTS: readonly Merchant[] = [
  ...MOCK_MERCHANTS,
  ...Object.values(MOCK_CHAIN_DETAILS).flatMap(detail => detail.locations.map(l => l.merchant)),
];

const ADDRESS_BY_MERCHANT = new Map(
  Object.values(MOCK_CHAIN_DETAILS)
    .flatMap(detail => detail.locations)
    .map(l => [l.merchant.id as string, l.address]),
);

function buildDetail(merchant: Merchant): MerchantDetail {
  const template = templateFor(merchant);

  const productFor = (key: string): Product => {
    const t = template.products.find(p => p.key === key)!;
    return {
      // Namespaced, so the same dish at two branches is two distinct products.
      id: `${merchant.id}__${t.key}` as ProductId,
      merchantId: merchant.id,
      name: t.name,
      description: t.description,
      imageUrl: img(t.photo, 700),
      price: t.price,
      originalPrice: t.originalPrice,
      unitPrice: t.unitPrice,
      unitLabel: t.unitLabel,
      isPopular: t.isPopular ?? false,
    };
  };

  const built: readonly MenuSection[] = template.sections.map((section, index) => ({
    id: `${merchant.id}__s${index}` as SectionId,
    name: section.name,
    products: section.keys.map(productFor),
  }));

  // "Most ordered" is a shortcut, not a part of the menu — it gets its own rail
  // above the tabs, so the tabs list only real categories and nothing appears
  // in two of them.
  const popular = built.find(section => section.name === POPULAR_SECTION);
  const sections = built.filter(section => section.name !== POPULAR_SECTION);

  const isRestaurant = merchant.kind === 'restaurant';

  return {
    merchant,
    offers: OFFERS_BY_KIND[merchant.kind],
    popular: popular?.products ?? [],
    sections,
    acceptsReservations: isRestaurant,
    supportsPickup: isRestaurant,
    pickupMinMinutes: 10,
    pickupMaxMinutes: 25,
    address: ADDRESS_BY_MERCHANT.get(merchant.id) ?? 'Triq il-Kbira, Valletta',
  };
}

/** Built once at load, so every merchant has a full, browsable menu. */
export const MOCK_MERCHANT_DETAILS: Record<string, MerchantDetail> = Object.fromEntries(
  ALL_MERCHANTS.map(merchant => [merchant.id, buildDetail(merchant)]),
);

export const ALL_LISTED_MERCHANTS = ALL_MERCHANTS;

/**
 * Flat product index, so a product page resolves from any merchant.
 *
 * Deduplicated by id: a dish legitimately appears in more than one section
 * ("Most ordered" and "Burgers"), and search must not return it twice.
 */
export const ALL_PRODUCTS: readonly Product[] = Array.from(
  new Map(
    Object.values(MOCK_MERCHANT_DETAILS)
      .flatMap(detail => detail.sections.flatMap(section => section.products))
      .map(product => [product.id, product]),
  ).values(),
);

const CONFIGURABLE_KEYS = new Set(
  [BURGER_MENU, ASIAN_MENU, PIZZA_MENU, CAFE_MENU]
    .flatMap(menu => menu.products)
    .filter(p => p.configurable)
    .map(p => p.key),
);

/** Option groups for a product, or none for a straight-to-basket item. */
export function optionGroupsForProduct(productId: ProductId): readonly ProductOptionGroup[] {
  const key = String(productId).split('__')[1];
  return CONFIGURABLE_KEYS.has(key) ? buildOptionGroups(productId) : [];
}
