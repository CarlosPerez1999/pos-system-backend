import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //Use the cascading insert type to avoid updates or deletions when modifying the sale
  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: ['insert'] })
  items: SaleItem[];

  //TODO: Add relationship with user
}
