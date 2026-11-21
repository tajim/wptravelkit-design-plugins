<?php
/**
 * Put a starter template onto a Local test site the way Demo Importer Plus would.
 *
 * Run by load-starter.mjs:  wp eval-file load-starter.php <manifest.json> [restore]
 * Never run it on a live site: it changes the Travelscape theme_mods and the front page.
 *
 * What it does, in Demo Importer Plus order (Customizer data, content, site options):
 *   1. checks that Travelscape (the parent itself) is the active theme
 *   2. backs up theme_mods_travelscape once (to manifest.backupFile), before the first change
 *   3. theme_mods: merges manifest.themeMods into the current ones (Demo Importer Plus replaces
 *      them all; merging keeps the test site's other settings), then the Additional CSS
 *   4. images: uploads each file once (found again by the _d2b_asset meta), maps token -> URL
 *   5. pages: create or update by slug, Block Canvas template, published
 *   6. patterns: one unsynced wp_block ("My patterns") per page, in the template's category
 *   7. menu: rebuilds the template's menu and puts it in the primary location
 *   8. front page
 * With "restore" as the second argument it only puts the backed-up theme_mods back.
 *
 * Prints one JSON line with what it did.
 *
 * @package design-to-blocks
 */

// phpcs:disable WordPress.WP.AlternativeFunctions -- CLI helper on a Local site.

if ( ! defined( 'ABSPATH' ) || ! defined( 'WP_CLI' ) ) {
	exit( 1 );
}

$d2b_args = isset( $args ) ? $args : array();
if ( empty( $d2b_args[0] ) || ! is_readable( $d2b_args[0] ) ) {
	WP_CLI::error( 'Usage: wp eval-file load-starter.php <manifest.json> [restore]' );
}
$m = json_decode( file_get_contents( $d2b_args[0] ), true );
if ( ! is_array( $m ) ) {
	WP_CLI::error( 'The manifest is not valid JSON.' );
}

$stylesheet = get_option( 'stylesheet' );
$mods_key   = 'theme_mods_travelscape';

// Restore only.
if ( isset( $d2b_args[1] ) && 'restore' === $d2b_args[1] ) {
	if ( empty( $m['backupFile'] ) || ! is_readable( $m['backupFile'] ) ) {
		WP_CLI::error( 'No theme_mods backup found at ' . $m['backupFile'] );
	}
	$backup = json_decode( file_get_contents( $m['backupFile'] ), true );
	update_option( $mods_key, is_array( $backup['theme_mods'] ) ? $backup['theme_mods'] : array() );
	if ( isset( $backup['custom_css'] ) ) {
		wp_update_custom_css_post( (string) $backup['custom_css'], array( 'stylesheet' => 'travelscape' ) );
	}
	if ( isset( $backup['show_on_front'] ) ) {
		update_option( 'show_on_front', $backup['show_on_front'] );
		update_option( 'page_on_front', (int) $backup['page_on_front'] );
	}
	echo wp_json_encode( array( 'restored' => true, 'from' => $m['backupFile'] ) ) . "\n";
	return;
}

if ( 'travelscape' !== $stylesheet ) {
	WP_CLI::error( "The active theme is \"$stylesheet\". Starter templates run on the Travelscape parent alone: activate it first (wp theme activate travelscape). Other themes keep their own settings." );
}
$parent_version = wp_get_theme( 'travelscape' )->get( 'Version' );

// Block markup must reach the database untouched: no kses for this CLI run.
kses_remove_filters();

// 2. Backup, once.
if ( ! empty( $m['backupFile'] ) && ! file_exists( $m['backupFile'] ) ) {
	$css_post = wp_get_custom_css_post( 'travelscape' );
	file_put_contents(
		$m['backupFile'],
		wp_json_encode(
			array(
				'saved'         => gmdate( 'c' ),
				'theme_mods'    => get_option( $mods_key, array() ),
				'custom_css'    => $css_post ? $css_post->post_content : '',
				'show_on_front' => get_option( 'show_on_front' ),
				'page_on_front' => (int) get_option( 'page_on_front' ),
			),
			JSON_PRETTY_PRINT
		)
	);
}

// 3. theme_mods and Additional CSS.
$current = get_option( $mods_key, array() );
$current = is_array( $current ) ? $current : array();
update_option( $mods_key, array_merge( $current, $m['themeMods'] ) );
wp_update_custom_css_post( (string) $m['css'], array( 'stylesheet' => 'travelscape' ) );

