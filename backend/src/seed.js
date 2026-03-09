// Seed script — populates the database with sample data for development/demo.
// Run with: node src/seed.js

const dotenv = require('dotenv');
dotenv.config();

const db = require('./models/db');

const shops = [
    { name: 'Agrifoods (Pvt) Ltd', address: '14 Coventry Rd, Workington, Harare', phone: '+263 242 756 231', lat: -17.8292, lng: 31.0522 },
    { name: 'Farm & City Centre', address: 'Corner Julius Nyerere Way & Jason Moyo Ave, Harare', phone: '+263 242 791 681', lat: -17.8319, lng: 31.0480 },
    { name: 'ZFC Limited — Msasa Depot', address: 'Mutare Rd, Msasa, Harare', phone: '+263 242 487 021', lat: -17.8180, lng: 31.1120 },
    { name: 'Windmill (Pvt) Ltd', address: '19 Dagenham Rd, Willowvale, Harare', phone: '+263 242 661 651', lat: -17.8550, lng: 31.0210 },
    { name: 'Cropserve Zimbabwe', address: '32 The Chase, Mt Pleasant, Harare', phone: '+263 242 335 445', lat: -17.7920, lng: 31.0490 },
    { name: 'Sable Chemical Industries', address: 'Leopard Rock Rd, Kwekwe', phone: '+263 55 222 60', lat: -18.9280, lng: 29.8140 },
    { name: 'Agriseeds (Pvt) Ltd', address: '22a Borrowdale Rd, Harare', phone: '+263 242 886 990', lat: -17.7848, lng: 31.0670 },
    { name: 'National Tested Seeds', address: '6 Endeavour Cres, Msasa, Harare', phone: '+263 242 487 811', lat: -17.8150, lng: 31.1050 },
    { name: 'Kutsaga Research Station Shop', address: 'Airport Rd, Harare', phone: '+263 242 575 289', lat: -17.8050, lng: 31.0920 },
    { name: 'Farmers World Bulawayo', address: 'Lobengula St, Bulawayo CBD', phone: '+263 29 261 671', lat: -20.1500, lng: 28.5800 },
    { name: 'Manica Board & Hardware', address: 'Main St, Mutare CBD', phone: '+263 20 264 111', lat: -18.9710, lng: 32.6709 },
    { name: 'Chiredzi Agro-Dealers', address: '14 Chipinga Rd, Chiredzi', phone: '+263 31 224 55', lat: -21.0500, lng: 31.6700 }
];

