import Logger from '../../utils/log/log';

// consts
const console = new Logger('🗺 locate.js');
const LOC_CACHE_KEY = 'loc-cache';

export default () => {
	let getRealLocation = () => {
		return new Promise((resolve, reject) => {
			let lookup = () => {
				navigator.geolocation.getCurrentPosition(
					pos => {
						let payload = {
							time: new Date().getTime(),
							latitude: pos.coords.latitude,
							longitude: pos.coords.longitude,
						};

						localStorage.setItem(LOC_CACHE_KEY, JSON.stringify(payload));
						resolve(payload);
					},
					e => {
						console.error(e);
						reject(e);
					},
					{
						timeout: 6000,
					}
				);
			};
			// Query the permissions - hoping this stops IOS from asking all the damn time.
			navigator.permissions.query({ name: 'geolocation' }).then(result => {
				if (result.state == 'granted') {
					console.log('accees', result.state);
					lookup();
				} else if (result.state == 'prompt') {
					console.log('accees', result.state);
					lookup();
				} else if (result.state == 'denied') {
					alert('Access to your device location has been denied');
				}
			});
		});
	};

	return new Promise((resolve, reject) => {
		let cachedRaw = JSON.parse(localStorage.getItem(LOC_CACHE_KEY) || 'null');

		try {
			if (cachedRaw) {
				if (new Date().getTime() - cachedRaw.time < 1000 * 60 * 2) {
					resolve({
						time: cachedRaw.time,
						latitude: cachedRaw.latitude,
						longitude: cachedRaw.longitude,
					});
				} else {
					if (!navigator.geolocation) {
						reject({ message: 'No geolocation service found' });
					} else {
						getRealLocation()
							.then(resolve)
							.catch(reject);
					} // end if have geo lookup
				} // end if cache exists
			} else {
				getRealLocation()
					.then(resolve)
					.catch(reject);
			}
		} catch (e) {
			reject(e);
		}
	});
};
