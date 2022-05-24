
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "dojo/promise/all",
  "esri/layers/FeatureLayer",
    "esri/rest/support/Query",
    "esri/tasks/QueryTask",
  "dojo/_base/array", 
  "esri/geometry/Polygon",
  "dojo/dom",
  "dojo/dom-class",
  "dijit/registry",
  "dojo/on",
    "esri/Map", "esri/layers/GraphicsLayer", "esri/Graphic",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/support/cimSymbolUtils"
], function (
        declare, lang, esriRequest, all, FeatureLayer, Query, QueryTask,
    Polygon, dom, domClass, registry, on, Map, GraphicsLayer, Graphic, SimpleLineSymbol, cimSymbolUtils
) {

    return declare([], {
        qry_Zoom2FeatureLayerExtent: function (pFeatureLayer1, strQueryField) {
            console.log("qry_Zoom2FeatureLayerExtent");
            let pQuery1 = new Query();
            let pQueryT1 = new QueryTask(pFeatureLayer1.url + "/" + pFeatureLayer1.layerId.toString()); //sections layer

            pQuery1.returnGeometry = true;
            pQuery1.outFields = [strQueryField];

            var strQuery1 = pFeatureLayer1.definitionExpression;

            if (strQuery1 == undefined) {
                strQuery1 = strQueryField + " > -1";
            }
            pQuery1.where = strQuery1;

            var FLayer1, pPromises
            FLayer1 = pQueryT1.execute(pQuery1);

            pPromises = new all([FLayer1]);
            return pPromises.then(returnZoomEvents, err);


            function returnZoomEvents(results) {
                var resultFeatures = [];
                resultFeatures = resultFeatures.concat(results[0].features);
                if (resultFeatures.length > 0) {
                    app.view.goTo(resultFeatures);
                }
                else {                    // do nothing                }
                    return results;
                }
            }

            function err(err) {
                console.log("Failed to get zoom results due to an error: ", err);
            }

        },

        qry_Zoom2FeatureLayerByQuery: function (strURL, strQuery1) {
            let pQuery1 = new Query();
            let pQueryT1 = new QueryTask(strURL); //sections layer

            pQuery1.returnGeometry = true;
            pQuery1.outFields = ["objectid"];
            pQuery1.where = strQuery1;

            var FLayer1, pPromises
            FLayer1 = pQueryT1.execute(pQuery1);
            pPromises = new all([FLayer1]);
            return pPromises.then(returnZoomEvents2, err);

            function returnZoomEvents2(results) {
                var resultFeatures = [];
                resultFeatures = resultFeatures.concat(results[0].features);

                if (resultFeatures.length == 1) {
                    
                    //const lineSymbol = {
                    //    type: "simple-line", // 
                    //    color: [232, 0, 0], width: 18
                    //};




                    const lineSymbol =  {
                        type: "cim",
                            // CIM Line Symbol
                            data: {
                            type: "CIMSymbolReference",
                                symbol: {
                                type: "CIMLineSymbol",
                                    symbolLayers: [
                                        {
                                            // white dashed layer at center of the line
                                            type: "CIMSolidStroke",
                                            effects: [
                                                {
                                                    type: "CIMGeometricEffectDashes",
                                                    dashTemplate: [2, 2, 2, 2], // width of dashes and spacing between the dashes
                                                    lineDashEnding: "NoConstraint",
                                                    controlPointEnding: "NoConstraint"
                                                }
                                            ],
                                            enable: true, // must be set to true in order for the symbol layer to be visible
                                            capStyle: "Butt",
                                            joinStyle: "Round",
                                            width: 1,
                                            color: [255, 255, 255, 255]
                                        },
                                        {
                                            // lighter Cyan line layer that surrounds the dashes
                                            type: "CIMSolidStroke",
                                            enable: true,
                                            capStyle: "Butt",
                                            joinStyle: "Round",
                                            width: 3,
                                            color: [0, 255, 255, 100]
                                        },
                                        {
                                            // darker green outline around the line symbol
                                            type: "CIMSolidStroke",
                                            enable: true,
                                            capStyle: "Butt",
                                            joinStyle: "Round",
                                            width: 15,
                                            color: [0, 115, 76, 50]
                                        }
                                    ]
                            }
                        }
                    }

                    var graphic =  resultFeatures[0];

                    graphic.symbol = lineSymbol;

                    setInterval(() => {
                        graphic.visible = !graphic.visible;
                    }, 1000);

                    app.view.graphics.removeAll(); // make sure to remmove previous highlighted feature
                    app.view.graphics.add(graphic);
                }

                if (resultFeatures.length > 0) {
                    /*app.view.goTo(resultFeatures);*/

                    var extent = resultFeatures[0].geometry.extent;
                    resultFeatures.forEach(function (feature) {
                        extent = extent.union(feature.geometry.extent);
                    })
                    extent = extent.expand(2);
                    app.view.goTo({
                        target: extent
                    });

                    //app.view.goTo(polyline);
                    console.log("test");
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