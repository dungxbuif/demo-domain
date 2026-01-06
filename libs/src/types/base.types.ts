// Base entity types
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface TimestampedEntity {
  createdAt: Date;
  updatedAt: Date;
}
