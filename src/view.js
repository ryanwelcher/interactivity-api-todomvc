/**
 * WordPress dependencies
 */
import { store, getElement, getContext } from '@wordpress/interactivity';

// import apiFetch from '@wordpress/api-fetch'; // Won't work.
// const apiFetch = wp.apiFetch;

const enterKeyCode = 13;
const { state } = store( 'to-dos', {
	state: {
		toDos: [],
		get hasToDos() {
			return state.toDos.length > 0;
		},
		get toDosLeft() {
			return state.toDos.filter( ( toDo ) => ! toDo.completed ).length;
		},
		get hasCompletedTodos() {
			return state.toDos.some( ( toDo ) => toDo.completed );
		},
		get capsSalutation() {
			return getContext().item.toLocaleUpperCase();
		},
	},
	actions: {
		onKeyDown: ( e ) => {
			switch ( e.keyCode ) {
				case enterKeyCode: {
					//??
					e.preventDefault();
					// Gets the element that is bound to the action.
					const { ref } = getElement();
					// Add the new to-do to the list.
					state.toDos.push( {
						id: state.toDos.length + 1,
						text: ref.value,
						completed: false,
					} );
					// Clear the input field.
					ref.value = '';
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
	},
	callbacks: {},
} );

/**
 * Helper to log the data in a readable format. Useful for debugging parts of the store.
 *
 * Use console.log for non-store values.
 *
 * @param {*} data
 * @returns
 */
const debugLog = ( data ) =>
	console.log( JSON.parse( JSON.stringify( data ) ) );
