'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Product', 'purchase_price', {
      type: Sequelize.DECIMAL(12, 2)
    });
    await queryInterface.changeColumn('Product', 'sale_price', {
      type: Sequelize.DECIMAL(12, 2)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Product', 'purchase_price', {
      type: Sequelize.DECIMAL(10, 2)
    });
    await queryInterface.changeColumn('Product', 'sale_price', {
      type: Sequelize.DECIMAL(10, 2)
    });
  }
};
