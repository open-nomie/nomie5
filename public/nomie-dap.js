
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/containers/board/tracker-button.svelte generated by Svelte v3.6.4 */

    const file = "src/containers/board/tracker-button.svelte";

    function create_fragment(ctx) {
    	var button, header, span, t0, t1, i, t2, t3, footer, t4, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			header = element("header");
    			span = element("span");
    			t0 = text(ctx.value);
    			t1 = space();
    			i = element("i");
    			t2 = text(ctx.emoji);
    			t3 = space();
    			footer = element("footer");
    			t4 = text(ctx.label);
    			attr(span, "class", "value");
    			add_location(span, file, 40, 4, 861);
    			add_location(header, file, 39, 2, 848);
    			attr(i, "class", "emoji svelte-1xvz1p6");
    			add_location(i, file, 42, 2, 910);
    			add_location(footer, file, 43, 2, 941);
    			attr(button, "class", "" + (`n-tracker-button`) + " svelte-1xvz1p6");
    			add_location(button, file, 38, 0, 783);
    			dispose = listen(button, "click", ctx.methods.clicked);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, header);
    			append(header, span);
    			append(span, t0);
    			append(button, t1);
    			append(button, i);
    			append(i, t2);
    			append(button, t3);
    			append(button, footer);
    			append(footer, t4);
    		},

    		p: function update(changed, ctx) {
    			if (changed.value) {
    				set_data(t0, ctx.value);
    			}

    			if (changed.emoji) {
    				set_data(t2, ctx.emoji);
    			}

    			if (changed.label) {
    				set_data(t4, ctx.label);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	//Define The Properties
      let { label = "Unknown", emoji = "✅", value = 0 } = $$props;
      // Define Dispatch
      const dispatch = createEventDispatcher();

      // Functions
      let methods = {
        clicked() {
          dispatch("click", {});
        }
      };

    	const writable_props = ['label', 'emoji', 'value'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Tracker_button> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('label' in $$props) $$invalidate('label', label = $$props.label);
    		if ('emoji' in $$props) $$invalidate('emoji', emoji = $$props.emoji);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    	};

    	return { label, emoji, value, methods };
    }

    class Tracker_button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["label", "emoji", "value"]);
    	}

    	get label() {
    		throw new Error("<Tracker_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Tracker_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get emoji() {
    		throw new Error("<Tracker_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emoji(value) {
    		throw new Error("<Tracker_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tracker_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tracker_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        const invalidators = [];
        const store = readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                run_all(invalidators);
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
        return {
            subscribe(run, invalidate = noop) {
                invalidators.push(invalidate);
                const unsubscribe = store.subscribe(run, invalidate);
                return () => {
                    const index = invalidators.indexOf(invalidate);
                    if (index !== -1) {
                        invalidators.splice(index, 1);
                    }
                    unsubscribe();
                };
            }
        };
    }

    // import HookModel from './hook.class'
    // import { Reminder } from '../services/reminders/reminders.module'
    // import CardModel from './card.class'

    class TrackerConfig {
      constructor(starter) {
        // Starter is generic object with params
        starter = starter || {};
        // The tracker name
        this.tag = this.toTag(starter.tag || "");
        // Set the Type of the Input
        this.type = starter.type || "tick";
        // Set the color if it's passed
        this.color = starter.color || "#369DD3";
        // Set Math if it's passed
        this.math = starter.math || "sum";
        // Set Zeros is its passed
        this.ignore_zeros = starter.ignore_zeros || false;
        // Set UOM or default to num
        this.uom = starter.uom || "num";
        // Set if encrypt
        // this.always_encrypt = starter.always_encrypt === true ? true : false
        // Set if dirty
        this.dirty = starter._id ? false : true; // this isn't working
        // SEt Emoji
        this.emoji = starter.emoji || "⚪️";
        // set Default value
        this.default = starter.default || null;
        // max
        if (this.type === "range") {
          this.max = starter.max ? starter.max.toString() : "10";
          // min
          this.min = starter.max ? starter.min.toString() : "1";
          // cards
        }
        // score
        this.score = starter.score || null;
        // Dynamic Score
        this.score_calc = starter.score_calc || null;
        // Goal Config
        this.goal = starter.goal || null;
        // one tap
        this.one_tap = starter.one_tap === true ? true : false;

        this.note = starter.note || undefined;

        this.hidden = starter.hidden === true ? true : false;

        this.hook = starter.hook || null;

        if (this.type === "timer") {
          this.started = starter.started || null;
        }

        if (starter.decimal === true) {
          this.decimal = true;
        } else {
          this.decimal = false;
        }

        this.reminders = [];

        if (starter.reminders) {
          if (starter.reminders.length) {
            starter.reminders.forEach(reminder => {
              this.reminders.push(new Reminder(reminder));
            });
          }
        }

        if (starter.label) {
          this.label = starter.label;
        } else {
          this.label = this.displayTag();
          // this.label = 'dick'
        }
      }

      toTag(str) {
        return str.replace(/ /g, "_").toLowerCase();
      }

      // prepareCards(cards: Array) {
      // 	let newCards = []
      // 	cards.forEach(card => {
      // 		if (typeof card == 'object') {
      // 			newCards.push(new CardModel(card))
      // 		} else if (card.search('internal://') === 0) {
      // 			newCards.push(new CardModel(card))
      // 		}
      // 	})
      // 	return newCards
      // }

      displayTag() {
        let str = this.tag.replace(/_/g, " ") + "";
        return str;
      }

      displayValue(value) {
        return value;
        // return NomieUOM.displayValue(this.uom, Math.round(v * 100) / 100);
      }
    }

    // import nanoid from "nanoid";

    class Board {
      constructor(starter) {
        starter = starter || {};
        this.label = starter.label || "Unknown";
        this.id = starter.id || nanoid();
        this.trackers = (starter.trackers || []).map(tracker => {
          return new TrackerConfig(tracker);
        });
      }
    }

    var math = {
      // Average an Array
      average: arr => {
        if (arr.length) {
          return arr.reduce((p, c) => p + c, 0) / arr.length;
        } else {
          return 0;
        }
      },
      // Sum an array
      sum: arr => {
        if (arr.length) {
          return arr.reduce((sum, x) => sum + x);
        } else {
          return 0;
        }
      },
      // Round a number
      round: (num, amount) => {
        amount = amount || 100;
        return Math.round(amount * num) / amount;
      },
      // Get max from array
      max: arr => {
        if (arr.length) {
          return Math.max(...arr);
        } else {
          return 0;
        }
      },
      // Get the min from array
      min: (arr, includeZero) => {
        includeZero = includeZero === true ? true : false;
        if (arr.length) {
          if (includeZero) {
            return Math.min(...arr);
          } else {
            return Math.min.apply(null, arr.filter(Boolean));
          }
        } else {
          return 0;
        }
      },
      // Get the percentage of 2 numbers
      percentage: (n1, n2, flip) => {
        if (flip) {
          return ((n1 - n2) / n1) * 100;
        } else {
          return 100 - ((n1 - n2) / n1) * 100;
        }
      },
      // Random Range from to numbers
      random_range: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
      // Random from Array
      random: arr => {
        if (arr.length) {
          return arr[Math.floor(Math.random() * arr.length)];
        } else {
          return null;
        }
      }
    };

    var regexs = {
    	tag_v311: /(#[^\s|\.|#|\?)][\x00-\xFF][^\s]+)/,
    	tag: /(#[\x00-\xFF][^\s]+)/ //new as of 3.1.3
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var dayjs_min = createCommonjsModule(function (module, exports) {
    !function(t,n){module.exports=n();}(commonjsGlobal,function(){var t="millisecond",n="second",e="minute",r="hour",i="day",s="week",u="month",o="quarter",a="year",h=/^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/,f=/\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,c=function(t,n,e){var r=String(t);return !r||r.length>=n?t:""+Array(n+1-r.length).join(e)+t},d={s:c,z:function(t){var n=-t.utcOffset(),e=Math.abs(n),r=Math.floor(e/60),i=e%60;return (n<=0?"+":"-")+c(r,2,"0")+":"+c(i,2,"0")},m:function(t,n){var e=12*(n.year()-t.year())+(n.month()-t.month()),r=t.clone().add(e,u),i=n-r<0,s=t.clone().add(e+(i?-1:1),u);return Number(-(e+(n-r)/(i?r-s:s-r))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(h){return {M:u,y:a,w:s,d:i,h:r,m:e,s:n,ms:t,Q:o}[h]||String(h||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},$={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},l="en",m={};m[l]=$;var y=function(t){return t instanceof v},M=function(t,n,e){var r;if(!t)return null;if("string"==typeof t)m[t]&&(r=t),n&&(m[t]=n,r=t);else{var i=t.name;m[i]=t,r=i;}return e||(l=r),r},g=function(t,n,e){if(y(t))return t.clone();var r=n?"string"==typeof n?{format:n,pl:e}:n:{};return r.date=t,new v(r)},D=d;D.l=M,D.i=y,D.w=function(t,n){return g(t,{locale:n.$L,utc:n.$u})};var v=function(){function c(t){this.$L=this.$L||M(t.locale,null,!0)||l,this.parse(t);}var d=c.prototype;return d.parse=function(t){this.$d=function(t){var n=t.date,e=t.utc;if(null===n)return new Date(NaN);if(D.u(n))return new Date;if(n instanceof Date)return new Date(n);if("string"==typeof n&&!/Z$/i.test(n)){var r=n.match(h);if(r)return e?new Date(Date.UTC(r[1],r[2]-1,r[3]||1,r[4]||0,r[5]||0,r[6]||0,r[7]||0)):new Date(r[1],r[2]-1,r[3]||1,r[4]||0,r[5]||0,r[6]||0,r[7]||0)}return new Date(n)}(t),this.init();},d.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},d.$utils=function(){return D},d.isValid=function(){return !("Invalid Date"===this.$d.toString())},d.isSame=function(t,n){var e=g(t);return this.startOf(n)<=e&&e<=this.endOf(n)},d.isAfter=function(t,n){return g(t)<this.startOf(n)},d.isBefore=function(t,n){return this.endOf(n)<g(t)},d.$g=function(t,n,e){return D.u(t)?this[n]:this.set(e,t)},d.year=function(t){return this.$g(t,"$y",a)},d.month=function(t){return this.$g(t,"$M",u)},d.day=function(t){return this.$g(t,"$W",i)},d.date=function(t){return this.$g(t,"$D","date")},d.hour=function(t){return this.$g(t,"$H",r)},d.minute=function(t){return this.$g(t,"$m",e)},d.second=function(t){return this.$g(t,"$s",n)},d.millisecond=function(n){return this.$g(n,"$ms",t)},d.unix=function(){return Math.floor(this.valueOf()/1e3)},d.valueOf=function(){return this.$d.getTime()},d.startOf=function(t,o){var h=this,f=!!D.u(o)||o,c=D.p(t),d=function(t,n){var e=D.w(h.$u?Date.UTC(h.$y,n,t):new Date(h.$y,n,t),h);return f?e:e.endOf(i)},$=function(t,n){return D.w(h.toDate()[t].apply(h.toDate(),(f?[0,0,0,0]:[23,59,59,999]).slice(n)),h)},l=this.$W,m=this.$M,y=this.$D,M="set"+(this.$u?"UTC":"");switch(c){case a:return f?d(1,0):d(31,11);case u:return f?d(1,m):d(0,m+1);case s:var g=this.$locale().weekStart||0,v=(l<g?l+7:l)-g;return d(f?y-v:y+(6-v),m);case i:case"date":return $(M+"Hours",0);case r:return $(M+"Minutes",1);case e:return $(M+"Seconds",2);case n:return $(M+"Milliseconds",3);default:return this.clone()}},d.endOf=function(t){return this.startOf(t,!1)},d.$set=function(s,o){var h,f=D.p(s),c="set"+(this.$u?"UTC":""),d=(h={},h[i]=c+"Date",h.date=c+"Date",h[u]=c+"Month",h[a]=c+"FullYear",h[r]=c+"Hours",h[e]=c+"Minutes",h[n]=c+"Seconds",h[t]=c+"Milliseconds",h)[f],$=f===i?this.$D+(o-this.$W):o;if(f===u||f===a){var l=this.clone().set("date",1);l.$d[d]($),l.init(),this.$d=l.set("date",Math.min(this.$D,l.daysInMonth())).toDate();}else d&&this.$d[d]($);return this.init(),this},d.set=function(t,n){return this.clone().$set(t,n)},d.get=function(t){return this[D.p(t)]()},d.add=function(t,o){var h,f=this;t=Number(t);var c=D.p(o),d=function(n){var e=g(f);return D.w(e.date(e.date()+Math.round(n*t)),f)};if(c===u)return this.set(u,this.$M+t);if(c===a)return this.set(a,this.$y+t);if(c===i)return d(1);if(c===s)return d(7);var $=(h={},h[e]=6e4,h[r]=36e5,h[n]=1e3,h)[c]||1,l=this.valueOf()+t*$;return D.w(l,this)},d.subtract=function(t,n){return this.add(-1*t,n)},d.format=function(t){var n=this;if(!this.isValid())return "Invalid Date";var e=t||"YYYY-MM-DDTHH:mm:ssZ",r=D.z(this),i=this.$locale(),s=this.$H,u=this.$m,o=this.$M,a=i.weekdays,h=i.months,c=function(t,r,i,s){return t&&(t[r]||t(n,e))||i[r].substr(0,s)},d=function(t){return D.s(s%12||12,t,"0")},$=i.meridiem||function(t,n,e){var r=t<12?"AM":"PM";return e?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:o+1,MM:D.s(o+1,2,"0"),MMM:c(i.monthsShort,o,h,3),MMMM:h[o]||h(this,e),D:this.$D,DD:D.s(this.$D,2,"0"),d:String(this.$W),dd:c(i.weekdaysMin,this.$W,a,2),ddd:c(i.weekdaysShort,this.$W,a,3),dddd:a[this.$W],H:String(s),HH:D.s(s,2,"0"),h:d(1),hh:d(2),a:$(s,u,!0),A:$(s,u,!1),m:String(u),mm:D.s(u,2,"0"),s:String(this.$s),ss:D.s(this.$s,2,"0"),SSS:D.s(this.$ms,3,"0"),Z:r};return e.replace(f,function(t,n){return n||l[t]||r.replace(":","")})},d.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},d.diff=function(t,h,f){var c,d=D.p(h),$=g(t),l=6e4*($.utcOffset()-this.utcOffset()),m=this-$,y=D.m(this,$);return y=(c={},c[a]=y/12,c[u]=y,c[o]=y/3,c[s]=(m-l)/6048e5,c[i]=(m-l)/864e5,c[r]=m/36e5,c[e]=m/6e4,c[n]=m/1e3,c)[d]||m,f?y:D.a(y)},d.daysInMonth=function(){return this.endOf(u).$D},d.$locale=function(){return m[this.$L]},d.locale=function(t,n){if(!t)return this.$L;var e=this.clone();return e.$L=M(t,n,!0),e},d.clone=function(){return D.w(this.toDate(),this)},d.toDate=function(){return new Date(this.$d)},d.toJSON=function(){return this.toISOString()},d.toISOString=function(){return this.$d.toISOString()},d.toString=function(){return this.$d.toUTCString()},c}();return g.prototype=v.prototype,g.extend=function(t,n){return t(n,v,g),g},g.locale=M,g.isDayjs=y,g.unix=function(t){return g(1e3*t)},g.en=m[l],g.Ls=m,g});
    });

    function ExtractTrackers(text) {
      // Get all trackers from the text
      // Including #this and #this(123)
      // let trackers = text.match(/(#[a-z0-9_]+\((.+?\))|#[a-z0-9_]+)/gi) || [];
      let trackers = text.match(new RegExp(regexs.tag, "gi")) || [];
      // console.log("extractor trackers", trackers);
      // Create a Map for easy following
      let map = {};
      // Loop over each of the trackers found
      // console.log("Trackers", trackers);
      trackers.map(tracker => {
        // Reaplace and # or )
        tracker = tracker.replace(/(\#|\))/gi, "");
        // if (tracker.match(/\\n/g)) {
        //   // console.log("Tracker with Line Break", tracker);
        // }
        // Split it on (  to see if it's a value based tracker
        let trackerArr = tracker.split("(");
        // Get name from TrackerArr - even if its not a value based, it will be at 0 index
        let trackerName = trackerArr[0]
          .replace("#", "")
          .replace("\n", "")
          .toLowerCase();
        // Default the value to 1
        let value = 1;
        // It's trackerArr is more than 1, its a value based
        if (trackerArr.length > 1) {
          // Get the value from the 2nd part *asdfasdf* of the #key(asdfasdf)
          value = parseFloat(trackerArr[1].replace(/([a-zA-Z ])/g, ""));
        }
        // Add this to the map
        map[trackerName] = map[trackerName] || {
          tracker: trackerName,
          values: []
        };
        // Push the Value to this tracker names values
        map[trackerName].values.push(value);
      });

      // Lets get a final array ready
      let final = {};
      // Loop over the Map's keys (tracker names)
      for (var i in map) {
        // only save those that aren't standard
        if (
          ["#nomie", "nomie", "score", "rating", "enc", "b64img"].indexOf(i) == -1
        ) {
          map[i].value = math.sum(map[i].values);
          final[i] = {
            tracker: map[i].tracker,
            value: map[i].value
          };
        }
      }

      return final;
    }

    var crypt = createCommonjsModule(function (module) {
    (function() {
      var base64map
          = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

      crypt = {
        // Bit-wise rotation left
        rotl: function(n, b) {
          return (n << b) | (n >>> (32 - b));
        },

        // Bit-wise rotation right
        rotr: function(n, b) {
          return (n << (32 - b)) | (n >>> b);
        },

        // Swap big-endian to little-endian and vice versa
        endian: function(n) {
          // If number given, swap endian
          if (n.constructor == Number) {
            return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
          }

          // Else, assume array and swap all items
          for (var i = 0; i < n.length; i++)
            n[i] = crypt.endian(n[i]);
          return n;
        },

        // Generate an array of any length of random bytes
        randomBytes: function(n) {
          for (var bytes = []; n > 0; n--)
            bytes.push(Math.floor(Math.random() * 256));
          return bytes;
        },

        // Convert a byte array to big-endian 32-bit words
        bytesToWords: function(bytes) {
          for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
            words[b >>> 5] |= bytes[i] << (24 - b % 32);
          return words;
        },

        // Convert big-endian 32-bit words to a byte array
        wordsToBytes: function(words) {
          for (var bytes = [], b = 0; b < words.length * 32; b += 8)
            bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
          return bytes;
        },

        // Convert a byte array to a hex string
        bytesToHex: function(bytes) {
          for (var hex = [], i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 0xF).toString(16));
          }
          return hex.join('');
        },

        // Convert a hex string to a byte array
        hexToBytes: function(hex) {
          for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
          return bytes;
        },

        // Convert a byte array to a base-64 string
        bytesToBase64: function(bytes) {
          for (var base64 = [], i = 0; i < bytes.length; i += 3) {
            var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            for (var j = 0; j < 4; j++)
              if (i * 8 + j * 6 <= bytes.length * 8)
                base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
              else
                base64.push('=');
          }
          return base64.join('');
        },

        // Convert a base-64 string to a byte array
        base64ToBytes: function(base64) {
          // Remove non-base-64 characters
          base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

          for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
              imod4 = ++i % 4) {
            if (imod4 == 0) continue;
            bytes.push(((base64map.indexOf(base64.charAt(i - 1))
                & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
                | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
          }
          return bytes;
        }
      };

      module.exports = crypt;
    })();
    });

    var charenc = {
      // UTF-8 encoding
      utf8: {
        // Convert a string to a byte array
        stringToBytes: function(str) {
          return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
        },

        // Convert a byte array to a string
        bytesToString: function(bytes) {
          return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
        }
      },

      // Binary encoding
      bin: {
        // Convert a string to a byte array
        stringToBytes: function(str) {
          for (var bytes = [], i = 0; i < str.length; i++)
            bytes.push(str.charCodeAt(i) & 0xFF);
          return bytes;
        },

        // Convert a byte array to a string
        bytesToString: function(bytes) {
          for (var str = [], i = 0; i < bytes.length; i++)
            str.push(String.fromCharCode(bytes[i]));
          return str.join('');
        }
      }
    };

    var charenc_1 = charenc;

    /*!
     * Determine if an object is a Buffer
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */

    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    var isBuffer_1 = function (obj) {
      return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
    };

    function isBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
    }

    var md5 = createCommonjsModule(function (module) {
    (function(){
      var crypt$1 = crypt,
          utf8 = charenc_1.utf8,
          isBuffer = isBuffer_1,
          bin = charenc_1.bin,

      // The core
      md5 = function (message, options) {
        // Convert to byte array
        if (message.constructor == String)
          if (options && options.encoding === 'binary')
            message = bin.stringToBytes(message);
          else
            message = utf8.stringToBytes(message);
        else if (isBuffer(message))
          message = Array.prototype.slice.call(message, 0);
        else if (!Array.isArray(message))
          message = message.toString();
        // else, assume byte array already

        var m = crypt$1.bytesToWords(message),
            l = message.length * 8,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        // Swap endian
        for (var i = 0; i < m.length; i++) {
          m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
                 ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
        }

        // Padding
        m[l >>> 5] |= 0x80 << (l % 32);
        m[(((l + 64) >>> 9) << 4) + 14] = l;

        // Method shortcuts
        var FF = md5._ff,
            GG = md5._gg,
            HH = md5._hh,
            II = md5._ii;

        for (var i = 0; i < m.length; i += 16) {

          var aa = a,
              bb = b,
              cc = c,
              dd = d;

          a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
          d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
          c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
          b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
          a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
          d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
          c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
          b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
          a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
          d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
          c = FF(c, d, a, b, m[i+10], 17, -42063);
          b = FF(b, c, d, a, m[i+11], 22, -1990404162);
          a = FF(a, b, c, d, m[i+12],  7,  1804603682);
          d = FF(d, a, b, c, m[i+13], 12, -40341101);
          c = FF(c, d, a, b, m[i+14], 17, -1502002290);
          b = FF(b, c, d, a, m[i+15], 22,  1236535329);

          a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
          d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
          c = GG(c, d, a, b, m[i+11], 14,  643717713);
          b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
          a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
          d = GG(d, a, b, c, m[i+10],  9,  38016083);
          c = GG(c, d, a, b, m[i+15], 14, -660478335);
          b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
          a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
          d = GG(d, a, b, c, m[i+14],  9, -1019803690);
          c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
          b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
          a = GG(a, b, c, d, m[i+13],  5, -1444681467);
          d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
          c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
          b = GG(b, c, d, a, m[i+12], 20, -1926607734);

          a = HH(a, b, c, d, m[i+ 5],  4, -378558);
          d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
          c = HH(c, d, a, b, m[i+11], 16,  1839030562);
          b = HH(b, c, d, a, m[i+14], 23, -35309556);
          a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
          d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
          c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
          b = HH(b, c, d, a, m[i+10], 23, -1094730640);
          a = HH(a, b, c, d, m[i+13],  4,  681279174);
          d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
          c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
          b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
          a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
          d = HH(d, a, b, c, m[i+12], 11, -421815835);
          c = HH(c, d, a, b, m[i+15], 16,  530742520);
          b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

          a = II(a, b, c, d, m[i+ 0],  6, -198630844);
          d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
          c = II(c, d, a, b, m[i+14], 15, -1416354905);
          b = II(b, c, d, a, m[i+ 5], 21, -57434055);
          a = II(a, b, c, d, m[i+12],  6,  1700485571);
          d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
          c = II(c, d, a, b, m[i+10], 15, -1051523);
          b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
          a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
          d = II(d, a, b, c, m[i+15], 10, -30611744);
          c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
          b = II(b, c, d, a, m[i+13], 21,  1309151649);
          a = II(a, b, c, d, m[i+ 4],  6, -145523070);
          d = II(d, a, b, c, m[i+11], 10, -1120210379);
          c = II(c, d, a, b, m[i+ 2], 15,  718787259);
          b = II(b, c, d, a, m[i+ 9], 21, -343485551);

          a = (a + aa) >>> 0;
          b = (b + bb) >>> 0;
          c = (c + cc) >>> 0;
          d = (d + dd) >>> 0;
        }

        return crypt$1.endian([a, b, c, d]);
      };

      // Auxiliary functions
      md5._ff  = function (a, b, c, d, x, s, t) {
        var n = a + (b & c | ~b & d) + (x >>> 0) + t;
        return ((n << s) | (n >>> (32 - s))) + b;
      };
      md5._gg  = function (a, b, c, d, x, s, t) {
        var n = a + (b & d | c & ~d) + (x >>> 0) + t;
        return ((n << s) | (n >>> (32 - s))) + b;
      };
      md5._hh  = function (a, b, c, d, x, s, t) {
        var n = a + (b ^ c ^ d) + (x >>> 0) + t;
        return ((n << s) | (n >>> (32 - s))) + b;
      };
      md5._ii  = function (a, b, c, d, x, s, t) {
        var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
        return ((n << s) | (n >>> (32 - s))) + b;
      };

      // Package private blocksize
      md5._blocksize = 16;
      md5._digestsize = 16;

      module.exports = function (message, options) {
        if (message === undefined || message === null)
          throw new Error('Illegal argument ' + message);

        var digestbytes = crypt$1.wordsToBytes(md5(message, options));
        return options && options.asBytes ? digestbytes :
            options && options.asString ? bin.bytesToString(digestbytes) :
            crypt$1.bytesToHex(digestbytes);
      };

    })();
    });

    class Record {
      constructor(starter) {
        starter = starter || {};
        this.note = starter.note || "";
        this.end = starter.end || new Date().getTime();
        this.start = starter.start || new Date().getTime();
        this.score = starter.score || null;
        this.lat = starter.lat || null;
        this.lng = starter.lng || null;
        this.location = starter.location || "";

        if (!starter.id) {
          this._dirty = true;
        } else {
          this._dirty = undefined;
        }
        this._id =
          starter._id ||
          `${dayjs_min().format("YYYY/MM/DD/hh")}/${new Date().getTime()}`;
      }

      hash() {
        return md5([this.note, this.start, this.end, this.lat, this.lng].join(""));
      }

      addTag(tag, value) {
        if (value) {
          this.note = `${this.note} #${tag}(${value})`;
        } else {
          this.note = `${this.note} #${tag}`;
        }
        console.log("Added tag", this.note);
      }

      hasTracker(tracker) {
        return this.trackers.hasOwnProperty(tracker);
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

      expanded() {
        return Object.assign(this, {
          trackers: ExtractTrackers(this.note),
          duration: this.end - this.start,
          startDate: new Date(this.start),
          endDate: new Date(this.end)
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
          value: (this.trackers[tag] || {}).value || 0
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

    // Store the active Log
    const activelog = writable(
      new Record({
        note: ""
      })
    );
    // Store the Active Board
    const activeboard = writable(
      new Board({
        label: "Hi",
        id: "hi",
        trackers: [
          {
            label: "This is a Really",
            emoji: "🤦",
            tag: "peed"
          },
          {
            label: "Water",
            emoji: "✅",
            tag: "water"
          }
        ]
      })
    );

    /* src/containers/board/board.svelte generated by Svelte v3.6.4 */

    const file$1 = "src/containers/board/board.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.tracker = list[i];
    	return child_ctx;
    }

    // (60:2) {:else}
    function create_else_block(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No board selected";
    			attr(div, "class", "no-board");
    			add_location(div, file$1, 60, 4, 1345);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (49:2) {#if board}
    function create_if_block(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value = ctx.board.trackers;

    	const get_key = ctx => ctx.tracker.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(div, "class", "trackers svelte-16wq69l");
    			add_location(div, file$1, 49, 4, 1066);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.board.trackers;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    // (51:6) {#each board.trackers as tracker (tracker.id)}
    function create_each_block(key_1, ctx) {
    	var first, current;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	var trackerbutton = new Tracker_button({
    		props: {
    		label: ctx.tracker.label,
    		emoji: ctx.tracker.emoji
    	},
    		$$inline: true
    	});
    	trackerbutton.$on("click", click_handler);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			trackerbutton.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(trackerbutton, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var trackerbutton_changes = {};
    			if (changed.board) trackerbutton_changes.label = ctx.tracker.label;
    			if (changed.board) trackerbutton_changes.emoji = ctx.tracker.emoji;
    			trackerbutton.$set(trackerbutton_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(trackerbutton.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(trackerbutton.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			destroy_component(trackerbutton, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var main, current_block_type_index, if_block, current;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.board) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr(main, "class", "n-board svelte-16wq69l");
    			add_location(main, file$1, 46, 0, 1024);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(main);
    			}

    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

      // Let active startoff as null
      let board = null;
      let nomieLog = null;

      // Subscribe to the Active Board
      activeboard.subscribe(value => {
        $$invalidate('board', board = value);
      });
      activelog.subscribe(value => {
        nomieLog = value;
      });
      let trackerTap = tracker => {
        console.log("Tracker Tapps", tracker);
        nomieLog.addTag(tracker.tag);
        activelog.update(n => {
          return nomieLog;
        });
      };

    	function click_handler({ tracker }) {
    	            trackerTap(tracker);
    	          }

    	return { board, trackerTap, click_handler };
    }

    class Board$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/components/icon.svelte generated by Svelte v3.6.4 */

    const file$2 = "src/components/icon.svelte";

    // (5:0) {#if name === 'grid'}
    function create_if_block_3(ctx) {
    	var svg, g1, g0, path0, g3, g2, path1, g5, g4, path2, g7, g6, path3;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			path1 = svg_element("path");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			path2 = svg_element("path");
    			g7 = svg_element("g");
    			g6 = svg_element("g");
    			path3 = svg_element("path");
    			attr(path0, "d", "M176.792,0H59.208C26.561,0,0,26.561,0,59.208v117.584C0,209.439,26.561,236,59.208,236h117.584\n          C209.439,236,236,209.439,236,176.792V59.208C236,26.561,209.439,0,176.792,0z\n          M196,176.792c0,10.591-8.617,19.208-19.208,19.208\n          H59.208C48.617,196,40,187.383,40,176.792V59.208C40,48.617,48.617,40,59.208,40h117.584C187.383,40,196,48.617,196,59.208\n          V176.792z");
    			add_location(path0, file$2, 19, 8, 377);
    			add_location(g0, file$2, 18, 6, 365);
    			add_location(g1, file$2, 17, 4, 355);
    			attr(path1, "d", "M452,0H336c-33.084,0-60,26.916-60,60v116c0,33.084,26.916,60,60,60h116c33.084,0,60-26.916,60-60V60\n          C512,26.916,485.084,0,452,0z\n          M472,176c0,11.028-8.972,20-20,20H336c-11.028,0-20-8.972-20-20V60c0-11.028,8.972-20,20-20h116\n          c11.028,0,20,8.972,20,20V176z");
    			add_location(path1, file$2, 29, 8, 833);
    			add_location(g2, file$2, 28, 6, 821);
    			add_location(g3, file$2, 27, 4, 811);
    			attr(path2, "d", "M176.792,276H59.208C26.561,276,0,302.561,0,335.208v117.584C0,485.439,26.561,512,59.208,512h117.584\n          C209.439,512,236,485.439,236,452.792V335.208C236,302.561,209.439,276,176.792,276z\n          M196,452.792\n          c0,10.591-8.617,19.208-19.208,19.208H59.208C48.617,472,40,463.383,40,452.792V335.208C40,324.617,48.617,316,59.208,316h117.584\n          c10.591,0,19.208,8.617,19.208,19.208V452.792z");
    			add_location(path2, file$2, 38, 8, 1182);
    			add_location(g4, file$2, 37, 6, 1170);
    			add_location(g5, file$2, 36, 4, 1160);
    			attr(path3, "d", "M452,276H336c-33.084,0-60,26.916-60,60v116c0,33.084,26.916,60,60,60h116c33.084,0,60-26.916,60-60V336\n          C512,302.916,485.084,276,452,276z\n          M472,452c0,11.028-8.972,20-20,20H336c-11.028,0-20-8.972-20-20V336c0-11.028,8.972-20,20-20\n          h116c11.028,0,20,8.972,20,20V452z");
    			add_location(path3, file$2, 48, 8, 1657);
    			add_location(g6, file$2, 47, 6, 1645);
    			add_location(g7, file$2, 46, 4, 1635);
    			attr(svg, "version", "1.1");
    			attr(svg, "id", "Capa_1");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr(svg, "x", "0px");
    			attr(svg, "y", "0px");
    			attr(svg, "width", "24");
    			attr(svg, "height", "24");
    			attr(svg, "viewBox", "0 0 512 512");
    			set_style(svg, "enable-background", "new 0 0 512 512");
    			attr(svg, "xml:space", "preserve");
    			add_location(svg, file$2, 5, 2, 72);
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, g1);
    			append(g1, g0);
    			append(g0, path0);
    			append(svg, g3);
    			append(g3, g2);
    			append(g2, path1);
    			append(svg, g5);
    			append(g5, g4);
    			append(g4, path2);
    			append(svg, g7);
    			append(g7, g6);
    			append(g6, path3);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    // (59:0) {#if name === 'arrow-up'}
    function create_if_block_2(ctx) {
    	var svg, g, path;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr(path, "d", "m121.4,61.6l-54-54c-0.7-0.7-1.8-1.2-2.9-1.2s-2.2,0.5-2.9,1.2l-54,54c-1.6,1.6-1.6,4.2\n        0,5.8 0.8,0.8 1.8,1.2 2.9,1.2s2.1-0.4 2.9-1.2l47-47v98.1c0,2.3 1.8,4.1\n        4.1,4.1s4.1-1.8 4.1-4.1v-98.1l47,47c1.6,1.6 4.2,1.6 5.8,0s1.5-4.2\n        1.42109e-14-5.8z");
    			add_location(path, file$2, 68, 6, 2258);
    			add_location(g, file$2, 67, 4, 2248);
    			attr(svg, "version", "1.1");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "height", "26px");
    			attr(svg, "width", "26px");
    			attr(svg, "viewBox", "0 0 129 129");
    			attr(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr(svg, "enable-background", "new 0 0 129 129");
    			add_location(svg, file$2, 59, 2, 2033);
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, g);
    			append(g, path);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    // (78:0) {#if name === 'menu'}
    function create_if_block_1(ctx) {
    	var svg, g, path0, path1, path2;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr(path0, "d", "M112,6H12C5.4,6,0,11.4,0,18s5.4,12,12,12h100c6.6,0,12-5.4,12-12S118.6,6,112,6z");
    			add_location(path0, file$2, 91, 6, 2888);
    			attr(path1, "d", "M112,50H12C5.4,50,0,55.4,0,62c0,6.6,5.4,12,12,12h100c6.6,0,12-5.4,12-12C124,55.4,118.6,50,112,50z");
    			add_location(path1, file$2, 93, 6, 2994);
    			attr(path2, "d", "M112,94H12c-6.6,0-12,5.4-12,12s5.4,12,12,12h100c6.6,0,12-5.4,12-12S118.6,94,112,94z");
    			add_location(path2, file$2, 95, 6, 3119);
    			add_location(g, file$2, 90, 4, 2878);
    			attr(svg, "version", "1.1");
    			attr(svg, "id", "Capa_1");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr(svg, "x", "0px");
    			attr(svg, "y", "0px");
    			attr(svg, "width", "26px");
    			attr(svg, "height", "26px");
    			attr(svg, "viewBox", "0 0 124 124");
    			set_style(svg, "enable-background", "new 0 0 124 124");
    			attr(svg, "xml:space", "preserve");
    			add_location(svg, file$2, 78, 2, 2591);
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, g);
    			append(g, path0);
    			append(g, path1);
    			append(g, path2);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    // (102:0) {#if name === 'calendar'}
    function create_if_block$1(ctx) {
    	var svg, g1, g0, path0, path1, path2, path3, path4, path5, path6, path7, path8;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			attr(path0, "d", "M177.854,269.311c0-6.115-4.96-11.069-11.08-11.069h-38.665c-6.113,0-11.074,4.954-11.074,11.069v38.66\n          c0,6.123,4.961,11.079,11.074,11.079h38.665c6.12,0,11.08-4.956,11.08-11.079V269.311L177.854,269.311z");
    			add_location(path0, file$2, 116, 8, 3602);
    			attr(path1, "d", "M274.483,269.311c0-6.115-4.961-11.069-11.069-11.069h-38.67c-6.113,0-11.074,4.954-11.074,11.069v38.66\n          c0,6.123,4.961,11.079,11.074,11.079h38.67c6.108,0,11.069-4.956,11.069-11.079V269.311z");
    			add_location(path1, file$2, 119, 8, 3843);
    			attr(path2, "d", "M371.117,269.311c0-6.115-4.961-11.069-11.074-11.069h-38.665c-6.12,0-11.08,4.954-11.08,11.069v38.66\n          c0,6.123,4.96,11.079,11.08,11.079h38.665c6.113,0,11.074-4.956,11.074-11.079V269.311z");
    			add_location(path2, file$2, 122, 8, 4071);
    			attr(path3, "d", "M177.854,365.95c0-6.125-4.96-11.075-11.08-11.075h-38.665c-6.113,0-11.074,4.95-11.074,11.075v38.653\n          c0,6.119,4.961,11.074,11.074,11.074h38.665c6.12,0,11.08-4.956,11.08-11.074V365.95L177.854,365.95z");
    			add_location(path3, file$2, 125, 8, 4296);
    			attr(path4, "d", "M274.483,365.95c0-6.125-4.961-11.075-11.069-11.075h-38.67c-6.113,0-11.074,4.95-11.074,11.075v38.653\n          c0,6.119,4.961,11.074,11.074,11.074h38.67c6.108,0,11.069-4.956,11.069-11.074V365.95z");
    			add_location(path4, file$2, 128, 8, 4534);
    			attr(path5, "d", "M371.117,365.95c0-6.125-4.961-11.075-11.069-11.075h-38.67c-6.12,0-11.08,4.95-11.08,11.075v38.653\n          c0,6.119,4.96,11.074,11.08,11.074h38.67c6.108,0,11.069-4.956,11.069-11.074V365.95L371.117,365.95z");
    			add_location(path5, file$2, 131, 8, 4760);
    			attr(path6, "d", "M440.254,54.354v59.05c0,26.69-21.652,48.198-48.338,48.198h-30.493c-26.688,0-48.627-21.508-48.627-48.198V54.142\n          h-137.44v59.262c0,26.69-21.938,48.198-48.622,48.198H96.235c-26.685,0-48.336-21.508-48.336-48.198v-59.05\n          C24.576,55.057,5.411,74.356,5.411,98.077v346.061c0,24.167,19.588,44.015,43.755,44.015h389.82\n          c24.131,0,43.755-19.889,43.755-44.015V98.077C482.741,74.356,463.577,55.057,440.254,54.354z\n          M426.091,422.588\n          c0,10.444-8.468,18.917-18.916,18.917H80.144c-10.448,0-18.916-8.473-18.916-18.917V243.835c0-10.448,8.467-18.921,18.916-18.921\n          h327.03c10.448,0,18.916,8.473,18.916,18.921L426.091,422.588L426.091,422.588z");
    			add_location(path6, file$2, 134, 8, 4996);
    			attr(path7, "d", "M96.128,129.945h30.162c9.155,0,16.578-7.412,16.578-16.567V16.573C142.868,7.417,135.445,0,126.29,0H96.128\n          C86.972,0,79.55,7.417,79.55,16.573v96.805C79.55,122.533,86.972,129.945,96.128,129.945z");
    			add_location(path7, file$2, 142, 8, 5705);
    			attr(path8, "d", "M361.035,129.945h30.162c9.149,0,16.572-7.412,16.572-16.567V16.573C407.77,7.417,400.347,0,391.197,0h-30.162\n          c-9.154,0-16.577,7.417-16.577,16.573v96.805C344.458,122.533,351.881,129.945,361.035,129.945z");
    			add_location(path8, file$2, 145, 8, 5938);
    			add_location(g0, file$2, 115, 6, 3590);
    			add_location(g1, file$2, 114, 4, 3580);
    			attr(svg, "version", "1.1");
    			attr(svg, "id", "Capa_1");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr(svg, "x", "0px");
    			attr(svg, "y", "0px");
    			attr(svg, "width", "26px");
    			attr(svg, "height", "26px");
    			attr(svg, "viewBox", "0 0 488.152 488.152");
    			set_style(svg, "enable-background", "new 0 0 488.152 488.152");
    			attr(svg, "xml:space", "preserve");
    			add_location(svg, file$2, 102, 2, 3277);
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, g1);
    			append(g1, g0);
    			append(g0, path0);
    			append(g0, path1);
    			append(g0, path2);
    			append(g0, path3);
    			append(g0, path4);
    			append(g0, path5);
    			append(g0, path6);
    			append(g0, path7);
    			append(g0, path8);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var t0, t1, t2, if_block3_anchor;

    	var if_block0 = (ctx.name === 'grid') && create_if_block_3();

    	var if_block1 = (ctx.name === 'arrow-up') && create_if_block_2();

    	var if_block2 = (ctx.name === 'menu') && create_if_block_1();

    	var if_block3 = (ctx.name === 'calendar') && create_if_block$1();

    	return {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert(target, if_block3_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.name === 'grid') {
    				if (!if_block0) {
    					if_block0 = create_if_block_3();
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.name === 'arrow-up') {
    				if (!if_block1) {
    					if_block1 = create_if_block_2();
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (ctx.name === 'menu') {
    				if (!if_block2) {
    					if_block2 = create_if_block_1();
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (ctx.name === 'calendar') {
    				if (!if_block3) {
    					if_block3 = create_if_block$1();
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			if (if_block2) if_block2.d(detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			if (if_block3) if_block3.d(detaching);

    			if (detaching) {
    				detach(if_block3_anchor);
    			}
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { name = "grid" } = $$props;

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	return { name };
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["name"]);
    	}

    	get name() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // let geo =

    var geoLocate = () => {
      let getRealLocation = () => {
        return new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(pos => {
            let payload = {
              time: new Date().getTime(),
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            };
            localStorage.setItem("loc_cache", JSON.stringify(payload));
            resolve(payload);
          });
        });
      };

      return new Promise((resolve, reject) => {
        let cachedRaw = JSON.parse(localStorage.getItem("loc_cache") || "null");

        try {
          if (cachedRaw) {
            if (new Date().getTime() - cachedRaw.time < 1000 * 60 * 2) {
              resolve({
                time: cachedRaw.time,
                latitude: cachedRaw.latitude,
                longitude: cachedRaw.longitude
              });
            } else {
              if (!navigator.geolocation) {
                reject({ message: "No geolocation service found" });
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

    // import PouchDB from "pouchdb-browser";

    // let logs = new PouchDB("logs");
    // let trackers = new PouchDB("trackers");
    // let meta = new PouchDB("meta");

    // import PouchDBAdapter from "pouchdb-browser";
    // import Hoodie from "@hoodie/client";
    // const gun = Gun(["http://localhost:8081/gun"]);
    // const user = gun.user();

    // const hoodie = new Hoodie({
    //   url: window.location.origin,
    //   PouchDB: require("pouchdb-browser").default
    // });

    class User {
    	constructor(starter) {
    		starter = starter || {};
    		this.username = starter.username || null;
    		this.trackers = [];
    		this.profile = null;
    		this.ready = false;

    		// if (userSession.isSignInPending()) {
    		// 	userSession.handlePendingSignIn().then(userData => {
    		// 		this.profile = userData;
    		// 	});
    		// }

    		// this.db = user;
    		// window.user = this;
    	}

    	isLoggedIn() {
    		return this.profile === null ? false : true;
    	}

    	ready() {
    		return new Promise(resolve => {
    			resolve(true);
    		});
    	}

    	async db(type) {}

    	getTrackerById(id) {}

    	getTrackerByTag(tag) {}

    	getAllTrackers() {}

    	saveLog(log) {
    		delete log._dirty;
    		log.note = log.note.trim();
    		return logs.put(log);
    	}

    	login(username, password) {
    		return new Promise(resolve => {
    			// user.auth(username, password, ack => {
    			//   console.log("Authed", ack);
    			//   resolve(ack);
    			// });
    		});
    	}

    	locate() {
    		return geoLocate();
    	}

    	create(username, password) {
    		return new Promise(resolve => {
    			// user.create(username, password, ack => {
    			//   console.log("Registered", ack);
    			//   resolve(ack);
    			// });
    		});
    	}
    }

    var UserStore = writable(new User());

    /* src/components/capture-log.svelte generated by Svelte v3.6.4 */

    const file$3 = "src/components/capture-log.svelte";

    // (83:0) {:else}
    function create_else_block$1(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "loading";
    			add_location(p, file$3, 83, 2, 1929);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (74:0) {#if active}
    function create_if_block$2(ctx) {
    	var div1, div0, textarea, t, button, current, dispose;

    	var icon = new Icon({
    		props: { name: "arrow-up" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			textarea = element("textarea");
    			t = space();
    			button = element("button");
    			icon.$$.fragment.c();
    			attr(textarea, "placeholder", "What's Up?");
    			attr(textarea, "class", "svelte-cwhza4");
    			add_location(textarea, file$3, 76, 6, 1733);
    			attr(button, "class", "save-button svelte-cwhza4");
    			add_location(button, file$3, 77, 6, 1802);
    			attr(div0, "class", "mask-textarea svelte-cwhza4");
    			add_location(div0, file$3, 75, 4, 1699);
    			attr(div1, "class", "capture-log svelte-cwhza4");
    			add_location(div1, file$3, 74, 2, 1669);

    			dispose = [
    				listen(textarea, "input", ctx.textarea_input_handler),
    				listen(button, "click", ctx.saveLog)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, textarea);

    			textarea.value = ctx.active.note;

    			append(div0, t);
    			append(div0, button);
    			mount_component(icon, button, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.active) textarea.value = ctx.active.note;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_component(icon, );

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$2,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.active) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      let user = null;
      let active = null;

      UserStore.subscribe(u => {
        user = u;
      });

      activelog.subscribe(value => {
        $$invalidate('active', active = value);
        console.log("hi there!");
        console.log("active log do", value);
      });

      let saveLog = async () => {
        // try {
        //   let location = await user.locate();
        //   active.lat = location.latitude;
        //   active.lng = location.longitude;
        // } catch (e) {
        //   alert(e.message);
        // }

        let saved = await user.saveLog(active);
        $$invalidate('active', active = new Record());
        console.log("Saved the log", saved);
      };

    	function textarea_input_handler() {
    		active.note = this.value;
    		$$invalidate('active', active);
    	}

    	return { active, saveLog, textarea_input_handler };
    }

    class Capture_log extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/routes/track.svelte generated by Svelte v3.6.4 */

    const file$4 = "src/routes/track.svelte";

    function create_fragment$4(ctx) {
    	var t, div, current;

    	var board = new Board$1({ $$inline: true });

    	var capturelog = new Capture_log({ $$inline: true });

    	return {
    		c: function create() {
    			board.$$.fragment.c();
    			t = space();
    			div = element("div");
    			capturelog.$$.fragment.c();
    			attr(div, "id", "note-capture");
    			attr(div, "class", "svelte-1xt14nz");
    			add_location(div, file$4, 15, 0, 253);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(board, target, anchor);
    			insert(target, t, anchor);
    			insert(target, div, anchor);
    			mount_component(capturelog, div, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(board.$$.fragment, local);

    			transition_in(capturelog.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(board.$$.fragment, local);
    			transition_out(capturelog.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(board, detaching);

    			if (detaching) {
    				detach(t);
    				detach(div);
    			}

    			destroy_component(capturelog, );
    		}
    	};
    }

    class Track extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/routes/history.svelte generated by Svelte v3.6.4 */

    function create_fragment$5(ctx) {
    	return {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let user = null;
      let logs = [];
      UserStore.subscribe(u => {
        user = u;
        logs = user.db.get("2019");
        console.log("Logs", logs);
      });

    	return {};
    }

    class History extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
    	}
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.6.4 */

    function create_fragment$6(ctx) {
    	var current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $base, $location, $routes;

    	

      let { basepath = "/", url = null } = $$props;

      const locationContext = getContext(LOCATION);
      const routerContext = getContext(ROUTER);

      const routes = writable([]); validate_store(routes, 'routes'); subscribe($$self, routes, $$value => { $routes = $$value; $$invalidate('$routes', $routes); });
      const activeRoute = writable(null);
      let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

      // If locationContext is not set, this is the topmost Router in the tree.
      // If the `url` prop is given we force the location to it.
      const location =
        locationContext ||
        writable(url ? { pathname: url } : globalHistory.location); validate_store(location, 'location'); subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      // If routerContext is set, the routerBase of the parent Router
      // will be the base for this Router's descendants.
      // If routerContext is not set, the path and resolved uri will both
      // have the value of the basepath prop.
      const base = routerContext
        ? routerContext.routerBase
        : writable({
            path: basepath,
            uri: basepath
          }); validate_store(base, 'base'); subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });

      const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
        // If there is no activeRoute, the routerBase will be identical to the base.
        if (activeRoute === null) {
          return base;
        }

        const { path: basepath } = base;
        const { route, uri } = activeRoute;
        // Remove the potential /* or /*splatname from
        // the end of the child Routes relative paths.
        const path = route.default ? basepath : route.path.replace(/\*.*$/, "");

        return { path, uri };
      });

      function registerRoute(route) {
        const { path: basepath } = $base;
        let { path } = route;

        // We store the original path in the _path property so we can reuse
        // it when the basepath changes. The only thing that matters is that
        // the route reference is intact, so mutation is fine.
        route._path = path;
        route.path = combinePaths(basepath, path);

        if (typeof window === "undefined") {
          // In SSR we should set the activeRoute immediately if it is a match.
          // If there are more Routes being registered after a match is found,
          // we just skip them.
          if (hasActiveRoute) {
            return;
          }

          const matchingRoute = match(route, $location.pathname);
          if (matchingRoute) {
            activeRoute.set(matchingRoute);
            hasActiveRoute = true;
          }
        } else {
          routes.update(rs => {
            rs.push(route);
            return rs;
          });
        }
      }

      function unregisterRoute(route) {
        routes.update(rs => {
          const index = rs.indexOf(route);
          rs.splice(index, 1);
          return rs;
        });
      }

      if (!locationContext) {
        // The topmost Router in the tree is responsible for updating
        // the location store and supplying it through context.
        onMount(() => {
          const unlisten = globalHistory.listen(history => {
            location.set(history.location);
          });

          return unlisten;
        });

        setContext(LOCATION, location);
      }

      setContext(ROUTER, {
        activeRoute,
        base,
        routerBase,
        registerRoute,
        unregisterRoute
      });

    	const writable_props = ['basepath', 'url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $base: 1, $routes: 1, $location: 1 }) => {
    		if ($$dirty.$base) { {
            const { path: basepath } = $base;
            routes.update(rs => {
              rs.forEach(r => (r.path = combinePaths(basepath, r._path)));
              return rs;
            });
          } }
    		if ($$dirty.$routes || $$dirty.$location) { {
            const bestMatch = pick($routes, $location.pathname);
            activeRoute.set(bestMatch);
          } }
    	};

    	return {
    		basepath,
    		url,
    		routes,
    		location,
    		base,
    		$$slots,
    		$$scope
    	};
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, ["basepath", "url"]);
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.6.4 */

    // (39:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$3(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1$1,
    		create_else_block$2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.component !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (42:2) {:else}
    function create_else_block$2(ctx) {
    	var current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (40:2) {#if component !== null}
    function create_if_block_1$1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		ctx.routeParams,
    		ctx.routeProps
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.routeParams || changed.routeProps) ? get_spread_update(switch_instance_spread_levels, [
    				(changed.routeParams) && ctx.routeParams,
    				(changed.routeProps) && ctx.routeProps
    			]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, () => {
    						destroy_component(old_component);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) && create_if_block$3(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $activeRoute;

    	

      let { path = "", component = null } = $$props;

      const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER); validate_store(activeRoute, 'activeRoute'); subscribe($$self, activeRoute, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });

      const route = {
        path,
        // If no path prop is given, this Route will act as the default Route
        // that is rendered if no other Route in the Router is a match.
        default: path === ""
      };
      let routeParams = {};
      let routeProps = {};

      registerRoute(route);

      // There is no need to unregister Routes in SSR since it will all be
      // thrown away anyway.
      if (typeof window !== "undefined") {
        onDestroy(() => {
          unregisterRoute(route);
        });
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$new_props) $$invalidate('path', path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate('component', component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $activeRoute: 1, $$props: 1 }) => {
    		if ($$dirty.$activeRoute) { if ($activeRoute && $activeRoute.route === route) {
            $$invalidate('routeParams', routeParams = $activeRoute.params);
          } }
    		{
            const { path, component, ...rest } = $$props;
            $$invalidate('routeProps', routeProps = rest);
          }
    	};

    	return {
    		path,
    		component,
    		activeRoute,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, ["path", "component"]);
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.6.4 */

    const file$5 = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$8(ctx) {
    	var a, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	var a_levels = [
    		{ href: ctx.href },
    		{ "aria-current": ctx.ariaCurrent },
    		ctx.props
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			add_location(a, file$5, 40, 0, 1249);
    			dispose = listen(a, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.href) && { href: ctx.href },
    				(changed.ariaCurrent) && { "aria-current": ctx.ariaCurrent },
    				(changed.props) && ctx.props
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $base, $location;

    	

      let { to = "#", replace = false, state = {}, getProps = () => ({}) } = $$props;

      const { base } = getContext(ROUTER); validate_store(base, 'base'); subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });
      const location = getContext(LOCATION); validate_store(location, 'location'); subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });
      const dispatch = createEventDispatcher();

      let href, isPartiallyCurrent, isCurrent, props;

      function onClick(event) {
        dispatch("click", event);

        if (shouldNavigate(event)) {
          event.preventDefault();
          // Don't push another entry to the history stack when the user
          // clicks on a Link to the page they are currently on.
          const shouldReplace = $location.pathname === href || replace;
          navigate(href, { state, replace: shouldReplace });
        }
      }

    	const writable_props = ['to', 'replace', 'state', 'getProps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let ariaCurrent;

    	$$self.$$.update = ($$dirty = { to: 1, $base: 1, $location: 1, href: 1, isCurrent: 1, getProps: 1, isPartiallyCurrent: 1 }) => {
    		if ($$dirty.to || $$dirty.$base) { $$invalidate('href', href = to === "/" ? $base.uri : resolve(to, $base.uri)); }
    		if ($$dirty.$location || $$dirty.href) { $$invalidate('isPartiallyCurrent', isPartiallyCurrent = startsWith($location.pathname, href)); }
    		if ($$dirty.href || $$dirty.$location) { $$invalidate('isCurrent', isCurrent = href === $location.pathname); }
    		if ($$dirty.isCurrent) { $$invalidate('ariaCurrent', ariaCurrent = isCurrent ? "page" : undefined); }
    		if ($$dirty.getProps || $$dirty.$location || $$dirty.href || $$dirty.isPartiallyCurrent || $$dirty.isCurrent) { $$invalidate('props', props = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent
          })); }
    	};

    	return {
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		href,
    		props,
    		onClick,
    		ariaCurrent,
    		$$slots,
    		$$scope
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, ["to", "replace", "state", "getProps"]);
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/containers/layout/tabs.svelte generated by Svelte v3.6.4 */

    const file$6 = "src/containers/layout/tabs.svelte";

    // (36:2) <Link class="tab" to="/">
    function create_default_slot_2(ctx) {
    	var t, label, current;

    	var icon = new Icon({ props: { name: "grid" }, $$inline: true });

    	return {
    		c: function create() {
    			icon.$$.fragment.c();
    			t = space();
    			label = element("label");
    			label.textContent = "Track";
    			add_location(label, file$6, 37, 4, 789);
    		},

    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			insert(target, t, anchor);
    			insert(target, label, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);

    			if (detaching) {
    				detach(t);
    				detach(label);
    			}
    		}
    	};
    }

    // (40:2) <Link class="tab" to="/history">
    function create_default_slot_1(ctx) {
    	var t, label, current;

    	var icon = new Icon({
    		props: { name: "calendar" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			icon.$$.fragment.c();
    			t = space();
    			label = element("label");
    			label.textContent = "History";
    			add_location(label, file$6, 41, 4, 888);
    		},

    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			insert(target, t, anchor);
    			insert(target, label, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);

    			if (detaching) {
    				detach(t);
    				detach(label);
    			}
    		}
    	};
    }

    // (44:2) <Link class="tab" to="/settings">
    function create_default_slot(ctx) {
    	var t, label, current;

    	var icon = new Icon({ props: { name: "menu" }, $$inline: true });

    	return {
    		c: function create() {
    			icon.$$.fragment.c();
    			t = space();
    			label = element("label");
    			label.textContent = "Settings";
    			add_location(label, file$6, 45, 4, 986);
    		},

    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			insert(target, t, anchor);
    			insert(target, label, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);

    			if (detaching) {
    				detach(t);
    				detach(label);
    			}
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	var nav, t0, t1, current;

    	var link0 = new Link({
    		props: {
    		class: "tab",
    		to: "/",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		class: "tab",
    		to: "/history",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link2 = new Link({
    		props: {
    		class: "tab",
    		to: "/settings",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			nav = element("nav");
    			link0.$$.fragment.c();
    			t0 = space();
    			link1.$$.fragment.c();
    			t1 = space();
    			link2.$$.fragment.c();
    			attr(nav, "id", "app-tabs");
    			attr(nav, "class", "svelte-192aeev");
    			add_location(nav, file$6, 34, 0, 712);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			mount_component(link0, nav, null);
    			append(nav, t0);
    			mount_component(link1, nav, null);
    			append(nav, t1);
    			mount_component(link2, nav, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link0_changes = {};
    			if (changed.$$scope) link0_changes.$$scope = { changed, ctx };
    			link0.$set(link0_changes);

    			var link1_changes = {};
    			if (changed.$$scope) link1_changes.$$scope = { changed, ctx };
    			link1.$set(link1_changes);

    			var link2_changes = {};
    			if (changed.$$scope) link2_changes.$$scope = { changed, ctx };
    			link2.$set(link2_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);

    			transition_in(link1.$$.fragment, local);

    			transition_in(link2.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}

    			destroy_component(link0, );

    			destroy_component(link1, );

    			destroy_component(link2, );
    		}
    	};
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.6.4 */

    const file$7 = "src/App.svelte";

    // (30:0) <Router {url}>
    function create_default_slot$1(ctx) {
    	var t0, div, t1, current;

    	var apptabs = new Tabs({ $$inline: true });

    	var route0 = new Route({
    		props: { path: "history", component: History },
    		$$inline: true
    	});

    	var route1 = new Route({
    		props: { path: "/", component: Track },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			apptabs.$$.fragment.c();
    			t0 = space();
    			div = element("div");
    			route0.$$.fragment.c();
    			t1 = space();
    			route1.$$.fragment.c();
    			add_location(div, file$7, 31, 2, 692);
    		},

    		m: function mount(target, anchor) {
    			mount_component(apptabs, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			mount_component(route0, div, null);
    			append(div, t1);
    			mount_component(route1, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route0_changes = {};
    			if (changed.HistoryRoute) route0_changes.component = History;
    			route0.$set(route0_changes);

    			var route1_changes = {};
    			if (changed.TrackRoute) route1_changes.component = Track;
    			route1.$set(route1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(apptabs.$$.fragment, local);

    			transition_in(route0.$$.fragment, local);

    			transition_in(route1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(apptabs.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(apptabs, detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div);
    			}

    			destroy_component(route0, );

    			destroy_component(route1, );
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var current;

    	var router = new Router({
    		props: {
    		url: ctx.url,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.url) router_changes.url = ctx.url;
    			if (changed.$$scope) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	
      let { url = "" } = $$props;
      UserStore.subscribe(async u => {});

    	const writable_props = ['url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    	};

    	return { url };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$a, safe_not_equal, ["url"]);
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "world"
      }
    });
    console.log("App??????????????????????????????");

    return app;

}());
//# sourceMappingURL=nomie-dap.js.map
