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

function getArray2Process() {
    //var siteNameArrray = [["BIG HOLE", "06024450", 1, 60, 40, 20, 73, "Fishing prohibited 2pm – 12am and in place until re-opening criteria are met", 73, "4/1", "6/30", 160, "Water users with CCAA site plans will be required to implement their plans. Non-CCAA water users will be contacted by DNRC and MFWP, advised of flow conditions and encouraged to implement conservation measures. This target is specific to the CCAA goal of maintaining spawning and rearing flow requirements for Arctic grayling."]];


    //var siteNameArrray = [
    //             ["BIG HOLE", "06024580", 2, 170, 140, 100, 73, "Fishing prohibited 2pm – 12am and in place until re-opening criteria are met", 73, "4/1", "6/30", 450, "Water users with CCAA site plans will be required to implement their plans. Non-CCAA water users will be contacted by DNRC and MFWP, advised of flow conditions and encouraged to implement conservation measures. This target is specific to the CCAA goal of maintaining spawning and rearing flow requirements for Arctic grayling."],
    //             ["BIG HOLE", "06024450", 1, 60, 40, 20, 73, "Fishing prohibited 2pm – 12am and in place until re-opening criteria are met", 73, "4/1", "6/30", 160, "Water users with CCAA site plans will be required to implement their plans. Non-CCAA water users will be contacted by DNRC and MFWP, advised of flow conditions and encouraged to implement conservation measures. This target is specific to the CCAA goal of maintaining spawning and rearing flow requirements for Arctic grayling."]];


    var siteNameArrray = [["BIG HOLE", "06026420", 5, 200, 150, 100, 73, "Fishing prohibited 2pm – 12am and in place until re-opening criteria are met", 73, "", "", "", ""],
              ["BIG HOLE", "06026210", 4, 290, 240, 190, 73, "Fishing prohibited 2pm – 12am and in place until re-opening criteria are met", 73, "", "", "", ""],
              ["BIG HOLE", "06025250", 3, 250, 200, 150, 73, "Fishing prohibited 2pm – 12am and in place until re-opening criteria are met", 73, "", "", "", ""],
              ["BIG HOLE", "06024580", 2, 170, 140, 100, 73, "Fishing prohibited 2pm – 12am and in place until re-opening criteria are met", 73, "4/1", "6/30", 450, "Water users with CCAA site plans will be required to implement their plans. Non-CCAA water users will be contacted by DNRC and MFWP, advised of flow conditions and encouraged to implement conservation measures. This target is specific to the CCAA goal of maintaining spawning and rearing flow requirements for Arctic grayling."],
              ["BIG HOLE", "06024450", 1, 60, 40, 20, 73, "Fishing prohibited 2pm – 12am and in place until re-opening criteria are met", 73, "4/1", "6/30", 160, "Water users with CCAA site plans will be required to implement their plans. Non-CCAA water users will be contacted by DNRC and MFWP, advised of flow conditions and encouraged to implement conservation measures. This target is specific to the CCAA goal of maintaining spawning and rearing flow requirements for Arctic grayling."]];
    return siteNameArrray;
}


//Explore drilldown examples https://js.devexpress.com/Demos/WidgetsGallery/Demo/Charts/ChartsDrillDown/Knockout/Light/


