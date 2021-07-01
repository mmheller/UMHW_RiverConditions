
function showLoading() {
    esri.show(app.loading);
    app.map.disableMapNavigation();
    app.map.hideZoomSlider();
}

function closeAllSelect(elmnt) {
	/*a function that will close all select boxes in the document,
	except the current select box:*/
	var x, y, i, xl, yl, arrNo = [];
	x = document.getElementsByClassName("select-items");
	y = document.getElementsByClassName("select-selected");
	xl = x.length;
	yl = y.length;
	for (i = 0; i < yl; i++) {
		if (elmnt == y[i]) {
			arrNo.push(i)
		} else {
			y[i].classList.remove("select-arrow-active");
		}
	}
	for (i = 0; i < xl; i++) {
		if (arrNo.indexOf(i)) {
			x[i].classList.add("select-hide");
		}
	}
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
    "esri/layers/CSVLayer",
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
    "esri/symbols/SimpleMarkerSymbol",
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
            Font, MH_Zoom2FeatureLayers, BasemapGallery, CSVLayer, UniqueValueRenderer, webMercatorUtils, declare, lang, esriRequest, all, urlUtils, FeatureLayer, QueryTask, Query, All,
            Scalebar, sniff, scaleUtils, request, arrayUtils, Graphic, Editorall, SnappingManager, FeatureLayer,
        SimpleRenderer, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol,
        CheckBox, Legend, Toolbar, Color, LabelLayer, TextSymbol, Polygon, InfoTemplate, dom, domClass, registry, mouse, on, Map,
          InfoWindowLite,
          InfoTemplate,
          FeatureLayer,
          domConstruct,
          BootstrapMap
) {

    return declare([], {
        m_pRiverSymbolsFeatureLayer: null,
        m_StreamStatusRenderer: null,

        addStreamConditionFeatureLayer: function (arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange, arrayOIDPlum, arrayOIDsRed) {
            var defaultSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 169, 230]), 5);
            app.pSup.m_StreamStatusRenderer = new UniqueValueRenderer(defaultSymbol, "OBJECTID");//create renderer
            app.pSup.m_StreamStatusRenderer.defaultLabel = "Stream Section (Open)";

            for (var i = 0; i < arrayOIDYellow.length; i++) {
                app.pSup.m_StreamStatusRenderer.addValue({
                    value: arrayOIDYellow[i],
                    symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 0]), 18),
                    label: "Prepare"
                });
            }
            for (var ii = 0; ii < arrayOIDsGold.length; ii++) {
                app.pSup.m_StreamStatusRenderer.addValue({
                    value: arrayOIDsGold[ii],
                    symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([249, 166, 2]), 18),
                    label: "Conservation Actions"
                });
            }
            for (var iii = 0; iii < arrayOIDsOrange.length; iii++) {
                app.pSup.m_StreamStatusRenderer.addValue({
                    value: arrayOIDsOrange[iii],
                    symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([253, 106, 2]), 18),
                    label: "Unnoficial Closure"
                });
            }
            for (var iii = 0; iii < arrayOIDPlum.length; iii++) {
                app.pSup.m_StreamStatusRenderer.addValue({
                    value: arrayOIDPlum[iii],
                    symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([221, 160, 221]), 18),
                    label: "Hoot Owl"
                });
            }
            for (var iiii = 0; iiii < arrayOIDsRed.length; iiii++) {
                app.pSup.m_StreamStatusRenderer.addValue({
                    value: arrayOIDsRed[iiii],
                    symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 18),
                    label: "Offical Restriction"
                });
            }

            var featureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "5", {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["OBJECTID"]
            });
            featureLayer.setRenderer(app.pSup.m_StreamStatusRenderer);
            //featureLayer.setRenderer(renderer);
            app.map.addLayer(featureLayer);
            app.map.reorderLayer(featureLayer, 5);
        },

        GetSetHeaderWarningContent: function (strAGSIndexTableURL, strH2OID, blnUseAlternateHeader, strBasinID) {
			if ((typeof strH2OID == 'undefined') & (typeof strBasinID == 'undefined')) {
                strH2OID = "UMH";
			} else if ((typeof strH2OID == 'undefined') & (typeof strBasinID != 'undefined')) {
				strH2OID = strBasinID;
			} 
            strURLFieldName = "URL";
            var query = new Query();
            query.outFields = [strURLFieldName];
            var queryTask = new QueryTask(strAGSIndexTableURL);
            query.where = "Name = '" + strH2OID + "'";
            queryTask.execute(query, showHeaderWarningContentResults);

			function showHeaderWarningContentResults(results) {
				console.log("showHeaderWarningContentResults");
                var resultItems = [];
                var resultCount = results.features.length;
                for (var i = 0; i < resultCount; i++) {
                    var featureAttributes = results.features[i].attributes;
					var strGoogleSheetURL = featureAttributes[strURLFieldName];
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
						des.appendChild(document.createTextNode('\u00A0\u00A0\u00A0\u00A0'));
                    });
                }
            });
        },

		Phase1: function () {
			app.H2O_ID = getTokens()['H2O_ID'];
			app.Basin_ID = getTokens()['Basin_ID'];

			if (app.Basin_ID == "UY_Shields") {
				app.Basin_ID = "Upper Yellowstone Headwaters";
			}

			console.log("MH_setup Phase1");

			//array [watershed listed on website, watershed in layer, basin name in website]
			app.arrayEntireList = [["Beaverhead/Centennial", "Beaverhead", "UMH"],
				["Big Hole", "Big Hole", "UMH"],
				["Boulder", "Boulder", "UMH"], ["Broadwater", "Broadwater", "UMH"], 
				["Gallatin-Lower", "Lower Gallatin", "UMH"], ["Gallatin-Upper", "Upper Gallatin", "UMH"], ["Jefferson", "Jefferson", "UMH"],
				["Madison", "Madison", "UMH"], ["Ruby", "Ruby", "UMH"],
				["Shields", "Shields", "Upper Yellowstone Headwaters"],
				["Upper Yellowstone", "Upper Yellowstone", "Upper Yellowstone Headwaters"],
				["Yellowstone Headwaters", "Yellowstone Headwaters", "Upper Yellowstone Headwaters"],
				["Middle Musselshell", "Middle Musselshell", "Musselshell"],
				["Sun", "Sun", "Blackfoot-Sun"], ["Lower Musselshell", "Lower Musselshell", "Musselshell"],
				["Lower Bighorn", "Lower Bighorn", "Bighorn"], ["Little Bighorn", "Little Bighorn", "Bighorn"],
				["Flatwillow", "Flatwillow", "Musselshell"], ["Shoshone", "Shoshone", "Bighorn"],
				["Box Elder", "Box Elder", "Musselshell"], ["Blackfoot", "Blackfoot", "Blackfoot-Sun"],
				["Little Wind", "Little Wind", "Bighorn"], ["Lower Wind", "Lower Wind", "Bighorn"],
				["North Fork Shoshone", "North Fork Shoshone", "Bighorn"], ["Big Horn Lake", "Big Horn Lake", "Bighorn"],
				["South Fork Shoshone", "South Fork Shoshone", "Bighorn"], ["Upper Wind", "Upper Wind", "Bighorn"],
				["Greybull", "Greybull", "Bighorn"], ["Dry", "Dry", "Bighorn"],
				["Upper Bighorn", "Upper Bighorn", "Bighorn"], ["Upper Musselshell", "Upper Musselshell", "Musselshell"],
				["Boulder and East Boulder", "Boulder and East Boulder", "Boulder and East Boulder"],
				["City of Choteau - Teton River", "Blackfoot-Sun"]
            ];

			var arrayNavList = [];
			if ((app.H2O_ID == undefined) & (app.Basin_ID == undefined)) {
				arrayNavList = app.arrayEntireList;
			} else if (app.Basin_ID != undefined) {
				for (var ib2 = 0; ib2 < app.arrayEntireList.length; ib2++) { 							//if a watershed is passed, determine the correspoinding watersheds
					if (app.Basin_ID == app.arrayEntireList[ib2][2]) {
						arrayNavList.push(app.arrayEntireList[ib2]);
					}
				}
			}
			else {
				for (var ib = 0; ib < app.arrayEntireList.length; ib++) { 			//if a watershed is passed, determine the area/basin
					if (app.H2O_ID == app.arrayEntireList[ib][1]) {
						app.Basin_ID = app.arrayEntireList[ib][2];
						break;
					}
				}
				for (var ib2 = 0; ib2 < app.arrayEntireList.length; ib2++) { 							//if a watershed is passed, determine the correspoinding watersheds
					if (app.Basin_ID == app.arrayEntireList[ib2][2]) {
						arrayNavList.push(app.arrayEntireList[ib2]);
					}
				}
			}

			var arrayNavListBasin = [["Upper Missouri Headwaters", "UMH"],
									["Upper Yellowstone/Shields", "UY_Shields"],
									["Musselshell", "Musselshell"],
									["Blackfoot-Sun", "Blackfoot-Sun"],
									["Bighorn", "Bighorn"],
									["Boulder and East Boulder", "Boulder and East Boulder"]
			];

			var strURLPrefix = "index.html?H2O_ID=";
			var strURLPrefixBasin = "index.html?Basin_ID=";
			var strURLSuffix = "";
			document.addEventListener("click", closeAllSelect);

			var selBasin = document.getElementById("sel_Basin");
			for (var i = 0; i < arrayNavListBasin.length; i++) {
				var a = document.createElement("a");
				var newItem = document.createElement("option");
				a.textContent = arrayNavListBasin[i][0];
				a.setAttribute('role', "presentation");

				a.setAttribute('href', strURLPrefixBasin + arrayNavListBasin[i][1] + strURLSuffix);
				newItem.appendChild(a);
				selBasin.add(newItem, i+1);

				if (arrayNavListBasin[i][1] == app.Basin_ID) {				//set the region/basin in the dropdown!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
					selBasin.options[i+1].selected = true;
				}
			}

			var x, i, j, l, ll, selElmnt, a, b, c;
			/*look for any elements with the class "custom-select":*/

			x = document.getElementsByClassName("custom-select");
			l = x.length;
			for (i = 0; i < l; i++) {
				selElmnt = x[i].getElementsByTagName("select")[0];
				ll = selElmnt.length;
				/*for each element, create a new DIV that will act as the selected item:*/
				a = document.createElement("DIV");
				a.setAttribute("class", "select-selected");
				a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
				x[i].appendChild(a);
				/*for each element, create a new DIV that will contain the option list:*/
				b = document.createElement("DIV");
				b.setAttribute("class", "select-items select-hide");
				for (j = 1; j < ll; j++) {
					/*for each option in the original select element, create a new DIV that will act as an option item:*/
					c = document.createElement("DIV");
					c.innerHTML = selElmnt.options[j].innerHTML;
					c.addEventListener("click", function (e) {
						/*when an item is clicked, update the original select box,and the selected item:*/
						var y, i, k, s, h, sl, yl;
						s = this.parentNode.parentNode.getElementsByTagName("select")[0];
						sl = s.length;
						h = this.parentNode.previousSibling;
						for (i = 0; i < sl; i++) {
							if (s.options[i].innerHTML == this.innerHTML) {
								s.selectedIndex = i;
								h.innerHTML = this.innerHTML;
								y = this.parentNode.getElementsByClassName("same-as-selected");
								yl = y.length;
								for (k = 0; k < yl; k++) {
									y[k].removeAttribute("class");
								}
								this.setAttribute("class", "same-as-selected");
								break;
							}
						}
						h.click();
					});
					b.appendChild(c);
				}
				x[i].appendChild(b);
				a.addEventListener("click", function (e) {
					/*when the select box is clicked, close any other select boxes,	and open/close the current select box:*/
					e.stopPropagation();
					closeAllSelect(this);
					this.nextSibling.classList.toggle("select-hide");
					this.classList.toggle("select-arrow-active");
					//alert("matt test");
				});
			}



			if (getTokens()['UMHBanner'] != undefined) {
				$('#UMH_NavBar2').show();
				document.body.style.paddingTop = '130px';
				UMH_NavBar1.style.paddingTop = '80px';
			}



            app.test = false;
            var strTest = getTokens()['test'];
            if (strTest != undefined) {
                if (strTest.toUpperCase() == 'TRUE') {
                    app.test = true;
                }
            }

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
            //app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/Main_Map/FeatureServer/";
			//app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/UMH2/FeatureServer/";
			app.strHFL_URL = "https://services.arcgis.com/9ecg2KpMLcsUv1Oh/arcgis/rest/services/RCT_beta_Spring2021/FeatureServer/";
			//app.strHFL_URL = "https://services.arcgis.com/9ecg2KpMLcsUv1Oh/arcgis/rest/services/Temp_RCT/FeatureServer/"
			
			this.GetSetHeaderWarningContent(app.strHFL_URL + "12", app.H2O_ID, blnUseAlternateHeader, app.Basin_ID);
        },

        Phase2: function () {

            if (typeof app.H2O_ID != 'undefined') {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 10;
            } else {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 11;
            }
                        
            esri.config.defaults.geometryService = new esri.tasks.GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
            app.map = BootstrapMap.create("mapDiv", { basemap: "topo", center: arrayCenterZoom, zoom: izoomVal, scrollWheelZoom: false});// Get a reference to the ArcGIS Map class
            
            app.map.disableMapNavigation();
            app.map.hideZoomSlider();

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
                        //console.log("Removing..." + basemapGallery.basemaps[cnt].title);
                        basemapGallery.remove(basemapGallery.basemaps[cnt].id);
                    }
                }
            });

            on(app.map, "layers-add-result", function(e) {
              for (var i = 0; i < e.layers.length; i++) {
                 var result = (e.layers[i].error == undefined) ? "OK": e.layers[i].error.message;
                 //console.log(" - " +e.layers[i].layer.id + ": " +result);
                 }
            });

            var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" }, dojo.byId("scaleDiv"));
            
            app.loading = dojo.byId("loadingImg");  //loading image. id
            dojo.connect(app.map, "onUpdateStart", showLoading);
            dojo.connect(app.map, "onUpdateEnd", hideLoading);

            var template = new InfoTemplate();
            template.setTitle("Stream Gage");
            template.setContent("<b>${GageTitle}</b><br>Watershed:${Watershed}<br><a href=${GageURL} target='_blank'>Link to gage at ${Agency} website</a>");
            var pGageFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "1", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: template, outFields: ['*'] });

            var templateEPOINT = new InfoTemplate();
            templateEPOINT.setTitle("<b>Start/End Section Locations</b>");
            templateEPOINT.setContent("Placename: ${Endpoint_Name}<br>Section: ${Start_End} of ${Section_Name}<br>Stream: ${Stream_Name}<br>");
            pEPointsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "0", {
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                infoTemplate: templateEPOINT,
                outFields: ['*'],
                minScale: 1000000
            });

            var vMagentaColor = new Color("#E11AEE");              // create a text symbol to define the style of labels
            var pLabelEndPoints = new TextSymbol().setColor(vMagentaColor);
            pLabelEndPoints.font.setSize("9pt");
            pLabelEndPoints.font.setFamily("arial");
            var pLabelRendererEndPoints = new SimpleRenderer(pLabelEndPoints);
            var pLabelsEndPoints = new LabelLayer({
                id: "LabelsEndPoints",
                minScale: 600000});
            pLabelsEndPoints.addFeatureLayer(pEPointsFeatureLayer, pLabelRendererEndPoints, "{Start_End} of Section {Section_Name}");


            var strQueryDef1 = "1=1";
			var strQueryDef2 = "1=1";

			//var strQueryDef3 = "Name in ('Beaverhead','Broadwater','Ruby','Big Hole','Jefferson','Boulder','Madison','Gallatin', 'Upper Yellowstone','Shields','Yellowstone Headwaters')";
			var strQueryDef3 = "";
			var strQueryDef4 = "Name in ('')";

			arrayTmp4Query3 = [];
			if ((app.Basin_ID == undefined) & (typeof app.H2O_ID == 'undefined')) {
				for (var ib2 = 0; ib2 < app.arrayEntireList.length; ib2++) { 							//if a watershed is passed, determine the correspoinding watersheds
						arrayTmp4Query3.push(app.arrayEntireList[ib2][1]);
				}
				strQueryDef3 = "Name in ('" + arrayTmp4Query3.join("','") + "')";
			} else if ((app.Basin_ID != undefined) & (typeof app.H2O_ID == 'undefined')) {
				for (var ib2 = 0; ib2 < app.arrayEntireList.length; ib2++) { 							//if a watershed is passed, determine the correspoinding watersheds
					if (app.Basin_ID == app.arrayEntireList[ib2][2]) {
						arrayTmp4Query3.push(app.arrayEntireList[ib2][1]);
					}
				}
				strQueryDef1 = "(Watershed_Name in ('" + arrayTmp4Query3.join("','") +
					"')) OR (WatershedName_Alt1 in ('" + arrayTmp4Query3.join("','") +
					"')) OR (WatershedName_Alt2 in ('" + arrayTmp4Query3.join("','") + "'))";

				//strQueryDef2 = "(Watershed in ('" + arrayTmp4Query3.join("','") +
				//	"'))";

				strQueryDef2 = "(Watershed in ('" + arrayTmp4Query3.join("','") +
					"')) OR (WatershedName_Alt1 in ('" + arrayTmp4Query3.join("','") +
					"')) OR (WatershedName_Alt2 in ('" + arrayTmp4Query3.join("','") + "'))";

				strQueryDef3 = "(Name in ('" + arrayTmp4Query3.join("','") +
					"')) OR (Name_Alternate1 in ('" + arrayTmp4Query3.join("','") +
					"')) OR (Name_Alternate2 in ('" + arrayTmp4Query3.join("','") + "'))";

				strQueryDef4 = "(NOT(Name in ('" + arrayTmp4Query3.join("','") + "'))) AND " +
							  "((NOT(Name_Alternate1 in ('" + arrayTmp4Query3.join("','") + "'))) OR (Name_Alternate1 is Null)) AND" +
					          "((NOT(Name_Alternate2 in ('" + arrayTmp4Query3.join("','") + "'))) OR (Name_Alternate1 is Null))";

			} else if (typeof app.H2O_ID != 'undefined') {
                strQueryDef1 = "Watershed_Name = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt1 = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt2 = '" + app.H2O_ID + "'";
                strQueryDef2 = "Watershed = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt1 = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt2 = '" + app.H2O_ID + "'";
                strQueryDef3 = "Name = '" + app.H2O_ID + "'" + " OR " + " Name_Alternate1 = '" + app.H2O_ID + "'" + " OR " + " Name_Alternate2 = '" + app.H2O_ID + "'"
                //strQueryDef4 = "Name <> '" + app.H2O_ID + "'" + " OR " + " Name_Alternate1 <> '" + app.H2O_ID + "'" + " OR " + " Name_Alternate2 <> '" + app.H2O_ID + "'";
                strQueryDef4 = "Name <> '" + app.H2O_ID + "'" + 
                                    " AND (" + " Name_Alternate1 <> '" + app.H2O_ID + "' OR (Name_Alternate1 is Null))" + 
                                    " AND (" + " Name_Alternate2 <> '" + app.H2O_ID + "' OR (Name_Alternate1 is Null))";
            }

			app.SectionQryStringGetGageData = strQueryDef2;

            pEPointsFeatureLayer.setDefinitionExpression(strQueryDef1);

            pSectionsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "5", {
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                autoGeneralize: true, "opacity": 0.9, outFields: ['*']
            });
            pSectionsFeatureLayer.setDefinitionExpression(strQueryDef2);
            app.pGetWarn.m_strSteamSectionQuery = strQueryDef2;

            var pBasinsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "8", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.5, autoGeneralize: true, outFields: ['*'] });
			if (app.Basin_ID != undefined) {
				if (app.Basin_ID == "UMH") {
					pBasinsFeatureLayer.setDefinitionExpression("Name = 'Upper Missouri Headwaters'");
				} else {
					pBasinsFeatureLayer.setDefinitionExpression("Name = '" + app.Basin_ID + "'");
				}
			}


            var templateFAS = new InfoTemplate();
            templateFAS.setTitle("MT FAS (Fishing Access Site)");
            templateFAS.setContent("<b>${NAME}</b><br>${BOAT_FAC}<br><a href=${WEB_PAGE} target='_blank'>Link to Fish Access Site</a>");
            var pFASFeatureLayer = new esri.layers.FeatureLayer("https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FWPLND_FAS_POINTS/FeatureServer/0",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateFAS, "opacity": 0.5, outFields: ['*'], visible: false });
            var vDarkGreyColor = new Color("#3F3F40");              // create a text symbol to define the style of labels
            var pLabelFAS = new TextSymbol().setColor(vDarkGreyColor);
            pLabelFAS.font.setSize("9pt");
            pLabelFAS.font.setFamily("arial");
            var pLabelRendererFAS = new SimpleRenderer(pLabelFAS);
            var pLabelsFAS = new LabelLayer({ id: "LabelsFAS" });
            pLabelsFAS.addFeatureLayer(pFASFeatureLayer, pLabelRendererFAS, "{NAME}");
            
            var templateBLM = new InfoTemplate();
            templateBLM.setTitle("<b>BLM Facility</b>");
            templateBLM.setContent("${Facility_Name}<br><a href=${URL} target='_blank'>Link to BLM Facility</a>");
            var pBLMFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "2",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateBLM, outFields: ['*'], visible: false });
            var pLabelBLM = new TextSymbol().setColor(vDarkGreyColor);
            pLabelBLM.font.setSize("9pt");
            pLabelBLM.font.setFamily("arial");
            var pLabelRendererBLM = new SimpleRenderer(pLabelBLM);
            var pLabelsBLM = new LabelLayer({ id: "LabelsBLM" });
            pLabelsBLM.addFeatureLayer(pBLMFeatureLayer, pLabelRendererBLM, "{Facility_Name}");




            var templateCZM = new InfoTemplate();
            templateCZM.setTitle("<b>Channel Migration Zone</b>");
            templateCZM.setContent("CMZ: ${CMZ}<br>Reach ID: ${RchID}");
            var pCZMFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "11",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateCZM, outFields: ['*'], visible: false });



            var templateFWPAISAccess = new InfoTemplate();
            templateFWPAISAccess.setTitle("Montana AIS Watercraft Access");
            templateFWPAISAccess.setContent("${SITENAME}</br>${ACCESSTYPE}</br>${WATERBODY}</br>${STATUS}</b>");
            var pFWPAISAccessFeatureLayer = new esri.layers.FeatureLayer("https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FISH_AIS_WATERCRAFT_ACCESS/FeatureServer/0",
                {
                    mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateFWPAISAccess, outFields: ['*'],
                    minScale: 5200000, visible: false });


            var templateSNOTEL = new InfoTemplate();
            templateSNOTEL.setTitle("<b>${Name} SNOTEL Site</b>");
            var strSNOTELGraphURL = "https://wcc.sc.egov.usda.gov/nwcc/view?intervalType=+View+Current+&report=WYGRAPH&timeseries=Daily&format=plot&sitenum=${stationID}&interval=WATERYEAR";
            templateSNOTEL.setContent("<a href=${SitePageURL} target='_blank'>Link to SNOTEL Site Page</a>, <a href=" + strSNOTELGraphURL + " target='_blank'>Link to SWE Current/Historical Graphs</a> ");
            var pSNOTELFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "3",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateSNOTEL, outFields: ['*'], visible: false });
            var pLabelSNOTEL = new TextSymbol().setColor(vDarkGreyColor);
            pLabelSNOTEL.font.setSize("9pt");
            pLabelSNOTEL.font.setFamily("arial");
            var pLabelRendererSNOTEL = new SimpleRenderer(pLabelSNOTEL);
            var pLabelsSNOTEL = new LabelLayer({ id: "LabelsSNOTEL" });
            pLabelsSNOTEL.addFeatureLayer(pSNOTELFeatureLayer, pLabelRendererSNOTEL, "{Name}");

            var templateNOAA = new InfoTemplate();
            templateNOAA.setTitle("<b>Weather Station</b>");
            templateNOAA.setContent("<b>${STNNAME}</b>(${OWNER})<br><a href=${URL} target='_blank'>More info...</a>");
            var pNOAAFeatureLayer = new esri.layers.FeatureLayer("https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/obs_meteoceanhydro_insitu_pts_geolinks/MapServer/1",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateNOAA, outFields: ['*'], visible: false });
            var pLabelNOAA = new TextSymbol().setColor(vDarkGreyColor);
            pLabelNOAA.font.setSize("9pt");
            pLabelNOAA.font.setFamily("arial");
            var pLabelRendererNOAA = new SimpleRenderer(pLabelNOAA);
            var pLabelsNOAA = new LabelLayer({ id: "LabelsNOAA" });
            pLabelsNOAA.addFeatureLayer(pNOAAFeatureLayer, pLabelRendererNOAA, "{STNNAME}");
           
            var templateFWP = new InfoTemplate();
            templateFWP.setTitle("Official Stream Restriction");
            templateFWP.setContent("<b>${TITLE}</b><br>${WATERBODY}<br>${DESCRIPTION} Publish Date: ${PUBLISHDATE}");

            app.strFWPURL = "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/ArcGIS/rest/services/FISH_WATERBODY_RESTRICTIONS/FeatureServer/0";

			var dteDateTime = new Date();
			var strDateTime = dteDateTime.getFullYear() + "-" + ("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTime.getDate()).slice(-2);
			var strDateTimeUserFreindly = (dteDateTime.getMonth() + 1) + "/" + dteDateTime.getDate() + "/" + dteDateTime.getFullYear();
			var dteDateTimeMinus3 = new Date();
			dteDateTimeMinus3.setDate(dteDateTimeMinus3.getDate() - 3);
			var strDateTimeMinus3 = dteDateTimeMinus3.getFullYear() + "-" + ("0" + (dteDateTimeMinus3.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTimeMinus3.getDate()).slice(-2);
			var strDateTimeMinus3UserFreindly = (dteDateTimeMinus3.getMonth() + 1) + "/" + dteDateTimeMinus3.getDate() + "/" + dteDateTimeMinus3.getFullYear();

            if (app.test) {
                //app.strFWPURL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/TestH2ORest/FeatureServer/0";
                app.strFWPQuery = "(PUBLISHDATE > '7/15/2017') AND (PUBLISHDATE < '7/20/2017')";
            } else {
				app.strFWPQuery = "(ARCHIVEDATE IS NULL) OR (ARCHIVEDATE > '" + strDateTimeUserFreindly + "')";
            }
			            
            var sfsFWP = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([255, 0, 0]), 5), new Color([255, 0, 0, 0.25])
            );
            var rendererFWP = new SimpleRenderer(sfsFWP);

            var pFWPFeatureLayer = new esri.layers.FeatureLayer(app.strFWPURL,
                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, infoTemplate: templateFWP, "opacity": 0.6, outFields: ['*'], visible: true });
            pFWPFeatureLayer.setRenderer(rendererFWP);
            pFWPFeatureLayer.setDefinitionExpression(app.strFWPQuery);

            var pCartoFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "4", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.9, autoGeneralize: true, outFields: ['*'] });
            var pCartoFeatureLayerPoly = new esri.layers.FeatureLayer(app.strHFL_URL + "6", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.9, autoGeneralize: true, outFields: ['*'] });

            var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([0, 72, 118]), 2), new Color([255, 255, 255, 0.10])
            );

            var rendererWatersheds = new SimpleRenderer(sfs);
            var strlabelField1 = "Name";
            var pWatershedsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "9", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.9, autoGeneralize: true, outFields: [strlabelField1] });
            pWatershedsFeatureLayer.setDefinitionExpression(strQueryDef3);
            pWatershedsFeatureLayer.setRenderer(rendererWatersheds);

            var sfsMask = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([200, 200, 200]), 2), new Color([9, 60, 114, 0.25])
            );
            var rendererWatershedsMask = new SimpleRenderer(sfsMask);
            var pWatershedsMaskFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "9", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.5, autoGeneralize: true, outFields: [strlabelField1] });
            pWatershedsMaskFeatureLayer.setDefinitionExpression(strQueryDef4);
            pWatershedsMaskFeatureLayer.setRenderer(rendererWatershedsMask);

            var sfsBasinMask = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([200, 200, 200]), 0.1), new Color([26, 90, 158, 0.45])
            );
            var rendererBasinMask = new SimpleRenderer(sfsBasinMask);
            var pBasinsMaskFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "9", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.7, autoGeneralize: true, outFields: ['*'] });
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
            
            app.pSup.m_pRiverSymbolsFeatureLayer = new esri.layers.FeatureLayer(app.strHFL_URL + "10",
                                                        { mode: esri.layers.FeatureLayer.MODE_ONDEMAND,  visible: true });
            // Use CORS
            esriConfig.defaults.io.corsEnabledServers.push("docs.google.com"); // supports CORS

            var pMonitoringCSVLayer = new CSVLayer("https://docs.google.com/spreadsheets/d/e/2PACX-1vTw0rCwCLxDg2jCLLCscILrMDMGBbInS1KmwH76CPyqVYqFolKdOfw0J4DIaJhWoPDPkwVNQI_Y7OeX/pub?output=csv", {
                visible:false
            });
            var orangeRed = new Color([238, 69, 0, 0.5]); // hex is #ff4500
            var marker = new SimpleMarkerSymbol("solid", 15, null, orangeRed);
            var renderer = new SimpleRenderer(marker);
            pMonitoringCSVLayer.setRenderer(renderer);
            var pCSVTemplate = new InfoTemplate();
            pCSVTemplate.setTitle("<b>Monitoring Sites</b>");
            pCSVTemplate.setContent("Station Name: ${STATION_NAME}<br>Drainage Name: ${Drainage_Name}<br><a href=${URL} target='_blank'> Link monitoring data</a>");
            pMonitoringCSVLayer.setInfoTemplate(pCSVTemplate);

            app.map.addLayers([app.pSup.m_pRiverSymbolsFeatureLayer, pWatershedsMaskFeatureLayer, pBasinsMaskFeatureLayer, pCZMFeatureLayer, pWatershedsFeatureLayer, pBasinsFeatureLayer, pCartoFeatureLayer, pCartoFeatureLayerPoly,
                pSectionsFeatureLayer, pSNOTELFeatureLayer, pNOAAFeatureLayer, pFWPAISAccessFeatureLayer, pFWPFeatureLayer, pBLMFeatureLayer, pFASFeatureLayer, pGageFeatureLayer, pEPointsFeatureLayer,
                               plabels1, plabels3, pLabelsFAS, pLabelsBLM, pLabelsSNOTEL, pLabelsNOAA, pLabelsEndPoints, pMonitoringCSVLayer]);
            app.map.infoWindow.resize(300, 65);

            app.pZoom = new MH_Zoom2FeatureLayers({}); // instantiate the class
            app.dblExpandNum = 0.5;

            document.getElementById("txtFromToDate").innerHTML = "Conditions based on the last 3 days (" + strDateTimeMinus3UserFreindly.toString() + "-" + strDateTimeUserFreindly.toString() + ")";
            app.pGage.Start(strDateTimeMinus3, strDateTime);

            var legendLayers = [];
            legendLayers.push({ layer: pCZMFeatureLayer, title: 'Channel Migration Zones' });
            legendLayers.push({ layer: pMonitoringCSVLayer, title: 'Monitoring Locations' });
            legendLayers.push({ layer: pFWPAISAccessFeatureLayer, title: 'MT AIS Watercraft Access' });
            legendLayers.push({ layer: pSNOTELFeatureLayer, title: 'SNOTEL Sites' });
            legendLayers.push({ layer: pNOAAFeatureLayer, title: 'Weather Stations' });
            legendLayers.push({ layer: pFASFeatureLayer, title: 'FWP Fish Access Sites' });
            legendLayers.push({ layer: pBLMFeatureLayer, title: 'BLM Access Sites' });
            legendLayers.push({ layer: pEPointsFeatureLayer, title: 'Start/End Section Locations' });
            legendLayers.push({ layer: pGageFeatureLayer, title: 'Gages' });
            //legendLayers.push({ layer: app.pSup.m_pRiverSymbolsFeatureLayer, title: 'River Status' });

            if (app.test) {
                legendLayers.push({ layer: app.pSup.m_pFWPFeatureLayer, title: 'Test Condition Messaging' });
            }
            else {
                legendLayers.push({ layer: app.pSup.m_pFWPFeatureLayer, title: 'MT Waterbody Restrictions' });
            }

			dojo.connect(app.map, 'onLayersAddResult', function (results) {
				console.log("onLayersAddResult");
                app.legend = new Legend({ map: app.map, layerInfos: legendLayers, respectCurrentMapScale: false, autoUpdate: true }, "legendDiv");
				app.legend.startup();
            });

            var cbxLayers = [];
            //cbxLayers.push({ layers: [pFWPFeatureLayer, pFWPFeatureLayer], title: 'FWP Water Restrictions' });
            //cbxLayers.push({ layers: [pWatershedsMaskFeatureLayer, pWatershedsMaskFeatureLayer], title: 'Other Watersheds' });
            //cbxLayers.push({ layers: [pBasinsMaskFeatureLayer, pBasinsMaskFeatureLayer], title: 'Other Basins' });
            cbxLayers.push({ layers: [pBLMFeatureLayer, pLabelsBLM], title: 'BLM Access Sites' });
            cbxLayers.push({ layers: [pFASFeatureLayer, pLabelsFAS], title: 'MT FWP Fishing Access Sites' });
            cbxLayers.push({ layers: [pSNOTELFeatureLayer, pLabelsSNOTEL], title: 'SNOTEL Sites' });
            cbxLayers.push({ layers: [pNOAAFeatureLayer, pLabelsNOAA], title: 'Weather Stations' });
            cbxLayers.push({ layers: [pFWPAISAccessFeatureLayer, pFWPAISAccessFeatureLayer], title: 'MT AIS Watercraft Access' });
            cbxLayers.push({ layers: [pMonitoringCSVLayer, pMonitoringCSVLayer], title: 'Monitoring Locations' });
            cbxLayers.push({ layers: [pCZMFeatureLayer, pCZMFeatureLayer], title: 'Channel Migration Zones' });
            
			this.LayerCheckBoxSetup(cbxLayers);


            SetupStreamClick();

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
                          //width: '100%',
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
                        var optionsSeries = null;
                        var optionsSeriesColors = null;

                        if (value.getNumberOfColumns() == 6) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] },  //light grey
                                2: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                                3: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                4: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#ccced0',  //light grey
                                '#919191',  //medium grey
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if (value.getNumberOfColumns() == 5) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                                2: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                3: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#919191',  //medium grey
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if (value.getNumberOfColumns() == 4) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                2: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if (value.getNumberOfColumns() == 3) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#df7206'];  //dark orange
                        }

                        var options4ChartAreaTrendlines = {
                            0: {
                                labelInLegend: 'CFS Trend Line',
                                visibleInLegend: true,
                            }
                        };
                        options.trendlines = options4ChartAreaTrendlines;
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;
                    }

                    options = ko.unwrap(options);
                    var chart = ko.utils.domData.get(element, 'googleLineChart');
                    chart.draw(value, options);
                },
            };


            if (typeof app.H2O_ID != 'undefined') {
                var iMapOrientation = app.map.width / app.map.height;
                
                app.dblExpandNum = 0.5;
				if ((iMapOrientation > 1.5) & ((app.H2O_ID == "Madison") | (app.H2O_ID == "Boulder") | (app.H2O_ID == "Ruby") | (app.H2O_ID == "Upper Gallatin") | (app.H2O_ID == "Lower Gallatin"))) {
                    app.dblExpandNum = 1;
				} else if ((app.H2O_ID == "Broadwater") | (app.H2O_ID == "Boulder"))  {
                    app.dblExpandNum = 1;
                }

                app.pZoom.qry_Zoom2FeatureLayerExtent(pWatershedsFeatureLayer, "OBJECTID");
            } else {
                app.dblExpandNum = 0.5;
                app.pZoom.qry_Zoom2FeatureLayerExtent(pBasinsFeatureLayer, "FID");
            }

            function err(err) {
                console.log("Failed to get stat results due to an error: ", err);
            }

            function mapLoaded() {        // map loaded//            // Map is ready
                app.map.on("mouse-move", showCoordinates); //after map loads, connect to listen to mouse move & drag events
				app.map.on("mouse-drag", showCoordinates);
				console.log("maploaded")
            }
            function showCoordinates(evt) {
                var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);  //the map is in web mercator but display coordinates in geographic (lat, long)
                dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.y.toFixed(4) + "<br>Longitude:" + mp.x.toFixed(4);  //display mouse coordinates
            }
            function SetupStreamClick() {
                dojo.connect(app.map, "onClick", executeQueryTask);

                queryTask = new esri.tasks.QueryTask(app.strHFL_URL + "5");

                query = new esri.tasks.Query();            //build query filter
                query.returnGeometry = true;
                query.outFields = ["StreamName", "SectionID"];

            }
            function executeQueryTask(pEvt) {
                app.map.graphics.clear();                //remove all graphics on the maps graphics layer
                var dblX = pEvt.mapPoint.x;
                var dblY = pEvt.mapPoint.y;
                var mSR = pEvt.mapPoint.spatialReference;
                var pSP = pEvt.screenPoint;
                var pxWidth = app.map.extent.getWidth() / app.map.width; // create an extent from the mapPoint that was clicked // this is used to return features within 3 pixels of the click point
                var padding = 8 * pxWidth;
                var qGeom = new esri.geometry.Extent({ "xmin": dblX - padding, "ymin": dblY - padding, "xmax": dblX + padding, "ymax": dblY + padding, "spatialReference": mSR });
                query.geometry = qGeom;
                queryTask.execute(query, showResults);
            }
			function showResults(featureSet) {
				console.log("showResults")
                //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
                dojo.forEach(featureSet.features, function (feature) {
                    var strStreamName = feature.attributes.StreamName;
                    var strSectionID = feature.attributes.SectionID;
                    var elements = document.getElementsByTagName('tr');  //Sets the click event for the row
                    for (var i = 0; i < elements.length; i++) {
                        var strTempText = (elements)[i].innerHTML;  //parse the section summary text to set var's for charting and zooming
                        strTempText = strTempText.substring(strTempText.indexOf("StreamName") + ("StreamName".length + 2), strTempText.length);
                        var strClickStreamName = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("SectionID") + ("SectionID".length + 2), strTempText.length);
                        var strClickSegmentID = strTempText.substring(0, strTempText.indexOf("</span>"));
                        
                        if ((strStreamName == strClickStreamName) & (strClickSegmentID == strSectionID)) {
                            var graphic = feature;
                            symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 255]), 1);
                            graphic.setSymbol(symbol);
                            graphic.attributes = { streamsectionClicked: true };
                            app.map.graphics.add(graphic);

                            (elements)[i].click();

                            break;
                        }

                    }
                });
            }

        },

        Phase3: function (pArrayOIDYellow, pArrayOIDsGold, pArrayOIDsOrange, pArrayOIDsPlum, pArrayOIDsRed) {  //creating this phase 3 to create legend items for river status based on the summarized data
            app.pSup.m_pRiverSymbolsFeatureLayer.setRenderer(app.pSup.m_StreamStatusRenderer);

			try {
				var legendLayers = app.legend.layerInfos;
				legendLayers.push({ layer: app.pSup.m_pRiverSymbolsFeatureLayer, title: 'River Status' });
				app.legend.layerInfos = legendLayers;
				app.legend.refresh();
			}
			catch (err) {
				console.log("Phase3 legendlayers issue::", err.message);
				$("#divShowHideLegendBtn").hide;
			}

			$("#btnJump2FEMA").click(function () {
				var pExtent = app.map.extent;
				pSR_WKID = pExtent.spatialReference.wkid;
				var strURL = "https://hazards-fema.maps.arcgis.com/apps/webappviewer/index.html?id=8b0adb51996444d4879338b5529aa9cd&extent=";
				strURL += pExtent.xmin + ",";
				strURL += pExtent.ymin + ",";
				strURL += pExtent.xmax + ",";
				strURL += pExtent.ymax + ",";
				strURL += pSR_WKID.toString();
				window.open(strURL);
			});


			
			$("#btnJump2GYIAIS").click(function () {
				var pExtent = app.map.extent;
				pSR_WKID = pExtent.spatialReference.wkid;
				var strURL = "https://gagecarto.github.io/aquaticInvasiveExplorer/index.html#bnds=";
				var pGeogExtent = webMercatorUtils.webMercatorToGeographic(pExtent);  //the map is in web mercator but display coordinates in geographic (lat, long)
				strURL += Math.round(pGeogExtent.xmin * 100) / 100 + ",";
				strURL += Math.round(pGeogExtent.ymin * 100) / 100 + ",";
				strURL += Math.round(pGeogExtent.xmax * 100) / 100 + ",";
				strURL += Math.round(pGeogExtent.ymax * 100) / 100;
				//strURL += pSR_WKID.toString();
				window.open(strURL);
			});

			$("#btnJump2FWP").click(function () {
				var pExtent = app.map.extent;
				pSR_WKID = pExtent.spatialReference.wkid;
				var strURL = "http://fwp.mt.gov/gis/maps/fishingGuide/index.html";
				window.open(strURL);
			});

		},

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);