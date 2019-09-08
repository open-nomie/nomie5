export default class PositivityCondition {
	constructor(starter) {
		starter = starter || {};
		this.if = starter.if || 'value';
		this.is = starter.is || 'gt';
		this.v = starter.v || 1;
		this.sc = starter.sc || 3;
	}
}