const articles = [
    {
        title: 'Getting Started with Maize Farming in Zimbabwe',
        content: `Maize is Zimbabwe's staple crop, grown by over 70% of smallholder farmers. This guide covers everything you need to know to get started.\n\n## Land Preparation\nBegin land preparation 2-3 weeks before the expected onset of rains (usually mid-November). Clear all weeds and crop residue. Deep plough to 20-25cm depth to break up compacted soil and improve water infiltration.\n\n## Seed Selection\nChoose certified seed varieties suited to your agro-ecological region:\n- **Region II (Harare, Mashonaland):** SC513, SC637, PAN 53 (120-140 day varieties)\n- **Region III (Midlands):** SC403, SC513 (110-130 day varieties)\n- **Region IV-V (South):** SC303, early-maturing varieties\n\n## Planting\n- **Spacing:** 90cm between rows, 25-30cm between plants\n- **Depth:** 5-7cm deep\n- **Population:** 37,000-44,000 plants per hectare\n- **Timing:** Plant within 2 weeks of first effective rains\n\n## Fertilization\nApply compound D (8:14:7) at planting: 200-300 kg/ha. Top-dress with Ammonium Nitrate (AN) at knee-height: 150-200 kg/ha.\n\n## Weed Management\nCritical period is first 6 weeks. Options:\n- Hand weeding at 2-3 weeks and 5-6 weeks\n- Pre-emergence herbicide (Atrazine): apply within 3 days of planting\n- Post-emergence: Nicosulfuron at 2-3 leaf stage of weeds`,
        category: 'crops',
        crop_types: ['maize'],
        image_url: 'https://images.unsplash.com/photo-1601593768498-bda29cbfcf01?w=400'
    },
    {
        title: 'Tomato Growing Guide: From Seedbed to Harvest',
        content: `Tomatoes are one of the most profitable horticultural crops in Zimbabwe, with high demand year-round.\n\n## Nursery Management\nStart seeds in a protected seedbed 4-6 weeks before transplanting. Use a mixture of loam soil, compost, and river sand (2:1:1). Sow seeds in furrows 1cm deep, 10cm apart.\n\n## Transplanting\n- Transplant when seedlings have 4-6 true leaves (about 15cm tall)\n- Space 60cm between plants, 90-120cm between rows\n- Transplant in the evening or on cloudy days to reduce transplant shock\n- Water immediately after transplanting\n\n## Staking & Pruning\nStake plants when 30cm tall using 1.5m wooden stakes. Tie stems loosely with soft twine. Remove side shoots (suckers) to maintain 2-3 main stems.\n\n## Irrigation\nTomatoes need 25-30mm water per week. Use drip irrigation for best results — reduces disease pressure. Avoid wetting leaves. Mulch with straw to conserve moisture.\n\n## Pest & Disease Management\n- **Red spider mite:** Apply Abamectin when first spotted\n- **Tuta absoluta:** Use pheromone traps and Spinosad\n- **Early blight:** Preventive Mancozeb sprays every 10-14 days\n- **Bacterial wilt:** No cure — remove and destroy infected plants`,
        category: 'crops',
        crop_types: ['tomato'],
        image_url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400'
    },
    {
        title: 'Understanding Soil Health: A Zimbabwean Farmer\'s Guide',
        content: `Healthy soil is the foundation of successful farming. Zimbabwe's soils are predominantly sandy and granitic, requiring careful management.\n\n## Soil Types in Zimbabwe\n- **Sandy soils (Region IV-V):** Low water-holding capacity, need organic matter\n- **Red clay soils (Mashonaland):** Good fertility but can become waterlogged\n- **Kalahari sands (Matabeleland):** Very sandy, need heavy organic amendment\n\n## Soil Testing\nGet your soil tested at:\n- Chemistry & Soil Research Institute (Harare)\n- Soil Fertility Services (Department of Research)\nCost: ~$15-25 per sample. Test every 2-3 seasons.\n\n## Improving Soil Health\n1. **Crop rotation:** Alternate maize with legumes (soybean, groundnuts)\n2. **Cover crops:** Plant sun hemp or velvet beans in off-season\n3. **Manure:** Apply 5-10 tonnes/ha of well-decomposed cattle manure\n4. **Composting:** Make compost from crop residue, manure, and kitchen waste\n5. **Mulching:** Retain crop residue on soil surface\n6. **Liming:** Apply agricultural lime (dolomite) if pH is below 5.0`,
        category: 'soil',
        crop_types: ['maize', 'tomato', 'wheat', 'soybean'],
        image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400'
    },
    {
        title: 'Integrated Pest Management (IPM) for Smallholder Farms',
        content: `IPM combines multiple pest control methods to reduce chemical use while maintaining effective pest management.\n\n## Core IPM Principles\n1. **Prevention:** Healthy plants resist pests better\n2. **Monitoring:** Scout fields weekly, identify pests early\n3. **Thresholds:** Not every pest needs spraying — learn economic thresholds\n4. **Combination:** Use cultural, biological, and chemical methods together\n\n## Cultural Methods\n- Crop rotation breaks pest cycles\n- Intercropping (e.g., maize + beans) confuses pests\n- Timely planting helps crops establish before pest peaks\n- Field sanitation — remove and destroy crop residue\n\n## Biological Control\n- **Trichogramma wasps:** Parasitize stem borer eggs\n- **Ladybugs:** Eat aphids (100+ per day)\n- **Bt (Bacillus thuringiensis):** Biological insecticide for caterpillars\n- **Neem extract:** Broad-spectrum botanical pesticide\n\n## Chemical Control (Last Resort)\n- Always read the label before use\n- Wear protective clothing\n- Observe pre-harvest intervals\n- Rotate chemical classes to prevent resistance\n- Buy from registered dealers only`,
        category: 'pests',
        crop_types: ['maize', 'tomato', 'wheat', 'soybean'],
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'
    },
    {
        title: 'Water-Smart Farming: Irrigation Techniques for Dry Regions',
        content: `With rainfall becoming increasingly unpredictable, efficient water use is critical for Zimbabwe's farmers.\n\n## Drip Irrigation\nMost efficient method (90-95% efficiency). Delivers water directly to plant roots.\n- **Cost:** $800-1,500/ha for basic system\n- **Best for:** Tomatoes, peppers, leafy greens\n- **Tip:** Use a sand filter to prevent emitter clogging\n\n## Bucket Drip Kits\nAffordable option for small plots (100-200m²).\n- **Cost:** $30-50 per kit\n- **How:** Elevated bucket (1m high) gravity-feeds water through drip lines\n- **Capacity:** Waters 100 plants from one 20L bucket\n\n## Rainwater Harvesting\n- **Rooftop:** 1mm rainfall on 100m² roof = 100 litres\n- **In-field:** Tie ridges, planting basins, conservation agriculture\n- **Storage:** Ferro-cement tanks (5,000-10,000L) cost $200-400\n\n## Mulching for Moisture Conservation\nApply 5-10cm layer of:\n- Crop residue (maize stover, wheat straw)\n- Grass cuttings\n- Dried leaves\nReduces evaporation by 30-50% and keeps soil cool.`,
        category: 'irrigation',
        crop_types: ['maize', 'tomato', 'wheat'],
        image_url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400'
    },
    {
        title: 'Climate-Smart Agriculture: Adapting to Changing Weather',
        content: `Zimbabwe's climate is becoming more variable. Farmers must adapt their practices to remain productive.\n\n## Key Climate Trends\n- Shorter, more intense rainy seasons\n- More frequent mid-season dry spells\n- Higher temperatures (+1.5°C since 1960)\n- Shifting agro-ecological zones\n\n## Adaptation Strategies\n1. **Drought-tolerant varieties:** SC303, ZM521 (maize), TGX varieties (soybean)\n2. **Conservation Agriculture (CA):**\n   - Minimum tillage / rip-line planting\n   - Permanent soil cover (mulch)\n   - Crop rotation / intercropping\n3. **Early planting:** Plant within first effective rains\n4. **Multiple planting dates:** Stagger plantings to spread risk\n5. **Diversification:** Don't rely on one crop — grow maize, legumes, small grains\n\n## Small Grains as Climate Insurance\n- **Sorghum:** Survives on 400-600mm rainfall\n- **Pearl millet:** Most drought-tolerant cereal\n- **Finger millet:** Nutritious, stores well\n- **Rapoko:** Traditional, weather-resilient`,
        category: 'climate',
        crop_types: ['maize', 'soybean', 'wheat'],
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'
    },
    {
        title: 'Post-Harvest Handling: Reducing Losses and Adding Value',
        content: `Zimbabwe loses an estimated 20-30% of grain production after harvest. Proper post-harvest handling can significantly reduce these losses.\n\n## Drying\n- Dry maize to 12.5% moisture before storage\n- Use traditional drying: spread on clean tarpaulin in sun, turn regularly\n- Test moisture: bite a grain — if it cracks cleanly, it's dry enough\n- Solar dryers can reduce drying time by 50%\n\n## Storage\n- **Metal silos:** Best option, rat-proof, airtight (5-20 tonne capacity)\n- **Hermetic bags (PICS bags):** Kill insects through oxygen depletion, $2-3 each\n- **Traditional granaries:** Improve by raising off ground and applying ash\n\n## Pest Control in Storage\n- Actellic Super dust: apply at 50g per 90kg bag\n- Diatomaceous earth: organic alternative, safe for consumption\n- Smoking: traditional method, partially effective\n\n## Value Addition\n- **Grinding:** Produce mealie-meal for local market\n- **Peanut butter:** From groundnuts, high demand\n- **Dried vegetables:** Sun-dry leafy greens for off-season sale\n- **Packaging:** Attractive packaging increases selling price by 20-50%`,
        category: 'post-harvest',
        crop_types: ['maize', 'wheat', 'soybean'],
        image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400'
    },
    {
        title: 'Understanding Fertilizer: NPK and What Your Crops Need',
        content: `Proper fertilization is essential for good yields. Understanding what each nutrient does helps you make better decisions.\n\n## The Big Three: N-P-K\n- **Nitrogen (N):** Leaf growth, green colour, protein formation\n- **Phosphorus (P):** Root development, flowering, seed formation\n- **Potassium (K):** Disease resistance, water regulation, fruit quality\n\n## Common Fertilizers in Zimbabwe\n| Fertilizer | NPK Ratio | Use |\n|-----------|-----------|-----|\n| Compound D | 8:14:7 | Basal (at planting) |\n| Compound L | 5:18:10 | Tobacco, horticulture |\n| Compound S | 7:21:8 | Sugarcane |\n| AN (Ammonium Nitrate) | 34.5:0:0 | Top dressing |\n| Urea | 46:0:0 | Top dressing (use carefully) |\n| SSP (Single Super Phosphate) | 0:20:0 | Phosphorus boost |\n\n## Application Tips\n1. **Soil test first** — know what your soil actually needs\n2. **Band-place** compound fertilizer 5cm below and beside seed\n3. **Split top-dress** nitrogen: 50% at knee-height, 50% at tasseling\n4. **Don't mix** AN with seed — burns roots\n5. **Apply before rain** for best uptake`,
        category: 'soil',
        crop_types: ['maize', 'tomato', 'wheat', 'soybean', 'tobacco'],
        image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400'
    }
];

