import { MigrationInterface, QueryRunner } from 'typeorm'

export class entities1601336240813 implements MigrationInterface {
  name = 'entities1601336240813'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "vote_vote_enum" AS ENUM(\'yes\', \'no\', \'abstain\')')
    await queryRunner.query('CREATE TABLE "vote" ("id" SERIAL NOT NULL, "vote" "vote_vote_enum" NOT NULL, "questionId" integer NOT NULL, CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TABLE "user" ("id" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TABLE "voter" ("id" character varying NOT NULL, "key" character varying(128) NOT NULL, CONSTRAINT "PK_c1a0d8fd992c199219325d43705" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TABLE "voter_block" ("questionId" integer NOT NULL, "voterId" character varying NOT NULL, CONSTRAINT "PK_ecdc772fb6d35639e1232160e9a" PRIMARY KEY ("questionId", "voterId"))')
    await queryRunner.query('ALTER TABLE "vote" ADD CONSTRAINT "FK_b4f0f67acbc748e9722df9d6c23" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
    await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "FK_3d6a0a94b47ccb2904c6f143fe1" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
    await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "FK_f26064bb4d39308bec30a016cfd" FOREIGN KEY ("voterId") REFERENCES "voter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "FK_f26064bb4d39308bec30a016cfd"')
    await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "FK_3d6a0a94b47ccb2904c6f143fe1"')
    await queryRunner.query('ALTER TABLE "vote" DROP CONSTRAINT "FK_b4f0f67acbc748e9722df9d6c23"')
    await queryRunner.query('DROP TABLE "voter_block"')
    await queryRunner.query('DROP TABLE "voter"')
    await queryRunner.query('DROP TABLE "user"')
    await queryRunner.query('DROP TABLE "vote"')
    await queryRunner.query('DROP TYPE "vote_vote_enum"')
  }
}
