import { MigrationInterface, QueryRunner } from 'typeorm'

export class autocreatedat1601420149284 implements MigrationInterface {
  name = 'autocreatedat1601420149284'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "vote" ALTER COLUMN "createdAt" SET DEFAULT now()')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "vote" ALTER COLUMN "createdAt" DROP DEFAULT')
  }
}
