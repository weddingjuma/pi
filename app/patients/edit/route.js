import AbstractEditRoute from 'hospitalrun/routes/abstract-edit-route';
import Ember from 'ember';
import PatientId from 'hospitalrun/mixins/patient-id';
import PatientVisits from 'hospitalrun/mixins/patient-visits';
import PatientNotes from 'hospitalrun/mixins/patient-notes';
import PouchDbMixin from 'hospitalrun/mixins/pouchdb';
export default AbstractEditRoute.extend(PatientId, PatientVisits, PouchDbMixin, PatientNotes, {
  editTitle: 'Edit Patient',
  modelName: 'patient',
  newTitle: 'New Patient',
  photos: null,

  actions: {
    updateNote: function(note) {
      note.get('visit').save().then(function() {
        // noop
      });
    },
    appointmentDeleted: function(model) {
      this.controller.send('appointmentDeleted', model);
    },
    returnToPatient: function() {
      this.controller.send('returnToPatient');
    },
    deleteContact: function(model) {
      this.controller.send('deleteContact', model);
    },

    deleteExpense: function(model) {
      this.controller.send('deleteExpense', model);
    },

    deleteFamily: function(model) {
      this.controller.send('deleteFamily', model);
    },

    deletePhoto: function(model) {
      this.controller.send('deletePhoto', model);
    },

    updateExpense: function(model) {
      this.controller.send('updateExpense', model);
    },

    updateFamilyInfo: function(model) {
      this.controller.send('updateFamilyInfo', model);
    },

    visitDeleted: function(model) {
      this.controller.send('visitDeleted', model);
    }
  },

  getNewData() {
    return this.generateFriendlyId().then(function(friendlyId) {
      return { friendlyId };
    });
  },

  setupController: function(controller, model) {
    // Load appointments, photos and visits asynchronously.
    var friendlyId = model.get('friendlyId'),
      externalId = model.get('externalPatientId'),
      maxValue = this.get('maxValue'),
      patientId = model.get('id');
    if (Ember.isEmpty(friendlyId) && !Ember.isEmpty(externalId)) {
      model.set('friendlyId', externalId);
    }
    this._super(controller, model);
    this.getPatientVisits(model).then(function(visits) {
      model.set('visits', visits);
    });
    this.store.query('appointment', {
      options: {
        startkey: [patientId, null, null, 'appointment_'],
        endkey: [patientId, maxValue, maxValue, maxValue]
      },
      mapReduce: 'appointments_by_patient'
    }).then(function(appointments) {
      model.set('appointments', appointments);
    });
    this.store.query('photo', {
      options: {
        key: patientId
      },
      mapReduce: 'photo_by_patient'
    }).then(function(photos) {
      var patientPhotos = [];
      patientPhotos.addObjects(photos);
      model.set('photos', patientPhotos);
    });
  }

});
