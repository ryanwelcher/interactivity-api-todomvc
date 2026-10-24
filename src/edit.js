/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __, _n } from '@wordpress/i18n';

/**
 * React hook for local component state.
 */
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Generates a unique id per block instance.
 */
import { useInstanceId } from '@wordpress/compose';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import {
	addTodo,
	clearCompleted,
	countLeft,
	removeTodo,
	toggleAll,
	updateTodo,
} from './todos';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The filters shown in the footer, in the same order as the front end.
 */
const FILTERS = {
	all: __( 'All', 'to-do-mvc' ),
	active: __( 'Active', 'to-do-mvc' ),
	completed: __( 'Completed', 'to-do-mvc' ),
};

/**
 * The text input shown while a to-do is being edited. It takes focus when it appears.
 *
 * @param {Object}   props          Component props.
 * @param {string}   props.value    Title to start editing from.
 * @param {Function} props.onFinish Called with the new title on Enter or blur.
 * @param {Function} props.onCancel Called on Escape.
 * @return {Element} Element to render.
 */
function EditInput( { value, onFinish, onCancel } ) {
	const ref = useRef();
	// Enter and Escape remove the input, which can also fire a blur. Only act once.
	const done = useRef( false );

	useEffect( () => {
		ref.current.focus();
	}, [] );

	const finish = ( callback, ...args ) => {
		if ( ! done.current ) {
			done.current = true;
			callback( ...args );
		}
	};

	return (
		<input
			ref={ ref }
			className="edit"
			defaultValue={ value }
			aria-label={ __( 'Edit to-do', 'to-do-mvc' ) }
			onBlur={ ( event ) => finish( onFinish, event.target.value ) }
			onKeyDown={ ( event ) => {
				if ( event.key === 'Enter' ) {
					finish( onFinish, event.target.value );
				} else if ( event.key === 'Escape' ) {
					finish( onCancel );
				}
			} }
		/>
	);
}

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * Phase 2: the markup and class names mirror `render.php`, so `style.scss`
 * styles the editor the same way it styles the front end. The list lives in
 * the `todos` attribute; the draft, filter and edited row are local state.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Updates block attributes.
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { todos } = attributes;
	const [ draft, setDraft ] = useState( '' );
	const [ view, setView ] = useState( 'all' );
	const [ editingId, setEditingId ] = useState( 0 );
	const instanceId = useInstanceId( Edit, 'to-do-mvc' );

	const setTodos = ( next ) => setAttributes( { todos: next } );
	const left = countLeft( todos );
	const allCompleted = todos.length > 0 && left === 0;
	const hasCompleted = left < todos.length;

	let visibleTodos = todos;
	if ( view === 'active' ) {
		visibleTodos = todos.filter( ( todo ) => ! todo.completed );
	} else if ( view === 'completed' ) {
		visibleTodos = todos.filter( ( todo ) => todo.completed );
	}

	// An empty title removes the to-do, as in TodoMVC.
	const finishEdit = ( id, value ) => {
		const title = value.trim();
		setEditingId( 0 );
		setTodos(
			title ? updateTodo( todos, id, { title } ) : removeTodo( todos, id )
		);
	};

	return (
		<section { ...useBlockProps( { className: 'todoapp' } ) }>
			<header className="header">
				<input
					className="new-todo"
					type="text"
					value={ draft }
					placeholder={ __( 'What needs to be done?', 'to-do-mvc' ) }
					aria-label={ __( 'New to-do', 'to-do-mvc' ) }
					onChange={ ( event ) => setDraft( event.target.value ) }
					onKeyDown={ ( event ) => {
						if ( event.key !== 'Enter' ) {
							return;
						}
						event.preventDefault();
						setTodos( addTodo( todos, draft ) );
						setDraft( '' );
					} }
				/>
			</header>

			{ todos.length > 0 && (
				<>
					<section className="main">
						<input
							id={ `${ instanceId }-toggle-all` }
							className="toggle-all"
							type="checkbox"
							checked={ allCompleted }
							onChange={ () => setTodos( toggleAll( todos ) ) }
						/>
						<label htmlFor={ `${ instanceId }-toggle-all` }>
							{ __( 'Mark all as complete', 'to-do-mvc' ) }
						</label>

						<ul className="todo-list">
							{ visibleTodos.map( ( todo ) => (
								<li
									key={ todo.id }
									className={ [
										todo.completed ? 'completed' : '',
										editingId === todo.id ? 'editing' : '',
									]
										.join( ' ' )
										.trim() }
								>
									<div className="view">
										<input
											className="toggle"
											type="checkbox"
											checked={ todo.completed }
											aria-label={ __(
												'Completed',
												'to-do-mvc'
											) }
											onChange={ () =>
												setTodos(
													updateTodo(
														todos,
														todo.id,
														{
															completed:
																! todo.completed,
														}
													)
												)
											}
										/>
										{ /* Not tied to the checkbox, so a double click edits instead of toggling, as on the front end. */ }
										{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
										<label
											onDoubleClick={ () =>
												setEditingId( todo.id )
											}
										>
											{ todo.title }
										</label>
										<button
											type="button"
											className="destroy"
											aria-label={ __(
												'Delete',
												'to-do-mvc'
											) }
											onClick={ () =>
												setTodos(
													removeTodo( todos, todo.id )
												)
											}
										/>
									</div>
									{ editingId === todo.id && (
										<EditInput
											value={ todo.title }
											onFinish={ ( value ) =>
												finishEdit( todo.id, value )
											}
											onCancel={ () => setEditingId( 0 ) }
										/>
									) }
								</li>
							) ) }
						</ul>
					</section>

					<footer className="footer">
						<span className="todo-count">
							<strong>{ left }</strong>{ ' ' }
							{ _n(
								'item left',
								'items left',
								left,
								'to-do-mvc'
							) }
						</span>

						<ul className="filters">
							{ Object.entries( FILTERS ).map(
								( [ status, label ] ) => (
									<li key={ status }>
										<a
											href={ `#${ status }` }
											className={
												view === status
													? 'selected'
													: undefined
											}
											onClick={ ( event ) => {
												event.preventDefault();
												setView( status );
											} }
										>
											{ label }
										</a>
									</li>
								)
							) }
						</ul>

						{ hasCompleted && (
							<button
								type="button"
								className="clear-completed"
								onClick={ () =>
									setTodos( clearCompleted( todos ) )
								}
							>
								{ __( 'Clear completed', 'to-do-mvc' ) }
							</button>
						) }
					</footer>
				</>
			) }
		</section>
	);
}
