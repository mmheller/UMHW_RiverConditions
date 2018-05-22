
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "dojo/promise/all",
  "esri/layers/FeatureLayer",
  "esri/tasks/query",
  "dojo/promise/all",
  "esri/request", "dojo/_base/array", 
  "esri/geometry/Polygon",
  "dojo/dom",
  "dojo/dom-class",
  "dijit/registry",
  "dojo/on",
  "esri/map"
], function (
            declare, lang, esriRequest, all, FeatureLayer, Query, All,
            request, Polygon, dom, domClass, registry,  on, Map
) {

    return declare([], {
        qry_Zoom2FeatureLayerExtent: function (pFeatureLayer1) {
            var pQueryT1 = new esri.tasks.QueryTask(pFeatureLayer1.url);
            var pQuery1 = new esri.tasks.Query();

            pQuery1.returnGeometry = true;
            pQuery1.outFields = ["objectid"];

            var strQuery1 = pFeatureLayer1.getDefinitionExpression();
            pQuery1.where = strQuery1;

            var FLayer1, pPromises
            FLayer1 = pQueryT1.execute(pQuery1);

            pPromises = new all([FLayer1]);
            return pPromises.then(returnZoomEvents, err);


            function returnZoomEvents(results) {
                var resultFeatures = [];
                resultFeatures = resultFeatures.concat(results[0].features);
                if (resultFeatures.length > 0) {
                    var pExtent;
                    pfeatureExtent1 = esri.graphicsExtent(resultFeatures);
                    var ptempSR = new esri.SpatialReference({ "wkid": 3857 });
                    if (pfeatureExtent1) {
                        if ((pfeatureExtent1.xmin != pfeatureExtent1.xmax) & (pfeatureExtent1.ymin != pfeatureExtent1.ymax)) {  //if not a multipoint feature then continue
                            pExtent = new esri.geometry.Extent(pfeatureExtent1.xmin, pfeatureExtent1.ymin, pfeatureExtent1.xmax, pfeatureExtent1.ymax, new esri.SpatialReference({ "wkid": 3857 }));
                        }
                    }
                    if (pExtent == undefined) {
                        var pFeature1 = resultFeatures[0];
                        mapPoint1 = new Point(pFeature1.geometry.points[0][0], pFeature1.geometry.points[0][1], ptempSR);
                        app.map.centerAndZoom(mapPoint1, 9);
                    }
                    if (pExtent) {
                        pExtent = pExtent.expand(app.dblExpandNum);
                        app.map.setExtent(pExtent, true);
                    }
                    else { var strMessage = "hold it up here"; }
                }
                else {                    // do nothing                }
                    return results;
                }
            }

            function err(err) {
                console.log("Failed to get zoom results due to an error: ", err);
            }

        },

        err2: function (err) {
            console.log("Failed to get results 1 due to an error: ", err);
        }

    });
}
);