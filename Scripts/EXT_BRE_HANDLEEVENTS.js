/*------------------------------------------------------------------------------------------------------/
| Program		: EXT_BRE_HANDLEEVENTS.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 27/11/2016 13:01:40
|
/------------------------------------------------------------------------------------------------------*/
String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
};
function getScriptText(e) {
	var t = aa.getServiceProviderCode();
	if (arguments.length > 1)
		t = arguments[1];
	e = e.toUpperCase();
	var n = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var r = n.getScriptByPK(t, e, "ADMIN");
		return r.getScriptText() + ""
	} catch (i) {
		return ""
	}
}
SCRIPT_VERSION = "3.0";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM"));

eval(getScriptText("INCLUDE_CTX"));

function Node(text, value, attr) {
	this.text = String(text);
	if (!value) {
		value = "";
	}
	this.value = String(value);
	this.leaf = true;
	if (attr) {
		for ( var aa in attr) {
			this[aa] = attr[aa];
		}
	}
	this.children = [];

	this.createChild = function(text, value, attr) {
		var c = new Node(text, value, attr)
		this.children.push(c);
		this.leaf = false

		return c;
	}
	this.getOrCreateChild = function(text, value, attr) {
		var requested = null;
		for ( var x in this.children) {
			var child = this.children[x];
			if (child.text == text) {
				requested = child;
				break;
			}
		}
		if (requested == null) {
			requested = this.createChild(text, value, attr)

		}
		return requested;
	}
	this.fromObject = function(object) {
		for ( var x in object) {
			var val = object[x];
			if (typeof val + "" != "function") {
				var ox = this.createChild(x)

				if (val != null && typeof val != "string") {
					ox.fromObject(val)
				} else {
					ox.value = val;

				}
			}

		}
		return this;
	}
}
currentUserID = aa.getAuditID();
logDebug = function(z) {
	try {

		if (z && z != null) {

			var z = z.replaceAll("\r\n", "|");
			z = z.replaceAll("\r\n", "|");
			z = z.replaceAll("\n", "|");
			aa.print("//DEBUG:" + z)
		}
	} catch (e) {
		// TODO: handle exception
	}
}
var action = aa.env.getValue('CMD');
eval("try{cmd_" + action + "()}catch(e){aa.print('ERROR: '+e)}");
function getParam(param) {
	var val = aa.env.getValue(param);
	if (!val) {
		val = "";
	}
	return val;
}
function cmd_export() {
	var ids = String(getParam("IDS"));
	BRULES.doExport(ids.split(","));
}
function cmd_getstd() {
	var std = getParam("STD")
	var stdObj = Record.getStandardChoices(std);
	var root = []
	for ( var x in stdObj) {
		var row = stdObj[x];
		var label = row.getBizdomainValue() + "";

		var data = {
			text : String(label),
			value : String(label)
		}
		root.push(data)

	}

	aa.print(JSON.stringify(root, null, 2))
}
function cmd_loadContextLibs() {
	var node = getParam('node');
	var root = {};
	root["children"] = [];
	if (node == "root") {

		root["children"].push({
			id : "aa",
			text : "ScriptRoot",
			icon : "icons/icon16/lib.gif",
			value : "",
			leaf : false
		});

		root["children"].push({
			id : "functions",
			text : "Functions",
			icon : "icons/icon16/lib.gif",
			value : "",
			leaf : false
		});
		root["children"].push({
			id : "record",
			text : "Record",
			icon : "icons/icon16/lib.gif",
			value : "",
			leaf : false
		});
	} else if (node == "record") {

		for ( var x in Record) {
			if (Record.hasOwnProperty(x) && Record[x] instanceof Function) {
				var fnName = x;
				var fn = Record[x] + "";
				var idxStart = fn.indexOf("(");
				var idxEnd = fn.indexOf(")") + 1;
				fn = fnName + fn.substring(idxStart, idxEnd)
				root["children"].push({
					id : "JS" + fnName,
					text : fn,
					icon : "icons/icon16/fx.png",
					value : "Record." + fn,
					leaf : true
				});
			}
		}
		for ( var x in Record.prototype) {
			if (Record.prototype.hasOwnProperty(x) && Record.prototype[x] instanceof Function) {
				var fnName = x;
				var fn = Record.prototype[x] + "";
				var idxStart = fn.indexOf("(");
				var idxEnd = fn.indexOf(")") + 1;
				fn = fnName + fn.substring(idxStart, idxEnd)
				root["children"].push({
					id : "JS" + fnName,
					text : fn,
					icon : "icons/icon16/fx.png",
					value : "this.recordAPI." + fn,
					leaf : true
				});
			}
		}

	} else if (node == "functions") {
		for ( var l in this) {
			if (this.hasOwnProperty(l) && this[l] instanceof Function && !/myfunctions/i.test(l)) {

				var fnName = this[l].name;
				if (fnName.indexOf("cmd_") == 0 || fnName == "eval") {
					continue;
				}
				var src = this[l].toSource()
				var idxend = src.indexOf(")")
				var fn = src.substring(0, idxend + 1);
				var idxStart = fn.indexOf(fnName);
				fn = fn.substring(idxStart)
				var leaf = true;

				var functionsCount = Object.keys(this[l].prototype).length;
				functionsCount += Object.keys(this[l]).length;

				if (functionsCount == 0) {
					root["children"].push({
						id : "JS" + fnName,
						text : fn,
						icon : "icons/icon16/fx.png",
						value : fn,
						leaf : leaf
					});
				}

			}
		}
	} else {
		var name = node
		eval("var clazz=" + name)
		var fields = clazz.getClass().getFields();

		for ( var m in fields) {
			var field = fields[m];
			var id = name + "." + field.getName();
			root["children"].push({
				id : String(id),
				text : String(field.getName()),
				type : "object",
				icon : "icons/icon16/class.gif",
				value : "",
				leaf : false
			});
		}

		var methods = clazz.getClass().getMethods();
		for ( var m in methods) {
			var method = methods[m];

			var params = method.getParameterTypes();
			var fnName = method.getName();
			if (fnName == "wait" || fnName == "equals" || fnName == "toString" || fnName == "hashCode" || fnName == "getClass" || fnName == "notifyAll" || fnName == "notify") {
				continue
			}
			var fnparams = [];

			for ( var pi in params) {
				var p = params[pi];
				var typ = p.getSimpleName();

				//typ = typ.replace("[]", "Array");
				var pname = p.getName()
				fnparams.push(typ);
			}
			var id = name + "." + fnName;
			var val = id + "(" + fnparams.join(",") + ")/* return " + method.getReturnType().getSimpleName() + "*/";
			var txt = fnName + "(" + fnparams.join(",") + ")";
			root["children"].push({
				id : String(id),
				text : String(txt),
				icon : "icons/icon16/fx.png",
				type : "function",
				value : String(val),
				leaf : true
			});

		}

	}

	aa.print(JSON.stringify(root, null, 2))
}
function cmd_loadContext() {

	var ctx = CTX.buildTree(getParam("RECTYPE"), getParam("EVENT"), getParam("ORDER"), getParam("AGENCY"), getParam("RID"))
	var data = getParam("RDATA");
	if (data) {
		BRULES.contributeDraftToContext(ctx, data)
	}

	var root = new Node("CTX").fromObject(ctx);

	aa.print(JSON.stringify(root, null, 2))
}
function cmd_clearLogs() {

	var res = {}
	try {
		CTXLOGS.clear();
		res.success = true;
	} catch (e) {
		res.success = false;
		res.message = String(e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_getRule() {

	var res = {}
	try {
		var rule = new BRULES(getParam("ID"));
		res.DATA = rule.fields
		res.success = true;
	} catch (e) {
		res.success = false;
		res.message = String(e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_lock() {

	var res = {}
	try {
		new BRULES(getParam("ID")).lock();
		res.success = true;
	} catch (e) {
		res.success = false;
		res.message = String(e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_unlock() {

	var res = {}
	try {
		new BRULES(getParam("ID")).unlock();
		res.success = true;
	} catch (e) {
		res.success = false;
		res.message = String(e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_listLogs() {
	var start = getParam("start");
	var limit = getParam("limit");

	var filter = getParam("filter");

	var objFilter = [];
	if (filter != null && filter != "") {
		try {
			eval("objFilter=" + filter)
		} catch (e) {
			aa.print("//ERROR:" + e);
			objFilter = [];
		}

	}
	var sort = getParam("sort");
	var objSort = [];
	if (sort != null && sort != "") {
		try {
			eval("objSort=" + sort)
		} catch (e) {
			aa.print("//ERROR:" + e);
			objSort = [];
		}

	}
	CTXLOGS.listAll(start, limit, objFilter, objSort);
}
function cmd_loadRecordTypes() {
	var agencies;
	var sagencies = getParam("AGENCIES");
	if (sagencies && sagencies != null && sagencies != "") {
		agencies = sagencies.split(",")
	} else {
		service = com.accela.aa.emse.dom.service.CachedService.getInstance().getServiceProviderService()
		agencies = service.getSubAgencies(aa.getServiceProviderCode(), aa.getAuditID()).toArray();

	}
	//convert to js array
	var arr = [];
	for ( var x in agencies) {
		arr.push(agencies[x])
	}
	var ret = new DAO("R3APPTYP").execQuery({
		"SERV_PROV_CODE" : arr
	})
	var root = new Node("Record Types");
	for ( var x in ret) {
		var row = ret[x];
		var module = row["R1_PER_GROUP"]
		var type = row["R1_PER_TYPE"];
		var subtype = row["R1_PER_SUB_TYPE"];
		var category = row["R1_PER_CATEGORY"];
		var moduleNode = root.getOrCreateChild(module);
		var typeNode = moduleNode.getOrCreateChild(type);
		var subTypeNode = typeNode.getOrCreateChild(subtype);
		subTypeNode.getOrCreateChild(category);

	}

	aa.print(JSON.stringify(root, null, 2))
}
function cmd_refactor() {
	var logs = [];
	try {

		var ofield = String(getParam("OLDFIELDNAME"))
		var nfield = String(getParam("NEWFIELDNAME"))
		var otask = String(getParam("OLDTASKNAME"))
		var ntask = String(getParam("NEWTASKNAME"))
		var recordType = String(getParam("RECORDTYPE"));

		var logs = BRULES.refactorRules(recordType, ofield, nfield, otask, ntask);
	} catch (e) {
		logs.push({
			"LEVEL" : "ERROR",
			"MESSAGE" : String(e)
		})
	}
	aa.print(JSON.stringify(logs, null, 2))
}
function cmd_restorefromHistory() {
	var id = getParam("ID");
	var res = {}
	try {

		BRULES.restoreFromHistory(id);
		res.success = true;
	} catch (e) {
		res.success = false;
		e = e + "";
		e = e.replace("\n", "<br>*")
		res.message = String("*" + e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_restoreTag() {
	var res = {}
	try {
		var tag = getParam("TAG");
		var comment = getParam("COMMENT");
		BRULES.restoreTag(tag, comment);
		res.success = true;
	} catch (e) {
		res.success = false;
		e = e + "";
		e = e.replace("\n", "<br>*")
		res.message = String("*" + e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_tag() {
	var res = {}
	try {
		var tag = getParam("TAG");
		var comment = getParam("COMMENT");
		BRULES.tag(tag, comment);
		res.success = true;
	} catch (e) {
		res.success = false;
		e = e + "";
		e = e.replace("\n", "<br>*")
		res.message = String("*" + e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_changeStatus() {
	var res = {}
	try {
		var ids = getParam("IDS");

		var status = getParam("STATUS");
		new DAO("BRULES").execUpdate({
			REC_STATUS : status,
			REC_USER : aa.getAuditID(),
			REC_DATE : new Date()
		}, null, "ID in (" + ids + ")")
		var ret = new DAO("BRULES").execSimpleQuery("select * from BRULES where ID in  (" + ids + ")", []);
		var publishData = {};
		for ( var x in ret) {
			var rule = new BRULES();
			rule.fields = ret[x];
			rule.id = ret[x].ID;
			var event = rule.getEvent();
			var recType = rule.getRecordType();
			var pdata = publishData[event];
			if (pdata == null) {
				publishData[event] = {}
			}
			publishData[event][recType] = true
		}
		logDebug("publishing from change status")
		for ( var event in publishData) {
			for ( var recType in publishData[event]) {
				BRULES.publish(recType, event)
			}
		}
		res.success = true;
	} catch (e) {
		res.success = false;
		e = e + "";
		e = e.replace("\n", "<br>*")
		res.message = String("*" + e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_checkExpValidity() {
	var res = {}
	try {
		var event = getParam("EVENT");
		var recType = getParam("RECTYPE");
		var order = getParam("ORDER");
		var agency = getParam("AGENCY");
		var code = getParam("CODE")
		logDebug(code)
		var CONTEXT = CTX.buildTree(recType, event, order, agency)
		logDebug("context ready")
		CONTEXT.evaluateSolo(code);
		res.success = true;
	} catch (e) {
		res.success = false;
		res.message = String(e + "");
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_checkValidity() {
	var res = {}
	try {
		var SIDS = getParam("IDS");
		if (SIDS == null || SIDS == "") {
			BRULES.validateAll()
		} else {
			var ids = SIDS.split(",");
			for ( var x in ids) {
				var id = ids[x];
				var brule = new BRULES(id);
				brule.validate();
				brule.save();

			}
		}

		res.success = true;
	} catch (e) {
		res.success = false;
		e = e + "";
		e = e.replace("\n", "<br>*")
		res.message = String("*" + e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_saveRule() {
	try {

		var res = {};
		var strjson = getParam("JSON")
		//aa.print(strjson)
		eval("var data=" + strjson);
		if (data.ID == "-1" || data.ID == -1 || data.ID == "") {
			data.ID = null;
		}
		var brule = new BRULES(data.ID);
		if (brule.exists() && brule.getLock() != aa.getAuditID()) {
			throw "Please lock rule first";
		}
		data.TAG = "";
		brule.updateFromData(data);

		res.success = true;
		res.ID = String(brule.getID());
		res.DATA = new BRULES(brule.getID()).fields
	} catch (e) {
		res.success = false;
		e = e + "";
		e = e.replace("\n", "<br>*")
		res.message = String("*" + e);
	}
	aa.print(JSON.stringify([ res ], null, 2))
}
function cmd_getPageFlow() {
	var recType = getParam("RECTYPE");
	var agency = getParam("AGENCY");
	if (!agency) {
		agency = aa.getServiceProviderCode();

	}
	var pageFlow = CTX.getPageFlowDetails(recType, agency);
	aa.print(JSON.stringify(pageFlow, null, 2))
}
function cmd_listEvents() {
	var root = [];
	var data = {
		text : String("Page Flow"),
		value : String("pageflow")
	}
	root.push(data)
	var events = Record.getStandardChoices("EMSE_VARIABLE_BRANCH_PREFIX");
	for ( var x in events) {
		var row = events[x];
		var label = row.getBizdomainValue() + "";
		var newLabel = label[0];
		for (i = 1; i < label.length; i++) {
			var character = label[i]
			if (character == character.toUpperCase()) {
				newLabel += " ";
			}
			newLabel += character;
		}

		var data = {
			text : String(newLabel),
			value : String(row.getBizdomainValue())
		}
		root.push(data)

	}

	aa.print(JSON.stringify(root, null, 2))
}
function cmd_updateAgencyParent() {
	var agency = getParam("AGENCY");
	var parent = getParam("PARENT")
	var servprovdao = Record.getDao('com.accela.aa.aamain.systemConfig.ServiceProviderDAO');
	var arr = aa.util.newArrayList();
	var agencyModel = servprovdao.getServiceProviderByPK(agency);
	agencyModel.setParentServProvCode(parent)
	servprovdao.updateAgencyRelations(arr, aa.getAuditID())

	var strQry = "UPDATE RSERV_PROV SET PARENT_SERV_PROV_CODE=? WHERE SERV_PROV_CODE=?"
	var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
	var result = dba.update(strQry, [ parent, agency ]);
}
function cmd_listAgencies() {
	function arrAgencytoObject(Obj, arr, parent, myagencies, master) {
		if (parent == null) {
			parent = ""
		}
		for ( var x in arr) {
			var a = arr[x];
			var c = a.getServiceProviderCode();
			var p = a.getParentServProvCode();
			if (p == null) {
				p = "";
			}
			if (p == parent) {
				var label = a.getName();
				var name = a.getServiceProviderCode();
				if (name == "ADMIN" || name == "STANDARDDATA") {
					continue;
				}

				var attr = {
					admin : myagencies[name] || aa.getServiceProviderCode() == master,
					expanded : true,
					leaf : false,
					allowDrag : aa.getServiceProviderCode() == master,
					current : name == aa.getServiceProviderCode()
				}
				var aobj = Obj.getOrCreateChild(label, name, attr);
				arrAgencytoObject(aobj, arr, c, myagencies, master)
			}
		}
	}
	service = com.accela.aa.emse.dom.service.CachedService.getInstance().getServiceProviderService()
	var agencies = service.getServiceProviders().toArray()
	var htagency = {};
	var root = new Node("Agencies");
	var arrmyagencies = service.getSubAgencies(aa.getServiceProviderCode(), aa.getAuditID()).toArray()
	var myagencies = {};
	for ( var i in arrmyagencies) {
		myagencies[arrmyagencies[i]] = true;
	}
	//myagencies["MUNI1"] = true
	var master = Record.getLookupVal("BRULES_CONFIG", "MASTERAGENCY");

	arrAgencytoObject(root, agencies, null, myagencies, master)

	aa.print(JSON.stringify(root, null, 2))
}
function cmd_listActions() {
	var ret = [];
	var actions = BRA.listAll();
	for ( var x in actions) {
		ret.push(actions[x].toJsonObject());
	}
	aa.print(JSON.stringify(ret, null, 2))
}
function cmd_shareRules() {
	var logs = [];

	try {
		var ids = getParam("IDS");
		var arr = ids.split(",");
		var arrids = [];
		for ( var x in arr) {
			arrids.push(arr[x])
		}
		var agencies = getParam("AGENCIES").split(",");
		var validate = getParam("RVALIDATE");
		validate = validate == "true";
		var duplicate = getParam("DUPLICATE");
		duplicate = duplicate == "true";
		var stopOnError = getParam('STOPONERROR');
		stopOnError = stopOnError == "true";
		var rules = new DAO("BRULES").execQuery({
			ID : arrids
		})
		logs.push({
			"LEVEL" : "INFO",
			"MESSAGE" : String("Sharing " + rules.length + " rules with " + agencies.join(",") + ", validate=" + validate + ", duplicate=" + duplicate + ", stop on Error="
					+ stopOnError)
		})
		for ( var x in rules) {
			var brule = new BRULES();
			brule.fields = rules[x];
			brule.id = rules[x].ID
			var newagencies = [];
			for ( var z in agencies) {
				var agency = agencies[z];
				if (brule.getStringField(BRULES.FIELDS.AGENCIES).indexOf(agency) >= 0) {
					logs.push({
						"LEVEL" : "WARN",
						"MESSAGE" : String(brule + " is already applied for " + agency)
					})

				} else {
					newagencies.push(agency)
				}
			}
			if (newagencies.length == 0) {
				continue
			}

			try {
				logs.push({
					"LEVEL" : "INFO",
					"MESSAGE" : String("Sharing " + brule)
				})
				brule.shareWith(newagencies, validate, duplicate);

			} catch (e) {
				if (!stopOnError) {
					logs.push({
						"LEVEL" : "WARN",
						"MESSAGE" : String(e)
					})
				} else {
					throw e;
				}

			}

		}
	} catch (e) {
		logs.push({
			"LEVEL" : "ERROR",
			"MESSAGE" : String(e)
		})
	}
	aa.print(JSON.stringify(logs, null, 2))
}
function cmd_runEvent() {

	try {

		var ruleid = getParam("ID")
		var data = getParam("EVENTPARAMS")
		eval("var params=" + data);
		for ( var x in params) {
			aa.env.setValue(x, params[x])
		}
		logDebug("executing rule " + ruleid + " with ALTID=" + params.altID)

		CTX.executeRule(params.altID, ruleid);

	} catch (e) {
		CTX.LOGS.push({
			"LEVEL" : "ERROR",
			"MESSAGE" : String(e)
		})
	}
	aa.print(JSON.stringify(CTX.LOGS, null, 2))

}
function cmd_getEventParams(ruleID) {
	var id = getParam("ID");
	var rule = new BRULES(id);
	event = rule.getEvent();
	var module = rule.getStringField(BRULES.FIELDS.RMODULE)
	if (!module) {
		module = "%"
	}
	var type = rule.getStringField(BRULES.FIELDS.RTYPE)
	if (!type) {
		type = "%"
	}

	var subtype = rule.getStringField(BRULES.FIELDS.RSUBTYPE)
	if (!subtype) {
		subtype = "%"
	}
	var cat = rule.getStringField(BRULES.FIELDS.RCATEGORY)
	if (!cat) {
		cat = "%"
	}
	var recQparams = [ aa.getServiceProviderCode(), module, type, subtype, cat ]
	var recQ = "select top(1) B1_ALT_ID ALTID,B1_PER_ID1 PermitId1,B1_PER_ID2 PermitId2,B1_PER_ID3 PermitId3";
	recQ += " from b1permit where SERV_PROV_CODE=? ";

	recQ += " and B1_MODULE_NAME like ? ";
	recQ += " and B1_PER_TYPE like ? ";
	recQ += " and B1_PER_SUB_TYPE like ? ";
	recQ += " and B1_PER_CATEGORY like ? ";
	recQ += " and REC_STATUS='A' and B1_APPL_CLASS in('COMPLETE','EDITABLE') order by REC_DATE DESC";

	var data = new DAO("b1permit").execSimpleQuery(recQ, recQparams);
	if (data.length > 0) {
		data = data[0]
	} else {
		data = {
			"ALTID" : ""
		}
	}
	data.CURRENTUSERID = aa.getAuditID();

	var strQry = "SELECT p.MAPPED_ENV_NAME FROM REVT_EVENT_PARAM X, REVT_PARAM P WHERE X.EVENT_NAME = '" + event
			+ "'  AND X.PARAM_SEQ_NBR = P.PARAM_SEQ_NBR ORDER BY P.IN_OUT, P.MAPPED_ENV_NAME, P.PARAM_NAME";
	var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
	var result = dba.select(strQry, []);
	fields = result.toArray()
	var config = {}
	var jsonArray = [];
	config["altID"] = data["ALTID"];
	for ( var x in fields) {
		var field = fields[x];
		var defVal = data[field[0].toUpperCase()];
		defVal = defVal ? defVal : ""
		config[field[0]] = String(defVal);
	}
	aa.print(JSON.stringify([ config ], null, 2))
}
function cmd_getActionParams() {
	var id = getParam("ID");
	logDebug("ID=" + id)
	var action = BRA.getActionByID(id);
	aa.print(JSON.stringify([ action.getAllParams() ], null, 2))
}
function cmd_getParamValues() {
	var id = getParam("ID");
	var param = getParam("PARAM");
	var recType = getParam("RECTYPE");
	logDebug("ID=" + id + ",PARAM=" + param + ",RECTYPE=" + recType)
	var action = BRA.getActionByID(id);
	var values = action.getParamValues(recType, param);
	aa.print(JSON.stringify(values, null, 2))
}
function cmd_listHistory() {
	var start = getParam("start");
	var limit = getParam("limit");

	var filter = getParam("filter");

	var objFilter = [];
	if (filter != null && filter != "") {
		try {
			eval("objFilter=" + filter)
		} catch (e) {
			aa.print("//ERROR:" + e);
			objFilter = [];
		}

	}
	var sort = getParam("sort");
	var objSort = [];
	if (sort != null && sort != "") {
		try {
			eval("objSort=" + sort)
		} catch (e) {
			aa.print("//ERROR:" + e);
			objSort = [];
		}

	}
	BRULES.listAllHistory(start, limit, objFilter, objSort);
}
function cmd_getSingleLog() {
	var id = getParam("ID");
	log = new CTXLOGS(id);
	aa.print(log.getStringField(CTXLOGS.FIELDS.EXECLOG))
}
function cmd_listRules() {
	var start = getParam("start");
	var limit = getParam("limit");

	var filter = getParam("filter");

	var objFilter = [];
	if (filter != null && filter != "") {
		try {
			eval("objFilter=" + filter)
		} catch (e) {
			aa.print("//ERROR:" + e);
			objFilter = [];
		}

	}
	var sort = getParam("sort");
	var objSort = [];
	if (sort != null && sort != "") {
		try {
			eval("objSort=" + sort)
		} catch (e) {
			aa.print("//ERROR:" + e);
			objSort = [];
		}

	}
	BRULES.listAll(start, limit, objFilter, objSort);
}