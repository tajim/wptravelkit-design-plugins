<?php
/**
 * Travel Royale child theme for Travelscape.
 *
 * @package Travel_Royale
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$travel_royale_theme = wp_get_theme();
define( 'TRAVEL_ROYALE_VERSION', $travel_royale_theme->get( 'Version' ) );
define( 'TRAVEL_ROYALE_DIR', get_stylesheet_directory() );

add_filter( 'travelscape_enable_scroll_animations', '__return_true' );

/**
 * Opt into the Travelscape block system, block header/footer and WP Travel Engine styles.
 */
function travel_royale_setup() {
	add_theme_support( 'travelscape-block-system' );
	add_theme_support( 'travelscape-block-header-footer' );
	add_theme_support(
		'travelscape-wpte-styles',
		array(
			'name'        => 'royale',
			'label'       => __( 'Royale', 'travel-royale' ),
			'trips'       => 'assets/css/trips.css',
			'trip-search' => 'assets/css/trip-search.css',
			'terms'       => 'assets/css/terms.css',
		)
	);
	register_block_pattern_category(
		'travel-royale-pages',
		array( 'label' => __( 'Travel Royale Pages', 'travel-royale' ) )
	);
}
add_action( 'after_setup_theme', 'travel_royale_setup' );

require_once TRAVEL_ROYALE_DIR . '/inc/theme-setup.php';
require_once TRAVEL_ROYALE_DIR . '/inc/tgmpa-override.php';

/**
 * Transparent header over the hero.
 *
 * Adds a body class on Block Canvas pages whose first block is a Cover,
 * so the header sits on top of the hero image (see style.css).
 *
 * @param string[] $classes Body classes.
 * @return string[]
 */
function travel_royale_body_classes( $classes ) {
	if ( ! is_singular() || ! is_page_template( 'page-templates/template-block-canvas.php' ) ) {
		return $classes;
	}

	$post = get_post();
	if ( ! $post || ! has_blocks( $post ) ) {
		return $classes;
	}

	foreach ( parse_blocks( $post->post_content ) as $block ) {
		if ( empty( $block['blockName'] ) ) {
			continue;
		}
		if ( 'core/cover' === $block['blockName'] ) {
			$classes[] = 'travel-royale-overlay-header';
		}
		break;
	}

	return $classes;
}
add_filter( 'body_class', 'travel_royale_body_classes' );

/**
 * Demo Importer Plus API IDs (pluggable; the parent calls this when present).
 */
if ( ! function_exists( 'travelscape_demo_importer_checked' ) ) {
	function travelscape_demo_importer_checked() {
		if ( function_exists( 'DEMO_IMPORTER_PLUS_setup' ) ) {
			add_filter(
				'demo_importer_plus_api_id',
				function () {
					return array( 'REPLACE_WITH_DEMO_ID' );
				}
			);
		}
	}
}
