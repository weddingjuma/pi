import Ember from 'ember';
import IsUpdateDisabled from 'hospitalrun/mixins/is-update-disabled';
import SelectValues from 'hospitalrun/utils/select-values';
export default Ember.Controller.extend(IsUpdateDisabled, {
  patientsController: Ember.inject.controller('patients'),

  categoryTypes: [
    'Clothing',
    'Education',
    'Electricity',
    'Food',
    'Fuel',
    'Other',
    'Rent',
    'Transportation',
    'Water'
  ].map(SelectValues.selectValuesMap),

  editController: Ember.computed.alias('patientsController'),
  showUpdateButton: true,
  title: 'Expense',
  updateButtonAction: 'update',
  updateButtonText: function() {
    if (this.get('model.isNew')) {
      return 'Add';
    } else {
      return 'Update';
    }
  }.property('model.isNew'),

  actions: {
    cancel: function() {
      this.send('closeModal');
    },

    update: function() {
      var model = this.get('model');
      this.get('editController').send('updateExpense', model);
    }
  }
});
