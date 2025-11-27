import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Configuration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeName: string;

  @Column()
  storeAddress: string;

  @Column()
  storePhone: string;

  @Column()
  storeEmail: string;

  @Column()
  storeCurrency: string;

  @Column()
  storeTimezone: string;

  @Column({ nullable: true })
  storeLogo: string;

  @Column({ nullable: true })
  storeFavicon: string;

  @Column()
  storeLanguage: string;
}
