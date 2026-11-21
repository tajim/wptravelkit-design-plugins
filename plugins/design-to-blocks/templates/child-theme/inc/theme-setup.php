<?php
/**
 * Styles, fonts and Travelscape design tokens for Travel Royale.
 *
 * @package Travel_Royale
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue the child stylesheet after the parent (and WP Travel Engine when present).
 */
function travel_royale_enqueue_styles() {
	$deps = array( 'travelscape-style' );
	if ( wp_style_is( 'wp-travel-engine', 'registered' ) ) {
		$deps[] = 'wp-travel-engine';
	}
	wp_enqueue_style( 'travel-royale-style', get_stylesheet_uri(), $deps, TRAVEL_ROYALE_VERSION );
}
add_action( 'wp_enqueue_scripts', 'travel_royale_enqueue_styles' );

/**
 * Load the child stylesheet in the block editor too, so patterns look the same there.
 */
function travel_royale_editor_styles() {
	add_editor_style( 'style.css' );
}
add_action( 'after_setup_theme', 'travel_royale_editor_styles', 20 );

/**
 * Instrument Sans for headings and body (self-hosted through the parent's webfont loader).
 */
function travel_royale_fonts() {
	wp_dequeue_style( 'travelscape-fonts' );

	$fonts_url = add_query_arg(
		array(
			'family'  => 'Instrument+Sans:ital,wght@0,400..700;1,400..700',
			'display' => 'swap',
		),
		'https://fonts.googleapis.com/css2'
	);

	wp_enqueue_style(
		'travel-royale-fonts',
		wptt_get_webfont_url( esc_url_raw( $fonts_url ) ),
		array(),
		TRAVEL_ROYALE_VERSION
	);
}
add_action( 'wp_enqueue_scripts', 'travel_royale_fonts', 15 );
add_action( 'enqueue_block_editor_assets', 'travel_royale_fonts', 15 );
add_action( 'enqueue_block_assets', 'travel_royale_fonts', 15 );

/**
 * Travel Royale colors and typography (Customizer values still override these).
 *
 * @param array $defaults Style defaults.
 * @return array
 */
function travel_royale_override_styles( $defaults ) {
	$defaults['primary-color']   = '#2f5e46';
	$defaults['secondary-color'] = '#1f2427';
	$defaults['body-color']      = '#1c1b19';
	$defaults['heading-color']   = '#1c1b19';
	$defaults['subtle-color']    = '#f1ede6';
	$defaults['border-color']    = '#e6e1d8';
	$defaults['base-color']      = '#ffffff';

	// CSS-escaped space: esc_attr() would break quoted family names inside <style>.
	$family                  = 'Instrument\\ Sans, sans-serif';
	$defaults['font-family'] = $family;
	$defaults['font-size']   = '16px';
	$defaults['line-height'] = '1.65';

	foreach ( array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ) as $level ) {
		$defaults[ 'font-family-' . $level ] = $family;
		$defaults[ 'line-height-' . $level ] = '1.2';
	}
	$defaults['font-weight-h1'] = '700';
	$defaults['font-weight-h2'] = '700';
	$defaults['font-weight-h3'] = '600';
	$defaults['font-weight-h4'] = '600';

	return $defaults;
}
add_filter( 'travelscape_style', 'travel_royale_override_styles', 15 );

/**
 * FAQ page: live search and topic filter. The script exits early on pages without the FAQ block.
 */
function travel_royale_faq_script() {
	if ( ! is_singular() ) {
		return;
	}

	$post = get_post();
	if ( ! $post || false === strpos( $post->post_content, 'tr-faq-page' ) ) {
		return;
	}

	wp_enqueue_script(
		'travel-royale-faq',
		get_stylesheet_directory_uri() . '/assets/js/faq.js',
		array(),
		TRAVEL_ROYALE_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);
}
add_action( 'wp_enqueue_scripts', 'travel_royale_faq_script' );

/**
 * SVG filter for the logo on the transparent header.
 *
 * Turns the dark parts of any logo image white and keeps bright colors, so one
 * logo upload works on both the white and the transparent header. Used from
 * style.css as filter: url(#tr-logo-light).
 */
function travel_royale_logo_filter() {
	if ( ! in_array( 'travel-royale-overlay-header', get_body_class(), true ) ) {
		return;
	}
	?>
	<svg class="tr-svg-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">
		<filter id="tr-logo-light" color-interpolation-filters="sRGB">
			<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.2126 -0.7152 -0.0722 0 1" result="dark" />
			<feComponentTransfer in="dark" result="mask">
				<feFuncA type="linear" slope="3" intercept="-0.9" />
			</feComponentTransfer>
			<feComposite in="SourceGraphic" in2="mask" operator="out" result="bright" />
			<feComposite in="mask" in2="SourceAlpha" operator="in" result="white" />
			<feMerge>
				<feMergeNode in="bright" />
				<feMergeNode in="white" />
			</feMerge>
		</filter>
	</svg>
	<?php
}
add_action( 'wp_body_open', 'travel_royale_logo_filter' );
