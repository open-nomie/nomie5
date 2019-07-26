import ExtractTrackers from '../../utils/extract-trackers/extract-trackers';
import md5 from 'md5';
import regexs from '../../utils/regex';
export default class Record {
	constructor(starter) {
		starter = starter || {};
		// make a simple id - collision unlikely as they're stored in seperate books (by year);
		// TODO see why nanoid doesn't work with svelte
		this._id = starter._id || md5(Math.random() + new Date().getTime()).substr(0, 10);
		this.note = (starter.note || starter.notes || '').trim();
		this.end = starter.end || new Date().getTime();
		this.start = starter.start || new Date().getTime();
		this.score = starter.score || null;
		this.lat = starter.lat || null;
		this.lng = starter.lng || null;
		this.location = starter.location || '';
		this.modified = this.modified || false;

		if (!starter._id) {
			this._dirty = true;
		} else {
			delete this._dirty;
		}
	}

	hash() {
		return md5([this.note, this.start, this.end, this.lat, this.lng].join(''));
	}

	toObject() {
		return {
			_id: this._id,
			note: this.note,
			end: this.end,
			start: this.start,
			score: this.score,
			lat: this.lat,
			lng: this.lng,
			location: this.location,
		};
	}

	addTag(tag, value) {
		if (value) {
			this.note = `${this.note} #${tag}(${value})`;
		} else {
			this.note = `${this.note} #${tag}`;
		}
		return this;
	}

	hasTracker(trackerTag) {
		return this.trackers.hasOwnProperty(trackerTag);
	}

	noteTextLength() {
		let scrubbed = this.note.replace(new RegExp(regexs.tag, 'gi'), '').trim();
		return scrubbed.length;
	}

	positivityScore() {
		if (this.score === 1) {
			return -2;
		} else if (this.score === 2) {
			return -1;
		} else if (this.score === 4) {
			return 1;
		} else if (this.score === 5) {
			return 2;
		} else {
			return 0;
		}
	}

	expand() {
		return this.expanded();
	}

	expanded() {
		return Object.assign(this, {
			trackers: ExtractTrackers(this.note),
			duration: this.end - this.start,
			startDate: new Date(this.start),
			endDate: new Date(this.end),
		});
	}

	trackersArray() {
		let tks = ExtractTrackers(this.note);

		return Object.keys(tks).map(key => {
			return {
				tag: tks[key].tracker,
				value: tks[key].value,
			};
		});
	}

	public(tag) {
		return {
			duration: this.end - this.start,
			geo: this.lat ? [this.lat, this.lng] : null,
			startDate: new Date(this.start),
			endDate: new Date(this.end),
			start: new Date(this.start),
			end: new Date(this.end),
			value: (this.trackers[tag] || {}).value || 0,
		};
	}
}

// encrypted: boolean; // if the note should be encrypted
// encryptionKey; // the encryption key (passed via starter)
// start: Date; // when the log started
// end: Date; // when the log ended
// startDate; // from a calendar event
// endDate; // from a calendar event
// notes; // the note
// description; // for Android
// score: number; // overall score (from the stars )
// title; // title of the log
// isNomie: boolean; // is this a nomie event?
// trackers: any; // array of trackers
// location;
// geo: any;
// calendarId;
// id: any; // id of the event
// default: any; // default

// Record.createStatement = `
//   CREATE TABLE IF NOT EXISTS events (
//     id INT PRIMARY KEY NOT NULL,
//     notes TEXT NOT NULL,
//     start INT,
//     end INT,
//     score INT,
//     location CHAR(50),
//     lat INT,
//     lng INT
//   )
// `;

// Record.schema = {
//   name: "Record",
//   primaryKey: "_id",
//   properties: {
//     _id: { type: "string" },
//     notes: { type: "string" },
//     end: { type: "int" },
//     start: { type: "int" },
//     geo: { type: "float[]", optional: true },
//     location: { type: "string", optional: true },
//     score: { type: "int", optional: true },
//     tags: { type: "string[]", options: true }
//   }
// };
