import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.createTable('Report', {
                id: {
                        type: DataTypes.INTEGER,
                        autoIncrement: true,
                        primaryKey: true
                },
                type: {
                        type: DataTypes.STRING,
                        allowNull: false
                },
                params: {
                        type: DataTypes.JSONB,
                        allowNull: true
                },
                data: {
                        type: DataTypes.JSONB,
                        allowNull: true
                },
                // Standard timestamp columns
                createdAt: {
                        type: DataTypes.DATE,
                        allowNull: false,
                        defaultValue: DataTypes.NOW
                },
                updatedAt: {
                        type: DataTypes.DATE,
                        allowNull: false,
                        defaultValue: DataTypes.NOW
                }
        })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.dropTable('Report')
}

