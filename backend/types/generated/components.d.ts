import type { Schema, Struct } from '@strapi/strapi';

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
      'precos.tier': PrecosTier;
    }
  }
}
