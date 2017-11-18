/*------------------------------------------------------------------------------------------------------/

| Program		: INCLUDE_BRULES.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 27/11/2016 12:42:20
|
/------------------------------------------------------------------------------------------------------*/

if (typeof BRA === "undefined") {
	eval(getScriptText("INCLUDE_BRA"));
}
if (typeof DAO === "undefined") {
	eval(getScriptText("INCLUDE_DAO"));
}
//if (typeof CTX === "undefined") {
//eval(getScriptText("INCLUDE_CTX"));
//}
function BRULES(id) {
	DBO.call(this, "BRULES", "ID", id);
};
BRULES.prototype = Object.create(DBO.prototype);
BRULES.prototype.constructor = BRULES;
BRULES.VERSION = "1.0.0";

String.prototype.replaceAll = function(search, replacement) {
	var target = this
	var res = "";
	var idx = target.indexOf(search);

	while (idx >= 0) {
		res += target.substring(0, idx) + replacement;
		target = target.substring(idx + search.length)
		idx = target.indexOf(search);
	}
	return res + target;
};

/*----------------------------------------------------FIELDS-----------------------------------------------*/
BRULES.TABLENAME = "BRULES";
BRULES.FIELDS = {};
BRULES.FIELDS.ID = "ID";
BRULES.FIELDS.RNAME = "RNAME";
BRULES.FIELDS.RDESCRIPTION = "RDESCRIPTION";
BRULES.FIELDS.REVENT = "REVENT";
BRULES.FIELDS.RMODULE = "RMODULE";
BRULES.FIELDS.RTYPE = "RTYPE";
BRULES.FIELDS.RSUBTYPE = "RSUBTYPE";
BRULES.FIELDS.RCATEGORY = "RCATEGORY";
BRULES.FIELDS.RDATA = "RDATA";
BRULES.FIELDS.RSCRIPT = "RSCRIPT";
BRULES.FIELDS.REC_STATUS = "REC_STATUS";
BRULES.FIELDS.REC_USER = "REC_USER";
BRULES.FIELDS.REC_DATE = "REC_DATE";
BRULES.FIELDS.VERSION = "VERSION";
BRULES.FIELDS.AGENCIES = "AGENCIES";
BRULES.FIELDS.VALIDATION = "VALIDATION";
BRULES.FIELDS.TAG = "TAG";
BRULES.FIELDS.RORDER = "RORDER";
BRULES.FIELDS.RLOCK = "RLOCK";
BRULES.FIELDS.RSCOPE = "RSCOPE";
BRULES.FIELDS.RAUDIENCE = "RAUDIENCE";
BRULES.FIELDS.RMODE = "RMODE";
BRULES.FIELDS.GUID = "GUID";
BRULES.generateGUID = function() {
	var d = new Date().getTime();

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}
BRULES.prototype.getNextVersion = function(type) {
	var version = this.getStringField(BRULES.FIELDS.VERSION);
	if (version == "") {
		version = "1.0.0";
	} else {
		var arrv = version.split(".");
		for ( var x in arrv) {
			arrv[x] = parseInt(arrv[x], 10)
		}
		if (type == "MAJ") {
			arrv[0]++;
			arrv[1] = 0
			arrv[2] = 0;
		} else if (type == "MIN") {
			arrv[1]++;
			arrv[2] = 0

		} else {
			arrv[2]++;
		}
		version = arrv.join(".")
	}
	return version;
}
BRULES.prototype.getConditon = function() {
	var strCondition = "";
	var conditions = this.getStringField(BRULES.FIELDS.RCONDITIONS);

	if (conditions != null && conditions != "") {
		var arrCond = eval(conditions)
		for ( var x in arrCond) {
			var c = arrCond[x]
			var iop = c.INTRAOPERATOR == "=" ? "==" : c.INTRAOPERATOR;

			var op = c.OPERATOR == "OR" ? "||" : "&&";
			if (x == arrCond.length - 1) {
				op = "";
			}
			strCondition += c.PREFIX + c.FIELD + iop + c.VALUE + c.SUFFIX + op
		}
	}
	strCondition = strCondition == "" ? "true" : strCondition;
	return strCondition;
}
BRULES.prototype.getActions = function() {
	var arrActions = [];
	var mode = this.getStringField(BRULES.FIELDS.RMODE);
	eval("var data=" + this.getStringField(BRULES.FIELDS.RDATA));
	if (mode == "simple") {
		var actions = data.RACTIONS;
		actions.sort(function(a1, a2) {
			return a1.ORDER - a2.ORDER
		})
		for ( var x in actions) {
			var a = {};
			a.ACTION = BRA.getActionByID(actions[x].ACTION);
			var arrParams = eval("[" + actions[x].PARAMS + "]")
			if (arrParams.length == 1) {
				a.PARAMS = arrParams[0]
			} else {
				a.PARAMS = {}
			}
			arrActions.push(a)
		}
	} else {
		for ( var x in data.CHILDREN) {
			this.addComplexActions(arrActions, data.CHILDREN[x])
		}
	}
	return arrActions;
}
BRULES.prototype.addComplexActions = function(arr, node) {
	if (node.NAME == "CMD") {
		var a = {};
		var arrParams = eval("[" + node.PARAMS + "]")
		if (arrParams.length == 1) {
			a.PARAMS = arrParams[0]
		} else {
			a.PARAMS = {}
		}

		a.ACTION = BRA.getActionByID(a.PARAMS.ID);
		arr.push(a)
	} else if (node.CHILDREN) {
		for ( var z in node.CHILDREN) {
			this.addComplexActions(arr, node.CHILDREN[z])
		}
	}

}
BRULES.prototype.toString = function() {
	return this.getStringField(BRULES.FIELDS.RNAME) + " V" + this.getStringField(BRULES.FIELDS.VERSION);
}

