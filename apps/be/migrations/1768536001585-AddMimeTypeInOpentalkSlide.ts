import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMimeTypeInOpentalkSlide1768536001585 implements MigrationInterface {
  name = 'AddMimeTypeInOpentalkSlide1768536001585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "opentalk_slides" ADD "mime_type" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "opentalk_slides" DROP COLUMN "mime_type"`,
    );
  }
}
