const path = require('path');
const fs = require('fs');
const Product = require('./models/Product');
const { uploadLocalFileToCloudinary } = require('./config/cloudinary');

const rawCatalogItems = [
  // 1. ECG Machines
  {
    name: 'CardioWave 12-Channel ECG',
    category: 'ECG Machines',
    description: 'Hospital-grade 12-channel diagnostic electrocardiograph with automatic lead interpretation and DICOM connectivity.',
    specs: ['10.4" Color Touchscreen', 'Automatic Lead Interpretation', 'USB / DICOM', 'MD-42 Certified', 'Hospital Grade'],
    localFilename: 'ecg-12ch.jpg',
    inStock: true,
    displayOrder: 1,
  },
  {
    name: 'CardioCompact 3-Channel ECG',
    category: 'ECG Machines',
    description: 'Portable lightweight 3-channel ECG machine designed for outpatient departments, clinics, and emergency mobile units.',
    specs: ['Lightweight Portable Design', 'High-Resolution Thermal Print', 'Built-in Battery', 'MD-42 Certified', 'Portable / Clinic'],
    localFilename: 'ecg-3ch.jpg',
    inStock: true,
    displayOrder: 2,
  },
  {
    name: 'CardioStress Treadmill System',
    category: 'ECG Machines',
    description: 'Comprehensive cardiology exercise stress test system with heavy-duty medical treadmill and real-time ST segment analysis.',
    specs: ['Wireless Transmitter Box', 'Real-Time ST Segment Analysis', 'Heavy-Duty Medical Treadmill', 'MD-42 Certified', 'Stress Test'],
    localFilename: 'ecg-stress.jpg',
    inStock: true,
    displayOrder: 3,
  },
  {
    name: 'CardioTrac 24-Hour Holter Recorder',
    category: 'ECG Machines',
    description: 'Ultra-compact ambulatory Holter recorder offering 72h continuous multi-lead recording and AI arrhythmia detection suite.',
    specs: ['Ultra-Compact 3/12 Lead', '72h Continuous Recording', 'AI Analysis Suite', 'MD-42 Certified', 'Ambulatory'],
    localFilename: 'ecg-holter.jpg',
    inStock: true,
    displayOrder: 4,
  },

  // 2. Patient Monitors
  {
    name: 'ApexCare ICU Monitor 15"',
    category: 'Patient Monitors',
    description: 'High-acuity ICU and Operating Theater multi-parameter patient monitor with dual invasive blood pressure and EtCO2 readiness.',
    specs: ['15" Vibrant Touchscreen', 'ECG, SpO2, NIBP, 2-IBP, Resp, Temp, EtCO2 Ready', 'Central Station Sync', 'MD-42 Certified', 'ICU / OT'],
    localFilename: 'mon-icu15.jpg',
    inStock: true,
    displayOrder: 5,
  },
  {
    name: 'VitalEdge Bedside Monitor 12"',
    category: 'Patient Monitors',
    description: 'Dependable in-patient ward vital signs monitor with 120-hour trend data review and high-contrast anti-glare display.',
    specs: ['6-Standard Vital Parameters', '120h Trend Data Review', 'Anti-Glare Display', 'MD-42 Certified', 'In-Patient Ward'],
    localFilename: 'mon-bed12.jpg',
    inStock: true,
    displayOrder: 6,
  },
  {
    name: 'MobiSense Transport Monitor',
    category: 'Patient Monitors',
    description: 'Ruggedized shock-proof vital signs transport monitor built for ambulances, trauma transfers, and emergency rescue.',
    specs: ['Rugged Shock-Proof Housing', '6h Long-Life Li-ion Battery', 'Wireless Telemetry Syncing', 'MD-42 Certified', 'Ambulance & ER'],
    localFilename: 'mon-transport.jpg',
    inStock: true,
    displayOrder: 7,
  },
  {
    name: 'ApexCentral Monitoring Station',
    category: 'Patient Monitors',
    description: 'Dual-display centralized telemetry command hub capable of synchronizing and monitoring up to 64 acute care patient beds.',
    specs: ['Up to 64 Bed Central Display', 'Dual Clinical Screen Support', 'Real-Time Alarm Relay', 'MD-42 Certified', 'Telemetry'],
    localFilename: 'mon-cns.jpg',
    inStock: true,
    displayOrder: 8,
  },

  // 3. BP Monitors
  {
    name: 'ProCheck Clinical Digital BP',
    category: 'BP Monitors',
    description: 'Clinical desk sphygmomanometer featuring both oscillometric and auscultatory modes with dual cuff selections.',
    specs: ['Oscillometric & Auscultatory Modes', 'Dual Cuff Sizes Included', 'Shock Resistant Casing', 'MD-42 Certified', 'OPD / Clinic'],
    localFilename: 'bp-desk.jpg',
    inStock: true,
    displayOrder: 9,
  },
  {
    name: 'OmniBP 24h Ambulatory Monitor',
    category: 'BP Monitors',
    description: 'Whisper-quiet ambulatory blood pressure monitor for 24-hour circadian rhythm tracking and comprehensive PC diagnostic exports.',
    specs: ['Silent Linear Motor Pump', 'Circadian Rhythm Analysis', 'PC Software Export Suite', 'MD-42 Certified', 'Cardiology'],
    localFilename: 'bp-abpm.jpg',
    inStock: true,
    displayOrder: 10,
  },
  {
    name: 'StandPro Mobile Clinic BP Monitor',
    category: 'BP Monitors',
    description: 'Mobile clinical blood pressure monitor mounted on a heavy-duty 5-caster star base with an oversized backlit digital display.',
    specs: ['Heavy-Duty Rolling Base', 'Large Backlit LED Display', 'Battery & Mains Dual Power', 'MD-42 Certified', 'Hospital Ward'],
    localFilename: 'bp-stand.jpg',
    inStock: true,
    displayOrder: 11,
  },

  // 4. DVT Pumps
  {
    name: 'FlowGuard Dual-Chamber DVT Pump',
    category: 'DVT Pumps',
    description: 'Sequential gradient compression system for post-operative venous thrombosis prophylaxis in high-risk surgical ICU patients.',
    specs: ['Sequential Gradient Compression', 'Calf & Thigh Sleeve Support', 'Whisper Quiet Operation', 'MD-42 Certified', 'Surgical ICU'],
    localFilename: 'dvt-dual.jpg',
    inStock: true,
    displayOrder: 12,
  },
  {
    name: 'VenoFlow Portable Compression Unit',
    category: 'DVT Pumps',
    description: 'Compact portable deep vein thrombosis prevention pump with integrated tubing, visual pressure gauge, and bed rail mounts.',
    specs: ['Integrated Tubing System', 'Visual Pressure Gauge', '8h Continuous Battery Life', 'MD-42 Certified', 'Recovery Ward'],
    localFilename: 'dvt-port.jpg',
    inStock: true,
    displayOrder: 13,
  },
  {
    name: 'BioPress Pro Multi-Mode IPC System',
    category: 'DVT Pumps',
    description: 'Versatile intermittent pneumatic compression device with presets for foot, calf, and thigh therapy with smart alarm safety.',
    specs: ['Foot, Calf, Thigh Presets', 'Automatic Sleeve Recognition', 'Smart Pressure Alarms', 'MD-42 Certified', 'Orthopedic OT'],
    localFilename: 'dvt-sleeve.jpg',
    inStock: true,
    displayOrder: 14,
  },

  // 5. Fluid Warmers
  {
    name: 'ThermaFlow Blood & Infusion Warmer',
    category: 'Fluid Warmers',
    description: 'Precision dry-heat plate blood and intravenous fluid warming system featuring ultra-fast warmup and independent 39°C safety cutoffs.',
    specs: ['Dry-Heat Plate Technology', 'Fast 2-Min Warmup', '39°C Precise Safety Cutoff', 'MD-42 Certified', 'OT & Trauma'],
    localFilename: 'fw-blood.jpg',
    inStock: true,
    displayOrder: 15,
  },
  {
    name: 'RapidWarm High-Flow Infusion Warmer',
    category: 'Fluid Warmers',
    description: 'High-flow blood and IV fluid warmer engineered for emergency surgery and mass resuscitation with dual ultrasonic bubble detectors.',
    specs: ['High Flow Rate Up to 30,000 ml/h', 'Dual Sensor Redundancy', 'Air Bubble Detector', 'MD-42 Certified', 'Emergency & OT'],
    localFilename: 'fw-rapid.jpg',
    inStock: true,
    displayOrder: 16,
  },
  {
    name: 'TempGrip Compact IV Line Warmer',
    category: 'Fluid Warmers',
    description: 'Snap-on inline IV tubing warmer with digital real-time temperature readout, lightweight pole mount, and micro-controlled heating.',
    specs: ['Direct Tubing Snap-in', 'Digital Temperature Readout', 'Lightweight Pole Mount', 'MD-42 Certified', 'ICU / Recovery'],
    localFilename: 'fw-port.jpg',
    inStock: true,
    displayOrder: 17,
  },
];

