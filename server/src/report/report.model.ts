import { Column, DataType, Model, Table } from 'sequelize-typescript'

@Table({ tableName: 'Report', deletedAt: false, version: false })
export class ReportModel extends Model {
        @Column({ type: DataType.STRING })
        type: string

        @Column({ type: DataType.JSONB })
        params: any

        @Column({ type: DataType.JSONB })
        data: any
}

