import { MigrationInterface, QueryRunner } from 'typeorm'

export class order1601501875694 implements MigrationInterface {
  name = 'order1601501875694'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "question" ADD "order" integer NOT NULL')
    await queryRunner.query('ALTER TABLE "question" ADD CONSTRAINT "uniqueOrdinalPerSession" UNIQUE ("sessionId", "order")')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "question" DROP CONSTRAINT "uniqueOrdinalPerSession"')
    await queryRunner.query('ALTER TABLE "question" DROP COLUMN "order"')
  }
}
