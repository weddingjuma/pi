import AppointmentIndexRoute from 'hospitalrun/appointments/index/route';
import { translationMacro as t } from 'ember-i18n';
export default AppointmentIndexRoute.extend({
  editReturn: 'appointments.today',
  modelName: 'appointment',
  pageTitle: t('appointments.today_title'),

  _modelQueryParams: function() {
    var endOfDay = moment().endOf('day').toDate().getTime(),
      maxValue = this.get('maxValue'),
      startOfDay = moment().startOf('day').toDate().getTime();
    return {
      options: {
        startkey: [startOfDay, null, 'appointment_'],
        endkey: [endOfDay, endOfDay, 'appointment_' + maxValue]
      },
      mapReduce: 'appointments_by_date'
    };
  }
});
