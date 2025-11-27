import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1732690000000 implements MigrationInterface {
  name = 'InitialSchema1732690000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "role_enum" AS ENUM('admin', 'seller')
    `);

    await queryRunner.query(`
      CREATE TYPE "movement_type_enum" AS ENUM('IN', 'OUT')
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "role" "role_enum" NOT NULL DEFAULT 'seller',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "price" numeric(10,2) NOT NULL,
        "stock" integer NOT NULL DEFAULT 0,
        "imageUrl" character varying,
        "sku" character varying NOT NULL,
        "barcode" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "deletedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "UQ_products_barcode" UNIQUE ("barcode"),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
      )
    `);

    // Create sales table
    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" TIMESTAMP NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "deletedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_sales_id" PRIMARY KEY ("id")
      )
    `);

    // Create sale_items table
    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,2) NOT NULL,
        "subTotal" numeric(10,2) NOT NULL,
        "deletedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "saleId" uuid,
        "productId" uuid,
        CONSTRAINT "PK_sale_items_id" PRIMARY KEY ("id")
      )
    `);

    // Create inventory table
    await queryRunner.query(`
      CREATE TABLE "inventory" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL,
        "movementType" "movement_type_enum" NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "productId" uuid,
        CONSTRAINT "PK_inventory_id" PRIMARY KEY ("id")
      )
    `);

    // Create configuration table
    await queryRunner.query(`
      CREATE TABLE "configuration" (
        "id" SERIAL NOT NULL,
        "storeName" character varying NOT NULL,
        "storeAddress" character varying,
        "storePhone" character varying,
        "storeEmail" character varying,
        "storeCurrency" character varying,
        "storeTimezone" character varying,
        "storeLogo" character varying,
        "storeFavicon" character varying,
        "storeLanguage" character varying,
        CONSTRAINT "PK_configuration_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "sales" 
      ADD CONSTRAINT "FK_sales_userId" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "sale_items" 
      ADD CONSTRAINT "FK_sale_items_saleId" 
      FOREIGN KEY ("saleId") 
      REFERENCES "sales"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "sale_items" 
      ADD CONSTRAINT "FK_sale_items_productId" 
      FOREIGN KEY ("productId") 
      REFERENCES "products"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "inventory" 
      ADD CONSTRAINT "FK_inventory_productId" 
      FOREIGN KEY ("productId") 
      REFERENCES "products"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_inventory_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" DROP CONSTRAINT "FK_sale_items_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" DROP CONSTRAINT "FK_sale_items_saleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" DROP CONSTRAINT "FK_sales_userId"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "configuration"`);
    await queryRunner.query(`DROP TABLE "inventory"`);
    await queryRunner.query(`DROP TABLE "sale_items"`);
    await queryRunner.query(`DROP TABLE "sales"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "movement_type_enum"`);
    await queryRunner.query(`DROP TYPE "role_enum"`);
  }
}