// Locate local image file across common project folders
const findLocalImageFile = (filename) => {
  const searchPaths = [
    path.join(__dirname, 'uploads', filename),
    path.join(__dirname, '..', 'src', 'assets', 'products', filename),
    path.join(__dirname, '..', 'public', filename),
  ];

  for (const p of searchPaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const seedDatabase = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ MongoDB Atlas already has ${count} products. Skipping seeding.`);
      return;
    }

    console.log('📦 Product collection is empty. Preparing to seed MongoDB Atlas...');
    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    const preparedProducts = [];

    for (const item of rawCatalogItems) {
      let finalImageUrl = `/uploads/${item.localFilename}`;
      let finalPublicId = null;

      const localPath = findLocalImageFile(item.localFilename);

      if (hasCloudinary && localPath) {
        try {
          console.log(`☁️ Uploading "${item.name}" image to Cloudinary...`);
          const uploadRes = await uploadLocalFileToCloudinary(localPath);
          finalImageUrl = uploadRes.secure_url;
          finalPublicId = uploadRes.public_id;
        } catch (uploadErr) {
          console.warn(`⚠️ Cloudinary upload skipped for ${item.name} (${uploadErr.message}). Using local fallback.`);
        }
      }

      preparedProducts.push({
        name: item.name,
        category: item.category,
        description: item.description,
        specs: item.specs,
        imageUrl: finalImageUrl,
        cloudinaryPublicId: finalPublicId,
        inStock: item.inStock,
        displayOrder: item.displayOrder,
      });
    }

    await Product.insertMany(preparedProducts);
    console.log(`✅ Successfully seeded ${preparedProducts.length} medical products to MongoDB Atlas.`);
  } catch (err) {
    console.error('❌ Error during database seeding:', err.message);
  }
};

module.exports = seedDatabase;
