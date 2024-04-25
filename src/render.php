<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

global $post;
wp_interactivity_state(
	'to-dos',
	array(
		'toDosLeft' => 0,
		'toDos'     => get_post_meta( $post->ID, 'todos', true )
	)
);
?>
<section
	<?php echo wp_kses_data( get_block_wrapper_attributes( array( "class" => "todoapp" ) ) ); ?>
	data-wp-interactive='to-dos'
>
	<header class="header">
		<h1>todos</h1>
		<input
			class="new-todo"
			placeholder="What needs to be done?"
			autofocus
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
			<template data-wp-each="state.toDos" data-wp-each-key="context.item.id">
				<li data-wp-class--completed="context.item.completed">
					<div class="view">
						<input
							class="toggle"
							type="checkbox"
							data-wp-bind--data-id="context.item.id"
							data-wp-bind--checked="context.item.completed"
							data-wp-on--change="actions.toggleCompleted"
						>
						<label data-wp-text="context.item.text"></label>
						<button class="destroy" data-wp-bind--data-id="context.item.id" data-wp-on--click="actions.deleteTodo"></button>
					</div>
					<input class="edit" data-wp-bind--value="context.item.text">
				</li>
			</template>
		</ul>
	</section>
	<!-- This footer should be hidden by default and shown when there are todos -->
	<footer
		class="footer"
		data-wp-bind--hidden="!state.hasToDos"
	>
		<!-- This should be `0 items left` by default -->
		<span class="todo-count"><strong data-wp-text="state.toDosLeft"></strong> item left</span>
		<!-- Remove this if you don't implement routing -->
		<ul class="filters">
			<li>
				<a class="selected" href="#/">All</a>
			</li>
			<li>
				<a href="#/active">Active</a>
			</li>
			<li>
				<a href="#/completed">Completed</a>
			</li>
		</ul>
		<!-- Hidden if no completed items are left ↓ -->
		<button class="clear-completed" data-wp-bind--hidden="!state.hasCompletedTodos" data-wp-on--click="actions.clearCompletedTodos">Clear completed</button>
	</footer>
</section>
