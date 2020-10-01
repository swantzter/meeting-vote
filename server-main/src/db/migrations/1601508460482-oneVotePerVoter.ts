import { MigrationInterface, QueryRunner } from 'typeorm'

export class oneVotePerVoter1601508460482 implements MigrationInterface {
  name = 'oneVotePerVoter1601508460482'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "vote" DROP CONSTRAINT "FK_9c72b23d6e8f221818d6a43caff"')
    await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "FK_f26064bb4d39308bec30a016cfd"')
    await queryRunner.query('DROP INDEX "IDX_f26064bb4d39308bec30a016cf"')
    await queryRunner.query('ALTER TABLE "voter_block" RENAME COLUMN "voterId" TO "voterDbId"')
    await queryRunner.query('ALTER TABLE "voter_block" RENAME CONSTRAINT "PK_ecdc772fb6d35639e1232160e9a" TO "PK_cade867a83283d65d7c4491c959"')
    await queryRunner.query('ALTER TABLE "voter" ADD "dbId" SERIAL NOT NULL')
    await queryRunner.query('ALTER TABLE "voter" DROP CONSTRAINT "PK_c1a0d8fd992c199219325d43705"')
    await queryRunner.query('ALTER TABLE "voter" ADD CONSTRAINT "PK_416697d7814cda001de1a10e716" PRIMARY KEY ("id", "dbId")')
    await queryRunner.query('ALTER TABLE "vote" ADD "voterDbId" integer')
    await queryRunner.query('ALTER TABLE "voter" DROP CONSTRAINT "PK_416697d7814cda001de1a10e716"')
    await queryRunner.query('ALTER TABLE "voter" ADD CONSTRAINT "PK_47ff0bc29c3e0329c4bb9f0a5d6" PRIMARY KEY ("dbId")')
    await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "PK_cade867a83283d65d7c4491c959"')
    await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "PK_3d6a0a94b47ccb2904c6f143fe1" PRIMARY KEY ("questionId")')
    await queryRunner.query('ALTER TABLE "voter_block" DROP COLUMN "voterDbId"')
    await queryRunner.query('ALTER TABLE "voter_block" ADD "voterDbId" integer NOT NULL')
    await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "PK_3d6a0a94b47ccb2904c6f143fe1"')
    await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "PK_cade867a83283d65d7c4491c959" PRIMARY KEY ("questionId", "voterDbId")')
    await queryRunner.query('CREATE INDEX "IDX_3aa4ad5b78d19d64da1e05417b" ON "voter_block" ("voterDbId") ')
    await queryRunner.query('ALTER TABLE "voter" ADD CONSTRAINT "uniqueVoterPerSession" UNIQUE ("id", "sessionId")')
    await queryRunner.query('ALTER TABLE "vote" ADD CONSTRAINT "oneVotePerQuestion" UNIQUE ("questionId", "voterId")')
    await queryRunner.query('ALTER TABLE "vote" ADD CONSTRAINT "FK_499d49dcecccfff5dc192b45880" FOREIGN KEY ("voterDbId") REFERENCES "voter"("dbId") ON DELETE NO ACTION ON UPDATE NO ACTION')
    await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "FK_3aa4ad5b78d19d64da1e05417bf" FOREIGN KEY ("voterDbId") REFERENCES "voter"("dbId") ON DELETE CASCADE ON UPDATE NO ACTION')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "FK_3aa4ad5b78d19d64da1e05417bf"')
    await queryRunner.query('ALTER TABLE "vote" DROP CONSTRAINT "FK_499d49dcecccfff5dc192b45880"')
    await queryRunner.query('ALTER TABLE "vote" DROP CONSTRAINT "oneVotePerQuestion"')
    await queryRunner.query('ALTER TABLE "voter" DROP CONSTRAINT "uniqueVoterPerSession"')
    await queryRunner.query('DROP INDEX "IDX_3aa4ad5b78d19d64da1e05417b"')
    await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "PK_cade867a83283d65d7c4491c959"')
    await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "PK_3d6a0a94b47ccb2904c6f143fe1" PRIMARY KEY ("questionId")')
    await queryRunner.query('ALTER TABLE "voter_block" DROP COLUMN "voterDbId"')
    await queryRunner.query('ALTER TABLE "voter_block" ADD "voterDbId" character varying NOT NULL')
    await queryRunner.query('ALTER TABLE "voter_block" DROP CONSTRAINT "PK_3d6a0a94b47ccb2904c6f143fe1"')
    await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "PK_cade867a83283d65d7c4491c959" PRIMARY KEY ("questionId", "voterDbId")')
    await queryRunner.query('ALTER TABLE "voter" DROP CONSTRAINT "PK_47ff0bc29c3e0329c4bb9f0a5d6"')
    await queryRunner.query('ALTER TABLE "voter" ADD CONSTRAINT "PK_416697d7814cda001de1a10e716" PRIMARY KEY ("id", "dbId")')
    await queryRunner.query('ALTER TABLE "vote" DROP COLUMN "voterDbId"')
    await queryRunner.query('ALTER TABLE "voter" DROP CONSTRAINT "PK_416697d7814cda001de1a10e716"')
    await queryRunner.query('ALTER TABLE "voter" ADD CONSTRAINT "PK_c1a0d8fd992c199219325d43705" PRIMARY KEY ("id")')
    await queryRunner.query('ALTER TABLE "voter" DROP COLUMN "dbId"')
    await queryRunner.query('ALTER TABLE "voter_block" RENAME CONSTRAINT "PK_cade867a83283d65d7c4491c959" TO "PK_ecdc772fb6d35639e1232160e9a"')
    await queryRunner.query('ALTER TABLE "voter_block" RENAME COLUMN "voterDbId" TO "voterId"')
    await queryRunner.query('CREATE INDEX "IDX_f26064bb4d39308bec30a016cf" ON "voter_block" ("voterId") ')
    await queryRunner.query('ALTER TABLE "voter_block" ADD CONSTRAINT "FK_f26064bb4d39308bec30a016cfd" FOREIGN KEY ("voterId") REFERENCES "voter"("id") ON DELETE CASCADE ON UPDATE NO ACTION')
    await queryRunner.query('ALTER TABLE "vote" ADD CONSTRAINT "FK_9c72b23d6e8f221818d6a43caff" FOREIGN KEY ("voterId") REFERENCES "voter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
  }
}
