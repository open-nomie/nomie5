import calculate from "../calculate/calculate";
import { max, mean, min, random, round, sample, sum } from "lodash";

export default {
  // Sum an array
  sum: (arr: Array<number>) => {
    return (arr || []).length ? sum(arr) : 0;
  },
  // Round a number
  round: (num: number, amount?: number): number => {
    amount = amount || 100;
    return Math.round(amount * num) / amount;
  },
  // Get max from array
  max: (arr: Array<number>): number => {
    return (arr || []).length ? max([...arr]) : 0;
  },
  // Get the min from array
  min: (arr, includeZero = false) => {
    if (arr.length) {
      arr = includeZero == true ? arr : arr.filter((a) => a);
      return min(arr);
    } else {
      return 0;
    }
  },
  // Average an Array
  average: (arr: Array<number>, ignoreZeros?: boolean): number => {
    arr = arr || [0];
    arr = arr.length ? arr : [0];
    if (ignoreZeros) {
      arr = ignoreZeros ? arr.filter((row) => row) : arr;
    }
    return round(mean(arr), 2) || 0;
  },
  // Get the percentage of 2 numbers
  percentage: (n1, n2, flip?: boolean): number => {
    if (flip) {
      return ((n1 - n2) / n1) * 100;
    } else {
      return 100 - ((n1 - n2) / n1) * 100;
    }
  },
  // Random Range from to numbers
  random_range: (min: number, max: number): number => {
    return random(min, max);
  },
  // Random from Array
  random: (arr: Array<number>): any => {
    return sample(arr);
  },
  //https://gist.github.com/IceCreamYou/6ffa1b18c4c8f6aeaad2
  percentile(arr) {
    let max = this.max(arr);
    return arr.map((value, i) => {
      return this.round(this.percentage(max, value), 10);
    });
  },
  trustfulNumber(number, def) {
    return isNaN(number) ? def : number;
  },
  isNumber(check) {
    return !isNaN(check) && check !== null && check !== undefined;
  },
  isInt(n) {
    return Number(n) === n && n % 1 === 0;
  },
  isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
  },
  calculate(calcArray) {
    return calculate(calcArray);
  },
};
