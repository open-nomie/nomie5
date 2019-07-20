export default {
	// Sum an array
	sum: arr => {
		if (arr.length) {
			return arr.reduce((sum, x) => sum + x);
		} else {
			return 0;
		}
	},
	// Round a number
	round: (num, amount) => {
		amount = amount || 100;
		return Math.round(amount * num) / amount;
	},
	// Get max from array
	max: arr => {
		if (arr.length) {
			return Math.max(...arr);
		} else {
			return 0;
		}
	},
	// Get the min from array
	min: (arr, includeZero) => {
		includeZero = includeZero === true ? true : false;
		if (arr.length) {
			if (includeZero) {
				return Math.min(...arr);
			} else {
				return Math.min.apply(null, arr.filter(Boolean));
			}
		} else {
			return 0;
		}
	},
	// Average an Array
	average: (arr, ignoreZeros) => {
		if (ignoreZeros) {
			arr = arr.filter(row => {
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
	percentage: (n1, n2, flip) => {
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
	random: arr => {
		if (arr.length) {
			return arr[Math.floor(Math.random() * arr.length)];
		} else {
			return null;
		}
	},
	//https://gist.github.com/IceCreamYou/6ffa1b18c4c8f6aeaad2
	percentile(arr) {
		return arr.map((d, i) => {
			return ((100 * d) / arr.reduce((a, b) => a + b, 0)) | 0;
		});
	},
};
