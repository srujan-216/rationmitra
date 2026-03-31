const CARD_TYPES = ['AAY', 'PHH', 'APL', 'Annapurna'];

const COMMODITIES = ['Rice', 'Wheat', 'Sugar', 'Kerosene', 'Dal', 'Palm Oil'];

const TELANGANA_DISTRICTS = [
  'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon',
  'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar',
  'Khammam', 'Kumuram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial',
  'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda',
  'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla',
  'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad',
  'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri',
];

// Entitlements per month per card type
const ENTITLEMENT_RULES = {
  AAY: { Rice: 35, Wheat: 0, Sugar: 1, Kerosene: 3, Dal: 0, 'Palm Oil': 0, perMember: false },
  PHH: { Rice: 5, Wheat: 0, Sugar: 0, Kerosene: 0, Dal: 0, 'Palm Oil': 0, perMember: true },
  APL: { Rice: 5, Wheat: 0, Sugar: 0, Kerosene: 3, Dal: 0, 'Palm Oil': 0, perMember: true },
  Annapurna: { Rice: 10, Wheat: 0, Sugar: 0, Kerosene: 0, Dal: 0, 'Palm Oil': 0, perMember: false },
};

// Price per kg/liter by card type (in Rs)
const COMMODITY_RATES = {
  AAY: { Rice: 1, Wheat: 2, Sugar: 13.50, Kerosene: 15, Dal: 20, 'Palm Oil': 25 },
  PHH: { Rice: 1, Wheat: 2, Sugar: 13.50, Kerosene: 15, Dal: 20, 'Palm Oil': 25 },
  APL: { Rice: 7, Wheat: 8, Sugar: 18, Kerosene: 25, Dal: 35, 'Palm Oil': 40 },
  Annapurna: { Rice: 0, Wheat: 0, Sugar: 0, Kerosene: 0, Dal: 0, 'Palm Oil': 0 },
};

module.exports = { CARD_TYPES, COMMODITIES, TELANGANA_DISTRICTS, ENTITLEMENT_RULES, COMMODITY_RATES };
