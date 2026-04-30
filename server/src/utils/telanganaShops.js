/**
 * Realistic Telangana FPS (Fair Price Shop) seed dataset.
 *
 * Covers 12+ districts and ~60 shops with accurate lat/lng coordinates
 * based on publicly-known Telangana district/mandal locations.
 *
 * Note: Shop codes follow the format FPS-<DIST>-<NNN>, which mirrors
 * the pattern used by the Telangana Civil Supplies Department. The
 * specific shop codes/names here are representative, not a live pull
 * from the official portal (epds.telangana.gov.in).
 */

const TELANGANA_FPS_SHOPS = [
  // ───────── HYDERABAD (urban core) ─────────
  { name: 'FPS Kukatpally - Ward 12', code: 'FPS-HYD-012', district: 'Hyderabad', mandal: 'Kukatpally', street: 'KPHB Colony, Phase 3', city: 'Hyderabad', pincode: '500072', lat: 17.4947, lng: 78.3996 },
  { name: 'FPS Ameerpet - Ward 7',    code: 'FPS-HYD-007', district: 'Hyderabad', mandal: 'Ameerpet',  street: 'SR Nagar Main Road', city: 'Hyderabad', pincode: '500038', lat: 17.4375, lng: 78.4483 },
  { name: 'FPS Secunderabad - Ward 3', code: 'FPS-HYD-003', district: 'Hyderabad', mandal: 'Secunderabad', street: 'Trimulgherry Cross', city: 'Secunderabad', pincode: '500015', lat: 17.4660, lng: 78.5268 },
  { name: 'FPS Charminar - Ward 55',   code: 'FPS-HYD-055', district: 'Hyderabad', mandal: 'Charminar',   street: 'Laad Bazaar Lane',  city: 'Hyderabad',  pincode: '500002', lat: 17.3616, lng: 78.4747 },
  { name: 'FPS Begumpet - Ward 9',     code: 'FPS-HYD-009', district: 'Hyderabad', mandal: 'Begumpet',    street: 'Prakash Nagar',     city: 'Hyderabad',  pincode: '500016', lat: 17.4447, lng: 78.4665 },
  { name: 'FPS Malakpet - Ward 58',    code: 'FPS-HYD-058', district: 'Hyderabad', mandal: 'Malakpet',    street: 'New Malakpet Road', city: 'Hyderabad',  pincode: '500036', lat: 17.3780, lng: 78.5020 },
  { name: 'FPS Himayatnagar - Ward 22',code: 'FPS-HYD-022', district: 'Hyderabad', mandal: 'Himayatnagar',street: 'Lower Tank Bund',   city: 'Hyderabad',  pincode: '500029', lat: 17.4023, lng: 78.4854 },
  { name: 'FPS Khairatabad - Ward 6',  code: 'FPS-HYD-006', district: 'Hyderabad', mandal: 'Khairatabad', street: 'Telugu Talli Flyover Rd', city: 'Hyderabad', pincode: '500004', lat: 17.4145, lng: 78.4673 },
  { name: 'FPS LB Nagar - Ward 88',    code: 'FPS-HYD-088', district: 'Hyderabad', mandal: 'LB Nagar',    street: 'Sagar Ring Road',   city: 'Hyderabad',  pincode: '500074', lat: 17.3468, lng: 78.5521 },
  { name: 'FPS Dilsukhnagar - Ward 91',code: 'FPS-HYD-091', district: 'Hyderabad', mandal: 'Dilsukhnagar',street: 'Chaitanyapuri',     city: 'Hyderabad',  pincode: '500060', lat: 17.3688, lng: 78.5247 },
  { name: 'FPS Nampally - Ward 68',    code: 'FPS-HYD-068', district: 'Hyderabad', mandal: 'Nampally',    street: 'Gandhi Bhavan Rd',  city: 'Hyderabad',  pincode: '500001', lat: 17.3936, lng: 78.4697 },
  { name: 'FPS Tolichowki - Ward 99',  code: 'FPS-HYD-099', district: 'Hyderabad', mandal: 'Golconda',    street: 'Shaikpet Main Rd',  city: 'Hyderabad',  pincode: '500008', lat: 17.4022, lng: 78.4127 },

  // ───────── RANGAREDDY ─────────
  { name: 'FPS Rajendranagar - Ward 4',code: 'FPS-RR-004', district: 'Rangareddy', mandal: 'Rajendranagar', street: 'Attapur',           city: 'Hyderabad',    pincode: '500048', lat: 17.3192, lng: 78.4039 },
  { name: 'FPS Shamshabad - Ward 11',  code: 'FPS-RR-011', district: 'Rangareddy', mandal: 'Shamshabad',    street: 'Airport Service Rd',city: 'Hyderabad',    pincode: '501218', lat: 17.2403, lng: 78.4294 },
  { name: 'FPS Ibrahimpatnam - Ward 2',code: 'FPS-RR-002', district: 'Rangareddy', mandal: 'Ibrahimpatnam', street: 'Main Bazaar',       city: 'Ibrahimpatnam',pincode: '501510', lat: 17.2440, lng: 78.6610 },
  { name: 'FPS Hayathnagar - Ward 19', code: 'FPS-RR-019', district: 'Rangareddy', mandal: 'Hayathnagar',   street: 'Vijayapuri Colony', city: 'Hyderabad',    pincode: '501505', lat: 17.3370, lng: 78.6120 },
  { name: 'FPS Chevella - Ward 3',     code: 'FPS-RR-003', district: 'Rangareddy', mandal: 'Chevella',      street: 'Bazaar Rd',         city: 'Chevella',     pincode: '501503', lat: 17.3096, lng: 78.1421 },
  { name: 'FPS Vikarabad - Ward 7',    code: 'FPS-VIK-007',district: 'Vikarabad',  mandal: 'Vikarabad',     street: 'Main Bus Stand Rd', city: 'Vikarabad',    pincode: '501101', lat: 17.3380, lng: 77.9046 },

  // ───────── MEDCHAL-MALKAJGIRI ─────────
  { name: 'FPS Medchal - Ward 5',      code: 'FPS-MED-005',district: 'Medchal-Malkajgiri', mandal: 'Medchal',  street: 'NH-44 Junction',     city: 'Medchal',    pincode: '501401', lat: 17.6268, lng: 78.4814 },
  { name: 'FPS Kompally - Ward 14',    code: 'FPS-MED-014',district: 'Medchal-Malkajgiri', mandal: 'Kompally', street: 'Kompally Cross',     city: 'Hyderabad',  pincode: '500014', lat: 17.5367, lng: 78.4848 },
  { name: 'FPS Alwal - Ward 2',        code: 'FPS-MED-002',district: 'Medchal-Malkajgiri', mandal: 'Alwal',    street: 'Venkatapuram',       city: 'Secunderabad', pincode: '500010', lat: 17.5014, lng: 78.5036 },
  { name: 'FPS Quthbullapur - Ward 21',code: 'FPS-MED-021',district: 'Medchal-Malkajgiri', mandal: 'Quthbullapur', street: 'Jeedimetla X Rd', city: 'Hyderabad', pincode: '500055', lat: 17.5210, lng: 78.4543 },
  { name: 'FPS Keesara - Ward 6',      code: 'FPS-MED-006',district: 'Medchal-Malkajgiri', mandal: 'Keesara',  street: 'Keesara Gutta Rd',   city: 'Keesara',    pincode: '501301', lat: 17.5350, lng: 78.6357 },

  // ───────── SANGAREDDY ─────────
  { name: 'FPS Sangareddy - Ward 3',   code: 'FPS-SNG-003',district: 'Sangareddy', mandal: 'Sangareddy', street: 'Collector Office Rd', city: 'Sangareddy', pincode: '502001', lat: 17.6200, lng: 78.0836 },
  { name: 'FPS Patancheru - Ward 8',   code: 'FPS-SNG-008',district: 'Sangareddy', mandal: 'Patancheru', street: 'Industrial Area Rd',  city: 'Patancheru', pincode: '502319', lat: 17.5321, lng: 78.2646 },
  { name: 'FPS Zaheerabad - Ward 2',   code: 'FPS-SNG-002',district: 'Sangareddy', mandal: 'Zaheerabad', street: 'NH-65 Main',         city: 'Zaheerabad', pincode: '502220', lat: 17.6820, lng: 77.6094 },

  // ───────── WARANGAL URBAN ─────────
  { name: 'FPS Hanamkonda - Ward 5',   code: 'FPS-WGU-005',district: 'Warangal Urban', mandal: 'Hanamkonda', street: 'Waddepally',       city: 'Warangal', pincode: '506001', lat: 17.9973, lng: 79.5680 },
  { name: 'FPS Kazipet - Ward 12',     code: 'FPS-WGU-012',district: 'Warangal Urban', mandal: 'Kazipet',    street: 'Railway Station Rd', city: 'Kazipet',pincode: '506003', lat: 18.0219, lng: 79.5360 },
  { name: 'FPS Warangal Fort - Ward 9',code: 'FPS-WGU-009',district: 'Warangal Urban', mandal: 'Warangal',   street: 'Fort Area',         city: 'Warangal',pincode: '506002', lat: 17.9689, lng: 79.6000 },
  { name: 'FPS Subedari - Ward 17',    code: 'FPS-WGU-017',district: 'Warangal Urban', mandal: 'Warangal',   street: 'Subedari Main',     city: 'Warangal',pincode: '506001', lat: 17.9842, lng: 79.5789 },

  // ───────── WARANGAL RURAL ─────────
  { name: 'FPS Geesukonda - Ward 2',   code: 'FPS-WGR-002',district: 'Warangal Rural', mandal: 'Geesukonda', street: 'Main Road',  city: 'Geesukonda', pincode: '506005', lat: 17.9513, lng: 79.6134 },
  { name: 'FPS Parkal - Ward 5',       code: 'FPS-WGR-005',district: 'Warangal Rural', mandal: 'Parkal',     street: 'Bazaar Rd',  city: 'Parkal',     pincode: '506164', lat: 18.1870, lng: 79.6880 },

  // ───────── KARIMNAGAR ─────────
  { name: 'FPS Karimnagar Town',       code: 'FPS-KRM-001',district: 'Karimnagar', mandal: 'Karimnagar', street: 'Tower Circle',  city: 'Karimnagar', pincode: '505001', lat: 18.4386, lng: 79.1288 },
  { name: 'FPS Jammikunta - Ward 4',   code: 'FPS-KRM-004',district: 'Karimnagar', mandal: 'Jammikunta', street: 'NH-563 Main',  city: 'Jammikunta', pincode: '505122', lat: 18.2820, lng: 79.4740 },
  { name: 'FPS Huzurabad - Ward 2',    code: 'FPS-KRM-002',district: 'Karimnagar', mandal: 'Huzurabad',  street: 'Bus Stand Rd', city: 'Huzurabad',  pincode: '505468', lat: 18.2001, lng: 79.4024 },

  // ───────── NIZAMABAD ─────────
  { name: 'FPS Nizamabad Town',        code: 'FPS-NZB-001',district: 'Nizamabad', mandal: 'Nizamabad', street: 'Gandhi Chowk',   city: 'Nizamabad', pincode: '503001', lat: 18.6725, lng: 78.0941 },
  { name: 'FPS Bodhan - Ward 6',       code: 'FPS-NZB-006',district: 'Nizamabad', mandal: 'Bodhan',    street: 'Sugar Factory Rd', city: 'Bodhan', pincode: '503185', lat: 18.6639, lng: 77.8874 },
  { name: 'FPS Armoor - Ward 3',       code: 'FPS-NZB-003',district: 'Nizamabad', mandal: 'Armoor',    street: 'Bazaar Main',    city: 'Armoor',    pincode: '503224', lat: 18.7900, lng: 78.2900 },

  // ───────── KHAMMAM ─────────
  { name: 'FPS Khammam Town',          code: 'FPS-KHM-001',district: 'Khammam', mandal: 'Khammam', street: 'Wyra Road',     city: 'Khammam', pincode: '507001', lat: 17.2473, lng: 80.1514 },
  { name: 'FPS Madhira - Ward 2',      code: 'FPS-KHM-002',district: 'Khammam', mandal: 'Madhira', street: 'Bus Stand Rd',  city: 'Madhira', pincode: '507203', lat: 16.9277, lng: 80.3617 },

  // ───────── NALGONDA ─────────
  { name: 'FPS Nalgonda Town',         code: 'FPS-NLG-001',district: 'Nalgonda', mandal: 'Nalgonda', street: 'Clock Tower Rd', city: 'Nalgonda', pincode: '508001', lat: 17.0542, lng: 79.2673 },
  { name: 'FPS Miryalaguda - Ward 4',  code: 'FPS-NLG-004',district: 'Nalgonda', mandal: 'Miryalaguda', street: 'Hyderabad Rd', city: 'Miryalaguda', pincode: '508207', lat: 16.8715, lng: 79.5650 },

  // ───────── MAHABUBNAGAR ─────────
  { name: 'FPS Mahabubnagar Town',     code: 'FPS-MBN-001',district: 'Mahabubnagar', mandal: 'Mahabubnagar', street: 'Kurnool Rd', city: 'Mahabubnagar', pincode: '509001', lat: 16.7488, lng: 77.9932 },
  { name: 'FPS Wanaparthy - Ward 2',   code: 'FPS-WPT-002',district: 'Wanaparthy',   mandal: 'Wanaparthy',   street: 'Main Bazaar', city: 'Wanaparthy',  pincode: '509103', lat: 16.3618, lng: 78.0636 },

  // ───────── ADILABAD ─────────
  { name: 'FPS Adilabad Town',         code: 'FPS-ADB-001',district: 'Adilabad', mandal: 'Adilabad', street: 'Shivaji Chowk', city: 'Adilabad', pincode: '504001', lat: 19.6640, lng: 78.5320 },
  { name: 'FPS Bhainsa - Ward 3',      code: 'FPS-ADB-003',district: 'Adilabad', mandal: 'Bhainsa',  street: 'Mosque Rd',     city: 'Bhainsa',  pincode: '504103', lat: 19.1000, lng: 77.9666 },

  // ───────── SIDDIPET ─────────
  { name: 'FPS Siddipet Town',         code: 'FPS-SDP-001',district: 'Siddipet', mandal: 'Siddipet', street: 'Collectorate Rd', city: 'Siddipet', pincode: '502103', lat: 18.1018, lng: 78.8467 },
  { name: 'FPS Gajwel - Ward 5',       code: 'FPS-SDP-005',district: 'Siddipet', mandal: 'Gajwel',   street: 'NH-65 Junction',  city: 'Gajwel',   pincode: '502278', lat: 17.8400, lng: 78.6820 },

  // ───────── SURYAPET ─────────
  { name: 'FPS Suryapet Town',         code: 'FPS-SPT-001',district: 'Suryapet', mandal: 'Suryapet', street: 'NH-65 Main Road', city: 'Suryapet', pincode: '508213', lat: 17.1396, lng: 79.6300 },

  // ───────── JAGTIAL ─────────
  { name: 'FPS Jagtial Town',          code: 'FPS-JGT-001',district: 'Jagtial', mandal: 'Jagtial', street: 'Bus Stand Rd', city: 'Jagtial', pincode: '505327', lat: 18.7918, lng: 78.9208 },

  // ───────── PEDDAPALLI ─────────
  { name: 'FPS Peddapalli Town',       code: 'FPS-PDP-001',district: 'Peddapalli', mandal: 'Peddapalli', street: 'Godavarikhani Rd', city: 'Peddapalli', pincode: '505172', lat: 18.6140, lng: 79.3744 },
  { name: 'FPS Ramagundam - Ward 2',   code: 'FPS-PDP-002',district: 'Peddapalli', mandal: 'Ramagundam', street: 'NTPC Colony Rd',    city: 'Ramagundam', pincode: '505215', lat: 18.7500, lng: 79.4740 },

  // ───────── MANCHERIAL ─────────
  { name: 'FPS Mancherial Town',       code: 'FPS-MCR-001',district: 'Mancherial', mandal: 'Mancherial', street: 'NH-63',     city: 'Mancherial', pincode: '504208', lat: 18.8714, lng: 79.4471 },

  // ───────── KAMAREDDY ─────────
  { name: 'FPS Kamareddy Town',        code: 'FPS-KMD-001',district: 'Kamareddy', mandal: 'Kamareddy', street: 'Main Bazaar', city: 'Kamareddy', pincode: '503111', lat: 18.3188, lng: 78.3436 },

  // ───────── YADADRI BHUVANAGIRI ─────────
  { name: 'FPS Bhuvanagiri Town',      code: 'FPS-YBG-001',district: 'Yadadri Bhuvanagiri', mandal: 'Bhuvanagiri', street: 'Fort Rd',     city: 'Bhongir', pincode: '508116', lat: 17.5110, lng: 78.8935 },
  { name: 'FPS Yadagirigutta - Ward 2',code: 'FPS-YBG-002',district: 'Yadadri Bhuvanagiri', mandal: 'Yadagirigutta', street: 'Temple Rd', city: 'Yadagirigutta', pincode: '508115', lat: 17.5970, lng: 78.9556 },

  // ───────── MEDAK ─────────
  { name: 'FPS Medak Town',            code: 'FPS-MDK-001',district: 'Medak', mandal: 'Medak', street: 'Church Road', city: 'Medak', pincode: '502110', lat: 18.0500, lng: 78.2667 },

  // ───────── BHADRADRI KOTHAGUDEM ─────────
  { name: 'FPS Kothagudem - Ward 8',   code: 'FPS-BDK-008',district: 'Bhadradri Kothagudem', mandal: 'Kothagudem', street: 'SCCL Colony',    city: 'Kothagudem', pincode: '507101', lat: 17.5483, lng: 80.6200 },
  { name: 'FPS Palwancha - Ward 3',    code: 'FPS-BDK-003',district: 'Bhadradri Kothagudem', mandal: 'Palwancha',  street: 'Bhadrachalam Rd',city: 'Palwancha',  pincode: '507115', lat: 17.5860, lng: 80.6650 },
];

module.exports = { TELANGANA_FPS_SHOPS };