BRULES.prototype.getScript = function() {
	return this.getStringField(BRULES.FIELDS.RSCRIPT);
}

BRULES.prototype.getEvent = function() {
	return this.getStringField(BRULES.FIELDS.REVENT)
}
BRULES.prototype.getOrder = function() {
	var order = this.getStringField(BRULES.FIELDS.RORDER)
	if (!order) {
		order = 0;
	} else {
		order = parseInt(order, 10)
	}
	return order;
}
BRULES.prototype.getLock = function() {
	return this.getStringField(BRULES.FIELDS.RLOCK)

}
BRULES.prototype.lock = function() {
	var lock = this.getLock();
	if (lock == null || lock == "" || lock == aa.getAuditID()) {
		this.setField(BRULES.FIELDS.RLOCK, aa.getAuditID())
		this.save()
	} else {
		throw "Rule is already locked by " + lock;
	}

}
BRULES.prototype.unlock = function() {
	var lock = this.getLock();
	if (lock == null || lock == "" || lock == aa.getAuditID()) {
		this.setField(BRULES.FIELDS.RLOCK, "")
		this.save()
	} else {
		throw "Rule is already locked by " + lock;
	}

}
BRULES.prototype.getRecordType = function() {

	var module = this.getStringField(BRULES.FIELDS.RMODULE)
	if (!module) {
		module = "*"
	}
	var type = this.getStringField(BRULES.FIELDS.RTYPE)
	if (!type) {
		type = "*"
	}
	//Burtamekh was here
	var subtype = this.getStringField(BRULES.FIELDS.RSUBTYPE)
	if (!subtype) {
		subtype = "*"
	}
	var cat = this.getStringField(BRULES.FIELDS.RCATEGORY)
	if (!cat) {
		cat = "*"
	}
	return module + "/" + type + "/" + subtype + "/" + cat;
}
BRULES.prototype.fixRecordType = function() {

	var module = this.getStringField(BRULES.FIELDS.RMODULE)
	if (!module) {
		this.setField(BRULES.FIELDS.RMODULE, "*")
	}
	var type = this.getStringField(BRULES.FIELDS.RTYPE)
	if (!type) {
		this.setField(BRULES.FIELDS.RTYPE, "*")
	}
	//Burtamekh was here
	var subtype = this.getStringField(BRULES.FIELDS.RSUBTYPE)
	if (!subtype) {
		this.setField(BRULES.FIELDS.RSUBTYPE, "*")
	}
	var cat = this.getStringField(BRULES.FIELDS.RCATEGORY)
	if (!cat) {
		this.setField(BRULES.FIELDS.RCATEGORY, "*")
	}
	return module + "/" + type + "/" + subtype + "/" + cat;
}
BRULES.prototype.shareWith = function(agencies, validate, duplicate) {
	if (duplicate) {
		var data = {}

		for ( var c in agencies) {
			data.AGENCIES = agencies[c];
			this.id = null;
			delete this.fields[BRULES.FIELDS.ID]
			delete this.fields[BRULES.FIELDS.VERSION]
			delete this.fields[BRULES.FIELDS.VALIDATION]
			delete this.fields[BRULES.FIELDS.RLOCK]

			this.updateFromData(data, !validate)
		}

	} else {
		var data = {}
		var ragencies = this.getAgencies()
		for ( var c in agencies) {
			ragencies.push(agencies[c])
		}

		data.AGENCIES = ragencies.join(",");
		this.updateFromData(data, !validate)
	}

}
BRULES.prototype.validate = function() {
	var validation = "";
	try {
		var service = com.accela.aa.emse.dom.service.CachedService.getInstance().getServiceProviderService()
		var availableAgencies = this.getApplicableAgencies();
		var agencies = this.getAgencies();
		for ( var x in agencies) {
			if (availableAgencies[agencies[x] + ""] != true) {
				var agencyModel = service.getServiceProviderByPK(agencies[x], aa.getAuditID())
				var label = agencyModel.getName();
				throw label + " does not contains " + this.getRecordType()
			}
		}
		var context = CTX.buildTree(this.getRecordType(), this.getEvent(), this.getOrder(), agencies[0])
		//check syntax for conditons
		var service = com.accela.aa.emse.dom.service.CachedService.getInstance().getScriptRootService()
		service.checkScriptSyntax(this.getScript())

		var arrActions = this.getActions();
		for ( var x in arrActions) {
			try {
				var action = arrActions[x].ACTION;
				var paramdef = action.getAllParams();
				var params = arrActions[x].PARAMS;
				for ( var paramName in params) {
					if (paramdef.config && paramdef.config[paramName] && paramdef.config[paramName].editor && paramdef.config[paramName].editor.xtype == "expfield") {
						if (params[paramName] != "") {
							try {

								context.evaluateSolo(params[paramName])
							} catch (e) {
								throw "SYNTAX ERROR:" + e
							}
						}

					}
				}
				action.validateParams(arrActions[x].PARAMS, context)
			} catch (e) {
				throw arrActions[x].ACTION + " PARAMS CHECK FAILED: " + e
			}

		}
		//check variables

		context.checkVariables(this.getScript())
		validation = "VALID";

	} catch (e) {
		if (e.getMessage) {
			e = e.getMessage()
		}
		validation = String(e);

	}
	this.setField(BRULES.FIELDS.VALIDATION, validation)
	return validation;
}

