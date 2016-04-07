import AbstractEditRoute from 'hospitalrun/routes/abstract-edit-route';
import ChargeRoute from 'hospitalrun/mixins/charge-route';
import Ember from 'ember';
export default AbstractEditRoute.extend(ChargeRoute, {
  editTitle: 'Edit Procedure',
  modelName: 'procedure',
  newTitle: 'New Procedure',
  pricingCategory: 'Procedure',
  database: Ember.inject.service(),

  getNewData: function() {
    return Ember.RSVP.resolve({
      procedureDate: new Date()
    });
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    var medicationQuery = {
      key: 'Medication',
      include_docs: true
    };
    this.get('database').queryMainDB(medicationQuery, 'inventory_by_type').then(function(result) {
      var medicationList = result.rows.map(function(medication) {
        return medication.doc;
      });
      controller.set('medicationList', medicationList);
    });
  }
});