define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "dojo/promise/all",
  "dojo/promise/all",
  "esri/request", "dojo/_base/array", 
  "dojo/dom",
  "dojo/dom-class",
  "dijit/registry",
  "dojo/on"
], function (
            declare, lang, esriRequest, all, All, request, dom, domClass, registry,  on
) {

    return declare([], {
        m_arrray_RiverSectionStatus: [],
        //m_Array2Process: getArray2Process(),
        m_ProcessingIndex: 0,

        gageReadings: function (strSiteName, strHyperlinkURL,
                                            dteLatestDateTimeTemp, dblLatestTemp, strSiteTempStatus,
                                            dteLatestDateTimeCFS, dteLatestCFS, strSiteFlowStatus) {// Class to represent a row in the gage values grid
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

            //self.GageHeight = rGageHeight;
            //self.formattedGageHeightDateTime = ko.computed(function () {
            //    var GageHeightDateTime = dGageHeightDateTime;
            //    return GageHeightDateTime ? "----" + GageHeightDateTime : "None";
            //});
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
                                                                  app.pGage.m_arrray_RiverSectionStatus[i][7]))

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
            var arrayProc = getArray2Process();
            //if (app.pGage.m_ProcessingIndex == null) {
            //    app.pGage.m_ProcessingIndex = 0
            //}
            var iProcIndex = app.pGage.m_ProcessingIndex;
            var arraySiteIDInfo = arrayProc[iProcIndex];
            //this.m_arrray_RiverSectionStatus = [];
            var strStreamName = arraySiteIDInfo[0];
            var strSiteID = arraySiteIDInfo[1];
            var iSectionID = arraySiteIDInfo[2];
            var iLateFlowPref4ConsvValue = arraySiteIDInfo[3];
            var iLateFlowConsvValue = arraySiteIDInfo[4];
            var iLateFlowClosureValueFlow = arraySiteIDInfo[5];
            var iLateFlowHootValue = arraySiteIDInfo[6];
            var strHootMessage = arraySiteIDInfo[7];
            var iTempClosureValue = arraySiteIDInfo[8];
            var strMONTHDAYEarlyFlowFromDroughtManagementTarget = arraySiteIDInfo[9];
            var strMONTHDAYEarlyFlowToDroughtManagementTarget = arraySiteIDInfo[10];
            var iEarlyFlowDroughtManagementTarget = arraySiteIDInfo[11];
            var strEarlyFlowDroughtManagementTargetMessage = arraySiteIDInfo[12];

            var arrayCFS_Temp_Height = ["00010", "00060"];  //00010 Temperature, water ||||   00060 Discharge  ||||   00065 Gage Height 
            //var arrayCFS_Temp_Height = ["00065", "00010", "00060"];  //00010 Temperature, water ||||   00060 Discharge  ||||   00065 Gage Height 
            //for (var i = 0; i < arrayCFS_Temp_Height.length; i++) {
                app.strURL = "https://nwis.waterservices.usgs.gov/nwis/iv/";
                app.strURL += "?format=json&indent=on&siteStatus=all";
                app.strURL += "&startDT=" + dteStartDay2Check;    //start date
                app.strURL += "&endDT=" + dteEndDay2Check;      //end date
                app.strURL += "&sites=" + strSiteID;        //siteID

                //var strMeasurementType = arrayCFS_Temp_Height[i];
                //app.strURL += "&parameterCd=" + strMeasurementType;
                app.strURL += "&parameterCd=" + "00010,00060";
                 
                var strHyperlinkURL = returnURL4GSgage(app.strURL);
                

                $.getJSON(app.strURL)   //http://api.jquery.com/jquery.getjson/
                  .done(function (jsonResult) {
                      var dteLatestDateTimeTemp = "";
                      var dteLatestDateTimeCFS = "";
                      var dblLatestTemp = "";
                      var dblLatestCFS = "";
                      var arrayTempsAbove = "";
                      var strSiteName = "";
                      var strID = ""

                      arrayJSONValues = jsonResult.value.timeSeries;

                      var trHTML = '';
                      jQuery.each(arrayJSONValues, function (k, item) {
                          strID = item.name;
                          strID = strID.substring(strID.indexOf(":") + 1, strID.length);
                          strID = strID.substring(1, strID.indexOf(":"));

                          strSiteName = item.sourceInfo.siteName;
                          var strAgencyCode = item.sourceInfo.siteCode[0].agencyCode;
                          var strvariableDescription = item.variable.variableDescription;
                          arrayJSONValues2 = item.values[0].value;

                          jQuery.each(arrayJSONValues2, function (k, item2) {
                              var dteDateTime = new Date(item2.dateTime);
                              var strDateTime = (dteDateTime.getMonth() + 1) + "/" + dteDateTime.getDate() + "/" + dteDateTime.getFullYear();
                              strDateTime += " " + dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true})

                              if (strvariableDescription == "Temperature, water, degrees Celsius") { //water temp
                                  if ((dteDateTime > dteLatestDateTimeTemp) | (dteLatestDateTimeTemp == "")) {
                                      dteLatestDateTimeTemp = dteDateTime;
                                      dblLatestTemp = item2.value;
                                  }
                                  if (item2.value >= iTempClosureValue) { 
                                      arrayTempsAbove.append([dteDateTime, item2.value]); 
                                  }  // add this to later determine if over temp for past 3 days
                              }

                              if (strvariableDescription == "Discharge, cubic feet per second") { //water temp
                                  if ((dteDateTime > dteLatestDateTimeCFS) | (dteLatestDateTimeCFS == "")) {
                                      dteLatestDateTimeCFS = dteDateTime;
                                      dblLatestCFS = item2.value;
                                  }
                              } 
                              
                              trHTML += '<tr><td>' + '<a href=' + strHyperlinkURL + ' target="_blank">' + strSiteName + '</a>' + '</td><td>' + strAgencyCode + '</td><td>' + item2.value + '</td><td>' + strvariableDescription.replace("cubic feet per second", "cfs").replace("Temperature, water, degrees Celsius", "Water Temp (C)").replace("Gage height, feet", "Gage height (ft)") + '</td><td>' + strDateTime + '</td></tr>';
                          });
                      });

                      if (arrayJSONValues.length > 0){
                          jQuery('#display').append(trHTML);
                      
                          var strSiteFlowStatus = "OPEN" //OPEN, PREPARE FOR CONSERVATION, CONSERVATION, RIVER CLOSURE (CLOSED TO FISHING)
                          var strSiteTempStatus = "OPEN" //OPEN, HOOT-OWL FISHING RESTRICTIONS CRITERIA, RIVER CLOSURE (CLOSED TO FISHING) CRITERIA

                          //determine the site's status based on water temperature
                          dblLatestTempFahrenhet = dblLatestTemp * 9 / 5 + 32;
                          if (dblLatestTempFahrenhet > iTempClosureValue) { strSiteTempStatus = "RIVER CLOSURE (CLOSED TO FISHING) CRITERIA"; }
                          //determine the site's status based on discharge
                          if ((dblLatestCFS >= iLateFlowPref4ConsvValue) & (dblLatestCFS < iLateFlowConsvValue)) { strSiteFlowStatus = "PREPARE FOR CONSERVATION"; }
                          if ((dblLatestCFS >= iLateFlowConsvValue) & (dblLatestCFS < iLateFlowClosureValueFlow)) { strSiteFlowStatus = "CONSERVATION"; }
                          if (dblLatestCFS >= iLateFlowClosureValueFlow) { strSiteFlowStatus = "RIVER CLOSURE (CLOSED TO FISHING)"; }
                      
                          var blnAddNew = true;

                          if (strID != strSiteID) {
                              //alert("warning out of sync");
                          }

                          for (var ii in app.pGage.m_arrray_RiverSectionStatus) {
                              if (app.pGage.m_arrray_RiverSectionStatus[ii][8] == strID) {
                                  blnAddNew = false;
                                  if (dblLatestTemp != ""){
                                      app.pGage.m_arrray_RiverSectionStatus[ii][2] = dteLatestDateTimeTemp;
                                      app.pGage.m_arrray_RiverSectionStatus[ii][3] = dblLatestTemp;
                                      app.pGage.m_arrray_RiverSectionStatus[ii][4] = strSiteTempStatus;
                                  }
                                  if (dblLatestCFS != "") {
                                      app.pGage.m_arrray_RiverSectionStatus[ii][5] = dteLatestDateTimeCFS;
                                      app.pGage.m_arrray_RiverSectionStatus[ii][6] = dblLatestCFS;
                                      app.pGage.m_arrray_RiverSectionStatus[ii][7] = strSiteFlowStatus;
                                  }
                              }
                          }
                          if (blnAddNew) {
                              app.pGage.m_arrray_RiverSectionStatus.push([strSiteName, strHyperlinkURL,
                                                                         dteLatestDateTimeTemp, dblLatestTemp, strSiteTempStatus,
                                                                         dteLatestDateTimeCFS, dblLatestCFS, strSiteFlowStatus, strID]);
                          }

                      } else {
                          var dteDateTime = new Date();
                          app.pGage.m_arrray_RiverSectionStatus.push([strSiteID, strHyperlinkURL,
                                                                        dteDateTime, "-", "Does Not Apply:NO Gage Reading",
                                                                        dteDateTime, "-", "Does Not Apply:NO Gage Reading", strSiteID]);

                      }

                      app.pGage.m_ProcessingIndex += 1;

                      if (arrayProc.length == app.pGage.m_ProcessingIndex) {
                          ko.applyBindings(new app.pGage.readingsViewModel());
                          var elements = document.getElementsByTagName('td');  //Sets the click event for the row
                          for (var i = 0; i < elements.length; i++) {
                              (elements)[i].addEventListener("click", function () {
                                  alert(this.innerHTML);
                              });
                          }
                          tableHighlightRow();
                      } else {
                          app.pGage.Start("2017-08-13", "2017-08-16");
                      }

                  })
                  .fail(function (jqxhr, textStatus, error) {
                      var err = textStatus + ", " + error;
                      console.log("Request Failed: " + err);
                  });
            //}

            ////determine the site's status based on water temperature
            //if (dteLatestTemp > iTempClosureValue) { strSiteTempStatus = "RIVER CLOSURE (CLOSED TO FISHING) CRITERIA"; }
            ////determine the site's status based on discharge
            //if ((dblLatestCFS >= iLateFlowPref4ConsvValue) & (dblLatestCFS < iLateFlowConsvValue)) { strSiteFlowStatus = "PREPARE FOR CONSERVATION"; }
            //if ((dblLatestCFS >= iLateFlowConsvValue) & (dblLatestCFS < iLateFlowClosureValueFlow)) {strSiteFlowStatus = "CONSERVATION"; }
            //if (dblLatestCFS >= iLateFlowClosureValueFlow) {strSiteFlowStatus = "RIVER CLOSURE (CLOSED TO FISHING)"; }

            //if (strSiteName != "") {
            //    this.m_arrray_RiverSectionStatus.append([strSiteName, strHyperlinkURL,
            //                                        dteLatestDateTimeTemp, dteLatestTemp, strSiteTempStatus,
            //                                        dteLatestDateTimeCFS, dteLatestCFS, strSiteFlowStatus]);
            //}
        },

        err2: function (err) {
            console.log("Failed to get results 1 due to an error: ", err);
        }

    });
}
);