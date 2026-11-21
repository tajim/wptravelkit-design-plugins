/**
 * Travel Royale FAQ: live search, topic filter and popular-search links.
 *
 * Works on any page with a .tr-faq-page block (the FAQ pattern). Without
 * JavaScript the topics are plain anchor links and the search box falls
 * back to the normal site search.
 */
( function () {
	'use strict';

	const page = document.querySelector( '.tr-faq-page' );
	if ( ! page ) {
		return;
	}

	const ALL = page.id || 'faq-questions';
	const groups = Array.from( page.querySelectorAll( '.tr-faq-group' ) );
	const topics = Array.from( document.querySelectorAll( '.tr-topic' ) );
	const empty = page.querySelector( '.tr-faq-empty' );
	const input = document.querySelector( '.tr-faq-search input[type="search"]' );
	let current = ALL;

	const topicId = ( topic ) => {
		const link = topic.querySelector( 'a[href^="#"]' );
		return link ? link.getAttribute( 'href' ).slice( 1 ) : '';
	};

	function apply() {
		const query = input ? input.value.trim().toLowerCase() : '';
		const counts = {};
		let shown = 0;
		let total = 0;

		groups.forEach( ( group ) => {
			let visible = 0;
			let matches = 0;

			group.querySelectorAll( 'details' ).forEach( ( item ) => {
				const hit = ! query || item.textContent.toLowerCase().includes( query );
				const show = hit && ( current === ALL || current === group.id );
				if ( hit ) {
					matches++;
				}
				if ( show ) {
					visible++;
				}
				item.hidden = ! show;
			} );

			counts[ group.id ] = matches;
			total += matches;
			shown += visible;
			group.hidden = visible === 0;
		} );

		counts[ ALL ] = total;

		if ( empty ) {
			empty.classList.toggle( 'is-visible', shown === 0 );
		}

		topics.forEach( ( topic ) => {
			const id = topicId( topic );
			const link = topic.querySelector( 'a' );
			const count = topic.querySelector( '.tr-topic__count' );
			topic.classList.toggle( 'is-active', id === current );
			if ( link ) {
				if ( id === current ) {
					link.setAttribute( 'aria-current', 'true' );
				} else {
					link.removeAttribute( 'aria-current' );
				}
			}
			if ( count && id in counts ) {
				count.textContent = counts[ id ];
			}
		} );
	}

	topics.forEach( ( topic ) => {
		topic.addEventListener( 'click', ( event ) => {
			const id = topicId( topic );
			if ( ! id ) {
				return;
			}
			event.preventDefault();
			current = id;
			apply();
		} );
	} );

	if ( input ) {
		input.addEventListener( 'input', () => {
			current = ALL;
			apply();
		} );

		const form = input.closest( 'form' );
		if ( form ) {
			form.addEventListener( 'submit', ( event ) => {
				event.preventDefault();
				current = ALL;
				apply();
				page.scrollIntoView( { behavior: 'smooth', block: 'start' } );
			} );
		}

		document.querySelectorAll( '.tr-faq-pick a' ).forEach( ( link ) => {
			link.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				input.value = link.textContent.trim();
				current = ALL;
				apply();
				page.scrollIntoView( { behavior: 'smooth', block: 'start' } );
			} );
		} );
	}

	if ( empty ) {
		empty.querySelectorAll( '.tr-faq-clear a' ).forEach( ( link ) => {
			link.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				if ( input ) {
					input.value = '';
				}
				current = ALL;
				apply();
			} );
		} );
	}
} )();
