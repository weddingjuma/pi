import AbstractEditController from 'hospitalrun/controllers/abstract-edit-controller';
import Ember from 'ember';
import FulfillRequest from 'hospitalrun/mixins/fulfill-request';
import InventoryLocations from 'hospitalrun/mixins/inventory-locations'; // inventory-locations mixin is needed for fulfill-request mixin!
import InventorySelection from 'hospitalrun/mixins/inventory-selection';
import PatientId from 'hospitalrun/mixins/patient-id';
import PatientSubmodule from 'hospitalrun/mixins/patient-submodule';
import UserSession from 'hospitalrun/mixins/user-session';

export default AbstractEditController.extend(InventorySelection, FulfillRequest, InventoryLocations, PatientId, PatientSubmodule, UserSession, {
  medicationController: Ember.inject.controller('medication'),
  newPatientId: null,

  expenseAccountList: Ember.computed.alias('medicationController.expenseAccountList'),

  canFulfill: function() {
    return this.currentUserCan('fulfill_medication');
  }.property(),

  isFulfilled: function() {
    var status = this.get('model.status');
    return (status === 'Fulfilled');
  }.property('model.status'),

  isFulfilling: function() {
    var canFulfill = this.get('canFulfill'),
      isRequested = this.get('model.isRequested'),
      fulfillRequest = this.get('model.shouldFulfillRequest'),
      isFulfilling = canFulfill && (isRequested || fulfillRequest);
    this.get('model').set('isFulfilling', isFulfilling);
    return isFulfilling;
  }.property('canFulfill', 'model.isRequested', 'model.shouldFulfillRequest'),

  isFulfilledOrRequested: function() {
    return (this.get('isFulfilled') || this.get('model.isRequested'));
  }.property('isFulfilled', 'model.isRequested'),

  prescriptionClass: function() {
    var quantity = this.get('model.quantity');
    this.get('model').validate().catch(Ember.K);
    if (Ember.isEmpty(quantity)) {
      return 'required';
    }
  }.property('model.quantity'),

  quantityClass: function() {
    var prescription = this.get('model.prescription'),
      returnClass = 'col-xs-3',
      isFulfilling = this.get('isFulfilling');
    if (isFulfilling || Ember.isEmpty(prescription)) {
      returnClass += ' required';
    }
    return `${returnClass} test-quantity-input`;
  }.property('isFulfilling', 'model.prescription'),

  quantityLabel: function() {
    let i18n = this.get('i18n');
    var returnLabel = i18n.t('medication.labels.quantity_requested'),
      isFulfilled = this.get('isFulfilled'),
      isFulfilling = this.get('isFulfilling');
    if (isFulfilling) {
      returnLabel = i18n.t('medication.labels.quantity_dispensed');
    } else if (isFulfilled) {
      returnLabel = i18n.t('medication.labels.quantity_distributed');
    }
    return returnLabel;
  }.property('isFulfilled'),

  medicationList: [],
  updateCapability: 'add_medication',

  afterUpdate: function() {
    let i18n = this.get('i18n');
    var alertTitle,
      alertMessage,
      isFulfilled = this.get('isFulfilled');
    if (isFulfilled) {
      alertTitle = i18n.t('medication.alerts.fulfilled_title');
      alertMessage = 'The medication request has been fulfilled.';
      this.set('model.selectPatient', false);
    } else {
      alertTitle = i18n.t('medication.alerts.saved_title');
      alertMessage = i18n.t('medication.alerts.saved_message');
    }
    this.saveVisitIfNeeded(alertTitle, alertMessage);
  },

  _addNewPatient: function() {
    let i18n = this.get('i18n');
    this.displayAlert(i18n.t('alerts.please_wait'), i18n.t('messages.new_patient_has_to_be_created'));
    this._getNewPatientId().then(function(friendlyId) {
      var patientTypeAhead = this.get('model.patientTypeAhead'),
        nameParts = patientTypeAhead.split(' '),
        patientDetails = {
          friendlyId: friendlyId,
          patientFullName: patientTypeAhead,
          requestingController: this
        },
        patient;
      if (nameParts.length >= 3) {
        patientDetails.firstName = nameParts[0];
        patientDetails.middleName = nameParts[1];
        patientDetails.lastName = nameParts.splice(2, nameParts.length).join(' ');
      } else if (nameParts.length === 2) {
        patientDetails.firstName = nameParts[0];
        patientDetails.lastName = nameParts[1];
      } else {
        patientDetails.firstName = patientTypeAhead;
      }
      patient = this.store.createRecord('patient', patientDetails);
      this.send('openModal', 'patients.quick-add', patient);
    }.bind(this));
  },

  _getNewPatientId: function() {
    var newPatientId = this.get('newPatientId');
    if (Ember.isEmpty(newPatientId)) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        this.generateFriendlyId().then(function(friendlyId) {
          this.set('newPatientId', friendlyId);
          resolve(friendlyId);
        }.bind(this), reject);
      }.bind(this));
    } else {
      return Ember.RSVP.resolve(newPatientId);
    }
  },

  beforeUpdate: function() {
    var isFulfilling = this.get('isFulfilling'),
      isNew = this.get('model.isNew');
    if (isNew || isFulfilling) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        var newMedication = this.get('model');
        newMedication.validate().then(function() {
          if (newMedication.get('isValid')) {
            if (isNew) {
              if (Ember.isEmpty(newMedication.get('patient'))) {
                this._addNewPatient();
                reject({
                  ignore: true,
                  message: 'creating new patient first'
                });
              } else {
                newMedication.set('medicationTitle', newMedication.get('inventoryItem.name'));
                newMedication.set('priceOfMedication', newMedication.get('inventoryItem.price'));
                newMedication.set('status', 'Requested');
                newMedication.set('requestedBy', newMedication.getUserName());
                newMedication.set('requestedDate', new Date());
                this.addChildToVisit(newMedication, 'medication', 'Pharmacy').then(function() {
                  this.finishBeforeUpdate(isFulfilling, resolve);
                }.bind(this), reject);
              }
            } else {
              this.finishBeforeUpdate(isFulfilling, resolve);
            }
          } else {
            this.send('showDisabledDialog');
            reject('invalid model');
          }
        }.bind(this)).catch(function() {
          this.send('showDisabledDialog');
          reject('invalid model');
        }.bind(this));
      }.bind(this));
    } else {
      return Ember.RSVP.resolve();
    }
  },

  finishBeforeUpdate: function(isFulfilling, resolve) {
    if (isFulfilling) {
      var inventoryLocations = this.get('model.inventoryLocations'),
        inventoryRequest = this.get('store').createRecord('inv-request', {
          expenseAccount: this.get('model.expenseAccount'),
          dateCompleted: new Date(),
          inventoryItem: this.get('model.inventoryItem'),
          inventoryLocations: inventoryLocations,
          quantity: this.get('model.quantity'),
          transactionType: 'Fulfillment',
          patient: this.get('model.patient'),
          markAsConsumed: true
        });
      this.performFulfillRequest(inventoryRequest, false, false, true).then(function() {
        this.set('model.status', 'Fulfilled');
        resolve();
      }.bind(this));
    } else {
      resolve();
    }
  },

  showUpdateButton: function() {
    var isFulfilled = this.get('isFulfilled');
    if (isFulfilled) {
      return false;
    } else {
      return this._super();
    }
  }.property('updateCapability', 'isFulfilled'),

  updateButtonText: function() {
    let i18n = this.get('i18n');
    if (this.get('model.hideFulfillRequest')) {
      return i18n.t('buttons.dispense');
    } else if (this.get('isFulfilling')) {
      return i18n.t('labels.fulfill');
    } else if (this.get('model.isNew')) {
      return i18n.t('buttons.add');
    } else {
      return i18n.t('buttons.update');
    }
  }.property('model.isNew', 'isFulfilling', 'model.hideFulfillRequest'),

  actions: {
    addedNewPatient: function(record) {
      this.send('closeModal');
      this.set('model.patient', record);
      this.set('newPatientId');
      this.send('update');
    }
  }

});
