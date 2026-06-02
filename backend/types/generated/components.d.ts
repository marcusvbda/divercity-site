import type { Schema, Struct } from '@strapi/strapi';

export interface GeralAttractionSection extends Struct.ComponentSchema {
  collectionName: 'components_geral_attraction_sections';
  info: {
    displayName: 'section';
    icon: 'dashboard';
  };
  attributes: {
    badge: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GeralContactSection extends Struct.ComponentSchema {
  collectionName: 'components_geral_contact_sections';
  info: {
    displayName: 'contactSection';
    icon: 'bulletList';
  };
  attributes: {
    badge: Schema.Attribute.String;
    formBtnLabel: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GeralCta extends Struct.ComponentSchema {
  collectionName: 'components_geral_ctas';
  info: {
    displayName: 'cta';
    icon: 'code';
  };
  attributes: {
    bgColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    color: Schema.Attribute.String;
    hoverBgColor: Schema.Attribute.String;
    hoverBorder: Schema.Attribute.String;
    hoverColor: Schema.Attribute.String;
    href: Schema.Attribute.String;
    label: Schema.Attribute.String;
  };
}

export interface GeralFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_geral_feature_items';
  info: {
    displayName: 'Feature Item';
    icon: 'check';
  };
  attributes: {
    texto: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface GeralHero extends Struct.ComponentSchema {
  collectionName: 'components_geral_heroes';
  info: {
    displayName: 'hero';
    icon: 'crown';
  };
  attributes: {
    bgImage: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    primaryCta: Schema.Attribute.Component<'geral.cta', false>;
    secondaryCta: Schema.Attribute.Component<'geral.cta', false>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GeralLink extends Struct.ComponentSchema {
  collectionName: 'components_geral_links';
  info: {
    displayName: 'Link';
    icon: 'attachment';
  };
  attributes: {
    href: Schema.Attribute.String;
    label: Schema.Attribute.String;
  };
}

export interface GeralNavbar extends Struct.ComponentSchema {
  collectionName: 'components_geral_navbars';
  info: {
    displayName: 'Navbar';
    icon: 'bulletList';
  };
  attributes: {
    cta: Schema.Attribute.Component<'geral.cta', false>;
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    menus: Schema.Attribute.Component<'geral.link', true>;
  };
}

export interface GeralPartySection extends Struct.ComponentSchema {
  collectionName: 'components_geral_party_sections';
  info: {
    displayName: 'partySection';
    icon: 'bulletList';
  };
  attributes: {
    badge: Schema.Attribute.String;
    ctaOrcamento: Schema.Attribute.Component<'geral.cta', false>;
    ctaPrices: Schema.Attribute.Component<'geral.cta', false>;
    decorations: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    description: Schema.Attribute.String;
    features: Schema.Attribute.Component<'geral.feature-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface GeralPriceSection extends Struct.ComponentSchema {
  collectionName: 'components_geral_price_sections';
  info: {
    displayName: 'priceSection';
    icon: 'bulletList';
  };
  attributes: {
    badge: Schema.Attribute.String;
    disclaimers: Schema.Attribute.Component<'geral.rich-text', true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GeralRichText extends Struct.ComponentSchema {
  collectionName: 'components_geral_rich_texts';
  info: {
    displayName: 'richText';
    icon: 'bulletList';
  };
  attributes: {
    value: Schema.Attribute.RichText;
  };
}

export interface PrecosTier extends Struct.ComponentSchema {
  collectionName: 'components_precos_tiers';
  info: {
    displayName: 'Tier';
    icon: 'money-bill';
  };
  attributes: {
    acompanhante: Schema.Attribute.Integer & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    valor: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'geral.attraction-section': GeralAttractionSection;
      'geral.contact-section': GeralContactSection;
      'geral.cta': GeralCta;
      'geral.feature-item': GeralFeatureItem;
      'geral.hero': GeralHero;
      'geral.link': GeralLink;
      'geral.navbar': GeralNavbar;
      'geral.party-section': GeralPartySection;
      'geral.price-section': GeralPriceSection;
      'geral.rich-text': GeralRichText;
      'precos.tier': PrecosTier;
    }
  }
}
