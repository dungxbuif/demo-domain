import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPenaltyProofTable1768539435074 implements MigrationInterface {
    name = 'AddPenaltyProofTable1768539435074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "penalty_proofs" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "image_key" character varying NOT NULL, "mime_type" character varying NOT NULL, "penalty_id" integer, CONSTRAINT "PK_ceb39c4359f6427d6147ec4c08a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "penalties" DROP COLUMN "evidence_urls"`);
        await queryRunner.query(`ALTER TABLE "penalty_proofs" ADD CONSTRAINT "FK_ea9c84b3520ad3f83f4f284ded8" FOREIGN KEY ("penalty_id") REFERENCES "penalties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "penalty_proofs" DROP CONSTRAINT "FK_ea9c84b3520ad3f83f4f284ded8"`);
        await queryRunner.query(`ALTER TABLE "penalties" ADD "evidence_urls" json`);
        await queryRunner.query(`DROP TABLE "penalty_proofs"`);
    }

}
