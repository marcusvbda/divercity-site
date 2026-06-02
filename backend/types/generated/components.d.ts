import type { Schema, Struct } from '@strapi/strapi';

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

export interface GeralMenu extends Struct.ComponentSchema {
  collectionName: 'components_geral_menus';
  info: {
    displayName: 'Menu';
    icon: 'pin';
  };
  attributes: {};
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

export interface PrecosLinha extends Struct.ComponentSchema {
  collectionName: 'components_precos_linhas';
  info: {
    displayName: 'Linha';
    icon: 'list';
  };
  attributes: {
    texto: Schema.Attribute.Text & Schema.Attribute.Required;
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

export interface SecaoBeneficioDestaque extends Struct.ComponentSchema {
  collectionName: 'components_secao_beneficio_destaque';
  info: {
    displayName: 'Beneficio Destaque';
    icon: 'star';
  };
  attributes: {
    cor: Schema.Attribute.String & Schema.Attribute.Required;
    descricao: Schema.Attribute.Text & Schema.Attribute.Required;
    iconeName: Schema.Attribute.String & Schema.Attribute.Required;
    titulo: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'geral.cta': GeralCta;
      'geral.feature-item': GeralFeatureItem;
      'geral.hero': GeralHero;
      'geral.link': GeralLink;
      'geral.menu': GeralMenu;
      'geral.navbar': GeralNavbar;
      'precos.linha': PrecosLinha;
      'precos.tier': PrecosTier;
      'secao.beneficio-destaque': SecaoBeneficioDestaque;
    }
  }
}
