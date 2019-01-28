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
           QueryTask, Query, declare, lang, esriRequest, all, All, request, dom, domClass, registry, on
) {

    return declare([], {
        m_arrray_RiverSectionStatus: [],
        m_arrray_Detail4Chart: [],
        m_arrray_StationIDs: [],
        m_ProcessingIndex: 0,

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
                                            strTempCollected) {// Class to represent a row in the gage values grid
            var self = this;
            self.SiteName = strSiteName;
            self.Hyperlink = strHyperlinkURL;
            self.Discharge = dteLatestCFS;
            self.formattedDischargeDateTime = ko.computed(function () {
                var strDateTimeCFS = (dteLatestDateTimeCFS.getMonth() + 1) + "/" + dteLatestDateTimeCFS.getDate() + "/" + dteLatestDateTimeCFS.getFullYear();
                strDateTimeCFS += " " + dteLatestDateTimeCFS.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                return strDateTimeCFS ? "!!!!" + strDateTimeCFS : "None";
            });
            self.WaterTemp = dblLatestTemp;
            self.formattedWaterTempDateTime = ko.computed(function () {
                if (dteLatestDateTimeTemp != "") {
                    var strDateTimeWaterTemp = (dteLatestDateTimeTemp.getMonth() + 1) + "/" + dteLatestDateTimeTemp.getDate() + "/" + dteLatestDateTimeTemp.getFullYear();
                    strDateTimeWaterTemp += " " + dteLatestDateTimeTemp.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }
                return strDateTimeWaterTemp ? "!!!!" + strDateTimeWaterTemp : "Data No Available";
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
        },
        
        handleSectionGageResults: function (results) {
            var items = dom.map(results, function (result) {
                return result;
            });
            var streamSectionArrray = [];
            var strGageID_Source = null;
            var strTempCollected = null;

            var arrayDuplicateCheck = [];
            var found = false;
            dom.map(items[0].features, function (itemSection) {
                strGageID_Source = null;
                dom.map(items[1].features, function (itemGage) {                //query by     Watershed , StreamName, Section_ID 
                    if ((itemGage.attributes.Watershed === itemSection.attributes.Watershed) &
                        (itemGage.attributes.StreamName === itemSection.attributes.StreamName) &
                        (itemGage.attributes.Section_ID === itemSection.attributes.SectionID) &
                        (itemGage.attributes.Symbology === "TRIGGER MEASURE LOCATION")) {

                        strGageID_Source = itemGage.attributes.GageID_Source;
                        strTempCollected = itemGage.attributes.TempCollected;

                        ifindIndex = arrayDuplicateCheck.indexOf(itemSection.attributes.StreamName + itemSection.attributes.SectionID); //sometimes there are duplicate entries in the sections layer, this is to not add duplicates
                      
                        if ((strGageID_Source != null) & (ifindIndex == -1)) {  //gathered from the sections feature class
                            streamSectionArrray.push([itemSection.attributes.StreamName,
                                strGageID_Source,
                            itemSection.attributes.SectionID,
                            itemSection.attributes.CFS_Prep4Conserv,
                            itemSection.attributes.CFS_Conserv,
                            itemSection.attributes.CFS_NotOfficialClosure,
                            itemSection.attributes.ConsvTemp,
                                "startDate", "toDate", "someval", "somenote",
                            itemSection.attributes.CFS_Note_Prep4Conserv,
                            itemSection.attributes.CFS_Note_Conserv,
                            itemSection.attributes.CFS_Note_NotOfficialClosure,
                                strTempCollected,
                                itemSection.attributes.OBJECTID
                            ]);

                            arrayDuplicateCheck.push(itemSection.attributes.StreamName + itemSection.attributes.SectionID);
                        }
                    }
                })
            })

            streamSectionArrray.sort(
                function (a, b) {
                    if (a[0] === b[0]) {
                        return a[2] - b[2];
                    }
                    return a[0] > b[0] ? 1 : -1;
                });


            this.app.pGage.SectionsReceived(streamSectionArrray);
        },

        getArray2Process: function (strURL, strQuery) {// Class to represent a row in the gage values grid
            var siteNameArrray = [];

            qt_Layer1 = new esri.tasks.QueryTask(strURL + "4");
            q_Layer1 = new esri.tasks.Query();
            qt_Layer2 = new esri.tasks.QueryTask(strURL + "0");
            q_Layer2 = new esri.tasks.Query();
            q_Layer1.returnGeometry = q_Layer2.returnGeometry = false;
            q_Layer1.outFields = q_Layer2.outFields = ["*"];

            q_Layer1.where = strQuery;
            q_Layer2.where = strQuery;

            var pLayer1, pLayer2, pPromises;
            pLayer1 = qt_Layer1.execute(q_Layer1);
            pLayer2 = qt_Layer2.execute(q_Layer2);
            pPromises = new All([pLayer1, pLayer2]);
            pPromises.then(this.handleSectionGageResults, this.err);
        },



        ViewModel2:function() {  //this is for google charts
             var self = this;
             self.ViewModel2_LineData = ko.computed(function () {
                 var strIDTemp = "";
                 //var strDateTimeTemp = "";
                 var arraystrIDs = [];
                 var arrayPrelimData_1 = [];
                 var arrayPrelimData_2 = [];
                 var arrayPrelimData_3 = [];

                 dteDateTimeTemp = app.pGage.m_arrray_Detail4Chart[0].gagedatetime;  //get the 1st gagedate form comparrison 

                 for (var i = 0; i < app.pGage.m_arrray_Detail4Chart.length; i++) {
                     var strID = app.pGage.m_arrray_Detail4Chart[i].id;
                     var dteDateTime = app.pGage.m_arrray_Detail4Chart[i].gagedatetime;
                     var iCFSVal = app.pGage.m_arrray_Detail4Chart[i].cfs;

                     if (dteDateTimeTemp.toString() != dteDateTime.toString()) {
                        var iHours = dteDateTime.getHours();
                        var iMinutes = dteDateTime.getMinutes();
                        var dteDate4Charting = new Date(dteDateTime.getFullYear(), (dteDateTime.getMonth() + 1), dteDateTime.getDate(), iHours, iMinutes, 0, 0);

                        arrayPrelimData_2 = [dteDate4Charting];
                        var uniqueSiteIDs = [];  //Remove duplicates from the siteid array
                        $.each(app.pGage.m_arrray_StationIDs, function(i, el){
                            if($.inArray(el, uniqueSiteIDs) === -1) uniqueSiteIDs.push(el);
                        });

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

                            if (iVal2Chart == 108) {
                                var temp = "";
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
              data.addColumn('date', 'Datetime1');
              for (var ii = 0; ii < uniqueSiteIDs.length; ii++){
                data.addColumn('number', uniqueSiteIDs[ii]);
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
                                                                app.pGage.m_arrray_RiverSectionStatus[i][21]));

                self.gageRecords = ko.observableArray(arrayKOTemp);
                
                self.CurrentDisplayGageRecord = ko.observable(self.gageRecords()[0]);
                self.selectThing = function (item) {
                    document.getElementById("divSectionDetail").style.visibility = 'visible';
                    self.CurrentDisplayGageRecord(item);
                };
                self.doSomething = function (item) {
                    alert(item.ID);
                }

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

            if (typeof app.H2O_ID == "undefined") {
                strQuery = "OBJECTID >= 0";
            } else {
                strQuery = "Watershed = '" + app.H2O_ID + "'";
            }
            this.getArray2Process(app.strHFL_URL, strQuery);         
        },

        SectionsReceived: function (arrayProc) {
            app.pGage.m_arrray_Detail4Chart = [];

            var EntiretrHTML = "";
            var iCounterCFS = 0;
            var iCounterTemperature = 0;

            var arraySiteIDs = [];
            for (var ii in arrayProc) {
                arraySiteIDs.push(arrayProc[ii][1]);
            }
            var strSiteIDs = arraySiteIDs.join(",");
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
            var arrayOIDYellow = [];
            var arrayOIDsGold = [];
            var arrayOIDsOrange = [];
            var arrayOIDsRed = [];

            var strURLGagePrefix = "https://nwis.waterservices.usgs.gov/nwis/iv/";
            strURLGagePrefix += "?format=json&indent=on&siteStatus=all";
            strURLGagePrefix += "&startDT=" + this.dteStartDay2Check;    //start date
            strURLGagePrefix += "&endDT=" + this.dteEndDay2Check;      //end date
            strURLGagePrefix += "&parameterCd=" + "00010,00060";

            app.strURLGage = strURLGagePrefix + "&sites=" + strSiteIDs;        //siteID

            $.getJSON(app.strURLGage)   //http://api.jquery.com/jquery.getjson/
                .done(function (jsonResult) {
                    arrayJSONValues = jsonResult.value.timeSeries;

                    dom.map(arrayProc, function (itemSectionRefined) {  //loop through the sections
                        strStreamName = itemSectionRefined[0];
                        strSiteID = itemSectionRefined[1];
                        iSectionID = itemSectionRefined[2];
                        iLateFlowPref4ConsvValue = itemSectionRefined[3];

                        if (iLateFlowPref4ConsvValue == 9) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                            iLateFlowPref4ConsvValue = 1200;
                        }

                        iLateFlowConsvValue = itemSectionRefined[4];

                        if (iLateFlowConsvValue == 9) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                            iLateFlowConsvValue = 800;
                        }

                        iLateFlowClosureValueFlow = itemSectionRefined[5];
                        if (iLateFlowClosureValueFlow == 9) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                            iLateFlowClosureValueFlow = 200;
                        }

                        iTempClosureValue = itemSectionRefined[6];
                        strMONTHDAYEarlyFlowFromDroughtManagementTarget = itemSectionRefined[7];
                        strMONTHDAYEarlyFlowToDroughtManagementTarget = itemSectionRefined[8];
                        iEarlyFlowDroughtManagementTarget = itemSectionRefined[9];
                        strEarlyFlowDroughtManagementTargetMessage = itemSectionRefined[10];
                        strLateFlowPref4ConsvValue = itemSectionRefined[11];
                        strLateFlowConsvValue = itemSectionRefined[12];
                        strLateFlowClosureValueFlow = itemSectionRefined[13];
                        strTempCollected = itemSectionRefined[14];
                        iOID = itemSectionRefined[15];

                        var dteLatestDateTimeTemp = "";
                        var dteLatestDateTimeCFS = "";
                        var dblLatestTemp = "";
                        var dblLatestCFS = "";
                        var arrayTempsAbove = [];
                        var strSiteName = "";
                        var strID = "";

                        var strSiteFlowStatus = "OPEN" //OPEN, PREPARE FOR CONSERVATION, CONSERVATION, RIVER CLOSURE (CLOSED TO FISHING)
                        //strSiteFlowStatus += " (Targets " + iLateFlowPref4ConsvValue.toString() + "/" + iLateFlowConsvValue.toString() + "/" + iLateFlowClosureValueFlow.toString() + ")";

                        var strSiteTempStatus = "OPEN" //OPEN, HOOT-OWL FISHING RESTRICTIONS CRITERIA, RIVER CLOSURE (CLOSED TO FISHING) CRITERIA
                        iTempClosureValueCelsius = (iTempClosureValue - 32) * (5 / 9);
                        //strSiteTempStatus += " (Targets " + Math.round(iTempClosureValueCelsius).toString() + ")";

                        var strHyperlinkURL = strURLGagePrefix + "&sites=" + strSiteID;        //siteID
                        strHyperlinkURL = returnURL4GSgage(strHyperlinkURL);

                        var itemFound = arrayJSONValues.filter(function (itemArraySearch) {
                            return typeof itemArraySearch.name == 'string' && itemArraySearch.name.indexOf(strSiteID) > -1;
                        });
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

                        arrray_Detail4Interpolation = [];
                        blnRealValues = false;
                        str3DayCFSTrend = "images/blank.png";

                        if (CFSItem != "") {
                            arrayJSONValues2 = CFSItem.values[0].value;
                            jQuery.each(arrayJSONValues2, function (k, item2) {
                                var dteDateTime = new Date(item2.dateTime);
                                var strNoData = "";
                                if ((dteDateTime > dteLatestDateTimeCFS) | (dteLatestDateTimeCFS == "")) {
                                    dteLatestDateTimeCFS = dteDateTime;
                                    dblLatestCFS = parseFloat(item2.value);
                                }

                                if (item2.value != -999999) {
                                    blnRealValues = true;
                                }

                                var obj = {};
                                obj["id"] = strStreamName + "," + iSectionID + "," + strSiteID;
                                obj["date"] = dteDateTime.getFullYear() + "-" + ("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTime.getDate()).slice(-2);
                                obj["time"] = dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
                                obj["cfs"] = parseFloat(item2.value);
                                obj["gagedatetime"] = dteDateTime;

                                app.pGage.m_arrray_Detail4Chart.push(obj);
                                obj["EPOCH"] = Date.parse(dteDateTime);
                                arrray_Detail4Interpolation.push(obj);

                                iCounterCFS += 1;  //not needed
                            });

                            if ((arrray_Detail4Interpolation.length > 0) & (blnRealValues)) { //figure out if the flow trend is increasing or decreasing
                                arrray_Detail4Interpolation.sort(function (a, b) {
                                    var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)
                                    return dateA - dateB //sort by date ascending
                                })

                                arrayX = [];
                                arrayY = [];

                                for (var ilr = 0; ilr < arrray_Detail4Interpolation.length; ilr++) {
                                    arrayX.push(arrray_Detail4Interpolation[ilr].EPOCH);
                                    arrayY.push(arrray_Detail4Interpolation[ilr].cfs);
                                }
                                var lr = linearRegression(arrayY, arrayX);

                                islope = lr.slope;
                                if ((islope < 0.000001) & (islope > -0.000001)) {
                                    str3DayCFSTrend = "images/flat2.png";
                                } else if (islope > 0) {
                                    str3DayCFSTrend = "images/up.png";
                                } else {
                                    str3DayCFSTrend = "images/down.png";
                                }
                                arrayX = [];  //clear out the var's
                                arrayY = [];
                                arrray_Detail4Interpolation = [];
                            }

                        }
                        arrayJSONValues2 = []; //clear out the array
                        if (temperatureItem != "") {
                            arrayJSONValues22 = temperatureItem.values[0].value;
                            jQuery.each(arrayJSONValues22, function (k, item22) {
                                var dteDateTimeTemperature = new Date(item22.dateTime);
                                if ((dteDateTimeTemperature > dteLatestDateTimeTemp) | (dteLatestDateTimeTemp == "")) {
                                    dteLatestDateTimeTemp = dteDateTimeTemperature;
                                    dblLatestTemp = parseFloat(item22.value);
                                }

                                if (parseFloat(item22.value) >= iTempClosureValue) {
                                    arrayTempsAbove.push([dteDateTimeTemperature, parseFloat(item22.value)]);
                                }  // add this to later determine if over temp for past 3 days

                                iCounterTemperature += 1;
                            });
                        }
                        arrayJSONValues22 = []; //clear out the array

                        CFSItem = "";
                        temperatureItem = "";

                        if (itemFound.length > 0) {
                            var item = itemFound[0];
                            var strNoDataLabel4Charting = "";
                            if (dblLatestCFS == -999999) {
                                dblLatestCFS = "CFS Not Available"
                                dteLatestDateTimeTemp = new Date();
                                strNoDataLabel4Charting = " (No Data)";
                            } else if (dblLatestCFS == "") {
                                dblLatestCFS = "CFS Not Collected"
                                strNoDataLabel4Charting = " (No Data)";
                                dteLatestDateTimeTemp = new Date();
                            } else {//determine the site's status based on discharge
                                if ((dblLatestCFS <= iLateFlowPref4ConsvValue) & (dblLatestCFS > iLateFlowConsvValue)) {
                                    strSiteFlowStatus = "PREPARE FOR CONSERVATION";
                                    arrayOIDYellow.push(iOID);
                                }
                                if ((dblLatestCFS <= iLateFlowConsvValue) & (dblLatestCFS > iLateFlowClosureValueFlow)) {
                                    strSiteFlowStatus = "CONSERVATION";
                                    arrayOIDsGold.push(iOID);
                                }
                                if (dblLatestCFS <= iLateFlowClosureValueFlow) {
                                    strSiteFlowStatus = "UNOFFICIAL RIVER CLOSURE";
                                    arrayOIDsOrange.push(iOID);
                                }
                            }

                            app.pGage.m_arrray_StationIDs.push(strStreamName + "," + iSectionID + "," + strSiteID + strNoDataLabel4Charting);  // using this array of station id's to pivot the table for charting
                            strSiteName = item.sourceInfo.siteName;

                            if (dblLatestTemp == -999999) {
                                dblLatestTempFahrenhet = "Temp Not Available"
                                dteLatestDateTimeCFS = new Date();
                            } else if (dblLatestTemp == "") {
                                dblLatestTempFahrenhet = "Temp Not Collected"
                                dteLatestDateTimeCFS = new Date();
                            } else {
                                dblLatestTempFahrenhet = dblLatestTemp * 9 / 5 + 32;
                                if (dblLatestTempFahrenhet > iTempClosureValue) { strSiteTempStatus = "UNOFFICIAL RIVER CLOSURE"; }
                            }

                            var streamSectionDispalyName = strSiteName.replace(", MT", "").replace(" MT", "").replace(strStreamName, "").replace("Big Hole R", "");
                            streamSectionDispalyName = streamSectionDispalyName.replace("Red Rock Cr ", "");
                            streamSectionDispalyName = streamSectionDispalyName.replace("E Gallatin R ", "");
                            if (streamSectionDispalyName == "") {
                                streamSectionDispalyName = strStreamName + " Section";
                            }

                            app.pGage.m_arrray_RiverSectionStatus.push([streamSectionDispalyName, strHyperlinkURL,
                                dteLatestDateTimeTemp, dblLatestTempFahrenhet.toString().replace("-999999", "Data Not Available"), strSiteTempStatus,
                                dteLatestDateTimeCFS, dblLatestCFS.toString(), strSiteFlowStatus, strID, strStreamName, iSectionID, str3DayCFSTrend,
                                strMONTHDAYEarlyFlowFromDroughtManagementTarget,
                                strMONTHDAYEarlyFlowToDroughtManagementTarget,
                                iLateFlowPref4ConsvValue,
                                iLateFlowConsvValue,
                                iLateFlowClosureValueFlow,
                                strLateFlowPref4ConsvValue,
                                strLateFlowConsvValue,
                                strLateFlowClosureValueFlow,
                                iTempClosureValue,
                                strTempCollected
                            ]);
                        }

                        var blnAddNew = false;
                        dteLatestDateTimeTemp = "";
                        dteLatestDateTimeCFS = "";
                        dblLatestTemp = "";
                        dblLatestCFS = "";
                        arrayTempsAbove = [];
                        strSiteName = "";

                    })



                    var vm = new app.pGage.readingsViewModel();
                    ko.applyBindings(vm, document.getElementById("entriesCon_div"));
                    ko.applyBindings(vm, document.getElementById("divSectionDetail"));
                    
                    //alert('The first element is ' + vm.gageRecords()[0].SiteName);
                  var elements = document.getElementsByTagName('tr');  //Sets the click event for the row
                  for (var i = 0; i < elements.length; i++) {
                        (elements)[i].addEventListener("click", function () {
                            var strTempText = this.innerHTML;
                            strTempText = strTempText.substring(strTempText.indexOf("StreamName") + ("StreamName".length + 2), strTempText.length);
                            var strClickStreamName = strTempText.substring(0, strTempText.indexOf("</span>"));
                            strTempText = strTempText.substring(strTempText.indexOf("SectionID") + ("SectionID".length + 2), strTempText.length);
                            var strClickSegmentID = strTempText.substring(0, strTempText.indexOf("</span>"));

                            app.pZoom.qry_Zoom2FeatureLayerByQuery(app.strHFL_URL + "4", "(StreamName = '" + strClickStreamName + "') and " + "(SectionID = '" + strClickSegmentID + "')");
                            
                        });

                      if ((elements)[i].innerHTML.indexOf("STATE") > -1) {
                          (elements)[i].style.color = 'white';
                          (elements)[i].style.backgroundColor = "rgb(255, 0, 0)";
                      }
                       if ((elements)[i].innerHTML.indexOf("UNOFFICIAL") > -1) {
                            (elements)[i].style.color = 'white';
                            (elements)[i].style.backgroundColor = "rgb(253, 106, 2)";
                        }
                        else if (((elements)[i].innerHTML.indexOf("CONSERVATION") > -1) & ((elements)[i].innerHTML.indexOf("PREPARE FOR CONSERVATION") == -1)) {
                            (elements)[i].style.color = 'white';
                            (elements)[i].style.backgroundColor = "rgb(249, 166, 2)";
                        }
                        else if ((elements)[i].innerHTML.indexOf("PREPARE FOR CONSERVATION") > -1) {
                            (elements)[i].style.color = 'black';
                            (elements)[i].style.backgroundColor = "rgb(255, 255, 0)";
                        }


                        else if ((elements)[i].innerHTML.indexOf("OPEN") > -1) {
                            (elements)[i].style.color = 'green';
                        } else {
                            var temp2 = "";
                        }

                    }

                  app.pSup.addStreamConditionFeatureLayer(arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange, arrayOIDsRed);
                  tableHighlightRow();

                    app.pGage.m_arrray_Detail4Chart.sort(function (a, b) {
                        var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)
                        return dateA - dateB //sort by date ascending
                    })

                  var ViewModel2_model = new app.pGage.ViewModel2();
                  ko.applyBindings(ViewModel2_model, document.getElementById("ViewModel2Binding_div"));
                  $(window).resize(function () { //this is necessary to call for responsivness since google charts are sized are not changeable, must re-create
                        var element = $('#ViewModel2Binding_div')[0];
                        ko.cleanNode(element);
                        ko.applyBindings(ViewModel2_model, document.getElementById("ViewModel2Binding_div"));
                  });

                  arrayJSONValues = [];

              })
              .fail(function (jqxhr, textStatus, error) {
                  var err = textStatus + ", " + error;
                  console.log("Request Failed: " + err);
              });

        },



        err: function (err) {
            console.log("Failed to get results 1 due to an error: ", err);
        }

    });
}
);