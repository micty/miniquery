


; (function ($, Haf, Logger, MVCHelper) {


$.Object.extend(Haf, {

    application: function (config) {

        var app = Haf.create('Haf.app.Application', config);
        var launch = app.get('launch');
        if (launch) {
            launch.apply(app);
        }
    },

    action: function (actionName /*,...*/) {

        if (!actionName) {
            Logger.error('you must specify actionName in Haf.action!');
        }

        MVCHelper.fireAction.apply(MVCHelper, arguments);
    }

});




})(Haf, Haf, Logger, MVCHelper);