const diseases = [
    { name: 'Maize Streak Virus', scientific_name: 'Maize streak mastrevirus', affected_crops: ['maize'], symptoms: 'Yellow streaks along leaf veins, stunted growth, reduced cob size', treatment: 'Remove infected plants, control leafhoppers with Imidacloprid, apply foliar fertilizer', prevention: 'Plant MSV-tolerant varieties (SC513, SC637), early planting, eliminate weed hosts', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
    { name: 'Grey Leaf Spot', scientific_name: 'Cercospora zeae-maydis', affected_crops: ['maize'], symptoms: 'Rectangular grey-brown lesions on leaves parallel to veins', treatment: 'Apply Azoxystrobin fungicide at tasseling, remove crop residue', prevention: 'Crop rotation, resistant hybrids, reduce plant density', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
    { name: 'Early Blight', scientific_name: 'Alternaria solani', affected_crops: ['tomato', 'potato'], symptoms: 'Dark brown concentric ring spots on lower leaves, yellowing, fruit rot', treatment: 'Apply Chlorothalonil every 7-10 days, remove infected leaves, stake plants', prevention: 'Mulch, adequate spacing, drip irrigation, crop rotation', image_url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400' },
    { name: 'Late Blight', scientific_name: 'Phytophthora infestans', affected_crops: ['tomato', 'potato'], symptoms: 'Water-soaked dark lesions, white fuzzy growth on leaf undersides, rapid death', treatment: 'Apply Metalaxyl + Mancozeb every 5-7 days, remove infected parts', prevention: 'Resistant varieties, good drainage, avoid overhead irrigation', image_url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400' },
    { name: 'Wheat Rust', scientific_name: 'Puccinia triticina', affected_crops: ['wheat'], symptoms: 'Orange-brown pustules on leaf surfaces, reduced grain fill', treatment: 'Apply Propiconazole at flag leaf stage, foliar potassium', prevention: 'Rust-resistant varieties, sow early, avoid excess nitrogen', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
    { name: 'Soybean Rust', scientific_name: 'Phakopsora pachyrhizi', affected_crops: ['soybean'], symptoms: 'Small tan to brown lesions on lower leaves, premature defoliation', treatment: 'Apply Tebuconazole immediately, ensure canopy coverage, repeat after 14-21 days', prevention: 'Early-maturing varieties, early sowing, monitor sentinel plots', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
    { name: 'Tobacco Mosaic Virus', scientific_name: 'Tobacco mosaic virus (TMV)', affected_crops: ['tobacco'], symptoms: 'Mosaic pattern on leaves, leaf curling, stunted growth', treatment: 'Remove infected plants, wash hands with milk before handling, disinfect tools', prevention: 'TMV-resistant varieties, avoid tobacco use when handling plants, certified seedlings', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' }
];

async function seed() {
    console.log('🌱 Seeding Murimi database...\n');

    try {
        // Insert shops
        console.log('📍 Inserting shops...');
        for (const shop of shops) {
            await db.query(
                `INSERT INTO shops (name, address, phone_number, location_lat, location_lng)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
                [shop.name, shop.address, shop.phone, shop.lat, shop.lng]
            );
        }
        console.log(`   ✅ ${shops.length} shops inserted`);

        // Insert articles
        console.log('📚 Inserting articles...');
        for (const article of articles) {
            await db.query(
                `INSERT INTO articles (title, content, category, crop_types, image_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
                [article.title, article.content, article.category, article.crop_types, article.image_url]
            );
        }
        console.log(`   ✅ ${articles.length} articles inserted`);

        // Insert diseases
        console.log('🦠 Inserting diseases...');
        for (const disease of diseases) {
            await db.query(
                `INSERT INTO diseases (name, scientific_name, affected_crops, symptoms, treatment, prevention, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
                [disease.name, disease.scientific_name, disease.affected_crops, disease.symptoms, disease.treatment, disease.prevention, disease.image_url]
            );
        }
        console.log(`   ✅ ${diseases.length} diseases inserted`);

        console.log('\n🎉 Seed complete!');
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    }

    process.exit(0);
}

seed();
