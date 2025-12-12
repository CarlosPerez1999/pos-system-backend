import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenToUsers1732690001000 implements MigrationInterface {
  name = 'AddRefreshTokenToUsers1732690001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "refreshToken" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
  }
}
