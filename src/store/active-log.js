import { writable } from 'svelte/store';
import NomieLog from '../modules/nomie-log/nomie-log';
import Logger from '../utils/log/log';

const console = new Logger('✴️ store/active-log.js');

const activeLogInit = () => {
	let base = new NomieLog().toObject();
	// Start with empty time - let ledger set it one.
	base.end = null;
	base.start = null;

	const { subscribe, set, update } = writable(base);

	const hooks = {
		onAdd: [],
		onAddTag: [],
	};

	const methods = {
		clear() {
			return update(n => {
				n = new NomieLog().toObject();
				n.start = null;
				n.end = null;
				return n;
			});
		},
		hook(hookType, func) {
			if (hooks[hookType].indexOf(func) === -1) {
				hooks[hookType] = hooks[hookType] || [];
				hooks[hookType].push(func);
			}
		},
		runHook(hookType, payload) {
			try {
				(hooks[hookType] || []).forEach(hook => {
					hook(payload);
				});
			} catch (e) {
				console.error('Hook error', e);
			}
		},
		updateNote(note) {
			update(b => {
				b.note = note;
				this.runHook('onUpdate', b);
				return b;
			});
		},
		asLog() {
			let log;
			update(b => {
				log = new NomieLog(b);
			});
			return log;
		},
		addTag(tag, value) {
			update(b => {
				if (!isNaN(value)) {
					b.note = `${b.note} #${tag}(${value})`;
				} else {
					b.note = `${b.note} #${tag}`;
				}
				this.runHook('onAddTag', { tag, value });
				return b;
			});
		},
	};

	return {
		subscribe,
		update,
		set,
		...methods,
	};
};

export const ActiveLogStore = activeLogInit();
