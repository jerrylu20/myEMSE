/*------------------------------------------------------------------------------------------------------/
| Program		: INCLUDE_CTX.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 28/11/2016 16:35:38
|
/------------------------------------------------------------------------------------------------------*/
if (typeof Record === "undefined") {
	eval(getScriptText("INCLUDE_RECORD"));
}
if (typeof BRULES === "undefined") {
	eval(getScriptText("INCLUDE_BRULES"));
}
if (typeof CTXLOGS === "undefined") {
	eval(getScriptText("INCLUDE_CTXLOGS"));
}

Date.prototype.format = function(format) {
	return aa.util.formatDate(this, format);
}
function CTX(record, event) {
	if (!record) {
		record = "this.recordAPI";
	}
	if (!event) {
		event = "this.eventName";
	}

	this.recordAPI = record;
	this.eventName = event;
}
CTX.LOGS = [];
CTX.prototype.log = function(level, message) {
	var RID = CTX.RULE != null ? CTX.RULE.getID() : "";
	if (!RID) {
		RID = CTX.RULEID;
	}
	if (!RID) {
		RID = "";
	}
	CTX.LOGS.push({
		RID : String(RID),
		LEVEL : String(level),
		MESSAGE : String(message)
	})
}
CTX.dumpLogs = function() {
	logDebug("CONTEXT EXECUTION LOG")
	logDebug("------------------------------------------------------")
	logDebug("LEVEL\tRID\tMESSAGE")
	for ( var x in CTX.LOGS) {
		var log = CTX.LOGS[x];
		logDebug(log.LEVEL + "\t" + log.RID + "\t" + log.MESSAGE)
	}
	logDebug("------------------------------------------------------")
}
CTX.prototype.cancel = function(message) {
	if (!message) {
		message = "Event Cancelled by action";
	}
	this.warn("cancel event was called with message:" + message);
	throw {
		cancel : true,
		message : message
	};
}
CTX.prototype.info = function(message) {
	this.log("INFO", message)
}
CTX.prototype.debug = function(message) {
	this.log("DEBUG", message)
}
CTX.prototype.warn = function(message) {
	this.log("WARN", message)
}
CTX.prototype.error = function(message) {
	this.log("ERROR", message)
}

