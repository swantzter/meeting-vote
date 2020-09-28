import { MigrationInterface, QueryRunner } from 'typeorm'

export class questionDates1601334492152 implements MigrationInterface {
  name = 'questionDates1601334492152'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "question" ADD "openedAt" TIMESTAMP')
    await queryRunner.query('ALTER TABLE "question" ADD "closedAt" TIMESTAMP')
    await queryRunner.query('ALTER TABLE "question" DROP CONSTRAINT "FK_b36af568dd6be0a5263faa1bdc3"')
    await queryRunner.query('ALTER TABLE "question" ALTER COLUMN "sessionId" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "question" ADD CONSTRAINT "FK_b36af568dd6be0a5263faa1bdc3" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "question" DROP CONSTRAINT "FK_b36af568dd6be0a5263faa1bdc3"')
    await queryRunner.query('ALTER TABLE "question" ALTER COLUMN "sessionId" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "question" ADD CONSTRAINT "FK_b36af568dd6be0a5263faa1bdc3" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
    await queryRunner.query('ALTER TABLE "question" DROP COLUMN "closedAt"')
    await queryRunner.query('ALTER TABLE "question" DROP COLUMN "openedAt"')
  }
}
