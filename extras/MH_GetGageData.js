function returnURL4GSgage(strURL) {
    strHyperlinkURL = strURL; 
    strHyperlinkURL = strHyperlinkURL.replace("?format=json", "?cb_00010=on&cb_00060=on&cb_00065=on&format=gif_default");
    strHyperlinkURL = strHyperlinkURL.replace("nwis.waterservices.usgs.gov/nwis/iv/", "nwis.waterdata.usgs.gov/mt/nwis/uv");
    strHyperlinkURL = strHyperlinkURL.replace("&siteStatus=all", "");
    strHyperlinkURL = strHyperlinkURL.replace("startDT", "begin_date");
    strHyperlinkURL = strHyperlinkURL.replace("endDT", "end_date");
    strHyperlinkURL = strHyperlinkURL.replace("sites", "site_no");
    strHyperlinkURL = strHyperlinkURL.replace("&parameterCd=00010,00060", "&period=");
    return strHyperlinkURL;
}

function ProcLinearRegression(arrray_Detail4Interpolation, strValueKey) {
    var str3DayCFSTrend = "images/blank.png";
    arrayX = [];
    arrayY = [];
    for (var ilr = 0; ilr < arrray_Detail4Interpolation.length; ilr++) {
        arrayX.push(arrray_Detail4Interpolation[ilr].EPOCH);
        arrayY.push(arrray_Detail4Interpolation[ilr][strValueKey]);
    }
    var lr = linearRegression(arrayY, arrayX);

    var dMidRangeLow = -0.0000001;
    var dMidRangeHigh = 0.0000001;

    if (strValueKey == "TMP") {
        dMidRangeLow = -0.000000001;
        dMidRangeHigh = 0.000000001;
    }


    islope = lr.slope;
    if ((islope < dMidRangeHigh) & (islope > dMidRangeLow)) {
        str3DayCFSTrend = "images/flatline.png";
    } else if (islope > 0) {
        str3DayCFSTrend = "images/up.png";
    } else {
        str3DayCFSTrend = "images/down.png";
    }
    arrayX = [];  //clear out the var's
    arrayY = [];
    arrray_Detail4Interpolation = [];
    return str3DayCFSTrend;
}

function linearRegression(y, x) {  //https://stackoverflow.com/questions/6195335/linear-regression-in-javascript
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i] * y[i]);
        sum_xx += (x[i] * x[i]);
        sum_yy += (y[i] * y[i]);
    }

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
    lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

    return lr;
}

function removeFunction(myObjects, prop, valu) {
    return myObjects.filter(function (val) {
        return val[prop] !== valu;
    });

}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}   


//Explore drilldown examples https://js.devexpress.com/Demos/WidgetsGallery/Demo/Charts/ChartsDrillDown/Knockout/Light/

