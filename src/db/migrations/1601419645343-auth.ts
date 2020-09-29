import { MigrationInterface, QueryRunner } from 'typeorm'

export class auth1601419645343 implements MigrationInterface {
  name = 'auth1601419645343'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "voter" ADD "sessionId" uuid NOT NULL')
    await queryRunner.query('ALTER TABLE "session" ADD "audiencePassword" character(60)')
    await queryRunner.query('ALTER TABLE "voter" DROP COLUMN "key"')
    await queryRunner.query('ALTER TABLE "voter" ADD "key" character(60) NOT NULL')
    await queryRunner.query('ALTER TABLE "session" DROP COLUMN "adminPassword"')
    await queryRunner.query('ALTER TABLE "session" ADD "adminPassword" character(60) NOT NULL')
    await queryRunner.query('ALTER TABLE "voter" ADD CONSTRAINT "FK_6033f522a6b039831ecc4f3cebe" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "voter" DROP CONSTRAINT "FK_6033f522a6b039831ecc4f3cebe"')
    await queryRunner.query('ALTER TABLE "session" DROP COLUMN "adminPassword"')
    await queryRunner.query('ALTER TABLE "session" ADD "adminPassword" character varying NOT NULL')
    await queryRunner.query('ALTER TABLE "voter" DROP COLUMN "key"')
    await queryRunner.query('ALTER TABLE "voter" ADD "key" character varying(128) NOT NULL')
    await queryRunner.query('ALTER TABLE "session" DROP COLUMN "audiencePassword"')
    await queryRunner.query('ALTER TABLE "voter" DROP COLUMN "sessionId"')
  }
}
