import { translationMacro as t } from 'ember-i18n';
import MedicationEditRoute from '../edit/route';
import Ember from 'ember';

export default MedicationEditRoute.extend({
  editTitle: t('medication.return_medication'),
  modelName: 'inv-request',
  newTitle: t('medication.return_medication'),
  getNewData: function() {
    return Ember.RSVP.resolve({
      dateCompleted: new Date(),
      selectPatient: true,
      transactionType: 'Return'
    });
  }
});
