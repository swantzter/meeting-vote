import { MigrationInterface, QueryRunner } from 'typeorm'

export class freshVoterBlocks1601420635268 implements MigrationInterface {
    name = 'freshVoterBlocks1601420635268'

    public async up (queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "FK_3d6a0a94b47ccb2904c6f143fe1"')
      await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "FK_f26064bb4d39308bec30a016cfd"')
      await queryRunner.query('CREATE INDEX "IDX_3d6a0a94b47ccb2904c6f143fe" ON "voter_block" ("questionId") ')
      await queryRunner.query('CREATE INDEX "IDX_f26064bb4d39308bec30a016cf" ON "voter_block" ("voterId") ')
      await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "FK_3d6a0a94b47ccb2904c6f143fe1" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION')
      await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "FK_f26064bb4d39308bec30a016cfd" FOREIGN KEY ("voterId") REFERENCES "voter"("id") ON DELETE CASCADE ON UPDATE NO ACTION')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "FK_f26064bb4d39308bec30a016cfd"')
      await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "FK_3d6a0a94b47ccb2904c6f143fe1"')
      await queryRunner.query('DROP INDEX "IDX_f26064bb4d39308bec30a016cf"')
      await queryRunner.query('DROP INDEX "IDX_3d6a0a94b47ccb2904c6f143fe"')
      await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "FK_f26064bb4d39308bec30a016cfd" FOREIGN KEY ("voterId") REFERENCES "voter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
      await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "FK_3d6a0a94b47ccb2904c6f143fe1" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
    }
}
