import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.sale.deleteMany();
  await prisma.proposalDocument.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.leadAnalysis.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.exportJob.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.lead.deleteMany();

  console.log("Dados operacionais removidos. Usuarios, categorias, cidades e configuracoes foram preservados.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
