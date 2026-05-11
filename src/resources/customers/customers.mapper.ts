import type {
  CustomerCreateInput,
  CustomerUpdateInput,
  CustomerGroupAssoc,
} from './customers.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toBool = (v: boolean | undefined): string =>
  v === true ? '1' : v === false ? '0' : '';

const toFloat = (v: number | undefined): string =>
  v != null ? String(v) : '';

const buildGroups = (items?: CustomerGroupAssoc[]): string => {
  if (!items?.length) return '<groups></groups>';
  const rows = items.map(i => `
        <group>
          <id><![CDATA[${i.id}]]></id>
        </group>`).join('');
  return `<groups>${rows}
      </groups>`;
};

export function buildCustomerPostXml(data: CustomerCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <id><![CDATA[]]></id>
    <id_default_group><![CDATA[${toStr(data.id_default_group ?? '')}]]></id_default_group>
    <id_lang><![CDATA[${toStr(data.id_lang ?? '')}]]></id_lang>
    <newsletter_date_add><![CDATA[${toStr(data.newsletter_date_add ?? '')}]]></newsletter_date_add>
    <ip_registration_newsletter><![CDATA[${toStr(data.ip_registration_newsletter ?? '')}]]></ip_registration_newsletter>
    <last_passwd_gen><![CDATA[]]></last_passwd_gen>
    <secure_key><![CDATA[]]></secure_key>
    <deleted><![CDATA[${toBool(data.deleted)}]]></deleted>
    <passwd><![CDATA[${toStr(data.passwd)}]]></passwd>
    <lastname><![CDATA[${toStr(data.lastname)}]]></lastname>
    <firstname><![CDATA[${toStr(data.firstname)}]]></firstname>
    <email><![CDATA[${toStr(data.email)}]]></email>
    <id_gender><![CDATA[${toStr(data.id_gender ?? '')}]]></id_gender>
    <birthday><![CDATA[${toStr(data.birthday ?? '')}]]></birthday>
    <newsletter><![CDATA[${toBool(data.newsletter)}]]></newsletter>
    <optin><![CDATA[${toBool(data.optin)}]]></optin>
    <website><![CDATA[${toStr(data.website ?? '')}]]></website>
    <company><![CDATA[${toStr(data.company ?? '')}]]></company>
    <siret><![CDATA[${toStr(data.siret ?? '')}]]></siret>
    <ape><![CDATA[${toStr(data.ape ?? '')}]]></ape>
    <outstanding_allow_amount><![CDATA[${toFloat(data.outstanding_allow_amount)}]]></outstanding_allow_amount>
    <show_public_prices><![CDATA[${toBool(data.show_public_prices)}]]></show_public_prices>
    <id_risk><![CDATA[${toStr(data.id_risk ?? '')}]]></id_risk>
    <max_payment_days><![CDATA[${toStr(data.max_payment_days ?? '')}]]></max_payment_days>
    <active><![CDATA[${toBool(data.active)}]]></active>
    <note><![CDATA[${toStr(data.note ?? '')}]]></note>
    <is_guest><![CDATA[${toBool(data.is_guest)}]]></is_guest>
    <id_shop><![CDATA[${toStr(data.id_shop ?? '')}]]></id_shop>
    <id_shop_group><![CDATA[${toStr(data.id_shop_group ?? '')}]]></id_shop_group>
    <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
    <date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
    <reset_password_token><![CDATA[${toStr(data.reset_password_token ?? '')}]]></reset_password_token>
    <reset_password_validity><![CDATA[${toStr(data.reset_password_validity ?? '')}]]></reset_password_validity>
    <associations>
      ${buildGroups(data.groups)}
    </associations>
  </customer>
</prestashop>`;
}

export function buildCustomerPatchXml(
  id: number,
  data: Partial<CustomerUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  const fBool = (tag: string, value: boolean | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
  };

  const fFloat = (tag: string, value: number | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value}]]></${tag}>`);
  };

  fStr('id_default_group', data.id_default_group);
  fStr('id_lang', data.id_lang);
  fStr('newsletter_date_add', data.newsletter_date_add);
  fStr('ip_registration_newsletter', data.ip_registration_newsletter);
  fBool('deleted', data.deleted);
  fStr('passwd', data.passwd);
  fStr('lastname', data.lastname);
  fStr('firstname', data.firstname);
  fStr('email', data.email);
  fStr('id_gender', data.id_gender);
  fStr('birthday', data.birthday);
  fBool('newsletter', data.newsletter);
  fBool('optin', data.optin);
  fStr('website', data.website);
  fStr('company', data.company);
  fStr('siret', data.siret);
  fStr('ape', data.ape);
  fFloat('outstanding_allow_amount', data.outstanding_allow_amount);
  fBool('show_public_prices', data.show_public_prices);
  fStr('id_risk', data.id_risk);
  fStr('max_payment_days', data.max_payment_days);
  fBool('active', data.active);
  fStr('note', data.note);
  fBool('is_guest', data.is_guest);
  fStr('id_shop', data.id_shop);
  fStr('id_shop_group', data.id_shop_group);
  fStr('date_add', data.date_add);
  fStr('date_upd', data.date_upd);
  fStr('reset_password_token', data.reset_password_token);
  fStr('reset_password_validity', data.reset_password_validity);

  const assocLines: string[] = [];
  if (data.groups !== undefined)
    assocLines.push(`      ${buildGroups(data.groups)}`);

  const assocXml = assocLines.length > 0
    ? `\n    <associations>\n${assocLines.join('\n')}\n    </associations>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}${assocXml}
  </customer>
</prestashop>`;
}
