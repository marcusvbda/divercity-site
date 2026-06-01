import type {
  Atracao,
  BeneficioCard,
  PriceGroup,
  Depoimento,
  NavItem,
} from '@/types'

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
    nome: 'Arena de Camas Elásticas',
    descricao:
      'Nossa arena de camas elásticas é o lugar perfeito para pular e se divertir! Com trampolins interconectados, as crianças podem pular livremente, realizar acrobacias e liberar toda a energia.',
    imagem: '/cama-elastica.png',
    cor: '#12C7C8',
  },
  {
    id: 2,
    nome: 'Guerreiro Ninja',
    descricao:
      'Desafie suas habilidades na nossa pista de obstáculos Guerreiro Ninja! Projetada para testar força, agilidade e coordenação, essa atração oferece diferentes níveis de dificuldade para crianças de todas as idades.',
    imagem: '/guerreiro-ninja.png',
    cor: '#8E4CCF',
  },
  {
    id: 3,
    nome: 'Parede de Escalada',
    descricao:
      'Nossa parede de escalar é ideal para pequenos alpinistas. Com vários percursos e níveis de dificuldade, as crianças podem desenvolver suas habilidades em um ambiente seguro, sempre supervisionado por nossos monitores.',
    imagem: '/guerreiro-ninja.png',
    cor: '#FF4F8A',
  },
  {
    id: 4,
    nome: 'Salão de Festas',
    descricao:
      'Venha celebrar o aniversário do seu filho com a diversão do Divercity Park! Nosso salão oferece conforto, segurança e acesso a todas as atrações. Adultos não pagam entrada para acompanhar a festa!',
    imagem: '/salao-de-festas.png',
    cor: '#FFD23F',
  },
  {
    id: 5,
    nome: 'Desafio Radical',
    descricao:
      'Prepare-se para enfrentar o Desafio Radical, nosso circuito de obstáculos emocionante! Com desafios que testam agilidade, força e coragem, os pequenos poderão escalar, pular, rastejar e se equilibrar.',
    imagem: '/desafio-radical.png',
    cor: '#9AD94B',
  },
  {
    id: 6,
    nome: 'Pula-Pulas',
    descricao:
      'Nosso espaço de Pula-Pula é perfeito para crianças de todas as idades! Com várias áreas de pula-pula infláveis, as crianças podem gastar energia enquanto se divertem em segurança.',
    imagem: '/pula-pulas.png',
    cor: '#12C7C8',
  },
  {
    id: 7,
    nome: 'Bar e Petiscaria',
    descricao:
      'Enquanto as crianças brincam, os pais podem relaxar no nosso bar. Com ambiente aconchegante, oferecemos cafés, chás, sucos e coquetéis. O lugar perfeito para descontrair enquanto os pequenos se divertem.',
    imagem: '/bar.png',
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
    descricao:
      'Fácil acesso, estacionamento gratuito e localização central para toda a família.',
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
