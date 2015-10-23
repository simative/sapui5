jQuery.sap.require("sap.ui.mock.ssc.util.Formatter");

sap.ui.core.mvc.Controller.extend("sap.ui.mock.ssc.view.Master", {

 onInit : function() {

  this.oUpdateFinishedDeferred = jQuery.Deferred();

  this.getView().byId("list").attachEventOnce("updateFinished", function() {
   this.oUpdateFinishedDeferred.resolve();
  }, this);

  // set a handler to handle the routing event
  sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(
    this.onRouteMatched, this);
  this.filtered = false;
 },
 // Handler for routing event
 onRouteMatched : function(oEvent) {
  var oList = this.getView().byId("list");
  // retrieve and store the event arguments passed
  var sName = oEvent.getParameter("name");
  var oArguments = oEvent.getParameter("arguments");

  if (!oList.getItems().length && this.filtered === false) {
   // this._bindViewModel();
  }
  var bReplace = jQuery.device.is.phone ? false : true;
  if (!oList.getItems().length && !jQuery.device.is.phone) {
   sap.ui.core.UIComponent.getRouterFor(this).myNavToWithoutHash({
    currentView : this.getView(),
    targetViewName : "sap.ui.mock.ssc.view.NoDocuments",
    targetViewType : "XML"
   });
  }

  jQuery.when(this.oUpdateFinishedDeferred).then(
    jQuery.proxy(function() {
     var aItems;
     // On the empty hash select the first item
     if (sName === "main") {
      this.selectDetail();
     }
     // Try to select the item in the list
     if (sName === "document") {
      aItems = oList.getItems();
      for (var i = 0; i < aItems.length; i++) {
       if (aItems[i].getBindingContext().getPath() === "/documents/"
         + oArguments.doc) {
        oList.setSelectedItem(aItems[i], true);
        break;
       }
      }
     }
    }, this));
 },

 _bindViewModel : function() {
  var oTemplate = new sap.m.ObjectListItem({
   title : "{program}",
   type : "{device>/listItemType}",
   number : "{date}",
   press : "onSelect",
   attributes : [ new sap.m.ObjectAttribute({
    text : "{correspondence}"
   }) ],
   firstStatus : new sap.m.ObjectStatus({
    text : "{form}"
   })
  });

  var oModel = this.getView().getModel();

  var oInputForm, oInputProgram, oInputDate, sFilter="";
  oInputForm = sap.ui.getCore().byId("inputForm");
  oInputProgram = sap.ui.getCore().byId("inputProgram");
  oInputDate = sap.ui.getCore().byId("inputDate");

  var sUrl = "/sap/opu/odata/ited/at_cert_srv/CorrespondenceCollection";

  if (oInputForm.getValue()) {
   sFilter = sFilter + "Formkeyt eq '" + oInputForm.getValue() + "'";
  }

  if (oInputProgram.getValue()) {
   if (oInputForm.getValue()) {
    sFilter = sFilter + "&ScStext eq '" + oInputProgram.getValue() + "'";
   } else {
    sFilter = sFilter + "ScStext eq '" + oInputProgram.getValue() + "'";
   }

  }

  if (oInputDate.getValue()) {
   if (oInputForm.getValue() || oInputProgram.getValue()) {
    sFilter = sFilter + "&Cdate eq '" + oInputDate.getValue() + "'";
   } else {
    sFilter = sFilter + "Cdate eq '" + oInputDate.getValue() + "'";
   }
  }

  if (sFilter) {
   sUrl = sUrl + "?$filter=" + sFilter;
  }

  var oModel = this.getView().getModel();
  oModel.loadData("./model/data.json");

  var oList = this.getView().byId("list");
  // var oTemplate = oList.getItems()[0]
  oList.bindAggregation("items", {
   path : "/documents",
   template : oTemplate
  });

 },

 // try to find the selected product in the list and set that to be visibly
 // selected
 selectDetail : function() {
  if (!sap.ui.Device.system.phone) {
   var oList = this.getView().byId("list");
   var aItems = oList.getItems();
   if (aItems.length && !oList.getSelectedItem()) {
    oList.setSelectedItem(aItems[0], true);
    this.showDetail(aItems[0]);
   }
  }
 },

 handleFilterPress : function(oEvent) {
  var _this = this;
  var dialog = new sap.m.Dialog({
   title : 'Filter',
   content : new sap.m.List({
    items : [ new sap.m.CustomListItem({
     content : new sap.m.Input("inputProgram", {
      placeholder : "Program"
     })
    }), new sap.m.CustomListItem({
     content : new sap.m.Input("inputForm", {
      placeholder : "Form"
     })
    }), new sap.m.CustomListItem({
     content : new sap.m.Input("inputDate", {
      placeholder : "Date"
     })
    }) ]
   }),
   beginButton : new sap.m.Button({
    text : 'Search',
    press : function() {
     _this._bindViewModel();
     dialog.close();
    }
   }),
   endButton : new sap.m.Button({
    text : 'Close',
    press : function() {
     dialog.close();
    }
   }),
   afterClose : function() {
    dialog.destroy();
   }
  });

  // to get access to the global model
  this.getView().addDependent(dialog);
  dialog.open();

 },

 _filterItems : function() {
  // add filter for search
  var oList = this.getView().byId("list");
  var filters = [];
  var searchString = this.getView().byId("searchField").getValue();
  if (searchString && searchString.length > 0) {
   this.filtered = true;
   filters = new sap.ui.model.Filter({
    filters : [
      new sap.ui.model.Filter("program", sap.ui.model.FilterOperator.Contains,
        searchString),
      new sap.ui.model.Filter("date", sap.ui.model.FilterOperator.Contains,
        searchString),
      new sap.ui.model.Filter("form", sap.ui.model.FilterOperator.Contains,
        searchString) ],
    and : false
   });

  } else {
   this.filtered = false;
  }

  // update list binding
  oList.getBinding("items").filter(filters);

  var bReplace = jQuery.device.is.phone ? false : true;
  if (!jQuery.device.is.phone) {
   if (!oList.getItems().length) {
    sap.ui.core.UIComponent.getRouterFor(this).navTo("nodocument", {
     from : "master"
    }, bReplace);

   } else {

    this.showDetail(oList.getItems()[0]);
   }
  }
 },

 // Search the list
 onSearch : function(oEvent) {
  this._filterItems();
 },

 // Handle the selected item event both on ObjectList Item and List
 onSelect : function(oEvent) {
  // Get the list item, either from the listItem parameter or from the
  // event's source itself (will depend on the device-dependent mode).
  this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
 },

 // Show Detail Page
 showDetail : function(oItem) {
  var doc = oItem.getBindingContext().getPath().substr(11, 1);
  // If we're on a phone, include nav in history; if not, don't.
  var bReplace = jQuery.device.is.phone ? false : true;
  sap.ui.core.UIComponent.getRouterFor(this).navTo("document", {
   from : "master",
   doc : doc
  }, bReplace);
 }

});