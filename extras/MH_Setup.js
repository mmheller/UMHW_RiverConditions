
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
    "esri/symbols/Font",
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
            Font, MH_Zoom2FeatureLayers, BasemapGallery, UniqueValueRenderer, webMercatorUtils, declare, lang, esriRequest, all, urlUtils, FeatureLayer, Query, All,
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

        addStreamConditionFeatureLayer: function (arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange, arrayOIDsRed) {
            var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);
            defaultSymbol.outline.setStyle(SimpleLineSymbol.STYLE_NULL);

            var renderer = new UniqueValueRenderer(defaultSymbol, "OBJECTID");//create renderer
            //add symbol for each possible value
            for (var i = 0; i < arrayOIDYellow.length; i++) {
                renderer.addValue(arrayOIDYellow[i], new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 0]), 18));
            }
            for (var ii = 0; ii < arrayOIDsGold.length; ii++) {
                renderer.addValue(arrayOIDsGold[ii], new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([249, 166, 2]), 18));
            }
            for (var iii = 0; iii < arrayOIDsOrange.length; iii++) {
                renderer.addValue(arrayOIDsOrange[iii], new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([253, 106, 2]), 18));
            }
            for (var iiii = 0; i < arrayOIDsRed.length; iiii++) {
                renderer.addValue(arrayOIDsRed[iiii], new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 18));
            }

            var featureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "4", {
                infoTemplate: new InfoTemplate(" ", "${SUB_REGION}"),
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["OBJECTID "]
            });
            featureLayer.setRenderer(renderer);
            app.map.addLayer(featureLayer);
            app.map.reorderLayer(featureLayer, 5);
        },


        Phase1: function () {
            app.H2O_ID = getTokens()['H2O_ID'];
            if (typeof app.H2O_ID != 'undefined') {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 10;
            } else {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 9;
            }
                        
            esri.config.defaults.geometryService = new esri.tasks.GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
            app.map = BootstrapMap.create("mapDiv", { basemap: "topo", center: arrayCenterZoom, zoom: izoomVal, scrollWheelZoom: false});// Get a reference to the ArcGIS Map class
            
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

            var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" }, dojo.byId("scaleDiv")); 
            app.loading = dojo.byId("loadingImg");  //loading image. id
            dojo.connect(app.map, "onUpdateStart", showLoading);
            dojo.connect(app.map, "onUpdateEnd", hideLoading);

            app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/UMHW/FeatureServer/";

            var template = new InfoTemplate();
            template.setTitle("<b>${GageTitle}</b>");
            template.setContent("Watershed:${Watershed}<br><a href=${GageURL} target='_blank'>Link to gage at ${Agency} website</a>");
            pGageFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "0", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: template, outFields: ['*'] });

            //var defaultLineSymbol = new SimpleFillSymbol().setStyle(SimpleLineSymbol.STYLE_SOLID);
            //defaultLineSymbol.outline.setStyle(SimpleLineSymbol.STYLE_NULL);
            //var rendererEPOINT = new UniqueValueRenderer(defaultLineSymbol, "Start_End");
            //var slsStart = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([100, 204, 102]), 12);
            //var slsEnd = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DOT, new Color([255, 0, 0]), 17);
            //rendererEPOINT.addValue("Start", slsStart);
            //rendererEPOINT.addValue("End", slsEnd);
            var templateEPOINT = new InfoTemplate();
            templateEPOINT.setTitle("<b>${Endpoint_Name}</b>");
            templateEPOINT.setContent("Start or End:${Start_End}<br>Stream: ${Stream_Name}<br>Section: ${Section_Name}</a>");
            pEPointsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "2", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateEPOINT, outFields: ['*'] });

            if (typeof app.H2O_ID != 'undefined') {
                pEPointsFeatureLayer.setDefinitionExpression("Watershed_Name = '" + app.H2O_ID + "'");
            }

            //pEPointsFeatureLayer.setRenderer(rendererEPOINT);
            var templateSSection = new InfoTemplate();
            templateSSection.setTitle("<b>Section:${SectionID}</b>");
            templateSSection.setContent("<b>Watershed:</b> ${Watershed}<br><b>Stream:</b> ${StreamName}<br><b>CFS Prep for Conserv:</b> ${CFS_Prep4Conserv}<br><b>Prep for Conserv Desc:</b> ${CFS_Note_Prep4Conserv}<br><b>CFS Conserv:</b> ${CFS_Conserv}<br><b>Conserv Desc:</b> ${CFS_Note_Prep4Conserv}<br><b>CFS Un-Official Closure:</b> ${CFS_Conserv}<br><b>Un-Official Closure Desc:</b> ${CFS_Note_NotOfficialClosure}<br><b>Conservation Temp:</b> ${ConsvTemp}");
            pSectionsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "4", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateSSection, "opacity": 0.9, outFields: ['*'] });
            if (typeof app.H2O_ID != 'undefined') {
                pSectionsFeatureLayer.setDefinitionExpression("Watershed = '" + app.H2O_ID + "'");
            }

            pBasinsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "6", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.5, outFields: ['*'] });

            var templateFAS = new InfoTemplate();
            templateFAS.setTitle("<b>${NAME} MT FAS (Fishing Access Site)</b>");
            templateFAS.setContent("${BOAT_FAC}<br><a href=${WEB_PAGE} target='_blank'>Link to Fish Access Site</a>");
            pFASFeatureLayer = new esri.layers.FeatureLayer("https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FWPLND_FAS_POINTS/FeatureServer/0",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateFAS, "opacity": 0.3, outFields: ['*'] });
            
            var templateBLM = new InfoTemplate();
            templateBLM.setTitle("<b>${Facility_Name} BLM Facility</b>");
            templateBLM.setContent("<a href=${URL} target='_blank'>Link to BLM Facility</a>");
            pBLMFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "1",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateBLM, "opacity": 0.6, outFields: ['*'] });

            var templateFWP = new InfoTemplate();
            templateFWP.setTitle("<b>${TITLE}</b>");
            templateFWP.setContent("${WATERBODY}<br>${DESCRIPTION} Publish Date: ${PUBLISHDATE}");
            pFWPFeatureLayer = new esri.layers.FeatureLayer("https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/WaterbodyRestrictions/FeatureServer/0",
            { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateFWP, "opacity": 0.6, outFields: ['*'] });
            
            pCartoFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "3", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.9, outFields: ['*'] });


            var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
              new Color([255, 0, 0]), 2), new Color([255, 255, 255, 0.25])
            );
            var rendererWatersheds = new SimpleRenderer(sfs);
            var strlabelField1 = "Name";
            pWatershedsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "7", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: [strlabelField1] });
            if (typeof app.H2O_ID != 'undefined') {
                pWatershedsFeatureLayer.setDefinitionExpression("Name = '" + app.H2O_ID + "'");
            } else {
                pWatershedsFeatureLayer.setDefinitionExpression("Name in ('Beaverhead','Broadwater','Ruby','Big Hole','Jefferson','Boulder','Madison','Gallatin')");
            }
            pWatershedsFeatureLayer.setRenderer(rendererWatersheds);

            var sfsMask = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
              new Color([255, 0, 0]), 2), new Color([0, 0, 180, 0.25])
            );
            var rendererWatershedsMask = new SimpleRenderer(sfsMask);
            //var strlabelField1 = "Name";
            pWatershedsMaskFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "7", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: [strlabelField1] });
            if (typeof app.H2O_ID != 'undefined') {
                pWatershedsMaskFeatureLayer.setDefinitionExpression("Name <> '" + app.H2O_ID + "'");
            } else {
                pWatershedsMaskFeatureLayer.setDefinitionExpression("Name in ('')");
            }
            pWatershedsMaskFeatureLayer.setRenderer(rendererWatershedsMask);

            var sfsBasinMask = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([200, 200, 200]), 2), new Color([0, 0, 180, 0.35])
            );
            var rendererBasinMask = new SimpleRenderer(sfsBasinMask);
            pBasinsMaskFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "7", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: ['*'] });
            pBasinsMaskFeatureLayer.setDefinitionExpression("Basin IS NULL");
            //pBasinsMaskFeatureLayer.setDefinitionExpression("Basin <> 'Upper Missouri Headwaters'");
            pBasinsMaskFeatureLayer.setRenderer(rendererBasinMask);

            var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
            var pLabel1 = new TextSymbol().setColor(vGreyColor);
            pLabel1.font.setSize("10pt");
            pLabel1.font.setFamily("arial");
            var pLabelRenderer1 = new SimpleRenderer(pLabel1);
            var plabels1 = new LabelLayer({ id: "labels1" });
            plabels1.addFeatureLayer(pWatershedsFeatureLayer, pLabelRenderer1, "{" + strlabelField1 + "}");

            var strlabelField3 = "SectionID";
            var sampleLabel = new TextSymbol().setColor(
              new Color([0, 0, 128])).setAlign(Font.ALIGN_START).setAngle(45).setFont(new Font("10pt").setWeight(Font.WEIGHT_BOLD).setFamily("arial"));

            var sampleLabelRenderer = new SimpleRenderer(sampleLabel);
            var plabels3 = new LabelLayer({ id: "labels3" });
            plabels3.addFeatureLayer(pSectionsFeatureLayer, sampleLabelRenderer, "Section {" + strlabelField3 + "}", { lineLabelPosition: "Below", labelRotation: false });
            plabels3.minScale = 1500000;

            app.map.addLayers([pWatershedsMaskFeatureLayer, pBasinsMaskFeatureLayer, pWatershedsFeatureLayer, pBasinsFeatureLayer, pCartoFeatureLayer, pSectionsFeatureLayer, pFWPFeatureLayer, pBLMFeatureLayer, pFASFeatureLayer, pEPointsFeatureLayer, pGageFeatureLayer, plabels1, plabels3]);
            app.map.infoWindow.resize(300, 65);

            app.pZoom = new MH_Zoom2FeatureLayers({}); // instantiate the class
            app.dblExpandNum = 0.5;

            ko.bindingHandlers.googleBarChart = {
                init: function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
                    var chart = new google.visualization.LineChart(element);
                    ko.utils.domData.set(element, 'googleLineChart', chart);
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var value = ko.unwrap(valueAccessor());
                    var tickMarks = [];

                    for (var i = 0; i < value.getNumberOfRows(); i += 48) {
                        tickMarks.push(value.getValue(i, 0));
                    }
                      var options = {
                        chart: {
                            "title": "nope",
                          
                          }, legend:
                          {
                              position: 'right',
                              textStyle: { fontSize: 12 }
                          },
                          vAxis: {
                              textStyle: {fontSize: 10 }
                          },
                          hAxis: {
                              format: 'M/d HH' + ":00",
                              ticks: tickMarks,
                              textStyle: {fontSize: 10 }
                          },
                          "title": "Stream Section Discharge (CFS)",
                          width: '100%',
                          height: 400,
                          chartArea: {
                              left: "5%", top: "5%"
                          }
                          //,trendlines: { 0: {} }    // Draw a trendline for data series 0.
                      };

                    if (value.getNumberOfColumns() == 6) {
                        var options4ChartAreaTrendlines = { 0: {} } ;
                        options.trendlines = options4ChartAreaTrendlines;

                        var optionsSeries = {
                            0: { lineWidth: 3 }, //blue
                            1: { lineWidth: 10, lineDashStyle: [1, 1] },  //light grey
                            2: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                            3: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                            4: { lineWidth: 8 }  //dark orange
                        };
                        var optionsSeriesColors = [ '#3385ff', //blue
                                                    '#ccced0',  //light grey
                                                    '#5d6063',  //medium grey
                                                    '#61605f', //dark grey
                                                    '#df7206' ];  //dark orange
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;
                    }
                    
                    if (value.getNumberOfColumns() == 3) {
                        var optionsSeries = {
                            0: { lineWidth: 3 }, //blue
                            1: { lineWidth: 8 }  //dark orange
                        };
                        var optionsSeriesColors = ['#3385ff', //blue
                                                    '#df7206'];  //dark orange
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;
                    }


                    options = ko.unwrap(options);
                    var chart = ko.utils.domData.get(element, 'googleLineChart');
                    chart.draw(value, options);
                },
            };


            if (typeof app.H2O_ID != 'undefined') {
                app.dblExpandNum = 0.5;
                app.pZoom.qry_Zoom2FeatureLayerExtent(pWatershedsFeatureLayer);
            } else {
                app.dblExpandNum = 1;
                app.pZoom.qry_Zoom2FeatureLayerExtent(pBasinsFeatureLayer);
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