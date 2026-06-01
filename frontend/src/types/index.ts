export interface Atracao {
  id: number
  nome: string
  descricao: string
  imagem: string
  cor: string
}

export interface BeneficioCard {
  titulo: string
  descricao: string
  iconeName: string
  gradiente: string
}

export interface PriceTier {
  label: string
  valor: number
}

export interface PriceGroup {
  titulo: string
  subtitulo: string
  cor: string
  tiers: PriceTier[]
}

export interface Depoimento {
  id: number
  nome: string
  estrelas: number
  texto: string
  avatar: string
}

export interface NavItem {
  label: string
  href: string
}
