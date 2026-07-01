import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { initialCategories } from "../data/categories";
import { sulMinasCities } from "../data/sul-minas-cities";
import { mockLeads } from "../data/mock-data";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@orbit.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "orbit123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Orbit Admin",
      email: adminEmail,
      passwordHash: await hash(adminPassword, 12),
      role: "ADMIN"
    }
  });

  await prisma.category.createMany({
    data: initialCategories.map((name) => ({ name })),
    skipDuplicates: true
  });

  await prisma.city.createMany({
    data: sulMinasCities.map((name) => ({
      name,
      state: "MG",
      region: "Sul de Minas"
    })),
    skipDuplicates: true
  });

  for (const lead of mockLeads) {
    const category = await prisma.category.findUnique({ where: { name: lead.category } });
    const city = await prisma.city.findUnique({ where: { name_state: { name: lead.city, state: lead.state } } });

    await prisma.lead.upsert({
      where: {
        company_phone_cityName: {
          company: lead.company,
          phone: lead.phone ?? "",
          cityName: lead.city
        }
      },
      update: {},
      create: {
        company: lead.company,
        phone: lead.phone ?? "",
        address: lead.address,
        cityName: lead.city,
        state: lead.state,
        website: lead.website,
        instagram: lead.instagram,
        googleMaps: lead.googleMapsUrl,
        rating: lead.rating,
        reviewCount: lead.reviewCount,
        latitude: lead.latitude,
        longitude: lead.longitude,
        hasWhatsApp: lead.hasWhatsApp,
        status: lead.status,
        categoryId: category?.id,
        cityId: city?.id
      }
    });
  }

  await prisma.messageTemplate.upsert({
    where: { id: "default-outreach" },
    update: {},
    create: {
      id: "default-outreach",
      name: "Abordagem consultiva",
      isDefault: true,
      userId: admin.id,
      content:
        "Ola {empresa}, tudo bem?\n\nVi o trabalho de voces em {cidade} e gostei bastante. Sou da Orbit e percebi algumas oportunidades para atrair mais clientes em {categoria} usando trafego, posicionamento local e WhatsApp.\n\nPosso te mandar uma analise rapida sem compromisso?"
    }
  });

  await prisma.appSettings.upsert({
    where: { id: "orbit-settings" },
    update: {},
    create: {
      id: "orbit-settings",
      companyName: "Orbit",
      defaultMessage:
        "Ola {empresa}, tudo bem?\n\nVi o trabalho de voces e acredito que a Orbit pode ajudar a gerar mais clientes qualificados em {cidade}."
    }
  });

  await prisma.automationRule.createMany({
    data: [
      {
        name: "Interessado cria lembrete",
        trigger: "LEAD_STATUS_INTERESTED",
        action: "CREATE_FOLLOW_UP",
        metadata: { days: 3 }
      },
      {
        name: "Cliente gera contrato",
        trigger: "LEAD_STATUS_CLIENT",
        action: "GENERATE_CONTRACT"
      },
      {
        name: "Proposta gera orcamento",
        trigger: "LEAD_STATUS_PROPOSAL",
        action: "GENERATE_QUOTE"
      }
    ],
    skipDuplicates: true
  });

  console.log(`Seed concluido. Login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
