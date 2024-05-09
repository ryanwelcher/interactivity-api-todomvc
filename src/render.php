<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */




// Give us all the default settings (state) when the app is first loaded.
wp_interactivity_state(
	'to-dos',
	array(
		'view'      => isset( $_GET['view'] ) ? sanitize_key( $_GET['view'] ) : 'all',
		'toDosLeft' => 0,
		'hasToDos'  => false
	)
);
?>
<section
	<?php echo wp_kses_data( get_block_wrapper_attributes( array( "class" => "todoapp" ) ) ); ?>
	data-wp-interactive="to-dos"
	data-wp-watch="callbacks.saveTodos"
	data-wp-init="callbacks.loadTodos"
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
			<template data-wp-each="state.getTodosToDisplay" data-wp-each-key="context.item.id">
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
		<!-- This should be `0 items left` by default -->
		<span class="todo-count">
			<strong data-wp-text="state.toDosLeft"></strong>
			<span data-wp-text="state.itemsLeft">ddd</span>
		</span>

		<!-- THERE IS NO WAY OF UPDATING HTML CURRENTLY
			<span class="todo-count"><strong>X</strong>item(s) left</span>
		-->
		<!-- Remove this if you don't implement routing -->
		<ul class="filters">
			<li>
				<a data-wp-class--selected="state.isShowingAll" data-wp-on--click="actions.showAllTodos" href="?view=all">All</a>
			</li>
			<li>
				<a data-wp-class--selected="state.isShowingActive" data-wp-on--click="actions.showActiveTodos" href="?view=active">Active</a>
			</li>
			<li>
				<a data-wp-class--selected="state.isShowingCompleted" data-wp-on--click="actions.showCompletedTodos" href="?view=completed">Completed</a>
			</li>
		</ul>
		<!-- Hidden if no completed items are left ↓ -->
		<button class="clear-completed" data-wp-bind--hidden="!state.hasCompletedTodos" data-wp-on--click="actions.clearCompletedTodos">Clear completed</button>
	</footer>
</section>
