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
        m_ProcessingIndex: 0,

        gageReadings: function (strSiteName, strHyperlinkURL,
                                            dteLatestDateTimeTemp, dblLatestTemp, strSiteTempStatus,
                                            dteLatestDateTimeCFS, dteLatestCFS, strSiteFlowStatus, strGageID,
                                            strStreamName, strSectionID) {// Class to represent a row in the gage values grid
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
        },
        
        handleSectionGageResults: function (results) {
            var items = dom.map(results, function (result) {
                return result;
            });
            var streamSectionArrray = [];
            var strGageID_Source = null;
            //var strGageTitle = null;
            //var strGageURL = null;
            var strTempCollected = null;

            dom.map(items[0].features, function (itemSection) {
                strGageID_Source = null;
                dom.map(items[1].features, function (itemGage) {                //query by     Watershed , StreamName, Section_ID 
                    if ((itemGage.attributes.Watershed === itemSection.attributes.Watershed) &
                        (itemGage.attributes.StreamName === itemSection.attributes.StreamName) &
                        (itemGage.attributes.Section_ID === itemSection.attributes.SectionID) &
                        (itemGage.attributes.Symbology === "TRIGGER MEASURE LOCATION")) {

                        strGageID_Source = itemGage.attributes.GageID_Source;
                        //strGageTitle = itemGage.attributes.GageTitle ;
                        //strGageURL = itemGage.attributes.GageURL;
                        strTempCollected = itemGage.attributes.TempCollected;
                    }
                })

                if (strGageID_Source != null){
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
                                             strTempCollected
                    
                    ]);
                }
            })


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

        readingsViewModel: function () {
            var self = this;
            
            if (typeof app.pGage.m_arrray_RiverSectionStatus !== "undefined") {

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
                                                                  app.pGage.m_arrray_RiverSectionStatus[i][10]))

                self.gageRecords = ko.observableArray(arrayKOTemp);

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
            var iLateFlowHootValue = null;
            var strHootMessage = null;
            var iTempClosureValue = null;
            var strMONTHDAYEarlyFlowFromDroughtManagementTarget = null;
            var strMONTHDAYEarlyFlowToDroughtManagementTarget = null;
            var iEarlyFlowDroughtManagementTarget = null;
            var strEarlyFlowDroughtManagementTargetMessage = null;
            var strTempCollected = null;


            var strURLGagePrefix = "https://nwis.waterservices.usgs.gov/nwis/iv/";
            strURLGagePrefix += "?format=json&indent=on&siteStatus=all";
            strURLGagePrefix += "&startDT=" + this.dteStartDay2Check;    //start date
            strURLGagePrefix += "&endDT=" + this.dteEndDay2Check;      //end date
            strURLGagePrefix += "&parameterCd=" + "00010,00060";

            app.strURLGage = strURLGagePrefix + "&sites=" + strSiteIDs;        //siteID
            
            $.getJSON(app.strURLGage)   //http://api.jquery.com/jquery.getjson/
              .done(function (jsonResult) {
                  var dteLatestDateTimeTemp = "";
                  var dteLatestDateTimeCFS = "";
                  var dblLatestTemp = "";
                  var dblLatestCFS = "";
                  var arrayTempsAbove = [];
                  var strSiteName = "";
                  var strID = "";


                  arrayJSONValues = jsonResult.value.timeSeries;

                  var trHTML = '';
                  jQuery.each(arrayJSONValues, function (k, item) {
                      strID = item.name;
                      strID = strID.substring(strID.indexOf(":") + 1, strID.length);
                      strID = strID.substring(1, strID.indexOf(":"));

                      // need to figure out what to do with sections that use the same gage!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                      dom.map(arrayProc, function (itemSectionRefined) {
                          if ((itemSectionRefined[1] === strID) | (itemSectionRefined[1] === "0" + strID)) {
                              var strHyperlinkURL = strURLGagePrefix + "&sites=" + "0" + strID;        //siteID
                              strHyperlinkURL = returnURL4GSgage(strHyperlinkURL);

                              strStreamName = itemSectionRefined[0];
                              strSiteID = itemSectionRefined[1];
                              iSectionID = itemSectionRefined[2];
                              iLateFlowPref4ConsvValue = itemSectionRefined[3];
                              iLateFlowConsvValue = itemSectionRefined[4];
                              iLateFlowClosureValueFlow = itemSectionRefined[5];
                              iLateFlowHootValue = itemSectionRefined[6];
                              strHootMessage = itemSectionRefined[7];
                              iTempClosureValue = itemSectionRefined[8];
                              strMONTHDAYEarlyFlowFromDroughtManagementTarget = itemSectionRefined[9];
                              strMONTHDAYEarlyFlowToDroughtManagementTarget = itemSectionRefined[10];
                              iEarlyFlowDroughtManagementTarget = itemSectionRefined[11];
                              strEarlyFlowDroughtManagementTargetMessage = itemSectionRefined[12];
                              strTempCollected = itemSectionRefined[13];

                              strSiteName = item.sourceInfo.siteName;
                              var strAgencyCode = item.sourceInfo.siteCode[0].agencyCode;
                              var strvariableDescription = item.variable.variableDescription;
                              arrayJSONValues2 = item.values[0].value;

                              jQuery.each(arrayJSONValues2, function (k, item2) {
                                  var dteDateTime = new Date(item2.dateTime);
                                  var strDateTime = (dteDateTime.getMonth() + 1) + "/" + dteDateTime.getDate() + "/" + dteDateTime.getFullYear();
                                  strDateTime += " " + dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

                                  if (strvariableDescription == "Temperature, water, degrees Celsius") { //water temp
                                      if ((dteDateTime > dteLatestDateTimeTemp) | (dteLatestDateTimeTemp == "")) {
                                          dteLatestDateTimeTemp = dteDateTime;
                                          dblLatestTemp = item2.value;
                                      }
                                      if (item2.value >= iTempClosureValue) {
                                          arrayTempsAbove.push([dteDateTime, item2.value]);
                                      }  // add this to later determine if over temp for past 3 days
                                  }

                                  if (strvariableDescription == "Discharge, cubic feet per second") { //water temp
                                      if (item2.value != -999999) {
                                          if ((dteDateTime > dteLatestDateTimeCFS) | (dteLatestDateTimeCFS == "")) {
                                              dteLatestDateTimeCFS = dteDateTime;
                                              dblLatestCFS = item2.value;
                                          }
                                      }
                                  }

                                  trHTML += '<tr style="color:#FFF; background-color:#000"><td>' + '<a href=' + strHyperlinkURL + ' target="_blank">' + strSiteName + '</a>' + '</td><td>' + strAgencyCode + '</td><td>' + item2.value + '</td><td>' + strvariableDescription.replace("cubic feet per second", "cfs").replace("Temperature, water, degrees Celsius", "Water Temp (C)").replace("Gage height, feet", "Gage height (ft)") + '</td><td>' + strDateTime + '</td></tr>';
                              });
                          }
                      })

                      //display the detailed info
                      //jQuery('#display').append(trHTML);  //Don't Delete unless absolutly sure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                      var strSiteFlowStatus = "OPEN" //OPEN, PREPARE FOR CONSERVATION, CONSERVATION, RIVER CLOSURE (CLOSED TO FISHING)
                      strSiteFlowStatus += " (Thresholds " + iLateFlowPref4ConsvValue.toString() + "/" + iLateFlowConsvValue.toString() + "/" + iLateFlowClosureValueFlow.toString() + " cfs)";

                      var strSiteTempStatus = "OPEN" //OPEN, HOOT-OWL FISHING RESTRICTIONS CRITERIA, RIVER CLOSURE (CLOSED TO FISHING) CRITERIA

                      iTempClosureValueCelsius = (iTempClosureValue - 32) * (5 / 9);
                      strSiteTempStatus += " (Threshold " + Math.round(iTempClosureValueCelsius).toString() + " Celsius)";

                      dblLatestTempFahrenhet = dblLatestTemp * 9 / 5 + 32;
                      //determine the site's status based on water temperature
                      if (dblLatestTempFahrenhet > iTempClosureValue) { strSiteTempStatus = "UNOFFICIAL RIVER CLOSURE"; }

                      //determine the site's status based on discharge
                      if ((dblLatestCFS <= iLateFlowPref4ConsvValue) & (dblLatestCFS > iLateFlowConsvValue)) { strSiteFlowStatus = "PREPARE FOR CONSERVATION"; }
                      if ((dblLatestCFS <= iLateFlowConsvValue) & (dblLatestCFS > iLateFlowClosureValueFlow)) { strSiteFlowStatus = "CONSERVATION"; }
                      if (dblLatestCFS <= iLateFlowClosureValueFlow) { strSiteFlowStatus = "UNOFFICIAL RIVER CLOSURE"; }

                      

                      //for (var ii in app.pGage.m_arrray_RiverSectionStatus) {
                      //    if (app.pGage.m_arrray_RiverSectionStatus[ii][8] == strID) {
                      //        blnAddNew = false;
                      //        if (dblLatestTemp != "") {
                      //            app.pGage.m_arrray_RiverSectionStatus[ii][2] = dteLatestDateTimeTemp;
                      //            app.pGage.m_arrray_RiverSectionStatus[ii][3] = dblLatestTemp;
                      //            app.pGage.m_arrray_RiverSectionStatus[ii][4] = strSiteTempStatus;
                      //        }
                      //        if (dblLatestCFS != "") {
                      //            app.pGage.m_arrray_RiverSectionStatus[ii][5] = dteLatestDateTimeCFS;
                      //            app.pGage.m_arrray_RiverSectionStatus[ii][6] = dblLatestCFS;
                      //            app.pGage.m_arrray_RiverSectionStatus[ii][7] = strSiteFlowStatus;
                      //        }
                      //    }
                      //}

                      if ((dblLatestTemp != "") & (dblLatestCFS != "")) {
                          blnAddNew = true;
                      }

                      if (blnAddNew) {
                          app.pGage.m_arrray_RiverSectionStatus.push([strSiteName.replace(", MT", "").replace(" MT", ""), strHyperlinkURL,
                                                                     dteLatestDateTimeTemp, dblLatestTemp.replace("-999999", "Data Not Available"), strSiteTempStatus,
                                                                     dteLatestDateTimeCFS, dblLatestCFS, strSiteFlowStatus, strID, strStreamName, iSectionID]);

                          var blnAddNew = false;
                          dteLatestDateTimeTemp = "";
                          dteLatestDateTimeCFS = "";
                          dblLatestTemp = "";
                          dblLatestCFS = "";
                          arrayTempsAbove = [];
                          strSiteName = "";
                      }

                  });

                    ko.applyBindings(new app.pGage.readingsViewModel());
                    var elements = document.getElementsByTagName('td');  //Sets the click event for the row
                    for (var i = 0; i < elements.length; i++) {
                        (elements)[i].addEventListener("click", function () {
                            var strTempText = this.innerHTML;
                            strTempText = strTempText.substring(strTempText.indexOf("StreamName") + ("StreamName".length + 2), strTempText.length);
                            var strClickStreamName = strTempText.substring(0, strTempText.indexOf("</span>"));
                            strTempText = strTempText.substring(strTempText.indexOf("SectionID") + ("SectionID".length + 2), strTempText.length);
                            var strClickSegmentID = strTempText.substring(0, strTempText.indexOf("</span>"));




                            app.pZoom.qry_Zoom2FeatureLayerByQuery(app.strHFL_URL + "4", "(StreamName = '" + strClickStreamName + "') and " + "(SectionID = '" + strClickSegmentID + "')");


                        });

                        if ((elements)[i].innerHTML.indexOf("Closed") > -1) {
                            (elements)[i].style.color = 'white';
                            (elements)[i].style.backgroundColor = 'red';
                        }
                        else if ((elements)[i].innerHTML.indexOf("CONSERVATION") > -1) {
                            (elements)[i].style.color = 'white';
                            (elements)[i].style.backgroundColor = 'orange';
                        }
                        else if ((elements)[i].innerHTML.indexOf("Prepare for Conservation") > -1) {
                            (elements)[i].style.color = 'white';
                            (elements)[i].style.backgroundColor = 'yellow';
                        }
                        else if ((elements)[i].innerHTML.indexOf("OPEN") > -1) {
                            (elements)[i].style.color = 'green';
                        } else {
                            var temp2 = "";
                        }

                    }

                    tableHighlightRow();
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