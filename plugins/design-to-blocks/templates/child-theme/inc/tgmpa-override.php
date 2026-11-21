<?php
/**
 * Override parent TGMPA recommendations for Travel Royale.
 *
 * @package Travel_Royale
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Swap the parent TGMPA callback after both theme files have loaded.
 */
function travel_royale_override_recommended_plugins() {
	remove_action( 'tgmpa_register', 'travelscape_register_required_plugins' );
	add_action( 'tgmpa_register', 'travel_royale_register_required_plugins' );
}
add_action( 'after_setup_theme', 'travel_royale_override_recommended_plugins' );

/**
 * Recommend WP Travel Engine, Demo Importer Plus, and Contact Form 7.
 */
function travel_royale_register_required_plugins() {
	if ( ! function_exists( 'tgmpa' ) ) {
		return;
	}

	$plugins = array(
		array(
			'name'     => __( 'WP Travel Engine', 'travel-royale' ),
			'slug'     => 'wp-travel-engine',
			'required' => false,
		),
		array(
			'name'     => __( 'Demo Importer Plus', 'travel-royale' ),
			'slug'     => 'demo-importer-plus',
			'required' => false,
		),
		array(
			'name'     => __( 'Contact Form 7', 'travel-royale' ),
			'slug'     => 'contact-form-7',
			'required' => false,
		),
	);

	$config = array(
		'id'           => 'travel-royale',
		'default_path' => '',
		'menu'         => 'tgmpa-install-plugins',
		'has_notices'  => true,
		'dismissable'  => true,
		'dismiss_msg'  => '',
		'is_automatic' => false,
		'message'      => '',
	);

	tgmpa( $plugins, $config );
}
