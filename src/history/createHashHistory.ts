import compose, { ComposeFactory } from 'dojo-compose/compose';
import createEvented from 'dojo-compose/mixins/createEvented';
import global from 'dojo-core/global';
import { pausable, PausableHandle } from 'dojo-core/on';

import { History, HistoryOptions } from './interfaces';

export interface HashHistoryMixin {
	_current?: string;
	_location?: Location;
	_listener?: PausableHandle;
	_onHashchange(path: string): void;
}

/**
 * A browser-based history manager that uses the location hash to store the current value.
 */
export type HashHistory = History & HashHistoryMixin;

/**
 * Options for creating HashHistory instances.
 */
export interface HashHistoryOptions extends HistoryOptions {
	/**
	 * A DOM window object. HashHistory uses the `location` property and
	 * listens to `hashchange` events. The current value is initialized to the
	 * initial hash.
	 */
	window: Window;
}

export interface HashHistoryFactory extends ComposeFactory<HashHistory, HashHistoryOptions> {
	/**
	 * Create a new HashHistory instance.
	 * @param options Options to use during creation. If not specified the instance assumes
	 *   the global object is a DOM window.
	 */
	(options?: HashHistoryOptions): HashHistory;
}

const createHashHistory: HashHistoryFactory = compose({

	listen() {
		const { location } = global;
		const current = location.hash.slice(1);
		this._location = location;

		if (this._current !== current) {
			this._current = current;
			this.emit({
				type: 'change',
				value: this._current
			});
		}

		this._listener.pause();
	},

	unlisten() {
		this._listener.resume();
	},

	get current () {
		return this._current;
	},

	set (path: string) {
		this._current = path;
		this._location.hash = '#' + path;
	},

	replace (path: string) {
		this._current = path;

		const { pathname, search } = this._location;
		this._location.replace(pathname + search + '#' + path);

		this.emit({
			type: 'change',
			value: path
		});
	},

	_onHashchange (path: string) {
		this._current = path;
		this.emit({
			type: 'change',
			value: path
		});
	}
}).mixin({
	mixin: createEvented,
	initialize(instance: HashHistory, { window }: HashHistoryOptions = { window: global }) {
		const { location } = window;
		instance._listener = pausable(window, 'hashchange', () => {
			instance._onHashchange(location.hash.slice(1));
		});
		instance._listener.pause();
		instance.own(instance._listener);
	}
});

export default createHashHistory;
