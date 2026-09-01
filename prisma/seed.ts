import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DIRECT_URL, max: 1 })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

type SimpleField = { name: string; type?: 'simple'; value: string }
type MultipleField = { name: string; type: 'multiple'; value: string[] }
type FieldEntry = SimpleField | MultipleField

async function seedFields(componentId: number, fields: FieldEntry[]) {
  for (const entry of fields) {
    const field = await prisma.componentField.upsert({
      where: {
        name_contentComponentId: {
          name: entry.name,
          contentComponentId: componentId,
        },
      },
      update: { type: entry.type ?? 'simple' },
      create: {
        name: entry.name,
        type: entry.type ?? 'simple',
        contentComponentId: componentId,
      },
    })

    if (entry.type === 'multiple') {
      await prisma.componentFieldValue.deleteMany({
        where: { componentFieldId: field.id },
      })
      await prisma.componentFieldValue.createMany({
        data: entry.value.map((v) => ({
          value: v,
          componentFieldId: field.id,
        })),
      })
    } else {
      const existing = await prisma.componentFieldValue.findFirst({
        where: { componentFieldId: field.id },
      })
      if (existing) {
        await prisma.componentFieldValue.update({
          where: { id: existing.id },
          data: { value: entry.value },
        })
      } else {
        await prisma.componentFieldValue.create({
          data: { value: entry.value, componentFieldId: field.id },
        })
      }
    }
  }
}

async function seedInstanceField(
  componentId: number,
  fieldName: string,
  templateComponentId: number,
  instanceValues: Array<{ fieldId: number; value: string }>
) {
  const field = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: fieldName,
        contentComponentId: componentId,
      },
    },
    update: { type: 'simple' },
    create: {
      name: fieldName,
      type: 'simple',
      contentComponentId: componentId,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: field.id },
  })

  const instance = await prisma.componentInstance.create({
    data: { templateComponentId },
  })

  await prisma.componentInstanceFieldValue.createMany({
    data: instanceValues.map((iv) => ({
      instanceId: instance.id,
      fieldId: iv.fieldId,
      value: iv.value,
    })),
  })

  await prisma.componentFieldValue.create({
    data: { componentFieldId: field.id, instanceId: instance.id },
  })
}

async function getField(componentId: number, fieldName: string) {
  return prisma.componentField.findUniqueOrThrow({
    where: {
      name_contentComponentId: {
        name: fieldName,
        contentComponentId: componentId,
      },
    },
  })
}

