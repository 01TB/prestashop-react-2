import {
	getNodeBool,
	getNodeInt,
	getNodeText,
} from '../../utils/xml-utils';
import type { GuestOutput, GuestListItem } from './guests.types';

export function parseGuest(doc: Document): GuestOutput {
	const root = doc.querySelector('prestashop > guest');
	if (!root) throw new Error('Invalid guest response: <guest> missing');
	return parseGuestFromElement(root);
}

export function parseGuestList(doc: Document): GuestOutput[] {
	return Array.from(doc.querySelectorAll('prestashop > guests > guest'))
		.map(parseGuestFromElement);
}

export function parseGuestFromElement(el: Element): GuestOutput {
	return {
		id: getNodeInt(el, 'id') ?? 0,
		id_customer: getNodeInt(el, 'id_customer') ?? 0,
		id_operating_system: getNodeInt(el, 'id_operating_system'),
		id_web_browser: getNodeInt(el, 'id_web_browser'),
		javascript: getNodeBool(el, 'javascript'),
		screen_resolution_x: getNodeInt(el, 'screen_resolution_x'),
		screen_resolution_y: getNodeInt(el, 'screen_resolution_y'),
		screen_color: getNodeInt(el, 'screen_color'),
		sun_java: getNodeBool(el, 'sun_java'),
		adobe_flash: getNodeBool(el, 'adobe_flash'),
		adobe_director: getNodeBool(el, 'adobe_director'),
		apple_quicktime: getNodeBool(el, 'apple_quicktime'),
		real_player: getNodeBool(el, 'real_player'),
		windows_media: getNodeBool(el, 'windows_media'),
		accept_language: getNodeText(el, 'accept_language'),
		mobile_theme: getNodeBool(el, 'mobile_theme'),
	};
}

export function parseGuestIdList(doc: Document): GuestListItem[] {
	return Array.from(doc.querySelectorAll('prestashop > guests > guest')).map(el => ({
		id: parseInt(el.getAttribute('id') ?? '0', 10),
		href: el.getAttribute('xlink:href') ?? '',
	}));
}
