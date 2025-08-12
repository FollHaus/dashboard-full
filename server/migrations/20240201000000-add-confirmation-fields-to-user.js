'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('User', 'is_confirmed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('User', 'confirmation_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('User', 'confirmation_token_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'is_confirmed');
    await queryInterface.removeColumn('User', 'confirmation_token');
    await queryInterface.removeColumn('User', 'confirmation_token_expires');
  },
};
