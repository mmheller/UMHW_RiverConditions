
function showLoading() {
    esri.show(app.loading);
    app.map.disableMapNavigation();
    app.map.hideZoomSlider();
}

function hideLoading(error) {
    esri.hide(app.loading);
    app.map.enableMapNavigation();
    app.map.showZoomSlider();
}

define([
    "extras/MH_Zoom2FeatureLayers",
    "esri/geometry/webMercatorUtils",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/request",
    "dojo/promise/all",
    "esri/urlUtils",
    "esri/layers/FeatureLayer",
    "esri/tasks/query",
    "dojo/promise/all",
    "esri/dijit/Scalebar",
    "dojo/sniff",
    "esri/geometry/scaleUtils", "esri/request", "dojo/_base/array", "esri/graphic",
    "esri/dijit/editing/Editor-all",
    "esri/SnappingManager",
    "esri/layers/FeatureLayer",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "dijit/form/CheckBox",
    "dijit/Toolbar",
    "esri/geometry/Polygon", "esri/InfoTemplate",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/mouse",
    "dojo/on",
    "esri/map"
], function (
            MH_Zoom2FeatureLayers, webMercatorUtils, declare, lang, esriRequest, all, urlUtils, FeatureLayer, Query, All,
            Scalebar, sniff, scaleUtils, request, arrayUtils, Graphic, Editorall, SnappingManager, FeatureLayer,
        SimpleRenderer, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol,
        CheckBox, Toolbar, Polygon,InfoTemplate, dom, domClass, registry, mouse, on, Map
) {

    return declare([], {
        Phase1: function () {
            var iCEDID = getTokens()['CEDID'];    //*****************************************************Justin Change this to your Django CEID id variable!!!!!!!!
            if (typeof iCEDID != 'undefined') {
                var arrayCenterZoom = [-111, 45.5];
                var izoomVal = 5;
            } else {
                var arrayCenterZoom = [-111, 45.5];
                var izoomVal = 10;
            }

            esri.config.defaults.geometryService = new esri.tasks.GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
            app.map = new esri.Map("map", { basemap: "topo", center: arrayCenterZoom, zoom: izoomVal, slider: true, sliderPosition: "bottom-right" });
            if (app.map.loaded) {
                mapLoaded();
            } else {
                app.map.on("load", function () { mapLoaded(); });
            }
            var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" });
            app.loading = dojo.byId("loadingImg");  //loading image. id
            dojo.connect(app.map, "onUpdateStart", showLoading);
            dojo.connect(app.map, "onUpdateEnd", hideLoading);

            var component = registry.byId("BorderContainer_Footprinttool"); //remedy for error Tried to register widget with id==BorderContainer_Footprinttool but that id is already registered
            if (component) {//if it exists
                domConstruct.destroy(component);                //destroy it
            }


            var portalUrl4Shapefile = "https://www.arcgis.com";
            var strHFL_URL = "https://utility.arcgis.com/usrsvcs/servers/e09a9437e03d4190a3f3a8f2e36190b4/rest/services/Development_Src_v2/FeatureServer/0";
            pSrcFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL, {
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: ['*']
            });

            if (typeof iCEDID != 'undefined') {
                pSrcFeatureLayer.setDefinitionExpression("(project_id = " + iCEDID + ")");
            }
            app.map.addLayers([pSrcFeatureLayer]);

            if (typeof iCEDID != 'undefined') {
                //app.dblExpandNum = 3.75;
                app.dblExpandNum = 1;
                app.pSup = new MH_Zoom2FeatureLayers({}); // instantiate the class
                app.pSup.qry_Zoom2FeatureLayerExtent(pSrcFeatureLayer);
            }
            
            function err(err) {
                console.log("Failed to get stat results due to an error: ", err);
            }

            function mapLoaded() {        // map loaded//            // Map is ready
                app.map.on("mouse-move", showCoordinates); //after map loads, connect to listen to mouse move & drag events
                app.map.on("mouse-drag", showCoordinates);
                //app.basemapGallery = new BasemapGallery({ showArcGISBasemaps: true, map: app.map }, "basemapGallery");
                //app.basemapGallery.startup();
                //app.basemapGallery.on("selection-change", function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });
                //app.basemapGallery.on("error", function (msg) { console.log("basemap gallery error:  ", msg); });
            }

            function showCoordinates(evt) {
                var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);  //the map is in web mercator but display coordinates in geographic (lat, long)
                dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.x.toFixed(4) + ", Longitude:" + mp.y.toFixed(4);  //display mouse coordinates
            }

            function getTokens() {
                var tokens = [];
                var query = location.search;
                query = query.slice(1);
                query = query.split('&');
                $.each(query, function (i, value) {
                    var token = value.split('=');
                    var key = decodeURIComponent(token[0]);
                    var data = decodeURIComponent(token[1]);
                    tokens[key] = data;
                });
                return tokens;
            }
       
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);