BRULES.prototype.checkValidity = function() {
	var validation = this.validate();
	if (validation != "VALID") {
		throw validation;
	}
}
BRULES.prototype.updateFromData = function(data, skipValidation) {

	var version = this.getNextVersion(data.VERSION_TYPE);
	for ( var x in BRULES.FIELDS) {
		var field = BRULES.FIELDS[x]
		if (field != BRULES.FIELDS.ID) {

			if (data.hasOwnProperty(field)) {
				this.setField(field, data[field])
			}
		}

	}
	this.setField(BRULES.FIELDS.VERSION, version)
	//this.setField(BRULES.FIELDS.REC_STATUS, "A")
	this.setField(BRULES.FIELDS.REC_USER, aa.getAuditID())
	this.setField(BRULES.FIELDS.REC_DATE, new Date());
	if (skipValidation != true) {
		this.checkValidity()
	}
	this.fixRecordType();

	var agencies = [];
	if (data.AGENCIES) {
		agencies = data.AGENCIES.split(",")

	}
	var service = com.accela.aa.emse.dom.service.CachedService.getInstance().getServiceProviderService()
	if (agencies.length == 0) {
		agencies = service.getSubAgencies(aa.getServiceProviderCode(), aa.getAuditID()).toArray()

	}
	if (!this.exists()) {
		var guid = this.getStringField(BRULES.FIELDS.GUID);
		if (!guid) {
			this.setField(BRULES.FIELDS.GUID, BRULES.generateGUID());
		}

	}
	this.save();

	//save agencies
	var aDAO = new DAO("BRULES_AGENCY");

	aDAO.execDelete({
		"PID" : this.getID()
	})
	for ( var x in agencies) {
		if (agencies[x] != null && agencies[x] != "") {
			aDAO.execInsert({
				PID : this.getID(),
				RAGENCY : agencies[x]
			})
			if (this.getEvent() == "pageflow") {
				this.createScript(agencies[x]);
			}

		}
	}
	if (data.VERSION_TYPE == "MAJ" || data.VERSION_TYPE == "MIN") {
		this.publish()
	}
	//save history
	this.createHistory()

}
BRULES.prototype.publish = function() {
	BRULES.publish(this.getRecordType(), this.getEvent())

}
BRULES.prototype.getScriptName = function() {

	return BRULES.getScriptName(this.getEvent(), this.getRecordType())

}
BRULES.getScriptName = function(event, recordType) {

	var prefix = Record.getLookupVal("EMSE_VARIABLE_BRANCH_PREFIX", event);
	if (!prefix) {
		throw "Event " + event + " is not implemented in Accela STD: EMSE_VARIABLE_BRANCH_PREFIX"
	}
	var sname = prefix + ".BRE:" + recordType;
	return String(sname.toUpperCase());

}
BRULES.publish = function(recType, event) {
	logDebug("publishing " + event + " for " + recType)
	var service = com.accela.aa.emse.dom.service.CachedService.getInstance().getServiceProviderService()
	var agencies = service.getSubAgencies(aa.getServiceProviderCode(), aa.getAuditID()).toArray()
	for ( var x in agencies) {
		var agency = agencies[x];
		logDebug("PUBLISHING for: " + agency)
		var rules = BRULES.getByRecordTypeAndEvent(recType, event, agency);
		if (rules.length > 0) {
			var scriptName = rules[0].getScriptName();
			var scriptLabel = scriptName.replaceAll("*", "~");
			script = "/*------------------------------------------------------------------------------------------------------/\n";
			for ( var x in rules) {
				script += "| Rule 			: " + rules[x].getID() + ":" + rules[x].getStringField(BRULES.FIELDS.RNAME) + " V" + rules[x].getStringField(BRULES.FIELDS.VERSION) + "\n";
			}
			script += "| Program		: " + scriptLabel + "\n";
			script += "| Event			: " + event + "\n";
			script += "|\n";
			script += "| Usage			:\n";
			script += "| Notes			: auto generated  Script by Business Rule Engine\n";
			script += "| Published by	: " + aa.getAuditID() + "\n";
			script += "| Published at	: " + aa.util.formatDate(new Date(), "dd/MM/yyyy HH:mm:ss") + "\n";
			script += "|\n";
			script += "/------------------------------------------------------------------------------------------------------*/\n";
			for ( var x in rules) {
				script += "\n\n";
				script += "/**\n";
				script += " * RULE NAME: " + rules[x].getStringField(BRULES.FIELDS.RNAME) + "\n";
				script += " * RULE ID: " + rules[x].getID() + "\n";
				script += " * RULE VERSION: " + rules[x].getStringField(BRULES.FIELDS.VERSION) + "\n";
				script += " */\n";

				var audience = rules[x].getStringField(BRULES.FIELDS.RAUDIENCE);
				if (audience == "AGENCY") {
					script += "if ( !this.isPublicUser()){\n"
				} else if (audience == "PUBLIC") {
					script += "if ( this.isPublicUser()){\n"
				}

				script += "CTX.RULEID =" + rules[x].getID() + ";\n"
				script += rules[x].getScript();
				if (audience == "AGENCY" || audience == "PUBLIC") {
					script += "}"

				}
			}
			logDebug("PUBLISHING AS: " + scriptName)

			CTX.createOrUpdateScript(agency, scriptName, scriptName, script);
			logDebug("SCRIPT PUBLISHED UNDER: " + scriptName)
		} else {
			var code = BRULES.getScriptName(event, recType);
			CTX.deleteScript(agency, code)
		}

	}

}
BRULES.prototype.createScript = function(agency) {
	var scope = this.getStringField(BRULES.FIELDS.RSCOPE);
	if (scope != null && scope != "") {
		var cat = this.getStringField(BRULES.FIELDS.RCATEGORY)
		if (!cat) {
			cat = "*"
		}
		scriptName = "BRULES:" + cat + "/" + scope
		scriptName = scriptName.toUpperCase()
		var js = "";
		js += "var emseBiz = com.accela.aa.emse.dom.service.CachedService.getInstance().getEMSEService();\n";
		js += "var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), 'INCLUDE_CTX_ACA', aa.getAuditID());\n";
		js += "eval(emseScript.getScriptText() + '')";
		CTX.createOrUpdateScript(agency, scriptName, scriptName, js);
		var parts = scope.split("/");

		CTX.updatePageFlowEventScript(this.getRecordType(), agency, parts[0], parts[1], parts[2], scriptName)
	}
}
BRULES.prototype.canRunOnAgency = function(agency) {
	var arr = this.getAgencies();
	var can = false;
	for ( var x in arr) {
		if (arr[x] == agency) {
			can = true;
			break;
		}
	}
	return can;
}
BRULES.prototype.getAgencies = function() {
	var strAgencies = this.getStringField(BRULES.FIELDS.AGENCIES);
	return strAgencies.split(",")
}
BRULES.prototype.getApplicableAgencies = function() {
	var params = {};
	var module = this.getStringField(BRULES.FIELDS.RMODULE)
	if (module && module != "*") {
		params["R1_PER_GROUP"] = module;
	}
	var type = this.getStringField(BRULES.FIELDS.RTYPE)
	if (type && type != "*") {
		params["R1_PER_TYPE"] = type;
	}

	var subtype = this.getStringField(BRULES.FIELDS.RSUBTYPE)
	if (subtype && subtype != "*") {
		params["R1_PER_SUB_TYPE"] = subtype;
	}
	var cat = this.getStringField(BRULES.FIELDS.RCATEGORY)
	if (cat && cat != "*") {
		params["R1_PER_CATEGORY"] = cat;
	}
	var ret = new DAO("R3APPTYP").execQuery(params)

	var appAgencies = {}
	for ( var x in ret) {
		var row = ret[x];
		var agency = row["SERV_PROV_CODE"]
		appAgencies[agency] = true;
	}
	return appAgencies;
}
BRULES.prototype.createHistory = function() {
	var fields = this.fields;
	delete fields.ID;
	delete fields.VALIDATION;
	fields.PID = this.getID();
	fields["REC_DATE"] = new Date();
	new DAO("BRULES_HISTORY").execInsert(fields);
}
BRULES.tag = function(tag, comment) {
	var res = new DAO("BRULES_HISTORY").execSimpleQuery("select count(*) TOTAL from BRULES_HISTORY WHERE UPPER(TAG)=UPPER(?)", [ tag ])
	var count = res[0]["TOTAL"]
	if (parseInt(count, 10) > 0) {
		throw "TAG Already Exist";
	}
	var rules = new DAO("BRULES").execQuery({
		REC_STATUS : "A"
	})
	for ( var x in rules) {
		var rule = new BRULES();
		rule.fields = rules[x]
		rule.id = rules[x].ID
		rule.updateFromData({
			"TAG" : tag,
			"RDESCRIPTION" : comment,
			VERSION_TYPE : "MAJ"
		}, true)
	}
}
BRULES.validateAll = function() {
	var insql = "";
	var service = com.accela.aa.emse.dom.service.CachedService.getInstance().getServiceProviderService()

	var arrAgencies = service.getSubAgencies(aa.getServiceProviderCode(), aa.getAuditID()).toArray()

	for ( var i in arrAgencies) {
		if (insql == "") {
			insql = "'" + arrAgencies[i] + "'"
		} else {
			insql += ",'" + arrAgencies[i] + "'"
		}
	}

	var agencyWhere = " ID in (select PID from BRULES_AGENCY where RAGENCY in(" + insql + "))"
	var rules = new DAO("BRULES").execQuery({
		REC_STATUS : "A"
	}, null, true, agencyWhere)
	for ( var x in rules) {
		var brule = new BRULES();
		brule.fields = rules[x];
		brule.id = rules[x].ID
		brule.validate();
		brule.save();
	}
}
BRULES.restoreFromHistory = function(ID) {
	var history = new DAO("BRULES_HISTORY").execQuery({
		"ID" : ID
	})

	if (history.length == 0) {
		throw "HISTORY does not Exist";
	}
	history = history[0];

	var rule = new BRULES(history.PID);

	delete history.ID;
	delete history.PID;
	history.TAG = "";
	delete history.VERSION
	history.VERSION_TYPE = "MAJ";
	history.VALIDATION = "";
	rule.updateFromData(history, true)

}
BRULES.restoreBackup = function(script, replaceAgency, validate) {

	var BREBACKUP = null;
	eval(getScriptText(script));
	if (BREBACKUP == null) {
		throw "Invalid Backup file: " + script;
	}
	if (BREBACKUP.BACKUP_VERSION != BRULES.VERSION) {
		throw "Backup version(" + BREBACKUP.BACKUP_VERSION + ") is different than current version( " + BRULES.VERSION + ")"
	}
	var name = BREBACKUP.NAME;
	logDebug("Restoring " + BREBACKUP.RULES.length + " rules")
	var restoreTag = "RESTORE " + name + "(" + aa.util.formatDate(new Date(), "yyyyMMddHHmmss") + ")"
	for ( var x in BREBACKUP.RULES) {
		var ruleData = BREBACKUP.RULES[x];
		ruleData.VERSION_TYPE = "MAJ";
		ruleData.TAG = restoreTag;
		if (replaceAgency) {
			ruleData.AGENCIES = aa.getServiceProviderCode();
		}
		BRULES.restoreRuleFromBackup(name, ruleData, validate);
	}
}
BRULES.restoreRuleFromBackup = function(name, ruleData, validate) {
	logDebug("Restoring " + ruleData.RNAME)
	var brules = new DAO("BRULES").execQuery({
		"GUID" : ruleData.GUID
	})
	var rule = new BRULES();

	if (brules.length > 0) {
		logDebug("RULE GUID FOUND:" + ruleData.RNAME)
		rule.fields = brules[0]
		rule.id = brules[0].ID
	}
	ruleData.REC_STATUS = 'A';
	delete ruleData.REC_USER;
	delete ruleData.REC_DATE;

	delete ruleData.ID;
	delete ruleData.VERSION;
	ruleData.RLOCK = "";

	ruleData.VALIDATION = "";
	var skipValidation = !validate;
	rule.updateFromData(ruleData, skipValidation)

}
BRULES.restoreTag = function(tag, comment) {
	var history = new DAO("BRULES_HISTORY").execQuery({
		"TAG" : tag
	})
	var restoreTag = "RESTORE " + tag + "(" + aa.util.formatDate(new Date(), "yyyyMMddHHmmss") + ")"
	restoreTag = restoreTag.replaceAll("'", "");
	if (history.length == 0) {
		throw "TAG does not Exist";
	}
	var restoredIDs = [];
	for ( var x in history) {
		var rule = new BRULES(history[x].PID);
		history[x].RDESCRIPTION = comment;
		delete history[x].ID;
		delete history[x].PID;

		delete history[x].VERSION
		history[x].TAG = restoreTag;
		history[x].VALIDATION = "";
		history[x].VERSION_TYPE = "MAJ";
		rule.updateFromData(history[x], true);

	}

	new DAO("BRULES").execUpdate({
		REC_STATUS : "I",
		REC_USER : aa.getAuditID(),
		REC_DATE : new Date()
	}, null, "TAG !='" + restoreTag + "'")
	var ret = new DAO("BRULES").execSimpleQuery("select * from BRULES where TAG !=?", [ restoreTag ]);
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
}
BRULES.contributeToContext = function(ctx, recType, event, order, rid) {
	var idx = recType.indexOf("*")
	while (idx >= 0) {
		recType = String(recType).replace("*", "%")
		idx = recType.indexOf("*")
	}
	var agency = "";
	var rules = BRULES.get(recType, event, agency);
	for ( var x in rules) {
		var rule = rules[x];

		if (rule.getOrder() <= order && rule.getID() != rid) {
			var actions = rule.getActions();
			for ( var x in actions) {
				var actiondata = actions[x]
				var action = actiondata.ACTION;
				if (action.hasReturn()) {
					try {
						action.contributeVariables(ctx, actiondata.PARAMS)

					} catch (e) {
						logDebug("WARN:" + e)
					}

				}

			}
		}
	}
}
BRULES.contributeDraftToContext = function(ctx, data) {
	var rule = new BRULES();
	rule.setField(BRULES.FIELDS.RDATA, data);

	var actions = rule.getActions();
	for ( var x in actions) {
		var actiondata = actions[x]
		var action = actiondata.ACTION;
		if (action.hasReturn()) {
			try {
				action.contributeVariables(ctx, actiondata.PARAMS)

			} catch (e) {
				logDebug("WARN:" + e)
			}

		}

	}

}
BRULES.get = function(capType, event, agency, scope) {
	var filter = {}
	var options = [];
	capType = capType + '';
	var arrType = capType.split("/");
	options.push("*/*/*/*");
	if (arrType[0] && arrType[0] != "*") {
		options.push(arrType[0] + "/*/*/*");
		if (arrType[1] && arrType[1] != "*") {
			options.push(arrType[0] + "/" + arrType[1] + "/*/*");
			if (arrType[2] && arrType[2] != "*") {
				options.push(arrType[0] + "/" + arrType[1] + "/" + arrType[2] + "/*");
				if (arrType[3] && arrType[3] != "*") {
					options.push(arrType[0] + "/" + arrType[1] + "/" + arrType[2] + "/" + arrType[3]);
				}
			}
		}
	}

	var arrRules = [];
	for ( var i in options) {
		var arr = BRULES.getByRecordTypeAndEvent(options[i], event, agency, scope);
		logDebug(options[i] + " has " + arr.length + " rules for Event " + event + " and agency " + agency)
		for ( var z in arr) {
			arrRules.push(arr[z])
		}
	}
	return arrRules;
}
BRULES.getByRecordTypeAndEvent = function(recordType, event, agency, scope) {
	var filter = {}
	var arr = recordType.split("/");
	for (var x = 0; x < 4; x++) {
		if (!arr[x]) {
			arr[x] = "*";
		}

	}
	filter[BRULES.FIELDS.REVENT] = event;
	filter[BRULES.FIELDS.RMODULE] = arr[0];
	filter[BRULES.FIELDS.RTYPE] = arr[1]
	filter[BRULES.FIELDS.RSUBTYPE] = arr[2]
	filter[BRULES.FIELDS.RCATEGORY] = arr[3];
	filter[BRULES.FIELDS.REC_STATUS] = "A";
	if (scope) {
		filter[BRULES.FIELDS.RSCOPE] = scope;
	}
	var agencyWhere = null;
	if (!agency) {
		agency = aa.getServiceProviderCode()
	}
	agencyWhere = " ID in (select PID from BRULES_AGENCY where RAGENCY ='" + agency + "')";
	var ret = new DAO("BRULES").execQuery(filter, "RORDER ASC", true, agencyWhere);
	var ar = [];
	for ( var x in ret) {
		var rule = new BRULES();
		rule.fields = ret[x];
		rule.id = ret[x].ID;
		ar.push(rule)
	}
	return ar;
}
BRULES.listAll = function(start, limit, objFilter, objSort) {
	var stime = new Date().getTime();

	var ret = BRULES.getAll(objFilter, objSort)
	var jrows = [];
	for (r in ret) {
		var row = ret[r];
		if (r >= start && jrows.length < limit) {
			jrows.push(row)

		}
		if (jrows.length > limit) {
			break;
		}
	}

	var etime = new Date().getTime();
	var time = (etime - stime) / 1000;
	var response = {};
	response["time"] = time;
	response["data"] = jrows;
	response["total"] = ret.length;
	aa.print(JSON.stringify(response, null, 2));
}
BRULES.getAll = function(objFilter, objSort) {

	var filter = {};
	var orderBy = null;

	var arrAgencies = [];
	if (objFilter && objFilter.length > 0) {
		for ( var x in objFilter) {
			var fi = objFilter[x];
			if (fi.property == "_AGENCIES") {
				arrAgencies = fi.value.split(",")

			} else if (fi.property == "_TODAY") {
				filter["REC_DATE"] = new Date()
			} else {
				filter[fi.property] = fi.value;
			}

		}
	}
	if (objSort && objSort.length > 0) {
		orderBy = objSort[0].property + " " + objSort[0].direction
	}

	var insql = "";
	var service = com.accela.aa.emse.dom.service.CachedService.getInstance().getServiceProviderService()
	if (arrAgencies.length == 0) {
		arrAgencies = service.getSubAgencies(aa.getServiceProviderCode(), aa.getAuditID()).toArray()
	}
	for ( var i in arrAgencies) {
		if (insql == "") {
			insql = "'" + arrAgencies[i] + "'"
		} else {
			insql += ",'" + arrAgencies[i] + "'"
		}
	}

	var agencyWhere = " ID in (select PID from BRULES_AGENCY where RAGENCY in(" + insql + "))"
	return new DAO("BRULES").execQuery(filter, orderBy, true, agencyWhere);

}

