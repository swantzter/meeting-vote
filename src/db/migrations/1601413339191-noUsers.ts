import { MigrationInterface, QueryRunner } from 'typeorm'

export class noUsers1601413339191 implements MigrationInterface {
  name = 'noUsers1601413339191'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "session" ADD "adminPassword" character varying NOT NULL')

    await queryRunner.query('ALTER TABLE "user_sessions_session" DROP CONSTRAINT "FK_43a4174f69e1183c31d780936f5"')
    await queryRunner.query('ALTER TABLE "user_sessions_session" DROP CONSTRAINT "FK_620f11776a8275780b3c07c4f21"')
    await queryRunner.query('DROP INDEX "IDX_43a4174f69e1183c31d780936f"')
    await queryRunner.query('DROP INDEX "IDX_620f11776a8275780b3c07c4f2"')
    await queryRunner.query('DROP TABLE "user_sessions_session"')
    await queryRunner.query('DROP TABLE "user"')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "user" ("id" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))')

    await queryRunner.query('CREATE TABLE "user_sessions_session" ("userId" character varying NOT NULL, "sessionId" uuid NOT NULL, CONSTRAINT "PK_ed1f318dad5a907151f64089323" PRIMARY KEY ("userId", "sessionId"))')
    await queryRunner.query('CREATE INDEX "IDX_620f11776a8275780b3c07c4f2" ON "user_sessions_session" ("userId") ')
    await queryRunner.query('CREATE INDEX "IDX_43a4174f69e1183c31d780936f" ON "user_sessions_session" ("sessionId") ')
    await queryRunner.query('ALTER TABLE "user_sessions_session" ADD CONSTRAINT "FK_620f11776a8275780b3c07c4f21" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION')
    await queryRunner.query('ALTER TABLE "user_sessions_session" ADD CONSTRAINT "FK_43a4174f69e1183c31d780936f5" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION')

    await queryRunner.query('ALTER TABLE "session" DROP COLUMN "adminPassword"')
  }
}
