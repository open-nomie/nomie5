import calculate from "../calculate/calculate";
export default {
  // Sum an array
  sum: (arr) => {
    if (arr.length) {
      return arr.reduce((sum, x) => sum + x);
    } else {
      return 0;
    }
  },
  // Round a number
  round: (num: number, amount?: number): number => {
    amount = amount || 100;
    return Math.round(amount * num) / amount;
  },
  // Get max from array
  max: (arr): number => {
    if (arr.length) {
      return Math.max(...arr);
    } else {
      return 0;
    }
  },
  // Get the min from array
  min: (arr, includeZero = false) => {
    if (arr.length) {
      arr = includeZero == true ? arr : arr.filter((a) => a);
      let min = Math.min(...arr);
      return min;
    } else {
      return 0;
    }
  },
  // Average an Array
  average: (arr, ignoreZeros?) => {
    if (ignoreZeros) {
      arr = arr.filter((row) => {
        if (row === 0) {
          return false;
        } else {
          return true;
        }
      });
    }
    if (arr.length) {
      let v = arr.reduce((p, c) => p + c, 0) / arr.length;
      return Math.round(100 * v) / 100;
    } else {
      return 0;
    }
  },
  // Get the percentage of 2 numbers
  percentage: (n1, n2, flip?: boolean) => {
    if (flip) {
      return ((n1 - n2) / n1) * 100;
    } else {
      return 100 - ((n1 - n2) / n1) * 100;
    }
  },
  // Random Range from to numbers
  random_range: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  // Random from Array
  random: (arr) => {
    if (arr.length) {
      return arr[Math.floor(Math.random() * arr.length)];
    } else {
      return null;
    }
  },
  //https://gist.github.com/IceCreamYou/6ffa1b18c4c8f6aeaad2
  percentile(arr) {
    let min = this.min(arr, true) || 0;
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
