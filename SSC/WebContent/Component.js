jQuery.sap.declare("sap.ui.mock.ssc.Component");
jQuery.sap.require("sap.ui.mock.ssc.MyRouter");

sap.ui.core.UIComponent.extend("sap.ui.mock.ssc.Component", {

 metadata : {
  /*****************************************************************************
   * General Information
   ****************************************************************************/
  name : "SSC",
  version : "1.0",
  includes : [],
  dependencies : {
   libs : [ "sap.m", "sap.ui.layout" ],
   components : []
  },
  // Component needs to return something to UI, same can be achieved using
  // createcontent function
  rootView : "sap.ui.mock.ssc.view.App",
  /*****************************************************************************
   * Configuration
   ****************************************************************************/
  // Name of the resource bundle we'll be using for internationalization
  // URL of the OData service we'll be using for our main, or "domain" model.
  config : {
   resourceBundle : "i18n/messageBundle.properties",
   serviceConfig : {
    name : "SSC",
    serviceUrl : ""
   }
  },
  /*****************************************************************************
   * Routing
   ****************************************************************************/
  routing : {
   config : {
    routerClass : sap.ui.mock.ssc.MyRouter, // custom router class
    viewType : "XML", // views are XML
    viewPath : "sap.ui.mock.ssc.view", // absolute path to our view
    // definitions
    targetAggregation : "detailPages", // name of an aggregation of the
    // targetControl
    clearTarget : false
   // if the aggregation should be cleared before adding
   // the View to it
   },
   routes : [ {
    pattern : "", // url pattern where it needs to match again
    name : "main", // the name of the route - it will be used to retrieve
    // the route from the router
    view : "Master", // The name of a view that will be created, the first
    // time this route will be matched
    targetAggregation : "masterPages", // name of an aggregation of the
    // targetControl
    targetControl : "idAppControl", // Views will be put into a container
    // Control
    subroutes : [ {
     pattern : "document/{doc}/:tab:",
     name : "document",
     view : "Detail"
    }, {
     pattern : "nodocument",
     name : "nodocument",
     view : "NoDocuments",
     targetAggregation : "detailPages",
    } ]
   }, {
    name : "catchallMaster",
    view : "Master",
    targetAggregation : "masterPages",
    targetControl : "idAppControl",
    subroutes : [ {
     pattern : ":all*:",
     name : "catchallDetail",
     view : "NotFound"
    } ]
   } ]

  }
 },
 /******************************************************************************
  * initialize the component.
  *****************************************************************************/
 init : function() {
  sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
  var mConfig = this.getMetadata().getConfig();
  // always use absolute paths relative to our own component
  // (relative paths will fail if running in the Fiori Launchpad)
  var rootPath = jQuery.sap.getModulePath("sap.ui.mock.ssc");
  // set i18n model
  var i18nModel = new sap.ui.model.resource.ResourceModel({
   bundleUrl : [ rootPath, mConfig.resourceBundle ].join("/")
  });
  this.setModel(i18nModel, "i18n");
  // Create and set domain model to the component
  var sServiceUrl = mConfig.serviceConfig.serviceUrl;
  var oModel = new sap.ui.model.json.JSONModel();
  this.setModel(oModel);
  // set device model
  var deviceModel = new sap.ui.model.json.JSONModel({
   isTouch : sap.ui.Device.support.touch,
   isNoTouch : !sap.ui.Device.support.touch,
   isPhone : sap.ui.Device.system.phone,
   isNoPhone : !sap.ui.Device.system.phone,
   listMode : sap.ui.Device.system.phone ? "SingleSelectMaster"
     : "SingleSelectMaster",
   listItemType : sap.ui.Device.system.phone ? "Active" : "Inactive"
  });
  deviceModel.setDefaultBindingMode("OneWay");
  this.setModel(deviceModel, "device");
  // The initialize method will start the routing � it will parse the
  // initial hash,
  // create the needed views, start listening to hash changes and trigger
  // the router events.
  this.getRouter().initialize();
 }
});