
function showLoading() {
    //esri.show(app.loading);
    //app.map.disableMapNavigation();
    //app.map.hideZoomSlider();
    $("#loadingImg").show();
}

function getPageWidth() {
    var body = document.body,
        html = document.documentElement;
    var width = Math.max(body.scrollWidth, body.offsetWidth,
        html.clientWidth, html.scrollWidth, html.offsetWidth);
    return width;
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
    //esri.hide(app.loading);
    //app.map.enableMapNavigation();
    //app.map.showZoomSlider();
    $("#loadingImg").hide();
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
    "esri/config", "esri/Map", "esri/views/MapView", "dojo/_base/declare",
    "esri/rest/support/Query", "esri/tasks/QueryTask", "esri/rest/geometryService",
    "esri/geometry/support/webMercatorUtils",
    "esri/widgets/BasemapGallery", "esri/widgets/BasemapGallery/support/PortalBasemapsSource", "esri/widgets/ScaleBar", "dojo",
    "esri/PopupTemplate", "esri/layers/FeatureLayer", "esri/Color", "esri/renderers/SimpleRenderer", "esri/layers/CSVLayer",
    "extras/MH_Zoom2FeatureLayers", "esri/renderers/UniqueValueRenderer",
    "esri/widgets/Legend", "esri/widgets/Locate", "esri/layers/GraphicsLayer",
    "esri/core/watchUtils",
    "dojo/dom", "dojo/dom-style",
], function (
    esriConfig, Map, MapView, declare, Query, QueryTask, geometryService,
    webMercatorUtils, BasemapGallery, PortalSource, ScaleBar, dojo,
    PopupTemplate, FeatureLayer, Color,
    SimpleRenderer, CSVLayer,
    MH_Zoom2FeatureLayers, UniqueValueRenderer, Legend, Locate, GraphicsLayer, watchUtils, dom, domStyle
) {

    return declare([], {
        m_pRiverSymbolsFeatureLayer: null,
        m_StreamStatusRenderer: null,

        addStreamConditionFeatureLayer: function (arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange,
            arrayOIDPlum, arrayOIDsRed) {

            ////// for each array, red takes presedence so remove OID's from non-red arrays if in Red arra
            let arrayofArrays = [arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange, arrayOIDPlum];
            let nonRedOID = null;
            let arrayItems2remove = [];
            let index2Remove = null;
            for (let i = 0; i < arrayofArrays.length; i++) {
                for (let iColor = 0; iColor < arrayofArrays[i].length; iColor++) {
                    nonRedOID = arrayofArrays[i][iColor];
                    for (let iRedOID = 0; iRedOID < arrayOIDsRed.length; iRedOID++) {
                        if (nonRedOID == arrayOIDsRed[iRedOID]) {  //remove the OID from the non-red array
                            arrayItems2remove.push(nonRedOID);
                            break;
                        }
                    }
                }
                for (let iRemove = 0; iRemove < arrayItems2remove.length; iRemove++) {
                    index2Remove = arrayofArrays[i].indexOf(arrayItems2remove[iRemove]);
                    if (index2Remove > -1) {
                        arrayofArrays[i].splice(index2Remove, 1); // 2nd parameter means remove one item only
                    }
                }
                arrayItems2remove = [];
            }
            //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            console.log("add Stream Condition FeatureLayer and custom legend")
            let strValueExpression = "";
            let arrayValueExpression = [];

            let defaultUniqueSymbolRenderer = {
                type: "unique-value",  // autocasts as new UniqueValueRenderer()
                defaultSymbol: {
                    type: "simple-line", color: [0, 169, 230], width: 1
                }  // autocasts as new SimplelineSymbol()
            };

            app.pSup.m_StreamStatusRenderer = defaultUniqueSymbolRenderer;
            app.pSup.m_StreamStatusRenderer.defaultLabel = "Stream Section (Open)";
          
            let ArrayUniqueVals2Add = []

            if (arrayOIDYellow.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDYellow.join(", ") + "], $feature.OBJECTID), 'Yellow'");
                ArrayUniqueVals2Add.push({
                    value: 'Yellow',
                    symbol: { type: "simple-line", color: [255, 255, 0], width: 18 },
                    label: "Prepare"
                });
            }

            if (arrayOIDsGold.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsGold.join(", ") + "], $feature.OBJECTID), 'Gold'");
                ArrayUniqueVals2Add.push({
                    value: 'Gold',
                    symbol: { type: "simple-line", color: [249, 166, 2], width: 18 },
                    label: "Conservation Actions"
                });
            }
            if (arrayOIDsOrange.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsOrange.join(", ") + "], $feature.OBJECTID), 'Orange'");
                ArrayUniqueVals2Add.push({
                    value: 'Orange',
                    symbol: { type: "simple-line", color: [253, 106, 2], width: 18 },
                    label: "Unofficial Closure"
                });
            }
            if (arrayOIDPlum.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDPlum.join(", ") + "], $feature.OBJECTID), 'Plum'");
                ArrayUniqueVals2Add.push({
                    value: 'Plum',
                    symbol: { type: "simple-line", color: [221, 160, 221], width: 18 },
                    label: "Hoot Owl and/or Conservation Measures"
                });
            }
            if (arrayOIDsRed.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsRed.join(", ") + "], $feature.OBJECTID), 'Red'");
                ArrayUniqueVals2Add.push({
                    value: 'Red',
                    symbol: { type: "simple-line", color: [255, 0, 0], width: 18 },
                    label: "Offical Restriction"
                });
            }

            if (ArrayUniqueVals2Add.length > 0) {  //getting an error when trying to use addUniqueValueInfo, I think due to the google chart api conflict, so using universal adding to an array then adding to the unique value renderer dictionary
                strValueExpression = "When(" + arrayValueExpression.join(", ") + ", 'other')";
                app.pSup.m_StreamStatusRenderer["valueExpression"] = strValueExpression;
                app.pSup.m_StreamStatusRenderer["uniqueValueInfos"] = ArrayUniqueVals2Add;
            }

            let featureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[5],
                outFields: ["OBJECTID"],
                renderer: app.pSup.m_StreamStatusRenderer
            });
            app.map.layers.add(featureLayer, 5);
         },

        GetSetHeaderWarningContent: function (strAGSIndexTableURL, strH2OID, blnUseAlternateHeader, strBasinID) {
			if ((typeof strH2OID == 'undefined') & (typeof strBasinID == 'undefined')) {
                strH2OID = "UMH";
			} else if ((typeof strH2OID == 'undefined') & (typeof strBasinID != 'undefined')) {
				strH2OID = strBasinID;
			} 
            strURLFieldName = "URL";
            let query = new Query();
            query.outFields = [strURLFieldName];
            let queryTask = new QueryTask(strAGSIndexTableURL);
            query.where = "Name = '" + strH2OID + "'";
            //queryTask.execute(query, showHeaderWarningContentResults);

            queryTask.execute(query).then(showHeaderWarningContentResults);

			function showHeaderWarningContentResults(results) {
				console.log("showHeaderWarningContentResults");
                var resultItems = [];
                var resultCount = results.features.length;
                for (var i = 0; i < resultCount; i++) {
                    var featureAttributes = results.features[i].attributes;
					var strGoogleSheetURL = featureAttributes[strURLFieldName];
                }

				strGoogleSheetURL += "&key=AIzaSyA2E5MNl-Hqoy36tbqHpccVpsSPYbnL5BA";

                $.get(strGoogleSheetURL)
                    .done(function (jsonResult) {
						//if (jsonResult.feed != undefined) {
						if (jsonResult != undefined) {
                            var strHeaderTxt = "";
                            var strAlertTxt = "";
                            var pEntries = jsonResult.values[1];

                            if (blnUseAlternateHeader) {
								//strHeaderTxt = pEntries[0].gsx$headeralt.$t
								strHeaderTxt = pEntries[2];
                            } else {
								strHeaderTxt = pEntries[0];
                            }

							strAlertTxt = pEntries[1];
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
            app.view.when(() => {
                console.log("resources in the MapView have loaded"); // when the resources in the MapView have loaded.
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

                    checkboxHTML.onchange = function (evt) {
                        if (clayer0.visible) {
                            clayer0.visible = false;
                            clayer1.visible = false;
                        } else {
                            clayer0.visible = true;
                            clayer1.visible = true;
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
            });
        },

		Phase1: function () {
            console.log("MH_setup Phase1");

            app.H2O_ID = getTokens()['H2O_ID'];
			app.Basin_ID = getTokens()['Basin_ID'];

			if (app.Basin_ID == "UY_Shields") {
				app.Basin_ID = "Upper Yellowstone Headwaters";
			}


            
            $("#dropDownId").append("<li><a data-value='American Whitewater Difficulty and Flow'>American Whitewater Difficulty and Flow</a></li>")
            $("#dropDownId").append("<li><a data-value='FEMA Flood Layer Hazard Viewer'>FEMA Flood Layer Hazard Viewer</a></li>")
            $("#dropDownId").append("<li><a data-value='GYE Aquatic Invasives'>GYE Aquatic Invasives</a></li>")
            $("#dropDownId").append("<li><a data-value='MT Channel Migration Zones'>Channel Migration Zones</a></li>")
            $("#dropDownId").append("<li><a data-value='MT DNRC Stream and Gage Explorer'>MT DNRC Stream and Gage Explorer</a></li>")
            $("#dropDownId").append("<li><a data-value='Official MT FWP (closures, etc.)'>Official MT FWP (closures, etc.)</a></li>")
            $("#dropDownId").append("<li><a data-value='USGS National Water Dashboard'>USGS National Water Dashboard</a></li>")

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
				//["Box Elder", "Box Elder", "Musselshell"],
				["Blackfoot", "Blackfoot", "Blackfoot-Sun"],
				["Little Wind", "Little Wind", "Bighorn"], ["Lower Wind", "Lower Wind", "Bighorn"],
				["North Fork Shoshone", "North Fork Shoshone", "Bighorn"], ["Bighorn Lake", "Bighorn Lake", "Bighorn"],
				["South Fork Shoshone", "South Fork Shoshone", "Bighorn"], ["Upper Wind", "Upper Wind", "Bighorn"],
				//["Greybull", "Greybull", "Bighorn"], ["Dry", "Dry", "Bighorn"],
				["Upper Bighorn", "Upper Bighorn", "Bighorn"], ["Upper Musselshell", "Upper Musselshell", "Musselshell"],
				["Boulder and East Boulder", "Boulder and East Boulder", "Boulder and East Boulder"],
                /*["City of Choteau - Teton River", "City of Choteau - Teton River", "Blackfoot-Sun"],*/
                ["North Fork Flathead", "North Fork Flathead", "Flathead"],
                ["Mainstem Flathead", "Mainstem Flathead", "Flathead"],
                ["Swan", "Swan", "Flathead"],
                ["Bitterroot", "Bitterroot", "Bitter Root"],
                ["Lower Flathead", "Lower Flathead", "Flathead"],
                ["Middle Fork Flathead", "Middle Fork Flathead", "Flathead"],
                ["Clarks Fork Yellowstone", "Clarks Fork Yellowstone", "Clarks Fork Yellowstone"],
                ["Rock Creek", "Rock Creek", "Clarks Fork Yellowstone"],
                ["South Fork Flathead", "South Fork Flathead", "Flathead"],
                //["Sweet Grass Creek", "Sweet Grass Creek", "test"],
                ["Stillwater", "Stillwater", "Flathead"]

            ];

			if ((app.H2O_ID == undefined) & (app.Basin_ID == undefined)) {
				app.Basin_ID = "UMH";
			}

			var arrayNavList = [];
			if (app.Basin_ID == "all") {
				arrayNavList = app.arrayEntireList;
				app.H2O_ID = undefined;
                app.Basin_ID = undefined;

                document.getElementById("bdy1").style["paddingTop"] = "130px";
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
                                    ["Flathead", "Flathead"],
                                    ["Clarks Fork Yellowstone", "Clarks Fork Yellowstone"],
                                    ["Boulder and East Boulder", "Boulder and East Boulder"],
                                    ["Blackfoot-Sun", "Blackfoot-Sun"],
                                    ["Bitterroot", "Bitter Root"],
                                    ["Bighorn", "Bighorn"],
                                    ["All", "all"]
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

            
			//app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/RCT_Support/FeatureServer/";  //PRODUCTION
            app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/RCT_Support_FY22/FeatureServer/";  //PRODUCTION
            app.idx11 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];  //PRODUCTION

            //app.strHFL_URL = "https://services.arcgis.com/9ecg2KpMLcsUv1Oh/arcgis/rest/services/RCT_2022_Initial_Update/FeatureServer/";  //Melissa dev
            //app.idx11 = ["0", "1", "2", "3", "6", "9", "8", "10", "11", "12", "13", "15"];  //Melissa dev

            this.GetSetHeaderWarningContent(app.strHFL_URL + app.idx11[11], app.H2O_ID, blnUseAlternateHeader, app.Basin_ID);
        },

        Phase2: function () {

            if (typeof app.H2O_ID != 'undefined') {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 10;
            } else {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 11;
            }
                        
            esriConfig.apiKey = "AAPK47ae32508072459cb3fa84646f0f3928F7dRMTNaroq-OYC7WBC-O1R3frCJVtlOtnnJ-hSUIKUXJPaglsAO9sQ4AxRYBPy_";

            app.map = new Map({ basemap: "arcgis-topographic" }); // Basemap layer
            app.view = new MapView({  //app.map = BootstrapMap.create("mapDiv", { basemap: "topo", center: arrayCenterZoom, zoom: izoomVal, scrollWheelZoom: false});// Get a reference to the ArcGIS Map class
                map: app.map,
                center: arrayCenterZoom,
                zoom: izoomVal, // scale: 72223.819286
                container: "mapDiv",
                constraints: {
                    snapToZoom: false
                }
            });

            const locateBtn = new Locate({
                view: app.view
            });
            app.view.ui.add(locateBtn, {
                position: "top-left"
            });

            let iPateWidth = getPageWidth();
            domStyle.set("mapDiv", "height", iPateWidth - 50 + "px");  //change map height on open based on width - 50,  bootstrap/ESRI map width changes automatically on open but height does not

            app.view.watch("widthBreakpoint", function (newVal) {
                if (newVal === "xsmall") {
                    console.log("resized", "");
                }
                if (newVal === "small") {
                    console.log("resized", "");
                }
            });

            app.view.when(function () {
                mapLoaded();
            })
            
            const allowedBasemapTitles = ["Imagery Hybrid", "Topographic", "Dark Gray Canvas"];
            const source = new PortalSource({                // filtering portal basemaps
                filterFunction: (basemap) => allowedBasemapTitles.indexOf(basemap.portalItem.title) > -1
            });
            const basemapGallery = new BasemapGallery({
                showArcGISBasemaps: true,
                view: app.view,
                source: source
            }, "basemapGallery");
                        
            let scaleBar = new ScaleBar({
                view: app.view,
                container: "scaleDiv",
                unit: "dual"
            });
            
            app.loading = dojo.byId("loadingImg");  //loading image. id

            app.view.watch('updating', function (evt) {
                if (evt === true) {
                    showLoading();
                } else {
                    hideLoading();
                }
            })

            let template = new PopupTemplate();
            template.title = "Gage (Watershed:{Watershed})";
            template.content = "<b>{GageTitle}</b><br><a href={GageURL} target='_blank'>Link to gage at {Agency} website</a>";
            //var pGageFeatureLayer = new FeatureLayer({ url: app.strHFL_URL + "1", popupTemplate: template });
            var pGageFeatureLayer = new FeatureLayer({ url: app.strHFL_URL + app.idx11[1], popupTemplate: template });
            

            var templateEPOINT = new PopupTemplate();
            templateEPOINT.title = "<b>Start/End Section Locations</b>";
            templateEPOINT.content = "Placename:{Endpoint_Name}<br>Section:{Start_End} of {Section_Name}<br>Stream:{Stream_Name}<br>";

            const EndPoints_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: [255, 26, 238],
                    font: {  // autocast as new Font()
                        family: "arial",
                        size: 9,
                        weight: "bold"
                    }
                },
                labelPlacement: "above-center",
                labelExpressionInfo: {
                    expression: "$feature.Start_End + ' of ' + $feature.Section_Name"
                },
                minScale: 600000
            };

            pEPointsFeatureLayer = new FeatureLayer({
                //url: app.strHFL_URL + "0",
                url: app.strHFL_URL + app.idx11[0],
                popupTemplate: templateEPOINT,
                minScale: 1000000,
                labelingInfo: [EndPoints_labelClass]
            });
            let strQueryDef1 = "1=1";
            let strQueryDef2 = "1=1";
            let strQueryDef3 = "";
            let strQueryDef4 = "Name in ('')";
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

            //let strlabelField3 = "SectionID";
            let strlabelField3 = "SectionName";
            const Secitons_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: new Color([0, 0, 128]),
                    font: { family: "arial", size: 10 },
                    setAlign: { setAngle: 45 }
                },
                labelPlacement: "center-along",
                labelRotation: false,
                labelExpressionInfo: { expression: "$feature." + strlabelField3 },
                minScale: 1500000
            };

            app.SectionQryStringGetGageData = strQueryDef2;
            pEPointsFeatureLayer.definitionExpression = strQueryDef1;

            pSectionsFeatureLayer = new FeatureLayer({
                //url: app.strHFL_URL + "5",
                url: app.strHFL_URL + app.idx11[5],
                opacity: 0.9,
                labelingInfo: [Secitons_labelClass], outFields: ["StreamName", "SectionID", "SectionName"]
            });
            pSectionsFeatureLayer.definitionExpression = strQueryDef2;
            app.pGetWarn.m_strSteamSectionQuery = strQueryDef2;

            pBasinsFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[8],
                opacity: 0.5
            });
            //pBasinsFeatureLayer = new FeatureLayer({ url: app.strHFL_URL + "8", opacity: 0.5 });
            

            if (app.Basin_ID != undefined) {
				if (app.Basin_ID == "UMH") {
                    pBasinsFeatureLayer.definitionExpression = "Name = 'Upper Missouri Headwaters'";
				} else {
                    pBasinsFeatureLayer.definitionExpression = "Name = '" + app.Basin_ID + "'";
				}
			}

            let vColor22 = new Color("#3F3F40");

            let templateFAS = new PopupTemplate();
            templateFAS.title = "MT FAS (Fishing Access Site)";
            templateFAS.content = "<b>{NAME}</b><br>{BOAT_FAC}<br><a href={WEB_PAGE} target='_blank'>Link to Fish Access Site</a>";
            const FAS_labelClass = {// autocasts as new LabelClass()
                symbol: {type: "text", color: vColor22,
                            font: { family: "arial", size: 9, weight: "bold" }
                },
                labelPlacement: "above-center",
                labelExpressionInfo: {expression: "$feature.NAME"}
            };
            let pFASFeatureLayer = new FeatureLayer({url: "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FWPLND_FAS_POINTS/FeatureServer/0",
                popupTemplate: templateFAS,
                opacity: 0.5,
                visible: false,
                labelingInfo: [FAS_labelClass]
            });

            let vDarkGreyColor = new Color("#3F3F40");

            let templateBLM = new PopupTemplate();
            templateBLM.title = "<b>BLM Facility</b>";
            templateBLM.content = "{Facility_Name}<br><a href={URL} target='_blank'>Link to BLM Facility</a>";
            const BLM_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: vDarkGreyColor,
                    font: { family: "arial", size: 9}
                },
                labelPlacement: "above-center",
                labelExpressionInfo: { expression: "$feature.Facility_Name" }
            };
            let pBLMFeatureLayer = new FeatureLayer({
                //url: app.strHFL_URL + "2",
                url: app.strHFL_URL + app.idx11[2],
                popupTemplate: templateBLM, opacity: 0.5,
                visible: false, labelingInfo: [BLM_labelClass]
            });

            var templateFWPAISAccess = new PopupTemplate();
            templateFWPAISAccess.title = "Montana AIS Watercraft Access";
            templateFWPAISAccess.content = "{SITENAME}</br>{ACCESSTYPE}</br>{WATERBODY}</br>{STATUS}</b>";
            var pFWPAISAccessFeatureLayer = new FeatureLayer({
                url: "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FISH_AIS_WATERCRAFT_ACCESS/FeatureServer/0",
                popupTemplate: templateFWPAISAccess, minScale: 5200000, visible: false });


            var templateSNOTEL = new PopupTemplate();
            templateSNOTEL.title = "<b>{Name} {SitePageURL} SNOTEL Site</b>";
            var strSNOTELGraphURL = "https://wcc.sc.egov.usda.gov/nwcc/view?intervalType=+View+Current+&report=WYGRAPH&timeseries=Daily&format=plot&sitenum={stationID}&interval=WATERYEAR";
            templateSNOTEL.content = "<a href={SitePageURL} target='_blank'>Link to SNOTEL Site Page</a><br><a href=" + strSNOTELGraphURL + " target='_blank'>Link to SWE Current/Historical Graphs</a> ";

            const SNOTEL_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: vDarkGreyColor,
                    font: { family: "arial", size: 9, weight: "bold" }
                },
                labelPlacement: "above-center",
                labelExpressionInfo: { expression: "$feature.Name" }
            };
            let pSNOTELFeatureLayer = new FeatureLayer({
                //url: app.strHFL_URL + "3",
                url: app.strHFL_URL + app.idx11[3],
                popupTemplate: templateSNOTEL, visible: false,
                labelingInfo: [SNOTEL_labelClass]
            });

            let templateNOAA = new PopupTemplate();
            templateNOAA.title = "<b>Weather Station</b>";
            templateNOAA.content = "<b>{STNNAME}</b>({OWNER})<br><a href={URL} target='_blank'>More info...</a>";

            const NOAA_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text", color: vDarkGreyColor,
                    font: { family: "arial", size: 9, weight: "bold" }
                },
                labelPlacement: "above-center",
                labelExpressionInfo: { expression: "$feature.STNNAME" }
            };
            let pNOAAFeatureLayer = new FeatureLayer({
                url: "https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/obs_meteoceanhydro_insitu_pts_geolinks/MapServer/1",
                popupTemplate: templateNOAA,
                visible: false,
                labelingInfo: [NOAA_labelClass]
            });

            let templateFWP = new PopupTemplate();
            templateFWP.title = "Official Stream Restriction";
            templateFWP.content = "<b>{TITLE}</b><br>{WATERBODY}<br>{DESCRIPTION} Publish Date:{PUBLISHDATE}";
            app.strFWPURL = "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/ArcGIS/rest/services/FISH_WATERBODY_RESTRICTIONS/FeatureServer/0";

			var dteDateTime = new Date();
			var strDateTime = dteDateTime.getFullYear() + "-" + ("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTime.getDate()).slice(-2);
			var strDateTimeUserFreindly = (dteDateTime.getMonth() + 1) + "/" + dteDateTime.getDate() + "/" + dteDateTime.getFullYear();
			var dteDateTimeMinus3 = new Date();
			dteDateTimeMinus3.setDate(dteDateTimeMinus3.getDate() - 3);
			var strDateTimeMinus3 = dteDateTimeMinus3.getFullYear() + "-" + ("0" + (dteDateTimeMinus3.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTimeMinus3.getDate()).slice(-2);
			var strDateTimeMinus3UserFreindly = (dteDateTimeMinus3.getMonth() + 1) + "/" + dteDateTimeMinus3.getDate() + "/" + dteDateTimeMinus3.getFullYear();

            if (app.test) {                //app.strFWPURL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/TestH2ORest/FeatureServer/0";
                app.strFWPQuery = "(PUBLISHDATE > '7/15/2017') AND (PUBLISHDATE < '7/20/2017')";
            } else {
				app.strFWPQuery = "(ARCHIVEDATE IS NULL) OR (ARCHIVEDATE > '" + strDateTimeUserFreindly + "')";
            }
			            
            let sfsr_FWP = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: {
                    type: "simple-fill", color: [255, 0, 0, 0.25], style: "solid",
                    outline: { color: [255, 0, 0], width: 5 }
                },  
            };

            let pFWPFeatureLayer = new FeatureLayer({
                url: app.strFWPURL,
                popupTemplate: templateFWP, "opacity": 0.6, renderer: sfsr_FWP, visible: true
            });
            pFWPFeatureLayer.definitionExpression = app.strFWPQuery;

            let pCartoFeatureLayer = new FeatureLayer({ url: app.strHFL_URL + app.idx11[4],  "opacity": 0.9, autoGeneralize: true});
            let pCartoFeatureLayerPoly = new FeatureLayer({ url: app.strHFL_URL + app.idx11[6], "opacity": 0.9, autoGeneralize: true});


            //////////////////////////
            let sfsr_MTSP = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: { // autocasts as new SimpleFillSymbol()
                    type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                    color: [57, 168, 87, 0.45],
                    style: "solid",
                    outline: {  // autocasts as new SimpleLineSymbol()
                        color: [29, 112, 52],
                        width: 0.1
                    }
                },
            };

            let strlabelField11 = "Name";
            var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
            const MTSP_labelClass = {// autocasts as new LabelClass()
                symbol: { type: "text", color: [29, 112, 52], font: { family: "arial", size: 9 }},
                labelExpressionInfo: { expression: "$feature." + strlabelField11 },
                minScale: 2000000
            };

            var templateMTSP= new PopupTemplate();
            templateMTSP.title = "Montana State Parks";
            templateMTSP.content = "{NAME} <a href={WEB_PAGE} target='_blank'>(link here)</a></br>{BOAT_FAC}</br>{STATUS}</b>";


            let pMTSPFeatureLayer = new FeatureLayer({
                url: "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/ArcGIS/rest/services/FWPLND_STATEPARKS/FeatureServer/0",
                renderer: sfsr_MTSP, "opacity": 0.9, autoGeneralize: true,
                outFields: [strlabelField11], labelingInfo: [MTSP_labelClass], popupTemplate: templateMTSP
            });

            //////////////////////////

            let sfsr_Waterhsed = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: { // autocasts as new SimpleFillSymbol()
                    type: "simple-fill", color: [255, 255, 255, 0.10], style: "solid",
                    outline: { color: [0, 72, 118], width: 2 }
                },
            };

            let strlabelField1 = "Name";
            var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
            const Watershed_labelClass = {// autocasts as new LabelClass()
                symbol: { type: "text", color: vGreyColor, font: { family: "arial", size: 10 }},
                labelExpressionInfo: { expression: "$feature." + strlabelField1 }
            };

            let pWatershedsFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[9],
                renderer: sfsr_Waterhsed, "opacity": 0.9, autoGeneralize: true,
                outFields: [strlabelField1], labelingInfo: [Watershed_labelClass]
            });
            pWatershedsFeatureLayer.definitionExpression = strQueryDef3;

            //////////////////////////


            let sfsr_Mask = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: { // autocasts as new SimpleFillSymbol()
                    type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                    color: [9, 60, 114, 0.25],
                    style: "solid", outline: { color: [200, 200, 200], width: 2 }
                },
            };

            const WaterShedMask_labelClass = {
                symbol: {
                    type: "text",
                    color: [69,91,128],
                    font: {
                        family: "arial",
                        size: 9
                    }
                },
                labelExpressionInfo: {
                    expression: "$feature.Name + ' Watershed Area'"
                },
                minScale: 2000000
            }

            let pWatershedsMaskFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[9],
                renderer: sfsr_Mask, "opacity": 0.5, autoGeneralize: true,
                outFields: [strlabelField1],
                labelingInfo: [WaterShedMask_labelClass]
            });
            pWatershedsMaskFeatureLayer.definitionExpression = strQueryDef4;

            let sfsr_BasinMask = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: { // autocasts as new SimpleFillSymbol()
                    type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                    color: [26, 90, 158, 0.45],
                    style: "solid",
                    outline: {  // autocasts as new SimpleLineSymbol()
                        color: [200, 200, 200],
                        width: 0.1
                    }
                },
            };

            var pBasinsMaskFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[9],
                "opacity": 0.7, autoGeneralize: true, renderer: sfsr_BasinMask
            });
            pBasinsMaskFeatureLayer.definitionExpression = "Basin IS NULL";
            
            app.pSup.m_pRiverSymbolsFeatureLayer = new FeatureLayer({
                //url: app.strHFL_URL + "10",
                url: app.strHFL_URL + app.idx11[10],
                visible: true
            });

            let CSV_Renderer = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: {
                    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                    size: 15,
                    color: [238, 69, 0, 0.5], //orangeRed
                    outline: {  // autocasts as new SimpleLineSymbol()
                        width: 0.5,
                        color: "white"
                    }
                }
            };
            var pCSVTemplate = new PopupTemplate();
            pCSVTemplate.title = "<b>Monitoring Sites</b>";
            pCSVTemplate.content = "Station Name: {STATION_NAME}<br>Drainage Name: {Drainage_Name}<br><a href={URL} target='_blank'> Link monitoring data</a>";
            let pMonitoringCSVLayer = new CSVLayer({
                url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTw0rCwCLxDg2jCLLCscILrMDMGBbInS1KmwH76CPyqVYqFolKdOfw0J4DIaJhWoPDPkwVNQI_Y7OeX/pub?output=csv",
                visible: false,
                renderer: CSV_Renderer,
                popupTemplate: pCSVTemplate
            });
            if (app.Basin_ID == "Flathead") {
                pMonitoringCSVLayer.visible = "True";
            }



            app.graphicsLayer = new GraphicsLayer();

            app.map.layers.addMany([app.pSup.m_pRiverSymbolsFeatureLayer, pWatershedsMaskFeatureLayer, pBasinsMaskFeatureLayer,
                pWatershedsFeatureLayer, pBasinsFeatureLayer, pMTSPFeatureLayer, pCartoFeatureLayer, pCartoFeatureLayerPoly,
                pSectionsFeatureLayer, pSNOTELFeatureLayer, pNOAAFeatureLayer, pFWPAISAccessFeatureLayer, pFWPFeatureLayer,
                pBLMFeatureLayer, pFASFeatureLayer, pGageFeatureLayer, pEPointsFeatureLayer,
                pMonitoringCSVLayer, app.graphicsLayer]);

            app.pZoom = new MH_Zoom2FeatureLayers({}); // instantiate the class
            app.dblExpandNum = 0.5;

            document.getElementById("txtFromToDate").innerHTML = "Conditions based on the last 3 days (" + strDateTimeMinus3UserFreindly.toString() + "-" + strDateTimeUserFreindly.toString() + ")";
            app.pGage.Start(strDateTimeMinus3, strDateTime);

            let legendLayers = [];
            legendLayers.push({ layer: pMonitoringCSVLayer, title: 'Monitoring Locations' });
            legendLayers.push({ layer: pFWPAISAccessFeatureLayer, title: 'MT AIS Watercraft Access' });
            legendLayers.push({ layer: pMTSPFeatureLayer, title: 'MT State Parks' });
            legendLayers.push({ layer: pSNOTELFeatureLayer, title: 'SNOTEL Sites' });
            legendLayers.push({ layer: pNOAAFeatureLayer, title: 'Weather Stations' });
            legendLayers.push({ layer: pFASFeatureLayer, title: 'FWP Fish Access Sites' });
            legendLayers.push({ layer: pBLMFeatureLayer, title: 'BLM Access Sites' });
            legendLayers.push({ layer: pEPointsFeatureLayer, title: 'Start/End Section Locations' });
            legendLayers.push({ layer: pGageFeatureLayer, title: 'Gages' });
            legendLayers.push({ layer: app.pSup.m_pRiverSymbolsFeatureLayer, title: 'River Status' });

            if (app.test) {
                legendLayers.push({ layer: app.pSup.m_pFWPFeatureLayer, title: 'Test Condition Messaging' });
            }
            else {
                legendLayers.push({ layer: app.pSup.m_pFWPFeatureLayer, title: 'MT Waterbody Restrictions' });
            }

            app.legend = new Legend({
                view: app.view,
                layerInfos: legendLayers,
                container: "legendDiv"
            });

            var cbxLayers = [];
            cbxLayers.push({ layers: [pBLMFeatureLayer, pBLMFeatureLayer], title: 'BLM Access Sites' });
            cbxLayers.push({ layers: [pFASFeatureLayer, pFASFeatureLayer], title: 'MT FWP Fishing Access Sites' });
            cbxLayers.push({ layers: [pSNOTELFeatureLayer, pSNOTELFeatureLayer], title: 'SNOTEL Sites' });
            cbxLayers.push({ layers: [pNOAAFeatureLayer, pNOAAFeatureLayer], title: 'Weather Stations' });
            cbxLayers.push({ layers: [pFWPAISAccessFeatureLayer, pFWPAISAccessFeatureLayer], title: 'MT AIS Watercraft Access' });
            cbxLayers.push({ layers: [pMonitoringCSVLayer, pMonitoringCSVLayer], title: 'Monitoring Locations' });
            cbxLayers.push({ layers: [pMTSPFeatureLayer, pMTSPFeatureLayer], title: 'MT State Parks' });
            /*cbxLayers.push({ layers: [pCZMFeatureLayer, pCZMFeatureLayer], title: 'Channel Migration Zones' });*/
            
			this.LayerCheckBoxSetup(cbxLayers);


            SetupStreamClick();

            ko.bindingHandlers.googleBarChart = {
                init: function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
					var chart = new google.visualization.LineChart(element);
					ko.utils.domData.set(element, 'googleLineChart', chart);
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var value1 = ko.unwrap(valueAccessor());
                    //////////////////////////////////// reorder the data columns to put no-data columns to the end
                    var value = new google.visualization.DataView(value1);// build data view
                    let arryNoDataColumns = [];
                    let arryDataColumns = [];
                    let strColName = "";
                    for (ic = 0; ic < value.getNumberOfColumns(); ic++) {  //find columns that have no data
                        if (ic == 0) {
                            arryDataColumns.push(value.getColumnLabel(ic))
                        } else {
                            strColName = value.getColumnLabel(ic);
                            if (strColName.indexOf("No Data") > 0) {
                                arryNoDataColumns.push(value.getColumnLabel(ic))
                            } else {
                                arryDataColumns.push(value.getColumnLabel(ic))
                            }
                        }
                    }
                    for (iic = 0; iic < arryNoDataColumns.length; iic++) {  //add the columns with no data to the back of the array
                        arryDataColumns.push(arryNoDataColumns[iic])
                    }
                    value.setColumns(arryDataColumns);
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    var tickMarks = [];
                    var strTitle = "";

                    if ((value.getColumnLabel(0) == "DatetimeTMP") | (value.getColumnLabel(0) == "DatetimeTMPSingle")) {
                        strTitle = "Stream Temperature (F)"
                    }
                    else if ((value.getColumnLabel(0) == "DatetimeCFS") | (value.getColumnLabel(0) == "DatetimeCFSSingle")) {
                        strTitle = "Stream Section Discharge (CFS)"
                    }
                    else if ((value.getColumnLabel(0) == "DatetimeHt") | (value.getColumnLabel(0) == "DatetimeHtSingle")) {
                        strTitle = "Gage Height (ft)"
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
                    //}
                    //else if (value.getColumnLabel(0) == "DatetimeHt") {
                    //    options.trendlines = { 0: {} };
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
                    } else if ((value.getColumnLabel(0) == "DatetimeHtSingle") |
                                                        (value.getColumnLabel(0) == "DatetimeCFSSingle")) {
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
                        } else if ((value.getNumberOfColumns() == 3) & (value.getColumnLabel(0) == "DatetimeCFSSingle")) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 8 }  //dark orange
                                //1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#df7206', ////dark orange
                                '#61605f']; ///dark grey
                        } else if ((value.getNumberOfColumns() == 3) & (value.getColumnLabel(0) == "DatetimeHtSingle")) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                //1: { lineWidth: 8 }  //dark orange
                                1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        }

                        let strTrendLinePrefix = "Gage Ht";
                        if (value.getColumnLabel(0) == "DatetimeCFSSingle") {
                            strTrendLinePrefix = "CFS";
                        }

                        var options4ChartAreaTrendlines = {
                            0: {
                                labelInLegend: strTrendLinePrefix + ' Trend Line',
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

			var iMapOrientation = app.map.width / app.map.height;
			app.dblExpandNum = 0.5;

			if (typeof app.H2O_ID != 'undefined') {
				if ((iMapOrientation > 1.5) & ((app.H2O_ID == "Madison") |
					(app.H2O_ID == "Boulder") |
					(app.H2O_ID == "Ruby") |
					(app.H2O_ID == "Sun") |
					(app.H2O_ID == "Blackfoot") |
					(app.H2O_ID == "Lower Bighorn") |
					(app.H2O_ID == "Little Bighorn") |
					(app.H2O_ID == "Little Wind") |
					(app.H2O_ID == "Lower Wind") |
					(app.H2O_ID == "Shoshone") |
					(app.H2O_ID == "North Fork Shoshone") |
					(app.H2O_ID == "South Fork Shoshone") |
					(app.H2O_ID == "Bighorn Lake") |
					(app.H2O_ID == "Upper Wind") |
					(app.H2O_ID == "Upper Bighorn") |
					(app.H2O_ID == "Upper Gallatin") |
					(app.H2O_ID == "Lower Gallatin"))) {
                    app.dblExpandNum = 1;
				} else if ((app.H2O_ID == "Broadwater") |
					(app.H2O_ID == "Sun") |
					(app.H2O_ID == "Blackfoot") |
					(app.H2O_ID == "Shields") |
					(app.H2O_ID == "Little Bighorn") |
					(app.H2O_ID == "Little Wind") |
					(app.H2O_ID == "Lower Wind") |
					(app.H2O_ID == "Shoshone") |
					(app.H2O_ID == "North Fork Shoshone") |
					(app.H2O_ID == "South Fork Shoshone") |
					(app.H2O_ID == "Bighorn Lake") |
					(app.H2O_ID == "Upper Wind") |
					(app.H2O_ID == "Lower Bighorn") |
					(app.H2O_ID == "Upper Bighorn") |
					(app.H2O_ID == "Boulder")) {
                    app.dblExpandNum = 1;
                }

                app.pZoom.qry_Zoom2FeatureLayerExtent(pWatershedsFeatureLayer, "OBJECTID");
            } else {
				if (typeof app.Basin_ID != 'undefined') {
					if ((iMapOrientation > 1.5) & ((app.Basin_ID == "Musselshell") |
						(app.Basin_ID == "Blackfoot-Sun") |
						(app.Basin_ID == "Boulder and East Boulder") |
						(app.Basin_ID == "Bighorn"))) {
						app.dblExpandNum = 1;
					} else if ((app.Basin_ID == "Musselshell") |
						(app.Basin_ID == "Blackfoot-Sun") |
						(app.Basin_ID == "Boulder and East Boulder") |
						(app.Basin_ID == "Bighorn")) {
						app.dblExpandNum = 1;
					}

					app.pZoom.qry_Zoom2FeatureLayerExtent(pWatershedsFeatureLayer, "OBJECTID");
				} else {
					app.pZoom.qry_Zoom2FeatureLayerExtent(pBasinsFeatureLayer, "FID");
				}
            }

            function err(err) {
                console.log("Failed to get stat results due to an error: ", err);
            }

            function mapLoaded() {        // map loaded//            // Map is ready
                app.view.on("pointer-move", (evt) => {
                    /*console.log(evt.x, evt.y);*/
                    var point = app.view.toMap(evt);
                    var mp = webMercatorUtils.webMercatorToGeographic(point);  //the map is in web mercator but display coordinates in geographic (lat, long)
                    dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.y.toFixed(4) + "<br>Longitude:" + mp.x.toFixed(4);  //display mouse coordinates
                }); //after map loads, connect to listen to mouse move & drag events
                console.log("maploaded")
            }

            function SetupStreamClick() {
                app.view.on("pointer-down", (event) => {
                    const opts = {
                        include: pSectionsFeatureLayer// only include graphics from pSectionsFeatureLayer in the hitTest
                    }

                    app.view.hitTest(event, opts).then((response) => {
                        if (response.results.length) {// check if a feature is returned from the pSectionsFeatureLayer
                            showResults(response.results);
                        }
                    });
                });

            }

			function showResults(pFeatures) {
				console.log("showResults from click")
                dojo.forEach(pFeatures, function (feature) {
                    var strStreamName = feature.graphic.attributes.StreamName;
                    var strSectionID = feature.graphic.attributes.SectionID;
                    var elements = document.getElementsByTagName('tr');  //Sets the click event for the row
                    for (var i = 0; i < elements.length; i++) {
                        var strTempText = (elements)[i].innerHTML;  //parse the section summary text to set var's for charting and zooming
                        strTempText = strTempText.substring(strTempText.indexOf("StreamName") + ("StreamName".length + 2), strTempText.length);
                        var strClickStreamName = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("SectionID") + ("SectionID".length + 2), strTempText.length);
                        var strClickSegmentID = strTempText.substring(0, strTempText.indexOf("</span>"));
                        
                        if ((strStreamName == strClickStreamName) & (strClickSegmentID == strSectionID)) {
                            //var graphic = feature.graphic;
                            //const lineSymbol = {
                            //    type: "simple-line", // autocasts as new SimpleFillSymbol()
                            //    color: [232, 104, 80], width: 18
                            //};
                            //graphic.Symbol = lineSymbol;
                            //graphic.attributes = { streamsectionClicked: true };
                            //setInterval(() => {
                            //    graphic.visible = !graphic.visible;
                            //}, 1000);

                            //app.view.graphics.removeAll(); // make sure to remmove previous highlighted feature
                            //app.view.graphics.add(graphic);

                            (elements)[i].click();

                            break;
                        }

                    }
                });
            }

        },

        Phase3: function (pArrayOIDYellow, pArrayOIDsGold, pArrayOIDsOrange, pArrayOIDsPlum, pArrayOIDsRed) {  //creating this phase 3 to create legend items for river status based on the summarized data
            try {
                app.pSup.m_pRiverSymbolsFeatureLayer.renderer = app.pSup.m_StreamStatusRenderer;
			}
			catch (err) {
				console.log("Phase3 legendlayers issue::", err.message);
				$("#divShowHideLegendBtn").hide;
			}


            $('#dropDownId a').click(function () {
                let strSelectedText = $(this).text();
                //$('#selected').text($(this).text());
                let blnAddCoords = false;
                let blnAddCoordsUSGS = false;
                let strURL;
                var pExtent = app.view.extent;

                if (strSelectedText == "Channel Migration Zones") {
                    strURL = "https://montana.maps.arcgis.com/home/webmap/viewer.html?webmap=f59d958f8ec94e70b5a0bff9bb7dacae&extent=";
                    blnAddCoords = true;
                }
                if (strSelectedText == "FEMA Flood Layer Hazard Viewer") {
                    strURL = "https://hazards-fema.maps.arcgis.com/apps/webappviewer/index.html?id=8b0adb51996444d4879338b5529aa9cd&extent=";
                    blnAddCoords = true;
                }

                if (strSelectedText == "MT DNRC Stream and Gage Explorer") {
                    strURL = "https://gis.dnrc.mt.gov/apps/StAGE/index.html?extent=";
                    blnAddCoords = true;
                }

                if (strSelectedText == "American Whitewater Difficulty and Flow") {
                    strURL = "https://www.americanwhitewater.org/content/River/view/river-index";
                    blnAddCoords = false;
                }

                if (strSelectedText == "USGS National Water Dashboard") {
                    //strURL = "https://hazards-fema.maps.arcgis.com/apps/webappviewer/index.html?id=8b0adb51996444d4879338b5529aa9cd&extent=";
                    blnAddCoords = false;
                    pSR_WKID = pExtent.spatialReference.wkid;
                    strURL = "https://dashboard.waterdata.usgs.gov/app/nwd/?view=%7B%22basemap%22%3A%22EsriTopo%22,%22bounds%22%3A%22";
                    var pGeogExtent = webMercatorUtils.webMercatorToGeographic(pExtent);  //the map is in web mercator but display coordinates in geographic (lat, long)
                    strURL += Math.round(pGeogExtent.xmin * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.ymin * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.xmax * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.ymax * 100) / 100;
                    strURL += '","panelRange"%3A"0%3A1.0,1%3A1.0,2%3A1.0,3%3A1.0,4%3A1.0,5%3A1.0,6%3A1.0,7%3A0.8,8%3A0.3,9%3A0.5,10%3A0.5,11%3A0.5,12%3A0.5,13%3A0.5,14%3A0.5,15%3A0.5,16%3A1.0,17%3A1.0,18%3A1.0,19%3A1.0"';
                    //strURL += ',"panelSelect"%3A"0%3A0,1%3A0,2%3A0,3%3A0,4%3A0,5%3A0,6%3A0,7%3A0,8%3A0,9%3A0,10%3A0,11%3A0,12%3A0,13%3A0,14%3A0,15%3A0,16%3A0,17%3A0,18%3A0"';
                    strURL += ',"panelCheckbox"%3A"0,9,19,20,21,22"';
                    strURL += '%7D&aoi=default';
                    //strURL += '","insetmap"%3Afalse,"panelRange"%3A"0%3A1.0,1%3A1.0,2%3A1.0,3%3A1.0,4%3A1.0,5%3A1.0,6%3A1.0,7%3A0.8,8%3A0.3,9%3A0.5,10%3A0.5,11%3A0.5,12%3A0.5,13%3A0.5,14%3A0.5,15%3A0.5,16%3A1.0,17%3A1.0,18%3A1.0,19%3A1.0","panelSelect"%3A"0%3A0,1%3A0,2%3A0,3%3A0,4%3A0,5%3A0,6%3A0,7%3A0,8%3A0,9%3A0,10%3A0,11%3A0,12%3A0,13%3A0,14%3A0,15%3A0,16%3A0,17%3A0,18%3A0","panelCheckbox"%3A"0,9,19,20,21,22"%7D&aoi=default';
                }

                if (strSelectedText == "Official MT FWP (closures, etc.)") {
                    strURL = "https://experience.arcgis.com/experience/ba378e9a50ec4d53bbe92e406b647d3e";
                    blnAddCoords = false;
                }
                if (strSelectedText == "GYE Aquatic Invasives") {
                    blnAddCoords = false;
                    pSR_WKID = pExtent.spatialReference.wkid;
                    strURL = "https://gagecarto.github.io/aquaticInvasiveExplorer/index.html#bnds=";
                    var pGeogExtent = webMercatorUtils.webMercatorToGeographic(pExtent);  //the map is in web mercator but display coordinates in geographic (lat, long)
                    strURL += Math.round(pGeogExtent.xmin * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.ymin * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.xmax * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.ymax * 100) / 100;
                }
                

                if (blnAddCoords) {
                    pSR_WKID = pExtent.spatialReference.wkid;
                    strURL += pExtent.xmin + ",";
                    strURL += pExtent.ymin + ",";
                    strURL += pExtent.xmax + ",";
                    strURL += pExtent.ymax + ",";
                    strURL += pSR_WKID.toString();
                }

                window.open(strURL);
            });


			//$("#btnJump2FEMA").click(function () {
   //             var pExtent = app.view.extent;
			//	pSR_WKID = pExtent.spatialReference.wkid;
			//	var strURL = "https://hazards-fema.maps.arcgis.com/apps/webappviewer/index.html?id=8b0adb51996444d4879338b5529aa9cd&extent=";
			//	strURL += pExtent.xmin + ",";
			//	strURL += pExtent.ymin + ",";
			//	strURL += pExtent.xmax + ",";
			//	strURL += pExtent.ymax + ",";
			//	strURL += pSR_WKID.toString();
			//	window.open(strURL);
			//});


			
			//$("#btnJump2GYIAIS").click(function () {
			//	var pExtent = app.map.extent;
			//	pSR_WKID = pExtent.spatialReference.wkid;
			//	var strURL = "https://gagecarto.github.io/aquaticInvasiveExplorer/index.html#bnds=";
			//	var pGeogExtent = webMercatorUtils.webMercatorToGeographic(pExtent);  //the map is in web mercator but display coordinates in geographic (lat, long)
			//	strURL += Math.round(pGeogExtent.xmin * 100) / 100 + ",";
			//	strURL += Math.round(pGeogExtent.ymin * 100) / 100 + ",";
			//	strURL += Math.round(pGeogExtent.xmax * 100) / 100 + ",";
			//	strURL += Math.round(pGeogExtent.ymax * 100) / 100;
			//	//strURL += pSR_WKID.toString();
			//	window.open(strURL);
			//});

			//$("#btnJump2FWP").click(function () {
			//	var pExtent = app.map.extent;
			//	pSR_WKID = pExtent.spatialReference.wkid;
			//	var strURL = "http://fwp.mt.gov/gis/maps/fishingGuide/index.html";
			//	window.open(strURL);
			//});

		},

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);