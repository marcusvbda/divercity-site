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
    update: {},
    create: { name: 'General' },
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

  // General/Attraction
  const attractionTemplateComponent = await prisma.contentComponent.upsert({
    where: { name_contentTypeId: { name: 'Attraction', contentTypeId: generalType.id } },
    update: {},
    create: { name: 'Attraction', contentTypeId: generalType.id },
  })

  await seedFields(attractionTemplateComponent.id, [
    { name: 'name',        value: '' },
    { name: 'description', value: '' },
    { name: 'image',       value: '' },
    { name: 'color',       value: '' },
    { name: 'sort',        value: '' },
  ])

  const attractionNameField        = await getField(attractionTemplateComponent.id, 'name')
  const attractionDescriptionField = await getField(attractionTemplateComponent.id, 'description')
  const attractionImageField       = await getField(attractionTemplateComponent.id, 'image')
  const attractionColorField       = await getField(attractionTemplateComponent.id, 'color')
  const attractionSortField        = await getField(attractionTemplateComponent.id, 'sort')

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
    where: { name_contentTypeId: { name: 'Content', contentTypeId: heroType.id } },
    update: {},
    create: { name: 'Content', contentTypeId: heroType.id },
  })

  await seedFields(heroContentComponent.id, [
    { name: 'title',    value: 'Diversão para toda a família' },
    { name: 'subtitle', value: 'Mais de 10 atrações incríveis, festas personalizadas inesquecíveis e um espaço pensado para toda a família.' },
  ])

  const heroMediaComponent = await prisma.contentComponent.upsert({
    where: { name_contentTypeId: { name: 'Media', contentTypeId: heroType.id } },
    update: {},
    create: { name: 'Media', contentTypeId: heroType.id },
  })

  await seedFields(heroMediaComponent.id, [
    { name: 'bgImage', value: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/hero.png' },
    { name: 'image',   value: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/logo-ball.png' },
  ])

  const heroActionsComponent = await prisma.contentComponent.upsert({
    where: { name_contentTypeId: { name: 'Actions', contentTypeId: heroType.id } },
    update: {},
    create: { name: 'Actions', contentTypeId: heroType.id },
  })

  await seedInstanceField(heroActionsComponent.id, 'primaryCta', ctaTemplateComponent.id, [
    { fieldId: ctaLabelField.id,        value: 'Reservar festa' },
    { fieldId: ctaHrefField.id,         value: '#festas' },
    { fieldId: ctaColorField.id,        value: '#fefefe' },
    { fieldId: ctaBgColorField.id,      value: '#FF4F8A' },
    { fieldId: ctaBorderField.id,       value: '' },
    { fieldId: ctaHoverColorField.id,   value: '' },
    { fieldId: ctaHoverBgColorField.id, value: '' },
    { fieldId: ctaHoverBorderField.id,  value: '' },
  ])

  await seedInstanceField(heroActionsComponent.id, 'secondaryCta', ctaTemplateComponent.id, [
    { fieldId: ctaLabelField.id,        value: 'Atrações' },
    { fieldId: ctaHrefField.id,         value: '#atracoes' },
    { fieldId: ctaColorField.id,        value: '#fefefe' },
    { fieldId: ctaBgColorField.id,      value: 'transparent' },
    { fieldId: ctaBorderField.id,       value: '1px solid #fefefe' },
    { fieldId: ctaHoverColorField.id,   value: '' },
    { fieldId: ctaHoverBgColorField.id, value: '' },
    { fieldId: ctaHoverBorderField.id,  value: '' },
  ])

  // ── Attractions ───────────────────────────────────────────────────────────
  const attractionsType = await prisma.contentType.upsert({
    where: { name: 'Attractions' },
    update: {},
    create: { name: 'Attractions' },
  })

  const attractionsSectionComponent = await prisma.contentComponent.upsert({
    where: { name_contentTypeId: { name: 'Section', contentTypeId: attractionsType.id } },
    update: {},
    create: { name: 'Section', contentTypeId: attractionsType.id },
  })

  await seedFields(attractionsSectionComponent.id, [
    { name: 'title',    value: 'Nossas Atrações' },
    { name: 'badge',    value: 'Explore o Parque' },
    { name: 'subtitle', value: 'Mais de 10 atrações para crianças de todas as idades. Aventura, diversão e segurança em um só lugar.' },
  ])

  const attractionsContentComponent = await prisma.contentComponent.upsert({
    where: { name_contentTypeId: { name: 'Content', contentTypeId: attractionsType.id } },
    update: {},
    create: { name: 'Content', contentTypeId: attractionsType.id },
  })

  const attractionListField = await prisma.componentField.upsert({
    where: { name_contentComponentId: { name: 'Attraction', contentComponentId: attractionsContentComponent.id } },
    update: { type: 'multiple' },
    create: { name: 'Attraction', type: 'multiple', contentComponentId: attractionsContentComponent.id },
  })

  await prisma.componentFieldValue.deleteMany({ where: { componentFieldId: attractionListField.id } })

  const attractionData = [
    { name: 'Arena de Camas Elásticas', description: 'Nossa arena de camas elásticas é o lugar perfeito para pular e se divertir! Com trampolins interconectados, as crianças podem pular livremente, realizar acrobacias e liberar toda a energia.', color: '#12C7C8', sort: '1', image: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/cama-elastica.png' },
    { name: 'Guerreiro Ninja',          description: 'Desafie suas habilidades na nossa pista de obstáculos Guerreiro Ninja! Projetada para testar força, agilidade e coordenação, essa atração oferece diferentes níveis de dificuldade para crianças de todas as idades.', color: '#8E4CCF', sort: '2', image: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/guerreiro-ninja.png' },
    { name: 'Parede de Escalada',       description: 'Nossa parede de escalar é ideal para pequenos alpinistas. Com vários percursos e níveis de dificuldade, as crianças podem desenvolver suas habilidades em um ambiente seguro, sempre supervisionado por nossos monitores.', color: '#FF4F8A', sort: '3', image: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/parede-escalada.png' },
    { name: 'Salão de Festas',          description: 'Venha celebrar o aniversário do seu filho com a diversão do Divercity Park! Nosso salão oferece conforto, segurança e acesso a todas as atrações. Adultos não pagam entrada para acompanhar a festa!', color: '#FFD23F', sort: '4', image: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/salao-de-festas.png' },
    { name: 'Desafio Radical',          description: 'Prepare-se para enfrentar o Desafio Radical, nosso circuito de obstáculos emocionante! Com desafios que testam agilidade, força e coragem, os pequenos poderão escalar, pular, rastejar e se equilibrar.', color: '#9AD94B', sort: '5', image: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/desafio-radical.png' },
    { name: 'Pula-Pulas',               description: 'Nosso espaço de Pula-Pula é perfeito para crianças de todas as idades! Com várias áreas de pula-pula infláveis, as crianças podem gastar energia enquanto se divertem em segurança.', color: '#12C7C8', sort: '6', image: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/pula-pulas.png' },
    { name: 'Bar e Petiscaria',         description: 'Enquanto as crianças brincam, os pais podem relaxar no nosso bar. Com ambiente aconchegante, oferecemos cafés, chás, sucos e coquetéis. O lugar perfeito para descontrair enquanto os pequenos se divertem.', color: '#8E4CCF', sort: '7', image: 'https://vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/bar.png' },
  ]

  for (const item of attractionData) {
    const instance = await prisma.componentInstance.create({
      data: { templateComponentId: attractionTemplateComponent.id },
    })

    await prisma.componentInstanceFieldValue.createMany({
      data: [
        { instanceId: instance.id, fieldId: attractionNameField.id,        value: item.name },
        { instanceId: instance.id, fieldId: attractionDescriptionField.id, value: item.description },
        { instanceId: instance.id, fieldId: attractionImageField.id,       value: item.image },
        { instanceId: instance.id, fieldId: attractionColorField.id,       value: item.color },
        { instanceId: instance.id, fieldId: attractionSortField.id,        value: item.sort },
      ],
    })

    await prisma.componentFieldValue.create({
      data: { componentFieldId: attractionListField.id, instanceId: instance.id },
    })
  }

  console.log('Seed completo')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
