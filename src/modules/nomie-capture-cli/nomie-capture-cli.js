import Storage from '../storage/storage';

export default class NomieCaptureCli {
	constructor(options) {
		options = options || {};
		this.domain = options.domain;
		this.apiKey = Storage.get('nomie-capture-ak');
		this.privateKey = Storage.get('nomie-capture-pk');
		this.registered = this.apiKey && this.privateKey;
	}
	baseUrl() {
		return this.domain.search('localhost') > -1 ? `http://${this.domain}` : `https://${this.domain}`;
	}
	post(url, payload, additionalHeaders) {
		let headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};
		return fetch(`${this.baseUrl()}${url}`, {
			method: 'POST',
			headers: { ...headers, ...additionalHeaders },
			body: JSON.stringify(payload),
		}).then(res => {
			return res.json();
		});
	}
	register() {
		this.post('/register').then(payload => {
			if (payload.success) {
				this.apiKey = payload.results.apiKey;
				Storage.put('nomie-capture-ak', payload.results.apiKey);
				setTimeout(() => {
					this.privateKey = payload.results.privateKey;
					Storage.put('nomie-capture-pk', payload.results.privateKey);
				}, 120);
			} else {
				alert(payload.results.message);
			}
		});
	}
}
