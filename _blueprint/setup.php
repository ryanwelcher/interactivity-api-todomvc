<?php
/**
 * Plugin Name: Setup MVC To-do demo
 */

register_activation_hook(
	__FILE__,
	function () {

		// Create a new page.
		$page_args = [
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => '',
			'post_content' => '<!-- wp:to-do-mvc/to-do-mvc /-->'
		];
		$page_id = wp_insert_post( $page_args );

		if ( ! is_wp_error( $page_id ) ) {
			// Set the site to show the page on the front.
			update_option( 'show_on_front', 'page' );

			update_option( 'page_on_front', $page_id );
		}
	}
);
