import Storage from '../storage/storage';

export default class NomieCaptureCli {
	constructor(options) {
		this.listeners = [];
		options = options || {};
		this.domain = options.domain;
		this.ready = false;
		this.plan = 'free';
		// Get Config Storage
		Storage.get('nomie-capture').then(captureConfig => {
			if (captureConfig) {
				this.apiKey = captureConfig.apiKey;
				this.plan = captureConfig.plan;
				this.privateKey = captureConfig.privateKey;
			}
			this.ready = true;
			this.fireReady();
		});
	}

	onReady(func) {
		if (this.ready) {
			func(this);
		} else {
			this.listeners.push(func);
		}
	}

	fireReady() {
		this.listeners.forEach(func => {
			func(this);
		});
	}

	baseUrl() {
		return this.domain.search('localhost') > -1 ? `http://${this.domain}` : `https://${this.domain}`;
	}
	isRegistered() {
		return (this.apiKey || '').length && (this.privateKey || '').length;
	}
	logs() {
		return this.post(
			'/logs',
			{},
			{
				api_key: this.apiKey,
				private_key: btoa(this.privateKey),
			}
		).then(payload => {
			if (payload.success) {
				return payload.results;
			} else {
				alert(payload.results.message);
			}
		});
	}
	unregister() {
		return this.post(
			'/unregister',
			{},
			{
				api_key: this.apiKey,
				private_key: btoa(this.privateKey),
			}
		).then(payload => {
			if (payload.success) {
				Storage.delete('nomie-capture');
				return payload.results;
			} else {
				alert(payload.results.message);
			}
		});
	}
	clear() {
		return this.post(
			'/clear',
			{},
			{
				api_key: this.apiKey,
				private_key: btoa(this.privateKey),
			}
		).then(payload => {
			if (payload.success) {
				return payload.results;
			} else {
				alert(payload.results.message);
			}
		});
	}
	async post(url, payload, additionalHeaders) {
		let headers = {
			'Content-Type': 'application/json',
		};
		let callingURL = `${this.baseUrl()}${url}`;
		let finalHeaders = { ...headers, ...additionalHeaders };

		// Call The service
		let results = await fetch(callingURL, {
			method: 'POST',
			headers: finalHeaders,
			body: JSON.stringify(payload),
		});
		// Get Payload back
		let cbPayload = await results.json();
		if (cbPayload.results.destroy) {
			Storage.delete('nomie-capture').then(() => {
				window.location.href = window.location.href;
			});
			// Destory the locally stored data.
		}

		return cbPayload;
	}
	register() {
		return new Promise((resolve, reject) => {
			this.post('/register').then(payload => {
				if (payload.success) {
					this.apiKey = payload.results.apiKey;
					this.privateKey = payload.results.privateKey;
					Storage.put('nomie-capture', payload.results).then(() => {
						resolve(payload.results);
					});
				} else {
					alert(payload.results.message);
				}
			});
		});
	}
}
