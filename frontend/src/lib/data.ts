import type { Atracao, BeneficioCard, PriceGroup, Depoimento, NavItem } from '@/types'

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: '#inicio' },
  { label: 'Atrações', href: '#atracoes' },
  { label: 'Festas', href: '#festas' },
  { label: 'Preços', href: '#precos' },
  { label: 'Contato', href: '#contato' },
]

export const ATRACOES: Atracao[] = [
  {
    id: 1,
    nome: 'Arco do Totem Elétrico',
    descricao: 'Diversão elétrica com jogos interativos e muita adrenalina para toda a família.',
    imagem: 'https://placehold.co/600x400/12C7C8/ffffff?text=Arco+do+Totem+Elétrico',
    cor: '#12C7C8',
  },
  {
    id: 2,
    nome: 'Guerreiro Ninja',
    descricao: 'Supere obstáculos ninjas e mostre suas habilidades neste percurso radical.',
    imagem: 'https://placehold.co/600x400/8E4CCF/ffffff?text=Guerreiro+Ninja',
    cor: '#8E4CCF',
  },
  {
    id: 3,
    nome: 'Parede de Escalada',
    descricao: 'Escale paredes desafiadoras com segurança e equipamentos profissionais.',
    imagem: 'https://placehold.co/600x400/FF4F8A/ffffff?text=Parede+de+Escalada',
    cor: '#FF4F8A',
  },
  {
    id: 4,
    nome: 'Escalada Radical',
    descricao: 'Para os mais corajosos: escalada em altura com vista panorâmica do parque.',
    imagem: 'https://placehold.co/600x400/9AD94B/ffffff?text=Escalada+Radical',
    cor: '#9AD94B',
  },
  {
    id: 5,
    nome: 'Sala de Festas',
    descricao: 'Espaço exclusivo e decorado para tornar seu aniversário inesquecível.',
    imagem: 'https://placehold.co/600x400/FFD23F/333333?text=Sala+de+Festas',
    cor: '#FFD23F',
  },
  {
    id: 6,
    nome: 'Pule Aqui!',
    descricao: 'Camas elásticas e trampolins para pular, girar e se divertir sem parar.',
    imagem: 'https://placehold.co/600x400/12C7C8/ffffff?text=Pule+Aqui',
    cor: '#12C7C8',
  },
  {
    id: 7,
    nome: 'Bar e Petisqueria',
    descricao: 'Lanches, sucos e refeições gostosas para repor as energias durante a diversão.',
    imagem: 'https://placehold.co/600x400/8E4CCF/ffffff?text=Bar+e+Petisqueria',
    cor: '#8E4CCF',
  },
]

export const BENEFICIOS_CARDS: BeneficioCard[] = [
  {
    titulo: 'Segurança Total',
    descricao:
      'Monitoramento 24h, equipe treinada e equipamentos certificados para a segurança das crianças.',
    iconeName: 'Shield',
    gradiente: 'from-brand-cyan to-brand-purple',
  },
  {
    titulo: 'Diversão para Todas as Idades',
    descricao:
      'Atrações para crianças de todas as idades, de 2 a 12 anos, com supervisão especializada.',
    iconeName: 'Users',
    gradiente: 'from-brand-purple to-brand-pink',
  },
  {
    titulo: 'Festas Personalizadas',
    descricao:
      'Pacotes completos de aniversário com decoração, buffet e toda a organização por nossa conta.',
    iconeName: 'PartyPopper',
    gradiente: 'from-brand-pink to-brand-yellow',
  },
  {
    titulo: 'Localização Conveniente',
    descricao: 'Fácil acesso, estacionamento gratuito e localização central para toda a família.',
    iconeName: 'MapPin',
    gradiente: 'from-brand-yellow to-brand-lime',
  },
  {
    titulo: 'Alimentação Saborosa',
    descricao:
      'Lanchonete completa com opções saudáveis, petiscos e área de lounge para os pais.',
    iconeName: 'UtensilsCrossed',
    gradiente: 'from-brand-lime to-brand-cyan',
  },
  {
    titulo: 'Atendimento Especializado',
    descricao:
      'Equipe dedicada, atenciosa e apaixonada por proporcionar experiências incríveis.',
    iconeName: 'HeartHandshake',
    gradiente: 'from-brand-cyan to-brand-pink',
  },
]

export const PRECOS: PriceGroup[] = [
  {
    titulo: 'Segunda a Sexta',
    subtitulo: 'Agendamento Feria',
    cor: '#12C7C8',
    tiers: [
      { label: 'Até 5 anos', valor: 45 },
      { label: 'A partir de 5 anos', valor: 55 },
    ],
  },
  {
    titulo: 'Sábado',
    subtitulo: 'Fim de Semana',
    cor: '#8E4CCF',
    tiers: [
      { label: 'Até 5 anos', valor: 60 },
      { label: 'A partir de 5 anos', valor: 70 },
    ],
  },
  {
    titulo: 'Domingo e Feriado',
    subtitulo: 'Domingo e Feriado',
    cor: '#FF4F8A',
    tiers: [
      { label: 'Até 5 anos', valor: 75 },
      { label: 'A partir de 5 anos', valor: 85 },
      { label: 'Até 5 anos (pacote)', valor: 90 },
      { label: 'A partir de 5 anos (pacote)', valor: 100 },
    ],
  },
]

export const DEPOIMENTOS: Depoimento[] = [
  {
    id: 1,
    nome: 'Fernanda',
    estrelas: 5,
    texto:
      'Festa incrível! Meu filho adorou cada detalhe. A equipe foi super atenciosa e tudo ficou perfeito. Com certeza voltaremos!',
    avatar: 'https://placehold.co/80x80/FF4F8A/ffffff?text=F',
  },
  {
    id: 2,
    nome: 'Ricardo',
    estrelas: 5,
    texto:
      'Melhor parque indoor da região! As crianças ficaram horas se divertindo nas atrações. Estrutura impecável e equipe muito profissional.',
    avatar: 'https://placehold.co/80x80/8E4CCF/ffffff?text=R',
  },
  {
    id: 3,
    nome: 'Adriana',
    estrelas: 5,
    texto:
      'Atendimento excepcional desde o primeiro contato. A festa do meu filho foi um sonho. Recomendo para todos os pais!',
    avatar: 'https://placehold.co/80x80/12C7C8/ffffff?text=A',
  },
]

export const INSTAGRAM_POSTS: string[] = [
  'https://placehold.co/400x400/12C7C8/ffffff?text=Post+1',
  'https://placehold.co/400x400/8E4CCF/ffffff?text=Post+2',
  'https://placehold.co/400x400/FF4F8A/ffffff?text=Post+3',
  'https://placehold.co/400x400/9AD94B/ffffff?text=Post+4',
  'https://placehold.co/400x400/FFD23F/333333?text=Post+5',
  'https://placehold.co/400x400/12C7C8/ffffff?text=Post+6',
  'https://placehold.co/400x400/8E4CCF/ffffff?text=Post+7',
  'https://placehold.co/400x400/FF4F8A/ffffff?text=Post+8',
]
