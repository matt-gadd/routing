import compose, { ComposeFactory } from 'dojo-compose/compose';
import createEvented from 'dojo-compose/mixins/createEvented';

import { History, HistoryOptions } from './interfaces';

export interface MemoryHistoryMixin {
	_current?: string;

	_location?: string;
}

/**
 * A memory-backed history manager. Can be used outside of browsers.
 */
export type MemoryHistory = History & MemoryHistoryMixin;

/**
 * Options for creating MemoryHistory instances.
 */
export interface MemoryHistoryOptions extends HistoryOptions {
	/**
	 * The current value is set to the path.
	 */
	path: string;
}

export interface MemoryHistoryFactory extends ComposeFactory<MemoryHistory, MemoryHistoryOptions> {
	/**
	 * Create a new MemoryHistory instance.
	 * @param options Options to use during creation. If not specified the instance sets
	 *   the current value to an empty string.
	 */
	(options?: MemoryHistoryOptions): MemoryHistory;
}

const createMemoryHistory: MemoryHistoryFactory = compose({

	listen () {
		const current = this._location;

		if (this._current !== current) {
			this._current = current;
			this.emit({
				type: 'change',
				value: this._current
			});
		}
	},

	unlisten () {},

	get current () {
		return this._current;
	},

	set (path: string) {
		this._current = path;
		this._location = path;
		this.emit({
			type: 'change',
			value: path
		});
	},

	replace (path: string) {
		this.set(path);
	}
}).mixin({
	mixin: createEvented,
	initialize(instance: MemoryHistory, { path }: MemoryHistoryOptions = { path: '' }) {
		instance._location = path;
	}
});

export default createMemoryHistory;