async function main() {
  // ── Metadata ──────────────────────────────────────────────────────────────
  const metadataType = await prisma.contentType.upsert({
    where: { name: 'Metadata' },
    update: {},
    create: { name: 'Metadata' },
  })

  const seoComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'SEO', contentTypeId: metadataType.id },
    },
    update: {},
    create: { name: 'SEO', contentTypeId: metadataType.id },
  })

  await seedFields(seoComponent.id, [
    { name: 'title', value: 'Divercity Park — Diversão para toda a família' },
    {
      name: 'description',
      value:
        'Divercity Park é o melhor parque indoor da região. Festas de aniversário, mais de 10 atrações, área para pais e muito mais. Reserve sua festa agora!',
    },
    {
      name: 'keywords',
      value:
        'parque infantil, festa infantil, aniversário criança, diversão indoor, Divercity Park',
    },
    {
      name: 'og_title',
      value: 'Divercity Park — Diversão para toda a família',
    },
    {
      name: 'og_description',
      value: 'Festas inesquecíveis e mais de 10 atrações para toda a família.',
    },
    { name: 'og_image', value: '' },
  ])

  // ── General (reusable component templates) ────────────────────────────────
  const generalType = await prisma.contentType.upsert({
    where: { name: 'General' },
    update: { editable: false },
    create: { name: 'General', editable: false },
  })

  // General/Link
  const linkComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Link', contentTypeId: generalType.id },
    },
    update: {},
    create: { name: 'Link', contentTypeId: generalType.id },
  })

  await seedFields(linkComponent.id, [
    { name: 'label', value: '' },
    { name: 'href', value: '' },
  ])

  const linkLabelField = await getField(linkComponent.id, 'label')
  const linkHrefField = await getField(linkComponent.id, 'href')

  // General/Cta
  const ctaTemplateComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Cta', contentTypeId: generalType.id },
    },
    update: {},
    create: { name: 'Cta', contentTypeId: generalType.id },
  })

  await seedFields(ctaTemplateComponent.id, [
    { name: 'label', value: '' },
    { name: 'href', value: '' },
    { name: 'color', value: '' },
    { name: 'bgColor', value: '' },
    { name: 'border', value: '' },
    { name: 'hoverColor', value: '' },
    { name: 'hoverBgColor', value: '' },
    { name: 'hoverBorder', value: '' },
  ])

  const ctaLabelField = await getField(ctaTemplateComponent.id, 'label')
  const ctaHrefField = await getField(ctaTemplateComponent.id, 'href')
  const ctaColorField = await getField(ctaTemplateComponent.id, 'color')
  const ctaBgColorField = await getField(ctaTemplateComponent.id, 'bgColor')
  const ctaBorderField = await getField(ctaTemplateComponent.id, 'border')
  const ctaHoverColorField = await getField(
    ctaTemplateComponent.id,
    'hoverColor'
  )
  const ctaHoverBgColorField = await getField(
    ctaTemplateComponent.id,
    'hoverBgColor'
  )
  const ctaHoverBorderField = await getField(
    ctaTemplateComponent.id,
    'hoverBorder'
  )

  // General/Price
  const priceTemplateComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Price', contentTypeId: generalType.id },
    },
    update: {},
    create: { name: 'Price', contentTypeId: generalType.id },
  })

  await seedFields(priceTemplateComponent.id, [
    { name: 'title', value: '' },
    { name: 'subtitle', value: '' },
    { name: 'color', value: '' },
  ])

  const priceTitleField = await getField(priceTemplateComponent.id, 'title')
  const priceSubtitleField = await getField(
    priceTemplateComponent.id,
    'subtitle'
  )
  const priceColorField = await getField(priceTemplateComponent.id, 'color')

  // General/Tier
  const tierTemplateComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Tier', contentTypeId: generalType.id },
    },
    update: {},
    create: { name: 'Tier', contentTypeId: generalType.id },
  })

  await seedFields(tierTemplateComponent.id, [
    { name: 'label', value: '' },
    { name: 'valor', value: '' },
    { name: 'acompanhante', value: '' },
  ])

  const tierLabelField = await getField(tierTemplateComponent.id, 'label')
  const tierValorField = await getField(tierTemplateComponent.id, 'valor')
  const tierAcompanhanteField = await getField(
    tierTemplateComponent.id,
    'acompanhante'
  )

  // General/Benefit
  const benefitTemplateComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Benefit', contentTypeId: generalType.id },
    },
    update: {},
    create: { name: 'Benefit', contentTypeId: generalType.id },
  })

  await seedFields(benefitTemplateComponent.id, [
    { name: 'title', value: '' },
    { name: 'description', value: '' },
    { name: 'iconName', value: '' },
  ])

  const benefitTitleField = await getField(benefitTemplateComponent.id, 'title')
  const benefitDescriptionField = await getField(
    benefitTemplateComponent.id,
    'description'
  )
  const benefitIconNameField = await getField(
    benefitTemplateComponent.id,
    'iconName'
  )

  // General/Attraction
  const attractionTemplateComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Attraction', contentTypeId: generalType.id },
    },
    update: {},
    create: { name: 'Attraction', contentTypeId: generalType.id },
  })

  await seedFields(attractionTemplateComponent.id, [
    { name: 'name', value: '' },
    { name: 'description', value: '' },
    { name: 'image', value: '' },
    { name: 'color', value: '' },
    { name: 'sort', value: '' },
  ])

  const attractionNameField = await getField(
    attractionTemplateComponent.id,
    'name'
  )
  const attractionDescriptionField = await getField(
    attractionTemplateComponent.id,
    'description'
  )
  const attractionImageField = await getField(
    attractionTemplateComponent.id,
    'image'
  )
  const attractionColorField = await getField(
    attractionTemplateComponent.id,
    'color'
  )
  const attractionSortField = await getField(
    attractionTemplateComponent.id,
    'sort'
  )

  // General/Feature
  const featureTemplateComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Feature', contentTypeId: generalType.id },
    },
    update: {},
    create: { name: 'Feature', contentTypeId: generalType.id },
  })

  await seedFields(featureTemplateComponent.id, [
    { name: 'label', value: '' },
    { name: 'iconName', value: '' },
    { name: 'color', value: '' },
  ])

  const featureLabelField = await getField(featureTemplateComponent.id, 'label')
  const featureIconNameField = await getField(
    featureTemplateComponent.id,
    'iconName'
  )
  const featureColorField = await getField(featureTemplateComponent.id, 'color')

  // ── NavBar ────────────────────────────────────────────────────────────────
  const navbarType = await prisma.contentType.upsert({
    where: { name: 'NavBar' },
    update: {},
    create: { name: 'NavBar' },
  })

  // NavBar/Logo
  const logoComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Logo', contentTypeId: navbarType.id },
    },
    update: {},
    create: { name: 'Logo', contentTypeId: navbarType.id },
  })

  await seedFields(logoComponent.id, [
    {
      name: 'url',
      value:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/logo-name.png',
    },
  ])

  // NavBar/Cta — single `cta` field pointing to a General/Cta instance
  const navCtaComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Actions', contentTypeId: navbarType.id },
    },
    update: {},
    create: { name: 'Actions', contentTypeId: navbarType.id },
  })

  await seedInstanceField(
    navCtaComponent.id,
    'actionBtn',
    ctaTemplateComponent.id,
    [
      { fieldId: ctaLabelField.id, value: 'Reservar festa' },
      { fieldId: ctaHrefField.id, value: '#festas' },
      { fieldId: ctaColorField.id, value: '#fefefe' },
      { fieldId: ctaBgColorField.id, value: '#FF4F8A' },
      { fieldId: ctaBorderField.id, value: '' },
      { fieldId: ctaHoverColorField.id, value: '' },
      { fieldId: ctaHoverBgColorField.id, value: '' },
      { fieldId: ctaHoverBorderField.id, value: '' },
    ]
  )

  // NavBar/Menus — menuItems multiple, each a General/Link instance
  const menusComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Menus', contentTypeId: navbarType.id },
    },
    update: {},
    create: { name: 'Menus', contentTypeId: navbarType.id },
  })

  const menuItemsField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'menuItems',
        contentComponentId: menusComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'menuItems',
      type: 'multiple',
      contentComponentId: menusComponent.id,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: menuItemsField.id },
  })

  const menuData = [
    { label: 'Início', href: '#inicio' },
    { label: 'Atrações', href: '#atracoes' },
    { label: 'Festas', href: '#festas' },
    { label: 'Preços', href: '#precos' },
    { label: 'Contato', href: '#contato' },
  ]

  for (const item of menuData) {
    const instance = await prisma.componentInstance.create({
      data: { templateComponentId: linkComponent.id },
    })

    await prisma.componentInstanceFieldValue.createMany({
      data: [
        {
          instanceId: instance.id,
          fieldId: linkLabelField.id,
          value: item.label,
        },
        {
          instanceId: instance.id,
          fieldId: linkHrefField.id,
          value: item.href,
        },
      ],
    })

    await prisma.componentFieldValue.create({
      data: { componentFieldId: menuItemsField.id, instanceId: instance.id },
    })
  }

  // ── Hero ──────────────────────────────────────────────────────────────────
  const heroType = await prisma.contentType.upsert({
    where: { name: 'Hero' },
    update: {},
    create: { name: 'Hero' },
  })

  const heroContentComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Content', contentTypeId: heroType.id },
    },
    update: {},
    create: { name: 'Content', contentTypeId: heroType.id },
  })

  await seedFields(heroContentComponent.id, [
    { name: 'title', value: 'Diversão para toda a família' },
    {
      name: 'subtitle',
      value:
        'Mais de 10 atrações incríveis, festas personalizadas inesquecíveis e um espaço pensado para toda a família.',
    },
  ])

  const heroMediaComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Media', contentTypeId: heroType.id },
    },
    update: {},
    create: { name: 'Media', contentTypeId: heroType.id },
  })

  await seedFields(heroMediaComponent.id, [
    {
      name: 'bgImage',
      value:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/hero.png',
    },
    {
      name: 'image',
      value:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/logo-ball.png',
    },
  ])

  const heroActionsComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Actions', contentTypeId: heroType.id },
    },
    update: {},
    create: { name: 'Actions', contentTypeId: heroType.id },
  })

  await seedInstanceField(
    heroActionsComponent.id,
    'primaryCta',
    ctaTemplateComponent.id,
    [
      { fieldId: ctaLabelField.id, value: 'Reservar festa' },
      { fieldId: ctaHrefField.id, value: '#festas' },
      { fieldId: ctaColorField.id, value: '#fefefe' },
      { fieldId: ctaBgColorField.id, value: '#FF4F8A' },
      { fieldId: ctaBorderField.id, value: '' },
      { fieldId: ctaHoverColorField.id, value: '' },
      { fieldId: ctaHoverBgColorField.id, value: '' },
      { fieldId: ctaHoverBorderField.id, value: '' },
    ]
  )

  await seedInstanceField(
    heroActionsComponent.id,
    'secondaryCta',
    ctaTemplateComponent.id,
    [
      { fieldId: ctaLabelField.id, value: 'Atrações' },
      { fieldId: ctaHrefField.id, value: '#atracoes' },
      { fieldId: ctaColorField.id, value: '#fefefe' },
      { fieldId: ctaBgColorField.id, value: 'transparent' },
      { fieldId: ctaBorderField.id, value: '1px solid #fefefe' },
      { fieldId: ctaHoverColorField.id, value: '' },
      { fieldId: ctaHoverBgColorField.id, value: '' },
      { fieldId: ctaHoverBorderField.id, value: '' },
    ]
  )

  // ── Attractions ───────────────────────────────────────────────────────────
  const attractionsType = await prisma.contentType.upsert({
    where: { name: 'Attractions' },
    update: {},
    create: { name: 'Attractions' },
  })

  const attractionsSectionComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Section',
        contentTypeId: attractionsType.id,
      },
    },
    update: {},
    create: { name: 'Section', contentTypeId: attractionsType.id },
  })

  await seedFields(attractionsSectionComponent.id, [
    { name: 'title', value: 'Nossas Atrações' },
    { name: 'badge', value: 'Explore o Parque' },
    {
      name: 'subtitle',
      value:
        'Mais de 10 atrações para crianças de todas as idades. Aventura, diversão e segurança em um só lugar.',
    },
  ])

  const attractionsContentComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Content',
        contentTypeId: attractionsType.id,
      },
    },
    update: {},
    create: { name: 'Content', contentTypeId: attractionsType.id },
  })

  const attractionListField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'Attraction',
        contentComponentId: attractionsContentComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'Attraction',
      type: 'multiple',
      contentComponentId: attractionsContentComponent.id,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: attractionListField.id },
  })

  const attractionData = [
    {
      name: 'Arena de Camas Elásticas',
      description:
        'Nossa arena de camas elásticas é o lugar perfeito para pular e se divertir! Com trampolins interconectados, as crianças podem pular livremente, realizar acrobacias e liberar toda a energia.',
      color: '#12C7C8',
      sort: '1',
      image:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/cama-elastica.png',
    },
    {
      name: 'Guerreiro Ninja',
      description:
        'Desafie suas habilidades na nossa pista de obstáculos Guerreiro Ninja! Projetada para testar força, agilidade e coordenação, essa atração oferece diferentes níveis de dificuldade para crianças de todas as idades.',
      color: '#8E4CCF',
      sort: '2',
      image:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/guerreiro-ninja.png',
    },
    {
      name: 'Parede de Escalada',
      description:
        'Nossa parede de escalar é ideal para pequenos alpinistas. Com vários percursos e níveis de dificuldade, as crianças podem desenvolver suas habilidades em um ambiente seguro, sempre supervisionado por nossos monitores.',
      color: '#FF4F8A',
      sort: '3',
      image:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/parede-escalada.png',
    },
    {
      name: 'Salão de Festas',
      description:
        'Venha celebrar o aniversário do seu filho com a diversão do Divercity Park! Nosso salão oferece conforto, segurança e acesso a todas as atrações. Adultos não pagam entrada para acompanhar a festa!',
      color: '#FFD23F',
      sort: '4',
      image:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/salao-de-festas.png',
    },
    {
      name: 'Desafio Radical',
      description:
        'Prepare-se para enfrentar o Desafio Radical, nosso circuito de obstáculos emocionante! Com desafios que testam agilidade, força e coragem, os pequenos poderão escalar, pular, rastejar e se equilibrar.',
      color: '#9AD94B',
      sort: '5',
      image:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/desafio-radical.png',
    },
    {
      name: 'Pula-Pulas',
      description:
        'Nosso espaço de Pula-Pula é perfeito para crianças de todas as idades! Com várias áreas de pula-pula infláveis, as crianças podem gastar energia enquanto se divertem em segurança.',
      color: '#12C7C8',
      sort: '6',
      image:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/pula-pulas.png',
    },
    {
      name: 'Bar e Petiscaria',
      description:
        'Enquanto as crianças brincam, os pais podem relaxar no nosso bar. Com ambiente aconchegante, oferecemos cafés, chás, sucos e coquetéis. O lugar perfeito para descontrair enquanto os pequenos se divertem.',
      color: '#8E4CCF',
      sort: '7',
      image:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/bar.png',
    },
  ]

  for (const item of attractionData) {
    const instance = await prisma.componentInstance.create({
      data: { templateComponentId: attractionTemplateComponent.id },
    })

    await prisma.componentInstanceFieldValue.createMany({
      data: [
        {
          instanceId: instance.id,
          fieldId: attractionNameField.id,
          value: item.name,
        },
        {
          instanceId: instance.id,
          fieldId: attractionDescriptionField.id,
          value: item.description,
        },
        {
          instanceId: instance.id,
          fieldId: attractionImageField.id,
          value: item.image,
        },
        {
          instanceId: instance.id,
          fieldId: attractionColorField.id,
          value: item.color,
        },
        {
          instanceId: instance.id,
          fieldId: attractionSortField.id,
          value: item.sort,
        },
      ],
    })

    await prisma.componentFieldValue.create({
      data: {
        componentFieldId: attractionListField.id,
        instanceId: instance.id,
      },
    })
  }

  // ── BenefitsSection ──────────────────────────────────────────────────────
  const benefitsSectionType = await prisma.contentType.upsert({
    where: { name: 'BenefitsSection' },
    update: {},
    create: { name: 'BenefitsSection' },
  })

  const benefitsSectionComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Section',
        contentTypeId: benefitsSectionType.id,
      },
    },
    update: {},
    create: { name: 'Section', contentTypeId: benefitsSectionType.id },
  })

  await seedFields(benefitsSectionComponent.id, [
    { name: 'badge', value: 'Nossos Diferenciais' },
    { name: 'title', value: 'Por que as famílias escolhem o Divercity Park?' },
    {
      name: 'subtitle',
      value:
        'Mais do que um parque — somos uma experiência completa para toda a família.',
    },
  ])

  const benefitsContentComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Content',
        contentTypeId: benefitsSectionType.id,
      },
    },
    update: {},
    create: { name: 'Content', contentTypeId: benefitsSectionType.id },
  })

  const benefitListField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'Benefit',
        contentComponentId: benefitsContentComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'Benefit',
      type: 'multiple',
      contentComponentId: benefitsContentComponent.id,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: benefitListField.id },
  })

  const benefitsData = [
    {
      title: 'Segurança Total',
      iconName: 'Shield',
      description:
        'Monitoramento 24h, equipe treinada e equipamentos certificados para garantir a segurança de todas as crianças.',
    },
    {
      title: 'Diversão para Todas as Idades',
      iconName: 'Users',
      description:
        'Atrações para crianças de todas as idades, desde os pequeninos até os maiores, com opções para toda a família.',
    },
    {
      title: 'Festas Personalizadas',
      iconName: 'PartyPopper',
      description:
        'Pacotes completos de aniversário com decoração, buffet e acesso a todas as atrações do parque.',
    },
    {
      title: 'Localização Conveniente',
      iconName: 'MapPin',
      description:
        'Fácil acesso, estacionamento gratuito e localização central para toda a família chegar sem preocupações.',
    },
    {
      title: 'Alimentação Saborosa',
      iconName: 'UtensilsCrossed',
      description: 'Opções de bebidas, chopp, petiscos e café.',
    },
    {
      title: 'Atendimento Especializado',
      iconName: 'HeartHandshake',
      description:
        'Equipe dedicada, atenciosa e apaixonada por proporcionar a melhor experiência para cada família.',
    },
  ]

  for (const item of benefitsData) {
    const instance = await prisma.componentInstance.create({
      data: { templateComponentId: benefitTemplateComponent.id },
    })

    await prisma.componentInstanceFieldValue.createMany({
      data: [
        {
          instanceId: instance.id,
          fieldId: benefitTitleField.id,
          value: item.title,
        },
        {
          instanceId: instance.id,
          fieldId: benefitDescriptionField.id,
          value: item.description,
        },
        {
          instanceId: instance.id,
          fieldId: benefitIconNameField.id,
          value: item.iconName,
        },
      ],
    })

    await prisma.componentFieldValue.create({
      data: { componentFieldId: benefitListField.id, instanceId: instance.id },
    })
  }

  // ── PriceSection ─────────────────────────────────────────────────────────
  const priceSectionType = await prisma.contentType.upsert({
    where: { name: 'PriceSection' },
    update: {},
    create: { name: 'PriceSection' },
  })

  const priceSectionComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Section',
        contentTypeId: priceSectionType.id,
      },
    },
    update: {},
    create: { name: 'Section', contentTypeId: priceSectionType.id },
  })

  await seedFields(priceSectionComponent.id, [
    { name: 'badge', value: 'Passaportes' },
    { name: 'title', value: 'Preços' },
    {
      name: 'subtitle',
      value: 'Escolha o passaporte ideal para o seu dia de diversão.',
    },
  ])

  const priceContentComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Content',
        contentTypeId: priceSectionType.id,
      },
    },
    update: {},
    create: { name: 'Content', contentTypeId: priceSectionType.id },
  })

  // prices — multiple General/Price instances
  const pricesListField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'prices',
        contentComponentId: priceContentComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'prices',
      type: 'multiple',
      contentComponentId: priceContentComponent.id,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: pricesListField.id },
  })

  const pricesData = [
    {
      title: 'Segunda a Quinta-feira',
      subtitle: 'exceto feriados',
      color: '#12C7C8',
    },
    {
      title: 'Sexta a Sábado, Domingo e feriados',
      subtitle: '-',
      color: '#8E4CCF',
    },
  ]

  for (const item of pricesData) {
    const instance = await prisma.componentInstance.create({
      data: { templateComponentId: priceTemplateComponent.id },
    })

    await prisma.componentInstanceFieldValue.createMany({
      data: [
        {
          instanceId: instance.id,
          fieldId: priceTitleField.id,
          value: item.title,
        },
        {
          instanceId: instance.id,
          fieldId: priceSubtitleField.id,
          value: item.subtitle,
        },
        {
          instanceId: instance.id,
          fieldId: priceColorField.id,
          value: item.color,
        },
      ],
    })

    await prisma.componentFieldValue.create({
      data: { componentFieldId: pricesListField.id, instanceId: instance.id },
    })
  }

  // tiers — PriceSection/Tiers component with weekdayTiers and weekendTiers
  const priceTiersComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Tiers', contentTypeId: priceSectionType.id },
    },
    update: {},
    create: { name: 'Tiers', contentTypeId: priceSectionType.id },
  })

  const weekdayTiersField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'weekdayTiers',
        contentComponentId: priceTiersComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'weekdayTiers',
      type: 'multiple',
      contentComponentId: priceTiersComponent.id,
    },
  })

  const weekendTiersField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'weekendTiers',
        contentComponentId: priceTiersComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'weekendTiers',
      type: 'multiple',
      contentComponentId: priceTiersComponent.id,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: weekdayTiersField.id },
  })
  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: weekendTiersField.id },
  })

  const weekdayTiersData = [
    { label: '30min', valor: '45', acompanhante: '10' },
    { label: '1 Hora', valor: '55', acompanhante: '15' },
    { label: '2 Horas', valor: '70', acompanhante: '20' },
    { label: '3 Horas', valor: '80', acompanhante: '30' },
  ]

  const weekendTiersData = [
    { label: '30min', valor: '50', acompanhante: '10' },
    { label: '1 Hora', valor: '65', acompanhante: '15' },
    { label: '2 Horas', valor: '80', acompanhante: '20' },
    { label: '3 Horas', valor: '100', acompanhante: '30' },
  ]

  for (const [fieldRef, items] of [
    [weekdayTiersField, weekdayTiersData],
    [weekendTiersField, weekendTiersData],
  ] as const) {
    for (const item of items) {
      const instance = await prisma.componentInstance.create({
        data: { templateComponentId: tierTemplateComponent.id },
      })

      await prisma.componentInstanceFieldValue.createMany({
        data: [
          {
            instanceId: instance.id,
            fieldId: tierLabelField.id,
            value: item.label,
          },
          {
            instanceId: instance.id,
            fieldId: tierValorField.id,
            value: item.valor,
          },
          {
            instanceId: instance.id,
            fieldId: tierAcompanhanteField.id,
            value: item.acompanhante,
          },
        ],
      })

      await prisma.componentFieldValue.create({
        data: { componentFieldId: fieldRef.id, instanceId: instance.id },
      })
    }
  }

  // disclaimers — multiple simple strings
  await seedFields(priceContentComponent.id, [
    {
      name: 'disclaimers',
      type: 'multiple',
      value: [
        `**👨‍👧 Sobre Acompanhantes**\n\n🧒 Crianças de 1 a 4 anos — Recomenda-se estar acompanhadas de um responsável legal (maior de 18 anos). O acompanhante não paga. (Limite de 1 por criança.)\n\n♿ Pessoas com Necessidades Especiais (PNE) — Recomenda-se acompanhante maior de idade. O acompanhante é isento de pagamento. (Limite de 1 por pessoa.)\n\n👦 Crianças a partir de 5 anos — Acompanhante é opcional. Caso entre na área de brinquedos, será cobrada a taxa de acompanhante correspondente ao tempo escolhido.`,
        `**💰 Sobre Valores e Descontos**\n\n👶 Crianças de 0 a 1 ano — Caso utilizem os brinquedos (inclusive área baby): ✨ 50% de desconto sobre o valor do passaporte escolhido.\n\n♿ Pessoas com Necessidades Especiais (PNE) — ✨ 50% de desconto sobre o valor do passaporte escolhido.\n\n🧒 Crianças a partir de 1 ano — Pagam o valor integral do passaporte escolhido.`,
      ],
    },
  ])

  // ── PartySection ─────────────────────────────────────────────────────────
  const partySectionType = await prisma.contentType.upsert({
    where: { name: 'PartySection' },
    update: {},
    create: { name: 'PartySection' },
  })

  const partySectionComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Section',
        contentTypeId: partySectionType.id,
      },
    },
    update: {},
    create: { name: 'Section', contentTypeId: partySectionType.id },
  })

  await seedFields(partySectionComponent.id, [
    { name: 'badge', value: '🎂 Celebrações Especiais' },
    { name: 'title', value: 'Festas e Aniversários Inesquecíveis!' },
    { name: 'description', value: 'Nossos pacotes completos incluem:' },
    {
      name: 'features',
      type: 'multiple',
      value: [
        'Acesso a todas as atrações: Arena de Camas Elásticas, Guerreiro Ninja, Parede de Escalar, Pula-Pula e muito mais!',
        'Estrutura completa com mesas, cadeiras e cilindros para decoração.',
        'Espaço exclusivo para até 50 participantes com pulseiras de identificação e monitores.',
        'Cozinha de apoio com geladeira expositora e réchaud para alimentos quentes.',
        'Utilização do salão por até 3 horas.',
        'Opção de bebidas fornecidas pelo parque, mediante disponibilidade e solicitação antecipada.',
        'Decoração, garçons e buffet por conta do cliente — indicamos fornecedores parceiros.',
        'Pagamento facilitado no Pix ou Cartão.',
      ],
    },
  ])

  const partyCTAsComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'CTAs', contentTypeId: partySectionType.id },
    },
    update: {},
    create: { name: 'CTAs', contentTypeId: partySectionType.id },
  })

  const partyMediaComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Media', contentTypeId: partySectionType.id },
    },
    update: {},
    create: { name: 'Media', contentTypeId: partySectionType.id },
  })

  await seedFields(partyMediaComponent.id, [
    {
      name: 'images',
      type: 'multiple',
      value: [
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/salao-de-festas.png',
      ],
    },
  ])

  await seedInstanceField(
    partyCTAsComponent.id,
    'ctaBudget',
    ctaTemplateComponent.id,
    [
      { fieldId: ctaLabelField.id, value: 'Faça já o seu orçamento' },
      { fieldId: ctaHrefField.id, value: '#contato' },
      { fieldId: ctaColorField.id, value: '#fefefe' },
      { fieldId: ctaBgColorField.id, value: '#FF4F8A' },
      { fieldId: ctaBorderField.id, value: '' },
      { fieldId: ctaHoverColorField.id, value: '' },
      { fieldId: ctaHoverBgColorField.id, value: '' },
      { fieldId: ctaHoverBorderField.id, value: '' },
    ]
  )

  await seedInstanceField(
    partyCTAsComponent.id,
    'ctaPrices',
    ctaTemplateComponent.id,
    [
      { fieldId: ctaLabelField.id, value: 'Ver preços dos passaportes' },
      { fieldId: ctaHrefField.id, value: '#precos' },
      { fieldId: ctaColorField.id, value: 'black' },
      { fieldId: ctaBgColorField.id, value: 'transparent' },
      { fieldId: ctaBorderField.id, value: '1px solid gray' },
      { fieldId: ctaHoverColorField.id, value: '' },
      { fieldId: ctaHoverBgColorField.id, value: '' },
      { fieldId: ctaHoverBorderField.id, value: '' },
    ]
  )

  // ── AdvancePurchaseSection ───────────────────────────────────────────────
  const advancePurchaseType = await prisma.contentType.upsert({
    where: { name: 'AdvancePurchaseSection' },
    update: {},
    create: { name: 'AdvancePurchaseSection' },
  })

  const advancePurchaseSectionComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Section',
        contentTypeId: advancePurchaseType.id,
      },
    },
    update: {},
    create: { name: 'Section', contentTypeId: advancePurchaseType.id },
  })

  await seedFields(advancePurchaseSectionComponent.id, [
    { name: 'title', value: 'Compre antecipadamente' },
    { name: 'subtitle', value: 'Evite filas e garanta sua diversão!' },
  ])

  const advancePurchaseContentComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Content',
        contentTypeId: advancePurchaseType.id,
      },
    },
    update: {},
    create: { name: 'Content', contentTypeId: advancePurchaseType.id },
  })

  // features — multiple General/Feature instances
  const featureListField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'features',
        contentComponentId: advancePurchaseContentComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'features',
      type: 'multiple',
      contentComponentId: advancePurchaseContentComponent.id,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: featureListField.id },
  })

  const advanceFeaturesData = [
    { label: 'Entrada garantida', iconName: 'Ticket', color: '#FF4F8A' },
    { label: 'Pagamento seguro', iconName: 'Lock', color: '#8E4CCF' },
    { label: 'QR Code na entrada', iconName: 'QrCode', color: '#9AD94B' },
  ]

  for (const item of advanceFeaturesData) {
    const instance = await prisma.componentInstance.create({
      data: { templateComponentId: featureTemplateComponent.id },
    })

    await prisma.componentInstanceFieldValue.createMany({
      data: [
        {
          instanceId: instance.id,
          fieldId: featureLabelField.id,
          value: item.label,
        },
        {
          instanceId: instance.id,
          fieldId: featureIconNameField.id,
          value: item.iconName,
        },
        {
          instanceId: instance.id,
          fieldId: featureColorField.id,
          value: item.color,
        },
      ],
    })

    await prisma.componentFieldValue.create({
      data: { componentFieldId: featureListField.id, instanceId: instance.id },
    })
  }

  await seedFields(advancePurchaseContentComponent.id, [
    { name: 'disclaimer', value: '*Consulte as regras no momento da compra' },
  ])

  const advancePurchaseActionsComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Actions',
        contentTypeId: advancePurchaseType.id,
      },
    },
    update: {},
    create: { name: 'Actions', contentTypeId: advancePurchaseType.id },
  })

  await seedInstanceField(
    advancePurchaseActionsComponent.id,
    'cta',
    ctaTemplateComponent.id,
    [
      { fieldId: ctaLabelField.id, value: 'Comprar agora' },
      { fieldId: ctaHrefField.id, value: 'compra-antecipada' },
      { fieldId: ctaColorField.id, value: '#fefefe' },
      { fieldId: ctaBgColorField.id, value: '#FF4F8A' },
      { fieldId: ctaBorderField.id, value: '' },
      { fieldId: ctaHoverColorField.id, value: '' },
      { fieldId: ctaHoverBgColorField.id, value: '' },
      { fieldId: ctaHoverBorderField.id, value: '' },
    ]
  )

  // tickets — AdvancePurchaseSection/Tickets component with prices (General/Price)
  const advancePurchaseTicketsComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Tickets',
        contentTypeId: advancePurchaseType.id,
      },
    },
    update: {},
    create: { name: 'Tickets', contentTypeId: advancePurchaseType.id },
  })

  const ticketPricesListField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'prices',
        contentComponentId: advancePurchaseTicketsComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'prices',
      type: 'multiple',
      contentComponentId: advancePurchaseTicketsComponent.id,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: ticketPricesListField.id },
  })

  const ticketPricesData = [
    {
      title: 'Segunda a Quinta-feira',
      subtitle: 'exceto feriados',
      color: '#12C7C8',
    },
    {
      title: 'Sexta a Sábado, Domingo e feriados',
      subtitle: '-',
      color: '#8E4CCF',
    },
  ]

  for (const item of ticketPricesData) {
    const instance = await prisma.componentInstance.create({
      data: { templateComponentId: priceTemplateComponent.id },
    })

    await prisma.componentInstanceFieldValue.createMany({
      data: [
        {
          instanceId: instance.id,
          fieldId: priceTitleField.id,
          value: item.title,
        },
        {
          instanceId: instance.id,
          fieldId: priceSubtitleField.id,
          value: item.subtitle,
        },
        {
          instanceId: instance.id,
          fieldId: priceColorField.id,
          value: item.color,
        },
      ],
    })

    await prisma.componentFieldValue.create({
      data: { componentFieldId: ticketPricesListField.id, instanceId: instance.id },
    })
  }

  // tiers — AdvancePurchaseSection/Tiers component with weekdayTiers and weekendTiers (General/Tier)
  const advancePurchaseTiersComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Tiers',
        contentTypeId: advancePurchaseType.id,
      },
    },
    update: {},
    create: { name: 'Tiers', contentTypeId: advancePurchaseType.id },
  })

  const ticketWeekdayTiersField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'weekdayTiers',
        contentComponentId: advancePurchaseTiersComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'weekdayTiers',
      type: 'multiple',
      contentComponentId: advancePurchaseTiersComponent.id,
    },
  })

  const ticketWeekendTiersField = await prisma.componentField.upsert({
    where: {
      name_contentComponentId: {
        name: 'weekendTiers',
        contentComponentId: advancePurchaseTiersComponent.id,
      },
    },
    update: { type: 'multiple' },
    create: {
      name: 'weekendTiers',
      type: 'multiple',
      contentComponentId: advancePurchaseTiersComponent.id,
    },
  })

  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: ticketWeekdayTiersField.id },
  })
  await prisma.componentFieldValue.deleteMany({
    where: { componentFieldId: ticketWeekendTiersField.id },
  })

  const ticketWeekdayTiersData = [
    { label: '30min', valor: '45', acompanhante: '10' },
    { label: '1 Hora', valor: '55', acompanhante: '15' },
    { label: '2 Horas', valor: '70', acompanhante: '20' },
    { label: '3 Horas', valor: '80', acompanhante: '30' },
  ]

  const ticketWeekendTiersData = [
    { label: '30min', valor: '50', acompanhante: '10' },
    { label: '1 Hora', valor: '65', acompanhante: '15' },
    { label: '2 Horas', valor: '80', acompanhante: '20' },
    { label: '3 Horas', valor: '100', acompanhante: '30' },
  ]

  for (const [fieldRef, items] of [
    [ticketWeekdayTiersField, ticketWeekdayTiersData],
    [ticketWeekendTiersField, ticketWeekendTiersData],
  ] as const) {
    for (const item of items) {
      const instance = await prisma.componentInstance.create({
        data: { templateComponentId: tierTemplateComponent.id },
      })

      await prisma.componentInstanceFieldValue.createMany({
        data: [
          {
            instanceId: instance.id,
            fieldId: tierLabelField.id,
            value: item.label,
          },
          {
            instanceId: instance.id,
            fieldId: tierValorField.id,
            value: item.valor,
          },
          {
            instanceId: instance.id,
            fieldId: tierAcompanhanteField.id,
            value: item.acompanhante,
          },
        ],
      })

      await prisma.componentFieldValue.create({
        data: { componentFieldId: fieldRef.id, instanceId: instance.id },
      })
    }
  }

  // ── ContactSection ───────────────────────────────────────────────────────
  const contactSectionType = await prisma.contentType.upsert({
    where: { name: 'ContactSection' },
    update: {},
    create: { name: 'ContactSection' },
  })

  const contactSectionComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Section',
        contentTypeId: contactSectionType.id,
      },
    },
    update: {},
    create: { name: 'Section', contentTypeId: contactSectionType.id },
  })

  await seedFields(contactSectionComponent.id, [
    { name: 'badge', value: 'Fale Conosco' },
    { name: 'title', value: 'Nos manda uma mensagem!' },
    {
      name: 'subtitle',
      value:
        'Estamos aqui para tirar todas as suas dúvidas e ajudar a planejar a festa',
    },
    { name: 'formBtnLabel', value: 'Enviar pelo WhatsApp' },
  ])

  const contactInfoComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: {
        name: 'Info',
        contentTypeId: contactSectionType.id,
      },
    },
    update: {},
    create: { name: 'Info', contentTypeId: contactSectionType.id },
  })

  await seedFields(contactInfoComponent.id, [
    { name: 'wppNumber', value: '5514997569008' },
    {
      name: 'address',
      value: 'Av. Tuiuti, 710 – Gleba Patrimônio Maringa, Maringá 87043-720',
    },
    {
      name: 'googleMapsUrl',
      value:
        'https://www.google.com/maps/search/?api=1&query=Av.+Tuiuti,+710+Gleba+Patrimônio+Maringa+Maringá',
    },
    { name: 'weekdaysTime', value: '10h às 22h' },
    { name: 'holidaysTime', value: '12h às 20h' },
    { name: 'instagramUrl', value: 'https://www.instagram.com/divercity.park' },
    { name: 'googleMapsUrlIframe', value: '' },
  ])

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerType = await prisma.contentType.upsert({
    where: { name: 'Footer' },
    update: {},
    create: { name: 'Footer' },
  })

  const footerInfoComponent = await prisma.contentComponent.upsert({
    where: {
      name_contentTypeId: { name: 'Info', contentTypeId: footerType.id },
    },
    update: {},
    create: { name: 'Info', contentTypeId: footerType.id },
  })

  await seedFields(footerInfoComponent.id, [
    {
      name: 'logoFooter',
      value:
        'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/logo-ball-fundo.png',
    },
    { name: 'weekdaysTime', value: '10h às 22h' },
    { name: 'holidaysTime', value: '12h às 20h' },
    {
      name: 'googleMapsUrl',
      value:
        'https://www.google.com/maps/search/?api=1&query=Av.+Tuiuti,+710+Gleba+Patrimônio+Maringa+Maringá',
    },
    {
      name: 'address',
      value: 'Av. Tuiuti, 710 – Gleba Patrimônio Maringa, Maringá 87043-720',
    },
    { name: 'instagramUrl', value: 'https://www.instagram.com/divercity.park' },
    { name: 'wppNumber', value: '5514997569008' },
  ])

  console.log('Seed completo')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
