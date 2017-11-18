/*------------------------------------------------------------------------------------------------------/
| Program		: EXT_ADMIN_HANDLEEVENTS.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 20/03/2017 11:46:16
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
eval(getScriptText("INCLUDE_HTTPAPI"));
eval(getScriptText("INCLUDE_DAO"));
eval(getScriptText("INCLUDE_CTX"));
//eval(getScriptText("INCLUDE_CTXLOGS"));
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
function getSessionID() {

	var dbName = "jetspeed";
	var strQry = "select TOP 1 SSO_SESSION_ID from accela.dbo.ESSO_SESSIONS where sso_session_status ='ACTIVE' and serv_prov_code='" + aa.getServiceProviderCode()
			+ "' and sso_user_name='" + aa.getAuditID() + "' "

	var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
	var result = dba.select(strQry, []);
	ret = result.toArray()
	var ssoid = "";
	if (ret.length > 0 && ret[0][0]) {
		ssoid = ret[0][0];
	} else {

		var bizInstance = aa.proxyInvoker.newInstance("com.accela.security.AuthenticationEJB").getOutput();
		var userSession = bizInstance.getUserSession('SSO0123456', 'AC360Agency', aa.getServiceProviderCode(), aa.getAuditID(), null);
		ssoid = userSession.getSessionId();
	}
	return ssoid;
}
function cmd_getSingleLog() {
	var id = getParam("ID");
	log = new CTXLOGS(id);
	aa.print(log.getStringField(CTXLOGS.FIELDS.EXECLOG))
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
	CTXLOGS.listAll(start, limit, objFilter, objSort, false);
}
function cmd_sql() {
	var root = {};
	var sql = getParam("sql");
	root.values = new DAO("").execSimpleQuery(sql, []);
	aa.print(JSON.stringify(root, null, 2))

}
function cmd_gauge() {
	var root = {};
	var sql = getParam("sql1");
	var sql2 = getParam("sql2");

	root.values = new DAO("").execSimpleQuery(sql, []);
	var rs = new DAO("").execSimpleQuery(sql2, []);
	root.values[0]["TOTAL"] = root.values[0]["TOTAL"] * 100 / rs[0]["TOTAL"]
	aa.print(JSON.stringify(root, null, 2))

}

function cmd_getCounters() {
	var root = {};
	var dao = new DAO();

	root.values = [];

	root.values.push(createCounter("select count(*)  TOTAL from BRULES_LOGS WHERE AGENCY=? ", [ aa.getServiceProviderCode() ], "Logs", '%', 1000000, 1500000));
	root.values.push(createCounter("select count(*)  TOTAL from BRULES_LOGS WHERE AGENCY=? AND EXECSTATUS = ?", [ aa.getServiceProviderCode(), "SUCCESS" ], "INFOs", "SUCCESS",
			1000000, 1500000));
	root.values.push(createCounter("select count(*)  TOTAL from BRULES_LOGS WHERE AGENCY=? AND EXECSTATUS = ?", [ aa.getServiceProviderCode(), "ERROR" ], "ERRORS", "ERROR", 1, 1))
	root.values.push(createCounter("select count(*)  TOTAL from BRULES_LOGS WHERE AGENCY=? AND EXECSTATUS = ?", [ aa.getServiceProviderCode(), "WARN" ], "WARNINGS", "WARN", 1,
			1000000))
	root.values.push(createCounter("select count(*)  TOTAL from BRULES where REC_STATUS = ? AND CONVERT(NVARCHAR(2000), [VALIDATION]) not in (?)", [ "A", "VALID" ],
			"INVALID RULES", "BRULES.filter_error", 0, 10))
	root.values.push(createCounter("select count(*)  TOTAL from BRULES where REC_STATUS != ?", [ "A" ], "Deleted RULES", "BRULES.tlb_recycle", 1, 1000000000))
	root.values.push(createCounter("select count(*)  TOTAL from BRULES where REC_STATUS = ?", [ "A" ], "Active RULES", "BRULES.", 1000000000, 1000000000))
	aa.print(JSON.stringify(root, null, 2))
}
function createCounter(sql, params, label, filter, orangeVal, redVal) {
	var c = new DAO().execSimpleQuery(sql, params)[0]["TOTAL"];
	c = parseFloat(c);
	var color = "green";
	if (c > orangeVal) {
		color = "orange"
	}
	if (c > redVal) {
		color = "red"
	}
	return {
		filter : filter,
		label : label,
		color : color,
		value : c
	}

}

function cmd_getServers() {
	try {
		var script = "try {";

		script += "var ret = {};";
		script += "var rt = java.lang.Runtime.getRuntime();";
		script += "ret.free = rt.freeMemory();";
		script += "ret.max = rt.maxMemory();";
		script += "ret.totalmemory = rt.totalMemory();";
		script += "ret.actualfree = ret.max - (ret.totalmemory - ret.free);";
		script += "ret.processors = rt.availableProcessors();";
		script += "ret.percentused = Math.round(((ret.totalmemory - ret.free) / ret.totalmemory) * 100);";
		script += "ret.percentusedmax = Math.round(((ret.max - ret.actualfree) / ret.max) * 100);";

		script += "var roots = java.io.File.listRoots();";

		script += "ret.drives = [];";
		script += "for (x in roots) {";
		script += "var driver = roots[x];";
		script += "var drive = {};";
		script += "drive.name = String(driver.getPath());";
		script += "drive.freespace = driver.getFreeSpace();";
		script += "drive.totalspace = driver.getTotalSpace();";
		script += "drive.percentused = Math.round(((drive.totalspace - drive.freespace) / drive.totalspace) * 100);";
		script += "if(driver.getTotalSpace()>0){ret.drives.push(drive);}";
		script += "}";
		script += "aa.print(JSON.stringify(ret, null, 2));";
		script += "} catch (e) {";
		script += "aa.print('ERROR:'+e)";
		script += "}";

		var AVProperties = com.accela.util.AVProperties;
		var servers = {};
		var bizUrl = AVProperties.getProperty("av.biz.url");

		var bizurls = AVProperties.getProperty("av.clearcache.url");
		if (bizurls == null) {
			bizurls = "";
		}
		bizurls = bizUrl + "," + bizurls;
		var urls = bizurls.split(",");

		for ( var i in urls) {
			var url = urls[i]

			if (url.trim() != "") {
				try {
					var u = new java.net.URL(url);
					bu = u.getProtocol() + "://" + u.getHost() + ":" + u.getPort() + "/";
					servers[u.getHost()] = bu;
				} catch (e) {

				}
			}
		}

		var token = getSessionID();
		for ( var server in servers) {
			var url = servers[server] + "apis/v4/scripts/EXEC_SCRIPT?token=" + token;
			var body = {};
			body.SCRIPT_TEXT = script;

			var ret = HTTPAPI.send("POST", url, JSON.stringify(body, null, 2), {
				"Content-type" : "application/json"
			})
			var resObj = eval("[" + ret.response + "]")[0];
			servers[server] = eval("[" + resObj.result.SCRIPT_RESULT + "]")[0]
		}
		aa.print(JSON.stringify(servers, null, 2))
	} catch (e) {
		aa.print("ERROR:" + e)
	}
}