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
const { _n } = wp.i18n;

// Enter key code.
const enterKeyCode = 13;

// Store
const { state, actions, helpers } = store( 'to-dos', {
	state: {
		init: true,
		editingToDo: 0,
		toDos: [],
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
				state.toDosLeft, // Hint: DON'T call 'state.toDosLeft()' here.
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
		getTodosToDisplay: () => {
			switch ( state.view ) {
				case 'active':
					return state.toDos.filter( ( toDo ) => ! toDo.completed );
				case 'completed':
					return state.toDos.filter( ( toDo ) => toDo.completed );
				default:
					return state.toDos;
			}
		},

		// Can this be simplified?
		isShowingAll: () => state.view === 'all',
		isShowingActive: () => state.view === 'active',
		isShowingCompleted: () => state.view === 'completed',
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

					if ( state.editingToDo === 0 ) {
						// Add the new to-do to the list.
						state.toDos = [
							...state.toDos,
							{
								id: state.toDos.length + 1,
								title: ref.value,
								completed: false,
							},
						];

						// Clear the input field.
						ref.value = '';
					}
				}
			}
		},
		toggleCompleted: () => {
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
		clearCompletedTodos: () => {
			state.toDos = state.toDos.filter( ( toDo ) => ! toDo.completed );
		},

		markAllComplete: () => {
			const allCompleted = state.toDos.every(
				( toDo ) => toDo.completed
			);
			state.toDos = state.toDos.map( ( toDo ) => {
				toDo.completed = ! allCompleted;
				return toDo;
			} );
		},
		deleteTodo: () => {
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
			if ( ! state.init ) {
				localStorage.setItem( 'toDos', JSON.stringify( state.toDos ) );
			}
		},
		loadTodos: () => {
			const toDos = localStorage.getItem( 'toDos' );
			if ( toDos ) {
				state.toDos = JSON.parse( toDos );
			}
			state.init = false;
		},
	},
	// This name is arbitrary.
	helpers: {
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
