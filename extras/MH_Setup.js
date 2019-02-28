
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
            "esri/tasks/QueryTask",
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
   "esri/dijit/Legend",
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
            Font, MH_Zoom2FeatureLayers, BasemapGallery, UniqueValueRenderer, webMercatorUtils, declare, lang, esriRequest, all, urlUtils, FeatureLayer, QueryTask, Query, All,
            Scalebar, sniff, scaleUtils, request, arrayUtils, Graphic, Editorall, SnappingManager, FeatureLayer,
        SimpleRenderer, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol,
        CheckBox, Legend, Toolbar, Color, LabelLayer, TextSymbol, Polygon, InfoTemplate, dom, domClass, registry, mouse, on, Map,
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

        GetSetHeaderWarningContent: function (strAGSIndexTableURL, strH2OID, blnUseAlternateHeader) {
            if (typeof strH2OID == 'undefined') {
                strH2OID = "UMH";
            } 
            strURLFieldName = "URL";
            var query = new Query();
            query.outFields = [strURLFieldName];
            var queryTask = new QueryTask(strAGSIndexTableURL);
            query.where = "Name = '" + strH2OID + "'";
            queryTask.execute(query, showHeaderWarningContentResults);

            function showHeaderWarningContentResults(results) {
                var resultItems = [];
                var resultCount = results.features.length;
                for (var i = 0; i < resultCount; i++) {
                    var featureAttributes = results.features[i].attributes;
                    var strGoogleSheetURL = featureAttributes[strURLFieldName]
                }

                $.get(strGoogleSheetURL)
                                   .done(function (jsonResult) {
                                       if (jsonResult.feed != undefined) {
                                           var strHeaderTxt = "";
                                           var strAlertTxt = "";
                                           var pEntries = jsonResult.feed.entry;

                                           if (blnUseAlternateHeader) {
                                               strHeaderTxt = pEntries[0].gsx$headeralt.$t
                                           } else {
                                               strHeaderTxt = pEntries[0].gsx$header.$t
                                           }

                                           strAlertTxt = pEntries[0].gsx$customalert.$t
                                           $("#divWatershedBasinInfoTop").html(strHeaderTxt);
                                           $("#divCustomAlert").html(strAlertTxt);
                                       }
                                   })
                                   .always(function (data) {
                                       app.pSup.Phase2();  //starting up the map and other content becuase the header content can mess up the content dimiensions if done prior
                                   });
            }
        },

        LayerCheckBoxSetup: function (cbxLayers) {
            dojo.connect(app.map, 'onLayersAddResult', function (results) {            //add check boxes 
                if (results !== 'undefined') {
                    var des = document.getElementById('toggleLayers');

                    dojo.forEach(cbxLayers, function (playerset) {
                        var strLayerName = playerset.title;
                        var clayer0 = playerset.layers[0];
                        var clayer1 = playerset.layers[1];
                        var pID0 = clayer0.id;
                        var pID1 = clayer1.id;

                        var blnCheckIt = false;  // determine if checkbox will be on/off
                        if (clayer0.visible) {
                            blnCheckIt = true;
                        }
                        
                        var checkboxHTML = document.createElement('input');
                        checkboxHTML.type = "checkbox";
                        checkboxHTML.name = strLayerName;
                        checkboxHTML.value = [clayer0, clayer1];
                        checkboxHTML.id = pID0 + pID1;
                        checkboxHTML.checked = blnCheckIt;

                        //if (blnCheckIt) {
                        //    checkboxHTML.setAttribute("checked");
                        //}
                        
                        checkboxHTML.onchange = function (evt) {
                            if (clayer0.visible) {
                                clayer0.hide();
                                clayer1.hide();
                            } else {
                                clayer0.show();
                                clayer1.show();
                            }
                            this.checked = clayer0.visible;
                        }
                      
                        var label = document.createElement('label')
                        label.htmlFor = pID0 + pID1;
                        label.appendChild(document.createTextNode(strLayerName));

                        des.appendChild(checkboxHTML);
                        des.appendChild(document.createTextNode('\u00A0'))
                        des.appendChild(label);
                        des.appendChild(document.createTextNode('\u00A0\u00A0\u00A0\u00A0'))
                    });
                }
            });
        },

        Phase1: function () {
            var arrayNavList = [["Ruby", "Ruby"], ["Madison", "Madison"], ["Upper-Gallatin", "Upper Gallatin"],
                                ["Gallatin-Lower", "Lower Gallatin"], ["Jefferson", "Jefferson"], ["Broadwater", "Broadwater"],
                                ["Boulder", "Boulder"], ["Big Hole", "Big Hole"], ["Beaverhead/Centennial", "Beaverhead"]
            ];
            var strURLPrefix = "../index.html?H2O_ID=";
            var strURLSuffix = "";

            app.H2O_ID = getTokens()['H2O_ID'];
            var strHeadertextArgument = getTokens()['UseAlternateHeader'];
            var blnUseAlternateHeader = false;
            if (strHeadertextArgument != undefined){
                if (strHeadertextArgument.toUpperCase() == "TRUE") {
                    blnUseAlternateHeader = true;
                    strURLSuffix = "&UseAlternateHeader=TRUE";
                }
            }

            var ulist = document.getElementById("navList");  //build the naviation options in the header nav bar
            for (var i = 0; i < arrayNavList.length; i++) {
                var a = document.createElement("a");
                var newItem = document.createElement("li");

                a.textContent = arrayNavList[i][0];
                a.setAttribute('role', "presentation");
                a.setAttribute('href', strURLPrefix + arrayNavList[i][1] + strURLSuffix);
                newItem.appendChild(a);
                ulist.appendChild(newItem);
            }

            //app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/UMHW/FeatureServer/";
            app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/Main_Map/FeatureServer/";
            
            this.GetSetHeaderWarningContent(app.strHFL_URL + "9", app.H2O_ID, blnUseAlternateHeader);
        },

        Phase2: function () {

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

            var template = new InfoTemplate();
            template.setTitle("<b>${GageTitle}</b>");
            template.setContent("Watershed:${Watershed}<br><a href=${GageURL} target='_blank'>Link to gage at ${Agency} website</a>");
            pGageFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "0", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: template, outFields: ['*'] });

            var templateEPOINT = new InfoTemplate();
            templateEPOINT.setTitle("<b>${Endpoint_Name}</b>");
            templateEPOINT.setContent("Start or End:${Start_End}<br>Stream: ${Stream_Name}<br>Section: ${Section_Name}</a>");
            pEPointsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "2", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateEPOINT, outFields: ['*'] });

            var strQueryDef1 = "1=1";
            var strQueryDef2 = "1=1";
            var strQueryDef3 = "Name in ('Beaverhead','Broadwater','Ruby','Big Hole','Jefferson','Boulder','Madison','Gallatin')";
            var strQueryDef4 = "Name in ('')";
            if (typeof app.H2O_ID != 'undefined') {
                strQueryDef1 = "Watershed_Name = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt1 = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt2 = '" + app.H2O_ID + "'";
                strQueryDef2 = "Watershed = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt1 = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt2 = '" + app.H2O_ID + "'";
                strQueryDef3 = "Name = '" + app.H2O_ID + "'" + " OR " + " Name_Alternate1 = '" + app.H2O_ID + "'" + " OR " + " Name_Alternate2 = '" + app.H2O_ID + "'"
                //strQueryDef4 = "Name <> '" + app.H2O_ID + "'" + " OR " + " Name_Alternate1 <> '" + app.H2O_ID + "'" + " OR " + " Name_Alternate2 <> '" + app.H2O_ID + "'";
                strQueryDef4 = "Name <> '" + app.H2O_ID + "'" + 
                                    " AND (" + " Name_Alternate1 <> '" + app.H2O_ID + "' OR (Name_Alternate1 is Null))" + 
                                    " AND (" + " Name_Alternate2 <> '" + app.H2O_ID + "' OR (Name_Alternate1 is Null))";

                

            }
                        
            pEPointsFeatureLayer.setDefinitionExpression(strQueryDef1);

            var templateSSection = new InfoTemplate();
            templateSSection.setTitle("<b>Section:${SectionID}</b>");
            templateSSection.setContent("<b>Watershed:</b> ${Watershed}<br><b>Stream:</b> ${StreamName}<br><b>CFS Prep for Conserv:</b> ${CFS_Prep4Conserv}<br><b>Prep for Conserv Desc:</b> ${CFS_Note_Prep4Conserv}<br><b>CFS Conserv:</b> ${CFS_Conserv}<br><b>Conserv Desc:</b> ${CFS_Note_Prep4Conserv}<br><b>CFS Un-Official Closure:</b> ${CFS_Conserv}<br><b>Un-Official Closure Desc:</b> ${CFS_Note_NotOfficialClosure}<br><b>Conservation Temp:</b> ${ConsvTemp}");
            pSectionsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "4", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateSSection, "opacity": 0.9, outFields: ['*'] });
            pSectionsFeatureLayer.setDefinitionExpression(strQueryDef2);

            pBasinsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "6", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.5, outFields: ['*'] });

            var templateFAS = new InfoTemplate();
            templateFAS.setTitle("<b>${NAME} MT FAS (Fishing Access Site)</b>");
            templateFAS.setContent("${BOAT_FAC}<br><a href=${WEB_PAGE} target='_blank'>Link to Fish Access Site</a>");
            pFASFeatureLayer = new esri.layers.FeatureLayer("https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FWPLND_FAS_POINTS/FeatureServer/0",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateFAS, "opacity": 0.5, outFields: ['*'], visible: false });
            var vDarkGreyColor = new Color("#3F3F40");              // create a text symbol to define the style of labels
            var pLabelFAS = new TextSymbol().setColor(vDarkGreyColor);
            pLabelFAS.font.setSize("9pt");
            pLabelFAS.font.setFamily("arial");
            var pLabelRendererFAS = new SimpleRenderer(pLabelFAS);
            var pLabelsFAS = new LabelLayer({ id: "LabelsFAS" });
            pLabelsFAS.addFeatureLayer(pFASFeatureLayer, pLabelRendererFAS, "{NAME}");
            
            var templateBLM = new InfoTemplate();
            templateBLM.setTitle("<b>${Facility_Name} BLM Facility</b>");
            templateBLM.setContent("<a href=${URL} target='_blank'>Link to BLM Facility</a>");
            pBLMFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "1",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateBLM, outFields: ['*'], visible: false });
            var pLabelBLM = new TextSymbol().setColor(vDarkGreyColor);
            pLabelBLM.font.setSize("9pt");
            pLabelBLM.font.setFamily("arial");
            var pLabelRendererBLM = new SimpleRenderer(pLabelBLM);
            var pLabelsBLM = new LabelLayer({ id: "LabelsBLM" });
            pLabelsBLM.addFeatureLayer(pBLMFeatureLayer, pLabelRendererBLM, "{Facility_Name}");

            var templateSNOTEL = new InfoTemplate();
            templateSNOTEL.setTitle("<b>${Name} SNOTEL Site</b>");

            var strSNOTELGraphURL = "https://wcc.sc.egov.usda.gov/nwcc/view?intervalType=+View+Current+&report=WYGRAPH&timeseries=Daily&format=plot&sitenum=${stationID}&interval=WATERYEAR";
            templateSNOTEL.setContent("<a href=${SitePageURL} target='_blank'>Link to SNOTEL Site Page</a>, <a href=" + strSNOTELGraphURL + " target='_blank'>Link to SWE Current/Historical Graphs</a> ");
            pSNOTELFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "8",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateSNOTEL, outFields: ['*'], visible: false });
            var pLabelSNOTEL = new TextSymbol().setColor(vDarkGreyColor);
            pLabelSNOTEL.font.setSize("9pt");
            pLabelSNOTEL.font.setFamily("arial");
            var pLabelRendererSNOTEL = new SimpleRenderer(pLabelSNOTEL);
            var pLabelsSNOTEL = new LabelLayer({ id: "LabelsSNOTEL" });
            pLabelsSNOTEL.addFeatureLayer(pSNOTELFeatureLayer, pLabelRendererSNOTEL, "{Name}");
           
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
            pWatershedsFeatureLayer.setDefinitionExpression(strQueryDef3);
            pWatershedsFeatureLayer.setRenderer(rendererWatersheds);

            var sfsMask = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([200, 200, 200]), 2), new Color([9, 60, 114, 0.25])
            );
            var rendererWatershedsMask = new SimpleRenderer(sfsMask);
            pWatershedsMaskFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "7", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: [strlabelField1] });
            pWatershedsMaskFeatureLayer.setDefinitionExpression(strQueryDef4);
            pWatershedsMaskFeatureLayer.setRenderer(rendererWatershedsMask);

            var sfsBasinMask = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([200, 200, 200]), 0.1), new Color([26, 90, 158, 0.45])
            );
            var rendererBasinMask = new SimpleRenderer(sfsBasinMask);
            pBasinsMaskFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "7", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: ['*'] });
            pBasinsMaskFeatureLayer.setDefinitionExpression("Basin IS NULL");
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

            app.map.addLayers([pWatershedsMaskFeatureLayer, pBasinsMaskFeatureLayer, pWatershedsFeatureLayer, pBasinsFeatureLayer, pCartoFeatureLayer,
                               pSectionsFeatureLayer,pSNOTELFeatureLayer, pFWPFeatureLayer, pBLMFeatureLayer, pFASFeatureLayer, pEPointsFeatureLayer, pGageFeatureLayer,
                               plabels1, plabels3, pLabelsFAS, pLabelsBLM, pLabelsSNOTEL]);
            app.map.infoWindow.resize(300, 65);

            app.pZoom = new MH_Zoom2FeatureLayers({}); // instantiate the class
            app.dblExpandNum = 0.5;




            var dteDateTime = new Date();
            var strDateTime = dteDateTime.getFullYear() + "-" + ("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTime.getDate()).slice(-2);
            var strDateTimeUserFreindly = (dteDateTime.getMonth() + 1) + "/" + dteDateTime.getDate() + "/" + dteDateTime.getFullYear();
            var dteDateTimeMinus3 = new Date();
            dteDateTimeMinus3.setDate(dteDateTimeMinus3.getDate() - 3);
            var strDateTimeMinus3 = dteDateTimeMinus3.getFullYear() + "-" + ("0" + (dteDateTimeMinus3.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTimeMinus3.getDate()).slice(-2);
            var strDateTimeMinus3UserFreindly = (dteDateTimeMinus3.getMonth() + 1) + "/" + dteDateTimeMinus3.getDate() + "/" + dteDateTimeMinus3.getFullYear();

            document.getElementById("txtFromToDate").innerHTML = "Conditions based on the last 3 days (" + strDateTimeMinus3UserFreindly.toString() + "-" + strDateTimeUserFreindly.toString() + ")";
            app.pGage.Start(strDateTimeMinus3, strDateTime);



            var legendLayers = [];
            legendLayers.push({ layer: pSNOTELFeatureLayer, title: 'SNOTEL Sites' });
            legendLayers.push({ layer: pFASFeatureLayer, title: 'FWP Fish Access Sites' });
            legendLayers.push({ layer: pBLMFeatureLayer, title: 'BLM Access Sites' });
            legendLayers.push({ layer: pEPointsFeatureLayer, title: 'Start/End Section Locaitons' });
            legendLayers.push({ layer: pGageFeatureLayer, title: 'Gages' });

            dojo.connect(app.map, 'onLayersAddResult', function (results) {
                var legend = new Legend({ map: app.map, layerInfos: legendLayers, respectCurrentMapScale: false, autoUpdate: true }, "legendDiv");
                legend.startup();
            });

            var cbxLayers = [];
            cbxLayers.push({ layers: [pBLMFeatureLayer, pLabelsBLM], title: 'BLM Access Sites' });
            //cbxLayers.push({ layers: [pWatershedsFeatureLayer, plabels1], title: 'Watersheds' });
            //cbxLayers.push({ layers: [pSectionsFeatureLayer, plabels3], title: 'Sections' });
            //cbxLayers.push({ layers: [pFWPFeatureLayer, pFWPFeatureLayer], title: 'FWP Closures' });
            cbxLayers.push({ layers: [pFASFeatureLayer, pLabelsFAS], title: 'MT FWP Fishing Access Sites' });
            //cbxLayers.push({ layers: [pEPointsFeatureLayer, pEPointsFeatureLayer], title: 'Start/End Section Locaitons' });
            //cbxLayers.push({ layers: [pGageFeatureLayer, pGageFeatureLayer], title: 'Gages' });
            cbxLayers.push({ layers: [pSNOTELFeatureLayer, pLabelsSNOTEL], title: 'SNOTEL Sites' });

            this.LayerCheckBoxSetup(cbxLayers);
            ko.bindingHandlers.googleBarChart = {
                init: function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
                    var chart = new google.visualization.LineChart(element);
                    ko.utils.domData.set(element, 'googleLineChart', chart);
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var value = ko.unwrap(valueAccessor());
                    var tickMarks = [];
                    var strTitle = "";

                    if ((value.getColumnLabel(0) == "DatetimeTMP") | (value.getColumnLabel(0) == "DatetimeTMPSingle")) {
                        strTitle = "Stream Temperature (F)"
                    }
                    else if ((value.getColumnLabel(0) == "DatetimeCFS") | (value.getColumnLabel(0) == "DatetimeCFSSingle")) {
                        strTitle = "Stream Section Discharge (CFS)"
                    }

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
                          "title": strTitle,
                          width: '100%',
                          height: 400,
                          chartArea: {
                              left: "5%", top: "5%"
                          }
                      };

                    
                    if ((value.getColumnLabel(0) == "DatetimeCFS") & (value.getNumberOfColumns() == 3)) {
                        var optionsSeries = {
                            0: { lineWidth: 3 }, //blue
                            1: { lineWidth: 8 }  //dark orange
                        };
                        var optionsSeriesColors = ['#3385ff', //blue
                                                    '#df7206'];  //dark orange
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;
                    } else if (value.getColumnLabel(0) == "DatetimeTMPSingle") {
                        var options4ChartAreaTrendlines = {
                            0: {
                                labelInLegend: 'Temp Trend Line',
                                visibleInLegend: true,
                            }
                        };
                        options.trendlines = options4ChartAreaTrendlines;

                        var optionsSeries = {
                            0: { lineWidth: 3 }, //blue
                            1: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                        };
                        var optionsSeriesColors = ['#3385ff', //blue
                                                    '#919191'];  //medium grey
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;
                    } else if (value.getColumnLabel(0) == "DatetimeCFSSingle") {
                        var options4ChartAreaTrendlines = {
                            0: {
                                labelInLegend: 'CFS Trend Line',
                                visibleInLegend: true,
                            }
                        };
                        options.trendlines = options4ChartAreaTrendlines;

                        var optionsSeries = {
                            0: { lineWidth: 3 }, //blue
                            1: { lineWidth: 10, lineDashStyle: [1, 1] },  //light grey
                            2: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                            3: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                            4: { lineWidth: 8 }  //dark orange
                        };
                        var optionsSeriesColors = ['#3385ff', //blue
                                                    '#ccced0',  //light grey
                                                    '#919191',  //medium grey
                                                    '#61605f', //dark grey
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
                app.pZoom.qry_Zoom2FeatureLayerExtent(pWatershedsFeatureLayer, "OBJECTID");
            } else {
                app.dblExpandNum = 1;
                app.pZoom.qry_Zoom2FeatureLayerExtent(pBasinsFeatureLayer, "FID");
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


       
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);