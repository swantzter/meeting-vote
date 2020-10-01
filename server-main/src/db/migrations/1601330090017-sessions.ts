import { MigrationInterface, QueryRunner } from 'typeorm'

export class sessions1601330090017 implements MigrationInterface {
  name = 'sessions1601330090017'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "session"')
  }
}