CTX.executeRules = function(capId, event) {
	var runMode = Record.getLookupVal("BRULES_CONFIG", "RUNMODE");
	var rec = new Record(capId);
	if (runMode == "DB") {
		CTX.executeRulesByRecord(rec, event)
	} else {
		CTX.executeRulesFromScripts(rec, event)
	}

}
CTX.executeRulesFromScripts = function(rec, event) {
	aa.debug("CTX", "EXECUTING RULES for EVENT " + event)
	var startTime = new Date().getTime();

	var agency = aa.getServiceProviderCode();

	try {

		var context = CTX.buildFromRecord(rec, event);
		if (logDebug) {
			_SYSDEBUG = logDebug;
			logDebug = function(msg) {
				context.debug(msg)
			}
		}
		var prefix = Record.getLookupVal("EMSE_VARIABLE_BRANCH_PREFIX", event);
		prefix += ".BRE";
		context.info("context loaded successfully, MODE=SCRIPT");
		var appTypeArray = rec.getCapType().toString().split("/");
		context.runScript(prefix + ":*/*/*/*");
		context.runScript(prefix + ":" + appTypeArray[0] + "/*/*/*");
		context.runScript(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
		context.runScript(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
		context.runScript(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);

		context.info("context execution terminated")
		aa.debug("CTX", "DONE")
	} catch (e) {
		aa.debug("CTX", "ERROR:" + e)
		throw e;
	} finally {
		var endTime = new Date().getTime();
		var time = (endTime - startTime) / 1000

		CTX.LOGS.push({
			RID : "",
			LEVEL : (time > 5) ? String("WARN") : String("INFO"),
			MESSAGE : String("Execution took " + time + " seconds")
		})
		var LEVELS = {
			DEBUG : 1,
			INFO : 2,
			WARN : 3,
			ERROR : 4
		}
		var logLevel = Record.getLookupVal("BRULES_CONFIG", "LOGLEVEL")
		logLevel = LEVELS[logLevel];
		if (!logLevel) {
			logLevel = 1;
		}
		CTX.LOGS = CTX.LOGS.filter(function(entry) {
			return LEVELS[entry.LEVEL] >= logLevel;
		});

		var enableDB = Record.getLookupVal("BRULES_CONFIG", "ENABLE_DB_LOG");
		if (enableDB == "Yes") {
			CTXLOGS.createEntry(event, rec.getCapID(), time, CTX.LOGS)
		}
		var dumpLog = Record.getLookupVal("BRULES_CONFIG", "ENABLE_CONSOLE_LOG")
		if (dumpLog == "Yes") {
			CTX.dumpLogs();
		}
		if (logDebug) {
			logDebug = _SYSDEBUG;
		}
	}
}
CTX.prototype.isPublicUser = function() {
	return publicUser
}

CTX.prototype.executeAction = function(actionID, actionParams) {
	this.info("running action " + actionID);
	try {
		var action = BRA.getActionByID(actionID);

		var paramdef = action.getAllParams();
		var params = actionParams;
		for ( var paramName in params) {
			if (paramdef.config && paramdef.config[paramName] && paramdef.config[paramName].editor && paramdef.config[paramName].editor.xtype == "expfield") {
				params[paramName] = this.evaluate(params[paramName])
			}
		}
		var ret = action.run(this.recordAPI, params, this)
		if (action.hasReturn()) {
			this.info("running action completed with ret [" + ret + "]");
		} else {
			this.info("running action completed");
		}
	} catch (e) {

		if (actionParams.CANCELEVENT) {
			this.cancel(e);
		} else if (actionParams.STOPONERROR) {
			throw e;
		} else {
			this.warn("running action failed: " + action + ">>" + e);
		}

	}
}
CTX.executeRulesByRecord = function(rec, event, scope) {
	aa.debug("CTX", "EXECUTING RULES for EVENT " + event)
	var startTime = new Date().getTime();

	var agency = aa.getServiceProviderCode();
	var rules = BRULES.get(rec.getCapType(), event, agency, scope);
	if (rules.length > 0) {
		try {

			var context = CTX.buildFromRecord(rec, event);
			context.info("context loaded successfully, MODE=RULES")

			context.info("context found " + rules.length + " rules")
			for ( var x in rules) {
				CTX.run(rules[x], context)
			}
			context.info("context execution terminated")
			aa.debug("CTX", "DONE")
		} catch (e) {
			aa.debug("CTX", "ERROR:" + e)
			throw e;
		} finally {
			var endTime = new Date().getTime();
			var time = (endTime - startTime) / 1000

			CTX.LOGS.push({
				RID : "",
				LEVEL : (time > 5) ? String("WARN") : String("INFO"),
				MESSAGE : String("Execution took " + time + " seconds")
			})
			var LEVELS = {
				DEBUG : 1,
				INFO : 2,
				WARN : 3,
				ERROR : 4
			}
			var logLevel = Record.getLookupVal("BRULES_CONFIG", "LOGLEVEL")
			logLevel = LEVELS[logLevel];
			if (!logLevel) {
				logLevel = 1;
			}
			CTX.LOGS = CTX.LOGS.filter(function(entry) {
				return LEVELS[entry.LEVEL] >= logLevel;
			});

			var dumpLog = Record.getLookupVal("BRULES_CONFIG", "ENABLE_CONSOLE_LOG")
			if (dumpLog == "Yes") {
				CTX.dumpLogs();
			}
			var enableDB = Record.getLookupVal("BRULES_CONFIG", "ENABLE_DB_LOG");
			if (enableDB == "Yes") {
				CTXLOGS.createEntry(event, rec.getCapID(), time, CTX.LOGS)
			}

		}
	}
}
CTX.run = function(rule, context) {
	if (rule.canRunOnAgency(aa.getServiceProviderCode())) {

		var _SYSDEBUG;
		CTX.RULE = rule;
		if (logDebug) {
			_SYSDEBUG = logDebug;
			logDebug = function(msg) {
				context.debug(msg)
			}
		}
		var rstartTime = new Date().getTime();
		try {

			context.info("executing rule: " + rule);
			context.runJs(rule.getScript())
		} catch (e) {
			if (e.cancel) {
				var msg = e.message;
				msg = new java.lang.String(msg);
				msg = msg.replaceAll("\"", "|");
				msg = msg.replaceAll("'", "|");
				throw msg
			} else {
				context.error("Rule Execution failed: " + rule + ">>" + e);
			}
		} finally {
			var rendTime = new Date().getTime();
			var rtime = (rendTime - rstartTime) / 1000;
			context.info("rule: " + rule + " executed in " + rtime + " seconds")
			CTX.RULE = null;
			if (logDebug) {
				logDebug = _SYSDEBUG;
			}

		}
	} else {
		context.warn("rule: cannt be run on agency " + aa.getServiceProviderCode())
	}
}
CTX.executeRule = function(capId, ruleid) {
	var rec = new Record(capId);
	var rule = new BRULES(ruleid);
	var context = CTX.buildFromRecord(rec, rule.getEvent());
	context.info("context loaded successfully")

	CTX.run(rule, context)
	context.info("context execution terminated")
}

CTX.prototype.checkVariable = function(js, start, end, obj, warnings) {
	var jstmp = js;
	var idx = jstmp.indexOf(start);
	while (idx >= 0) {
		jstmp = jstmp.substring(idx + start.length)

		idxs = jstmp.indexOf(end)
		if (idxs < 0) {
			throw "Missing ]";
		}
		var field = jstmp.substring(0, idxs) + "";

		var prop = field.substring(1, field.length - 1) + ""

		if (!obj.hasOwnProperty(prop)) {
			warnings.push(start + field + end + " does not exist in " + this.Record.Type)
		}
		idx = jstmp.indexOf(start);
	}
}
CTX.replaceVariable = function(js, start, end, oldval, newval) {
	return js.split(start + oldval + end).join(start + newval + end)
}
CTX.prototype.checkVariables = function(js) {
	var warnings = [];
	logDebug("checking ASI")
	this.checkVariable(js, "this.Record.ASI[", "]", this.Record.ASI, warnings)
	logDebug("checking TASKS")
	this.checkVariable(js, "this.Record.TASKS[", "]", this.Record.TASKS, warnings)
	logDebug("checking complete " + warnings.length + " ERRORS")
	if (warnings.length > 0) {
		throw warnings.join("\n")
	}
}
CTX.prototype.runScript = function(script) {
	var js = getScriptText(script);
	if (js != "") {
		var _SYSDEBUG;
		CTX.RULE = null
		CTX.RULEID = null;

		var rstartTime = new Date().getTime();
		try {

			this.info("executing rule Script: " + script);
			this.runJs(js)
		} catch (e) {
			if (e.cancel) {
				var msg = e.message;
				msg = new java.lang.String(msg);
				msg = msg.replaceAll("\"", "|");
				msg = msg.replaceAll("'", "|");
				throw msg
			} else {
				this.error("Rule Execution failed: " + script + ">>" + e);
			}
		} finally {
			var rendTime = new Date().getTime();
			var rtime = (rendTime - rstartTime) / 1000;
			this.info("rule Script: " + script + " executed in " + rtime + " seconds")
			CTX.RULE = null;
			CTX.RULEID = null;

		}
	}

}
CTX.prototype.runJs = function(js) {
	eval(js)
}
CTX.prototype.evaluate = function(js) {
	this.checkVariables(js)
	logDebug("evaluating:" + js)
	var ret = eval("[" + js + "]")[0]
	logDebug("evaluation Result=" + ret)
	return ret;

}
CTX.prototype.tryEvaluateSolo = function(js) {
	try {
		js = this.evaluateSolo(js)
	} catch (e) {
		this.warn("using " + js + " as String")
	}
	return js
}
CTX.prototype.evaluateSolo = function(js) {
	logDebug("checking:[" + js + "]")
	this.checkVariables(js)
	logDebug("evaluating:" + js)
	eval("var ret =" + js)
	logDebug("evaluation Result=" + ret)
	return ret;

}
CTX.buildFromRecord = function(record, event) {

	var ctx = new CTX(record, event);
	ctx.Runtime = {}
	ctx.Math = {
		"+" : "+",
		"*" : "*",
		"/" : "/",
		"-" : "-",
		"parseInt" : "parseInt(x,10)",
		"parseFloat" : "parseFloat(x)",
		"abs" : "Math.abs(x)",
		"ceil" : "Math.ceil(x)",
		"floor" : "Math.floor(x)",
		"round" : "Math.round(x)",
		"random" : "Math.random()",
		"min" : "Math.min(x,y,z)",
		"max" : "Math.max(x,y,z)"
	};

	var user = aa.person.getCurrentUser().getOutput();

	ctx.User = {
		agency : aa.getServiceProviderCode(),
		firstName : user.getFirstName(),
		lastName : user.getLastName(),
		email : user.getEmail(),
		usercode : user.getUserID(),
		phone : user.getPhoneNumber()
	};
	ctx.Record = {};
	ctx.Record = {};
	var recType = record.getCapType().toString();
	ctx.Record.Type = record.getCapType();
	ctx.Record.CAPID = record.getCapID();
	ctx.Record.ALTID = record.getCustomID();
	ctx.Record.AppName = record.getApplicationName();
	var curTask = record.getCurrentWorkflowTask();
	ctx.Record.ActiveTask = "";
	if (curTask) {
		ctx.Record.ActiveTask = curTask.getTaskDescription()
	}

	ctx.Record.Balance = record.getBalance();
	var contacts = record.getContacts();
	if (contacts.length > 0) {
		var cts = Record.getStandardChoices("CONTACT TYPE");
		ctx.Record.Contacts = {};
		for ( var x in cts) {
			var contactType = cts[x].getBizdomainValue()
			for ( var x in contacts) {
				var contact = contacts[x];

				if (contact.getCapContactModel().getContactType() == contactType) {
					ctx.Record.Contacts[contactType] = {
						firstName : contact.getFirstName(),
						lastName : contact.getLastName(),
						email : contact.getEmail(),
						phone : contact.getPeople().getPhone1CountryCode() + contact.getPeople().getPhone1()
					};
					break;

				}
			}

		}
	}

	if (recType) {
		var splited = recType.split("/");
		if (splited.length == 4) {
			try {
				ctx.Record.ASI = {};
				var service = com.accela.aa.emse.dom.service.CachedService.getInstance().getAppSpecificInfoService();
				var capTypeService = com.accela.aa.emse.dom.service.CachedService.getInstance().getCapTypeService();
				var capList = new Array();

				var capModel = aa.cap.getCapModel().getOutput();
				var capType = capModel.getCapType();
				capType.setGroup(splited[0]);
				capType.setType(splited[1]);
				capType.setSubType(splited[2]);
				capType.setCategory(splited[3]);
				capType.setServiceProviderCode(aa.getServiceProviderCode())

				var res = capTypeService.getCapTypeByPK(capType)
				ctx.Record.ASI = record.getAllASI(false);

				//
				ctx.Record.TASKS = {};
				var strQry = "select SD_PRO_DES from SPROCESS P left join SPROCESS_GROUP G on G.R1_PROCESS_CODE=P.R1_PROCESS_CODE where G.SPROCESS_GROUP_CODE='"
						+ res.getProcessCode() + "' and P.REC_STATUS='A'";
				//var strQry = "select SD_PRO_DES from SPROCESS where R1_PROCESS_CODE='" + res.getProcessCode() + "' and REC_STATUS='A'";

				var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
				var result = dba.select(strQry, []);
				fields = result.toArray()

				var jsonArray = [];
				for ( var x in fields) {
					var field = fields[x];
					ctx.Record.TASKS[field[0]] = field[0]
				}
			} catch (e) {
				logDebug(e + "")
			}

		}

	}
	return ctx;

}
CTX.buildTree = function(recType, event, order, agency, rid) {
	if (!agency) {
		agency = aa.getServiceProviderCode();
	}
	var ctx = new CTX();
	var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
	ctx.Math = {
		"+" : "+",
		"*" : "*",
		"/" : "/",
		"-" : "-",
		"parseInt" : "parseInt(x,10)",
		"parseFloat" : "parseFloat(x)",
		"abs" : "Math.abs(x)",
		"ceil" : "Math.ceil(x)",
		"floor" : "Math.floor(x)",
		"round" : "Math.round(x)",
		"random" : "Math.random()",
		"min" : "Math.min(x,y,z)",
		"max" : "Math.max(x,y,z)"
	};
	ctx.User = {
		agency : "this.User.agency",
		firstName : "this.User.firstName",
		lastName : "this.User.lastName",
		email : "this.User.email",
		usercode : "this.User.usercode",
		phone : "this.Record.Applicant.phone"
	};
	ctx.Record = {};
	ctx.Record = {};
	ctx.Record.Type = "'" + recType + "'"
	ctx.Record.CAPID = "this.Record.CAPID";
	ctx.Record.ALTID = "this.Record.ALTID";
	ctx.Record.AppName = "this.Record.AppName";
	ctx.Record.ActiveTask = "this.Record.ActiveTask";
	ctx.Record.Balance = "this.Record.Balance";

	var cts = Record.getStandardChoices("CONTACT TYPE");
	ctx.Record.Contacts = {};
	for ( var x in cts) {
		var contactType = cts[x].getBizdomainValue()
		ctx.Record.Contacts[contactType] = {
			firstName : "this.Record.Contacts['" + contactType + "'].firstName",
			lastName : "this.Record.Contacts['" + contactType + "'].lastName",
			email : "this.Record.Contacts['" + contactType + "'].email",
			phone : "this.Record.Contacts['" + contactType + "'].phone",
		};

	}
	/*departments*/
	var strQry = "select  G3DPTTYP.R3_DEPTNAME from G3DPTTYP where SERV_PROV_CODE=?"

	var result = dba.select(strQry, [ agency ]);
	fields = result.toArray()
	ctx.Departments = {};
	var jsonArray = [];
	for ( var x in fields) {
		var field = fields[x];
		ctx.Departments[field[0]] = String("'" + field[0] + "'")
	}

	if (event) {
		var strQry = "SELECT p.MAPPED_ENV_NAME FROM REVT_EVENT_PARAM X, REVT_PARAM P WHERE X.EVENT_NAME = '" + event
				+ "'  AND X.PARAM_SEQ_NBR = P.PARAM_SEQ_NBR ORDER BY P.IN_OUT, P.MAPPED_ENV_NAME, P.PARAM_NAME";

		var result = dba.select(strQry, []);
		fields = result.toArray()
		ctx.Event = {};
		var jsonArray = [];
		for ( var x in fields) {
			var field = fields[x];
			ctx.Event[field[0]] = String("aa.env.getValue('" + field[0] + "')")
		}
	}
	if (recType) {
		var splited = recType.split("/");
		if (splited.length == 4) {
			try {
				ctx.Record.ASI = {};
				var service = com.accela.aa.emse.dom.service.CachedService.getInstance().getAppSpecificInfoService();
				var capTypeService = com.accela.aa.emse.dom.service.CachedService.getInstance().getCapTypeService();
				var capList = new Array();

				var capModel = aa.cap.getCapModel().getOutput();
				var capType = capModel.getCapType();
				capType.setGroup(splited[0]);
				capType.setType(splited[1]);
				capType.setSubType(splited[2]);
				capType.setCategory(splited[3]);
				capType.setServiceProviderCode(agency)

				var res = capTypeService.getCapTypeByPK(capType)

				var group = service.getRefAppSpecInfoWithFieldList(agency, res.getSpecInfoCode(), aa.getAuditID())
				var fields = group.getFieldList().toArray();

				for ( var x in fields) {
					var field = fields[x];
					ctx.Record.ASI[field.getFieldLabel()] = String("this.Record.ASI['" + field.getFieldLabel() + "']");
					if (field.getFieldType() == 5) {
						var dropDown = com.accela.aa.aamain.cap.BizCapUtil.getRefAppSpecDropDownListUseSharedDDList(agency, res.getSpecInfoCode(), fields[x].getCheckboxType(),
								fields[x].getCheckBoxGroup(), field.getFieldLabel(), "ADMIN");
						dropDown = dropDown.toArray()
						if (!ctx.Record.ASIChoices) {
							ctx.Record.ASIChoices = {};
						}
						ctx.Record.ASIChoices[field.getFieldLabel()] = {}
						for ( var u in dropDown) {
							ctx.Record.ASIChoices[field.getFieldLabel()][dropDown[u].getAttrValue()] = '"' + dropDown[u].getAttrValue() + '"'
						}

					}
				}

				//
				ctx.Record.TASKS = {};

				var strQry = "select SD_PRO_DES from SPROCESS P left join SPROCESS_GROUP G on G.R1_PROCESS_CODE=P.R1_PROCESS_CODE where G.SPROCESS_GROUP_CODE=? and P.REC_STATUS=?";

				var result = dba.select(strQry, [ res.getProcessCode(), 'A' ]);
				fields = result.toArray()

				var jsonArray = [];
				for ( var x in fields) {
					var field = fields[x];
					ctx.Record.TASKS[field[0]] = "this.Record.TASKS['" + field[0] + "']";
				}
				var sql = "select R3_ACT_TYPE_DES,R3_ACT_STAT_DES from R3STATYP S left join SPROCESS_GROUP G on G.R1_PROCESS_CODE=S.R3_PROCESS_CODE where S.SERV_PROV_CODE =? and G.SPROCESS_GROUP_CODE=? and S.REC_STATUS='A'"
				var result = dba.select(sql, [ agency, res.getProcessCode() ]);
				fields = result.toArray()
				ctx.Record.TaskStatus = {};
				for ( var x in fields) {
					var field = fields[x];
					var tname = field[0];
					var status = field[1];
					if (tname && status) {
						if (!ctx.Record.TaskStatus[tname]) {
							ctx.Record.TaskStatus[tname] = {}
						}
						ctx.Record.TaskStatus[tname][status] = String("'" + status + "'")
					}

				}

			} catch (e) {
				logDebug("ERROR:" + e + "")
			}

		}

	}
	ctx.Runtime = {}
	BRULES.contributeToContext(ctx, recType, event, order, rid)
	return ctx;
}
CTX.getPageFlowDetails = function(recType, agency) {
	var pageFlowObj = {};
	var capTypeService = com.accela.aa.emse.dom.service.CachedService.getInstance().getCapTypeService();
	var pageFlowConfigService = com.accela.aa.emse.dom.service.CachedService.getInstance().getPageFlowConfigService();
	var capModel = aa.cap.getCapModel().getOutput();
	var capType = capModel.getCapType();
	var splited = recType.split("/");
	capType.setGroup(splited[0]);
	capType.setType(splited[1]);
	capType.setSubType(splited[2]);
	capType.setCategory(splited[3]);
	capType.setServiceProviderCode(agency)

	var captypedetails = capTypeService.getCapTypeByPK(capType)

	var group = pageFlowConfigService.getPageFlowGroup(agency, captypedetails.getModuleName(), captypedetails.getSmartchoiceCode4ACA());
	var stepModelList = group.getStepList();

	var name = group.getPageFlowGrpCode();
	pageFlowObj.text = String(name);
	pageFlowObj.children = [];
	if (stepModelList != null) {

		for (var ix = 0; ix < stepModelList.size(); ix++) {
			var step = {};
			pageFlowObj.children.push(step);
			var stepModel = stepModelList.get(ix);
			step.text = String(stepModel.getStepName());
			step.children = [];
			var pagelist = stepModel.getPageList();

			for (var ip = 0; ip < pagelist.size(); ip++) {
				var page = {};
				step.children.push(page)
				var pageModel = pagelist.get(ip);
				page.text = String(pageModel.getPageName());
				page.children = [ {
					value : String(step.text + "/" + page.text + "/on Load"),
					text : "on Load",
					leaf : true
				}, {
					value : String(step.text + "/" + page.text + "/After Click"),
					text : "After Click",
					leaf : true
				}, {
					value : String(step.text + "/" + page.text + "/Before Click"),
					text : "Before Click",
					leaf : true
				} ];

				page.onLoadScript = String(pageModel.getOnloadEventName())
				page.onBeforeClick = String(pageModel.getBeforeClickEventName());
				page.onAfterClick = String(pageModel.getAfterClickEventName());

			}

		}
	}
	return pageFlowObj;
}
CTX.updatePageFlowEventScript = function(recType, agency, stepName, pageName, event, scriptName) {
	var pageFlowObj = {};
	var capTypeService = com.accela.aa.emse.dom.service.CachedService.getInstance().getCapTypeService();
	var pageFlowConfigService = com.accela.aa.emse.dom.service.CachedService.getInstance().getPageFlowConfigService();
	var capModel = aa.cap.getCapModel().getOutput();
	var capType = capModel.getCapType();
	var splited = recType.split("/");
	capType.setGroup(splited[0]);
	capType.setType(splited[1]);
	capType.setSubType(splited[2]);
	capType.setCategory(splited[3]);
	capType.setServiceProviderCode(agency)

	var captypedetails = capTypeService.getCapTypeByPK(capType)

	var group = pageFlowConfigService.getPageFlowGroup(agency, captypedetails.getModuleName(), captypedetails.getSmartchoiceCode4ACA());
	var stepModelList = group.getStepList();

	if (stepModelList != null) {

		for (var ix = 0; ix < stepModelList.size(); ix++) {

			var stepModel = stepModelList.get(ix);
			if (stepModel.getStepName() == stepName) {
				var pagelist = stepModel.getPageList();
				for (var ip = 0; ip < pagelist.size(); ip++) {
					var pageModel = pagelist.get(ip);

					if (pageModel.getPageName() == pageName) {
						if (event == "on Load") {
							pageModel.setOnloadEventName(scriptName)

						} else if (event == "After Click") {

							pageModel.setAfterClickEventName(scriptName);
						} else if (event == "Before Click") {
							pageModel.setBeforeClickEventName(scriptName);
						}
						var itemDaoClass = java.lang.Class.forName("com.accela.pa.configpageflow.PageFlowConfigDAO");
						var dao = com.accela.aa.util.ObjectFactory.getDAOObject(itemDaoClass)
						try {

							pageModel.setPageFlowGrpCode(group.getPageFlowGrpCode())
							dao.updateRpfPage(pageModel)
						} catch (e) {
							throw "UPDATE FAIL:" + e
						}
					}
				}
				break;
			}

		}
	}

}
CTX.createOrUpdateScript = function(agency, code, desc, js) {
	var emseservice = com.accela.aa.emse.dom.service.CachedService.getInstance().getEMSEService()
	var script = null;
	var create = false;
	code = code.toUpperCase()
	try {
		script = emseservice.getScriptByPK(agency, code, aa.getAuditID())
	} catch (e) {
		create = true;
		script = new com.accela.aa.emse.emse.ScriptModel();

		script.setScriptName(code);
		script.setSripteCode(code);
		script.setServiceProviderCode(agency);

		script.setAuditStatus('A');
	}
	script.setAuditID(aa.getAuditID());
	script.setAuditDate(new Date());
	script.setScriptText(js);
	script.setDescription(desc);

	if (create) {
		emseservice.createScript(script);
	} else {
		emseservice.editScript(script);
		emseservice.cleanScriptCache();
	}

}
CTX.deleteScript = function(agency, code) {

	code = code.toUpperCase()
	new DAO("REVT_AGENCY_SCRIPT").execDelete({
		"SERV_PROV_CODE" : agency,
		"SCRIPT_CODE" : code

	})
	var emseservice = com.accela.aa.emse.dom.service.CachedService.getInstance().getEMSEService()
	emseservice.cleanScriptCache();

}