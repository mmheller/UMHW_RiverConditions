function formatDate2(value) {
    if (value) {
        var inputDate = new Date(value);
        return dojo.date.locale.format(inputDate, {
            selector: 'date',
			datePattern: 'yyyy, MM/dd'
        });


    } else {
        return "";
    }
}

function stripHTML(html) {
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}


//Explore drilldown examples https://js.devexpress.com/Demos/WidgetsGallery/Demo/Charts/ChartsDrillDown/Knockout/Light/

define([
	"esri/rest/query",
	"esri/rest/support/Query",
	"esri/geometry/Polyline",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"esri/request",
	"dojo/promise/all",
	"dojo/promise/all",
	"esri/request", "dojo/_base/array", 
	"dojo/dom",
	"dojo/dom-class",
	"dijit/registry",
	"dojo/on",

], function (
		query, Query, Polyline, declare, lang, esriRequest, all, All, request, dom, domClass, registry, on
) {

    return declare([], {
        m_streamSectionArrray: [],
        m_strSteamSectionQuery: "",
        m_FWPWarnFeatures: [],
        m_StepThruCounter: 0,

		Start: function (strClickStreamName, strClickSegmentID) {
			let queryObject = new Query();
			queryObject.where = "(StreamName = '" + strClickStreamName + "') and (SectionID = '" + strClickSegmentID + "')";
			queryObject.outSpatialReference = { wkid: 102100 };
			queryObject.returnGeometry = true;
			queryObject.outFields = ["*"];
			queryObject.spatialRelationship = "intersects";  // this is the default

			query.executeQueryJSON(app.strHFL_URL + app.idx11[5], queryObject).then(
							this.GetSectionGeometryResults1, this.GetSectionGeometryError1);
        },

        ClearVars: function () {
            m_streamSectionArrray = [];
            m_strSteamSectionQuery = "";
            m_FWPWarnFeatures = [];
            m_StepThruCounter = 0;
        },
        
        GetSectionGeometryResults1: function (results) {
            var pSectionGeometryFeatures = results.features;

            var resultCount = pSectionGeometryFeatures.length;
            if (resultCount > 0) {
				var sectionGeometries = new Polyline(app.view.spatialReference);
                for (var i = 0; i < pSectionGeometryFeatures.length; i++) {
                    var paths = pSectionGeometryFeatures[i].geometry.paths;
                    for (var j = 0; j < paths.length; j++) { //needed for multi part lines  
                        sectionGeometries.addPath(paths[j]);
                    }
                }
                this.app.pGetHistWarn.FindFWPWarnFeaturesOverlappingSections2(sectionGeometries);
            }
        },

        GetSectionGeometryError1: function (results) {
            alert("Error with query on FWS warn history layer1");
			this.app.pGage.SectionsReceived(streamSectionArrray, "", "", "", "", false, null);  //if an error go continue with getting seciton detail and display
            this.app.pGetWarn.ClearVars();
        },  
        
        FindFWPWarnFeaturesOverlappingSections2: function (pGeometry) {
            var pQuery = new Query();
            pQuery.returnGeometry = false;
            pQuery.outFields = ["TITLE", "LOCATION", "DESCRIPTION", "PRESSRELEASE", "PUBLISHDATE", "ARCHIVEDATE"];
            pQuery.outSpatialReference = {"wkid": 102100};
            pQuery.geometry = pGeometry;
            pQuery.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
			query.executeQueryJSON(app.strFWPURL, pQuery).then(this.GetFWPWarnResults2, this.GetFWPWarnResultsError2);
		},

		GetFWPWarnResults2: function (results) {
			var pWarnFeatures = results.features;
			var resultCount = pWarnFeatures.length;
			var initialData = [];

			var strHistRecordString = resultCount.toString() + " historic records";
			$("#divHistoricRecordText").html(strHistRecordString);

			if (resultCount > 1) {
				var xN = document.getElementById("btnHistsortByName");
				xN.style.display = "block";
				var xP = document.getElementById("btnHistsortByPubDate");
				xP.style.display = "block";
			}
			for (var i = 0; i < resultCount; i++) {
				pCurrentFWPFeature = pWarnFeatures[i]
				//Add to the m_streamSectionArrray based on values from the via m_FWPWarnFeatures and m_StepThruCounter
				var strDESCRIPTION = pCurrentFWPFeature.attributes["DESCRIPTION"];
				var strLOCATION = pCurrentFWPFeature.attributes["LOCATION"];
				var strPRESSRELEASE = pCurrentFWPFeature.attributes["PRESSRELEASE"];

				if ((strPRESSRELEASE != null) | (strPRESSRELEASE != undefined)) {
					if (strPRESSRELEASE.indexOf("href") >= 0) {
						strPRESSRELEASE = strPRESSRELEASE.match(/href="([^"]*)/)[1];
					} else {
						strPRESSRELEASE = "";
					}
				} else {
					strPRESSRELEASE = "";
				}
				var strPUBLISHDATEOrgFormat = pCurrentFWPFeature.attributes["PUBLISHDATE"];
				var strPUBLISHDATE = pCurrentFWPFeature.attributes["PUBLISHDATE"];
				strPUBLISHDATE = formatDate2(strPUBLISHDATE);

				var strArchiveDATE = pCurrentFWPFeature.attributes["ARCHIVEDATE"];
				strArchiveDATE = formatDate2(strArchiveDATE);

				var strTITLE = stripHTML(pCurrentFWPFeature.attributes["TITLE"]);
				initialData.push({ TITLE: strTITLE, DESCRIPTION: strDESCRIPTION, LOCATION: strLOCATION, PRESSRELEASE: strPRESSRELEASE, PUBLISHDATE: strPUBLISHDATE, ARCHIVEDATE: strArchiveDATE, PUBLISHDATEOrgFormat: strPUBLISHDATEOrgFormat });
			}

			var PagedGridModel = function (items) {					//https://knockoutjs.com/examples/grid.html or http://jsfiddle.net/brendonparker/6S85t/
				this.items = ko.observableArray(items);				//http://jsfiddle.net/u4Ymb/3/
				this.sortByName = function () {
					this.items.sort(function (a, b) {
						return a.TITLE < b.TITLE ? -1 : 1;
					});
				};
				this.sortByPubDate = function () {
					this.items.sort(function (a, b) {
						return a.PUBLISHDATEOrgFormat < b.PUBLISHDATEOrgFormat ? -1 : 1;
					});
				};
				this.gridViewModel = new ko.simpleGrid.viewModel({
					data: this.items,
					columns: [
						{ headerText: "Title", rowText: "TITLE" },
						{ headerText: "Description", rowText: "DESCRIPTION" },
						{ headerText: "Location", rowText: "LOCATION" },
						{ headerText: "Publish Date", rowText: "PUBLISHDATE" },
						{ headerText: "Archive Date", rowText: "ARCHIVEDATE" },
						{
							headerText: "Official Link", rowText: {
								action: function (item) {
									return function () {
										window.open(item.PRESSRELEASE);
										//alert(item.selected());
									}
								}
							}
						}
					],
					pageSize: 10
				});
			};

			//clear out the model array if exists
			var elementHistoric = $('#ViewModelHistoricRestrctions_div')[0];
			ko.cleanNode(elementHistoric);
			ko.applyBindings(new PagedGridModel(initialData), document.getElementById("ViewModelHistoricRestrctions_div"));
        },

        GetFWPWarnResultsError2: function (results) {
            console.log("Failed to get results from Sections Layer when querying by FWP Warn polygon due to an error: ", err);
            alert("Error with query on FWS warn history layer2");
			this.app.pGage.SectionsReceived(streamSectionArrray, "", "", "", "", false, null);  //if an error go continue with getting seciton detail and display
            this.app.pGetWarn.ClearVars();
        }
    });
}
);


