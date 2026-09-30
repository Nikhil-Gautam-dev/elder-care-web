/** Sample catalog used by `pnpm seed`. Brands/prices are illustrative demo data, not real price lists. */
export interface SeedMedicine {
  brand: string;
  generic: string;
  strength: string;
  form: string;
  packSize: number;
  packUnit: string;
  pricePerPack: number;
  stockPacks: number;
  manufacturer: string;
}

const m = (
  brand: string,
  generic: string,
  strength: string,
  form: string,
  packSize: number,
  packUnit: string,
  pricePerPack: number,
  stockPacks: number,
  manufacturer: string,
): SeedMedicine => ({
  brand,
  generic,
  strength,
  form,
  packSize,
  packUnit,
  pricePerPack,
  stockPacks,
  manufacturer,
});

export const SEED_MEDICINES: SeedMedicine[] = [
  // Diabetes
  m('Glycomet', 'Metformin', '500 mg', 'tablet', 20, 'tablets', 28, 120, 'USV'),
  m('Glycomet', 'Metformin', '850 mg', 'tablet', 20, 'tablets', 38, 80, 'USV'),
  m('Amaryl', 'Glimepiride', '1 mg', 'tablet', 30, 'tablets', 185, 60, 'Sanofi'),
  m('Januvia', 'Sitagliptin', '50 mg', 'tablet', 15, 'tablets', 480, 25, 'MSD'),
  // Blood pressure
  m('Amlokind', 'Amlodipine', '5 mg', 'tablet', 15, 'tablets', 32, 150, 'Mankind'),
  m('Telma', 'Telmisartan', '40 mg', 'tablet', 15, 'tablets', 118, 90, 'Glenmark'),
  m(
    'Telma-H',
    'Telmisartan + Hydrochlorothiazide',
    '40/12.5 mg',
    'tablet',
    15,
    'tablets',
    145,
    60,
    'Glenmark',
  ),
  m('Losar', 'Losartan', '50 mg', 'tablet', 15, 'tablets', 72, 100, 'Unichem'),
  m('Metolar', 'Metoprolol', '50 mg', 'tablet', 15, 'tablets', 62, 80, 'Cipla'),
  m('Ecosprin', 'Aspirin', '75 mg', 'tablet', 14, 'tablets', 6, 200, 'USV'),
  // Cholesterol / heart
  m('Atorva', 'Atorvastatin', '10 mg', 'tablet', 15, 'tablets', 95, 110, 'Zydus'),
  m('Atorva', 'Atorvastatin', '20 mg', 'tablet', 15, 'tablets', 160, 90, 'Zydus'),
  m('Rosuvas', 'Rosuvastatin', '10 mg', 'tablet', 15, 'tablets', 185, 70, 'Sun Pharma'),
  m('Clopitab', 'Clopidogrel', '75 mg', 'tablet', 15, 'tablets', 92, 70, 'Lupin'),
  m('Lasix', 'Furosemide', '40 mg', 'tablet', 15, 'tablets', 22, 60, 'Sanofi'),
  // Thyroid
  m('Thyronorm', 'Thyroxine', '50 mcg', 'tablet', 100, 'tablets', 215, 50, 'Abbott'),
  m('Thyronorm', 'Thyroxine', '100 mcg', 'tablet', 100, 'tablets', 260, 40, 'Abbott'),
  // Pain / fever
  m('Dolo', 'Paracetamol', '650 mg', 'tablet', 15, 'tablets', 32, 300, 'Micro Labs'),
  m('Crocin', 'Paracetamol', '500 mg', 'tablet', 15, 'tablets', 20, 250, 'GSK'),
  m('Voveran SR', 'Diclofenac', '100 mg', 'tablet', 10, 'tablets', 68, 60, 'Novartis'),
  // Stomach
  m('Pan', 'Pantoprazole', '40 mg', 'tablet', 15, 'tablets', 155, 130, 'Alkem'),
  m('Digene', 'Antacid gel', '200 ml', 'syrup', 200, 'ml', 135, 70, 'Abbott'),
  m('Gelusil', 'Antacid', '—', 'tablet', 20, 'tablets', 28, 100, 'Pfizer'),
  // Supplements
  m('Shelcal', 'Calcium + Vitamin D3', '500 mg', 'tablet', 15, 'tablets', 120, 100, 'Torrent'),
  m('Becosules', 'Vitamin B-complex', '—', 'capsule', 20, 'capsules', 48, 120, 'Pfizer'),
  m('Neurobion Forte', 'Vitamin B1 + B6 + B12', '—', 'tablet', 30, 'tablets', 38, 90, 'P&G'),
  // Respiratory / allergy
  m('Montair', 'Montelukast', '10 mg', 'tablet', 10, 'tablets', 185, 50, 'Cipla'),
  m('Cetzine', 'Cetirizine', '10 mg', 'tablet', 10, 'tablets', 22, 150, 'GSK'),
  m('Asthalin', 'Salbutamol inhaler', '100 mcg', 'inhaler', 200, 'puffs', 135, 40, 'Cipla'),
  // Eyes / other
  m(
    'Refresh Tears',
    'Carboxymethylcellulose',
    '0.5%',
    'drops',
    1,
    'bottle (10 ml)',
    165,
    45,
    'Allergan',
  ),
  m(
    'Betadine',
    'Povidone-iodine ointment',
    '5%',
    'ointment',
    1,
    'tube (20 g)',
    110,
    60,
    'Win-Medicare',
  ),
];
