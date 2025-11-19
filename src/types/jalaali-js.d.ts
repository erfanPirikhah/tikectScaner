declare module 'jalaali-js' {
  export interface JalaaliDate {
    jy: number; // Persian year
    jm: number; // Persian month
    jd: number; // Persian day
  }

  export function toJalaali(date: Date): JalaaliDate;
  export function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number };
  export function isValidJalaaliDate(jy: number, jm: number, jd: number): boolean;
  export function isLeapJalaaliYear(jy: number): boolean;
  export function jalaaliMonthLength(jy: number, jm: number): number;
  export function depattern(str: string): Date | null;
}