import Logger from '../../utils/log/log';
const console = new Logger('modules/hooks');

/**
 * Super Simple Hook System Listener Thing
 *
 * const hooks = new Hooky();
 * hooks.hook('onBeforeAdd', (payload)=>doSomething());
 * hooks.run('onBeforeAdd', 'goo');
 */

export default class Hooky {
	constructor() {
		this.hooks = {};
	}
	hook(hookName, func) {
		if (typeof func === 'function') {
			this.hooks[hookName] = this.hooks[hookName] || [];
			this.hooks[hookName].push(func);
		}
	}
	run(hookName, payload) {
		if (this.hooks.hasOwnProperty(hookName)) {
			this.hooks[hookName].forEach(hook => {
				hook(payload);
			});
		} else {
			// Silently faile
			// console.log(`Error: hook ${hookName} is not defined`);
		}
	}
}
