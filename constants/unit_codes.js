const UNIT_CODES_DATA = [
  { code: '1010', name: { uz: 'ТЭС ЦА',                        ru: 'ТЭС ЦА' },                        city: { uz: 'Toshkent',      ru: 'Ташкент' } },
  { code: '1020', name: { uz: 'Filial Sirdaryо ТЭС',            ru: 'Филиал Сырдарьинская ТЭС' },      city: { uz: 'Shirin',        ru: 'Шырын' } },
  { code: '1030', name: { uz: 'АО "Toshkent ТЭС"',             ru: 'АО "Ташкентская ТЭС"' },          city: { uz: 'Toshkent',      ru: 'Ташкент' } },
  { code: '1040', name: { uz: 'АО "Navoiy ТЭС"',               ru: 'АО "Навоийская ТЭС"' },           city: { uz: 'Navoiy',        ru: 'Навои' } },
  { code: '1050', name: { uz: 'АО "Taxiatosh ТЭС"',            ru: 'АО "Тахиатаская ТЭС"' },          city: { uz: 'Taxiatosh',     ru: 'Тахиаташ' } },
  { code: '1060', name: { uz: 'АО "Talimaron ТЭС"',            ru: 'АО "Талимарджанская ТЭС"' },      city: { uz: 'Talimaron',     ru: 'Талимарджан' } },
  { code: '1070', name: { uz: 'Filial Turakurgan ТЭС',         ru: 'Филиал Туракурганская ТЭС' },     city: { uz: 'Turakurgan',    ru: 'Туракурган' } },
  { code: '1080', name: { uz: 'Filial Muborak ТЭЦ',            ru: 'Филиал Мубарекская ТЭЦ' },        city: { uz: 'Muborak',       ru: 'Мубарек' } },
  { code: '1090', name: { uz: 'Filial Farg\'ona ТЭЦ',          ru: 'Филиал Ферганская ТЭЦ' },         city: { uz: 'Farg\'ona',     ru: 'Фергана' } },
  { code: '1100', name: { uz: 'Filial Toshkent ТЭЦ',           ru: 'Филиал Ташкентская ТЭЦ' },        city: { uz: 'Toshkent',      ru: 'Ташкент' } },
  { code: '1110', name: { uz: 'МЧЖ "Uzenergosolash"',          ru: 'ООО "Узэнергосолаш"' },           city: { uz: '',              ru: '' } },
  { code: '1120', name: { uz: 'АО "Ozbekenergota\'mir"',       ru: 'АО "Узбекэнерготаъмир"' },        city: { uz: '',              ru: '' } },
  { code: '1130', name: { uz: 'АО "Uzenergoaetminlash"',       ru: 'АО "Узэнерготаъминлаш"' },        city: { uz: 'Andijon',       ru: 'Андижан' } },
  { code: '1140', name: { uz: 'АО "Angren ТЭС"',               ru: 'АО "Ангренская ТЭС"' },           city: { uz: '',              ru: '' } },
  { code: '1150', name: { uz: 'МЧЖ "Toshkent issiqlik"',       ru: 'ООО "Ташкентская тепловая"' },    city: { uz: 'Toshkent',      ru: 'Ташкент' } },
];

export const getUnitCodes = (locale = 'uz') =>
  UNIT_CODES_DATA.map(({ code, name, city }) => ({
    code,
    name: name[locale] ?? name.uz,
    city: city[locale] ?? city.uz,
  }));

export const getUnitCodeName = (code, locale = 'uz') => {
  const item = UNIT_CODES_DATA.find((u) => u.code === code);
  if (!item) return code;
  return item.name[locale] ?? item.name.uz;
};

export { UNIT_CODES_DATA };
