import { Column, DataType, Model, Table } from 'sequelize-typescript'

@Table({
	tableName: 'User',
	deletedAt: false,
	version: false
})
export class UserModel extends Model {
	@Column({ type: DataType.STRING, allowNull: true })
	name?: string

        @Column({ type: DataType.STRING, allowNull: false, unique: true })
        email: string

        @Column({ type: DataType.STRING, allowNull: false })
        password: string

        @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
        isConfirmed: boolean

        @Column({ type: DataType.STRING, allowNull: true })
        confirmationToken?: string | null

        @Column({ type: DataType.DATE, allowNull: true })
        confirmationTokenExpires?: Date | null
}
