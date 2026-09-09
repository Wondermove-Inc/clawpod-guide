import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import { translate } from '@docusaurus/Translate';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import IconLanguage from '@theme/Icon/Language';
import guide from '../../../../docs.json';
import compatibility from '../../../../scripts/public-compatibility-pages.json';

const routes = new Set([
  '', ...guide.navigation.groups.flatMap((group) => group.pages).filter((page) => page !== 'index'),
  ...compatibility, 'AGENTS', 'DOCUMENTATION', '_templates/task-guide', '_templates/capability-guide',
]);

export default function LocaleDropdownNavbarItem({ mobile, dropdownItemsBefore = [], dropdownItemsAfter = [], queryString, ...props }) {
  const { siteConfig: { baseUrl }, i18n: { currentLocale, locales, localeConfigs } } = useDocusaurusContext();
  const { pathname } = useLocation();
  const page = pathname.startsWith(baseUrl) ? pathname.slice(baseUrl.length).replace(/\/$/, '') : '';
  // Translated headings have different anchors. Unknown/404 routes return home.
  const suffix = routes.has(page) && page ? `${page}/` : '';
  const items = locales.map((locale) => ({
    label: localeConfigs[locale].label,
    lang: localeConfigs[locale].htmlLang,
    to: `pathname://${localeConfigs[locale].baseUrl}${suffix}`,
    target: '_self',
    autoAddBaseUrl: false,
    className: locale === currentLocale ? (mobile ? 'menu__link--active' : 'dropdown__link--active') : '',
  }));
  return <DropdownNavbarItem {...props} mobile={mobile}
    label={<><IconLanguage style={{ verticalAlign: 'text-bottom', marginRight: '.3rem' }} />{mobile
      ? translate({ id: 'theme.navbar.mobileLanguageDropdown.label', message: 'Languages' })
      : localeConfigs[currentLocale].label}</>}
    items={[...dropdownItemsBefore, ...items, ...dropdownItemsAfter]} />;
}
