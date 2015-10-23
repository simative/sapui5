sap.ui.core.mvc.Controller.extend("sap.ui.mock.ssc.view.Detail", {

 onInit : function() {
  var oView = this.getView();

  sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(
    function(oEvent) {
     // when detail navigation occurs, update the binding context
     if (oEvent.getParameter("name") === "document") {
      // determine the path of the chosen Document
      var sDocumentPath = "/documents/" + oEvent.getParameter("arguments").doc;
      // perform an element binding to this on the detail view
      oView.bindElement(sDocumentPath);
      oView.byId("oAttachmentList").bindElement(sDocumentPath);
      var oData = oView.getModel().getProperty(sDocumentPath);
      if (!oData) {
       var bReplace = jQuery.device.is.phone ? false : true;
       sap.ui.core.UIComponent.getRouterFor(this).navTo("nodocument", {
        from : "document"
       }, bReplace);
      } else {
       oView.getElementBinding().attachEventOnce("dataReceived",
         jQuery.proxy(function() {
          
         }, this));

       // bind each IconTabFilter to the entity that directly relates to the key
       // of that IconTabFilter, i.e. Supplier or Category.
       // Make sure the master is here
       var oIconTabBar = oView.byId("idIconTabBar");
       oIconTabBar.getItems().forEach(
         function(oItem) {
          oItem.bindElement(sap.ui.mock.ssc.util.Formatter
            .uppercaseFirstChar(oItem.getKey()));
         });

       // Which tab?
       var sTabKey = oEvent.getParameter("arguments").tab || "attachment";
       if (oIconTabBar.getSelectedKey() !== sTabKey) {
        oIconTabBar.setSelectedKey(sTabKey);
       }
      }

     }
    }, this);

 },

 onNavBack : function() {
  // This is only relevant when running on phone devices
  sap.ui.core.UIComponent.getRouterFor(this).myNavBack("main");
 },

 onDetailSelect : function(oEvent) {
  sap.ui.core.UIComponent.getRouterFor(this).navTo("document", {
   Document : oEvent.getSource().getBindingContext().getPath().slice(1),
   tab : oEvent.getParameter("selectedKey")
  }, true);

 }

});