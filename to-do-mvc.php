<?php
/**
 * Plugin Name:       To Do Mvc
 * Description:       A to-do block in the style of https://todomvc.com/
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       to-do-mvc
 *
 * @package ToDoMvc
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function to_do_mvc_to_do_mvc_block_init() {
	register_block_type( __DIR__ . '/build' );

	// Load non-module dependencies.
	wp_enqueue_script( 'wp-i18n' );
}
add_action( 'init', 'to_do_mvc_to_do_mvc_block_init' );

/**
 * Block name used to find the to-do list inside a post's content.
 */
const TO_DO_MVC_BLOCK_NAME = 'to-do-mvc/to-do-mvc';

/**
 * Cleans a list of to-dos before it is rendered or saved.
 *
 * Casts the id and completed state, strips markup from titles, drops blank
 * titles and re-ids duplicates so every to-do has a unique positive id.
 *
 * @param mixed $todos Raw value, usually the `todos` block attribute.
 * @return array[] List of `array( id, title, completed )`.
 */
function to_do_mvc_sanitize_todos( $todos ) {
	if ( ! is_array( $todos ) ) {
		return array();
	}

	$clean    = array();
	$used_ids = array();
	foreach ( $todos as $todo ) {
		if ( ! is_array( $todo ) || ! isset( $todo['title'] ) || ! is_string( $todo['title'] ) ) {
			continue;
		}
		$title = sanitize_text_field( $todo['title'] );
		if ( '' === $title ) {
			continue;
		}
		$id = isset( $todo['id'] ) ? absint( $todo['id'] ) : 0;
		if ( 0 === $id || isset( $used_ids[ $id ] ) ) {
			$id = ( $used_ids ? max( array_keys( $used_ids ) ) : 0 ) + 1;
		}
		$used_ids[ $id ] = true;
		$clean[]         = array(
			'id'        => $id,
			'title'     => $title,
			'completed' => ! empty( $todo['completed'] ),
		);
	}
	return $clean;
}

/**
 * Whether the current user may edit the to-do list of a post.
 *
 * Only a logged-in user who is the post's author (and can edit it) may.
 *
 * @param int $post_id Post that holds the to-do list.
 * @return bool
 */
function to_do_mvc_user_can_edit( $post_id ) {
	return is_user_logged_in()
		&& (int) get_post_field( 'post_author', $post_id ) === get_current_user_id()
		&& current_user_can( 'edit_post', $post_id );
}

/**
 * Sets the `todos` attribute on the first to-do block found in a list of blocks.
 *
 * @param array[] $blocks Parsed blocks, passed by reference.
 * @param array[] $todos  Sanitized to-dos.
 * @return bool Whether a block was found and updated.
 */
function to_do_mvc_set_todos_in_blocks( array &$blocks, array $todos ) {
	foreach ( $blocks as &$block ) {
		if ( TO_DO_MVC_BLOCK_NAME === $block['blockName'] ) {
			$block['attrs']['todos'] = $todos;
			return true;
		}
		if ( ! empty( $block['innerBlocks'] ) && to_do_mvc_set_todos_in_blocks( $block['innerBlocks'], $todos ) ) {
			return true;
		}
	}
	return false;
}

/**
 * REST callback: saves the to-dos back into the post's block attribute.
 *
 * @param WP_REST_Request $request Request with `id` and `todos`.
 * @return WP_REST_Response|WP_Error
 */
function to_do_mvc_rest_save_todos( WP_REST_Request $request ) {
	$post_id = (int) $request['id'];
	$post    = get_post( $post_id );
	if ( ! $post ) {
		return new WP_Error( 'to_do_mvc_not_found', __( 'This to-do list could not be found.', 'to-do-mvc' ), array( 'status' => 404 ) );
	}

	$todos  = to_do_mvc_sanitize_todos( $request['todos'] );
	$blocks = parse_blocks( $post->post_content );
	if ( ! to_do_mvc_set_todos_in_blocks( $blocks, $todos ) ) {
		return new WP_Error( 'to_do_mvc_no_block', __( 'This post does not contain a to-do list.', 'to-do-mvc' ), array( 'status' => 404 ) );
	}

	$result = wp_update_post(
		wp_slash(
			array(
				'ID'           => $post_id,
				'post_content' => serialize_blocks( $blocks ),
			)
		),
		true
	);
	if ( is_wp_error( $result ) ) {
		return $result;
	}

	return rest_ensure_response( array( 'todos' => $todos ) );
}

/**
 * Registers the route that saves a to-do list: POST /to-do-mvc/v1/posts/<id>/todos
 */
function to_do_mvc_register_rest_routes() {
	register_rest_route(
		'to-do-mvc/v1',
		'/posts/(?P<id>\d+)/todos',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'to_do_mvc_rest_save_todos',
			'permission_callback' => function ( WP_REST_Request $request ) {
				if ( ! is_user_logged_in() ) {
					return new WP_Error( 'to_do_mvc_logged_out', __( 'Log in as the author of this page to edit this to-do list.', 'to-do-mvc' ), array( 'status' => 401 ) );
				}
				if ( ! to_do_mvc_user_can_edit( (int) $request['id'] ) ) {
					return new WP_Error( 'to_do_mvc_forbidden', __( "You don't have permission to edit this to-do list. Only its author can change it.", 'to-do-mvc' ), array( 'status' => 403 ) );
				}
				return true;
			},
			'args'                => array(
				'todos' => array(
					'type'     => 'array',
					'required' => true,
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'to_do_mvc_register_rest_routes' );
