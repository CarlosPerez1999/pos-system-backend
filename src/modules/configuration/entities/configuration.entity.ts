import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Configuration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeName: string;

  @Column({ nullable: true })
  storeAddress: string;

  @Column({ nullable: true })
  storePhone: string;

  @Column({ nullable: true })
  storeEmail: string;

  @Column({ nullable: true })
  storeCurrency: string;

  @Column({ nullable: true })
  storeTimezone: string;

  @Column({ nullable: true })
  storeLogo: string;

  @Column({ nullable: true })
  storeFavicon: string;

  @Column({ nullable: true })
  storeLanguage: string;
}
