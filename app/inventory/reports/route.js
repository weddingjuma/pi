import AbstractIndexRoute from 'hospitalrun/routes/abstract-index-route';
import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';
export default AbstractIndexRoute.extend({
  pageTitle: t('inventory.titles.inventory_report'),

  // No model for reports; data gets retrieved when report is run.
  model: function() {
    return Ember.RSVP.resolve(Ember.Object.create({}));
  }

});
