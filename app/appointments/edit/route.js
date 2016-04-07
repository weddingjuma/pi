import AbstractEditRoute from 'hospitalrun/routes/abstract-edit-route';
import Ember from 'ember';
import PatientListRoute from 'hospitalrun/mixins/patient-list-route';
import { translationMacro as t } from 'ember-i18n';

export default AbstractEditRoute.extend(PatientListRoute, {
  editTitle: t('appointments.edit_title'),
  modelName: 'appointment',
  newTitle: t('appointments.new_title'),

  getNewData: function() {
    return Ember.RSVP.resolve({
      appointmentType: 'Admission',
      allDay: true,
      selectPatient: true,
      startDate: new Date()
    });
  }
});
