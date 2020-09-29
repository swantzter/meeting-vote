import { MigrationInterface, QueryRunner } from 'typeorm'

export class voteImprovements1601336934133 implements MigrationInterface {
  name = 'voteImprovements1601336934133'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "vote" ADD "createdAt" TIMESTAMP NOT NULL')
    await queryRunner.query('ALTER TABLE "vote" ADD "voterId" character varying NOT NULL')
    await queryRunner.query('ALTER TABLE "vote" ADD CONSTRAINT "FK_9c72b23d6e8f221818d6a43caff" FOREIGN KEY ("voterId") REFERENCES "voter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "vote" DROP CONSTRAINT "FK_9c72b23d6e8f221818d6a43caff"')
    await queryRunner.query('ALTER TABLE "vote" DROP COLUMN "voterId"')
    await queryRunner.query('ALTER TABLE "vote" DROP COLUMN "createdAt"')
  }
}
