import type { Province, ProvinceId, ProvinceShape } from "./types";
import { HORMOZGAN_ISLANDS, KHARG_ISLAND, part1 } from "./data/part1";
import { part2 } from "./data/part2";
import { part3 } from "./data/part3";
import { part4 } from "./data/part4";
import { part5 } from "./data/part5";
import { part6 } from "./data/part6";
import { part7 } from "./data/part7";
import { part8 } from "./data/part8";
import { part9 } from "./data/part9";
import { part10 } from "./data/part10";
import { part11 } from "./data/part11";
import { part12 } from "./data/part12";
import { part13 } from "./data/part13";
import { part14 } from "./data/part14";
import { part15 } from "./data/part15";
import { part16 } from "./data/part16";
import { part17 } from "./data/part17";

/** viewBox of the source SVG. */
export const IRAN_VIEWBOX = "0 0 1158 1107.4";

const NAMES: Record<ProvinceId, [fa: string, en: string]> = {
  alborz: ["البرز", "Alborz"],
  ardabil: ["اردبیل", "Ardabil"],
  "azerbaijan-east": ["آذربایجان شرقی", "East Azerbaijan"],
  "azerbaijan-west": ["آذربایجان غربی", "West Azerbaijan"],
  bushehr: ["بوشهر", "Bushehr"],
  "chahar-mahaal-bakhtiari": ["چهارمحال و بختیاری", "Chaharmahal and Bakhtiari"],
  fars: ["فارس", "Fars"],
  gilan: ["گیلان", "Gilan"],
  golestan: ["گلستان", "Golestan"],
  hamedan: ["همدان", "Hamedan"],
  hormozgan: ["هرمزگان", "Hormozgan"],
  ilam: ["ایلام", "Ilam"],
  isfahan: ["اصفهان", "Isfahan"],
  kerman: ["کرمان", "Kerman"],
  kermanshah: ["کرمانشاه", "Kermanshah"],
  "khorasan-north": ["خراسان شمالی", "North Khorasan"],
  "khorasan-razavi": ["خراسان رضوی", "Razavi Khorasan"],
  "khorasan-south": ["خراسان جنوبی", "South Khorasan"],
  khuzestan: ["خوزستان", "Khuzestan"],
  "kohgiluyeh-boyer-ahmad": ["کهگیلویه و بویراحمد", "Kohgiluyeh and Boyer-Ahmad"],
  kurdistan: ["کردستان", "Kurdistan"],
  lorestan: ["لرستان", "Lorestan"],
  markazi: ["مرکزی", "Markazi"],
  mazandaran: ["مازندران", "Mazandaran"],
  qazvin: ["قزوین", "Qazvin"],
  qom: ["قم", "Qom"],
  semnan: ["سمنان", "Semnan"],
  "sistan-baluchestan": ["سیستان و بلوچستان", "Sistan and Baluchestan"],
  tehran: ["تهران", "Tehran"],
  yazd: ["یزد", "Yazd"],
  zanjan: ["زنجان", "Zanjan"],
};

/**
 * Label anchor per province: [x, y, radius] in viewBox units. (x, y) is the point inside the
 * province farthest from its border; radius is that distance, used to size the label font.
 */
const LABELS: Record<ProvinceId, [number, number, number]> = {
  alborz: [414, 289, 16],
  ardabil: [260, 135, 22],
  "azerbaijan-east": [148, 148, 58],
  "azerbaijan-west": [102, 233, 32],
  bushehr: [451, 801, 26],
  "chahar-mahaal-bakhtiari": [404, 566, 28],
  fars: [577, 798, 83],
  gilan: [348, 217, 29],
  golestan: [672, 185, 30],
  hamedan: [284, 348, 31],
  hormozgan: [833, 959, 40],
  ilam: [162, 479, 25],
  isfahan: [483, 472, 70],
  kerman: [784, 683, 110],
  kermanshah: [176, 403, 32],
  "khorasan-north": [768, 186, 41],
  "khorasan-razavi": [906, 317, 93],
  "khorasan-south": [889, 509, 89],
  khuzestan: [299, 584, 63],
  "kohgiluyeh-boyer-ahmad": [403, 641, 24],
  kurdistan: [189, 310, 40],
  lorestan: [251, 459, 37],
  markazi: [340, 411, 32],
  mazandaran: [532, 267, 31],
  qazvin: [355, 278, 30],
  qom: [427, 371, 24],
  semnan: [668, 321, 78],
  "sistan-baluchestan": [988, 881, 104],
  tehran: [446, 321, 25],
  yazd: [653, 547, 67],
  zanjan: [265, 241, 34],
};

const EXTRA_PATHS: Partial<Record<ProvinceId, string[]>> = {
  bushehr: [KHARG_ISLAND],
  hormozgan: HORMOZGAN_ISLANDS,
};

const SHAPES: ProvinceShape[] = [
  ...part1, ...part2, ...part3, ...part4, ...part5, ...part6, ...part7, ...part8, ...part9,
  ...part10, ...part11, ...part12, ...part13, ...part14, ...part15, ...part16, ...part17,
];

/** All 31 provinces, sorted by English name. */
export const PROVINCES: readonly Province[] = SHAPES.map((s) => ({
  id: s.id,
  nameFa: NAMES[s.id][0],
  nameEn: NAMES[s.id][1],
  paths: [s.d, ...(EXTRA_PATHS[s.id] ?? [])],
  label: { x: LABELS[s.id][0], y: LABELS[s.id][1], radius: LABELS[s.id][2] },
})).sort((a, b) => a.nameEn.localeCompare(b.nameEn));

export const PROVINCE_IDS: readonly ProvinceId[] = PROVINCES.map((p) => p.id);

const BY_ID = new Map(PROVINCES.map((p) => [p.id, p]));

export function getProvince(id: ProvinceId): Province | undefined {
  return BY_ID.get(id);
}
