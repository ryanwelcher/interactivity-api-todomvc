/**
 * WordPress dependencies
 */
import {
	store,
	getElement,
	getContext,
	withScope,
} from '@wordpress/interactivity';

// Doesn't support modules
const { _n, _x } = wp.i18n;

// Enter key code.
const enterKeyCode = 13;

// Pending warning auto-dismiss and debounced save timers.
let warningTimer;
let saveTimer;

// The last list the server confirmed, as JSON. `null` until the first run.
let confirmedTodos = null;

// Store
const { state, actions, helpers } = store( 'to-dos', {
	state: {
		editingToDo: 0,
		// `toDos` comes from the server (render.php). Don't give it a default here,
		// or the client default replaces the server-rendered list.
		get hasToDos() {
			return state.toDos.length > 0;
		},
		get toDosLeft() {
			return state.toDos.filter( ( toDo ) => ! toDo.completed ).length;
		},
		get itemsLeft() {
			return ` ${ _n(
				'item',
				'items',
				state.toDosLeft,
				'to-do-mvc'
			) } left`;
		},
		get hasCompletedTodos() {
			return state.toDos.some( ( toDo ) => toDo.completed );
		},
		get isBeingEdited() {
			const {
				item: { id },
			} = getContext();
			return state.editingToDo == parseInt( id );
		},
		get todosToDisplay() {
			switch ( state.view ) {
				case 'active':
					return state.toDos.filter( ( toDo ) => ! toDo.completed );
				case 'completed':
					return state.toDos.filter( ( toDo ) => toDo.completed );
				default:
					return state.toDos;
			}
		},

		get checkViewState() {
			const {
				attributes: { 'data-status': status },
			} = getElement();

			return state.view === status;
		},
	},
	actions: {
		saveEditsForTodo: ( e ) => {
			switch ( e.keyCode ) {
				case enterKeyCode: {
					helpers.saveEditsForTodo();
				}
			}
		},
		onKeyDown: ( e ) => {
			switch ( e.keyCode ) {
				case enterKeyCode: {
					// Gets the element that is bound to the action.
					const { ref } = getElement();

					// The handler listens on the document, so only react to Enter in the new to-do input.
					if ( e.target !== ref ) {
						return;
					}

					if ( ! helpers.requireEdit( e ) ) {
						return;
					}

					const title = ref.value.trim();
					if ( state.editingToDo === 0 && title ) {
						// Add the new to-do to the list.
						state.toDos = [
							...state.toDos,
							{
								id: helpers.nextId(),
								title,
								completed: false,
							},
						];

						// Clear the input field.
						ref.value = '';
					}
				}
			}
		},
		toggleCompleted: ( e ) => {
			if ( ! helpers.requireEdit( e ) ) {
				return;
			}
			const {
				ref: {
					dataset: { id },
				},
			} = getElement();

			state.toDos = state.toDos.map( ( toDo ) => {
				if ( toDo.id === parseInt( id ) ) {
					toDo.completed = ! toDo.completed;
				}
				return toDo;
			} );
		},
		clearCompletedTodos: ( e ) => {
			if ( ! helpers.requireEdit( e ) ) {
				return;
			}
			state.toDos = state.toDos.filter( ( toDo ) => ! toDo.completed );
		},

		markAllComplete: ( e ) => {
			if ( ! helpers.requireEdit( e ) ) {
				return;
			}
			const allCompleted = state.toDos.every(
				( toDo ) => toDo.completed
			);
			state.toDos = state.toDos.map( ( toDo ) => {
				toDo.completed = ! allCompleted;
				return toDo;
			} );
		},
		deleteTodo: ( e ) => {
			if ( ! helpers.requireEdit( e ) ) {
				return;
			}
			const {
				ref: {
					dataset: { id },
				},
			} = getElement();

			state.toDos = state.toDos.filter(
				( toDo ) => toDo.id !== parseInt( id )
			);
		},
		editTodo: ( e ) => {
			if ( ! helpers.requireEdit( e ) ) {
				return;
			}
			const {
				item: { id },
			} = getContext();

			// Setting the todo id that is being edited.
			state.editingToDo = parseInt( id );

			// Works to set the focus on the clicked todo. We need to delay slightly to allow the todo edit input to be focused.
			setTimeout(
				withScope( () => {
					const { ref } = getElement();
					ref.closest( 'li' ).querySelector( '.edit' ).focus();
				} ),
				0
			);
		},

		requireEdit: ( e ) => {
			helpers.requireEdit( e );
		},
		dismissWarning: () => {
			clearTimeout( warningTimer );
			state.warning = '';
		},
		focused: ( e ) => {
			console.log( e );
		},
		editBlur: () => {
			helpers.saveEditsForTodo();
		},
		showAllTodos: ( e ) => {
			state.view = 'all';
			actions.navigate( e );
		},
		showActiveTodos: ( e ) => {
			state.view = 'active';
			actions.navigate( e );
		},
		showCompletedTodos: ( e ) => {
			state.view = 'completed';
			actions.navigate( e );
		},
		*navigate( e ) {
			e.preventDefault();
			const { actions } = yield import(
				'@wordpress/interactivity-router'
			);
			yield actions.navigate( e.target.href );
		},
	},
	callbacks: {
		saveTodos: () => {
			// Reading the serialized list makes this watcher re-run on every change.
			const current = JSON.stringify( state.toDos );

			if ( confirmedTodos === null ) {
				// First run: the server-rendered list is the confirmed one.
				confirmedTodos = current;
				return;
			}
			if ( ! state.canEdit || current === confirmedTodos ) {
				return;
			}

			clearTimeout( saveTimer );
			saveTimer = setTimeout( () => helpers.save( current ), 500 );
		},
		initCounterSection: () => {
			const { ref } = getElement();
			state.counterElement = ref;
		},
		updateCounterSection: () => {
			state.counterElement.innerHTML = `<strong>${ state.toDosLeft }</strong>${ state.itemsLeft }`;
		},
	},
	// This name is arbitrary.
	helpers: {
		// Next free id: highest existing id + 1.
		nextId: () =>
			state.toDos.reduce( ( max, toDo ) => Math.max( max, toDo.id ), 0 ) +
			1,
		// Shows a warning that goes away on its own.
		warn: ( message ) => {
			clearTimeout( warningTimer );
			state.warning = message;
			warningTimer = setTimeout( () => {
				state.warning = '';
			}, 6000 );
		},
		// Returns true if the user may edit. Otherwise warns and undoes the browser's own change.
		requireEdit: ( e ) => {
			if ( state.canEdit ) {
				return true;
			}
			if ( e ) {
				e.preventDefault?.();
				// The browser already flipped the checkbox; flip it back.
				if ( e.target?.type === 'checkbox' ) {
					e.target.checked = ! e.target.checked;
				}
			}
			helpers.warn( state.denyMessage );
			return false;
		},
		// Saves the list to the post. On failure shows the server's message and rolls back.
		save: async ( json ) => {
			try {
				const response = await fetch( state.restUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': state.nonce,
					},
					body: JSON.stringify( { todos: JSON.parse( json ) } ),
				} );
				if ( ! response.ok ) {
					const error = await response.json().catch( () => ( {} ) );
					throw new Error( error.message );
				}
				confirmedTodos = json;
			} catch ( error ) {
				helpers.warn(
					error.message ||
						_x(
							'Your changes could not be saved.',
							'to-do list save error',
							'to-do-mvc'
						)
				);
				// Roll back to the last list the server confirmed.
				state.toDos = JSON.parse( confirmedTodos );
			}
		},
		saveEditsForTodo: () => {
			const { ref } = getElement();
			const {
				item: { id },
			} = getContext();
			if ( state.editingToDo === id ) {
				state.toDos = [
					...state.toDos.map( ( toDo ) => {
						if ( toDo.id === parseInt( id ) ) {
							toDo.title = ref.value;
						}
						return toDo;
					} ),
				];
				state.editingToDo = 0;
			}
		},
	},
} );

/**
 * Helper to log the data in a readable format. Useful for debugging parts of the store.
 *
 * Use console.log for non-store values.
 *
 * @param {*} data
 * @returns
 */
const debugLog = ( data, message = 'Debug:' ) =>
	console.log( message, JSON.parse( JSON.stringify( data ) ) );
