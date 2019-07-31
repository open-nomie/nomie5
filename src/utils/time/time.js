import dayjs from 'dayjs';

export default {
	padTime(t) {
		return (t + '').length === 1 ? (t + '').padStart(2, '0') : t;
	},
	// Seconds to Time Chunk
	secondsToTime(secondsVar) {
		secondsVar = secondsVar || 0;
		let seconds = secondsVar.toFixed(0);
		let minutes = Math.floor(parseInt(seconds) / 60).toString();
		let hours = '';

		if (parseInt(minutes) > 59) {
			hours = this.padTime(Math.floor(parseInt(minutes) / 60).toString());
			minutes = this.padTime((parseInt(minutes) - parseInt(hours) * 60).toString());
		}

		seconds = this.padTime(Math.floor(parseInt(seconds) % 60).toString());
		minutes = this.padTime(minutes);

		if (hours !== '') {
			hours = parseInt(hours);
			return `${hours}:${minutes}:${seconds}`;
		}
		return `00:${minutes}:${seconds}`;
	},
	datetimeLocal(dateString) {
		let dateSplit = dateString.split('T');
		let dateStr = dateSplit[0];
		let timeStr = dateSplit[1];

		// This hack brought to you by datetime-local
		// iOS defaults to GMT - but it doesn't do it on
		// desktop browsers.
		let updatedDate = dayjs(dateStr, 'YYYY-MM-DD')
			.set('hour', timeStr.split(':')[0])
			.set('minute', timeStr.split(':')[1])
			.toDate();
		return updatedDate;
	},
	// Milliseconds to Seconds
	msToSecond(ms) {
		return ms / 1000;
	},
	timestringToSeconds(timestring) {
		let tsa = timestring.split(':');
		return this.unitsToSeconds(tsa[0], tsa[1], tsa[2]);
	},
	unitsToSeconds(hour, minutes, seconds) {
		let s = 0;
		s = (parseInt(hour) || 0) * 60 * 60;
		s = s + (parseInt(minutes) || 0) * 60;
		s = s + (parseInt(seconds) || 0);
		return s;
	},
	// Get an array from 00 to 59
	getNumberedArray(stopAt) {
		stopAt++;
		let items = [];
		for (var i = 0; i < stopAt; i++) {
			items.push((i + '').toString().length == 1 ? `0${i}` : `${i}`);
		}
		return items;
	},
};
