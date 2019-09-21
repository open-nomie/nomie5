/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from 'svelte/store';

// utils
import Logger from '../utils/log/log';

// Vendors
import i18next from 'i18next';

import enUS from '../lang/en';
// import testLang from '../lang/test';

// Stores

const console = new Logger('🚦 Lang');

// Nomie API Store

const LangInit = () => {
	let base = {
		lang: 'en',
	};
	const { update, subscribe, set } = writable(base);

	i18next.init({
		lng: base.lang,
		resources: {
			en: enUS,
		},
	});

	const methods = {
		t(str, payload) {
			return i18next.t(str, payload);
		},
	};

	return {
		update,
		subscribe,
		set,
		...methods,
	};
};

export const Lang = LangInit();
