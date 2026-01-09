import { MigrationInterface, QueryRunner } from "typeorm";

export class InitializeDB1767949236047 implements MigrationInterface {
    name = 'InitializeDB1767949236047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "mezon_id" character varying NOT NULL, "name" character varying, "email" character varying, "avatar" character varying, CONSTRAINT "UQ_7a81f05a88126e050f27efe5ae5" UNIQUE ("mezon_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_7a81f05a88126e050f27efe5ae5" PRIMARY KEY ("mezon_id"))`);
        await queryRunner.query(`CREATE TABLE "branches" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "address" character varying, CONSTRAINT "UQ_9c06cbb83feb2f0be6263bd47ee" UNIQUE ("code"), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "staffs" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "email" character varying NOT NULL, "status" integer NOT NULL DEFAULT '0', "user_id" character varying, "role" integer NOT NULL, "branch_id" integer NOT NULL, CONSTRAINT "UQ_fc7b6dc314d349acb74a6124fe9" UNIQUE ("email"), CONSTRAINT "REL_7953eac210a0e34a3e82a3c533" UNIQUE ("user_id"), CONSTRAINT "PK_f3fec5e06209b46afdf8accf117" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_event_queue_operation_type_enum" AS ENUM('SHIFT_EVENT', 'CANCEL_EVENT', 'REASSIGN_PARTICIPANT', 'UPDATE_EVENT')`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_event_queue_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "schedule_event_queue" ("id" SERIAL NOT NULL, "event_id" integer NOT NULL, "operation_type" "public"."schedule_event_queue_operation_type_enum" NOT NULL, "status" "public"."schedule_event_queue_status_enum" NOT NULL DEFAULT 'PENDING', "metadata" jsonb NOT NULL, "result" jsonb, "retry_count" integer NOT NULL DEFAULT '0', "max_retries" integer NOT NULL DEFAULT '3', "error_message" text, "processed_at" TIMESTAMP, "scheduled_for" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2261315183035dbed5b18758d43" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_736fa7908eaa7c2c11f324f763" ON "schedule_event_queue" ("event_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_79438fd851d9d0dff364d1e08e" ON "schedule_event_queue" ("status", "created_at") `);
        await queryRunner.query(`CREATE TABLE "schedule_event_participants" ("event_id" integer NOT NULL, "staff_id" integer NOT NULL, CONSTRAINT "PK_128517c4519f0b5d972c1feae56" PRIMARY KEY ("event_id", "staff_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_cycles_type_enum" AS ENUM('CLEANING', 'OPENTALK')`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_cycles_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'DRAFT')`);
        await queryRunner.query(`CREATE TABLE "schedule_cycles" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" "public"."schedule_cycles_type_enum" NOT NULL, "status" "public"."schedule_cycles_status_enum" NOT NULL DEFAULT 'DRAFT', "description" character varying, CONSTRAINT "PK_0c98d7c4024beec1bad03d9e004" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_events_type_enum" AS ENUM('CLEANING', 'OPENTALK')`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_events_status_enum" AS ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "schedule_events" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" "public"."schedule_events_type_enum" NOT NULL, "cycle_id" integer NOT NULL, "event_date" date NOT NULL, "status" "public"."schedule_events_status_enum" NOT NULL DEFAULT 'PENDING', "notes" character varying, CONSTRAINT "PK_c14624cf0aa0f238ace86e789aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedule_assignments" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "cycle_id" integer NOT NULL, "type" character varying(50) NOT NULL, "date" date NOT NULL, "sequence_in_cycle" integer NOT NULL, "staff_ids" integer array NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'scheduled', "reference_id" integer, "reference_table" character varying(50), "is_rescheduled" boolean NOT NULL DEFAULT false, "original_date" date, "notes" text, "metadata" jsonb, CONSTRAINT "PK_35e6ea7388008ff9d03d35656c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."opentalk_slides_status_enum" AS ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "opentalk_slides" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "event_id" integer NOT NULL, "staff_id" integer NOT NULL, "slide_url" character varying, "status" "public"."opentalk_slides_status_enum" NOT NULL DEFAULT 'PENDING', "topic" character varying, "description" text, "submitted_at" TIMESTAMP, "reviewed_at" TIMESTAMP, "reviewed_by" integer, "review_note" text, CONSTRAINT "PK_b08537aa74942400dd264aac298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."penalties_status_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "penalties" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "user_id" integer NOT NULL, "penalty_type_id" integer NOT NULL, "date" date NOT NULL, "amount" numeric(10,2) NOT NULL, "reason" character varying NOT NULL, "evidence_urls" json, "status" "public"."penalties_status_enum" NOT NULL DEFAULT '0', CONSTRAINT "PK_c917b09222ad10103d984fc4e7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "penalty_types" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "amount" numeric(10,2) NOT NULL, CONSTRAINT "PK_6cd980eeb585aeba467a9afcc2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."swap_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "swap_requests" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "from_event_id" integer NOT NULL, "to_event_id" integer NOT NULL, "requester_id" integer NOT NULL, "reason" character varying NOT NULL, "status" "public"."swap_requests_status_enum" NOT NULL DEFAULT 'PENDING', "review_note" character varying, CONSTRAINT "PK_4a3a8b292e0e8df37acbc47e648" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "opentalk_slide_submissions" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "event_id" integer NOT NULL, "slides_url" character varying NOT NULL, "topic" character varying, "submitted_by" integer NOT NULL, "notes" text, CONSTRAINT "PK_f26a2f92ff16f834037436f1974" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "holidays" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "date" date NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_3646bdd4c3817d954d830881dfe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "channel_config" ("channel_type" character varying(50) NOT NULL, "channel_id" character varying(255) NOT NULL, "channel_name" character varying(255), "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7fd2f41ced09d08822c126a4777" PRIMARY KEY ("channel_type"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_level_enum" AS ENUM('TRACE', 'DEBUG', 'LOG', 'WARN', 'ERROR', 'FATAL')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_by" integer, "id" SERIAL NOT NULL, "level" "public"."audit_logs_level_enum" NOT NULL, "message" text NOT NULL, "context" character varying(100), "journey_id" uuid, "metadata" jsonb, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_90c9f6cf73be48eeaa64de4df7" ON "audit_logs" ("context") `);
        await queryRunner.query(`CREATE INDEX "IDX_76566a7a3b90863650d467bff6" ON "audit_logs" ("level") `);
        await queryRunner.query(`CREATE INDEX "IDX_e8917a4b38224195dabb0f6a06" ON "audit_logs" ("journey_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cd10fda8276bb995288acfbfb" ON "audit_logs" ("created_at") `);
        await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "FK_7953eac210a0e34a3e82a3c5332" FOREIGN KEY ("user_id") REFERENCES "users"("mezon_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "staffs" ADD CONSTRAINT "FK_746a55cdb6e2dd9f2e865f947ad" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event_participants" ADD CONSTRAINT "FK_9d783dc95b3fcbab4c009d1b0a9" FOREIGN KEY ("event_id") REFERENCES "schedule_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event_participants" ADD CONSTRAINT "FK_fa26523ccf1ea291665c0a96b78" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_events" ADD CONSTRAINT "FK_0fe7348b9716d7d1243d7670e09" FOREIGN KEY ("cycle_id") REFERENCES "schedule_cycles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_assignments" ADD CONSTRAINT "FK_50930fe6f08149395eab0e990a7" FOREIGN KEY ("cycle_id") REFERENCES "schedule_cycles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opentalk_slides" ADD CONSTRAINT "FK_d1a0044abe5db61ef46d3d776d7" FOREIGN KEY ("event_id") REFERENCES "schedule_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opentalk_slides" ADD CONSTRAINT "FK_866a54dd61c2c1eec913f50d288" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opentalk_slides" ADD CONSTRAINT "FK_3ccc53068d677b58d157287ab72" FOREIGN KEY ("reviewed_by") REFERENCES "staffs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "penalties" ADD CONSTRAINT "FK_69f168d22cf0bd43bc0a95cc767" FOREIGN KEY ("penalty_type_id") REFERENCES "penalty_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "swap_requests" ADD CONSTRAINT "FK_8345d5a4c2f3ccd05faad28c5ae" FOREIGN KEY ("from_event_id") REFERENCES "schedule_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "swap_requests" ADD CONSTRAINT "FK_3fc058e5e787597c2a3305440d0" FOREIGN KEY ("to_event_id") REFERENCES "schedule_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "swap_requests" ADD CONSTRAINT "FK_5361b1dfafc1c0124525fbd2409" FOREIGN KEY ("requester_id") REFERENCES "staffs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opentalk_slide_submissions" ADD CONSTRAINT "FK_0dfe4c4839a1818dee74687abf9" FOREIGN KEY ("event_id") REFERENCES "schedule_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opentalk_slide_submissions" ADD CONSTRAINT "FK_4598ae2df4183e29bd05f875bad" FOREIGN KEY ("submitted_by") REFERENCES "staffs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "opentalk_slide_submissions" DROP CONSTRAINT "FK_4598ae2df4183e29bd05f875bad"`);
        await queryRunner.query(`ALTER TABLE "opentalk_slide_submissions" DROP CONSTRAINT "FK_0dfe4c4839a1818dee74687abf9"`);
        await queryRunner.query(`ALTER TABLE "swap_requests" DROP CONSTRAINT "FK_5361b1dfafc1c0124525fbd2409"`);
        await queryRunner.query(`ALTER TABLE "swap_requests" DROP CONSTRAINT "FK_3fc058e5e787597c2a3305440d0"`);
        await queryRunner.query(`ALTER TABLE "swap_requests" DROP CONSTRAINT "FK_8345d5a4c2f3ccd05faad28c5ae"`);
        await queryRunner.query(`ALTER TABLE "penalties" DROP CONSTRAINT "FK_69f168d22cf0bd43bc0a95cc767"`);
        await queryRunner.query(`ALTER TABLE "opentalk_slides" DROP CONSTRAINT "FK_3ccc53068d677b58d157287ab72"`);
        await queryRunner.query(`ALTER TABLE "opentalk_slides" DROP CONSTRAINT "FK_866a54dd61c2c1eec913f50d288"`);
        await queryRunner.query(`ALTER TABLE "opentalk_slides" DROP CONSTRAINT "FK_d1a0044abe5db61ef46d3d776d7"`);
        await queryRunner.query(`ALTER TABLE "schedule_assignments" DROP CONSTRAINT "FK_50930fe6f08149395eab0e990a7"`);
        await queryRunner.query(`ALTER TABLE "schedule_events" DROP CONSTRAINT "FK_0fe7348b9716d7d1243d7670e09"`);
        await queryRunner.query(`ALTER TABLE "schedule_event_participants" DROP CONSTRAINT "FK_fa26523ccf1ea291665c0a96b78"`);
        await queryRunner.query(`ALTER TABLE "schedule_event_participants" DROP CONSTRAINT "FK_9d783dc95b3fcbab4c009d1b0a9"`);
        await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "FK_746a55cdb6e2dd9f2e865f947ad"`);
        await queryRunner.query(`ALTER TABLE "staffs" DROP CONSTRAINT "FK_7953eac210a0e34a3e82a3c5332"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cd10fda8276bb995288acfbfb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e8917a4b38224195dabb0f6a06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_76566a7a3b90863650d467bff6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_90c9f6cf73be48eeaa64de4df7"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_level_enum"`);
        await queryRunner.query(`DROP TABLE "channel_config"`);
        await queryRunner.query(`DROP TABLE "holidays"`);
        await queryRunner.query(`DROP TABLE "opentalk_slide_submissions"`);
        await queryRunner.query(`DROP TABLE "swap_requests"`);
        await queryRunner.query(`DROP TYPE "public"."swap_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "penalty_types"`);
        await queryRunner.query(`DROP TABLE "penalties"`);
        await queryRunner.query(`DROP TYPE "public"."penalties_status_enum"`);
        await queryRunner.query(`DROP TABLE "opentalk_slides"`);
        await queryRunner.query(`DROP TYPE "public"."opentalk_slides_status_enum"`);
        await queryRunner.query(`DROP TABLE "schedule_assignments"`);
        await queryRunner.query(`DROP TABLE "schedule_events"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_events_type_enum"`);
        await queryRunner.query(`DROP TABLE "schedule_cycles"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_cycles_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_cycles_type_enum"`);
        await queryRunner.query(`DROP TABLE "schedule_event_participants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_79438fd851d9d0dff364d1e08e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_736fa7908eaa7c2c11f324f763"`);
        await queryRunner.query(`DROP TABLE "schedule_event_queue"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_event_queue_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_event_queue_operation_type_enum"`);
        await queryRunner.query(`DROP TABLE "staffs"`);
        await queryRunner.query(`DROP TABLE "branches"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
