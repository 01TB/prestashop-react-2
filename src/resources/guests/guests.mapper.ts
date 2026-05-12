import type { GuestCreateInput, GuestUpdateInput } from './guests.types';

const toStr = (value: string | number | undefined | null): string =>
  value != null ? String(value) : '';

const toBool = (value: boolean | undefined): string =>
  value === true ? '1' : value === false ? '0' : '';

export function buildGuestPostXml(data: GuestCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <guest>
    <id><![CDATA[]]></id>
    <id_customer><![CDATA[${toStr(data.id_customer)}]]></id_customer>
    <id_operating_system><![CDATA[${toStr(data.id_operating_system ?? '')}]]></id_operating_system>
    <id_web_browser><![CDATA[${toStr(data.id_web_browser ?? '')}]]></id_web_browser>
    <javascript><![CDATA[${toBool(data.javascript)}]]></javascript>
    <screen_resolution_x><![CDATA[${toStr(data.screen_resolution_x ?? '')}]]></screen_resolution_x>
    <screen_resolution_y><![CDATA[${toStr(data.screen_resolution_y ?? '')}]]></screen_resolution_y>
    <screen_color><![CDATA[${toStr(data.screen_color ?? '')}]]></screen_color>
    <sun_java><![CDATA[${toBool(data.sun_java)}]]></sun_java>
    <adobe_flash><![CDATA[${toBool(data.adobe_flash)}]]></adobe_flash>
    <adobe_director><![CDATA[${toBool(data.adobe_director)}]]></adobe_director>
    <apple_quicktime><![CDATA[${toBool(data.apple_quicktime)}]]></apple_quicktime>
    <real_player><![CDATA[${toBool(data.real_player)}]]></real_player>
    <windows_media><![CDATA[${toBool(data.windows_media)}]]></windows_media>
    <accept_language><![CDATA[${toStr(data.accept_language ?? '')}]]></accept_language>
    <mobile_theme><![CDATA[${toBool(data.mobile_theme)}]]></mobile_theme>
  </guest>
</prestashop>`;
}

export function buildGuestPatchXml(
  id: number,
  data: Partial<GuestUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  const fBool = (tag: string, value: boolean | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
  };

  fStr('id_customer', data.id_customer);
  fStr('id_operating_system', data.id_operating_system);
  fStr('id_web_browser', data.id_web_browser);
  fBool('javascript', data.javascript);
  fStr('screen_resolution_x', data.screen_resolution_x);
  fStr('screen_resolution_y', data.screen_resolution_y);
  fStr('screen_color', data.screen_color);
  fBool('sun_java', data.sun_java);
  fBool('adobe_flash', data.adobe_flash);
  fBool('adobe_director', data.adobe_director);
  fBool('apple_quicktime', data.apple_quicktime);
  fBool('real_player', data.real_player);
  fBool('windows_media', data.windows_media);
  fStr('accept_language', data.accept_language);
  fBool('mobile_theme', data.mobile_theme);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <guest>
    <id><![CDATA[${toStr(id)}]]></id>
${lines.join('\n')}
  </guest>
</prestashop>`;
}
