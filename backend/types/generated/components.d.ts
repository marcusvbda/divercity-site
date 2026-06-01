import type { Schema, Struct } from '@strapi/strapi';

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
      'geral.feature-item': GeralFeatureItem;
      'precos.linha': PrecosLinha;
      'precos.tier': PrecosTier;
      'secao.beneficio-destaque': SecaoBeneficioDestaque;
    }
  }
}
