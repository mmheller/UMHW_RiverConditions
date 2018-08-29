
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
    "esri/dijit/BasemapGallery",
    "esri/renderers/UniqueValueRenderer",
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
      "esri/Color",
        "esri/layers/LabelLayer",
  "esri/symbols/TextSymbol",
    "esri/geometry/Polygon", "esri/InfoTemplate",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/mouse",
    "dojo/on",
    "esri/map",
        "esri/dijit/InfoWindowLite",
        "esri/InfoTemplate",
        "esri/layers/FeatureLayer",
        "dojo/dom-construct","application/bootstrapmap",
        "dojo/domReady!"
], function (
            MH_Zoom2FeatureLayers, BasemapGallery, UniqueValueRenderer, webMercatorUtils, declare, lang, esriRequest, all, urlUtils, FeatureLayer, Query, All,
            Scalebar, sniff, scaleUtils, request, arrayUtils, Graphic, Editorall, SnappingManager, FeatureLayer,
        SimpleRenderer, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol,
        CheckBox, Toolbar, Color, LabelLayer, TextSymbol, Polygon, InfoTemplate, dom, domClass, registry, mouse, on, Map,
          InfoWindowLite,
          InfoTemplate,
          FeatureLayer,
          domConstruct,
          BootstrapMap
) {

    return declare([], {
        Phase1: function () {
            var H2O_ID = getTokens()['H2O_ID'];
            if (typeof H2O_ID != 'undefined') {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 10;
            } else {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 9;
            }
                        
            esri.config.defaults.geometryService = new esri.tasks.GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
            app.map = BootstrapMap.create("mapDiv", { basemap: "topo", center: arrayCenterZoom, zoom: izoomVal, scrollWheelZoom: false });// Get a reference to the ArcGIS Map class
            
            if (app.map.loaded) {
                mapLoaded();
            } else {
                app.map.on("load", function () { mapLoaded(); });
            }

            var basemapGallery = new BasemapGallery({showArcGISBasemaps: true, map: app.map}, "basemapGallery");
            basemapGallery.startup();
            basemapGallery.on("error", function (msg) {
                console.log("basemap gallery error:  ", msg);
            });
            basemapGallery.on("load", function () {
                var tot = basemapGallery.basemaps.length;
                for (var cnt = tot - 1; cnt >= 0; cnt--) {
                    if (basemapGallery.basemaps[cnt].title === "Oceans" ||
                        basemapGallery.basemaps[cnt].title === "Imagery" ||
                        basemapGallery.basemaps[cnt].title === "Light Gray Canvas" ||
                        basemapGallery.basemaps[cnt].title === "National Geographic" ||
                        basemapGallery.basemaps[cnt].title === "USGS National Map" ||
                        basemapGallery.basemaps[cnt].title === "Streets" ||
                        basemapGallery.basemaps[cnt].title === "OpenStreetMap" ||
                        basemapGallery.basemaps[cnt].title === "Terrain with Labels" ||
                        basemapGallery.basemaps[cnt].title === "USA Topo Maps") {
                        console.log("Removing..." + basemapGallery.basemaps[cnt].title);
                        basemapGallery.remove(basemapGallery.basemaps[cnt].id);
                    }
                }
            });

            on(app.map, "layers-add-result", function(e) {
              for (var i = 0; i < e.layers.length; i++) {
                 var result = (e.layers[i].error == undefined) ? "OK": e.layers[i].error.message;
                 console.log(" - " +e.layers[i].layer.id + ": " +result);
                 }
            });

            ////var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, app.map.root));
            ////infoWindow.startup();
            ////app.map.setInfoWindow(infoWindow);


            var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" });
            app.loading = dojo.byId("loadingImg");  //loading image. id
            dojo.connect(app.map, "onUpdateStart", showLoading);
            dojo.connect(app.map, "onUpdateEnd", hideLoading);

            var strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/UMHW/FeatureServer/";

            var template = new InfoTemplate();
            template.setTitle("<b>${GageTitle}</b>");
            template.setContent("Watershed:${Watershed}<br><a href=${GageURL} target='_blank'>Link to gage at ${Agency} website</a>");
            pGageFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL + "0", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: template, outFields: ['*'] });

            var defaultLineSymbol = new SimpleFillSymbol().setStyle(SimpleLineSymbol.STYLE_SOLID);
            defaultLineSymbol.outline.setStyle(SimpleLineSymbol.STYLE_NULL);
            var rendererEPOINT = new UniqueValueRenderer(defaultLineSymbol, "Start_End");
            var slsStart = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([100, 204, 102]), 12);
            var slsEnd = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DOT, new Color([255, 0, 0]), 17);
            rendererEPOINT.addValue("Start", slsStart);
            rendererEPOINT.addValue("End", slsEnd);
            var templateEPOINT = new InfoTemplate();
            templateEPOINT.setTitle("<b>${Endpoint_Name}</b>");
            templateEPOINT.setContent("Start or End:${Start_End}<br>Stream: ${Stream_Name}<br>Section: ${Section_Name}</a>");
            pEPointsFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL + "2", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateEPOINT, outFields: ['*'] });
            pEPointsFeatureLayer.setRenderer(rendererEPOINT);


            pUMHWFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL + "4", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.5, outFields: ['*'] });
            pUMHW_MASKFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL + "5", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: ['*'] });

            var templateFAS = new InfoTemplate();
            templateFAS.setTitle("<b>${NAME} MT FAS (Fishing Access Site)</b>");
            templateFAS.setContent("${BOAT_FAC}<br><a href=${WEB_PAGE} target='_blank'>Link to Fish Access Site</a>");
            pFASFeatureLayer = new esri.layers.FeatureLayer("https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FWPLND_FAS_POINTS/FeatureServer/0",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateFAS, "opacity": 0.3, outFields: ['*'] });
            
            var templateBLM = new InfoTemplate();
            templateBLM.setTitle("<b>${Facility_Name} BLM Facility</b>");
            templateBLM.setContent("<a href=${URL} target='_blank'>Link to BLM Facility</a>");
            pBLMFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL + "1",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateBLM, "opacity": 0.6, outFields: ['*'] });

            var templateFWP = new InfoTemplate();
            templateFWP.setTitle("<b>${TITLE}</b>");
            templateFWP.setContent("${WATERBODY}<br>${DESCRIPTION} Publish Date: ${PUBLISHDATE}");
            pFWPFeatureLayer = new esri.layers.FeatureLayer("https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/WaterbodyRestrictions/FeatureServer/0",
            { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateFWP, "opacity": 0.6, outFields: ['*'] });


            var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
              new Color([255, 0, 0]), 2), new Color([255, 255, 255, 0.25])
            );
            var rendererHUC8 = new SimpleRenderer(sfs);
            var strlabelField1 = "Name";
            pHUC8FeatureLayer = new esri.layers.FeatureLayer(strHFL_URL + "7", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: [strlabelField1] });
            if (typeof H2O_ID != 'undefined') {
                pHUC8FeatureLayer.setDefinitionExpression("HUC_8_12 = '" + H2O_ID + "'");
            } else {
                pHUC8FeatureLayer.setDefinitionExpression("HUC_8_12 in ('10020004','10020005','10020006','10020008_1','10020008_2','10020007','10020003','10020002','10020001','10030101_1')");
            }
            pHUC8FeatureLayer.setRenderer(rendererHUC8);


            var sfsMask = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
              new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])
            );
            var rendererHUC8Mask = new SimpleRenderer(sfsMask);
            var strlabelField1 = "Name";
            pHUC8MaskFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL + "7", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: [strlabelField1] });
            if (typeof H2O_ID != 'undefined') {
                pHUC8MaskFeatureLayer.setDefinitionExpression("HUC_8_12 <> '" + H2O_ID + "'");
            } else {
                pHUC8MaskFeatureLayer.setDefinitionExpression("HUC_8_12 in ('')");
            }
            pHUC8MaskFeatureLayer.setRenderer(rendererHUC8Mask);

            var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
            var pLabel1 = new TextSymbol().setColor(vGreyColor);
            pLabel1.font.setSize("10pt");
            pLabel1.font.setFamily("arial");
            var pLabelRenderer1 = new SimpleRenderer(pLabel1);
            var plabels1 = new LabelLayer({ id: "labels1" });
            plabels1.addFeatureLayer(pHUC8FeatureLayer, pLabelRenderer1, "{" + strlabelField1 + "}");
                        
            app.map.addLayers([pUMHWFeatureLayer, pUMHW_MASKFeatureLayer, pHUC8MaskFeatureLayer, pHUC8FeatureLayer, pFWPFeatureLayer, pBLMFeatureLayer, pFASFeatureLayer, pEPointsFeatureLayer, pGageFeatureLayer, plabels1]);
            app.map.infoWindow.resize(300, 65);

            app.pSup = new MH_Zoom2FeatureLayers({}); // instantiate the class
            app.dblExpandNum = 1;
            if (typeof H2O_ID != 'undefined') {
                app.pSup.qry_Zoom2FeatureLayerExtent(pHUC8FeatureLayer);
            } else {
                app.pSup.qry_Zoom2FeatureLayerExtent(pUMHWFeatureLayer);
            }

            function err(err) {
                console.log("Failed to get stat results due to an error: ", err);
            }

            function mapLoaded() {        // map loaded//            // Map is ready
                app.map.on("mouse-move", showCoordinates); //after map loads, connect to listen to mouse move & drag events
                app.map.on("mouse-drag", showCoordinates);
            }

            function showCoordinates(evt) {
                var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);  //the map is in web mercator but display coordinates in geographic (lat, long)
                dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.y.toFixed(4) + ", Longitude:" + mp.x.toFixed(4);  //display mouse coordinates
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