BRULES.refactorRules = function(recordtype, ofield, nfield, otask, ntask) {
	var logs = [];
	var rules = BRULES.get(recordtype, "%", aa.getServiceProviderCode());
	logs.push({
		"LEVEL" : "INFO",
		"MESSAGE" : String("Refactoring " + rules.length + " rules")
	})
	for ( var x in rules) {
		var rule = rules[x];
		try {

			var refactored = rule.refactor(ofield, nfield, otask, ntask);
			if (refactored) {
				logs.push({
					"LEVEL" : "INFO",
					"MESSAGE" : String(rule + " was refactored")
				})
			} else {
				logs.push({
					"LEVEL" : "WARN",
					"MESSAGE" : String(rule + " does not needs to be refactored")
				})
			}
		} catch (e) {
			logs.push({
				"LEVEL" : "ERROR",
				"MESSAGE" : String("ERROR refactoring " + rule + ": " + e)
			})
		}
	}
	logs.push({
		"LEVEL" : "INFO",
		"MESSAGE" : String("Refactoring complete")
	})
	return logs;
}
BRULES.prototype.refactor = function(ofield, nfield, otask, ntask) {
	var data = this.getStringField(BRULES.FIELDS.RDATA);
	var odata = data;
	var script = this.getStringField(BRULES.FIELDS.RSCRIPT);
	var oscript = script;
	if (ofield && nfield) {
		data = CTX.replaceVariable(data, "this.Record.ASI['", "']", ofield, nfield);
		data = CTX.replaceVariable(data, "this.Record.ASI[\"", "\"]", ofield, nfield);

		script = CTX.replaceVariable(script, "this.Record.ASI['", "']", ofield, nfield);
		script = CTX.replaceVariable(script, "this.Record.ASI[\"", "\"]", ofield, nfield);
	}
	if (otask && ntask) {
		data = CTX.replaceVariable(data, "this.Record.TASKS['", "']", otask, ntask);
		data = CTX.replaceVariable(data, "this.Record.TASKS[\"", "\"]", otask, ntask);

		script = CTX.replaceVariable(script, "this.Record.TASKS['", "']", otask, ntask);
		script = CTX.replaceVariable(script, "this.Record.TASKS[\"", "\"]", otask, ntask);

	}
	var changed = false;
	//	aa.print(odata)
	//	aa.print("------------")
	//	aa.print(data)
	//	aa.print("------------")
	//	aa.print(oscript)
	//	aa.print("------------")
	//	aa.print(script)
	if (oscript != script || odata != data) {
		this.updateFromData({
			VERSION_TYPE : "MIN",
			RDATA : data,
			RSCRIPT : script,
		}, false)
		changed = true;
	}
	return changed;

}
BRULES.listAllBackups = function(start, limit, objFilter, objSort) {

	var stime = new Date().getTime();
	var filter = {};
	var orderBy = null;

	var agencyWhere = "";
	if (objFilter && objFilter.length > 0) {
		for ( var x in objFilter) {
			var fi = objFilter[x];
			filter[fi.property] = fi.value;
		}
	}
	if (objSort && objSort.length > 0) {
		orderBy = objSort[0].property + " " + objSort[0].direction
	} else {
		orderBy = 'REC_DATE DESC';
	}
	filter['SERV_PROV_CODE'] = aa.getServiceProviderCode()
	filter['SCRIPT_CODE'] = 'BRE.BACKUP.%'
	start = parseInt(start, 10);
	limit = parseInt(limit, 10);

	var ret = new DAO("REVT_AGENCY_SCRIPT").execQuery(filter, orderBy, true);
	var jrows = [];
	for (r in ret) {
		var row = ret[r];
		if (r >= start && jrows.length < limit) {
			jrows.push(row)
		}
		if (jrows.length > limit) {
			break;
		}
	}

	var etime = new Date().getTime();
	var time = (etime - stime) / 1000;
	var response = {};
	response["time"] = time;
	response["data"] = jrows;
	response["total"] = ret.length;
	aa.print(JSON.stringify(response, null, 2));
}
BRULES.listAllHistory = function(start, limit, objFilter, objSort) {
	var stime = new Date().getTime();
	var filter = {};
	var orderBy = null;

	var agencyWhere = "";
	if (objFilter && objFilter.length > 0) {
		for ( var x in objFilter) {
			var fi = objFilter[x];
			filter[fi.property] = fi.value;
		}
	}
	if (objSort && objSort.length > 0) {
		orderBy = objSort[0].property + " " + objSort[0].direction
	}

	start = parseInt(start, 10);
	limit = parseInt(limit, 10);

	var ret = new DAO("BRULES_HISTORY").execQuery(filter, orderBy, true);
	var jrows = [];
	for (r in ret) {
		var row = ret[r];
		if (r >= start && jrows.length < limit) {
			jrows.push(row)
		}
		if (jrows.length > limit) {
			break;
		}
	}

	var etime = new Date().getTime();
	var time = (etime - stime) / 1000;
	var response = {};
	response["time"] = time;
	response["data"] = jrows;
	response["total"] = ret.length;
	aa.print(JSON.stringify(response, null, 2));
}