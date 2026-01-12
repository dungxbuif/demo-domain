import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAudilogID1768212932610 implements MigrationInterface {
    name = 'UpdateAudilogID1768212932610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "FK_7953eac210a0e34a3e82a3c5332"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_7a81f05a88126e050f27efe5ae5" UNIQUE ("mezon_id")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e8917a4b38224195dabb0f6a06"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "journey_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "journey_id" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_e8917a4b38224195dabb0f6a06" ON "audit_logs" ("journey_id") `);
        await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "FK_7953eac210a0e34a3e82a3c5332" FOREIGN KEY ("user_id") REFERENCES "users"("mezon_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "FK_7953eac210a0e34a3e82a3c5332"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e8917a4b38224195dabb0f6a06"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "journey_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "journey_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_e8917a4b38224195dabb0f6a06" ON "audit_logs" ("journey_id") `);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_7a81f05a88126e050f27efe5ae5"`);
        await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "FK_7953eac210a0e34a3e82a3c5332" FOREIGN KEY ("user_id") REFERENCES "users"("mezon_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
