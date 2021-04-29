export class GraphData {
  static colorCodes = [
    "#048A81",
    "#06D6A0",
    "#54C6EB",
    "#8A89C0",
    "#CA8DC6",
    "#FF93B3",
    "#FFA891",
    "#FFCD72",
    "#F9F871"
  ];
  static maxDepth = 1;
  static id = 1;
  static lid = 1;
  static GLOBAL_DATA = {};
  static positionConfig = {};
  static idConfig = {};
  static NODE_HEIGHT = 100;
  static NODE_WIDTH = 270;

  static restructureJsonSchema(jsonData) {
    const data = this.populateGraphData(jsonData);
    data.nodeMetrics["flow-chart"] = this.populatePositionProperties(
      data.nodeMetrics["flow-chart"],
      data.positionConfig,
      data.jsonSchema
    );
    data.nodeMetrics["flow-chart"] = this.populateLineProperty(
      data.nodeMetrics["flow-chart"],
      data.jsonSchema
    );
    // console.log(data.positionConfig);
    // console.log(data["nodeMetrics"]["flow-chart"]);
    return data;
  }

  static populateLineProperty(flowChart, jsonSchema) {
    let lNodes = [];
    for (var i in jsonSchema) {
      if (i === "0") continue;
      const parentKey = this.findImmediateParentKey(i);
      const nodeLevel = i.split(".").length;
      let sourceNode =
        nodeLevel === 1 ? this.idConfig[0] : this.idConfig[parentKey];
      let targetNode = this.idConfig[i];
      lNodes.push(this.generateFlowChartLine(sourceNode, targetNode));
    }
    flowChart = flowChart.concat(lNodes);
    return flowChart;
  }

  static populatePositionProperties(flowChart, positionConfig, jsonSchema) {
    let currentKey = "",
      positionProp;
    for (let i = 0; i < flowChart.length; i++) {
      const node = flowChart[i];
      if (!node._isNode) continue;
      const nodeKey = node._key.split(".");
      const nodeLevel = nodeKey.length;
      if (
        currentKey !== node._parentKey &&
        node._parentKey !== node._key &&
        nodeLevel !== 1
      ) {
        currentKey = node._parentKey;
        positionProp = positionConfig[node._parentKey];
        positionProp.count = 0;
      }
      let multiplier;
      if (nodeLevel === 1) {
        const positionData = positionConfig[node._parentKey];
        const mid =
          Math.ceil(
            (positionData.spacingEnd - positionData.spacingStart + 1) / 2
          ) - 1;
        node.position.y = (positionData.spacingStart + mid) * this.NODE_HEIGHT;
        multiplier = positionData.xAxis < 0 ? -1 : 1;
      } else {
        multiplier = positionProp.xAxis < 0 ? -1 : 1;
        node.position.y =
          (positionProp.count + positionProp.spacingStart) * this.NODE_HEIGHT;
      }
      node.position.x = multiplier * nodeLevel * this.NODE_WIDTH;
      positionProp && positionProp.count++;
    }
    const parentFlowNode = this.generateFlowChartConfig(
      jsonSchema[0],
      1,
      "0",
      true,
      undefined,
      true
    );
    parentFlowNode.sourcePosition = "left";
    parentFlowNode.targetPosition = "right";
    parentFlowNode.style.width = "220px";
    parentFlowNode.style.left = "-50px";
    parentFlowNode.className = "central-node";
    parentFlowNode.position.y = "-20";
    //(Math.ceil(this.GLOBAL_DATA["max-spacing"] / 2) - 1) * this.NODE_HEIGHT;
    flowChart = flowChart.concat(parentFlowNode);
    return flowChart;
  }

  static populateGraphData(jsonSchema) {
    this.maxDepth = 1;
    this.GLOBAL_DATA = {
      "max-spacing": 0
    };
    this.idConfig = {};
    this.id = 0;
    this.lid = 0;
    let graphProperties = {};
    let json = jsonSchema;
    json = JSON.parse(json);
    const parentJsonKey = Object.keys(json)[0];
    let config = json[parentJsonKey];
    let childData = [],
      mapData = {};

    for (var prop in config) {
      let obj = config[prop];
      this.setKeyData(prop, childData, obj, graphProperties, config);
    }
    mapData = {
      shortName: Object.keys(json)[0],
      fullName: null,
      children: childData,
      style: {
        background: this.colorCodes[0]
      }
    };
    config[0] = parentJsonKey;
    return {
      jsonSchema: config,
      mapData: mapData,
      positionConfig: this.positionConfig,
      nodeMetrics: this.getNodeMetrics(graphProperties, config)
    };
  }

  static setKeyData(dataKey, obj, value, graphProperties, jsonSchema) {
    const key = dataKey.split(".");
    const propKey = this.findImmediateParentKey(dataKey);
    if (propKey !== dataKey || !jsonSchema[propKey + ".1"]) {
      if (!graphProperties[propKey]) {
        graphProperties[propKey] = !jsonSchema[propKey + ".1"] ? 0 : 1;
      } else {
        graphProperties[propKey]++;
      }
    }
    const maxValue = key.length - 1;
    let addChildData = false;
    if (parseInt(key[0], 10) > this.maxDepth) {
      this.maxDepth = parseInt(key[0], 10);
    }
    for (let i = 0; i < key.length; i++) {
      let id = parseInt(key[i], 10) - 1;
      if (obj[id]) {
        if (i === id) {
          obj = obj[id].children;
        } else {
          obj = obj[id].children;
          addChildData = true;
        }
      } else {
        if (i === maxValue) {
          if (addChildData) {
            obj.push(this.getSubNodeData(value, parseInt(key[0], 10)));
            addChildData = false;
          } else {
            obj[id] = this.getSubNodeData(value, parseInt(key[0], 10));
          }
        } else {
          obj[id] = {};
        }
      }
    }
  }

  static getSubNodeData(value, depth) {
    const shortTitle = value.length >= 15 ? this.getShortName(value) : value;
    const fullName = value.length >= 15 ? value : null;
    return {
      shortName: shortTitle,
      fullName: fullName,
      children: [],
      style: {
        background: this.colorCodes[depth]
          ? this.colorCodes[depth]
          : this.colorCodes[depth % this.colorCodes.length]
      }
    };
  }

  static getShortName(name, limit) {
    return name.substr(0, limit || 15) + "..";
  }

  static getNodeMetrics(graphProperties, jsonSchema) {
    let nodeQuantityData = {
      LEFT: { meta: {}, data: {} },
      RIGHT: { meta: {}, data: {} }
    };
    var midNode = Math.floor(this.maxDepth / 2);
    for (let i in graphProperties) {
      if (parseFloat(i, 10) <= midNode) {
        nodeQuantityData["LEFT"]["meta"][i] = graphProperties[i];
      } else {
        nodeQuantityData["RIGHT"]["meta"][i] = graphProperties[i];
      }
    }
    let flowChartData = [];
    let data = this.getNodeLevelCount(
      nodeQuantityData["LEFT"]["meta"],
      true,
      jsonSchema
    );
    nodeQuantityData["LEFT"]["data"] = data.nodeData;
    flowChartData = flowChartData.concat(data.graphData);
    data = this.getNodeLevelCount(
      nodeQuantityData["RIGHT"]["meta"],
      false,
      jsonSchema
    );
    flowChartData = flowChartData.concat(data.graphData);
    nodeQuantityData["RIGHT"]["data"] = data.nodeData;
    nodeQuantityData["flow-chart"] = flowChartData;
    return nodeQuantityData;
  }

  static getNodeLevelCount(nodeKeys, isLeft, jsonSchema) {
    this.GLOBAL_DATA["overall-spacing"] = 0;
    const nodes = this.getNodeLevelData(nodeKeys, jsonSchema);
    const multiplier = isLeft ? -1 : 1;
    let graphData = [];
    for (let key in nodes) {
      let node = nodes[key];

      const flowChartConfig = this.populateNodeSpacingData(
        node,
        nodeKeys,
        multiplier,
        jsonSchema
      );
      graphData = graphData.concat(flowChartConfig);
    }
    return { nodeData: nodes, graphData: graphData };
  }

  static populateNodeSpacingData(node, nodeKeys, multiplier, jsonSchema) {
    if (this.isEmptyObject(node.childNodes)) {
      //There's no child data...
      const spacing = node.childCount;
      node.spacingStart = this.GLOBAL_DATA["overall-spacing"];
      node.spacingEnd = this.GLOBAL_DATA["overall-spacing"] + spacing - 1;
      this.GLOBAL_DATA["overall-spacing"] += spacing;
      this.positionConfig[node.parentKey] = {
        spacingStart: node.spacingStart,
        spacingEnd: node.spacingEnd,
        xAxis: multiplier * node.parentKey.split(".").length
      };
      const flowChartData = this.populateFlowChartData(
        node,
        multiplier,
        nodeKeys,
        jsonSchema
      );
      return flowChartData;
    }
    const childNodes = node.childNodes;
    node.spacingStart = this.GLOBAL_DATA["overall-spacing"];
    let flowChartData = this.populateFlowChartData(
      node,
      multiplier,
      nodeKeys,
      jsonSchema
    );
    let nodeObj = null;
    for (let i in childNodes) {
      nodeObj = childNodes[i];
      let nodeSpace = nodeObj.childCount;
      let nodeParent = this.findImmediateParentKey(i);
      let nodeParentSpace = nodeKeys[nodeParent];
      let spacing = this.findNodeSpacing(
        nodeSpace,
        i,
        nodeParentSpace,
        nodeParent,
        nodeKeys
      );
      nodeObj.spacingStart =
        this.GLOBAL_DATA["overall-spacing"] + spacing - nodeObj.childCount;
      nodeObj.spacingEnd = this.GLOBAL_DATA["overall-spacing"] + spacing - 1;
      this.GLOBAL_DATA["overall-spacing"] += spacing;
      this.positionConfig[i] = {
        spacingStart: nodeObj.spacingStart,
        spacingEnd: nodeObj.spacingEnd,
        xAxis: multiplier * i.split(".").length
      };
      let childFlowChartData = this.populateFlowChartData(
        nodeObj,
        multiplier,
        nodeKeys,
        jsonSchema
      );
      flowChartData = flowChartData.concat(childFlowChartData);
    }
    node.spacingEnd = node.spacingStart + nodeObj.spacingEnd - 1;
    this.positionConfig[node.parentKey] = {
      spacingStart: node.spacingStart,
      spacingEnd: node.spacingEnd,
      xAxis: multiplier * node.parentKey.split(".").length
    };
    if (this.GLOBAL_DATA["overall-spacing"] > this.GLOBAL_DATA["max-spacing"]) {
      this.GLOBAL_DATA["max-spacing"] = this.GLOBAL_DATA["overall-spacing"];
    }
    return flowChartData;
  }

  static populateFlowChartData(node, multiplier, nodeKeys, jsonSchema) {
    let data = [];
    data.push(
      this.generateFlowChartConfig(
        node.label,
        multiplier,
        node.parentKey,
        true,
        undefined,
        node.childCount > 0
      )
    );
    const parentId = data[0].id;
    for (let i = 0; i < node.schema.length; i++) {
      const config = this.generateFlowChartConfig(
        node.schema[i].label,
        multiplier,
        node.parentKey,
        false,
        node.schema[i].childNumber
      );
      data.push(config);
    }
    return data;
  }

  static generateFlowChartConfig(
    label,
    multiplier,
    parentKey,
    isParent,
    count,
    hasChildren
  ) {
    const id = "horizontal-" + this.getId();
    let key = isParent ? parentKey : parentKey + "." + count;
    const nodeKey = key.split(".");
    this.idConfig[key] = id;
    if (hasChildren) {
      // console.log("HAS CHILDREN ::" + key);
    }
    let data = {
      id: id,
      ...(!hasChildren && { type: "input" }),
      data: { label: label },
      position: { x: 0, y: 0 },
      _isNode: true,
      _parentKey: parentKey,
      _key: key,
      draggable: false,
      style: {
        fontSize: "12px",
        padding: "2px 0",
        minHeight: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: this.colorCodes[nodeKey[0] % 9],
        borderColor: "black",
        borderWidth: "3px",
        borderRadius: "10px",
        fontWeight: "bold"
      }
    };
    this.updateNodeEdgePosition(data, multiplier, hasChildren);
    return data;
  }

  static updateNodeEdgePosition(node, multiplier, hasChildren) {
    if (multiplier === -1) {
      if (hasChildren) {
        node.sourcePosition = "left";
        node.targetPosition = "right";
      } else {
        node.sourcePosition = "right";
      }
    } else {
      if (hasChildren) {
        node.sourcePosition = "right";
        node.targetPosition = "left";
      } else {
        node.sourcePosition = "left";
      }
    }
  }

  static generateFlowChartLine(sourceId, targetId) {
    return {
      id: "horizontal-e5-" + this.getLineId(),
      source: sourceId,
      // type: "step", //"smoothstep",
      target: targetId,
      style: { stroke: "black" }
    };
  }

  static getLineId() {
    this.lid++;
    return this.lid;
  }

  static getId() {
    this.id++;
    return this.id;
  }

  static findNodeSpacing(
    nodeSpace,
    node,
    nodeParentSpace,
    nodeParent,
    nodeKeys
  ) {
    let childKey = this.findChildKey(node);
    const nodeSpacing = this.getSpaceVariationConfig(nodeSpace);
    const nodeParentSpacing = this.getSpaceVariationConfig(
      nodeParentSpace,
      childKey
    );
    const NP_U = !nodeKeys[nodeParent + "." + (childKey - 1)]
      ? nodeParentSpacing.upper
      : 0;
    const NP_L = !nodeKeys[nodeParent + "." + (childKey + 1)]
      ? nodeParentSpacing.lower
      : 0;
    const space =
      1 + Math.max(nodeSpacing.upper, NP_U) + Math.max(nodeSpacing.lower, NP_L);
    return space;
  }

  static getSpaceVariationConfig(nodeCount, nodeKey) {
    const mid = Math.ceil(nodeCount / 2);
    if (nodeKey) {
      return {
        upper: nodeKey - 1,
        mid: nodeKey,
        lower: nodeCount - nodeKey
      };
    }
    return {
      upper: mid - 1 < 0 ? 0 : mid - 1,
      mid: mid,
      lower: nodeCount - mid
    };
  }

  static getNodeLevelData(nodeKeys, jsonSchema) {
    let nodeConfig = {};
    for (let i in nodeKeys) {
      let data = {
        childCount: nodeKeys[i],
        childNodes: {},
        parentKey: i,
        spacingStart: "",
        spacingEnd: "",
        label: jsonSchema[i],
        schema: this.populateLabelData(i, nodeKeys[i], jsonSchema)
      };
      const key = this.findImmediateParentKey(i);
      if (i.split(".").length === 1) {
        nodeConfig[key] = data;
      } else {
        nodeConfig[key]["childNodes"][i] = data;
      }
    }
    return nodeConfig;
  }

  static populateLabelData(key, childCount, jsonSchema) {
    var labels = [];
    for (let i = 1; i <= childCount; i++) {
      const id = key + "." + i;
      if (jsonSchema[id + ".1"]) continue;
      let label = jsonSchema[id];
      labels.push({ label: label, childNumber: i });
    }
    return labels;
  }

  static findImmediateParentKey(dataKey) {
    const key = dataKey.split(".");
    return key.length === 1
      ? key[0]
      : dataKey.substr(0, dataKey.length - (key[key.length - 1].length + 1));
  }

  static findChildKey(dataKey) {
    const key = dataKey.split(".");
    return key.length === 1
      ? parseInt(key[0], 10)
      : parseInt(dataKey[dataKey.length - 1], 10);
  }

  static sortData(nodes) {
    let data = [];
    let keys = Object.keys(nodes);
    let length = keys.length;
    let minVal = 0,
      defaultValue = nodes[keys[keys.length - 1]];
    for (let i = 0; i < length; i++) {
      const datum = this.findLeastData(minVal, nodes, defaultValue);
      minVal = datum.parentKey;
      data.push(datum);
    }
    return data;
  }

  static findLeastData(minVal, nodes, defaultValue) {
    for (var i in nodes) {
      if (i <= defaultValue && i > minVal) {
        defaultValue = i;
      }
    }
    return nodes[defaultValue];
  }

  static isEmptyObject(obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        return false;
      }
    }
    return true;
  }

  //UNUSED METHODS BELOW;
  static getNodeLevelDataV0(nodeKeys) {
    let levelCount = {};
    let count = 0;
    for (let i in nodeKeys) {
      let keys = i.split(".");
      if (!levelCount["L" + keys.length]) {
        count++;
        levelCount["L" + keys.length] = {
          nodesCount: nodeKeys[i],
          nodes: {},
          levelSpacing: ""
        };
        levelCount["L" + keys.length]["nodes"][i] = {
          childCount: nodeKeys[i],
          parentKey: i,
          spacingStart: "",
          spacingEnd: "",
          spacing: ""
        };
      } else {
        levelCount["L" + keys.length]["nodesCount"] += nodeKeys[i];
        levelCount["L" + keys.length]["nodes"][i] = {
          childCount: nodeKeys[i],
          parentKey: i,
          spacing: ""
        };
      }
    }
    return { levels: levelCount, maxLevel: count };
  }
}
