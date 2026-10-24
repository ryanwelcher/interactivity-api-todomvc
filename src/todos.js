/**
 * Pure helpers for the to-do list stored in the `todos` block attribute.
 *
 * A to-do is `{ id: number, title: string, completed: boolean }`.
 * Every helper returns a new array and never mutates its input.
 */

/**
 * Returns the next unused id (highest existing id + 1).
 *
 * @param {Array} todos Current list.
 * @return {number} Next id.
 */
export function nextId( todos ) {
	return todos.reduce( ( max, todo ) => Math.max( max, todo.id ), 0 ) + 1;
}

/**
 * Appends a new, incomplete to-do. Blank titles are ignored.
 *
 * @param {Array}  todos Current list.
 * @param {string} title Title of the new to-do.
 * @return {Array} New list.
 */
export function addTodo( todos, title ) {
	const trimmed = title.trim();
	if ( ! trimmed ) {
		return todos;
	}
	return [
		...todos,
		{ id: nextId( todos ), title: trimmed, completed: false },
	];
}

/**
 * Merges `changes` into the to-do with the given id.
 *
 * @param {Array}  todos   Current list.
 * @param {number} id      Id of the to-do to change.
 * @param {Object} changes Properties to overwrite.
 * @return {Array} New list.
 */
export function updateTodo( todos, id, changes ) {
	return todos.map( ( todo ) =>
		todo.id === id ? { ...todo, ...changes } : todo
	);
}

/**
 * Removes the to-do with the given id.
 *
 * @param {Array}  todos Current list.
 * @param {number} id    Id of the to-do to remove.
 * @return {Array} New list.
 */
export function removeTodo( todos, id ) {
	return todos.filter( ( todo ) => todo.id !== id );
}

/**
 * Marks everything complete, or everything incomplete if all are already complete.
 *
 * @param {Array} todos Current list.
 * @return {Array} New list.
 */
export function toggleAll( todos ) {
	const allCompleted =
		todos.length > 0 && todos.every( ( t ) => t.completed );
	return todos.map( ( todo ) => ( { ...todo, completed: ! allCompleted } ) );
}

/**
 * Removes every completed to-do.
 *
 * @param {Array} todos Current list.
 * @return {Array} New list.
 */
export function clearCompleted( todos ) {
	return todos.filter( ( todo ) => ! todo.completed );
}

/**
 * Counts the incomplete to-dos.
 *
 * @param {Array} todos Current list.
 * @return {number} Number of items left.
 */
export function countLeft( todos ) {
	return todos.filter( ( todo ) => ! todo.completed ).length;
}
