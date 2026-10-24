<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */




$to_do_mvc_post_id = (int) get_the_ID();
$to_do_mvc_can_edit = to_do_mvc_user_can_edit( $to_do_mvc_post_id );

if ( $to_do_mvc_can_edit ) {
	$to_do_mvc_deny_message = '';
} elseif ( is_user_logged_in() ) {
	$to_do_mvc_deny_message = __( "You don't have permission to edit this to-do list. Only its author can change it.", 'to-do-mvc' );
} else {
	$to_do_mvc_deny_message = __( 'Log in as the author of this page to edit this to-do list.', 'to-do-mvc' );
}

// Give us all the default settings (state) when the app is first loaded.
wp_interactivity_state(
	'to-dos',
	array(
		'view'        => isset( $_GET['view'] ) ? sanitize_key( $_GET['view'] ) : 'all',
		'toDosLeft'   => 0,
		'hasToDos'    => false,
		'toDos'       => to_do_mvc_sanitize_todos( $attributes['todos'] ?? array() ),
		'canEdit'     => $to_do_mvc_can_edit,
		'denyMessage' => $to_do_mvc_deny_message,
		'loginUrl'    => is_user_logged_in() ? '' : wp_login_url( get_permalink( $to_do_mvc_post_id ) ),
		'restUrl'     => $to_do_mvc_can_edit ? rest_url( "to-do-mvc/v1/posts/{$to_do_mvc_post_id}/todos" ) : '',
		'nonce'       => $to_do_mvc_can_edit ? wp_create_nonce( 'wp_rest' ) : '',
		'warning'     => '',
	)
);
?>
<section
	<?php echo wp_kses_data( get_block_wrapper_attributes( array( 'class' => 'todoapp' ) ) ); ?>
	data-wp-interactive="to-dos"
	data-wp-watch="callbacks.saveTodos"
>
	<div class="todo-warning" role="alert" data-wp-bind--hidden="!state.warning">
		<span data-wp-text="state.warning"></span>
		<a data-wp-bind--hidden="!state.loginUrl" data-wp-bind--href="state.loginUrl"><?php esc_html_e( 'Log in', 'to-do-mvc' ); ?></a>
		<button type="button" data-wp-on--click="actions.dismissWarning" aria-label="<?php esc_attr_e( 'Dismiss', 'to-do-mvc' ); ?>">&times;</button>
	</div>
	<header class="header">
		<input
			class="new-todo"
			placeholder="What needs to be done?"
			autofocus
			data-wp-bind--readonly="!state.canEdit"
			data-wp-on--click="actions.requireEdit"
			data-wp-on-document--keydown="actions.onKeyDown"
		>
	</header>
	<section
		class="main"
		data-wp-bind--hidden="!state.hasToDos"
	>
		<input id="toggle-all" class="toggle-all" type="checkbox" data-wp-on--change="actions.markAllComplete">
		<label for="toggle-all">Mark all as complete</label>
		<ul class="todo-list">
			<template data-wp-each="state.todosToDisplay" data-wp-each-key="context.item.id">
				<li data-wp-class--completed="context.item.completed" data-wp-class--editing="state.isBeingEdited">
					<div class="view">
						<input
							class="toggle"
							type="checkbox"
							data-wp-bind--data-id="context.item.id"
							data-wp-bind--checked="context.item.completed"
							data-wp-on--change="actions.toggleCompleted"
						>
						<label data-wp-text="context.item.title" data-wp-on--dblclick="actions.editTodo"></label>
						<button class="destroy" data-wp-bind--data-id="context.item.id" data-wp-on--click="actions.deleteTodo"></button>
					</div>
					<!-- NEED TO FOCUS and then on blur have it go away -->
					<input
						class="edit"
						data-wp-bind--value="context.item.title"
						data-wp-on--blur="actions.editBlur"
						data-wp-on-document--keydown="actions.saveEditsForTodo"
					>
				</li>
			</template>
		</ul>
	</section>
	<!-- This footer should be hidden by default and shown when there are todos -->
	<footer
		class="footer"
		data-wp-bind--hidden="!state.hasToDos"
	>

		<!-- We have to hack this a bit by storing a ref and updating the innerHtml -->
		<span class="todo-count" data-wp-init="callbacks.initCounterSection" data-wp-watch="callbacks.updateCounterSection"></span>

		<!-- Remove this if you don't implement routing -->
		<ul class="filters">
			<li>
				<a data-status="all" data-wp-class--selected="state.checkViewState" data-wp-on--click="actions.showAllTodos" href="?view=all">All</a>
			</li>
			<li>
				<a data-status="active" data-wp-class--selected="state.checkViewState" data-wp-on--click="actions.showActiveTodos" href="?view=active">Active</a>
			</li>
			<li>
				<a data-status="completed" data-wp-class--selected="state.checkViewState" data-wp-on--click="actions.showCompletedTodos" href="?view=completed">Completed</a>
			</li>
		</ul>
		<!-- Hidden if no completed items are left ↓ -->
		<button class="clear-completed" data-wp-bind--hidden="!state.hasCompletedTodos" data-wp-on--click="actions.clearCompletedTodos">Clear completed</button>
	</footer>
</section>
