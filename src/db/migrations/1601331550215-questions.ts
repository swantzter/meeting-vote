import { MigrationInterface, QueryRunner } from 'typeorm'

export class questions1601331550215 implements MigrationInterface {
  name = 'questions1601331550215'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "question" ("id" SERIAL NOT NULL, "question" character varying NOT NULL, "sessionId" uuid, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))')
    await queryRunner.query('ALTER TABLE "question" ADD CONSTRAINT "FK_b36af568dd6be0a5263faa1bdc3" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "question" DROP CONSTRAINT "FK_b36af568dd6be0a5263faa1bdc3"')
    await queryRunner.query('DROP TABLE "question"')
  }
}