// 4. Images.
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
$urls = array();
foreach ( $m['assets'] as $asset ) {
	$key   = $m['demoSlug'] . '/' . $asset['file'];
	$found = get_posts(
		array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'meta_key'       => '_d2b_asset', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'     => $key, // phpcs:ignore WordPress.DB.SlowDBQuery
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	if ( $found ) {
		$id = (int) $found[0];
	} else {
		$tmp = wp_tempnam( $asset['file'] );
		copy( $asset['src'], $tmp );
		$id = media_handle_sideload(
			array(
				'name'     => $asset['file'],
				'tmp_name' => $tmp,
			),
			0,
			$m['name'] . ' placeholder'
		);
		if ( is_wp_error( $id ) ) {
			WP_CLI::error( 'Upload failed for ' . $asset['file'] . ': ' . $id->get_error_message() );
		}
		update_post_meta( $id, '_d2b_asset', $key );
	}
	$urls[ $asset['file'] ] = wp_get_attachment_url( $id );
}
$swap = function ( $content ) use ( $urls, $m ) {
	return preg_replace_callback(
		'#' . preg_quote( $m['assetToken'], '#' ) . '([A-Za-z0-9._-]+)#',
		function ( $x ) use ( $urls ) {
			return isset( $urls[ $x[1] ] ) ? $urls[ $x[1] ] : $x[0];
		},
		$content
	);
};

// Create or update one post by type + slug.
$upsert = function ( $type, $slug, $title, $content, $menu_order = 0 ) {
	$existing = get_posts(
		array(
			'post_type'      => $type,
			'name'           => $slug,
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	$data     = array(
		'post_type'    => $type,
		'post_name'    => $slug,
		'post_title'   => $title,
		'post_content' => $content,
		'post_status'  => 'publish',
		'menu_order'   => $menu_order,
	);
	if ( $existing ) {
		$data['ID'] = (int) $existing[0];
	}
	$id = wp_insert_post( wp_slash( $data ), true );
	if ( is_wp_error( $id ) ) {
		WP_CLI::error( "Could not save $type \"$slug\": " . $id->get_error_message() );
	}
	return (int) $id;
};

// 5. Pages.
$out_pages = array();
foreach ( $m['pages'] as $i => $p ) {
	$id = $upsert( 'page', $p['slug'], $p['title'], $swap( $p['content'] ), $i );
	update_post_meta( $id, '_wp_page_template', $p['template'] );
	$out_pages[ $p['slug'] ] = array(
		'id'   => $id,
		'link' => get_permalink( $id ),
	);
}

// 6. Patterns (My patterns).
$cat      = $m['patternCategory'];
$term     = term_exists( $cat['slug'], 'wp_pattern_category' );
$term_id  = $term ? (int) $term['term_id'] : (int) wp_insert_term( $cat['name'], 'wp_pattern_category', array( 'slug' => $cat['slug'] ) )['term_id'];
$patterns = array();
foreach ( $m['patterns'] as $p ) {
	$id = $upsert( 'wp_block', $p['slug'], $p['title'], $swap( $p['content'] ) );
	update_post_meta( $id, 'wp_pattern_sync_status', 'unsynced' );
	wp_set_object_terms( $id, array( $term_id ), 'wp_pattern_category' );
	$patterns[] = $id;
}

// 7. Menu.
$menu = wp_get_nav_menu_object( $m['menu']['slug'] );
if ( ! $menu ) {
	$menu_id = wp_create_nav_menu( $m['menu']['name'] );
	if ( is_wp_error( $menu_id ) ) {
		WP_CLI::error( 'Menu: ' . $menu_id->get_error_message() );
	}
	wp_update_term( $menu_id, 'nav_menu', array( 'slug' => $m['menu']['slug'] ) );
} else {
	$menu_id = (int) $menu->term_id;
	foreach ( wp_get_nav_menu_items( $menu_id, array( 'post_status' => 'any' ) ) as $item ) {
		wp_delete_post( $item->ID, true );
	}
}
foreach ( $m['menuPages'] as $pos => $slug ) {
	if ( empty( $out_pages[ $slug ] ) ) {
		continue;
	}
	wp_update_nav_menu_item(
		$menu_id,
		0,
		array(
			'menu-item-object-id' => $out_pages[ $slug ]['id'],
			'menu-item-object'    => 'page',
			'menu-item-type'      => 'post_type',
			'menu-item-status'    => 'publish',
			'menu-item-position'  => $pos + 1,
		)
	);
}
$locations                         = get_theme_mod( 'nav_menu_locations', array() );
$locations[ $m['menuLocation'] ]   = $menu_id;
set_theme_mod( 'nav_menu_locations', $locations );

// 8. Front page.
if ( ! empty( $m['frontPage'] ) && ! empty( $out_pages[ $m['frontPage'] ] ) ) {
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $out_pages[ $m['frontPage'] ]['id'] );
}

// Let the theme and Travelscape Pro run their after-save work, as Demo Importer Plus does.
if ( ! class_exists( 'WP_Customize_Manager' ) ) {
	require_once ABSPATH . 'wp-includes/class-wp-customize-manager.php';
}
global $wp_customize;
if ( ! ( $wp_customize instanceof WP_Customize_Manager ) ) {
	$wp_customize = new WP_Customize_Manager(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
}
do_action( 'customize_save_after', $wp_customize );

echo wp_json_encode(
	array(
		'parentVersion'  => $parent_version,
		'blockSwitch'    => version_compare( $parent_version, '1.0.24', '>=' ) ? 'supported' : 'NOT SUPPORTED: Travelscape ' . $parent_version . ' has no travelscape_block_system switch (needs 1.0.24)',
		'proActive'      => function_exists( 'travelscape_customizer_defaults' ),
		'pages'          => $out_pages,
		'patterns'       => $patterns,
		'menu'           => $menu_id,
		'images'         => $urls,
		'cssBytes'       => strlen( (string) $m['css'] ),
		'frontPage'      => (int) get_option( 'page_on_front' ),
	)
) . "\n";