define([
        "esri/tasks/QueryTask",
        "esri/tasks/query",
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
           QueryTask, Query, Polyline, declare, lang, esriRequest, all, All, request, dom, domClass, registry, on
) {

    return declare([], {
        m_arrray_RiverSectionStatus: [],
        m_arrray_Detail4ChartCFS: [],
        m_arrray_Detail4ChartTMP: [],
        m_arrray_Detail4ChartHistoryCFS: [],
        m_arrray_StationIDsCFS: [],
        m_arrray_StationIDsTMP: [],
        m_ProcessingIndex: 0,
        m_arrayOIDYellow: [],
        m_arrayOIDsGold: [],
        m_arrayOIDsOrange: [],
        m_arrayOIDsPlum: [],
        m_arrayOIDsRed: [],
        mIDXQuery1AtaTime: 0,

        gageReadings: function (strSiteName, strHyperlinkURL,
                                            dteLatestDateTimeTemp, dblLatestTemp, strSiteTempStatus,
                                            dteLatestDateTimeCFS, dteLatestCFS, strSiteFlowStatus, strGageID,
                                            strStreamName, strSectionID, str3DayCFSTrend,
                                            strMONTHDAYEarlyFlowFromDroughtManagementTarget,
                                            strMONTHDAYEarlyFlowToDroughtManagementTarget,
                                            iLateFlowPref4ConsvValue,
                                            iLateFlowConsvValue,
                                            iLateFlowClosureValueFlow,
                                            strLateFlowPref4ConsvValue,
                                            strLateFlowConsvValue,
                                            strLateFlowClosureValueFlow,
                                            iTempClosureValue,
                                            strTempCollected,
                                            strSiteID,
                                            strDailyStat_URL,
                                            str3DayTMPTrend,
                                            strFWPDESCRIPTION, strFWPLOCATION, strFWPPRESSRELEASE, strFWPPUBLISHDATE, strFWPTITLE,
                                            strOverallStatus,
                                            strOverallSymbol,
                                            strStartEndpoint,
                                            strEndEndpoint,
											strWatershed) {// Class to represent a row in the gage values grid
            var self = this;
            self.SiteName = strSiteName;
            self.Hyperlink = strHyperlinkURL;
            self.Discharge = dteLatestCFS;
            self.formattedDischargeDateTime = ko.computed(function () {
                var strDateTimeCFS = (dteLatestDateTimeCFS.getMonth() + 1) + "/" + dteLatestDateTimeCFS.getDate() + "/" + dteLatestDateTimeCFS.getFullYear();
                strDateTimeCFS += " " + dteLatestDateTimeCFS.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                return strDateTimeCFS ? strDateTimeCFS : "None";
            });
            self.WaterTemp = dblLatestTemp;
            self.formattedWaterTempDateTime = ko.computed(function () {
                if (dteLatestDateTimeTemp != "") {
                    var strDateTimeWaterTemp = (dteLatestDateTimeTemp.getMonth() + 1) + "/" + dteLatestDateTimeTemp.getDate() + "/" + dteLatestDateTimeTemp.getFullYear();
                    strDateTimeWaterTemp += " " + dteLatestDateTimeTemp.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }
                return strDateTimeWaterTemp ? strDateTimeWaterTemp : "Data No Available";
            });

            self.SiteTempStatus = strSiteTempStatus;
            self.SiteFlowStatus = strSiteFlowStatus;
            self.StreamName = strStreamName;
            self.SectionID = strSectionID;
            self.Day3CFSTrend = str3DayCFSTrend;

            self.strMONTHDAYEarlyFlowFromDroughtManagementTarget = strMONTHDAYEarlyFlowFromDroughtManagementTarget;
            self.strMONTHDAYEarlyFlowToDroughtManagementTarget = strMONTHDAYEarlyFlowToDroughtManagementTarget;
            self.iLateFlowPref4ConsvValue = iLateFlowPref4ConsvValue;
            self.iLateFlowConsvValue = iLateFlowConsvValue;
            self.iLateFlowClosureValueFlow = iLateFlowClosureValueFlow;
            self.strLateFlowPref4ConsvValue = strLateFlowPref4ConsvValue;
            self.strLateFlowConsvValue = strLateFlowConsvValue;
            self.strLateFlowClosureValueFlow = strLateFlowClosureValueFlow;
            self.iTempClosureValue = iTempClosureValue;
            self.strTempCollected = strTempCollected;
            self.strSiteID = strSiteID;
            self.strDailyStat_URL = strDailyStat_URL;
            self.Day3TMPTrend = str3DayTMPTrend;
            self.fwpDESCRIPTION = strFWPDESCRIPTION;
            self.fwpLOCATION = strFWPLOCATION;
            self.fwpPRESSRELEASE = strFWPPRESSRELEASE;
            self.fwpPUBLISHDATE = strFWPPUBLISHDATE;
            self.fwpTITLE = strFWPTITLE;
            self.overallStatus = strOverallStatus;
            self.overallSymbol = strOverallSymbol;
            self.StartEndpoint = strStartEndpoint;
			self.EndEndpoint = strEndEndpoint;
			self.strWatershed = strWatershed;
        },
        
        handleSectionGageResults: function (results) {
            var items = dom.map(results, function (result) {
                return result;
            });
            var streamSectionArrray = [];
            var arrayDuplicateCheck = [];
            var found = false;

            var strStreamName = "";
            var strSectionID = "";
            var strCFS_Prep4Conserv = "";
            var strCFS_Conserv = "";
            var strCFS_NotOfficialClosure = "";
            var iConsvTemp = 0;
            var strStratDate = "";
            var strtoDate = "";
            var isomeval = "";
            var strsomenote = "";
            var iCFS_Note_Prep4Conserv = 99999;
            var iCFS_Note_Conserv = 99999;
            var iCFS_Note_NotOfficialClosure = 99999;
            var iOID = "";
            var strStartEndpoint = "";
            var strEndEndpoint = "";

			dom.map(items[0].features, function (itemSection) {
				//console.log("handleSectionGageResults2");
                var strGageID_Source = null;
                var strTempCollected = null;
                var DailyStat_URL = "";

                strStreamName = "";
                strSectionID = "";
                strCFS_Prep4Conserv = "";
                strCFS_Conserv = "";
                strCFS_NotOfficialClosure = "";
                iConsvTemp = 0;
                strStratDate = "";
                strtoDate = "";
                isomeval = "";
                strsomenote = "";
                iCFS_Note_Prep4Conserv = 99999;
                iCFS_Note_Conserv = 99999;
                iCFS_Note_NotOfficialClosure = 99999;
                iOID = "";
                strStartEndpoint = "";
				strEndEndpoint = "";
				strWatershed = "";

                

                strStreamName = itemSection.attributes.StreamName;
                strSectionID = itemSection.attributes.SectionID;
                strCFS_Prep4Conserv = itemSection.attributes.CFS_Prep4Conserv;
                strCFS_Conserv = itemSection.attributes.CFS_Conserv;
                strCFS_NotOfficialClosure = itemSection.attributes.CFS_NotOfficialClosure;
                iConsvTemp = itemSection.attributes.ConsvTemp,
                //"startDate", "toDate", "someval", "somenote",
                iCFS_Note_Prep4Conserv = itemSection.attributes.CFS_Note_Prep4Conserv;
                iCFS_Note_Conserv = itemSection.attributes.CFS_Note_Conserv;
                iCFS_Note_NotOfficialClosure = itemSection.attributes.CFS_Note_NotOfficialClosure;
				iOID = itemSection.attributes.OBJECTID;
				strWatershed = itemSection.attributes.Watershed;

				dom.map(items[1].features, function (itemGage) {                //query by     Watershed , StreamName, Section_ID 
					//console.log("handleSectionGageResults3");


					if ((itemGage.attributes.Watershed === itemSection.attributes.Watershed) &
						(itemGage.attributes.StreamName === itemSection.attributes.StreamName) &
						(itemGage.attributes.Section_ID === itemSection.attributes.SectionID) &
						(itemGage.attributes.Symbology === "TRIGGER MEASURE LOCATION")) {

						strGageID_Source = itemGage.attributes.GageID_Source;
                        strTempCollected = itemGage.attributes.TempCollected;
                        if (strGageID_Source != null) {
                            DailyStat_URL = itemGage.attributes.DailyStat_URL;
                        }
                    }
                })

				dom.map(items[2].features, function (itemEndpoint) {                //query by     Watershed , StreamName, Section_ID 
					//console.log("handleSectionGageResults4");
                    if ((itemEndpoint.attributes.Watershed_Name === itemSection.attributes.Watershed) &
                        (itemEndpoint.attributes.Stream_Name === itemSection.attributes.StreamName) &
                        ((itemEndpoint.attributes.Section_ID === itemSection.attributes.SectionID) | (itemEndpoint.attributes.Section_Name === itemSection.attributes.SectionID) | (itemEndpoint.attributes.Section_Name === itemSection.attributes.SectionName)) &
                        (itemEndpoint.attributes.Start_End === "Start")) {
                            strStartEndpoint = itemEndpoint.attributes.Endpoint_Name;
                    }
                    if ((itemEndpoint.attributes.Watershed_Name === itemSection.attributes.Watershed) &
                        (itemEndpoint.attributes.Stream_Name === itemSection.attributes.StreamName) &
                        ((itemEndpoint.attributes.Section_ID === itemSection.attributes.SectionID) | (itemEndpoint.attributes.Section_Name === itemSection.attributes.SectionID) | (itemEndpoint.attributes.Section_Name === itemSection.attributes.SectionName)) &
                        (itemEndpoint.attributes.Start_End === "End")) {
                            strEndEndpoint = itemEndpoint.attributes.Endpoint_Name;
                    }
                })

                //if (strGageID_Source != null) {
                    streamSectionArrray.push([strStreamName, strGageID_Source,
                        strSectionID, strCFS_Prep4Conserv, strCFS_Conserv, strCFS_NotOfficialClosure, iConsvTemp,
						"Temperature Conservation Target Start Date: year round", "Temperature Conservation Target End Date: year round", "someval", "somenote",
                        iCFS_Note_Prep4Conserv, iCFS_Note_Conserv, iCFS_Note_NotOfficialClosure,
                        strTempCollected, iOID, DailyStat_URL,
                        "", //Placeholder for FWP ward description
                        "", //Placeholder for FWP ward location
                        "", //Placeholder for FWP ward Press Release
                        "", //Placeholder for FWP ward Publish date
                        "", //Placeholder for FWP ward Title,
                        "", //Placeholder for FWP warning,
                        strStartEndpoint,
						strEndEndpoint,
						strWatershed
                    ]);
                //}

                arrayDuplicateCheck.push(itemSection.attributes.StreamName + itemSection.attributes.SectionID);
               
            })

            streamSectionArrray.sort(
                function (a, b) {
                    if (a[0]=== b[0]) {
                        return a[2]-b[2];
                    }
                    return a[0]> b[0]? 1: -1;
                });

            var sectionGeometries = new Polyline(app.map.spatialReference);
            for (var i = 0; i < items[0].features.length; i++) {
                var paths = items[0].features[i].geometry.paths;
                for (var j = 0; j < paths.length; j++) { //needed for multi part lines  
                    sectionGeometries.addPath(paths[j]);
            }
            }
			app.pGetWarn.Start(sectionGeometries, streamSectionArrray);
        },

		getArray2Process: function (strURL, strQuery) {// Class to represent a row in the gage values grid
			console.log("getArray2Process");
            var siteNameArrray = [];

            qt_Layer1 = new esri.tasks.QueryTask(strURL + "5"); //sections layer
            q_Layer1 = new esri.tasks.Query();
            qt_Layer2 = new esri.tasks.QueryTask(strURL + "1"); //gage layer
            q_Layer2 = new esri.tasks.Query();
            qt_Layer3 = new esri.tasks.QueryTask(strURL + "0"); //gage layer
            q_Layer3 = new esri.tasks.Query();
            q_Layer1.returnGeometry = q_Layer2.returnGeometry = true;
            q_Layer1.outFields = q_Layer2.outFields = ["*"];
            //q_Layer3.outFields = ["Watershed_Name", "WatershedName_Alt1", "WatershedName_Alt2", "Endpoint_Name", "Stream_Name", "Section_ID", "Start_End"];
            q_Layer3.outFields = ["*"];

            q_Layer1.where = strQuery;
			q_Layer2.where = strQuery;
			var strQuery2 = strQuery.replace("Watershed in", "Watershed_Name in").replace("Watershed =", "Watershed_Name =")
			q_Layer3.where = strQuery2;

            var pLayer1, pLayer2, pLayer3, pPromises;
            pLayer1 = qt_Layer1.execute(q_Layer1);
            pLayer2 = qt_Layer2.execute(q_Layer2);
            pLayer3 = qt_Layer3.execute(q_Layer3);
            pPromises = new All([pLayer1, pLayer2, pLayer3]);
            //pPromises = new All([pLayer1, pLayer2]);
            pPromises.then(this.handleSectionGageResults, this.err);
        },
        
		ViewModel2TMP: function () {  //this is for google charts
            //https://developers.google.com/chart/interactive/docs/datatables_dataviews
            var self = this;
            self.ViewModel2TMP_LineData = ko.computed(function () {
                var strIDTemp = "";
                var arraystrIDs = [];
                var arrayPrelimData_1 = [];
                var arrayPrelimData_2 = [];
                var arrayPrelimData_3 = [];

                var uniqueSiteIDs = [];  //Remove duplicates from the siteid array
                $.each(app.pGage.m_arrray_StationIDsTMP, function (i, el) {
                    if ($.inArray(el, uniqueSiteIDs) === -1) uniqueSiteIDs.push(el);
                });

                blnSingleCharting = false;
                var iChart_TMP_ColumnNames = [];
                if (app.pGage.m_arrray_Detail4ChartTMP.length > 0) {//get the 1st gagedate form comparrison 
                    var dteDateTimeTemp = app.pGage.m_arrray_Detail4ChartTMP[0].gagedatetime;

                    if (app.pGage.m_arrray_StationIDsTMP.length == 1) {
                        blnSingleCharting = true;
                        var iTMPTarget1 = app.pGage.m_arrray_Detail4ChartTMP[0].TMPTarget1;
                        if (!(isNaN(iTMPTarget1))) {
                            iTMPTarget1 = Number(iTMPTarget1)
                            if (iTMPTarget1 != 0) {
                                iChart_TMP_ColumnNames.push(iTMPTarget1.toString() + "Consv. Target");
                            }
                        }
                    }
                }

                for (var i = 0; i < app.pGage.m_arrray_Detail4ChartTMP.length; i++) {
                    var strID = app.pGage.m_arrray_Detail4ChartTMP[i].id;
                    var dteDateTime = app.pGage.m_arrray_Detail4ChartTMP[i].gagedatetime;
                    var iTMPVal = app.pGage.m_arrray_Detail4ChartTMP[i].TMP;

                    if (dteDateTimeTemp.toString() != dteDateTime.toString()) {
                        var iHours = dteDateTime.getHours();
                        var iMinutes = dteDateTime.getMinutes();
                        var dteDate4Charting = new Date(dteDateTime.getFullYear(), dteDateTime.getMonth(), dteDateTime.getDate(), iHours, iMinutes, 0, 0);

                        arrayPrelimData_2 = [dteDate4Charting];

                        for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                            var strID2 = uniqueSiteIDs[ii];
                            var f;
                            var found = arrayPrelimData_1.some(function (item, index) { f = index; return item.id == strID2; });
                            if (!found) {
                                var iVal2Chart = null;
                            } else {
                                var iVal2Chart = arrayPrelimData_1[f].TMP;
                                if (iVal2Chart == -999999) {
                                    iVal2Chart = null;
                                }
                            }
                            arrayPrelimData_2.push(iVal2Chart);

                            if (blnSingleCharting) {
                                if (iTMPTarget1 != 0) {
                                    arrayPrelimData_2.push(iTMPTarget1); 
                                }
                            }
                        }

                        arrayPrelimData_3.push(arrayPrelimData_2);
                        arrayPrelimData_1 = [];
                    }
                    var obj22 = {};       // build a temporary array of all the cfs values to use when the date/time switches and will grabe appropriate values based on station id as a key
                    obj22["id"] = strID;
                    obj22["TMP"] = iTMPVal;
                    obj22["gagedatetime"] = dteDateTime;
                    arrayPrelimData_1.push(obj22);
                    strIDTemp = strID;
                    dteDateTimeTemp = dteDateTime;
                }

                var strDateColumnName = "DatetimeTMP";
                if (blnSingleCharting) {
                    strDateColumnName += "Single";
                }

                var data = new google.visualization.DataTable();
                data.addColumn('date', strDateColumnName);
                for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                    data.addColumn('number', uniqueSiteIDs[ii]);
                }


                if (blnSingleCharting) {
                    for (var ii = 0; ii < iChart_TMP_ColumnNames.length; ii++) {
                        data.addColumn('number', iChart_TMP_ColumnNames[ii]);
                    }
                }

                data.addRows(arrayPrelimData_3);

                var date_formatter = new google.visualization.DateFormat({  //this will format the crosshair in the google chart
                    pattern: "MMM dd, yyyy HH:mm"
                });
                date_formatter.format(data, 0);

                return data;
            });
        },

		ViewModel2CFS: function () {  //this is for google charts
            //https://developers.google.com/chart/interactive/docs/datatables_dataviews
            var self = this;
            self.ViewModel2CFS_LineData = ko.computed(function () {
                var strIDTemp = "";
                var arraystrIDs = [];
                var arrayPrelimData_1 = [];
                var arrayPrelimData_2 = [];
                var arrayPrelimData_3 = [];

                var uniqueSiteIDs = [];  //Remove duplicates from the siteid array
                $.each(app.pGage.m_arrray_StationIDsCFS, function (i, el) {
                    if ($.inArray(el, uniqueSiteIDs) === -1) uniqueSiteIDs.push(el);
                });

                blnSingleCharting = false;
                var iChart_CFS_ColumnNames = [];
                if (app.pGage.m_arrray_Detail4ChartCFS.length > 0) {//get the 1st gagedate form comparrison 
                    var dteDateTimeTemp = app.pGage.m_arrray_Detail4ChartCFS[0].gagedatetime;

                    if (app.pGage.m_arrray_StationIDsCFS.length == 1) {
                        blnSingleCharting = true;
                        var icfsTarget1 = app.pGage.m_arrray_Detail4ChartCFS[0].cfsTarget1;
                        if (!(isNaN(icfsTarget1))) {
                            icfsTarget1 = Number(icfsTarget1)
                            if (icfsTarget1 != 0) {
                                iChart_CFS_ColumnNames.push(icfsTarget1.toString() + "Consv. Target");
                            }
                        }
                        var icfsTarget2 = app.pGage.m_arrray_Detail4ChartCFS[0].cfsTarget2;
                        if (!(isNaN(icfsTarget2))) {
                            icfsTarget2 = Number(icfsTarget2)
                            if (icfsTarget2 != 0) {
                                iChart_CFS_ColumnNames.push(icfsTarget2.toString() + "Consv. Target");
                            }
                        }
                        var icfsTarget3 = app.pGage.m_arrray_Detail4ChartCFS[0].cfsTarget3;
                        if (!(isNaN(icfsTarget3))) {
                            icfsTarget3 = Number(icfsTarget3)
                            if (icfsTarget3 != 0) {
                                iChart_CFS_ColumnNames.push(icfsTarget3.toString() + "Consv. Target");
                            }
                        }
                        //iChart_CFS_ColumnNames = [icfsTarget1.toString() + "Consv. Target", icfsTarget2.toString() + "Consv. Target", icfsTarget3.toString() + "Consv. Target"];
                    }
                } else if (app.pGage.m_arrray_Detail4ChartHistoryCFS.length > 0) {  //if historical data AND NO CURRNET DATA, only gathered for single sections, then add the the datatable
                    for (var ih = 0; ih < app.pGage.m_arrray_Detail4ChartHistoryCFS.length; ih++) {
                        arrayPrelimData_3.push([app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].gagedatetime, null, Number(app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].cfs)])  //add historical to an array to chart without other values
                        for (var iAddhr = 15; iAddhr < 1440; iAddhr += 15) {
                            var dteDate4Null = new Date(app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].gagedatetime);
                            dteDate4Null.setMinutes(dteDate4Null.getMinutes() + iAddhr);
                            arrayPrelimData_3.push([dteDate4Null, null, null])  //add historical to an array to chart without other values
                        }
                    }
                }
               
                for (var i = 0; i < app.pGage.m_arrray_Detail4ChartCFS.length; i++) {
                    var strID = app.pGage.m_arrray_Detail4ChartCFS[i].id;
                    var dteDateTime = app.pGage.m_arrray_Detail4ChartCFS[i].gagedatetime;
                    var iCFSVal = app.pGage.m_arrray_Detail4ChartCFS[i].cfs;

                    if (dteDateTimeTemp.toString() != dteDateTime.toString()) {
                        var iHours = dteDateTime.getHours();
                        var iMinutes = dteDateTime.getMinutes();
                        var dteDate4Charting = new Date(dteDateTime.getFullYear(), dteDateTime.getMonth(), dteDateTime.getDate(), iHours, iMinutes, 0, 0);

                        arrayPrelimData_2 = [dteDate4Charting];

                        for (var ii = 0; ii < uniqueSiteIDs.length; ii++){
                            var strID2 = uniqueSiteIDs[ii];
                            var f;
                            var found = arrayPrelimData_1.some(function(item, index) { f = index; return item.id == strID2; });
                            if (!found) {
                                var iVal2Chart = null;
                            }else{
                                var iVal2Chart = arrayPrelimData_1[f].cfs;
                                if (iVal2Chart == -999999){
                                    iVal2Chart = null;
                                }
                            }
                            arrayPrelimData_2.push(iVal2Chart);

                            if (blnSingleCharting) {
                                if (icfsTarget1 != 0) {
                                    arrayPrelimData_2.push(icfsTarget1);
                                }
                                if (icfsTarget2 != 0) {
                                    arrayPrelimData_2.push(icfsTarget2);
                                }
                                if (icfsTarget3 != 0) {
                                    arrayPrelimData_2.push(icfsTarget3);
                                }
                            }
                        }

                        if (app.pGage.m_arrray_Detail4ChartHistoryCFS.length > 0){  //if historical data, only gathered for single sections, then add the the datatable
                            if ((iHours == 12) & (iMinutes == 00)) {  
                                for (var ih = 0; ih < app.pGage.m_arrray_Detail4ChartHistoryCFS.length; ih++) {
                                    var dteDate4ChartingHistorycheck = dteDateTime.getFullYear() + "-" + ("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTime.getDate()).slice(-2);

                                    if (app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].date == dteDate4ChartingHistorycheck){
                                        arrayPrelimData_2.push(Number(app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].cfs))  //convert the string value to number type
                                        break;  //if found then don't check for more for this date/time
                                    }
                                }
                            } else {
                                arrayPrelimData_2.push(null)
                            }
                        }

                        arrayPrelimData_3.push(arrayPrelimData_2);
                        arrayPrelimData_1 = [];
                    } 
                    var obj22 = {};       // build a temporary array of all the cfs values to use when the date/time switches and will grabe appropriate values based on station id as a key
                    obj22["id"] = strID;
                    obj22["cfs"] = iCFSVal;
                    obj22["gagedatetime"] = dteDateTime;
                    arrayPrelimData_1.push(obj22);
                    strIDTemp = strID;
                    dteDateTimeTemp = dteDateTime;
                }

                var data = new google.visualization.DataTable();
                var strDateColumnName = "DatetimeCFS";
                if (blnSingleCharting) {
                    strDateColumnName += "Single";
                }

                data.addColumn('date', strDateColumnName);
                for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                    data.addColumn('number', uniqueSiteIDs[ii]);
                }

                if (blnSingleCharting) {
                    for (var ii = 0; ii < iChart_CFS_ColumnNames.length; ii++) {
                        data.addColumn('number', iChart_CFS_ColumnNames[ii]);
                    }
                }

                if (app.pGage.m_arrray_Detail4ChartHistoryCFS.length > 0) {
                    data.addColumn('number', "Historical Daily Mean");
                }

                data.addRows(arrayPrelimData_3);

                var date_formatter = new google.visualization.DateFormat({  //this will format the crosshair in the google chart
                    pattern: "MMM dd, yyyy HH:mm"
                });
                date_formatter.format(data, 0);

                return data;
            });
        },

		readingsViewModel: function () {
			console.log("readingsViewModel");
            var self = this;
            
            if (typeof app.pGage.m_arrray_RiverSectionStatus !== "undefined") {//this feed then gageReadings: function 
                var arrayKOTemp = [];
                for (var i = 0; i < app.pGage.m_arrray_RiverSectionStatus.length; i++)
                    arrayKOTemp.push(new app.pGage.gageReadings(app.pGage.m_arrray_RiverSectionStatus[i][0],   
                                                                app.pGage.m_arrray_RiverSectionStatus[i][1],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][2],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][3],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][4],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][5],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][6],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][7],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][8],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][9],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][10],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][11],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][12],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][13],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][14],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][15],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][16],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][17],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][18],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][19],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][20],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][21],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][22],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][23],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][24],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][25],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][26],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][27],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][28],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][29],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][30],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][31],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][32],
																app.pGage.m_arrray_RiverSectionStatus[i][33],
																app.pGage.m_arrray_RiverSectionStatus[i][34]));

                self.gageRecords = ko.observableArray(arrayKOTemp);
                
                self.CurrentDisplayGageRecord = ko.observable(self.gageRecords()[0]);
                self.selectThing = function (item) {
                    document.getElementById("divSectionDetail_A").style.display = 'inline';
                    document.getElementById("divSectionDetail_B").style.display = 'inline';


                    if (((item.iLateFlowPref4ConsvValue == null) | (item.iLateFlowPref4ConsvValue == 0)) &
                        ((item.iLateFlowConsvValue == null) | (item.iLateFlowConsvValue == 0)) &
                        ((item.iLateFlowClosureValueFlow == null) | (item.iLateFlowClosureValueFlow == 0))) {
                        document.getElementById("divCFSTargetDefinitions").style.display = 'none';
                    } else {
                        document.getElementById("divCFSTargetDefinitions").style.display = 'inline';
                    }
                    
                    if ((item.strDailyStat_URL == null) | (item.strDailyStat_URL == "")) {
                        document.getElementById("detailSectionUSGSHistorical").style.display = 'none';
                    } else {
                        document.getElementById("detailSectionUSGSHistorical").style.display = 'inline';
                    }

                    if ((item.Hyperlink == null) | (item.Hyperlink == undefined)) {
                        document.getElementById("detailSectionUSGSCurrent").style.display = 'none';
                    } else {
                        document.getElementById("detailSectionUSGSCurrent").style.display = 'inline';
                    }

                    if ((item.fwpTITLE == "") | (item.fwpTITLE == "") | (item.fwpTITLE == "")) {
                        document.getElementById("detailSection2").style.display = 'none';
                    } else {
                        $("#detailSection2").show();
                    }
                    
                    if ((item.Day3CFSTrend == undefined) | (item.Day3CFSTrend == "images/blank.png")) {
                        document.getElementById("divDay3CFSTrend").style.display = 'none';
                    } else {
                        $("#divDay3CFSTrend").show();
                    }

                    if ((item.Day3TMPTrend == undefined) | (item.Day3TMPTrend == "images/blank.png")) {
                        document.getElementById("divDay3TMPTrend").style.display = 'none';
                    } else {
                        //document.getElementById("divDay3TMPTrend").style.display = 'inline';
                        $("#divDay3TMPTrend").show();
                    }
                    
                    self.CurrentDisplayGageRecord(item);
                };
                self.avgTemp = ko.computed(function () {
                    var total = 0;
                    for (var i = 0; i < self.gageRecords().length; i++)
                        total += self.gageRecords()[i].rWaterTemp;
                    dblAverage = total / self.gageRecords().length;
                    return dblAverage;
                });
            } else {
                var currentdate = new Date();
                self.gageRecords = ko.observableArray([new app.pGage.gageReadings("", "", currentdate, 0, "", currentdate, 0, "")]);
            }

        },
        
        Start: function (dteStartDay2Check, dteEndDay2Check) {
            this.dteStartDay2Check = dteStartDay2Check;
            this.dteEndDay2Check = dteEndDay2Check;

            //if (typeof app.H2O_ID == "undefined") {
            //     strQuery = "OBJECTID >= 0";
            //} else {
            //    //strQuery = "Watershed = '" + app.H2O_ID + "'";
            //    strQuery = "Watershed = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt1 = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt2 = '" + app.H2O_ID + "'";
            //}
			strQuery = app.SectionQryStringGetGageData;

            this.getArray2Process(app.strHFL_URL, strQuery);
        },

        GraphSingleSEction: function (strStreamName, iSectionID, strSiteID, iCFSTarget1, iCFSTarget2, iCFSTarget3, strDailyStat_URL, iTMPTarget1) {
            app.pGage.m_arrray_StationIDsTMP = [];
            app.pGage.m_arrray_StationIDsCFS = [];
            app.pGage.m_arrray_Detail4ChartTMP = [];
            app.pGage.m_arrray_Detail4ChartHistoryTMP = [];
            app.pGage.m_arrray_Detail4ChartCFS = [];
            app.pGage.m_arrray_Detail4ChartHistoryCFS = [];

            var dteDateTimeMinus0 = new Date();
            dteDateTimeMinus0.setDate(dteDateTimeMinus0.getDate() - 0);
            var dteDateTimeMinus1 = new Date();
            dteDateTimeMinus1.setDate(dteDateTimeMinus1.getDate() - 1);
            var dteDateTimeMinus2 = new Date();
            dteDateTimeMinus2.setDate(dteDateTimeMinus2.getDate() - 2);
            var dteDateTimeMinus3 = new Date();
            dteDateTimeMinus3.setDate(dteDateTimeMinus3.getDate() - 3);

            var idxMonth = 0;
            var idxMonth2 = 0;
            var idxDay = 0;
            var idxDay2 = 0;
            var idxMean = 0;

            var arrayMonthsDays = [[(dteDateTimeMinus3.getMonth() + 1).toString(), dteDateTimeMinus3.getDate().toString()],
                                    [(dteDateTimeMinus2.getMonth() + 1).toString(), dteDateTimeMinus2.getDate().toString()],
                                    [(dteDateTimeMinus1.getMonth() + 1).toString(), dteDateTimeMinus1.getDate().toString()],
                                    [(dteDateTimeMinus0.getMonth() + 1).toString(), dteDateTimeMinus0.getDate().toString()]];
            var iMean = 0;
            

            //get the summary output USGS daily mean data, unfortunately this is not available in JSON format
            //var strURL = "https://nwis.waterdata.usgs.gov/nwis/dvstat?&site_no=" + strSiteID + "&agency_cd=USGS&por_" + strSiteID + "_80655=64907,00060,80655,1950-10-01,2017-10-29&stat_cds=mean_va&referred_module=sw&format=rdb";
            //  var strURL = "https://nwis.waterdata.usgs.gov/nwis/dvstat?&site_no=" + strSiteID + "&agency_cd=USGS&por_" + strSiteID + "_80888=65063,00060,80888,1893-10-01,2017-10-29&stat_cds=mean_va&format=rdb";

			var strURL = strDailyStat_URL;
			console.log("retreiving historical information");

            $.get(strURL)   //http://api.jquery.com/jquery.getjson/
                .done(function (webpageResult) {  //relying on the output from usgs incrementing through the calendar
                    $.each(webpageResult.split('\n'), function (index) {  //https://stackoverflow.com/questions/15009744/how-to-iterate-over-a-javascript-line-delimited-string-check-the-semi-colon-del
                        if (this.charAt(0) != "#") {
                            var arrayTabs = this.split('\t');

                            if (arrayTabs.indexOf("month_nu") > -1) {
                                idxMonth = arrayTabs.indexOf("month_nu");
                                idxDay = arrayTabs.indexOf("day_nu");
                                //idxMean = arrayTabs.indexOf("mean_va");
                                idxMean = arrayTabs.indexOf("p50_va");  //when looking at the USGS charting, they are using this column vs the mean_va column
                            } else {
                                if (isNaN(arrayTabs[idxMonth])) {
                                    //console.log("This line describes the tab formatting and does not contain data");
                                } else {
                                    var tempArrayMonthDay = [arrayTabs[idxMonth], arrayTabs[idxDay]];
                                    
                                    for (var i = 0, len = arrayMonthsDays.length; i < len; i++) {  //loop through the days we're looking for, if on of the last 3 days then push into an array
                                        if ((arrayMonthsDays[i][0] === arrayTabs[idxMonth]) & (arrayMonthsDays[i][1] === arrayTabs[idxDay])) {
                                            var dteDate4Charting = new Date(dteDateTimeMinus0.getFullYear(), (arrayTabs[idxMonth] - 1), arrayTabs[idxDay], 12, 0, 0, 0);
                                            var obj = {};
                                            obj["id"] = strStreamName + "," + iSectionID;
                                            obj["date"] = dteDate4Charting.getFullYear() + "-" + ("0" + (dteDate4Charting.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDate4Charting.getDate()).slice(-2);
                                            obj["time"] = dteDate4Charting.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
                                            obj["cfs"] = arrayTabs[idxMean];
                                            obj["gagedatetime"] = dteDate4Charting;
                                            app.pGage.m_arrray_Detail4ChartHistoryCFS.push(obj);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    });

                    var streamSectionArrray = [];
                    streamSectionArrray.push([strStreamName, strSiteID, iSectionID]);
                    app.pGage.SectionsReceived(streamSectionArrray, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, false);

                    app.map.enableMapNavigation();
                    app.map.showZoomSlider();
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });
        },

        StreamSectionSummaryUIAdditions: function (blnIsInitialPageLoad) {
            if (blnIsInitialPageLoad) {
                var vm = new app.pGage.readingsViewModel();
                ko.applyBindings(vm, document.getElementById("entriesCon_div"));
                ko.applyBindings(vm, document.getElementById("divSectionDetail_A"));
                ko.applyBindings(vm, document.getElementById("divSectionDetail_B"));

                var elements = document.getElementsByTagName('tr');  //Sets the click event for the row
                var str_overallSymbool = "";
                for (var i = 0; i < elements.length; i++) {
                    (elements)[i].addEventListener("click", function () {
                        var strTempText = this.innerHTML;  //parse the section summary text to set var's for charting and zooming
                        strTempText = strTempText.substring(strTempText.indexOf("StreamName") + ("StreamName".length + 2), strTempText.length);
                        var strClickStreamName = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("SectionID") + ("SectionID".length + 2), strTempText.length);
                        var strClickSegmentID = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("iLateFlowPref4ConsvValue") + ("iLateFlowPref4ConsvValue".length + 2), strTempText.length);
                        var iCFSTarget1 = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("iLateFlowConsvValue") + ("iLateFlowConsvValue".length + 2), strTempText.length);
                        var iCFSTarget2 = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("iLateFlowClosureValueFlow") + ("iLateFlowClosureValueFlow".length + 2), strTempText.length);
                        var iCFSTarget3 = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("iTempClosureValue") + ("iTempClosureValue".length + 2), strTempText.length);
                        var iTempCloseValue = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("strSiteID") + ("strSiteID".length + 2), strTempText.length);
                        var strClickSiteID = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("strDailyStat_URL") + ("strDailyStat_URL".length + 2), strTempText.length);
                        var strDailyStat_URL = strTempText.substring(0, strTempText.indexOf("</span>"));


						strTempText = strTempText.substring(strTempText.indexOf("Watershed") + ("Watershed".length + 2), strTempText.length);
						var strWatershed = strTempText.substring(0, strTempText.indexOf("</span>"));

                        //app.dblExpandNum = 1.5;
                        app.dblExpandNum = 0.8;

						$("#btnGetHistoricRestrctions").show();

						if ($("#ViewModelHistoricRestrctions_div").attr("aria-expanded")) {
							$("#divHistoricRecordText").html("");
							$("#ViewModelHistoricRestrctions_div").collapse("hide");
						}

						var xN = document.getElementById("btnHistsortByName");
						xN.style.display = "none";
						var xP = document.getElementById("btnHistsortByPubDate");
						xP.style.display = "none";
						
						$('#btnGetHistoricRestrctions').off('click');     //clear's any click event previoulsy set
                        $("#btnGetHistoricRestrctions").click(function () {
							console.log(strClickStreamName + ":" + strClickSegmentID)
							app.pGetHistWarn.Start(strClickStreamName, strClickSegmentID);
							$("#btnGetHistoricRestrctions").hide();
                        });

                        app.pGage.GraphSingleSEction(strClickStreamName, strClickSegmentID, strClickSiteID, iCFSTarget1, iCFSTarget2, iCFSTarget3, strDailyStat_URL, iTempCloseValue);

                        var blnZoom = true;
                        var pGFeature = null;
                        for (var iG = 0; iG < app.map.graphics.graphics.length; iG++) {
                            pGFeature = app.map.graphics.graphics[iG];
             
                            if (pGFeature.attributes) {
                                if (pGFeature.attributes.streamsectionClicked != undefined) {
                                    if (pGFeature.attributes.streamsectionClicked == true) {
                                        blnZoom = false;
                                        pGFeature.attributes.streamsectionClicked = false;

                                    } else if (pGFeature.attributes.streamsectionClicked != true) {
                                        app.map.graphics.clear();                //remove all graphics on the maps graphics layer
                                    }
                                }
                            }
                        }

                        if (blnZoom) {
							app.pZoom.qry_Zoom2FeatureLayerByQuery(app.strHFL_URL + "5", "(StreamName = '" + strClickStreamName + "') and " +
								 														 "(SectionID = '" + strClickSegmentID + "') and " +
																						 "(Watershed = '" + strWatershed + "')");

                        }

                        app.map.enableMapNavigation();
                        app.map.showZoomSlider();
                    });

                    var strTempText2 = (elements)[i].innerHTML;
                    strTempText2 = strTempText2.substring(strTempText2.indexOf("overallSymbol") + ("overallSymbol".length + 2), strTempText2.length);
                    var str_overallSymbool = "";
                    str_overallSymbool = strTempText2.substring(0, strTempText2.indexOf("</span>"));

                    if (str_overallSymbool == "Red") {
                        (elements)[i].style.color = 'white';
                        (elements)[i].style.backgroundColor = "rgb(255, 0, 0)";
                    }
                    if (str_overallSymbool == "Orange") {
                        (elements)[i].style.color = 'white';
                        (elements)[i].style.backgroundColor = "rgb(253, 106, 2)";
                    }
                    if (str_overallSymbool == "Gold") {
                        (elements)[i].style.color = 'white';
                        (elements)[i].style.backgroundColor = "rgb(249, 166, 2)";
                    }
                    if (str_overallSymbool == "Plum") {
                        (elements)[i].style.color = 'black';
                        (elements)[i].style.backgroundColor = "rgb(221, 160, 221)";
                    }
                    if (str_overallSymbool == "Yellow") {
                        (elements)[i].style.color = 'black';
                        (elements)[i].style.backgroundColor = "rgb(255, 255, 0)";
                    }
                    if (str_overallSymbool == "Grey") {
                        (elements)[i].style.color = "rgb(128, 128, 128)";
                    }
                    if (str_overallSymbool == "White") {
                        (elements)[i].style.color = 'black';
                    }
                }

                app.pSup.addStreamConditionFeatureLayer(m_arrayOIDYellow, m_arrayOIDsGold, m_arrayOIDsOrange, m_arrayOIDsPlum, m_arrayOIDsRed);
                app.pSup.Phase3(m_arrayOIDYellow, m_arrayOIDsGold, m_arrayOIDsOrange, m_arrayOIDsPlum, m_arrayOIDsRed);
                tableHighlightRow();
                document.getElementById("loadingImg2").style.display = "none";
                document.getElementById("divLoadingUSGS").style.display = "none";

                app.map.enableMapNavigation();
                app.map.showZoomSlider();
            }  //if initial run through, post stream section detail for all the stream sections


            app.pGage.m_arrray_Detail4ChartCFS.sort(function (a, b) {
                var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)
                return dateA - dateB //sort by date ascending
            })
            app.pGage.m_arrray_Detail4ChartTMP.sort(function (a, b) {
                var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)
                return dateA - dateB //sort by date ascending
            })
            var ViewModel2CFS_model = new app.pGage.ViewModel2CFS();
            var elementCFS = $('#ViewModel2CFSBinding_div')[0];
            var ViewModel2TMP_model = new app.pGage.ViewModel2TMP();
            var elementTMP = $('#ViewModel2TMPBinding_div')[0];


            if (!(blnIsInitialPageLoad)) {
                ko.cleanNode(elementCFS);
                ko.cleanNode(elementTMP);
            }

            ko.applyBindings(ViewModel2CFS_model, document.getElementById("ViewModel2CFSBinding_div"));
            $(window).resize(function () { //this is necessary to call for responsivness since google charts are sized are not changeable, must re-create
                ko.cleanNode(elementCFS);
                ko.applyBindings(ViewModel2CFS_model, document.getElementById("ViewModel2CFSBinding_div"));
            });

            ko.applyBindings(ViewModel2TMP_model, document.getElementById("ViewModel2TMPBinding_div"));
            $(window).resize(function () { //this is necessary to call for responsivness since google charts are sized are not changeable, must re-create
                ko.cleanNode(elementTMP);
                ko.applyBindings(ViewModel2TMP_model, document.getElementById("ViewModel2TMPBinding_div"));
            });
        },

        SectionsReceived: function (arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime) {
			console.log("SectionsReceived1");
			app.map.disableMapNavigation();
            app.map.hideZoomSlider();

            app.pGage.m_arrray_Detail4ChartCFS = [];
            app.pGage.m_arrray_Detail4ChartTMP = [];

            var EntiretrHTML = "";
            var iCounterTemperature = 0;
			var strHyperlinkURL = "";
            var strSiteIDs = "";
            var iProcIndex = null;;
            var arraySiteIDInfo = null;;
            var strStreamName = null;
            var strSiteID = null;
            var iSectionID = null;
            var iLateFlowPref4ConsvValue = "";
            var iLateFlowConsvValue = "";
            var iLateFlowClosureValueFlow = "";
            var strLateFlowPref4ConsvValue = "";
            var strLateFlowConsvValue = "";
            var strLateFlowClosureValueFlow = "";
            var iLateFlowHootValue = null;
            var strHootMessage = null;
            var iTempClosureValue = null;
            var strMONTHDAYEarlyFlowFromDroughtManagementTarget = null;
            var strMONTHDAYEarlyFlowToDroughtManagementTarget = null;
            var iEarlyFlowDroughtManagementTarget = null;
            var strEarlyFlowDroughtManagementTargetMessage = null;
            var strTempCollected = null;
            var iOID = null;
            var strDailyStat_URL = "";
            var strFWPWarn = "";
            var strStartEndpoint = "";
            var strEndEndpoint = "";
            m_arrayOIDYellow =[];
            m_arrayOIDsGold =[];
            m_arrayOIDsOrange = [];
            m_arrayOIDsPlum = [];
            m_arrayOIDsRed = [];
            
            var strURLGagePrefix = "https://nwis.waterservices.usgs.gov/nwis/iv/";
            strURLGagePrefix += "?format=json&indent=on&siteStatus=all";
            strURLGagePrefix += "&startDT=" +this.dteStartDay2Check;    //start date
            strURLGagePrefix += "&endDT=" +this.dteEndDay2Check;      //end date
            strURLGagePrefix += "&parameterCd=" + "00010,00060";

            var arrayProc2 = [];

            if (blnQuery1AtaTime) {   //due to intermittent errors with the USGS gage api when quering on mulitple sites at the same time, added this work around as an option if ERROR occurs
                strSiteIDs = arrayProc[app.pGage.mIDXQuery1AtaTime][1];
                arrayProc2 = [arrayProc[app.pGage.mIDXQuery1AtaTime]];
            } else {
                var arraySiteIDs = [];
                for (var ii in arrayProc) {
                    if (arrayProc[ii][1] != null) {
                        arraySiteIDs.push(arrayProc[ii][1]);
                    }
                }
                strSiteIDs = arraySiteIDs.join(",");
                arrayProc2 = arrayProc;
            }
			app.strURLGage = strURLGagePrefix + "&sites=" + strSiteIDs;
			console.log("Stream Gage values URL:" + app.strURLGage);

            var blnIsInitialPageLoad = false;
            if (arrayProc[0].length > 3) {
                blnIsInitialPageLoad = true
            }


            if ((blnQuery1AtaTime) & (strSiteIDs == null)) {   //due to intermittent errors with the USGS gage api when quering on mulitple sites at the same time, added this work around as an option if ERROR occurs
                strSiteID = arrayProc2[0][1];  //since some sections do not have readings all the time setting this before finding data in the JSON
                strStreamName = arrayProc2[0][0];  //since some sections do not have readings all the time setting this before finding data in the JSON
                iSectionID = arrayProc2[0][2];  //since some sections do not have readings all the time setting this before finding data in the JSON
                iTempClosureValue = arrayProc2[0][6];

                strMONTHDAYEarlyFlowFromDroughtManagementTarget = arrayProc2[0][7];
                strMONTHDAYEarlyFlowToDroughtManagementTarget = arrayProc2[0][8];
                iEarlyFlowDroughtManagementTarget = arrayProc2[0][9];
                strEarlyFlowDroughtManagementTargetMessage = arrayProc2[0][10];
                strLateFlowPref4ConsvValue = arrayProc2[0][11];
                strLateFlowConsvValue = arrayProc2[0][12];
                strLateFlowClosureValueFlow = arrayProc2[0][13];
                strTempCollected = arrayProc2[0][14];
                iOID = arrayProc2[0][15];
                strDailyStat_URL = arrayProc2[0][16];
                strFWPDESCRIPTION = arrayProc2[0][17];
                strFWPLOCATION = arrayProc2[0][18];
                strFWPPRESSRELEASE = arrayProc2[0][19];
                strFWPPUBLISHDATE = arrayProc2[0][20];
                strFWPTITLE = arrayProc2[0][21];
                strFWPWarn = arrayProc2[0][22];
                strStartEndpoint = arrayProc2[0][23];
				strEndEndpoint = arrayProc2[0][24];
				strWatershed = arrayProc2[0][25];

                iLateFlowPref4ConsvValue = arrayProc2[0][3];
                iLateFlowConsvValue = arrayProc2[0][4];
                iLateFlowClosureValueFlow = arrayProc2[0][5];
                dblLatestTMP = "No gage exists";
                dblLatestCFS = "No gage exists";

                var dteLatestDateTimeTMP = "";
                var dteLatestDateTimeCFS = "";
                var dblLatestTMP = "";
                var strID = "";
                var streamSectionDispalyName = strStreamName + " Section";
                var strSiteTempStatus = "OPEN";
                var strSiteFlowStatus = "OPEN";
                var str3DayCFSTrendCFS = "images/blank.png";
                var str3DayCFSTrendTMP = "images/blank.png";

                strNoDataLabel4Charting = " (No Data)";
                dteLatestDateTimeCFS = new Date();
                dteLatestDateTimeTMP = new Date();

                OverallStatusAndColor = app.pGage.DivyUpStatusandColors(iOID, strSiteFlowStatus, strSiteTempStatus, strFWPTITLE, strFWPDESCRIPTION, strFWPLOCATION, strFWPPRESSRELEASE, strFWPPUBLISHDATE, strFWPWarn);
                var strOverallStatus = OverallStatusAndColor[0];
                var strOverallSymbol = OverallStatusAndColor[1];

                app.pGage.m_arrray_RiverSectionStatus.push([streamSectionDispalyName,                    //add to array that populates the river sections summary div
                    strHyperlinkURL, dteLatestDateTimeTMP, dblLatestTMP.toString().replace("-999999", "Data not available"), strSiteTempStatus,
                    dteLatestDateTimeCFS, dblLatestCFS.toString(), strSiteFlowStatus, strID, strStreamName, iSectionID, str3DayCFSTrendCFS,
                    strMONTHDAYEarlyFlowFromDroughtManagementTarget, strMONTHDAYEarlyFlowToDroughtManagementTarget, iLateFlowPref4ConsvValue,
                    iLateFlowConsvValue, iLateFlowClosureValueFlow, strLateFlowPref4ConsvValue, strLateFlowConsvValue,
                    strLateFlowClosureValueFlow, iTempClosureValue, strTempCollected, strSiteID,
                    strDailyStat_URL, str3DayCFSTrendTMP, strFWPDESCRIPTION, strFWPLOCATION,
                    strFWPPRESSRELEASE, strFWPPUBLISHDATE, strFWPTITLE, strOverallStatus,
					strOverallSymbol, strStartEndpoint, strEndEndpoint, strWatershed]);

                app.pGage.mIDXQuery1AtaTime += 1;
                if ((blnQuery1AtaTime) & (app.pGage.mIDXQuery1AtaTime < arrayProc.length)) {
                    app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime)
                } else {
                    app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
                    app.pGage.mIDXQuery1AtaTime = 0;
                }

            } else {
                $.getJSON(app.strURLGage)   //http://api.jquery.com/jquery.getjson/
                    .done(function (jsonResult) {
                        arrayJSONValues = jsonResult.value.timeSeries;
                
                        dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
                            //if inital load then do full run through of code
                            strSiteID = itemSectionRefined[1];  //since some sections do not have readings all the time setting this before finding data in the JSON
                            strStreamName = itemSectionRefined[0];  //since some sections do not have readings all the time setting this before finding data in the JSON
                            iSectionID = itemSectionRefined[2];  //since some sections do not have readings all the time setting this before finding data in the JSON

                            strMONTHDAYEarlyFlowFromDroughtManagementTarget = itemSectionRefined[7];
                            strMONTHDAYEarlyFlowToDroughtManagementTarget = itemSectionRefined[8];
                            iEarlyFlowDroughtManagementTarget = itemSectionRefined[9];
                            strEarlyFlowDroughtManagementTargetMessage = itemSectionRefined[10];
                            strLateFlowPref4ConsvValue = itemSectionRefined[11];
                            strLateFlowConsvValue = itemSectionRefined[12];
                            strLateFlowClosureValueFlow = itemSectionRefined[13];
                            strTempCollected = itemSectionRefined[14];
                            iOID = itemSectionRefined[15];
                            strDailyStat_URL = itemSectionRefined[16];
                            strFWPDESCRIPTION = itemSectionRefined[17];
                            strFWPLOCATION = itemSectionRefined[18];
                            strFWPPRESSRELEASE = itemSectionRefined[19];
                            strFWPPUBLISHDATE = itemSectionRefined[20];
                            strFWPTITLE = itemSectionRefined[21];
                            strFWPWarn = itemSectionRefined[22];
                            strStartEndpoint = itemSectionRefined[23];
							strEndEndpoint = itemSectionRefined[24];
							strWatershed = itemSectionRefined[25];

                            var itemFound = arrayJSONValues.filter(function (itemArraySearch) {
                                    return typeof itemArraySearch.name == 'string' && itemArraySearch.name.indexOf(strSiteID) > -1;
                            });

                            var arrray_Detail4InterpolationCFS =[];
                            var arrray_Detail4InterpolationTMP =[];
                            var arrayTempsAbove =[];
                            var dteLatestDateTimeTMP = "";
                            var dteLatestDateTimeCFS = "";
                            var dblLatestTMP = "";
                            var dblLatestCFS = "";
                            var strSiteName = "";
                            var strID = "";

                            if (itemFound.length > 0) {
                                    iLateFlowPref4ConsvValue = itemSectionRefined[3];
                                    iLateFlowConsvValue = itemSectionRefined[4];
                                    iLateFlowClosureValueFlow = itemSectionRefined[5];
                                    iTempClosureValue = itemSectionRefined[6];

                                    if (blnIsInitialPageLoad) {
                                        if (app.test) {
                                            if (iLateFlowPref4ConsvValue == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                iLateFlowPref4ConsvValue = 400;
                                            }
                                            if (iLateFlowConsvValue == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                iLateFlowConsvValue = 300;
                                            }
                                            if (iLateFlowClosureValueFlow == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                    iLateFlowClosureValueFlow = 200;
                                            }
                                            iTempClosureValue = 50;
                                        } else {
                                            if (iLateFlowPref4ConsvValue == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                iLateFlowPref4ConsvValue = 0;
                                            }
                                            if (iLateFlowConsvValue == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                iLateFlowConsvValue = 0;
                                            }
                                            if (iLateFlowClosureValueFlow == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                iLateFlowClosureValueFlow = 0;
                                            }
                                        }

                                    var strSiteFlowStatus = "OPEN" //OPEN, PREPARE FOR CONSERVATION, CONSERVATION, RIVER CLOSURE (CLOSED TO FISHING)
                                    var strSiteTempStatus = "OPEN" //OPEN, HOOT-OWL FISHING RESTRICTIONS CRITERIA, RIVER CLOSURE (CLOSED TO FISHING) CRITERIA
                                    iTempClosureValueCelsius = (iTempClosureValue -32) * (5 / 9);

                                    strHyperlinkURL = strURLGagePrefix + "&sites=" +strSiteID;        //siteID
                                    strHyperlinkURL = returnURL4GSgage(strHyperlinkURL);

                                    blnRealValues = false;
                                    var str3DayCFSTrendCFS = "images/blank.png";
                                    var str3DayCFSTrendTMP = "images/blank.png";
                            }

                            //determine if the JSON element is a temperature or discharge reading
                            var temperatureItem = "";
                            var CFSItem = "";
                            for (var iv = 0; iv < itemFound.length; iv++) {
                                    if (itemFound[iv].variable.variableDescription == "Temperature, water, degrees Celsius") {
                                        temperatureItem = itemFound[iv];
                                    }
                                    if (itemFound[iv].variable.variableDescription == "Discharge, cubic feet per second") {
                                        CFSItem = itemFound[iv];
                                    }
                            }

                            if (CFSItem != "") {
                                arrayJSONValues2 = CFSItem.values[0].value;
                                jQuery.each(arrayJSONValues2, function (k, item2) {
                                    var dteDateTime = new Date(item2.dateTime);
                                    var strNoData = "";

                                    if (item2.value != -999999) {
                                        blnRealValues = true;
                                        var obj = {};
                                        obj["id"]= strStreamName + "," +iSectionID;
                                        obj["date"] = dteDateTime.getFullYear() + "-" +("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" +("0" +dteDateTime.getDate()).slice(-2);
                                        obj["time"]= dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false});
                                        obj["cfs"]= parseFloat(item2.value);
                                        obj["gagedatetime"]= dteDateTime;

                                        obj["cfsTarget1"]= iCFSTarget1;  //this are only used in single charting situations
                                        obj["cfsTarget2"]= iCFSTarget2;  //this are only used in single charting situations
                                        obj["cfsTarget3"]= iCFSTarget3;  //this are only used in single charting situations

                                        app.pGage.m_arrray_Detail4ChartCFS.push(obj);//populate the array that contains the data for charting
                                        obj["EPOCH"]= Date.parse(dteDateTime);

                                        arrray_Detail4InterpolationCFS.push(obj);  //populate the array that is used to determing the flow trent
                                    }
                                });

                                if ((arrray_Detail4InterpolationCFS.length > 0) & (blnRealValues)) { //figure out if the flow trend is increasing or decreasing & the last known values
                                    arrray_Detail4InterpolationCFS.sort(function (a, b) {
                                        var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)  //sort
                                        return dateA -dateB //sort by date ascending
                                    })
                                    var iCFSArrayLength = (arrray_Detail4InterpolationCFS.length -1);
                                    dteLatestDateTimeCFS = arrray_Detail4InterpolationCFS[iCFSArrayLength].gagedatetime;
                                    dblLatestCFS = parseFloat(arrray_Detail4InterpolationCFS[iCFSArrayLength].cfs);

                                    str3DayCFSTrendCFS = ProcLinearRegression(arrray_Detail4InterpolationCFS, "cfs");
                                }
                            }

                            arrayJSONValues2 =[]; //clear out the array

                            if (temperatureItem != "") {
                                    arrayJSONValues22 = temperatureItem.values[0].value;
                                    jQuery.each(arrayJSONValues22, function (k, item22) {
                                        var dteDateTime = new Date(item22.dateTime);
                                        var strNoData = "";
                                        if (item22.value != -999999) {
                                            blnRealValues = true;
                                            var obj = {};
                                            obj["id"]= strStreamName + "," +iSectionID;
                                            obj["date"] = dteDateTime.getFullYear() + "-" +("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" +("0" +dteDateTime.getDate()).slice(-2);
                                            obj["time"]= dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false});
                                            obj["TMP"]= Math.round(parseFloat(item22.value) * 9 / 5 +32);
                                            obj["gagedatetime"]= dteDateTime;
                                            obj["TMPTarget1"]= iTMPTarget1;  //this are only used in single charting situations
                                            app.pGage.m_arrray_Detail4ChartTMP.push(obj);//populate the array that contains the data for charting
                                            obj["EPOCH"]= Date.parse(dteDateTime);
                                            arrray_Detail4InterpolationTMP.push(obj);  //populate the array that is used to determing the flow trent
                                        }
                                    });

                                    if ((arrray_Detail4InterpolationTMP.length > 0) & (blnRealValues)) { //figure out if the flow trend is increasing or decreasing & the last known values
                                        arrray_Detail4InterpolationTMP.sort(function (a, b) {
                                                var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)  //sort
                                                return dateA -dateB //sort by date ascending
                                            })
                                        var iTMPArrayLength = (arrray_Detail4InterpolationTMP.length -1);
                                        dteLatestDateTimeTMP = arrray_Detail4InterpolationTMP[iTMPArrayLength].gagedatetime;

                                        dblLatestTMP = parseFloat(arrray_Detail4InterpolationTMP[iTMPArrayLength].TMP);
                                        str3DayCFSTrendTMP = ProcLinearRegression(arrray_Detail4InterpolationTMP, "TMP");
                                    }
                            }

                            arrayJSONValues22 =[]; //clear out the array
                            CFSItem = "";
                            temperatureItem = "";
                        }

                            if (itemFound.length > 0) {
                            var item = itemFound[0];
								strSiteName = item.sourceInfo.siteName;
                            }
                            var strNoDataLabel4ChartingCFS = "";
                            if (dblLatestCFS == -999999) {
                                dblLatestCFS = "Not Available"
                                dteLatestDateTimeCFS = new Date();
                                strNoDataLabel4ChartingCFS = " (No Data)";
                            } else if (dblLatestCFS == "") {
                                dblLatestCFS = "*Not collected"
                                strNoDataLabel4ChartingCFS = " (No Data)";
                                dteLatestDateTimeCFS = new Date();
                            } else {//determine the site's status based on discharge
                                if ((dblLatestCFS <= iLateFlowPref4ConsvValue) & (dblLatestCFS > iLateFlowConsvValue)) {
                                    strSiteFlowStatus = "PREPARE FOR CONSERVATION";
                                }
                                if ((dblLatestCFS <= iLateFlowConsvValue) & (dblLatestCFS > iLateFlowClosureValueFlow)) {
                                        strSiteFlowStatus = "CONSERVATION";
                                }
                                if (dblLatestCFS <= iLateFlowClosureValueFlow) {
                                        strSiteFlowStatus = "UNOFFICIAL RIVER CLOSURE";
                                }
                            }

                            var strNoDataLabel4ChartingTMP = "";
                            if (dblLatestTMP == - 999999) {
                                dblLatestTMP = "Not Available"
                                strNoDataLabel4ChartingTMP = " (No Data)";
                                dteLatestDateTimeTMP = new Date();
                            } else if (dblLatestTMP == "") {
                                dblLatestTMP = "*Not collected"
                                strNoDataLabel4ChartingTMP = " (No Data)";
                                dteLatestDateTimeTMP = new Date();
                            } else if (dblLatestTMP > iTempClosureValue) {
                                strSiteTempStatus = "UNOFFICIAL RIVER CLOSURE";
                            }

                            if (itemSectionRefined[1]== null) {  //if no gage id then hardcode 
                                dblLatestTMP = "No gage exists";
                                dblLatestCFS = "No gage exists";
                            }

                            app.pGage.m_arrray_StationIDsTMP.push(strStreamName + "," + iSectionID + strNoDataLabel4ChartingTMP);  // using this array of station id's to pivot the table for charting
                            app.pGage.m_arrray_StationIDsCFS.push(strStreamName + "," + iSectionID + strNoDataLabel4ChartingCFS);  // using this array of station id's to pivot the table for charting

                            if (blnIsInitialPageLoad) {
                                var streamSectionDispalyName = strSiteName.replace(", MT", "").replace(" MT", "").replace(strStreamName, "").replace("Big Hole R", "");
                                streamSectionDispalyName = streamSectionDispalyName.replace("Red Rock Cr ", "");
                                streamSectionDispalyName = streamSectionDispalyName.replace("E Gallatin R ", "");

                                if (streamSectionDispalyName == "") {
                                    streamSectionDispalyName = strStreamName + " Section";
                                }

                                OverallStatusAndColor = app.pGage.DivyUpStatusandColors(iOID, strSiteFlowStatus, strSiteTempStatus, strFWPTITLE, strFWPDESCRIPTION, strFWPLOCATION, strFWPPRESSRELEASE, strFWPPUBLISHDATE, strFWPWarn);
                                var strOverallStatus = OverallStatusAndColor[0];
                                var strOverallSymbol = OverallStatusAndColor[1];

                                app.pGage.m_arrray_RiverSectionStatus.push([streamSectionDispalyName,                    //add to array that populates the river sections summary div
                                    strHyperlinkURL, dteLatestDateTimeTMP, dblLatestTMP.toString().replace("-999999", "Data not available"), strSiteTempStatus,
                                    dteLatestDateTimeCFS, dblLatestCFS.toString(), strSiteFlowStatus, strID, strStreamName, iSectionID, str3DayCFSTrendCFS,
                                    strMONTHDAYEarlyFlowFromDroughtManagementTarget, strMONTHDAYEarlyFlowToDroughtManagementTarget, iLateFlowPref4ConsvValue,
                                    iLateFlowConsvValue, iLateFlowClosureValueFlow, strLateFlowPref4ConsvValue, strLateFlowConsvValue,
                                    strLateFlowClosureValueFlow, iTempClosureValue, strTempCollected, strSiteID,
                                    strDailyStat_URL, str3DayCFSTrendTMP, strFWPDESCRIPTION, strFWPLOCATION,
                                    strFWPPRESSRELEASE, strFWPPUBLISHDATE, strFWPTITLE, strOverallStatus,
									strOverallSymbol, strStartEndpoint, strEndEndpoint, strWatershed]);

                            }

                            var blnAddNew = false;
                            dteLatestDateTimeTMP = "";
                            dteLatestDateTimeCFS = "";
                            dblLatestTemp = "";
                            dblLatestCFS = "";
                            arrayTempsAbove =[];
                            strSiteName = "";
                        })

                        arrayJSONValues = [];

                        app.pGage.mIDXQuery1AtaTime += 1;

                        if ((blnQuery1AtaTime) & (app.pGage.mIDXQuery1AtaTime < arrayProc.length)) {
                            app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime)
                        } else {
                            app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
                            app.pGage.mIDXQuery1AtaTime = 0;
                        }

                    })

                    .fail(function (jqxhr, textStatus, error) {
                        var err = textStatus + ", " + app.strURLGage + ", " + error;
                        //alert("Initial query for USGS gage data failed, trying again");
                        document.getElementById("divLoadingUSGS").innerHTML = "Loading USGS Data, again";
                        console.log("Request Failed: " + err);

                        if (!blnQuery1AtaTime) {  //if the USGS api is erroring out try the refactored method
                            app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, true)
                        }
                    })
                    .always(function () {
                        if ((!(blnIsInitialPageLoad)) & (app.pGage.m_arrray_StationIDsCFS.length == 0)) {  // in the case of no gage station do the following for the graphing
                            dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
                                iSectionID = itemSectionRefined[2];  
                                strStreamName = itemSectionRefined[0];
                                app.pGage.m_arrray_StationIDsTMP.push(strStreamName + "," + iSectionID + " (No Data)");  // using this array of station id's to pivot the table for charting
                                app.pGage.m_arrray_StationIDsCFS.push(strStreamName + "," + iSectionID + " (No Data)");  // using this array of station id's to pivot the table for charting
                                app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
                            })
                        }
                    });
            }
        },



        DivyUpStatusandColors: function (iOID, strSiteFlowStatus, strSiteTempStatus, strTITLE, strDESCRIPTION, strLOCATION, strPRESSRELEASE, strPUBLISHDATE, strFWPWarn) {
            var strOverallStatus = "Open";
            var strOverallSymbol = "White";
            
            if (strSiteFlowStatus == "PREPARE FOR CONSERVATION") {
                strOverallStatus = "PREPARE FOR CONSERVATION";
                strOverallSymbol = "Yellow";
                m_arrayOIDYellow.push(iOID);
            }

            if (strSiteFlowStatus == "CONSERVATION") {
                strOverallStatus = "CONSERVATION";
                strOverallSymbol = "Gold";
                m_arrayOIDsGold.push(iOID);
            }

            if (strSiteFlowStatus == "UNOFFICIAL RIVER CLOSURE") {
                strOverallStatus = "UNOFFICIAL RIVER CLOSURE";
                strOverallSymbol = "Orange";
                m_arrayOIDsOrange.push(iOID);
            }

            if (strSiteTempStatus == "UNOFFICIAL RIVER CLOSURE") {
                strOverallStatus = "PREPARE FOR HOOT-OWL FISHING RESTRICTIONS";
                strOverallSymbol = "Plum";
                m_arrayOIDsPlum.push(iOID);
            }

            if (strFWPWarn != "") {
                strSiteFlowStatus = "MT FWS Restriction (click for details)";
                strOverallStatus = "MT FWP Official Restriction (click for details)";
                strOverallSymbol = "Red";
                m_arrayOIDsRed.push(iOID);
            }

            return [strOverallStatus, strOverallSymbol];
        },


        err: function (err) {
			console.log("Failed to get results 1 due to an error: ");
			console.log(err);
        }

    });
}
);

