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

  console.log('Seed completo')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
